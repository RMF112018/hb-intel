import { app, type HttpRequest, type HttpResponseInit, type InvocationContext } from '@azure/functions';
import { withAuth } from '../../middleware/auth.js';
import { requireAdmin, requireDelegatedScope } from '../../middleware/authorization.js';
import { extractOrGenerateRequestId } from '../../middleware/request-id.js';
import { errorResponse, successResponse } from '../../utils/response-helpers.js';
import { withTelemetry } from '../../utils/withTelemetry.js';
import { createLogger } from '../../utils/logger.js';
import {
  evaluateLegacyFallbackManualRerunPolicy,
  getLegacyFallbackDiscoveryConfig,
  getLegacyFallbackHostingConfig,
} from '../../services/legacy-fallback/hosting-config.js';
import { LegacyFallbackDiscoveryGraphClient } from '../../services/legacy-fallback/discovery-graph-client.js';
import { LegacyFallbackDiscoveryRepository } from '../../services/legacy-fallback/discovery-repository.js';
import { LegacyFallbackDiscoveryService } from '../../services/legacy-fallback/discovery-service.js';
import { LegacyFallbackMatchingEngine } from '../../services/legacy-fallback/matching-engine.js';
import { LegacyFallbackProjectIndexProvider } from '../../services/legacy-fallback/project-index-provider.js';
import { LegacyFallbackReviewRepository } from '../../services/legacy-fallback/review-repository.js';
import { LegacyFallbackReviewService } from '../../services/legacy-fallback/review-service.js';

function parseBool(value: string | null): boolean | undefined {
  if (value === null) return undefined;
  const normalized = value.trim().toLowerCase();
  if (['1', 'true', 'yes'].includes(normalized)) return true;
  if (['0', 'false', 'no'].includes(normalized)) return false;
  return undefined;
}

function parseYear(value: unknown): number | null {
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed < 2019 || parsed > 2026) {
    return null;
  }
  return parsed;
}

function createReviewService(): LegacyFallbackReviewService {
  return new LegacyFallbackReviewService(new LegacyFallbackReviewRepository());
}

