/**
 * P3-E14-T10 Stage 8 Project Warranty Module reports-publication TypeScript contracts.
 */

import type {
  WarrantyActivityEventKey,
  WarrantyHealthBand,
  WarrantyHealthMetricKey,
  WarrantyReportDesignationKey,
  WarrantyTelemetryEventKey,
  WarrantyWorkQueuePriority,
  WarrantyWorkQueueRuleId,
} from './enums.js';

export interface IWarrantyActivityEventDef {
  readonly eventKey: WarrantyActivityEventKey;
  readonly trigger: string;
  readonly actor: string;
}

export interface IWarrantyHealthMetricDef {
  readonly metricKey: WarrantyHealthMetricKey;
  readonly definition: string;
  readonly category: 'Leading' | 'Lagging' | 'RecurringFailure';
}

export interface IWarrantyWorkQueueRuleDef {
  readonly ruleId: WarrantyWorkQueueRuleId;
  readonly triggerCondition: string;
  readonly recipient: string;
  readonly priority: WarrantyWorkQueuePriority;
  readonly dismissible: boolean;
}

export interface IWarrantyReportDesignationDef {
  readonly reportKey: WarrantyReportDesignationKey;
  readonly classification: string;
  readonly refresh: string;
}

export interface IWarrantyHealthBandDef {
  readonly band: WarrantyHealthBand;
  readonly condition: string;
}

export interface IWarrantyTelemetryEventDef {
  readonly eventKey: WarrantyTelemetryEventKey;
  readonly trigger: string;
  readonly category: string;
}
