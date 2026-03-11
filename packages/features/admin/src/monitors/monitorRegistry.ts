import type { AlertCategory } from '../types/AlertCategory.js';
import type { IAdminAlert } from '../types/IAdminAlert.js';
import type { IAlertMonitor } from '../types/IAlertMonitor.js';

/**
 * Central registry for Admin Intelligence alert monitors.
 * Provides deterministic ordering, deduplication, and bulk execution.
 *
 * @design D-02, SF17-T03
 */
export class MonitorRegistry {
  private readonly monitors = new Map<AlertCategory, IAlertMonitor>();
  private readonly insertionOrder: AlertCategory[] = [];

  get size(): number {
    return this.monitors.size;
  }

  register(monitor: IAlertMonitor): void {
    if (this.monitors.has(monitor.key)) {
      throw new Error(`MonitorRegistry: duplicate key "${monitor.key}"`);
    }
    this.monitors.set(monitor.key, monitor);
    this.insertionOrder.push(monitor.key);
  }

  get(key: AlertCategory): IAlertMonitor | undefined {
    return this.monitors.get(key);
  }

  getAll(): readonly IAlertMonitor[] {
    return this.insertionOrder.map((k) => this.monitors.get(k)!);
  }

  async runAll(nowIso: string): Promise<IAdminAlert[]> {
    const ordered = this.getAll();
    const results: IAdminAlert[] = [];
    for (const monitor of ordered) {
      const alerts = await monitor.run(nowIso);
      results.push(...alerts);
    }
    return results;
  }

  deduplicateAlerts(alerts: readonly IAdminAlert[]): IAdminAlert[] {
    const seen = new Set<string>();
    const deduplicated: IAdminAlert[] = [];
    for (const alert of alerts) {
      const monitor = this.monitors.get(alert.category);
      if (!monitor) {
        deduplicated.push(alert);
        continue;
      }
      const key = monitor.dedupeKey(alert);
      if (!seen.has(key)) {
        seen.add(key);
        deduplicated.push(alert);
      }
    }
    return deduplicated;
  }
}
