import crypto from 'node:crypto';
import { createReadStream } from 'node:fs';
import { pipeline } from 'node:stream/promises';

export async function calculateFileHash(filePath, algorithm = 'sha256') {
  const hash = crypto.createHash(algorithm);

  const stream = createReadStream(filePath);
  await pipeline(stream, hash);
  const digest = hash.digest('hex');

  return digest;
}
