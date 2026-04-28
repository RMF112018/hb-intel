import type { ScanResult } from '../contracts/provisioning-manifest.js';
import { PROHIBITED_MUTATION_KEYS } from '../guards/no-mutation-guard.js';

const KEY_SET = new Set([...PROHIBITED_MUTATION_KEYS].map((k) => k.toLowerCase()));

const VERB_PHRASE_REGEX =
  /\b(create\s+site|create\s+list|create\s+library|create\s+group|assign\s+permission|graph\s+write|pnp\s+write|provision\s+live)\b/i;

function walk(value: unknown, path: string, hits: string[]): void {
  if (value === null || typeof value === 'undefined') return;

  if (typeof value === 'string') {
    if (VERB_PHRASE_REGEX.test(value)) {
      hits.push(`${path}::value`);
    }
    return;
  }

  if (typeof value !== 'object') return;

  if (Array.isArray(value)) {
    for (let i = 0; i < value.length; i += 1) walk(value[i], `${path}[${i}]`, hits);
    return;
  }

  for (const key of Object.keys(value)) {
    if (KEY_SET.has(key.toLowerCase())) {
      hits.push(`${path}.${key}`);
    }
    walk((value as Record<string, unknown>)[key], `${path}.${key}`, hits);
  }
}

/**
 * Flag any structural or textual indication that a manifest carries
 * tenant-mutation intent. Combines the Step 2 prohibited-key scan with
 * a word-boundaried verb-phrase scan over string values. Word
 * boundaries prevent false hits on `'planned'`, `'plannedOnly'`,
 * `'noProcoreMirrorScan'`, etc.
 */
export function runNoTenantMutationScan(value: unknown): ScanResult {
  const hits: string[] = [];
  walk(value, '$', hits);
  return { ok: hits.length === 0, hits: Object.freeze([...hits]) };
}
