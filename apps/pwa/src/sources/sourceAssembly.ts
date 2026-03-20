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
import { MyWorkRegistry, bicAdapter, notificationAdapter, handoffAdapter, acknowledgmentAdapter } from '@hbc/my-work-feed';
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
import {
  createEstimatingQueryFn,
  createBdScoreBenchmarkQueryFn,
  createBdStrategicIntelligenceQueryFn,
  createHealthPulseQueryFn,
} from './domainQueryFns.js';

export function assembleHubSources(): void {
  // ── BIC module registrations (Gate 5 — Publication) ───────────────────
  // Provisioning uses a stub queryFn (real API client wired separately).
  // The 4 domain sources use mock queryFns from domainQueryFns.ts that
  // produce representative items so the hub feed is exercisable in dev.
  // Replace with real domain API calls when clients are ready.
  registerBicModule(createProjectSetupBicRegistration(async () => []));
  registerBicModule(createEstimatingBidReadinessBicRegistration(createEstimatingQueryFn()));
  registerBicModule(createBdScoreBenchmarkBicRegistration(createBdScoreBenchmarkQueryFn()));
  registerBicModule(createBdStrategicIntelligenceBicRegistration(createBdStrategicIntelligenceQueryFn()));
  registerBicModule(createProjectHealthPulseBicRegistration(createHealthPulseQueryFn()));

  // ── Notification registrations (Gate 6 — Signal) ─────────────────────
  // Satisfies P2-C5 Blockers 5–7.
  NotificationRegistry.register(PROVISIONING_NOTIFICATION_REGISTRATIONS);
  NotificationRegistry.register(ESTIMATING_NOTIFICATION_REGISTRATIONS);
  NotificationRegistry.register(BD_SCORE_BENCHMARK_NOTIFICATION_REGISTRATIONS);
  NotificationRegistry.register(BD_STRATEGIC_INTELLIGENCE_NOTIFICATION_REGISTRATIONS);
  NotificationRegistry.register(PROJECT_HEALTH_PULSE_NOTIFICATION_REGISTRATIONS);

  // ── MyWork feed adapter assembly ──────────────────────────────────────
  // Wires all 4 required adapters (P2-C1 §3.1) that consume the BIC
  // fan-out, notification center, handoff inbox, and acknowledgment
  // queue into the aggregation feed.
  MyWorkRegistry.register([
    { source: 'bic-next-move', adapter: bicAdapter, rankingWeight: 0.9 },
    { source: 'workflow-handoff', adapter: handoffAdapter, rankingWeight: 0.8 },
    { source: 'acknowledgment', adapter: acknowledgmentAdapter, rankingWeight: 0.7 },
    { source: 'notification-intelligence', adapter: notificationAdapter, rankingWeight: 0.5 },
  ]);
}
