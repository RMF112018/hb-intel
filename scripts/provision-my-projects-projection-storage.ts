import { runProvisionCli } from './provision-my-projects-projection-storage-core.js';

const invokedDirectly =
  typeof process !== 'undefined' &&
  Array.isArray(process.argv) &&
  process.argv[1] !== undefined &&
  process.argv[1].endsWith('provision-my-projects-projection-storage.ts');

if (invokedDirectly) {
  runProvisionCli('provision-my-projects-projection-storage').catch((err) => {
    console.error(err instanceof Error ? err.message : String(err));
    process.exit(1);
  });
}
