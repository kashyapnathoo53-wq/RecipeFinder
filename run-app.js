import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('\n🥘 Starting Recipe Finder Full-Stack Application...\n');

// Start backend server
const serverProcess = spawn('npm', ['run', 'start'], {
  cwd: path.join(__dirname, 'server'),
  shell: true,
  stdio: 'pipe',
  env: { ...process.env, PORT: '5000' }
});

serverProcess.stdout.on('data', (data) => {
  process.stdout.write(`\x1b[36m[SERVER]\x1b[0m ${data}`);
});

serverProcess.stderr.on('data', (data) => {
  process.stderr.write(`\x1b[31m[SERVER-ERR]\x1b[0m ${data}`);
});

// Start React client
const clientProcess = spawn('npm', ['run', 'start'], {
  cwd: path.join(__dirname, 'client'),
  shell: true,
  stdio: 'pipe',
  env: { ...process.env, BROWSER: 'none', PORT: '3000' }
});

clientProcess.stdout.on('data', (data) => {
  process.stdout.write(`\x1b[32m[CLIENT]\x1b[0m ${data}`);
});

clientProcess.stderr.on('data', (data) => {
  process.stderr.write(`\x1b[33m[CLIENT-LOG]\x1b[0m ${data}`);
});

const cleanup = () => {
  console.log('\n🛑 Shutting down server and client processes...');
  try {
    if (serverProcess.pid) process.kill(serverProcess.pid);
  } catch (e) {}
  try {
    if (clientProcess.pid) process.kill(clientProcess.pid);
  } catch (e) {}
  process.exit(0);
};

process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);
process.on('exit', cleanup);
