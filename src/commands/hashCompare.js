import fs from 'node:fs/promises';
import { calculateFileHash } from '../utils/calculateFileHash.js';
import { pathResolver } from '../utils/pathResolver.js';

export async function hashCompareCommand(
  currDir,
  input,
  hash,
  algorithm = 'sha256',
) {
  if (!currDir) {
    throw new Error('The current directory has not been specified');
  }
  if (!input) {
    throw new Error('The ‘input’ argument has not been provided');
  }
  if (!hash) {
    throw new Error('The hash’ argument has not been provided');
  }
  if (algorithm !== 'sha256' && algorithm !== 'md5' && algorithm !== 'sha512') {
    throw new Error('Incorrect algorithm type');
  }

  const actualFilePath = pathResolver(currDir, input);
  const actualHash = await calculateFileHash(actualFilePath, algorithm);

  const expectedFilePath = pathResolver(currDir, hash);
  const expectedHash = await fs
    .readFile(expectedFilePath, 'utf-8')
    .trim()
    .toLowerCase();

  return expectedHash === actualHash ? 'OK' : 'MISMATCH';
}
