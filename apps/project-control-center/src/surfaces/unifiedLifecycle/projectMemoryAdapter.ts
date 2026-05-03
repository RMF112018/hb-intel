/**
 * Unified Lifecycle adapter seam — project memory.
 *
 * SHARED ADAPTER SEAM. NOT A ROUTED SURFACE.
 * Pure sync adapter. Preserves decision/assumption discriminators on
 * the records list, plus dedicated decisions[] / assumptions[] slots.
 */

import type {
  PccProjectMemoryReadModel,
  PccReadModelEnvelope,
} from '@hbc/models/pcc';

import { buildPosture, mapAssumption, mapDecision, mapMemoryRecord } from './internalMappers.js';
import type { IPccProjectMemoryViewModel } from './unifiedLifecycleViewModel.js';

export function buildPccProjectMemoryViewModel(
  envelope: PccReadModelEnvelope<PccProjectMemoryReadModel>,
): IPccProjectMemoryViewModel {
  const posture = buildPosture(envelope);
  if (envelope.sourceStatus !== 'available') {
    return {
      ...posture,
      records: [],
      decisions: [],
      assumptions: [],
    };
  }
  const data = envelope.data;
  return {
    ...posture,
    records: data.records.map(mapMemoryRecord),
    decisions: data.decisions.map(mapDecision),
    assumptions: data.assumptions.map(mapAssumption),
  };
}
