import type { IAdminAlert } from '../types/IAdminAlert.js';
import type { AlertSeverity } from '../types/AlertSeverity.js';
import type { NotificationRoute } from '../types/NotificationRoute.js';
import type { IAdminNotificationEvent, INotificationDispatchAdapter } from './notificationDispatchAdapter.js';
import { routeAlert } from '../monitors/notificationRouter.js';

/**
 * Configuration for the Teams webhook dispatch adapter.
 *
 * @design G6-T04
 */
export interface TeamsWebhookConfig {
  /** Teams Incoming Webhook URL. When absent, webhook delivery is skipped. */
  webhookUrl?: string;
  /** Digest email relay address (e.g. alert-relay@example.com). Wave 0: logged only. */
  emailRelay?: string;
}

/**
 * Notification dispatch adapter that routes alerts to Microsoft Teams
 * via Incoming Webhook and queues digest alerts for email relay.
 *
 * **Wave 0 limitations:**
 * - Webhook delivery is best-effort fire-and-forget.
 * - Email relay is console-logged only (no SMTP client).
 * - If `webhookUrl` is not configured, immediate alerts are console-logged.
 *
 * @design G6-T04
 */
export class TeamsWebhookDispatchAdapter implements INotificationDispatchAdapter {
  constructor(private readonly config: TeamsWebhookConfig = {}) {}

  dispatch(
    alert: IAdminAlert,
    previousSeverity?: AlertSeverity,
  ): IAdminNotificationEvent {
    const route = routeAlert(alert, previousSeverity);
    const event: IAdminNotificationEvent = {
      alert,
      route,
      dispatchedAt: new Date().toISOString(),
    };

    if (route === 'immediate') {
      if (this.config.webhookUrl) {
        this.postToTeams(alert).catch((err) =>
          console.error('[TeamsWebhookDispatchAdapter] webhook failed:', err),
        );
      } else {
        console.warn(
          '[TeamsWebhookDispatchAdapter] immediate alert (no webhook configured):',
          alert.alertId,
        );
      }
    }

    if (route === 'digest') {
      const target = this.config.emailRelay ?? '(no relay configured)';
      console.info(
        `[TeamsWebhookDispatchAdapter] digest queued for ${target}:`,
        alert.alertId,
      );
    }

    return event;
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
