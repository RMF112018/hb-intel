import type { IAutopsyEvidence } from '../../types/index.js';

export const POST_BID_AUTOPSY_EVIDENCE_BOUNDARY = Object.freeze({
  owner: 'primitive',
  area: 'evidence',
  adapterMayProvide: Object.freeze(['sourceRef', 'capturedBy', 'capturedAt']),
  adapterMustNotOwn: Object.freeze(['evidence-validation', 'coverage-policy', 'publication-readiness']),
});

export const createEvidenceRecord = (
  overrides: Partial<IAutopsyEvidence> = {}
): IAutopsyEvidence => ({
  evidenceId: overrides.evidenceId ?? 'evidence-default',
  type: overrides.type ?? 'interview-note',
  sourceRef: overrides.sourceRef ?? 'source/default',
  capturedBy: overrides.capturedBy ?? 'system',
  capturedAt: overrides.capturedAt ?? '2026-03-13T00:00:00.000Z',
  reliabilityHint: overrides.reliabilityHint,
  sensitivity: overrides.sensitivity ?? 'internal',
});
