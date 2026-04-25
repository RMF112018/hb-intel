import {
  app,
  type HttpRequest,
  type HttpResponseInit,
  type InvocationContext,
} from '@azure/functions';
import { withAuth, type AuthContext } from '../../middleware/auth.js';
import { extractOrGenerateRequestId } from '../../middleware/request-id.js';
import {
  authorizeExcellenceHomepageCurrentRoute,
  authorizeSafetyRoute,
  emitAuthorizationTelemetry,
  type SafetyRouteAction,
} from '../../middleware/authorization.js';
import { errorResponse, successResponse } from '../../utils/response-helpers.js';
import { withTelemetry } from '../../utils/withTelemetry.js';
import { assertAdapterModeValid } from '../../utils/adapter-mode-guard.js';
import { createLogger } from '../../utils/logger.js';
import { MockSharePointService, SharePointService } from '../../services/sharepoint-service.js';
import {
  SafetyFieldExcellenceValidationError,
  type SafetyFieldExcellenceCandidateListRequest,
  type SafetyFieldExcellenceRollupRequest,
} from '../../services/safety-field-excellence-rollup-service.js';
import type { SafetyActivityEvidence } from '../../../../../packages/features/safety/src/excellence/index.js';

function authorizeExcellenceRoute(
  action: SafetyRouteAction,
  context: InvocationContext,
  auth: AuthContext,
  requestId: string,
): HttpResponseInit | null {
  const decision = authorizeSafetyRoute(auth.claims, action, requestId);
  const logger = createLogger(context);
  emitAuthorizationTelemetry(logger, {
    action: `safety-route-${action}`,
    outcome: decision.allowed ? 'allowed' : 'denied',
    role: decision.matchedRole ?? undefined,
    method: decision.matchedRoleFamily,
    correlationId: requestId,
    callerOid: auth.claims.oid,
    callerUpn: auth.claims.upn,
  });
  if (!decision.allowed) return decision.deniedResponse;
  return null;
}

function parseOptionalString(value: unknown): string | undefined {
  return typeof value === 'string' && value.length > 0 ? value : undefined;
}

function parseOptionalPositiveInteger(value: unknown): number | undefined {
  return typeof value === 'number' && Number.isInteger(value) && value > 0 ? value : undefined;
}

function parseRollingWindowWeeks(value: unknown): number | undefined {
  if (typeof value !== 'number' || !Number.isFinite(value)) return undefined;
  if (value <= 0 || value > 52) return undefined;
  return Math.floor(value);
}

function parseActivityEvidenceMap(
  value: unknown,
): Record<string, SafetyActivityEvidence> | undefined {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return undefined;
  const out: Record<string, SafetyActivityEvidence> = {};
  for (const [key, entry] of Object.entries(value as Record<string, unknown>)) {
    if (!entry || typeof entry !== 'object' || Array.isArray(entry)) continue;
    const candidate = entry as Record<string, unknown>;
    const status = candidate.status;
    const source = candidate.source;
    if (
      (status === 'proven' || status === 'inferred' || status === 'missing') &&
      (source === 'manual' ||
        source === 'daily-log' ||
        source === 'project-stage' ||
        source === 'inspection-density' ||
        source === 'none')
    ) {
      out[key] = {
        status,
        source,
        activeTradeCount: typeof candidate.activeTradeCount === 'number'
          ? candidate.activeTradeCount
          : undefined,
        estimatedManpower: typeof candidate.estimatedManpower === 'number'
          ? candidate.estimatedManpower
          : undefined,
        projectStage: parseOptionalString(candidate.projectStage),
        notes: parseOptionalString(candidate.notes),
      };
    }
  }
  return Object.keys(out).length > 0 ? out : undefined;
}

function parseRollupRequest(body: Record<string, unknown>): SafetyFieldExcellenceRollupRequest {
  return {
    reportingPeriodId: parseOptionalString(body.reportingPeriodId),
    reportingPeriodSpItemId: parseOptionalPositiveInteger(body.reportingPeriodSpItemId),
    rollingWindowWeeks: parseRollingWindowWeeks(body.rollingWindowWeeks),
    generatorVersion: parseOptionalString(body.generatorVersion),
    generatedAt: parseOptionalString(body.generatedAt),
    activityEvidenceByProjectNumber: parseActivityEvidenceMap(
      body.activityEvidenceByProjectNumber,
    ),
  };
}

function buildSharePointService(): SharePointService | MockSharePointService {
  const mode = assertAdapterModeValid();
  return mode === 'mock' || process.env.NODE_ENV === 'test'
    ? new MockSharePointService()
    : new SharePointService();
}

