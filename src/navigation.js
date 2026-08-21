import fs from 'node:fs/promises';
import { pathResolver } from './utils/pathResolver.js';

export function upCommand(currDir) {
  if (!currDir) {
    throw new Error('The current directory has not been specified');
  }

  return pathResolver(currDir, '..');
}

export async function cdCommand(currDir, pathTo) {
  if (!currDir) {
    throw new Error('The current directory has not been specified');
  }
  if (!pathTo) {
    throw new Error('The ‘path-to-directory’ argument has not been provided');
  }

  const resolvedPath = pathResolver(currDir, pathTo);

  let stats;
  try {
    stats = await fs.stat(resolvedPath);
  } catch {
    throw new Error('The path is incorrect');
  }

  if (stats.isFile()) {
    throw new Error('A path cannot be a file');
  }

  return resolvedPath;
}

export async function lsCommand(currDir) {
  if (!currDir) {
    throw new Error('The current directory has not been specified');
  }

  const files = [];
  const directories = [];

  const dirents = await fs.readdir(currDir, {
    withFileTypes: true,
  });

  for (const dirent of dirents) {
    if (dirent.isFile()) {
      files.push(dirent.name);
    } else {
      directories.push(dirent.name);
    }
  }

  const maxLength = Math.max(
    0,
    ...files.map((el) => el.length),
    ...directories.map((el) => el.length),
  );
  const columnWidth = maxLength + 4;

  const sortedFiles = files
    .sort((a, b) => a.localeCompare(b))
    .map((el) => el.padEnd(columnWidth) + '[file]');
  const sortedDirectories = directories
    .sort((a, b) => a.localeCompare(b))
    .map((el) => el.padEnd(columnWidth) + '[folder]');

  const ls = [...sortedDirectories, ...sortedFiles].join('\n');
  return ls;
}
