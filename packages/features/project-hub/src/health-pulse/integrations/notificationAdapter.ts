import type { NotificationSendPayload, NotificationTier } from '@hbc/notification-intelligence';

import type { ICompoundRiskSignal, IProjectHealthPulse } from '../types/index.js';
import {
  confidenceTierToNotificationTier,
  statusToNotificationTier,
  toStableProjectionId,
} from './helpers.js';

export interface IProjectHealthNotificationProjection {
  dedupeKey: string;
  tier: NotificationTier;
  reasonCode: string;
  confidenceTier: IProjectHealthPulse['overallConfidence']['tier'];
  payload: NotificationSendPayload;
}

export interface IProjectHealthNotificationProjectionInput {
  pulse: IProjectHealthPulse;
  recipientUserId: string;
  projectName: string;
  actionUrl: string;
  includeTriagePriority?: boolean;
}

const toSeverityTier = (severity: ICompoundRiskSignal['severity']): NotificationTier => {
  if (severity === 'critical') return 'immediate';
  if (severity === 'high' || severity === 'moderate') return 'watch';
  return 'digest';
};

const createPayload = (
  input: IProjectHealthNotificationProjectionInput,
  eventType: string,
  tier: NotificationTier,
  title: string,
  body: string,
  reasonCode: string
): IProjectHealthNotificationProjection => {
  return {
    dedupeKey: toStableProjectionId('health-pulse-notification', input.pulse.projectId, `${eventType}:${reasonCode}`),
    tier,
    reasonCode,
    confidenceTier: input.pulse.overallConfidence.tier,
    payload: {
      eventType,
      sourceModule: 'project-health-pulse',
      sourceRecordType: 'project-health-pulse',
      sourceRecordId: input.pulse.projectId,
      recipientUserId: input.recipientUserId,
      title,
      body,
      actionUrl: input.actionUrl,
      actionLabel: 'Open Pulse',
    },
  };
};

export const projectHealthPulseToNotificationPayloads = (
  input: IProjectHealthNotificationProjectionInput
): IProjectHealthNotificationProjection[] => {
  const { pulse } = input;
  const projections: IProjectHealthNotificationProjection[] = [];
  const statusTier = statusToNotificationTier(pulse.overallStatus);

  if (pulse.overallStatus === 'critical' || pulse.overallStatus === 'at-risk') {
    projections.push(
      createPayload(
        input,
        'project-health-pulse.status-escalation',
        statusTier,
        `${input.projectName} health is ${pulse.overallStatus}`,
        `Overall score ${pulse.overallScore} with confidence ${pulse.overallConfidence.tier}.`,
        `status:${pulse.overallStatus}`
      )
    );
  }

  for (const risk of pulse.compoundRisks) {
    projections.push(
      createPayload(
        input,
        'project-health-pulse.compound-risk',
        toSeverityTier(risk.severity),
        `${input.projectName} compound risk: ${risk.code}`,
        risk.summary,
        `compound-risk:${risk.code}:${risk.severity}`
      )
    );
  }

  if (pulse.overallConfidence.tier === 'low' || pulse.overallConfidence.tier === 'unreliable') {
    projections.push(
      createPayload(
        input,
        'project-health-pulse.confidence-degradation',
        confidenceTierToNotificationTier(pulse.overallConfidence.tier),
        `${input.projectName} confidence is ${pulse.overallConfidence.tier}`,
        pulse.overallConfidence.reasons.join(' ') || 'Confidence quality degraded.',
        `confidence:${pulse.overallConfidence.tier}`
      )
    );
  }

  if (input.includeTriagePriority && pulse.triage.bucket === 'attention-now') {
    projections.push(
      createPayload(
        input,
        'project-health-pulse.triage-priority',
        pulse.overallStatus === 'critical' ? 'immediate' : 'watch',
        `${input.projectName} triage bucket is attention-now`,
        pulse.triage.triageReasons.join(' ') || 'Triage priority escalation detected.',
        `triage:${pulse.triage.bucket}`
      )
    );
  }

  const deduped = new Map<string, IProjectHealthNotificationProjection>();
  for (const item of projections) {
    if (!deduped.has(item.dedupeKey)) {
      deduped.set(item.dedupeKey, item);
    }
  }

  return Array.from(deduped.values());
};
