import { fileTransformer } from '../utils/fileTransformer.js';

async function* jsonToCsvTransformer(source) {
  let content = '';
  for await (const chunk of source) {
    content += chunk.toString();
  }

  const data = JSON.parse(content);
  if (!Array.isArray(data)) {
    throw new Error('Input must be a JSON array');
  }

  const headers = Object.keys(data[0] || {});
  yield headers.join(',') + '\n';

  for (const item of data) {
    const row = headers.map((key) => item[key]).join(',');
    yield row + '\n';
  }
}

export async function jsonToCsvCommand(currDir, input, output) {
  await fileTransformer(currDir, input, output, jsonToCsvTransformer);
}
