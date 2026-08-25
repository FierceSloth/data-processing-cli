import { createReadStream, createWriteStream } from 'node:fs';
import fs from 'node:fs/promises';
import { pipeline } from 'node:stream/promises';
import { pathResolver } from '../utils/pathResolver.js';

export async function fileTransformer(currDir, input, output, transformer) {
  if (!currDir) {
    throw new Error('The current directory has not been specified');
  }
  if (!input) {
    throw new Error('The ‘input’ argument has not been provided');
  }
  if (!output) {
    throw new Error('The ’output’ argument has not been provided');
  }

  const inputPath = pathResolver(currDir, input);
  const outputPath = pathResolver(currDir, output);

  try {
    await fs.access(inputPath);
  } catch {
    throw new Error('The path is incorrect');
  }

  const readStream = createReadStream(inputPath);
  const writeStream = createWriteStream(outputPath);

  await pipeline(readStream, transformer, writeStream);
}