app.http('safetyFieldExcellenceRollupDryRun', {
  methods: ['POST'],
  authLevel: 'anonymous',
  route: 'safety-field-excellence/rollup/dry-run',
  handler: withAuth(
    withTelemetry(
      async (request: HttpRequest, context: InvocationContext, auth): Promise<HttpResponseInit> => {
        const requestId = extractOrGenerateRequestId(request);
        const denied = authorizeExcellenceRoute('excellence-rollup-read', context, auth, requestId);
        if (denied) return denied;

        let body: Record<string, unknown> = {};
        try {
          body = (await request.json()) as Record<string, unknown>;
        } catch {
          body = {};
        }

        const parsed = parseRollupRequest(body);
        try {
          const sharePoint = buildSharePointService();
          const result = await sharePoint.runSafetyFieldExcellenceRollup(parsed, true, requestId);
          return successResponse(result);
        } catch (err) {
          if (err instanceof SafetyFieldExcellenceValidationError) {
            return errorResponse(400, err.code, err.message, requestId);
          }
          const message = err instanceof Error ? err.message : String(err);
          return errorResponse(500, 'INTERNAL_ERROR', message, requestId);
        }
      },
      { domain: 'adminControlPlane', operation: 'safetyFieldExcellenceRollupDryRun' },
    ),
  ),
});

app.http('safetyFieldExcellenceRollupGenerate', {
  methods: ['POST'],
  authLevel: 'anonymous',
  route: 'safety-field-excellence/rollup/generate',
  handler: withAuth(
    withTelemetry(
      async (request: HttpRequest, context: InvocationContext, auth): Promise<HttpResponseInit> => {
        const requestId = extractOrGenerateRequestId(request);
        const denied = authorizeExcellenceRoute(
          'excellence-rollup-generate',
          context,
          auth,
          requestId,
        );
        if (denied) return denied;

        let body: Record<string, unknown> = {};
        try {
          body = (await request.json()) as Record<string, unknown>;
        } catch {
          body = {};
        }

        const parsed = parseRollupRequest(body);
        try {
          const sharePoint = buildSharePointService();
          const result = await sharePoint.runSafetyFieldExcellenceRollup(parsed, false, requestId);
          return successResponse(result);
        } catch (err) {
          if (err instanceof SafetyFieldExcellenceValidationError) {
            return errorResponse(400, err.code, err.message, requestId);
          }
          const message = err instanceof Error ? err.message : String(err);
          return errorResponse(500, 'INTERNAL_ERROR', message, requestId);
        }
      },
      { domain: 'adminControlPlane', operation: 'safetyFieldExcellenceRollupGenerate' },
    ),
  ),
});

function authorizeExcellenceHomepageCurrent(
  context: InvocationContext,
  auth: AuthContext,
  requestId: string,
): HttpResponseInit | null {
  const decision = authorizeExcellenceHomepageCurrentRoute(auth.claims, requestId);
  const logger = createLogger(context);
  emitAuthorizationTelemetry(logger, {
    action: 'safety-route-excellence-homepage-current-read',
    outcome: decision.allowed ? 'allowed' : 'denied',
    role: decision.matchedRole ?? undefined,
    method: decision.matchedRoleFamily,
    correlationId: requestId,
    callerOid: auth.claims.oid,
    callerUpn: auth.claims.upn,
  });
  if (!decision.allowed) return decision.deniedResponse;
  return null;
}

function parsePositiveIntegerParam(value: string | undefined): number | undefined {
  if (!value) return undefined;
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : undefined;
}

