import type { IAutopsyRecordSnapshot, IAutopsyRecalibrationSignal } from '../types/index.js';
import { createAutopsyPublishEnvelope, createAutopsyReasonCodes, isAutopsyPublishEligible } from './helpers.js';

export interface IAutopsyScoreBenchmarkProjection {
  readonly benchmarkSignalId: string;
  readonly autopsyId: string;
  readonly publishEnvelope: ReturnType<typeof createAutopsyPublishEnvelope>;
  readonly recalibrationSignal: IAutopsyRecalibrationSignal;
  readonly reasonCodes: readonly string[];
}

export const projectAutopsyToScoreBenchmarkSignal = (
  record: IAutopsyRecordSnapshot
): IAutopsyScoreBenchmarkProjection | null => {
  if (!isAutopsyPublishEligible(record)) {
    return null;
  }

  const reasonCodes = createAutopsyReasonCodes(record);

  return {
    benchmarkSignalId: `benchmark:${record.autopsy.autopsyId}`,
    autopsyId: record.autopsy.autopsyId,
    publishEnvelope: createAutopsyPublishEnvelope(record),
    recalibrationSignal: {
      signalId: `recalibration:${record.autopsy.autopsyId}`,
      criterionId: record.autopsy.rootCauseTags[0]?.normalizedCode,
      predictiveDrift: Number((1 - record.autopsy.confidence.score).toFixed(2)),
      triggeredBy: 'sf22-outcome',
      correlationKeys: [...reasonCodes],
      triggeredAt: record.auditTrail.at(-1)?.occurredAt ?? record.sla.startedAt,
    },
    reasonCodes,
  };
};
