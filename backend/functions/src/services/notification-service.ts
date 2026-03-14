/**
 * W0-G1-T03: Notification service adapter (ports/adapters pattern).
 * Interface + real + mock in one file — matches msal-obo-service.ts pattern.
 */
import type { NotificationSendPayload } from '@hbc/notification-intelligence';

export interface INotificationService {
  send(payload: NotificationSendPayload): Promise<void>;
}

/**
 * Production implementation: HTTP POST to the internal SendNotification Azure Function.
 * Uses the functions host base URL from environment.
 */
export class NotificationService implements INotificationService {
  private readonly baseUrl: string;

  constructor() {
    // In Azure Functions, the host can call itself via localhost or via the configured base URL.
    this.baseUrl = process.env.NOTIFICATION_API_BASE_URL ?? 'http://localhost:7071';
  }

  async send(payload: NotificationSendPayload): Promise<void> {
    const url = `${this.baseUrl}/api/notifications/send`;
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(
        `NotificationService.send failed: ${response.status} ${response.statusText}`
      );
    }
  }
}

/**
 * Mock implementation for test/mock adapter mode. Logs payloads to console.
 */
export class MockNotificationService implements INotificationService {
  async send(payload: NotificationSendPayload): Promise<void> {
    console.log(
      `[MockNotificationService] send: eventType=${payload.eventType} recipient=${payload.recipientUserId} title="${payload.title}"`
    );
  }
}
