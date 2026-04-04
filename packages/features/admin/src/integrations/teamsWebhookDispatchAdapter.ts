import type { IAdminAlert } from '../types/IAdminAlert.js';
import type { AlertSeverity } from '../types/AlertSeverity.js';
import type { IAdminNotificationEvent, INotificationDispatchAdapter } from './notificationDispatchAdapter.js';
import { routeAlert } from '../monitors/notificationRouter.js';

/**
 * Configuration for the Teams webhook dispatch adapter.
 *
 * @design G6-T04, P12-09
 */
export interface TeamsWebhookConfig {
  /** Teams Incoming Webhook URL. When absent, webhook delivery is skipped. */
  webhookUrl?: string;
  /** Digest email relay address (e.g. alert-relay@example.com). Wave 0: logged only. */
  emailRelay?: string;
}

/**
 * Delivery status record for a dispatched notification.
 *
 * @design P12-09
 */
export interface INotificationDeliveryRecord {
  readonly alertId: string;
  readonly route: 'immediate' | 'digest';
  readonly channel: 'teams-webhook' | 'email-relay' | 'console';
  readonly status: 'delivered' | 'failed' | 'suppressed' | 'skipped';
  readonly dispatchedAt: string;
  readonly reason?: string;
}

/**
 * Notification dispatch adapter that routes alerts to Microsoft Teams
 * via Incoming Webhook and queues digest alerts for email relay.
 *
 * **Phase 12 hardening (P12-09):**
 * - Delivery status tracking via `getDeliveryLog()`.
 * - Notification suppression: acknowledged alerts are not re-dispatched
 *   unless severity has escalated since acknowledgment.
 * - Duplicate suppression: same alertId is not dispatched within a
 *   configurable cooldown window (default 5 minutes).
 *
 * **Remaining limitations:**
 * - Webhook delivery is fire-and-forget (no retry queue).
 * - Email relay is console-logged only (no SMTP client).
 *
 * @design G6-T04, P12-09
 */
export class TeamsWebhookDispatchAdapter implements INotificationDispatchAdapter {
  private readonly deliveryLog: INotificationDeliveryRecord[] = [];
  private readonly recentDispatches = new Map<string, number>();

  /** Cooldown period for duplicate suppression: 5 minutes. */
  private static readonly COOLDOWN_MS = 5 * 60 * 1000;

  constructor(private readonly config: TeamsWebhookConfig = {}) {}

  dispatch(
    alert: IAdminAlert,
    previousSeverity?: AlertSeverity,
  ): IAdminNotificationEvent {
    const route = routeAlert(alert, previousSeverity);
    const now = new Date().toISOString();
    const event: IAdminNotificationEvent = {
      alert,
      route,
      dispatchedAt: now,
    };

    // P12-09: Suppress re-notification for acknowledged alerts unless severity escalated
    if (alert.acknowledgedAt && !this.hasSeverityEscalated(alert, previousSeverity)) {
      this.recordDelivery(alert.alertId, route, 'console', 'suppressed', now, 'acknowledged-not-escalated');
      return event;
    }

    // P12-09: Duplicate suppression within cooldown window
    if (this.isWithinCooldown(alert.alertId)) {
      this.recordDelivery(alert.alertId, route, 'console', 'suppressed', now, 'cooldown-active');
      return event;
    }

    // Mark as dispatched for cooldown tracking
    this.recentDispatches.set(alert.alertId, Date.now());

    if (route === 'immediate') {
      if (this.config.webhookUrl) {
        this.postToTeams(alert)
          .then(() => {
            this.recordDelivery(alert.alertId, route, 'teams-webhook', 'delivered', now);
          })
          .catch((err) => {
            const reason = err instanceof Error ? err.message : String(err);
            console.error('[TeamsWebhookDispatchAdapter] webhook failed:', err);
            this.recordDelivery(alert.alertId, route, 'teams-webhook', 'failed', now, reason);
          });
      } else {
        console.warn(
          '[TeamsWebhookDispatchAdapter] immediate alert (no webhook configured):',
          alert.alertId,
        );
        this.recordDelivery(alert.alertId, route, 'console', 'skipped', now, 'no-webhook-configured');
      }
    }

    if (route === 'digest') {
      const target = this.config.emailRelay ?? '(no relay configured)';
      console.info(
        `[TeamsWebhookDispatchAdapter] digest queued for ${target}:`,
        alert.alertId,
      );
      this.recordDelivery(alert.alertId, route, 'email-relay', 'skipped', now, 'email-relay-not-implemented');
    }

    return event;
  }

  /**
   * Get the delivery log for diagnostic/audit purposes.
   *
   * @design P12-09
   */
  getDeliveryLog(): readonly INotificationDeliveryRecord[] {
    return [...this.deliveryLog];
  }

  /**
   * Clear the cooldown cache and delivery log. Useful for testing.
   */
  reset(): void {
    this.deliveryLog.length = 0;
    this.recentDispatches.clear();
  }

  // ── Private ─────────────────────────────────────────────────────────────────

  private hasSeverityEscalated(
    alert: IAdminAlert,
    previousSeverity?: AlertSeverity,
  ): boolean {
    if (!previousSeverity) return false;
    const ranks: Record<string, number> = { critical: 4, high: 3, medium: 2, low: 1 };
    return (ranks[alert.severity] ?? 0) > (ranks[previousSeverity] ?? 0);
  }

  private isWithinCooldown(alertId: string): boolean {
    const lastDispatch = this.recentDispatches.get(alertId);
    if (!lastDispatch) return false;
    return (Date.now() - lastDispatch) < TeamsWebhookDispatchAdapter.COOLDOWN_MS;
  }

  private recordDelivery(
    alertId: string,
    route: 'immediate' | 'digest',
    channel: INotificationDeliveryRecord['channel'],
    status: INotificationDeliveryRecord['status'],
    dispatchedAt: string,
    reason?: string,
  ): void {
    this.deliveryLog.push({ alertId, route, channel, status, dispatchedAt, reason });
  }

  /** @internal Fire-and-forget Teams Adaptive Card post. */
  private async postToTeams(alert: IAdminAlert): Promise<void> {
    await fetch(this.config.webhookUrl!, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'message',
        attachments: [
          {
            contentType: 'application/vnd.microsoft.card.adaptive',
            contentUrl: null,
            content: {
              $schema: 'http://adaptivecards.io/schemas/adaptive-card.json',
              type: 'AdaptiveCard',
              version: '1.4',
              body: [
                {
                  type: 'TextBlock',
                  size: 'Medium',
                  weight: 'Bolder',
                  text: `[${alert.severity.toUpperCase()}] ${alert.title}`,
                },
                {
                  type: 'TextBlock',
                  text: alert.description,
                  wrap: true,
                },
                {
                  type: 'FactSet',
                  facts: [
                    { title: 'Category', value: alert.category },
                    { title: 'Entity', value: `${alert.affectedEntityType}:${alert.affectedEntityId}` },
                    { title: 'Time', value: alert.occurredAt },
                  ],
                },
              ],
              actions: alert.ctaHref
                ? [
                    {
                      type: 'Action.OpenUrl',
                      title: alert.ctaLabel ?? 'Open',
                      url: alert.ctaHref,
                    },
                  ]
                : [],
            },
          },
        ],
      }),
    });
  }
}
