import fs from 'node:fs/promises';
import os from 'node:os';
import { Worker } from 'node:worker_threads';
import { addToStatFabric } from '../utils/addToStat.js';
import { pathResolver } from '../utils/pathResolver.js';

const numWorkers = os.cpus().length;

function runWorker(workerData) {
  return new Promise((resolve, reject) => {
    const worker = new Worker(
      new URL('../workers/logWorker.js', import.meta.url),
      {
        workerData,
      },
    );

    worker.on('message', (partialStat) => {
      resolve(partialStat);
    });

    worker.on('error', reject);
  });
}

export async function logCommand(currDir, input, output) {
  if (!currDir) {
    throw new Error('The current directory has not been specified');
  }
  if (!input) {
    throw new Error('The ‘input’ argument has not been provided');
  }
  if (!output) {
    throw new Error('The ’output’ argument has not been provided');
  }

  const chunks = [];

  const inputPath = pathResolver(currDir, input);
  const outputPath = pathResolver(currDir, output);

  const fileSize = (await fs.stat(inputPath)).size;
  const chunkSize = Math.floor(fileSize / numWorkers);

  let targetPos = 0;

  for (let i = 0; i < numWorkers; i += 1) {
    const fileHandle = await fs.open(inputPath, 'r');
    const start = targetPos;
    let end;

    if (i === numWorkers - 1) {
      end = fileSize - 1;
    } else {
      const presumedEnd = start + chunkSize;
      const buffer = Buffer.alloc(1024);
      await fileHandle.read(buffer, 0, 1024, presumedEnd);

      const newlineOffset = buffer.indexOf('\n');
      end = presumedEnd + newlineOffset;
      targetPos = end + 1;
    }

    chunks.push({ filePath: inputPath, start, end });
    await fileHandle.close();
  }

  const workerPromises = chunks.map((workerData) => runWorker(workerData));

  const partialStats = await Promise.all(workerPromises);
  const stat = {
    total: 0,
    levels: {},
    status: {},
    topPaths: {},
    avgResponseTimeMs: 0,
  };
  const addToStat = addToStatFabric(stat);
  let totalResponseTimeSum = 0;

  partialStats.forEach(({ total, levels, status, paths, responseTimeSum }) => {
    addToStat('total', undefined, total);

    for (const [lvl, count] of Object.entries(levels)) {
      addToStat('levels', lvl, count);
    }

    for (const [st, count] of Object.entries(status)) {
      addToStat('status', st, count);
    }

    for (const [p, count] of Object.entries(paths)) {
      addToStat('topPaths', p, count);
    }

    totalResponseTimeSum += responseTimeSum;
  });

  stat.avgResponseTimeMs =
    stat.total > 0 ? Number((totalResponseTimeSum / stat.total).toFixed(2)) : 0;
  stat.topPaths = Object.entries(stat.topPaths)
    .map(([path, count]) => ({ path, count }))
    .sort((a, b) => b.count - a.count);

  await fs.writeFile(outputPath, JSON.stringify(stat));
}
