import type { IAutopsyRecordSnapshot } from '../types/index.js';

export type AutopsyIntegrationRedactionMode = 'full' | 'redacted' | 'none';

export interface IAutopsyPublishEnvelope {
  readonly autopsyId: string;
  readonly pursuitId: string;
  readonly scorecardId: string;
  readonly status: IAutopsyRecordSnapshot['autopsy']['status'];
  readonly confidence: {
    readonly tier: IAutopsyRecordSnapshot['autopsy']['confidence']['tier'];
    readonly score: number;
  };
  readonly evidenceCoverage: number;
  readonly sensitivityPolicy: IAutopsyRecordSnapshot['autopsy']['sensitivity'];
  readonly reasonCodes: readonly string[];
}

export interface IAutopsyWizardSectionProjection {
  readonly stepId:
    | 'outcome-context'
    | 'evidence-references'
    | 'findings-recommendations'
    | 'disagreements-approval'
    | 'impact-preview-submit';
  readonly label: string;
  readonly required: boolean;
  readonly order: number;
  readonly ready: boolean;
}

const PUBLISHABLE_STATUSES = new Set(['approved', 'published']);

export const isAutopsyPublishEligible = (record: IAutopsyRecordSnapshot): boolean =>
  record.autopsy.publicationGate.publishable && PUBLISHABLE_STATUSES.has(record.autopsy.status);

export const createAutopsyReasonCodes = (record: IAutopsyRecordSnapshot): readonly string[] => {
  const codes = new Set<string>();

  for (const tag of record.autopsy.rootCauseTags) {
    codes.add(tag.normalizedCode);
  }

  for (const blocker of record.autopsy.publicationGate.blockers) {
    codes.add(`blocker:${blocker}`);
  }

  if (record.autopsy.overrideGovernance) {
    codes.add('governance:manual-override');
  }

  if (record.autopsy.disagreements.some((item) => item.resolutionStatus === 'open')) {
    codes.add('review:open-disagreement');
  }

  return Object.freeze([...codes]);
};

export const createAutopsyPublishEnvelope = (
  record: IAutopsyRecordSnapshot
): IAutopsyPublishEnvelope => ({
  autopsyId: record.autopsy.autopsyId,
  pursuitId: record.autopsy.pursuitId,
  scorecardId: record.autopsy.scorecardId,
  status: record.autopsy.status,
  confidence: {
    tier: record.autopsy.confidence.tier,
    score: record.autopsy.confidence.score,
  },
  evidenceCoverage: record.autopsy.confidence.evidenceCoverage,
  sensitivityPolicy: record.autopsy.sensitivity,
  reasonCodes: createAutopsyReasonCodes(record),
});

export const createAutopsyRedactionMode = (
  record: IAutopsyRecordSnapshot
): AutopsyIntegrationRedactionMode => {
  if (record.autopsy.sensitivity.visibility === 'confidential') {
    return 'none';
  }

  if (
    record.autopsy.sensitivity.visibility === 'cross-module-redacted' ||
    record.autopsy.sensitivity.redactionRequired
  ) {
    return 'redacted';
  }

  return 'full';
};

export const redactAutopsyText = (record: IAutopsyRecordSnapshot, value: string): string => {
  const mode = createAutopsyRedactionMode(record);

  if (mode === 'full') {
    return value;
  }

  if (mode === 'none') {
    return 'Restricted autopsy content unavailable.';
  }

  return 'Sensitive autopsy content redacted for cross-module visibility.';
};

export const createAutopsyIntegrationDedupeKey = (
  kind: string,
  autopsyId: string,
  suffix: string
): string => `${kind}:${autopsyId}:${suffix}`;

export const createAutopsyWizardSections = (
  record?: IAutopsyRecordSnapshot | null
): readonly IAutopsyWizardSectionProjection[] => {
  const autopsy = record?.autopsy ?? null;
  const evidenceCount = autopsy?.evidence.length ?? 0;
  const hasFindings = (autopsy?.rootCauseTags.length ?? 0) > 0;
  const hasOpenDisagreements = autopsy?.disagreements.some((item) => item.resolutionStatus === 'open') ?? false;
  const isReadyForImpact = Boolean(autopsy && !hasOpenDisagreements);

  return Object.freeze([
    {
      stepId: 'outcome-context',
      label: 'Outcome + pursuit context',
      required: true,
      order: 1,
      ready: Boolean(autopsy),
    },
    {
      stepId: 'evidence-references',
      label: 'Evidence and linked references',
      required: true,
      order: 2,
      ready: evidenceCount > 0,
    },
    {
      stepId: 'findings-recommendations',
      label: 'Findings, root cause, recommendation',
      required: true,
      order: 3,
      ready: hasFindings,
    },
    {
      stepId: 'disagreements-approval',
      label: 'Disagreements, approvals, readiness',
      required: true,
      order: 4,
      ready: !hasOpenDisagreements,
    },
    {
      stepId: 'impact-preview-submit',
      label: 'Downstream impact preview and submit',
      required: true,
      order: 5,
      ready: isReadyForImpact,
    },
  ]);
};
