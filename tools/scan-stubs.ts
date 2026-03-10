/**
 * tools/scan-stubs.ts — Local stub pattern scanner
 * PH7.13 — Stub Detection and Incomplete Implementation Enforcement
 *
 * Provides a developer-friendly view of stub patterns in the codebase.
 * Equivalent to the CI grep scan (T03) but with annotated output and
 * the ability to also list stub-approved entries for inventory review.
 *
 * Usage:
 *   pnpm scan-stubs                  # Report unapproved stubs only (CI-equivalent)
 *   pnpm scan-stubs:all              # Also list stub-approved entries (inventory view)
 *
 * Exit codes:
 *   0 — no unapproved stubs found
 *   1 — one or more unapproved stubs found
 *
 * @see docs/architecture/plans/ph7-remediation/PH7.13-Stub-Detection-Enforcement.md
 * @see docs/architecture/adr/0095-stub-detection-enforcement-standard.md
 */
import { spawnSync } from 'node:child_process';
import { argv } from 'node:process';

const includeApproved = argv.includes('--include-approved');

// --- Unapproved-stub detection (throw-pattern grep, same as CI T03) ---
const STUB_PATTERN =
  "(throw new Error\\(['\"`][^'\"]*not.?impl|throw new Error\\(['\"`][^'\"]*placeholder)";

const EXCLUDE_DIRS = [
  '--exclude-dir=dist',
  '--exclude-dir=node_modules',
  '--exclude-dir=coverage',
  '--exclude-dir=.git',
  '--exclude-dir=tools/mocks',
];

const SCAN_DIRS = ['packages/', 'apps/', 'backend/'];

function runGrep(args: string[]): string {
  const result = spawnSync('grep', args, { encoding: 'utf-8' });
  // grep exits 1 when no matches — not an error
  return result.stdout || '';
}

function runThrowScan(): string[] {
  const raw = runGrep([
    '-rn',
    '--include=*.ts',
    '--include=*.tsx',
    ...EXCLUDE_DIRS,
    '-E',
    STUB_PATTERN,
    ...SCAN_DIRS,
  ]);
  return raw
    .split('\n')
    .filter(Boolean)
    .filter(
      (l) =>
        !l.includes('stub-approved:') && !l.includes('.test.') && !l.includes('.spec.')
    );
}

// --- Approved-stub inventory (separate grep for stub-approved: markers) ---
function runApprovedScan(): string[] {
  const raw = runGrep([
    '-rn',
    '--include=*.ts',
    '--include=*.tsx',
    '--include=*.yml',
    '--include=*.yaml',
    '--exclude-dir=node_modules',
    '--exclude-dir=dist',
    '--exclude-dir=.git',
    '--exclude=ci.yml', // CI workflow references stub-approved: in its own grep — not a stub
    'stub-approved:',
    'packages/',
    'apps/',
    'backend/',
    '.github/',
  ]);
  return raw.split('\n').filter(Boolean);
}

// --- Output ---
const unapproved = runThrowScan();
const DIVIDER = '───────────────────────────────────────────────────────────────────';

console.log(`\n── HB Intel Stub Scanner (PH7.13) ${DIVIDER.slice(35)}`);

if (unapproved.length === 0) {
  console.log('✅  No unapproved stubs found.\n');
} else {
  console.log(`❌  ${unapproved.length} unapproved stub(s) found:\n`);
  for (const line of unapproved) {
    console.log('   ', line);
  }
  console.log('');
  console.log(
    '   → Implement the function, or add // stub-approved: <reason> above the throw.'
  );
  console.log(
    '   → See docs/architecture/plans/ph7-remediation/PH7.13-T04-Stub-Inventory-Remediation.md'
  );
}

if (includeApproved) {
  const approved = runApprovedScan();
  if (approved.length > 0) {
    console.log(
      `\n⚠️   ${approved.length} approved stub(s) (informational — inventory view):\n`
    );
    for (const line of approved) {
      console.log('   ', line);
    }
    console.log(
      '\n   → These stubs are intentionally deferred. Review at each phase gate.'
    );
  } else {
    console.log('\nℹ️   No stub-approved entries found in the codebase.\n');
  }
}

console.log(`${DIVIDER}\n`);

process.exit(unapproved.length > 0 ? 1 : 0);
