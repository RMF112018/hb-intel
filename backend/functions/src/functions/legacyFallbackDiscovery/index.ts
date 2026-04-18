import { app, type HttpRequest, type HttpResponseInit, type InvocationContext, type Timer } from '@azure/functions';
import { withAuth } from '../../middleware/auth.js';
import { extractOrGenerateRequestId } from '../../middleware/request-id.js';
import { requireAdmin, requireDelegatedScope } from '../../middleware/authorization.js';
import { errorResponse, successResponse } from '../../utils/response-helpers.js';
import { withTelemetry } from '../../utils/withTelemetry.js';
import { createLogger } from '../../utils/logger.js';
import {
  evaluateLegacyFallbackManualRerunPolicy,
  getLegacyFallbackDiscoveryConfig,
  getLegacyFallbackHostingConfig,
} from '../../services/legacy-fallback/hosting-config.js';
import type { LegacyProjectSourceYear } from '../../services/legacy-fallback/source-config.js';
import { LegacyFallbackDiscoveryGraphClient } from '../../services/legacy-fallback/discovery-graph-client.js';
import { LegacyFallbackDiscoveryRepository } from '../../services/legacy-fallback/discovery-repository.js';
import { LegacyFallbackDiscoveryService } from '../../services/legacy-fallback/discovery-service.js';
import { LegacyFallbackMatchingEngine } from '../../services/legacy-fallback/matching-engine.js';
import { LegacyFallbackProjectIndexProvider } from '../../services/legacy-fallback/project-index-provider.js';

const TIMER_SCHEDULE = process.env.HBC_LEGACY_FALLBACK_DISCOVERY_TIMER_SCHEDULE?.trim() || '0 0 2 * * *';

function parseYears(value: unknown): number[] {
  if (!Array.isArray(value)) {
    return [];
  }
  return value
    .map((entry) => Number(entry))
    .filter((year) => Number.isInteger(year) && year >= 2019 && year <= 2026);
}

function createService(context: InvocationContext): LegacyFallbackDiscoveryService {
  const hosting = getLegacyFallbackHostingConfig();
  const discovery = getLegacyFallbackDiscoveryConfig();
  if (!hosting.enabled || !discovery.enabled) {
    throw new Error('Legacy fallback discovery is disabled by configuration.');
  }

  const logger = createLogger(context);
  const graphClient = new LegacyFallbackDiscoveryGraphClient(hosting.graphScope);
  const repository = new LegacyFallbackDiscoveryRepository();
  const matchingEngine = new LegacyFallbackMatchingEngine();
  const projectIndexProvider = new LegacyFallbackProjectIndexProvider();
  return new LegacyFallbackDiscoveryService(graphClient, repository, matchingEngine, projectIndexProvider, logger);
}

app.http('legacyFallbackDiscoveryRun', {
  methods: ['POST'],
  authLevel: 'anonymous',
  route: 'admin/legacy-fallback/discovery/run',
  handler: withAuth(withTelemetry(async (request: HttpRequest, context: InvocationContext, auth): Promise<HttpResponseInit> => {
    const requestId = extractOrGenerateRequestId(request);
    const scopeDenied = requireDelegatedScope(auth.claims, requestId);
    if (scopeDenied) return scopeDenied;

    const adminDenied = requireAdmin(auth.claims, requestId);
    if (adminDenied) return adminDenied;

    try {
      const body = (await request.json()) as Record<string, unknown>;
      const discoveryConfig = getLegacyFallbackDiscoveryConfig();
      const repository = new LegacyFallbackDiscoveryRepository();
      const latestCompletedUtc = await repository.getLatestSyncRunCompletedUtc();
      const rerunPolicy = evaluateLegacyFallbackManualRerunPolicy(discoveryConfig, latestCompletedUtc);
      if (!rerunPolicy.allowed) {
        return errorResponse(429, 'LEGACY_FALLBACK_RERUN_BLOCKED', rerunPolicy.reason ?? 'Manual rerun blocked', requestId);
      }

      const service = createService(context);
      const dryRun = body.dryRun === true;
      const years = parseYears(body.years);
      const year = typeof body.year === 'number' ? body.year : Number(body.year);

      const resolvedYears = years.length > 0
        ? years
        : Number.isInteger(year) && year >= 2019 && year <= 2026
          ? [year]
          : undefined;

      const summary = await service.run({
        years: resolvedYears as LegacyProjectSourceYear[] | undefined,
        dryRun,
        matchAnomalyThreshold: discoveryConfig.matchAnomalyThreshold,
      });

      return successResponse(summary, 200);
    } catch (error) {
      return errorResponse(
        500,
        'LEGACY_FALLBACK_DISCOVERY_FAILED',
        error instanceof Error ? error.message : String(error),
        requestId,
      );
    }
  }, { domain: 'legacyFallback', operation: 'runDiscovery' })),
});

app.timer('legacyFallbackDiscoveryTimer', {
  schedule: TIMER_SCHEDULE,
  runOnStartup: false,
  handler: async (_timer: Timer, context: InvocationContext): Promise<void> => {
    const logger = createLogger(context);

    try {
      const discoveryConfig = getLegacyFallbackDiscoveryConfig();
      if (!discoveryConfig.enabled || !discoveryConfig.timerEnabled) {
        logger.info('Legacy fallback discovery timer skipped (disabled).', {
          timerEnabled: discoveryConfig.timerEnabled,
          enabled: discoveryConfig.enabled,
        });
        return;
      }

      const service = createService(context);
      const summary = await service.run({
        years: discoveryConfig.defaultYears,
        dryRun: false,
        maxFoldersPerRun: discoveryConfig.maxFoldersPerRun,
        matchAnomalyThreshold: discoveryConfig.matchAnomalyThreshold,
      });

      logger.info('Legacy fallback discovery timer run completed.', {
        runId: summary.runId,
        status: summary.status,
        foldersScanned: summary.foldersScanned,
        recordsCreated: summary.recordsCreated,
        recordsUpdated: summary.recordsUpdated,
      });
    } catch (error) {
      logger.error('Legacy fallback discovery timer failed.', {
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  },
});
