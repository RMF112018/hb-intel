import type { IAdminAlert } from '../types/IAdminAlert.js';

/**
 * API client for admin alert retrieval and acknowledgment.
 *
 * Wave 0 implementation: in-memory `Map` store. Alerts are ingested from
 * monitor runs and served to the admin dashboard. SharePoint-list–backed
 * persistence is the Wave 1 target (HBC_AdminAlerts list).
 *
 * @design D-02, SF17-T03, G6-T04
 */
export class AdminAlertsApi {
  private readonly store = new Map<string, IAdminAlert>();

  /**
   * Ingest alerts produced by monitor runs into the in-memory store.
   * Deduplicates by `alertId` — newer alerts overwrite older ones.
   */
  ingestAlerts(alerts: readonly IAdminAlert[]): void {
    for (const alert of alerts) {
      this.store.set(alert.alertId, alert);
    }
  }

  /**
   * Return all active (unacknowledged, unresolved) alerts.
   */
  async listActive(): Promise<IAdminAlert[]> {
    return [...this.store.values()].filter(
      (a) => a.acknowledgedAt === undefined && a.resolvedAt === undefined,
    );
  }

  /**
   * Acknowledge an alert by ID.
   * @throws {Error} If the alert does not exist in the store.
   */
  async acknowledge(alertId: string, acknowledgedBy: string): Promise<void> {
    const existing = this.store.get(alertId);
    if (!existing) {
      throw new Error(`AdminAlertsApi: alert "${alertId}" not found`);
    }
    this.store.set(alertId, {
      ...existing,
      acknowledgedAt: new Date().toISOString(),
      acknowledgedBy,
    });
  }

  /**
   * Return all alerts, optionally filtered to those whose `occurredAt`
   * falls within the given ISO-8601 range (inclusive).
   */
  async listHistory(range?: { from: string; to: string }): Promise<IAdminAlert[]> {
    const all = [...this.store.values()];
    if (!range) return all;
    const from = Date.parse(range.from);
    const to = Date.parse(range.to);
    return all.filter((a) => {
      const t = Date.parse(a.occurredAt);
      return t >= from && t <= to;
    });
  }
}
