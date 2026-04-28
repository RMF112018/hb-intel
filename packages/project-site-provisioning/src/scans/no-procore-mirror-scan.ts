import type { ScanResult } from '../contracts/provisioning-manifest.js';
import type { TemplateArtifacts } from '../contracts/template-artifacts.js';

export const PROCORE_MIRROR_KEY_TOKENS = [
  'procoremirror',
  'procore_mirror',
  'mirrortable',
  'mirror_table',
  'mirrorrecords',
  'mirror_records',
] as const;

const KEY_SET = new Set(PROCORE_MIRROR_KEY_TOKENS.map((t) => t.toLowerCase()));

function walk(value: unknown, path: string, hits: string[]): void {
  if (value === null || typeof value !== 'object') return;
  if (Array.isArray(value)) {
    for (let i = 0; i < value.length; i += 1) walk(value[i], `${path}[${i}]`, hits);
    return;
  }
  for (const key of Object.keys(value)) {
    if (KEY_SET.has(key.toLowerCase())) hits.push(`${path}.${key}`);
    walk((value as Record<string, unknown>)[key], `${path}.${key}`, hits);
  }
}

/**
 * Verify that the manifest does not declare a full Procore mirror.
 * Combines a structural key scan with two source-of-truth assertions
 * pulled from the template artifacts:
 *
 *   1. The integrations fixture must keep `noFullProcoreMirror !== false`
 *      and `procoreWriteback_Deferred !== false` (allowing absent or
 *      true; rejecting an explicit false).
 *   2. The object-catalog rows for OC-17 / OC-18 must remain
 *      `extractionTreatment: 'placeholder-only'` and
 *      `mvpTreatment: 'Deferred'`.
 */
export function runNoProcoreMirrorScan(
  manifest: unknown,
  artifacts: TemplateArtifacts,
): ScanResult {
  const hits: string[] = [];
  walk(manifest, '$', hits);

  const integrationsFixture = artifacts.familyFixtures['integrations'] as
    | (Record<string, unknown> | undefined);
  if (integrationsFixture !== undefined) {
    if (integrationsFixture['noFullProcoreMirror'] === false) {
      hits.push('artifacts.integrations.noFullProcoreMirror=false');
    }
    if (integrationsFixture['procoreWriteback_Deferred'] === false) {
      hits.push('artifacts.integrations.procoreWriteback_Deferred=false');
    }
  }

  for (const catalogId of ['OC-17', 'OC-18']) {
    const row = artifacts.objectCatalog.rows.find((r) => r.catalogId === catalogId);
    if (!row) continue;
    if (row.extractionTreatment !== 'placeholder-only') {
      hits.push(`artifacts.objectCatalog.${catalogId}.extractionTreatment=${row.extractionTreatment ?? 'undefined'}`);
    }
    if (row.mvpTreatment !== 'Deferred') {
      hits.push(`artifacts.objectCatalog.${catalogId}.mvpTreatment=${row.mvpTreatment ?? 'undefined'}`);
    }
  }

  return { ok: hits.length === 0, hits: Object.freeze([...hits]) };
}
