import { runVerifyCli } from './verify-my-projects-projection-storage-core.js';

const invokedDirectly =
  typeof process !== 'undefined' &&
  Array.isArray(process.argv) &&
  process.argv[1] !== undefined &&
  process.argv[1].endsWith('verify-my-projects-projection-storage.ts');

if (invokedDirectly) {
  runVerifyCli().catch((err) => {
    console.error(err instanceof Error ? err.message : String(err));
    process.exit(1);
  });
}
