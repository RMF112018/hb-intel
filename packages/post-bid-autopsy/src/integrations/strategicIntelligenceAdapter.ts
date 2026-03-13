import type { IAutopsyRecordSnapshot } from '../types/index.js';
import {
  createAutopsyPublishEnvelope,
  createAutopsyRedactionMode,
  createAutopsyReasonCodes,
  isAutopsyPublishEligible,
  redactAutopsyText,
} from './helpers.js';

export interface IAutopsyStrategicIntelligenceSeedProjection {
  readonly autopsyId: string;
  readonly title: string;
  readonly body: string;
  readonly sourceEvidenceIds: readonly string[];
  readonly rootCauseCodes: readonly string[];
  readonly sensitivity: 'public-internal' | 'restricted-role' | 'restricted-project' | 'confidential';
  readonly redacted: boolean;
  readonly publishEnvelope: ReturnType<typeof createAutopsyPublishEnvelope>;
  readonly version: {
    readonly snapshotId: string;
    readonly version: number;
  } | null;
}

const mapSensitivity = (
  record: IAutopsyRecordSnapshot
): IAutopsyStrategicIntelligenceSeedProjection['sensitivity'] => {
  switch (record.autopsy.sensitivity.visibility) {
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

export const projectAutopsyToStrategicIntelligenceSeed = (
  record: IAutopsyRecordSnapshot
): IAutopsyStrategicIntelligenceSeedProjection | null => {
  if (!isAutopsyPublishEligible(record)) {
    return null;
  }

  const mode = createAutopsyRedactionMode(record);
  if (mode === 'none') {
    return null;
  }

  const version = record.auditTrail.length
    ? {
        snapshotId: `${record.autopsy.autopsyId}:latest`,
        version: record.auditTrail.length,
      }
    : null;

  return {
    autopsyId: record.autopsy.autopsyId,
    title:
      mode === 'full'
        ? `Post-bid learning seed for ${record.autopsy.pursuitId}`
        : 'Post-bid learning seed (redacted)',
    body:
      mode === 'full'
        ? `Reasons: ${createAutopsyReasonCodes(record).join(', ')}`
        : redactAutopsyText(record, `Reasons: ${createAutopsyReasonCodes(record).join(', ')}`),
    sourceEvidenceIds: record.autopsy.evidence.map((item) => item.evidenceId),
    rootCauseCodes: record.autopsy.rootCauseTags.map((item) => item.normalizedCode),
    sensitivity: mapSensitivity(record),
    redacted: mode !== 'full',
    publishEnvelope: createAutopsyPublishEnvelope(record),
    version,
  };
};
