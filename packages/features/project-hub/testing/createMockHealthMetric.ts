import type { IHealthMetric, IManualOverrideMetadata } from '../src/health-pulse/types/index.js';

type DeepPartial<T> = {
  [K in keyof T]?: T[K] extends Array<infer U>
    ? Array<DeepPartial<U>>
    : T[K] extends object
      ? DeepPartial<T[K]>
      : T[K];
};

const mergeManualOverride = (
  base: IManualOverrideMetadata | null | undefined,
  override: DeepPartial<IManualOverrideMetadata> | null | undefined
): IManualOverrideMetadata | null | undefined => {
  if (override === undefined) {
    return base;
  }

  if (override === null) {
    return null;
  }

  return {
    reason: override.reason ?? base?.reason ?? 'Manual governance correction',
    enteredBy: override.enteredBy ?? base?.enteredBy ?? 'health-pulse-user',
    enteredAt: override.enteredAt ?? base?.enteredAt ?? '2026-03-12T00:00:00.000Z',
    requiresApproval: override.requiresApproval ?? base?.requiresApproval,
    approvedBy: override.approvedBy ?? base?.approvedBy ?? null,
    approvedAt: override.approvedAt ?? base?.approvedAt ?? null,
  };
};

export const createMockHealthMetric = (
  overrides?: DeepPartial<IHealthMetric>
): IHealthMetric => {
  const base: IHealthMetric = {
    key: 'forecast-confidence',
    label: 'Forecast confidence',
    value: 82,
    isStale: false,
    isManualEntry: false,
    lastUpdatedAt: '2026-03-11T00:00:00.000Z',
    weight: 'leading',
    manualOverride: null,
  };

  return {
    ...base,
    ...overrides,
    manualOverride: mergeManualOverride(base.manualOverride, overrides?.manualOverride),
  };
};

export type { DeepPartial };
