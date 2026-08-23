import fs from 'node:fs/promises';
import { calculateFileHash } from '../utils/calculateFileHash.js';
import { pathResolver } from '../utils/pathResolver.js';

export async function hashCommand(
  currDir,
  input,
  algorithm = 'sha256',
  save = false,
) {
  if (!currDir) {
    throw new Error('The current directory has not been specified');
  }
  if (!input) {
    throw new Error('The ‘input’ argument has not been provided');
  }
  if (algorithm !== 'sha256' && algorithm !== 'md5' && algorithm !== 'sha512') {
    throw new Error('Incorrect algorithm type');
  }

  const filePath = pathResolver(currDir, input);
  const digest = await calculateFileHash(filePath, algorithm);

  if (save) {
    const hashPath = `${filePath}.${algorithm}`;
    await fs.writeFile(hashPath, digest);
  }

  return `${algorithm}: ${digest}`;
}
