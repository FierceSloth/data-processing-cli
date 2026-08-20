import os from 'node:os';
import { startRepl } from './repl.js';

const state = {
  currentDir: os.homedir(),
};

console.log(`Welcome to Data Processing CLI!
You are currently in ${state.currentDir}`);

startRepl(state);
