/**
 * Hub source assembly — P2-C1, P2-C5 Blockers 1–7.
 *
 * Centralizes registration of all required sources for the Personal Work Hub:
 *   1. BIC module registrations (Gate 5 — Publication)
 *   2. Notification event registrations (Gate 6 — Signal)
 *   3. MyWork feed adapter assembly
 *
 * Called once during app bootstrap before rendering.
 * Each source follows the Provisioning reference pattern.
 */
import { registerBicModule } from '@hbc/bic-next-move';
import { NotificationRegistry } from '@hbc/notification-intelligence';
import { MyWorkRegistry, bicAdapter, notificationAdapter, handoffAdapter } from '@hbc/my-work-feed';
import {
  createProjectSetupBicRegistration,
  PROVISIONING_NOTIFICATION_REGISTRATIONS,
} from '@hbc/provisioning';
import {
  createEstimatingBidReadinessBicRegistration,
  ESTIMATING_NOTIFICATION_REGISTRATIONS,
} from '@hbc/features-estimating';
import {
  createBdScoreBenchmarkBicRegistration,
  BD_SCORE_BENCHMARK_NOTIFICATION_REGISTRATIONS,
  createBdStrategicIntelligenceBicRegistration,
  BD_STRATEGIC_INTELLIGENCE_NOTIFICATION_REGISTRATIONS,
} from '@hbc/features-business-development';
import {
  createProjectHealthPulseBicRegistration,
  PROJECT_HEALTH_PULSE_NOTIFICATION_REGISTRATIONS,
} from '@hbc/features-project-hub';

export function assembleHubSources(): void {
  // ── BIC module registrations (Gate 5 — Publication) ───────────────────
  // queryFn stubs return empty arrays until domain API clients are wired.
  // The registration structure is what satisfies P2-C5 Blockers 1–4.
  registerBicModule(createProjectSetupBicRegistration(async () => []));
  registerBicModule(createEstimatingBidReadinessBicRegistration(async () => []));
  registerBicModule(createBdScoreBenchmarkBicRegistration(async () => []));
  registerBicModule(createBdStrategicIntelligenceBicRegistration(async () => []));
  registerBicModule(createProjectHealthPulseBicRegistration(async () => []));

  // ── Notification registrations (Gate 6 — Signal) ─────────────────────
  // Satisfies P2-C5 Blockers 5–7.
  NotificationRegistry.register(PROVISIONING_NOTIFICATION_REGISTRATIONS);
  NotificationRegistry.register(ESTIMATING_NOTIFICATION_REGISTRATIONS);
  NotificationRegistry.register(BD_SCORE_BENCHMARK_NOTIFICATION_REGISTRATIONS);
  NotificationRegistry.register(BD_STRATEGIC_INTELLIGENCE_NOTIFICATION_REGISTRATIONS);
  NotificationRegistry.register(PROJECT_HEALTH_PULSE_NOTIFICATION_REGISTRATIONS);

  // ── MyWork feed adapter assembly ──────────────────────────────────────
  // Wires adapters that consume the BIC fan-out, notification center,
  // and handoff inbox into the aggregation feed.
  MyWorkRegistry.register([
    { source: 'bic-next-move', adapter: bicAdapter, rankingWeight: 0.9 },
    { source: 'notification-intelligence', adapter: notificationAdapter, rankingWeight: 0.5 },
    { source: 'workflow-handoff', adapter: handoffAdapter, rankingWeight: 0.8 },
  ]);
}
