#!/usr/bin/env npx tsx
/**
 * Filtered suite runner — runs a single named suite.
 *
 * Usage:
 *   npx tsx scripts/testing/people-kudos/runSuite.ts --suite kudos --dry-run
 *   npx tsx scripts/testing/people-kudos/runSuite.ts --suite smoke --live --token <bearer>
 */
import { loadConfig, validateConfig } from './shared/config.js';
import { createRunContext } from './shared/context.js';
import { printSummary, summarizeResults } from './shared/logging.js';
import { cleanupTestItems } from './shared/cleanup.js';
import type { SuiteModule } from './shared/types.js';

import { kudosSuite } from './kudos/index.js';
import { peopleCultureSuite } from './people-culture/index.js';
import { companionsSuite } from './companions/index.js';
import { smokeSuite } from './smoke/index.js';

const SUITES: Record<string, SuiteModule> = {
  kudos: kudosSuite,
  pc: peopleCultureSuite,
  'people-culture': peopleCultureSuite,
  companions: companionsSuite,
  smoke: smokeSuite,
};

function parseArgs(): { suite: string; dryRun: boolean; verbose: boolean; noCleanup: boolean; configPath?: string; token?: string } {
  const args = process.argv.slice(2);
  return {
    suite: args.find((_, i, a) => a[i - 1] === '--suite') ?? '',
    dryRun: !args.includes('--live'),
    verbose: args.includes('--verbose'),
    noCleanup: args.includes('--no-cleanup'),
    configPath: args.find((_, i, a) => a[i - 1] === '--config'),
    token: args.find((_, i, a) => a[i - 1] === '--token'),
  };
}

async function main(): Promise<void> {
  const opts = parseArgs();
  if (!opts.suite || !SUITES[opts.suite]) {
    console.error(`Usage: --suite <${Object.keys(SUITES).join('|')}>`);
    process.exit(1);
  }

  const config = loadConfig(opts.configPath);
  if (opts.noCleanup) config.cleanup = false;

  const errors = validateConfig(config);
  if (errors.length > 0) { console.error('Config errors:', errors.join(', ')); process.exit(1); }

  const ctx = createRunContext(config, { dryRun: opts.dryRun, verbose: opts.verbose, explicitToken: opts.token });
  const suite = SUITES[opts.suite]!;

  console.log(`\n── ${suite.name} (${ctx.dryRun ? 'DRY-RUN' : 'LIVE'}) ──\n`);
  await suite.run(ctx);

  if (config.cleanup) { await cleanupTestItems(ctx); }

  printSummary(ctx);
  const s = summarizeResults(ctx);
  process.exit(s.fail > 0 ? 1 : 0);
}

main().catch((err) => { console.error('Fatal:', err); process.exit(2); });
