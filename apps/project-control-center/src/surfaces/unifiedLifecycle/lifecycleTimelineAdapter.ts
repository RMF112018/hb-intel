/**
 * Unified Lifecycle adapter seam — lifecycle timeline.
 *
 * SHARED ADAPTER SEAM. NOT A ROUTED SURFACE.
 * Pure sync adapter that normalizes a
 * `PccReadModelEnvelope<PccProjectLifecycleTimelineReadModel>` into a
 * UI-ready view model. Non-`available` envelopes return safe-empty.
 */

import type {
  PccProjectLifecycleTimelineReadModel,
  PccReadModelEnvelope,
} from '@hbc/models/pcc';

import { buildPosture, mapCheckpoint, mapGateSignal, mapLifecycleEvent } from './internalMappers.js';
import type { IPccLifecycleTimelineViewModel } from './unifiedLifecycleViewModel.js';

export function buildPccLifecycleTimelineViewModel(
  envelope: PccReadModelEnvelope<PccProjectLifecycleTimelineReadModel>,
): IPccLifecycleTimelineViewModel {
  const posture = buildPosture(envelope);
  if (envelope.sourceStatus !== 'available') {
    return {
      ...posture,
      events: [],
      checkpoints: [],
      gateSignals: [],
      contextReferences: [],
    };
  }
  const data = envelope.data;
  return {
    ...posture,
    events: data.events.map(mapLifecycleEvent),
    checkpoints: data.checkpoints.map(mapCheckpoint),
    gateSignals: data.gateSignals.map(mapGateSignal),
    contextReferences: data.contextReferences,
  };
}
