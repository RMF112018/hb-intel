/**
 * Project Home read-model adapter (Phase 3 / Wave 4 / Prompt 04).
 *
 * Pure mapping layer. Converts PCC read-model envelopes into a stable
 * Project Home view model whose slots carry both:
 *   - `state` — the existing card-state vocabulary (`PccCardState`),
 *     derived via `mapPccSourceStatusToPreviewState` and narrowed to
 *     the card subset;
 *   - `data`  — the typed payload Project Home cards render.
 *
 * No `fetch`, no async, no client/factory imports. The single
 * `src/api/` import is the named pure helper
 * `mapPccSourceStatusToPreviewState`; the controlled-consumption guard
 * encodes a narrow exception for this file + identifier + path.
 *
 * Prompt 05 wires `PccProjectHome` through this adapter; Prompt 06
 * hardens the guard.
 */

import { mapPccSourceStatusToPreviewState } from '../../api/pccReadModelStateMapping.js';
import type { PccPreviewStateKind } from '../../ui/PccPreviewState';
import type {
  PccDocumentControlReadModel,
  PccProjectHomeReadModel,
  PccReadModelEnvelope,
  PccReadModelSourceStatus,
} from '@hbc/models/pcc';
import type { PccCardState } from './shared.js';
import type {
  IPccProjectHomeViewModel,
  IPccProjectHomeViewModelSlot,
} from './projectHomeViewModel.js';

export interface IProjectHomeAdapterInput {
  readonly home: PccReadModelEnvelope<PccProjectHomeReadModel>;
  readonly documentControl: PccReadModelEnvelope<PccDocumentControlReadModel>;
}

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

function toCardState(sourceStatus: PccReadModelSourceStatus): PccCardState {
  return PREVIEW_TO_CARD_STATE[mapPccSourceStatusToPreviewState(sourceStatus)];
}

function slot<TData>(
  sourceStatus: PccReadModelSourceStatus,
  data: TData,
): IPccProjectHomeViewModelSlot<TData> {
  return {
    state: toCardState(sourceStatus),
    sourceStatus,
    data,
  };
}

export function buildPccProjectHomeViewModel(
  input: IProjectHomeAdapterInput,
): IPccProjectHomeViewModel {
  const homeStatus = input.home.sourceStatus;
  const docStatus = input.documentControl.sourceStatus;
  const home = input.home.data;
  const docs = input.documentControl.data;

  return {
    intelligence: slot(homeStatus, home.profile),
    priorityActions: slot(homeStatus, home.priorityActions ?? []),
    siteHealth: slot(homeStatus, home.siteHealth),
    documentControl: slot(docStatus, docs.sources ?? []),
    missingConfigurations: slot(homeStatus, home.missingConfigurations ?? []),
  };
}
