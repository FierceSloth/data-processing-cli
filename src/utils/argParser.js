export function argParser(rawCommand) {
  const [command, ...tokens] = rawCommand.split(' ').filter(Boolean);

  const parsedArgs = {
    command: command,
    args: [],
    flags: {},
  };

  for (let i = 0; i < tokens.length; i += 1) {
    const currToken = tokens[i];
    const nextToken = tokens[i + 1];

    if (currToken?.startsWith('--')) {
      if (!nextToken?.startsWith('--') && nextToken) {
        parsedArgs.flags[currToken.slice(2)] = nextToken;
        i += 1;
      } else {
        parsedArgs.flags[currToken.slice(2)] = true;
      }
    } else {
      parsedArgs.args.push(currToken);
    }
  }

  return parsedArgs;
}
