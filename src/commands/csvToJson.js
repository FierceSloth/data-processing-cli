import readline from 'node:readline/promises';
import { fileTransformer } from '../utils/fileTransformer.js';

async function* csvToJsonTransformer(source) {
  yield '[\n';

  let headers = null;
  let isFirstRecord = true;

  const lines = readline.createInterface({
    input: source,
    crlfDelay: Infinity,
  });

  for await (const line of lines) {
    if (!line.trim()) continue;
    const arrayLine = line.split(',');

    if (!headers) {
      headers = arrayLine;
      continue;
    }

    const obj = {};
    arrayLine.forEach((value, index) => (obj[`${headers[index]}`] = value));

    let separator = ',\n';
    if (isFirstRecord) {
      separator = '';
      isFirstRecord = false;
    }

    yield separator + JSON.stringify(obj);
  }

  yield '\n]';
}

export async function csvToJsonCommand(currDir, input, output) {
  await fileTransformer(currDir, input, output, csvToJsonTransformer);
}
