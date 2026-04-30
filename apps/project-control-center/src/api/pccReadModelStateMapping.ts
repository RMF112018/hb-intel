/**
 * Maps `PccReadModelSourceStatus` envelope values to the existing
 * eight-state preview catalog (`PccPreviewStateKind` from
 * `../ui/PccPreviewState`). Pure helper; no surface consumes it in
 * Wave 3 / Prompt 06. Exists so future consumers can render envelope
 * states using the existing W2-ODR-009 visual contract without
 * inventing new states.
 */

import type { PccReadModelSourceStatus } from '@hbc/models/pcc';
import type { PccPreviewStateKind } from '../ui/PccPreviewState.js';

export const PCC_SOURCE_STATUS_TO_PREVIEW_STATE: Readonly<
  Record<PccReadModelSourceStatus, PccPreviewStateKind>
> = {
  available: 'preview',
  'backend-unavailable': 'error',
  'source-unavailable': 'unavailable-fixture',
  'missing-config': 'missing-config',
  stale: 'preview',
  unauthorized: 'unauthorized-persona',
  forbidden: 'unauthorized-persona',
};

export function mapPccSourceStatusToPreviewState(
  status: PccReadModelSourceStatus,
): PccPreviewStateKind {
  return PCC_SOURCE_STATUS_TO_PREVIEW_STATE[status];
}
