/**
 * Unified Lifecycle adapter seam — aggregate orchestrator.
 *
 * SHARED ADAPTER SEAM. NOT A ROUTED SURFACE.
 * Consumes a single `PccReadModelEnvelope<PccUnifiedLifecycleReadModel>`
 * (the aggregate envelope returned by `getUnifiedLifecycle` in the SPFx
 * client) and emits a VM that nests the seven leaf VMs. It synthesizes
 * leaf envelopes by carrying the parent envelope's posture
 * (`mode` / `sourceStatus` / `projectId` / `viewerPersona` /
 * `generatedAtUtc` / `warnings` / `readOnly`) verbatim onto each leaf
 * `data` slice, then defers to the leaf adapters so behavior stays in
 * lockstep with direct leaf-route consumption.
 */

import type {
  PccReadModelEnvelope,
  PccUnifiedLifecycleReadModel,
} from '@hbc/models/pcc';

import { buildPccCrossProjectKnowledgeViewModel } from './crossProjectKnowledgeAdapter.js';
import { buildPosture } from './internalMappers.js';
import { buildPccLifecycleTimelineViewModel } from './lifecycleTimelineAdapter.js';
import { buildPccProjectLensesViewModel } from './projectLensesAdapter.js';
import { buildPccProjectMemoryViewModel } from './projectMemoryAdapter.js';
import { buildPccProjectTraceabilityViewModel } from './projectTraceabilityAdapter.js';
import { buildPccUnifiedSearchViewModel } from './unifiedSearchAdapter.js';
import type { IPccUnifiedLifecycleViewModel } from './unifiedLifecycleViewModel.js';
import { buildPccWarrantyTraceViewModel } from './warrantyTraceAdapter.js';

function withParentPosture<T>(
  parent: PccReadModelEnvelope<PccUnifiedLifecycleReadModel>,
  data: T,
): PccReadModelEnvelope<T> {
  return {
    projectId: parent.projectId,
    mode: parent.mode,
    sourceStatus: parent.sourceStatus,
    readOnly: true,
    warnings: parent.warnings,
    generatedAtUtc: parent.generatedAtUtc,
    data,
    ...(parent.viewerPersona !== undefined ? { viewerPersona: parent.viewerPersona } : {}),
  };
}

export function buildPccUnifiedLifecycleViewModel(
  envelope: PccReadModelEnvelope<PccUnifiedLifecycleReadModel>,
): IPccUnifiedLifecycleViewModel {
  const posture = buildPosture(envelope);
  const data = envelope.data;
  return {
    ...posture,
    lifecycleTimeline: buildPccLifecycleTimelineViewModel(
      withParentPosture(envelope, data.lifecycleTimeline),
    ),
    projectMemory: buildPccProjectMemoryViewModel(
      withParentPosture(envelope, data.projectMemory),
    ),
    projectLenses: buildPccProjectLensesViewModel(
      withParentPosture(envelope, data.projectLenses),
    ),
    projectTraceability: buildPccProjectTraceabilityViewModel(
      withParentPosture(envelope, data.projectTraceability),
    ),
    warrantyTrace: buildPccWarrantyTraceViewModel(
      withParentPosture(envelope, data.warrantyTrace),
    ),
    crossProjectKnowledge: buildPccCrossProjectKnowledgeViewModel(
      withParentPosture(envelope, data.crossProjectKnowledge),
    ),
    unifiedSearch: buildPccUnifiedSearchViewModel(
      withParentPosture(envelope, data.unifiedSearch),
    ),
  };
}
