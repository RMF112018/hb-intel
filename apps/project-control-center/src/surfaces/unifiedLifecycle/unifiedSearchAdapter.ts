/**
 * Unified Lifecycle adapter seam — unified search / HBI grounding.
 *
 * SHARED ADAPTER SEAM. NOT A ROUTED SURFACE.
 * Pure sync adapter. Maps `UnifiedSearchAskHbiResponse` (discriminated
 * by `grounded`/`refused` booleans) into the VM-side discriminated
 * union keyed by `kind: 'grounded' | 'refusal'`. Grounded answers
 * preserve citations (with sourceLineage + evidenceLinkId). Refusal
 * answers preserve `refusalReason` and never carry citations.
 */

import type {
  PccReadModelEnvelope,
  PccUnifiedSearchAskHbiReadModel,
  UnifiedSearchAskHbiResponse,
} from '@hbc/models/pcc';

import { buildPosture } from './internalMappers.js';
import type {
  IPccUnifiedSearchAnswerVm,
  IPccUnifiedSearchViewModel,
} from './unifiedLifecycleViewModel.js';

function mapAnswer(response: UnifiedSearchAskHbiResponse): IPccUnifiedSearchAnswerVm {
  if (response.refused === true) {
    return {
      kind: 'refusal',
      answerId: response.answerId,
      query: response.query,
      response: response.response,
      refusalReason: response.refusalReason,
      citations: [],
    };
  }
  return {
    kind: 'grounded',
    answerId: response.answerId,
    query: response.query,
    response: response.response,
    citations: response.citations,
  };
}

export function buildPccUnifiedSearchViewModel(
  envelope: PccReadModelEnvelope<PccUnifiedSearchAskHbiReadModel>,
): IPccUnifiedSearchViewModel {
  const posture = buildPosture(envelope);
  if (envelope.sourceStatus !== 'available') {
    return {
      ...posture,
      answers: [],
    };
  }
  return {
    ...posture,
    answers: envelope.data.responses.map(mapAnswer),
  };
}
