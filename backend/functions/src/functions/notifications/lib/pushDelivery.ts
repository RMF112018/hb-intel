/**
 * Azure Notification Hubs integration — thin adapter.
 *
 * Phase 1: logs the push payload and returns.
 * Real Azure Notification Hubs integration deferred to infrastructure deployment.
 *
 * SF10-T08 — D-01: Push delivery channel.
 */

export interface PushPayload {
  userId: string;
  title: string;
  body: string;
  data: Record<string, string>;
}

export const pushDelivery = {
  async send(payload: PushPayload): Promise<void> {
    // Phase 1 stub: log and return. Real Azure Notification Hubs SDK
    // integration will be added when infrastructure is deployed.
    console.log('[pushDelivery] Phase 1 stub — payload:', JSON.stringify(payload));
  },
};
