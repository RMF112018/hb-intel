import { startRunnerServer } from './server.js';

async function main(): Promise<void> {
  const server = await startRunnerServer();
  const address = server.address();
  if (address && typeof address === 'object') {
    process.stdout.write(`PnP local runner listening at https://${address.address}:${address.port}\n`);
  } else {
    process.stdout.write('PnP local runner started.\n');
  }

  const shutdown = (): void => {
    server.close(() => {
      process.exit(0);
    });
  };

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}

main().catch((error) => {
  process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
  process.exit(1);
});
