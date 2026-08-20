import process from 'node:process';
import readline from 'node:readline';

export function startRepl(state) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: '> ',
  });
  rl.prompt();

  rl.on('line', (input) => {
    const command = input.trim();

    if (!command) {
      rl.prompt();
      return;
    }

    switch (command) {
      case 'todo':
        console.log(`In Progress...`);
        break;
      case '.exit':
        rl.close();
        break;
      default:
        console.log('Invalid input');
    }
    rl.prompt();
  });

  rl.on('SIGINT', () => rl.close());

  rl.on('close', () => {
    console.log('Thank you for using Data Processing CLI!');
    process.exit(0);
  });
}
