import crypto from 'node:crypto';
import { fileTransformer } from '../utils/fileTransformer.js';

export async function encryptCommand(currDir, input, output, password) {
  if (!password) {
    throw new Error('The ‘password’ argument has not been provided');
  }

  async function* encryptTransformer(source) {
    const salt = crypto.randomBytes(16);
    const iv = crypto.randomBytes(12);
    const key = crypto.scryptSync(password, salt, 32);

    const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);

    yield salt;
    yield iv;

    for await (const chunk of source) {
      const encryptedChunk = cipher.update(chunk);
      if (encryptedChunk.length) {
        yield encryptedChunk;
      }
    }

    const finalChunk = cipher.final();
    if (finalChunk.length) {
      yield finalChunk;
    }

    const authTag = cipher.getAuthTag();
    yield authTag;
  }
  await fileTransformer(currDir, input, output, encryptTransformer);
}
