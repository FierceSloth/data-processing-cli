import fs from 'node:fs';
import readline from 'node:readline';
import { pathResolver } from '../utils/pathResolver.js';

export async function countCommand(currDir, input) {
  if (!currDir) {
    throw new Error('The current directory has not been specified');
  }
  if (!input) {
    throw new Error('The ‘input’ argument has not been provided');
  }

  const filePath = pathResolver(currDir, input);

  const stream = fs.createReadStream(filePath, { encoding: 'utf8' });
  const lines = readline.createInterface({
    input: stream,
    crlfDelay: Infinity,
  });

  const state = {
    lines: 0,
    words: 0,
    characters: 0,
  };

  stream.on('data', (chunk) => (state.characters += chunk.length));

  try {
    for await (const line of lines) {
      state.lines += 1;

      const words = line.split(/\s+/).filter(Boolean);
      state.words += words.length;
    }
  } catch {
    throw new Error('The path is incorrect');
  }

  const result = `Lines: ${state.lines}
Words: ${state.words}
Characters: ${state.characters}`;

  return result;
}
