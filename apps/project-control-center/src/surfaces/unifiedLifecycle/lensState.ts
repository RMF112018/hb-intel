/**
 * Unified Lifecycle adapter seam — lens visibility helper.
 *
 * SHARED ADAPTER SEAM. NOT A ROUTED SURFACE.
 * Pure helper — no React, no client, no fetch, no router. Computes a
 * visibility cue (visible / redacted / hidden counts) for a given lens
 * over a set of records. Returns NO route, workspace, navigation, or
 * URL info — the lens model is a visibility cue, never a separate
 * workspace.
 *
 * Visibility rules:
 *   - record id NOT in the lens included set → hidden
 *   - record id IN the lens AND `redactionLevel === 'withheld'` → hidden
 *   - record id IN the lens AND `redactionLevel === 'masked'`   → redacted
 *   - record id IN the lens AND `redactionLevel === 'none'`     → visible
 *
 * The `'withheld'` posture is also hidden so callers cannot infer the
 * existence of a withheld record from a visible/redacted count.
 */

import type { PccProjectStageLens, PccSecurityPosture } from '@hbc/models/pcc';

import type { IPccLensVisibilitySummary } from './unifiedLifecycleViewModel.js';

export type LensRecordKind = 'memory' | 'event' | 'edge';

/** Minimal record shape needed for visibility scoring. */
export interface ILensVisibilityRecord {
  readonly id: string;
  readonly kind: LensRecordKind;
  readonly security: PccSecurityPosture;
}

const EMPTY_SUMMARY: IPccLensVisibilitySummary = {
  visibleCount: 0,
  redactedCount: 0,
  hiddenCount: 0,
};

function lensIncludesRecord(lens: PccProjectStageLens, record: ILensVisibilityRecord): boolean {
  switch (record.kind) {
    case 'memory':
      return lens.includedMemoryIds.includes(record.id);
    case 'event':
      return lens.includedEventIds.includes(record.id);
    case 'edge':
      return lens.includedTraceEdgeIds.includes(record.id);
  }
}

export function summarizeLensVisibility(
  records: readonly ILensVisibilityRecord[],
  lens: PccProjectStageLens | undefined,
): IPccLensVisibilitySummary {
  if (!lens) return EMPTY_SUMMARY;
  let visibleCount = 0;
  let redactedCount = 0;
  let hiddenCount = 0;
  for (const record of records) {
    if (!lensIncludesRecord(lens, record)) {
      hiddenCount += 1;
      continue;
    }
    switch (record.security.redactionLevel) {
      case 'none':
        visibleCount += 1;
        break;
      case 'masked':
        redactedCount += 1;
        break;
      case 'withheld':
        hiddenCount += 1;
        break;
    }
  }
  return { visibleCount, redactedCount, hiddenCount };
}
