import path from 'node:path';

export function pathResolver(from, to) {
  if (!from || !to) {
    throw new Error('Incorrect path');
  }

  return path.resolve(from, to);
}
