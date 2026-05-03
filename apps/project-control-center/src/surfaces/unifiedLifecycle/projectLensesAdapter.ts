/**
 * Unified Lifecycle adapter seam — project lenses.
 *
 * SHARED ADAPTER SEAM. NOT A ROUTED SURFACE.
 * Pure sync adapter. Lens VM exposes eligible lens options and the
 * default lens id. Lens *visibility* (visible / redacted / hidden
 * counts) is computed on demand by `summarizeLensVisibility` in
 * `lensState.ts` — never embedded in the VM, since visibility depends
 * on the record set being filtered.
 *
 * The lens model is a visibility cue. It never implies a separate
 * workspace, route, or navigation.
 */

import type {
  PccProjectLensesReadModel,
  PccReadModelEnvelope,
} from '@hbc/models/pcc';

import { buildPosture } from './internalMappers.js';
import type {
  IPccLensOptionVm,
  IPccProjectLensesViewModel,
} from './unifiedLifecycleViewModel.js';

function mapLens(lens: PccProjectLensesReadModel['stageLenses'][number]): IPccLensOptionVm {
  return {
    lensId: lens.lensId,
    lensType: lens.lensType,
    visibilityMode: lens.visibilityMode,
    lifecycleStage: lens.lifecycleStage,
    projectStage: lens.projectStage,
    role: lens.role,
    taskFocus: lens.taskFocus,
    includedMemoryIds: lens.includedMemoryIds,
    includedEventIds: lens.includedEventIds,
    includedTraceEdgeIds: lens.includedTraceEdgeIds,
  };
}

export function buildPccProjectLensesViewModel(
  envelope: PccReadModelEnvelope<PccProjectLensesReadModel>,
): IPccProjectLensesViewModel {
  const posture = buildPosture(envelope);
  if (envelope.sourceStatus !== 'available') {
    return {
      ...posture,
      lenses: [],
      defaultLensId: undefined,
    };
  }
  const lenses = envelope.data.stageLenses.map(mapLens);
  return {
    ...posture,
    lenses,
    defaultLensId: lenses[0]?.lensId,
  };
}
