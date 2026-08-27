import process from 'node:process';
import readline from 'node:readline';
import { countCommand } from './commands/count.js';
import { csvToJsonCommand } from './commands/csvToJson.js';
import { decryptCommand } from './commands/decrypt.js';
import { encryptCommand } from './commands/encrypt.js';
import { hashCommand } from './commands/hash.js';
import { hashCompareCommand } from './commands/hashCompare.js';
import { jsonToCsvCommand } from './commands/jsonToCsv.js';
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
      const { input, output, algorithm, hash, save, password } = flags;
      const { currentDir } = state;

      switch (command) {
        case 'up':
          state.currentDir = upCommand(currentDir);
          break;
        case 'cd':
          state.currentDir = await cdCommand(currentDir, args[0]);
          break;
        case 'ls':
          console.log(await lsCommand(currentDir));
          break;
        case 'count':
          console.log(await countCommand(currentDir, input));
          break;
        case 'hash':
          console.log(await hashCommand(currentDir, input, algorithm, save));
          break;
        case 'hash-compare':
          console.log(
            await hashCompareCommand(currentDir, input, hash, algorithm),
          );
          break;
        case 'csv-to-json':
          await csvToJsonCommand(currentDir, input, output);
          break;
        case 'json-to-csv':
          await jsonToCsvCommand(currentDir, input, output);
          break;
        case 'encrypt':
          await encryptCommand(currentDir, input, output, password);
          break;
        case 'decrypt':
          await decryptCommand(currentDir, input, output, password);
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
