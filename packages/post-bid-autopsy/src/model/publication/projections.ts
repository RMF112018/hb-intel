import type {
  IAutopsyBenchmarkPublishProjection,
  IAutopsyPublishResult,
  IAutopsyRecalibrationSignal,
  IAutopsyRecordSnapshot,
  IAutopsyStrategicIntelligenceDraft,
  StrategicIntelligenceSensitivity,
} from '../../types/index.js';

const mapSensitivityToIntelligence = (
  visibility: IAutopsyRecordSnapshot['autopsy']['sensitivity']['visibility']
): StrategicIntelligenceSensitivity => {
  switch (visibility) {
    case 'role-scoped':
      return 'restricted-role';
    case 'project-scoped':
      return 'restricted-project';
    case 'cross-module-redacted':
      return 'restricted-role';
    case 'confidential':
      return 'confidential';
  }
};

const createIntelligenceDraft = (
  record: IAutopsyRecordSnapshot,
  redacted: boolean
): IAutopsyStrategicIntelligenceDraft => ({
  autopsyId: record.autopsy.autopsyId,
  scorecardId: record.autopsy.scorecardId,
  title: `Post-bid learning for ${record.autopsy.pursuitId}`,
  body: redacted
    ? 'Sensitive findings redacted for cross-module visibility.'
    : `Outcome ${record.autopsy.outcome}; root causes: ${record.autopsy.rootCauseTags
        .map((tag) => tag.label)
        .join(', ')}`,
  sensitivity: mapSensitivityToIntelligence(record.autopsy.sensitivity.visibility),
  redacted,
  rootCauseCodes: record.autopsy.rootCauseTags.map((tag) => tag.normalizedCode),
  sourceEvidenceIds: record.autopsy.evidence.map((evidence) => evidence.evidenceId),
});

export const buildAutopsyPublishProjections = (
  record: IAutopsyRecordSnapshot
): IAutopsyPublishResult => {
  if (
    !record.autopsy.publicationGate.publishable ||
    !['approved', 'published'].includes(record.autopsy.status)
  ) {
    return {
      publishable: false,
      benchmarkProjection: null,
      intelligenceDraft: null,
      redactedDraft: null,
    };
  }

  const recalibrationSignal: IAutopsyRecalibrationSignal = {
    signalId: `recalibration:${record.autopsy.autopsyId}`,
    criterionId: record.autopsy.rootCauseTags[0]?.normalizedCode,
    predictiveDrift: Number((1 - record.autopsy.confidence.score).toFixed(2)),
    triggeredBy: 'sf22-outcome',
    correlationKeys: record.autopsy.rootCauseTags.map((tag) => tag.normalizedCode),
    triggeredAt: record.auditTrail.at(-1)?.occurredAt ?? record.sla.startedAt,
  };

  const benchmarkProjection: IAutopsyBenchmarkPublishProjection = {
    benchmarkSignalId: `benchmark:${record.autopsy.autopsyId}`,
    recalibrationSignal,
    affectedCriterionIds: record.autopsy.rootCauseTags.map((tag) => tag.tagId),
  };

  const intelligenceDraft = createIntelligenceDraft(record, false);
  const requiresRedaction =
    record.autopsy.sensitivity.visibility === 'cross-module-redacted' ||
    record.autopsy.sensitivity.redactionRequired;

  return {
    publishable: true,
    benchmarkProjection,
    intelligenceDraft: requiresRedaction ? null : intelligenceDraft,
    redactedDraft: requiresRedaction ? createIntelligenceDraft(record, true) : null,
  };
};