app.http('safetyFieldExcellenceListCandidates', {
  methods: ['GET'],
  authLevel: 'anonymous',
  route: 'safety-field-excellence/reporting-periods/{reportingPeriodId}/candidates',
  handler: withAuth(
    withTelemetry(
      async (request: HttpRequest, context: InvocationContext, auth): Promise<HttpResponseInit> => {
        const requestId = extractOrGenerateRequestId(request);
        const denied = authorizeExcellenceRoute('excellence-rollup-read', context, auth, requestId);
        if (denied) return denied;

        const reportingPeriodId = String(request.params.reportingPeriodId ?? '').trim();
        if (!reportingPeriodId) {
          return errorResponse(
            400,
            'VALIDATION_ERROR',
            'reportingPeriodId is required.',
            requestId,
          );
        }

        const reportingPeriodSpItemId = parseOptionalPositiveInteger(
          Number(request.query.get('reportingPeriodSpItemId') ?? ''),
        );
        const listRequest: SafetyFieldExcellenceCandidateListRequest = {
          reportingPeriodId,
          reportingPeriodSpItemId,
          generatorVersion: parseOptionalString(request.query.get('generatorVersion') ?? undefined),
          eligibilityStatus: parseOptionalString(request.query.get('eligibilityStatus') ?? undefined),
          publishRecommendation: parseOptionalString(
            request.query.get('recommendation') ?? undefined,
          ),
          top: parseOptionalPositiveInteger(Number(request.query.get('top') ?? '')),
        };

        try {
          const sharePoint = buildSharePointService();
          const result = await sharePoint.listSafetyFieldExcellenceCandidates(listRequest, requestId);
          return successResponse(result);
        } catch (err) {
          if (err instanceof SafetyFieldExcellenceValidationError) {
            return errorResponse(400, err.code, err.message, requestId);
          }
          const message = err instanceof Error ? err.message : String(err);
          return errorResponse(500, 'INTERNAL_ERROR', message, requestId);
        }
      },
      { domain: 'adminControlPlane', operation: 'safetyFieldExcellenceListCandidates' },
    ),
  ),
});

// -- Wave 04 routes ------------------------------------------------------

app.http('safetyFieldExcellenceGetHighlight', {
  methods: ['GET'],
  authLevel: 'anonymous',
  route: 'safety-field-excellence/highlights/{id}',
  handler: withAuth(
    withTelemetry(
      async (request: HttpRequest, context: InvocationContext, auth): Promise<HttpResponseInit> => {
        const requestId = extractOrGenerateRequestId(request);
        const denied = authorizeExcellenceRoute('excellence-highlight-read', context, auth, requestId);
        if (denied) return denied;

        const itemId = parsePositiveIntegerParam(String(request.params.id ?? ''));
        if (!itemId) {
          return errorResponse(400, 'VALIDATION_ERROR', 'highlight id must be a positive integer.', requestId);
        }

        try {
          const sharePoint = buildSharePointService();
          const highlight = await sharePoint.getSafetyFieldExcellenceHighlight(itemId);
          if (!highlight) {
            return errorResponse(404, 'HIGHLIGHT_NOT_FOUND', `Highlight ${itemId} not found.`, requestId);
          }
          return successResponse({ success: true, highlight });
        } catch (err) {
          const message = err instanceof Error ? err.message : String(err);
          return errorResponse(500, 'INTERNAL_ERROR', message, requestId);
        }
      },
      { domain: 'adminControlPlane', operation: 'safetyFieldExcellenceGetHighlight' },
    ),
  ),
});

app.http('safetyFieldExcellenceApproveHighlight', {
  methods: ['POST'],
  authLevel: 'anonymous',
  route: 'safety-field-excellence/highlights/{id}/approve',
  handler: withAuth(
    withTelemetry(
      async (request: HttpRequest, context: InvocationContext, auth): Promise<HttpResponseInit> => {
        const requestId = extractOrGenerateRequestId(request);
        const denied = authorizeExcellenceRoute('excellence-highlight-approve', context, auth, requestId);
        if (denied) return denied;

        const itemId = parsePositiveIntegerParam(String(request.params.id ?? ''));
        if (!itemId) {
          return errorResponse(400, 'VALIDATION_ERROR', 'highlight id must be a positive integer.', requestId);
        }
        const approverUpn = auth.claims.upn ?? auth.claims.oid ?? 'unknown';

        try {
          const sharePoint = buildSharePointService();
          const result = await sharePoint.approveSafetyFieldExcellenceHighlight(
            { itemId, approverUpn },
            requestId,
          );
          if (!result.success) {
            const code = result.diagnostics[0]?.code ?? 'INTERNAL_ERROR';
            const message = result.diagnostics[0]?.message ?? 'Approval failed.';
            const status = code === 'HIGHLIGHT_NOT_FOUND' ? 404 : 422;
            return errorResponse(status, code, message, requestId, { result });
          }
          return successResponse(result);
        } catch (err) {
          const message = err instanceof Error ? err.message : String(err);
          return errorResponse(500, 'INTERNAL_ERROR', message, requestId);
        }
      },
      { domain: 'adminControlPlane', operation: 'safetyFieldExcellenceApproveHighlight' },
    ),
  ),
});

