import type { IProbeSnapshot } from '../types/IProbeSnapshot.js';

/**
 * API client for infrastructure probe snapshot management.
 *
 * Wave 0 implementation: in-memory `Map` store. Snapshots are persisted
 * by the probe scheduler and read by the dashboard. SharePoint-list–backed
 * persistence is the Wave 1 target (HBC_InfrastructureProbeSnapshots list).
 *
 * @design D-04, SF17-T03, G6-T06
 */
export class InfrastructureProbeApi {
  private readonly store = new Map<string, IProbeSnapshot>();
  private latestId: string | null = null;

  /**
   * Save a probe snapshot into the in-memory store.
   * Updates the latest snapshot pointer.
   */
  saveSnapshot(snapshot: IProbeSnapshot): void {
    this.store.set(snapshot.snapshotId, snapshot);
    if (
      !this.latestId ||
      Date.parse(snapshot.capturedAt) >=
        Date.parse(this.store.get(this.latestId)!.capturedAt)
    ) {
      this.latestId = snapshot.snapshotId;
    }
  }

  /**
   * Return the most recent probe snapshot, or null if none exists.
   */
  async getLatestSnapshot(): Promise<IProbeSnapshot | null> {
    if (!this.latestId) return null;
    return this.store.get(this.latestId) ?? null;
  }

  /**
   * Return all snapshots, optionally filtered to those whose `capturedAt`
   * falls within the given ISO-8601 range (inclusive).
   */
  async listSnapshots(range?: { from: string; to: string }): Promise<IProbeSnapshot[]> {
    const all = [...this.store.values()];
    if (!range) return all;
    const from = Date.parse(range.from);
    const to = Date.parse(range.to);
    return all.filter((s) => {
      const t = Date.parse(s.capturedAt);
      return t >= from && t <= to;
    });
  }

  /**
   * Return the latest snapshot for on-demand display.
   * Actual probe execution is ProbeScheduler's responsibility.
   */
  async runNow(): Promise<IProbeSnapshot> {
    if (this.latestId) {
      return this.store.get(this.latestId)!;
    }
    return {
      snapshotId: `on-demand-${new Date().toISOString()}`,
      capturedAt: new Date().toISOString(),
      results: [],
    };
  }
}
