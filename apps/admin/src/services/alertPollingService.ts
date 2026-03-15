import {
  createDefaultMonitorRegistry,
  AdminAlertsApi,
  TeamsWebhookDispatchAdapter,
  ADMIN_ALERTS_POLL_MS,
} from '@hbc/features-admin';
import type { IProvisioningDataProvider, IAdminAlert } from '@hbc/features-admin';

/**
 * G6-T04: Configuration for the alert polling service.
 */
export interface AlertPollingServiceConfig {
  readonly provider: IProvisioningDataProvider;
  readonly teamsWebhookUrl?: string;
  readonly emailRelay?: string;
}

/**
 * G6-T04: Orchestrates monitor execution, alert ingestion, and dispatch.
 *
 * Lifecycle:
 * 1. `start()` — runs monitors immediately, then every `ADMIN_ALERTS_POLL_MS` (30s)
 * 2. Each cycle: `runAll()` → `deduplicateAlerts()` → `ingestAlerts()` → dispatch
 * 3. `stop()` — clears the polling interval
 *
 * Wave 0 limitation: alerts are in-memory only (no SharePoint persistence).
 * Teams webhook delivery is best-effort fire-and-forget.
 */
export class AlertPollingService {
  private readonly registry;
  private readonly alertsApi = new AdminAlertsApi();
  private readonly dispatcher;
  private intervalId: ReturnType<typeof setInterval> | null = null;

  constructor(config: AlertPollingServiceConfig) {
    this.registry = createDefaultMonitorRegistry(config.provider);
    this.dispatcher = new TeamsWebhookDispatchAdapter({
      webhookUrl: config.teamsWebhookUrl,
      emailRelay: config.emailRelay,
    });
  }

  /** The in-memory alert API backing the admin dashboards. */
  get api(): AdminAlertsApi {
    return this.alertsApi;
  }

  /**
   * Run all monitors once, ingest alerts, and dispatch notifications.
   * Returns the deduplicated alerts produced in this cycle.
   */
  async runOnce(): Promise<IAdminAlert[]> {
    const nowIso = new Date().toISOString();
    const raw = await this.registry.runAll(nowIso);
    const deduped = this.registry.deduplicateAlerts(raw);
    this.alertsApi.ingestAlerts(deduped);
    for (const alert of deduped) {
      this.dispatcher.dispatch(alert);
    }
    return deduped;
  }

  /** Start the polling loop. No-op if already running. */
  start(): void {
    if (this.intervalId) return;
    this.runOnce().catch((err) =>
      console.error('[AlertPollingService] initial run failed:', err),
    );
    this.intervalId = setInterval(() => {
      this.runOnce().catch((err) =>
        console.error('[AlertPollingService] poll cycle failed:', err),
      );
    }, ADMIN_ALERTS_POLL_MS);
  }

  /** Stop the polling loop and clear the interval. */
  stop(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }
}
