/**
 * P3-E6-T07 Platform Integration TypeScript contracts.
 */

import type {
  ConstraintsActivityEventType,
  ConstraintsHandoffType,
  ConstraintsHealthMetricName,
  ConstraintsNotificationType,
  ConstraintsReportType,
  ConstraintsWorkItemType,
  ConstraintsWorkQueueItemType,
  IntegrationStateSource,
} from './enums.js';
import type { LedgerType } from '../lineage/enums.js';

// ── Shared Package Integration (§7.1) ───────────────────────────────

export interface ISharedPackageIntegration {
  readonly packageName: string;
  readonly integrationPoint: string;
  readonly stateMode: IntegrationStateSource;
  readonly notes: string;
}

// ── Workflow Handoff (§7.2) ─────────────────────────────────────────

export interface IConstraintsHandoffConfig {
  readonly handoffType: ConstraintsHandoffType;
  readonly trigger: string;
  readonly recipient: string;
}

// ── Notification (§7.3) ─────────────────────────────────────────────

export interface IConstraintsNotificationConfig {
  readonly notificationType: ConstraintsNotificationType;
  readonly trigger: string;
  readonly defaultRecipients: string;
}

// ── Work Item (§7.4) ────────────────────────────────────────────────

export interface IConstraintsWorkItemConfig {
  readonly workItemType: ConstraintsWorkItemType;
  readonly condition: string;
  readonly actor: string;
}

// ── Activity Spine Event (§7.5) ─────────────────────────────────────

export interface IConstraintsActivityEventConfig {
  readonly eventType: ConstraintsActivityEventType;
  readonly trigger: string;
  readonly payloadFields: readonly string[];
}

// ── Health Spine Metric (§7.5) ──────────────────────────────────────

export interface IConstraintsHealthMetricConfig {
  readonly metricName: ConstraintsHealthMetricName;
  readonly ledger: LedgerType;
  readonly updateFrequency: string;
}

// ── Work Queue (§7.5) ──────────────────────────────────────────────

export interface IConstraintsWorkQueueConfig {
  readonly itemType: ConstraintsWorkQueueItemType;
  readonly trigger: string;
  readonly priority: string;
}

// ── Report (§7.6) ──────────────────────────────────────────────────

export interface IConstraintsReportConfig {
  readonly reportType: ConstraintsReportType;
  readonly description: string;
  readonly stateSource: IntegrationStateSource;
}
