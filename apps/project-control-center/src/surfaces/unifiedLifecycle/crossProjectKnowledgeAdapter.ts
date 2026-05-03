/**
 * Unified Lifecycle adapter seam — cross-project knowledge & closed-project references.
 *
 * SHARED ADAPTER SEAM. NOT A ROUTED SURFACE.
 * Pure sync adapter. Preserves `security.crossProjectAllowed`,
 * classification, and redactionLevel on every cross-project and
 * knowledge reference (including closed-project + future-pursuit
 * references). No fields are stripped.
 */

import type {
  PccCrossProjectKnowledgeReadModel,
  PccReadModelEnvelope,
} from '@hbc/models/pcc';

import {
  buildPosture,
  mapCrossProjectReference,
  mapKnowledgeReference,
} from './internalMappers.js';
import type {
  IPccClosedProjectReferenceView,
  IPccCrossProjectKnowledgeViewModel,
} from './unifiedLifecycleViewModel.js';

const EMPTY_CLOSED_PROJECT_REFERENCE_VIEW: IPccClosedProjectReferenceView = {
  references: [],
  futurePursuitReferences: [],
};

export function buildPccCrossProjectKnowledgeViewModel(
  envelope: PccReadModelEnvelope<PccCrossProjectKnowledgeReadModel>,
): IPccCrossProjectKnowledgeViewModel {
  const posture = buildPosture(envelope);
  if (envelope.sourceStatus !== 'available') {
    return {
      ...posture,
      crossProjectReferences: [],
      knowledgeReferences: [],
      closedProjectReferences: EMPTY_CLOSED_PROJECT_REFERENCE_VIEW,
    };
  }
  const data = envelope.data;
  return {
    ...posture,
    crossProjectReferences: data.crossProjectReferences.map(mapCrossProjectReference),
    knowledgeReferences: data.knowledgeReferences.map(mapKnowledgeReference),
    closedProjectReferences: {
      references: data.closedProjectReferences.references.map(mapKnowledgeReference),
      futurePursuitReferences: data.closedProjectReferences.futurePursuitReferences.map(
        mapKnowledgeReference,
      ),
    },
  };
}
