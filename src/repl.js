import process from 'node:process';
import readline from 'node:readline';
import { countCommand } from './commands/count.js';
import { hashCommand } from './commands/hash.js';
import { cdCommand, lsCommand, upCommand } from './navigation.js';
import { argParser } from './utils/argParser.js';
import { hashCompareCommand } from './commands/hashCompare.js';

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
      const { input, algorithm, hash, save } = flags;

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
        case 'count':
          console.log(await countCommand(state.currentDir, input));
          break;
        case 'hash':
          console.log(
            await hashCommand(state.currentDir, input, algorithm, save),
          );
          break;
        case 'hash-compare':
          console.log(
            await hashCompareCommand(state.currentDir, input, hash, algorithm),
          );
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
