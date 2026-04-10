#!/usr/bin/env npx tsx
/**
 * Full-suite runner for the People & Culture + HB Kudos comprehensive test suite.
 *
 * Usage:
 *   npx tsx scripts/testing/people-kudos/runAll.ts --dry-run
 *   npx tsx scripts/testing/people-kudos/runAll.ts --live --token <bearer>
 *   npx tsx scripts/testing/people-kudos/runAll.ts --live --no-cleanup --verbose
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

const ALL_SUITES: SuiteModule[] = [kudosSuite, peopleCultureSuite, companionsSuite, smokeSuite];

function parseArgs(): { dryRun: boolean; verbose: boolean; noCleanup: boolean; configPath?: string; token?: string } {
  const args = process.argv.slice(2);
  return {
    dryRun: !args.includes('--live'),
    verbose: args.includes('--verbose'),
    noCleanup: args.includes('--no-cleanup'),
    configPath: args.find((_, i, a) => a[i - 1] === '--config'),
    token: args.find((_, i, a) => a[i - 1] === '--token'),
  };
}

async function main(): Promise<void> {
  const opts = parseArgs();
  const config = loadConfig(opts.configPath);
  if (opts.noCleanup) config.cleanup = false;

  const errors = validateConfig(config);
  if (errors.length > 0) {
    console.error('Config validation failed:', errors.join(', '));
    process.exit(1);
  }

  const ctx = createRunContext(config, {
    dryRun: opts.dryRun,
    verbose: opts.verbose,
    explicitToken: opts.token,
  });

  console.log(`\n╔══════════════════════════════════════════════╗`);
  console.log(`║  People & Culture + HB Kudos Test Suite      ║`);
  console.log(`╚══════════════════════════════════════════════╝`);
  console.log(`  runId:    ${ctx.runId}`);
  console.log(`  mode:     ${ctx.dryRun ? 'DRY-RUN' : 'LIVE'}`);
  console.log(`  site:     ${config.siteUrl}`);
  console.log(`  cleanup:  ${config.cleanup}`);
  console.log(`  suites:   ${ALL_SUITES.map((s) => s.name).join(', ')}\n`);

  for (const suite of ALL_SUITES) {
    console.log(`\n── ${suite.name} ${'─'.repeat(40 - suite.name.length)}\n`);
    await suite.run(ctx);
  }

  if (config.cleanup) {
    console.log(`\n── cleanup ${'─'.repeat(34)}\n`);
    await cleanupTestItems(ctx);
  }

  printSummary(ctx);
  const s = summarizeResults(ctx);
  process.exit(s.fail > 0 ? 1 : 0);
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(2);
});
