#!/usr/bin/env node
/**
 * @design SF18-T09
 * CI-friendly Storybook validation for estimating bid-readiness surfaces.
 */
import { spawn } from 'node:child_process';
import { setTimeout as delay } from 'node:timers/promises';

const HOST = '127.0.0.1';
const PORT = 6010;
const BASE_URL = `http://${HOST}:${PORT}`;

/**
 * @param {string} command
 * @param {string[]} args
 * @returns {Promise<void>}
 */
function run(command, args) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, { stdio: 'inherit', shell: false });
    child.on('exit', (code) => {
      if (code === 0) {
        resolve();
        return;
      }
      reject(new Error(`${command} ${args.join(' ')} exited with ${code ?? 'unknown code'}`));
    });
    child.on('error', reject);
  });
}

/**
 * @returns {Promise<void>}
 */
async function waitForServer() {
  for (let attempt = 0; attempt < 60; attempt += 1) {
    try {
      const response = await fetch(BASE_URL);
      if (response.ok) {
        return;
      }
    } catch {
      // Wait for server startup.
    }
    await delay(1000);
  }
  throw new Error(`Timed out waiting for Storybook server at ${BASE_URL}`);
}

await run('pnpm', ['build-storybook']);

const server = spawn('python3', ['-m', 'http.server', String(PORT), '--bind', HOST, '--directory', 'storybook-static'], {
  stdio: 'inherit',
  shell: false,
});

try {
  await waitForServer();
  await run('pnpm', ['test-storybook', '--url', BASE_URL]);
} finally {
  server.kill('SIGTERM');
}
