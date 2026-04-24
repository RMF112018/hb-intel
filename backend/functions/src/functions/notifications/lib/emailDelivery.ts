/**
 * SendGrid email integration — thin adapter.
 *
 * Phase 1: logs the email payload and returns.
 * Real SendGrid integration deferred to infrastructure deployment
 * (requires SENDGRID_API_KEY env var).
 *
 * SF10-T08 — D-01: Email delivery channel, D-06: Digest email.
 */

import type { INotificationEvent } from '@hbc/notification-intelligence';

export interface ImmediateEmailPayload {
  recipientUserId: string;
  title: string;
  body: string;
  actionUrl: string;
  actionLabel?: string;
}

export interface DigestEmailPayload {
  recipientUserId: string;
  items: INotificationEvent[];
}

export const emailDelivery = {
  async sendImmediate(payload: ImmediateEmailPayload): Promise<void> {
    // Phase 1 stub: log and return. Real @sendgrid/mail integration
    // will be added when SENDGRID_API_KEY is configured.
    console.log('[emailDelivery.sendImmediate] Phase 1 stub — payload:', JSON.stringify(payload));
  },

  async sendDigest(payload: DigestEmailPayload): Promise<void> {
    // Phase 1 stub: log and return.
    console.log(
      `[emailDelivery.sendDigest] Phase 1 stub — userId: ${payload.recipientUserId}, items: ${payload.items.length}`,
    );
  },
};