app.http('safetyFieldExcellenceOverrideHighlight', {
  methods: ['POST'],
  authLevel: 'anonymous',
  route: 'safety-field-excellence/highlights/{id}/override',
  handler: withAuth(
    withTelemetry(
      async (request: HttpRequest, context: InvocationContext, auth): Promise<HttpResponseInit> => {
        const requestId = extractOrGenerateRequestId(request);
        const denied = authorizeExcellenceRoute('excellence-highlight-approve', context, auth, requestId);
        if (denied) return denied;

        const itemId = parsePositiveIntegerParam(String(request.params.id ?? ''));
        if (!itemId) {
          return errorResponse(400, 'VALIDATION_ERROR', 'highlight id must be a positive integer.', requestId);
        }

        let body: Record<string, unknown> = {};
        try {
          body = (await request.json()) as Record<string, unknown>;
        } catch {
          return errorResponse(400, 'VALIDATION_ERROR', 'Request body must be valid JSON.', requestId);
        }
        const primaryCandidateItemId = parseOptionalPositiveInteger(body.primaryCandidateItemId);
        if (!primaryCandidateItemId) {
          return errorResponse(400, 'VALIDATION_ERROR', 'primaryCandidateItemId must be a positive integer.', requestId);
        }
        const overrideReason = parseOptionalString(body.overrideReason);
        if (!overrideReason || overrideReason.trim().length === 0) {
          return errorResponse(400, 'OVERRIDE_REASON_REQUIRED', 'overrideReason is required.', requestId);
        }
        const secondaryCandidateItemIds = Array.isArray(body.secondaryCandidateItemIds)
          ? (body.secondaryCandidateItemIds as unknown[])
              .map((entry) => parseOptionalPositiveInteger(entry))
              .filter((entry): entry is number => Boolean(entry))
          : undefined;
        const approve = body.approve === true;
        const approverUpn = auth.claims.upn ?? auth.claims.oid ?? 'unknown';

        try {
          const sharePoint = buildSharePointService();
          const result = await sharePoint.overrideSafetyFieldExcellenceHighlight(
            { itemId, primaryCandidateItemId, secondaryCandidateItemIds, overrideReason, approve, approverUpn },
            requestId,
          );
          if (!result.success) {
            const code = result.diagnostics[0]?.code ?? 'INTERNAL_ERROR';
            const message = result.diagnostics[0]?.message ?? 'Override failed.';
            const status = code === 'HIGHLIGHT_NOT_FOUND' || code === 'CANDIDATE_NOT_FOUND' ? 404 : 422;
            return errorResponse(status, code, message, requestId, { result });
          }
          return successResponse(result);
        } catch (err) {
          const message = err instanceof Error ? err.message : String(err);
          return errorResponse(500, 'INTERNAL_ERROR', message, requestId);
        }
      },
      { domain: 'adminControlPlane', operation: 'safetyFieldExcellenceOverrideHighlight' },
    ),
  ),
});

app.http('safetyFieldExcellencePublishHighlight', {
  methods: ['POST'],
  authLevel: 'anonymous',
  route: 'safety-field-excellence/highlights/{id}/publish',
  handler: withAuth(
    withTelemetry(
      async (request: HttpRequest, context: InvocationContext, auth): Promise<HttpResponseInit> => {
        const requestId = extractOrGenerateRequestId(request);
        const denied = authorizeExcellenceRoute('excellence-highlight-publish', context, auth, requestId);
        if (denied) return denied;

        const itemId = parsePositiveIntegerParam(String(request.params.id ?? ''));
        if (!itemId) {
          return errorResponse(400, 'VALIDATION_ERROR', 'highlight id must be a positive integer.', requestId);
        }

        try {
          const sharePoint = buildSharePointService();
          const result = await sharePoint.publishSafetyFieldExcellenceHighlight({ itemId }, requestId);
          if (!result.success) {
            const code = result.diagnostics[0]?.code ?? 'INTERNAL_ERROR';
            const message = result.diagnostics[0]?.message ?? 'Publish failed.';
            const status = code === 'HIGHLIGHT_NOT_FOUND' ? 404 : 422;
            return errorResponse(status, code, message, requestId, { result });
          }
          return successResponse(result);
        } catch (err) {
          const message = err instanceof Error ? err.message : String(err);
          return errorResponse(500, 'INTERNAL_ERROR', message, requestId);
        }
      },
      { domain: 'adminControlPlane', operation: 'safetyFieldExcellencePublishHighlight' },
    ),
  ),
});

