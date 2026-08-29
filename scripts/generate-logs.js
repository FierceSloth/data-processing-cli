import fs from 'node:fs';
import path from 'node:path';

// Parse command line arguments
const args = process.argv.slice(2);
let output = 'logs.txt';
let linesCount = 10000;

for (let i = 0; i < args.length; i++) {
  if (args[i] === '--output' && args[i + 1]) {
    output = args[i + 1];
    i++;
  } else if (args[i] === '--lines' && args[i + 1]) {
    linesCount = parseInt(args[i + 1], 10) || linesCount;
    i++;
  }
}

const levels = ['INFO', 'INFO', 'INFO', 'WARN', 'ERROR'];
const services = ['user-service', 'auth-service', 'order-service', 'payment-service', 'notification-service'];
const statusCodes = [200, 200, 200, 201, 204, 301, 400, 401, 403, 404, 500, 502, 503];
const methods = ['GET', 'GET', 'POST', 'PUT', 'DELETE'];
const paths = [
  '/api/users',
  '/api/users/profile',
  '/api/orders',
  '/api/orders/checkout',
  '/api/products',
  '/api/auth/login',
  '/api/auth/logout',
  '/api/payment/charge'
];

const writeStream = fs.createWriteStream(path.resolve(process.cwd(), output), { encoding: 'utf8' });

console.log(`Generating ${linesCount} log lines to ${output}...`);

const startTime = Date.now();
const baseTimestamp = Date.now() - linesCount * 100;

let currentLine = 0;

function write() {
  let ok = true;
  while (currentLine < linesCount && ok) {
    const timestamp = new Date(baseTimestamp + currentLine * 100).toISOString();
    const level = levels[Math.floor(Math.random() * levels.length)];
    const service = services[Math.floor(Math.random() * services.length)];
    const statusCode = statusCodes[Math.floor(Math.random() * statusCodes.length)];
    const responseTimeMs = Math.floor(Math.random() * 450) + 10;
    const method = methods[Math.floor(Math.random() * methods.length)];
    const reqPath = paths[Math.floor(Math.random() * paths.length)];

    const logLine = `${timestamp} ${level} ${service} ${statusCode} ${responseTimeMs} ${method} ${reqPath}\n`;
    
    currentLine++;
    if (currentLine === linesCount) {
      writeStream.write(logLine, () => {
        writeStream.end();
        console.log(`Done in ${((Date.now() - startTime) / 1000).toFixed(2)}s!`);
      });
    } else {
      ok = writeStream.write(logLine);
    }
  }

  if (currentLine < linesCount) {
    writeStream.once('drain', write);
  }
}

write();
