/**
 * Unified Lifecycle adapter seam — internal cardState helper.
 *
 * SHARED ADAPTER SEAM. NOT A ROUTED SURFACE.
 * Single point of contact between the unifiedLifecycle adapter set and
 * `src/api/pccReadModelStateMapping`. All seven leaf adapters and the
 * aggregate adapter import `toUnifiedLifecycleCardState` from this file
 * so the controlled-consumption guard for
 * `mapPccSourceStatusToPreviewState` only needs ONE narrow allowlist
 * entry covering this file.
 *
 * Pure mapping. No React, no client, no fetch.
 */

import type { PccReadModelSourceStatus } from '@hbc/models/pcc';
import { mapPccSourceStatusToPreviewState } from '../../api/pccReadModelStateMapping.js';
import type { PccPreviewStateKind } from '../../ui/PccPreviewState.js';
import type { PccCardState } from '../projectHome/shared.js';

const PREVIEW_TO_CARD_STATE: Readonly<Record<PccPreviewStateKind, PccCardState>> = {
  preview: 'preview',
  empty: 'empty',
  loading: 'preview',
  error: 'error',
  'missing-config': 'missing-config',
  'unavailable-fixture': 'unavailable-fixture',
  'unauthorized-persona': 'unauthorized-persona',
  'not-yet-implemented-operation': 'preview',
};

export function toUnifiedLifecycleCardState(sourceStatus: PccReadModelSourceStatus): PccCardState {
  return PREVIEW_TO_CARD_STATE[mapPccSourceStatusToPreviewState(sourceStatus)];
}