function createDiscoveryService(context: InvocationContext): LegacyFallbackDiscoveryService {
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

app.http('adminLegacyFallbackReviewList', {
  methods: ['GET'],
  authLevel: 'anonymous',
  route: 'admin/legacy-fallback/review/records',
  handler: withAuth(withTelemetry(async (request: HttpRequest, _context: InvocationContext, auth): Promise<HttpResponseInit> => {
    const requestId = extractOrGenerateRequestId(request);
    const scopeDenied = requireDelegatedScope(auth.claims, requestId);
    if (scopeDenied) return scopeDenied;
    const adminDenied = requireAdmin(auth.claims, requestId);
    if (adminDenied) return adminDenied;

    try {
      const service = createReviewService();
      const result = await service.listRecords({
        status: (request.query.get('status') ?? undefined) as
          | 'matched'
          | 'unmatched'
          | 'review-required'
          | 'ignored'
          | 'disabled'
          | undefined,
        confidence: (request.query.get('confidence') ?? undefined) as 'high' | 'medium' | 'low' | 'none' | undefined,
        year: parseYear(request.query.get('year') ?? undefined) ?? undefined,
        isActive: parseBool(request.query.get('isActive')),
        queueOnly: parseBool(request.query.get('queueOnly')),
        search: request.query.get('search') ?? undefined,
      });
      return successResponse(result);
    } catch (error) {
      return errorResponse(
        500,
        'LEGACY_FALLBACK_REVIEW_LIST_FAILED',
        error instanceof Error ? error.message : String(error),
        requestId,
      );
    }
  }, { domain: 'legacyFallback', operation: 'reviewListRecords' })),
});

app.http('adminLegacyFallbackReviewGetRecord', {
  methods: ['GET'],
  authLevel: 'anonymous',
  route: 'admin/legacy-fallback/review/records/{recordId}',
  handler: withAuth(withTelemetry(async (request: HttpRequest, _context: InvocationContext, auth): Promise<HttpResponseInit> => {
    const requestId = extractOrGenerateRequestId(request);
    const scopeDenied = requireDelegatedScope(auth.claims, requestId);
    if (scopeDenied) return scopeDenied;
    const adminDenied = requireAdmin(auth.claims, requestId);
    if (adminDenied) return adminDenied;

    const recordId = Number.parseInt(request.params.recordId ?? '', 10);
    if (!Number.isInteger(recordId) || recordId <= 0) {
      return errorResponse(400, 'VALIDATION_ERROR', 'recordId must be a positive integer', requestId);
    }

    try {
      const service = createReviewService();
      const record = await service.getRecord(recordId);
      return successResponse(record);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      if (message.includes('not found')) {
        return errorResponse(404, 'NOT_FOUND', message, requestId);
      }
      return errorResponse(500, 'LEGACY_FALLBACK_REVIEW_GET_FAILED', message, requestId);
    }
  }, { domain: 'legacyFallback', operation: 'reviewGetRecord' })),
});

app.http('adminLegacyFallbackReviewManualBind', {
  methods: ['POST'],
  authLevel: 'anonymous',
  route: 'admin/legacy-fallback/review/records/{recordId}/bind',
  handler: withAuth(withTelemetry(async (request: HttpRequest, _context: InvocationContext, auth): Promise<HttpResponseInit> => {
    const requestId = extractOrGenerateRequestId(request);
    const scopeDenied = requireDelegatedScope(auth.claims, requestId);
    if (scopeDenied) return scopeDenied;
    const adminDenied = requireAdmin(auth.claims, requestId);
    if (adminDenied) return adminDenied;

    const recordId = Number.parseInt(request.params.recordId ?? '', 10);
    if (!Number.isInteger(recordId) || recordId <= 0) {
      return errorResponse(400, 'VALIDATION_ERROR', 'recordId must be a positive integer', requestId);
    }

    const body = (await request.json()) as Record<string, unknown>;
    const matchedProjectListItemId = Number(body.matchedProjectListItemId);
    const matchedProjectTitle = typeof body.matchedProjectTitle === 'string' ? body.matchedProjectTitle.trim() : '';
    if (!Number.isInteger(matchedProjectListItemId) || matchedProjectListItemId <= 0) {
      return errorResponse(400, 'VALIDATION_ERROR', 'matchedProjectListItemId must be a positive integer', requestId);
    }
    if (!matchedProjectTitle) {
      return errorResponse(400, 'VALIDATION_ERROR', 'matchedProjectTitle is required', requestId);
    }

    try {
      const service = createReviewService();
      const updated = await service.manualBind({
        recordId,
        matchedProjectListItemId,
        matchedProjectTitle,
        notes: typeof body.notes === 'string' ? body.notes : undefined,
        actorUpn: auth.claims.upn,
      });
      return successResponse(updated);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      if (message.includes('not found')) {
        return errorResponse(404, 'NOT_FOUND', message, requestId);
      }
      return errorResponse(500, 'LEGACY_FALLBACK_MANUAL_BIND_FAILED', message, requestId);
    }
  }, { domain: 'legacyFallback', operation: 'reviewManualBind' })),
});

app.http('adminLegacyFallbackReviewIgnore', {
  methods: ['POST'],
  authLevel: 'anonymous',
  route: 'admin/legacy-fallback/review/records/{recordId}/ignore',
  handler: withAuth(withTelemetry(async (request: HttpRequest, _context: InvocationContext, auth): Promise<HttpResponseInit> => {
    const requestId = extractOrGenerateRequestId(request);
    const scopeDenied = requireDelegatedScope(auth.claims, requestId);
    if (scopeDenied) return scopeDenied;
    const adminDenied = requireAdmin(auth.claims, requestId);
    if (adminDenied) return adminDenied;

    const recordId = Number.parseInt(request.params.recordId ?? '', 10);
    if (!Number.isInteger(recordId) || recordId <= 0) {
      return errorResponse(400, 'VALIDATION_ERROR', 'recordId must be a positive integer', requestId);
    }

    const body = (await request.json()) as Record<string, unknown>;

    try {
      const service = createReviewService();
      const updated = await service.ignoreRecord({
        recordId,
        notes: typeof body.notes === 'string' ? body.notes : undefined,
        actorUpn: auth.claims.upn,
      });
      return successResponse(updated);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      if (message.includes('not found')) {
        return errorResponse(404, 'NOT_FOUND', message, requestId);
      }
      return errorResponse(500, 'LEGACY_FALLBACK_IGNORE_FAILED', message, requestId);
    }
  }, { domain: 'legacyFallback', operation: 'reviewIgnoreRecord' })),
});

app.http('adminLegacyFallbackReviewDisable', {
  methods: ['POST'],
  authLevel: 'anonymous',
  route: 'admin/legacy-fallback/review/records/{recordId}/disable',
  handler: withAuth(withTelemetry(async (request: HttpRequest, _context: InvocationContext, auth): Promise<HttpResponseInit> => {
    const requestId = extractOrGenerateRequestId(request);
    const scopeDenied = requireDelegatedScope(auth.claims, requestId);
    if (scopeDenied) return scopeDenied;
    const adminDenied = requireAdmin(auth.claims, requestId);
    if (adminDenied) return adminDenied;

    const recordId = Number.parseInt(request.params.recordId ?? '', 10);
    if (!Number.isInteger(recordId) || recordId <= 0) {
      return errorResponse(400, 'VALIDATION_ERROR', 'recordId must be a positive integer', requestId);
    }

    const body = (await request.json()) as Record<string, unknown>;

    try {
      const service = createReviewService();
      const updated = await service.disableRecord({
        recordId,
        notes: typeof body.notes === 'string' ? body.notes : undefined,
        actorUpn: auth.claims.upn,
      });
      return successResponse(updated);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      if (message.includes('not found')) {
        return errorResponse(404, 'NOT_FOUND', message, requestId);
      }
      return errorResponse(500, 'LEGACY_FALLBACK_DISABLE_FAILED', message, requestId);
    }
  }, { domain: 'legacyFallback', operation: 'reviewDisableRecord' })),
});

app.http('adminLegacyFallbackReviewRevalidate', {
  methods: ['POST'],
  authLevel: 'anonymous',
  route: 'admin/legacy-fallback/review/revalidate',
  handler: withAuth(withTelemetry(async (request: HttpRequest, context: InvocationContext, auth): Promise<HttpResponseInit> => {
    const requestId = extractOrGenerateRequestId(request);
    const scopeDenied = requireDelegatedScope(auth.claims, requestId);
    if (scopeDenied) return scopeDenied;
    const adminDenied = requireAdmin(auth.claims, requestId);
    if (adminDenied) return adminDenied;

    const body = (await request.json()) as Record<string, unknown>;
    const recordId = body.recordId !== undefined ? Number(body.recordId) : null;
    const explicitYear = parseYear(body.year);

    let year: number | null = explicitYear;
    try {
      if (year === null && recordId !== null) {
        if (!Number.isInteger(recordId) || recordId <= 0) {
          return errorResponse(400, 'VALIDATION_ERROR', 'recordId must be a positive integer', requestId);
        }
        const reviewService = createReviewService();
        const record = await reviewService.getRecord(recordId);
        year = record.legacyYear;
      }

      if (year === null) {
        return errorResponse(400, 'VALIDATION_ERROR', 'year or recordId is required', requestId);
      }

      const discoveryConfig = getLegacyFallbackDiscoveryConfig();
      const repository = new LegacyFallbackDiscoveryRepository();
      const latestCompletedUtc = await repository.getLatestSyncRunCompletedUtc();
      const rerunPolicy = evaluateLegacyFallbackManualRerunPolicy(discoveryConfig, latestCompletedUtc);
      if (!rerunPolicy.allowed) {
        return errorResponse(
          429,
          'LEGACY_FALLBACK_RERUN_BLOCKED',
          rerunPolicy.reason ?? 'Manual rerun blocked',
          requestId,
        );
      }

      const service = createDiscoveryService(context);
      const summary = await service.run({
        years: [year as 2019 | 2020 | 2021 | 2022 | 2023 | 2024 | 2025 | 2026],
        dryRun: body.dryRun === true,
        matchAnomalyThreshold: discoveryConfig.matchAnomalyThreshold,
      });

      return successResponse({
        revalidatedYear: year,
        trigger: recordId !== null ? 'record' : 'year',
        recordId,
        summary,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      if (message.includes('not found')) {
        return errorResponse(404, 'NOT_FOUND', message, requestId);
      }
      return errorResponse(500, 'LEGACY_FALLBACK_REVALIDATE_FAILED', message, requestId);
    }
  }, { domain: 'legacyFallback', operation: 'reviewRevalidate' })),
});
