import process from 'node:process';
import readline from 'node:readline';
import { cdCommand, lsCommand, upCommand } from './navigation.js';
import { argParser } from './utils/argParser.js';

export function startRepl(state) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: '> ',
  });
  rl.prompt();

  rl.on('line', async (input) => {
    const { command, args, flags } = argParser(input);

    if (!command) {
      rl.prompt();
      return;
    }

    try {
      switch (command) {
        case 'up':
          state.currentDir = upCommand(state.currentDir);
          break;
        case 'cd':
          state.currentDir = await cdCommand(state.currentDir, args[0]);
          break;
        case 'ls':
          console.log(await lsCommand(state.currentDir));
          break;
        case '.exit':
          rl.close();
          return;
        default:
          console.log('Invalid input');
          rl.prompt();
          return;
      }

      console.log(`You are currently in ${state.currentDir}`);
    } catch (e) {
      console.log(`Operation failed. ${e}`);
    }

    rl.prompt();
  });

  rl.on('SIGINT', () => rl.close());

  rl.on('close', () => {
    console.log('Thank you for using Data Processing CLI!');
    process.exit(0);
  });
}
