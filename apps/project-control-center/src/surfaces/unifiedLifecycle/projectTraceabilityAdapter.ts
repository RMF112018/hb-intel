/**
 * Unified Lifecycle adapter seam — project traceability / related records.
 *
 * SHARED ADAPTER SEAM. NOT A ROUTED SURFACE.
 * Pure sync adapter. Preserves edge confidence + sourceLineage on every
 * traceability edge. The internal traceability graph (graph.edges /
 * graph.clusters) is exposed as flat `graphEdges` / `graphClusters`
 * fields on the VM rather than a nested `graph` object — that nested
 * shape is an internal model concern; downstream consumers can iterate
 * the flat lists or the top-level `edges` / `clusters`.
 */

import type {
  PccProjectTraceabilityReadModel,
  PccReadModelEnvelope,
} from '@hbc/models/pcc';

import {
  buildPosture,
  mapLifecycleEvent,
  mapMemoryRecord,
  mapRelatedRecordCluster,
  mapTraceabilityEdge,
} from './internalMappers.js';
import type { IPccProjectTraceabilityViewModel } from './unifiedLifecycleViewModel.js';

export function buildPccProjectTraceabilityViewModel(
  envelope: PccReadModelEnvelope<PccProjectTraceabilityReadModel>,
): IPccProjectTraceabilityViewModel {
  const posture = buildPosture(envelope);
  if (envelope.sourceStatus !== 'available') {
    return {
      ...posture,
      edges: [],
      clusters: [],
      graphEdges: [],
      graphClusters: [],
      relatedLifecycleEvents: [],
      relatedMemoryRecords: [],
    };
  }
  const data = envelope.data;
  return {
    ...posture,
    edges: data.edges.map(mapTraceabilityEdge),
    clusters: data.clusters.map(mapRelatedRecordCluster),
    graphEdges: data.graph.edges.map(mapTraceabilityEdge),
    graphClusters: data.graph.clusters.map(mapRelatedRecordCluster),
    relatedLifecycleEvents: data.relatedLifecycleEvents.map(mapLifecycleEvent),
    relatedMemoryRecords: data.relatedMemoryRecords.map(mapMemoryRecord),
  };
}
