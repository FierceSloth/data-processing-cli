import crypto from 'node:crypto';
import { createReadStream, createWriteStream } from 'node:fs';
import fs from 'node:fs/promises';
import { pipeline } from 'node:stream/promises';
import { pathResolver } from '../utils/pathResolver.js';

async function readEncryptionMetadata(inputPath) {
  const handle = await fs.open(inputPath, 'r');

  try {
    const stats = await handle.stat();

    if (stats.size < 44) {
      throw new Error('The file is too small for the encrypted data');
    }

    const headerBuffer = Buffer.alloc(28);
    await handle.read(headerBuffer, 0, 28, 0);

    const salt = headerBuffer.subarray(0, 16);
    const iv = headerBuffer.subarray(16, 28);

    const authTag = Buffer.alloc(16);
    await handle.read(authTag, 0, 16, stats.size - 16);

    return { salt, iv, authTag, fileSize: stats.size };
  } finally {
    await handle.close();
  }
}

export async function decryptCommand(currDir, input, output, password) {
  if (!currDir) {
    throw new Error('The current directory has not been specified');
  }
  if (!input) {
    throw new Error('The ‘input’ argument has not been provided');
  }
  if (!output) {
    throw new Error('The ’output’ argument has not been provided');
  }
  if (!password) {
    throw new Error('The ‘password’ argument has not been provided');
  }

  const inputPath = pathResolver(currDir, input);
  const outputPath = pathResolver(currDir, output);

  const { salt, iv, authTag, fileSize } =
    await readEncryptionMetadata(inputPath);
  const key = crypto.scryptSync(password, salt, 32);

  const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
  decipher.setAuthTag(authTag);

  try {
    await pipeline(
      createReadStream(inputPath, { start: 28, end: fileSize - 17 }),
      decipher,
      createWriteStream(outputPath),
    );
  } catch {
    throw new Error('Incorrect password');
  }
}
