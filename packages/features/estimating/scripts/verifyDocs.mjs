#!/usr/bin/env node
/**
 * @design SF18-T09
 * Deterministic documentation verification for SF18 closure artifacts.
 */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const repoRoot = join(process.cwd(), '..', '..', '..');

const checks = [
  {
    file: join(repoRoot, 'docs', 'architecture', 'plans', 'shared-features', 'SF18-Estimating-Bid-Readiness.md'),
    mustInclude: ['T01-T09 implemented', 'Adapter-over-primitive boundary verified'],
    label: 'SF18 master progress note',
  },
  {
    file: join(repoRoot, 'docs', 'architecture', 'plans', 'shared-features', 'SF18-T09-Testing-and-Deployment.md'),
    mustInclude: ['IMPLEMENTATION PROGRESS & NOTES', 'SF18-T09 completed'],
    label: 'SF18-T09 progress note',
  },
  {
    file: join(repoRoot, 'docs', 'architecture', 'adr', 'ADR-0107-estimating-bid-readiness-signal.md'),
    mustInclude: ['SF18 is an Estimating adapter', '@hbc/health-indicator'],
    label: 'ADR-0107 closure',
  },
  {
    file: join(repoRoot, 'docs', 'architecture', 'adr', 'ADR-0111-health-indicator-readiness-primitive-runtime.md'),
    mustInclude: ['companion primitive ADR', '@hbc/health-indicator'],
    label: 'Companion primitive ADR',
  },
];

/** @type {string[]} */
const errors = [];
for (const check of checks) {
  const text = readFileSync(check.file, 'utf8');
  for (const token of check.mustInclude) {
    if (!text.includes(token)) {
      errors.push(`${check.label}: missing "${token}" in ${check.file}`);
    }
  }
}

if (errors.length > 0) {
  console.error('SF18-T09 documentation verification failed:');
  for (const error of errors) {
    console.error(`- ${error}`);
  }
  process.exit(1);
}

console.log('SF18-T09 documentation verification passed.');