app.http('safetyFieldExcellenceSuppressHighlight', {
  methods: ['POST'],
  authLevel: 'anonymous',
  route: 'safety-field-excellence/highlights/{id}/suppress',
  handler: withAuth(
    withTelemetry(
      async (request: HttpRequest, context: InvocationContext, auth): Promise<HttpResponseInit> => {
        const requestId = extractOrGenerateRequestId(request);
        const denied = authorizeExcellenceRoute('excellence-highlight-approve', context, auth, requestId);
        if (denied) return denied;

        const itemId = parsePositiveIntegerParam(String(request.params.id ?? ''));
        if (!itemId) {
          return errorResponse(400, 'VALIDATION_ERROR', 'highlight id must be a positive integer.', requestId);
        }

        let body: Record<string, unknown> = {};
        try {
          body = (await request.json()) as Record<string, unknown>;
        } catch {
          body = {};
        }
        const suppressionReason = parseOptionalString(body.suppressionReason);

        try {
          const sharePoint = buildSharePointService();
          const result = await sharePoint.suppressSafetyFieldExcellenceHighlight(
            { itemId, suppressionReason },
            requestId,
          );
          if (!result.success) {
            const code = result.diagnostics[0]?.code ?? 'INTERNAL_ERROR';
            const message = result.diagnostics[0]?.message ?? 'Suppress failed.';
            const status = code === 'HIGHLIGHT_NOT_FOUND' ? 404 : 422;
            return errorResponse(status, code, message, requestId, { result });
          }
          return successResponse(result);
        } catch (err) {
          const message = err instanceof Error ? err.message : String(err);
          return errorResponse(500, 'INTERNAL_ERROR', message, requestId);
        }
      },
      { domain: 'adminControlPlane', operation: 'safetyFieldExcellenceSuppressHighlight' },
    ),
  ),
});

app.http('safetyFieldExcellenceRollbackHighlight', {
  methods: ['POST'],
  authLevel: 'anonymous',
  route: 'safety-field-excellence/highlights/{id}/rollback',
  handler: withAuth(
    withTelemetry(
      async (request: HttpRequest, context: InvocationContext, auth): Promise<HttpResponseInit> => {
        const requestId = extractOrGenerateRequestId(request);
        const denied = authorizeExcellenceRoute('excellence-highlight-approve', context, auth, requestId);
        if (denied) return denied;

        const itemId = parsePositiveIntegerParam(String(request.params.id ?? ''));
        if (!itemId) {
          return errorResponse(400, 'VALIDATION_ERROR', 'highlight id must be a positive integer.', requestId);
        }

        let body: Record<string, unknown> = {};
        try {
          body = (await request.json()) as Record<string, unknown>;
        } catch {
          body = {};
        }
        const targetItemId = parseOptionalPositiveInteger(body.targetItemId);

        try {
          const sharePoint = buildSharePointService();
          const result = await sharePoint.rollbackSafetyFieldExcellenceHighlight(
            { itemId, targetItemId },
            requestId,
          );
          if (!result.success) {
            const code = result.diagnostics[0]?.code ?? 'INTERNAL_ERROR';
            const message = result.diagnostics[0]?.message ?? 'Rollback failed.';
            const status =
              code === 'HIGHLIGHT_NOT_FOUND' || code === 'ROLLBACK_TARGET_NOT_FOUND' ? 404 : 422;
            return errorResponse(status, code, message, requestId, { result });
          }
          return successResponse(result);
        } catch (err) {
          const message = err instanceof Error ? err.message : String(err);
          return errorResponse(500, 'INTERNAL_ERROR', message, requestId);
        }
      },
      { domain: 'adminControlPlane', operation: 'safetyFieldExcellenceRollbackHighlight' },
    ),
  ),
});

app.http('safetyFieldExcellenceHomepageCurrent', {
  methods: ['GET'],
  authLevel: 'anonymous',
  route: 'safety-field-excellence/homepage/current',
  handler: withAuth(
    withTelemetry(
      async (request: HttpRequest, context: InvocationContext, auth): Promise<HttpResponseInit> => {
        const requestId = extractOrGenerateRequestId(request);
        // Distinct gate: any authenticated delegated user with `access_as_user`,
        // or app-only workload token. No Safety reviewer/admin requirement.
        const denied = authorizeExcellenceHomepageCurrent(context, auth, requestId);
        if (denied) return denied;

        const includeStale = request.query.get('includeStale') === 'true';
        const now = parseOptionalString(request.query.get('now') ?? undefined);

        try {
          const sharePoint = buildSharePointService();
          const result = await sharePoint.getCurrentSafetyFieldExcellenceHomepageHighlight(
            { includeStale, now },
            requestId,
          );
          // Always return 200; "no-published-highlight" is part of the contract.
          return successResponse(result);
        } catch (err) {
          const message = err instanceof Error ? err.message : String(err);
          return errorResponse(500, 'INTERNAL_ERROR', message, requestId);
        }
      },
      { domain: 'adminControlPlane', operation: 'safetyFieldExcellenceHomepageCurrent' },
    ),
  ),
});
