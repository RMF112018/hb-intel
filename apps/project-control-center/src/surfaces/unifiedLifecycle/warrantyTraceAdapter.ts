/**
 * Unified Lifecycle adapter seam — warranty trace.
 *
 * SHARED ADAPTER SEAM. NOT A ROUTED SURFACE.
 * Pure sync adapter. The `status` field is preserved verbatim,
 * including `'insufficient-evidence'`. The adapter NEVER auto-resolves,
 * fabricates a `recommendation`, or assigns blame — unresolved /
 * insufficient-evidence postures stay unresolved at the VM boundary.
 * The derived `isUnresolved` flag covers `insufficient-evidence`,
 * `unresolved-responsibility`, and `pending-evidence` for downstream
 * convenience; it never mutates the underlying status.
 */

import type {
  PccReadModelEnvelope,
  PccWarrantyTraceReadModel,
} from '@hbc/models/pcc';

import { buildPosture, mapWarrantyTraceRow } from './internalMappers.js';
import type { IPccWarrantyTraceViewModel } from './unifiedLifecycleViewModel.js';

export function buildPccWarrantyTraceViewModel(
  envelope: PccReadModelEnvelope<PccWarrantyTraceReadModel>,
): IPccWarrantyTraceViewModel {
  const posture = buildPosture(envelope);
  if (envelope.sourceStatus !== 'available') {
    return {
      ...posture,
      traces: [],
    };
  }
  return {
    ...posture,
    traces: envelope.data.traces.map(mapWarrantyTraceRow),
  };
}
