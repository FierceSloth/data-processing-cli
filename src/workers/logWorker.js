import { createReadStream } from 'node:fs';
import readline from 'node:readline';
import { parentPort, workerData } from 'node:worker_threads';
import { addToStatFabric } from '../utils/addToStat.js';

const stats = {
  total: 0,
  levels: {},
  status: {},
  paths: {},
  responseTimeSum: 0,
};
const addToStat = addToStatFabric(stats);

const { filePath, start, end } = workerData;

const stream = createReadStream(filePath, { start, end });
const lines = readline.createInterface({
  input: stream,
  crlfDelay: Infinity,
});

for await (let line of lines) {
  if (!line.trim()) continue;

  const [
    _isoTimestamp,
    level,
    _service,
    statusCode,
    responseTimeMs,
    _method,
    path,
  ] = line.split(' ');

  const statusType = Math.floor(statusCode / 100) + 'xx';
  addToStat('total');
  addToStat('levels', level);
  addToStat('status', statusType);
  addToStat('paths', path);
  addToStat('responseTimeSum', undefined, Number(responseTimeMs));
}

parentPort.postMessage(stats);
