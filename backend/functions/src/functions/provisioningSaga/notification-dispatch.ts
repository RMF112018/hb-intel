/**
 * W0-G1-T03: Non-blocking notification dispatch for provisioning saga events.
 * Resolves recipients by role group and dispatches via INotificationService.
 * Pattern: D-PH6-06 non-blocking `.catch()` — notifications must never fail the saga.
 */
import type { ILogger } from '../../utils/logger.js';
import type { IServiceContainer } from '../../services/service-factory.js';
import type { IProvisioningStatus } from '@hbc/models';

type RecipientGroup = 'submitter' | 'controller' | 'group' | 'admin';

interface NotificationDispatchParams {
  eventType: string;
  title: string;
  body: string;
  actionUrl: string;
  actionLabel?: string;
  sourceRecordId: string;
  recipientGroups: RecipientGroup[];
  status: IProvisioningStatus;
}

/**
 * Resolves a recipient group to an array of UPNs, using request data and env vars.
 * Deduplicates across groups (e.g., if submitter is also in groupMembers, one notification).
 */
export function resolveRecipients(
  groups: RecipientGroup[],
  status: IProvisioningStatus,
): string[] {
  const upnSet = new Set<string>();

  for (const group of groups) {
    switch (group) {
      case 'submitter':
        if (status.submittedBy) upnSet.add(status.submittedBy);
        break;
      case 'controller': {
        const controllerUpns = process.env.CONTROLLER_UPNS?.split(',').map((u) => u.trim()).filter(Boolean) ?? [];
        for (const upn of controllerUpns) upnSet.add(upn);
        break;
      }
      case 'group':
        for (const upn of status.groupMembers ?? []) upnSet.add(upn);
        for (const upn of status.groupLeaders ?? []) upnSet.add(upn);
        break;
      case 'admin': {
        const adminUpns = process.env.ADMIN_UPNS?.split(',').map((u) => u.trim()).filter(Boolean) ?? [];
        for (const upn of adminUpns) upnSet.add(upn);
        break;
      }
    }
  }

  return Array.from(upnSet);
}

/**
 * Dispatches a provisioning notification to all resolved recipients.
 * Non-blocking: each send is fire-and-forget with warning-level logging on failure.
 */
export function dispatchProvisioningNotification(
  services: IServiceContainer,
  logger: ILogger,
  params: NotificationDispatchParams,
): void {
  const recipients = resolveRecipients(params.recipientGroups, params.status);

  if (recipients.length === 0) {
    logger.warn('dispatchProvisioningNotification: no recipients resolved', {
      eventType: params.eventType,
      correlationId: params.status.correlationId,
      recipientGroups: params.recipientGroups.join(','),
    });
    return;
  }

  for (const recipientUserId of recipients) {
    services.notifications.send({
      eventType: params.eventType,
      sourceModule: 'provisioning',
      sourceRecordType: 'ProvisioningStatus',
      sourceRecordId: params.sourceRecordId,
      recipientUserId,
      title: params.title,
      body: params.body,
      actionUrl: params.actionUrl,
      actionLabel: params.actionLabel,
    }).catch((err) => {
      // D-PH6-06: notification delivery is non-blocking.
      logger.warn('Non-critical: notification dispatch failed', {
        eventType: params.eventType,
        recipientUserId,
        correlationId: params.status.correlationId,
        error: err instanceof Error ? err.message : String(err),
      });
    });
  }
}
