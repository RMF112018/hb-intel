/**
 * Admin Control Plane — API route registration.
 *
 * Registers the generalized authenticated admin API endpoints for the
 * IT Control Center operator console. All routes use shared auth middleware
 * and delegate to the admin control plane service container.
 *
 * Route table:
 *   POST   /api/admin/runs                         — Launch a new admin run
 *   GET    /api/admin/runs                         — List run history
 *   GET    /api/admin/runs/{runId}                 — Get run status/detail
 *   POST   /api/admin/runs/{runId}/cancel          — Cancel a run
 *   POST   /api/admin/runs/{runId}/retry           — Retry a failed run
 *   POST   /api/admin/runs/{runId}/checkpoint      — Record checkpoint decision
 *   POST   /api/admin/preflight                    — Run preflight validation
 *   POST   /api/admin/runs/preview                 — Preview / dry-run
 *   GET    /api/admin/config/{scope}               — Get config state
 *   GET    /api/admin/actions                      — List action metadata
 *
 * See: Phase 2 API contract catalog, Phase 3 Summary Plan (P3-04)
 *
 * @module admin-control-plane/routes
 */

import { app, type HttpRequest, type HttpResponseInit, type InvocationContext } from '@azure/functions';

/** Extract a required route param. Returns empty string if missing (caller should guard). */
function getParam(request: HttpRequest, name: string): string {
  return request.params[name] ?? '';
}
import { withAuth } from '../../middleware/auth.js';
import { extractOrGenerateRequestId } from '../../middleware/request-id.js';
import { requireAdmin, requireDelegatedScope } from '../../middleware/authorization.js';
import { createAdminControlPlaneServiceFactory } from '../../hosts/admin-control-plane/service-factory.js';
import { errorResponse, successResponse } from '../../utils/response-helpers.js';
import { withTelemetry } from '../../utils/withTelemetry.js';

// ── Launch Run ─────────────────────────────────────────────────────────────────

/**
 * POST /api/admin/runs — Launch a new admin run.
 *
 * Request: IAdminRunLaunchRequest { actionKey, commandInput, targetEntityId?, dryRun? }
 * Response: 202 IAdminApiResponse<IAdminRunLaunchResponse>
 */
app.http('adminLaunchRun', {
  methods: ['POST'],
  authLevel: 'anonymous',
  route: 'admin/runs',
  handler: withAuth(withTelemetry(async (request: HttpRequest, _context: InvocationContext, auth): Promise<HttpResponseInit> => {
    const reqId = extractOrGenerateRequestId(request);

    // P3-08: Admin role + delegated scope required for state-changing operations
    const scopeDenied = requireDelegatedScope(auth.claims, reqId);
    if (scopeDenied) return scopeDenied;
    const adminDenied = requireAdmin(auth.claims, reqId);
    if (adminDenied) return adminDenied;

    const services = createAdminControlPlaneServiceFactory();

    const body = (await request.json()) as Record<string, unknown>;

    if (!body.actionKey || typeof body.actionKey !== 'string') {
      return errorResponse(400, 'VALIDATION_ERROR', 'actionKey is required', reqId);
    }

    const actor = services.actorContextResolver.resolve({
      upn: auth.claims.upn,
      oid: auth.claims.oid,
      displayName: auth.claims.displayName ?? auth.claims.upn,
    });

    const result = await services.runService.launchRun(body as never, actor);
    return successResponse(result, 202);
  }, { domain: 'adminControlPlane', operation: 'launchRun' })),
});

// ── List Run History ───────────────────────────────────────────────────────────

/**
 * GET /api/admin/runs — List run history with optional filters.
 *
 * Query: domain?, status?, targetEntityId?, page?, pageSize?
 * Response: 200 IAdminApiListResponse<IAdminRunSummary>
 */
app.http('adminListRuns', {
  methods: ['GET'],
  authLevel: 'anonymous',
  route: 'admin/runs',
  handler: withAuth(withTelemetry(async (request: HttpRequest, _context: InvocationContext, auth): Promise<HttpResponseInit> => {
    const reqId = extractOrGenerateRequestId(request);

    // P3-08: Delegated scope required for read operations
    const scopeDenied = requireDelegatedScope(auth.claims, reqId);
    if (scopeDenied) return scopeDenied;

    const services = createAdminControlPlaneServiceFactory();

    const domain = request.query.get('domain') ?? undefined;
    const status = request.query.get('status') ?? undefined;
    const page = parseInt(request.query.get('page') ?? '1', 10);
    const pageSize = parseInt(request.query.get('pageSize') ?? '25', 10);

    const result = await services.runService.listRuns({ domain, status, page, pageSize });

    return {
      status: 200,
      jsonBody: {
        items: result.items,
        pagination: {
          total: result.total,
          page: result.page,
          pageSize: result.pageSize,
          totalPages: Math.ceil(result.total / result.pageSize),
        },
        requestId: reqId,
      },
    };
  }, { domain: 'adminControlPlane', operation: 'listRuns' })),
});

// ── Get Run Status / Detail ────────────────────────────────────────────────────

/**
 * GET /api/admin/runs/{runId} — Get run status and detail.
 *
 * Response: 200 IAdminApiResponse<IAdminRunEnvelope>
 */
app.http('adminGetRun', {
  methods: ['GET'],
  authLevel: 'anonymous',
  route: 'admin/runs/{runId}',
  handler: withAuth(withTelemetry(async (request: HttpRequest, _context: InvocationContext, auth): Promise<HttpResponseInit> => {
    const reqId = extractOrGenerateRequestId(request);
    const scopeDenied = requireDelegatedScope(auth.claims, reqId);
    if (scopeDenied) return scopeDenied;

    const services = createAdminControlPlaneServiceFactory();
    const runId = getParam(request, 'runId');

    if (!runId) {
      return errorResponse(400, 'VALIDATION_ERROR', 'runId is required', reqId);
    }

    const run = await services.runService.getRun(runId);
    if (!run) {
      return errorResponse(404, 'NOT_FOUND', `Run ${runId} not found`, reqId);
    }

    return successResponse(run);
  }, { domain: 'adminControlPlane', operation: 'getRun' })),
});

// ── Cancel Run ─────────────────────────────────────────────────────────────────

/**
 * POST /api/admin/runs/{runId}/cancel — Cancel an in-progress run.
 *
 * Request: { reason: string }
 * Response: 200 IAdminApiResponse<IAdminRunEnvelope>
 */
app.http('adminCancelRun', {
  methods: ['POST'],
  authLevel: 'anonymous',
  route: 'admin/runs/{runId}/cancel',
  handler: withAuth(withTelemetry(async (request: HttpRequest, _context: InvocationContext, auth): Promise<HttpResponseInit> => {
    const reqId = extractOrGenerateRequestId(request);
    const scopeDenied = requireDelegatedScope(auth.claims, reqId);
    if (scopeDenied) return scopeDenied;
    const adminDenied = requireAdmin(auth.claims, reqId);
    if (adminDenied) return adminDenied;

    const services = createAdminControlPlaneServiceFactory();
    const runId = getParam(request, 'runId');

    if (!runId) {
      return errorResponse(400, 'VALIDATION_ERROR', 'runId is required', reqId);
    }

    const body = (await request.json()) as Record<string, unknown>;
    const reason = typeof body.reason === 'string' ? body.reason : '';

    const actor = services.actorContextResolver.resolve({
      upn: auth.claims.upn,
      oid: auth.claims.oid,
      displayName: auth.claims.displayName ?? auth.claims.upn,
    });

    try {
      const result = await services.runService.cancelRun(runId, actor, reason);
      return successResponse(result);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Cancel failed';
      if (message.includes('not found')) return errorResponse(404, 'NOT_FOUND', message, reqId);
      return errorResponse(409, 'INVALID_STATE', message, reqId);
    }
  }, { domain: 'adminControlPlane', operation: 'cancelRun' })),
});

// ── Retry Run ──────────────────────────────────────────────────────────────────

/**
 * POST /api/admin/runs/{runId}/retry — Retry a failed run.
 *
 * Creates a new run linked to the failed parent via parentRunId.
 * Response: 202 IAdminApiResponse<IAdminRunRetryResponse>
 */
app.http('adminRetryRun', {
  methods: ['POST'],
  authLevel: 'anonymous',
  route: 'admin/runs/{runId}/retry',
  handler: withAuth(withTelemetry(async (request: HttpRequest, _context: InvocationContext, auth): Promise<HttpResponseInit> => {
    const reqId = extractOrGenerateRequestId(request);
    const scopeDenied = requireDelegatedScope(auth.claims, reqId);
    if (scopeDenied) return scopeDenied;
    const adminDenied = requireAdmin(auth.claims, reqId);
    if (adminDenied) return adminDenied;

    const services = createAdminControlPlaneServiceFactory();
    const runId = getParam(request, 'runId');

    if (!runId) {
      return errorResponse(400, 'VALIDATION_ERROR', 'runId is required', reqId);
    }

    const actor = services.actorContextResolver.resolve({
      upn: auth.claims.upn,
      oid: auth.claims.oid,
      displayName: auth.claims.displayName ?? auth.claims.upn,
    });

    try {
      const result = await services.runService.retryRun(runId, actor);
      return successResponse(result, 202);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Retry failed';
      if (message.includes('not found')) return errorResponse(404, 'NOT_FOUND', message, reqId);
      return errorResponse(409, 'INVALID_STATE', message, reqId);
    }
  }, { domain: 'adminControlPlane', operation: 'retryRun' })),
});

// ── Checkpoint Decision ────────────────────────────────────────────────────────

/**
 * POST /api/admin/runs/{runId}/checkpoint — Record a checkpoint decision.
 *
 * Request: { stepNumber, decision: 'approve'|'reject', comment? }
 * Response: 200 IAdminApiResponse<IAdminCheckpointDecisionResponse>
 */
app.http('adminCheckpointDecision', {
  methods: ['POST'],
  authLevel: 'anonymous',
  route: 'admin/runs/{runId}/checkpoint',
  handler: withAuth(withTelemetry(async (request: HttpRequest, _context: InvocationContext, auth): Promise<HttpResponseInit> => {
    const reqId = extractOrGenerateRequestId(request);
    const scopeDenied = requireDelegatedScope(auth.claims, reqId);
    if (scopeDenied) return scopeDenied;
    const adminDenied = requireAdmin(auth.claims, reqId);
    if (adminDenied) return adminDenied;

    const runId = getParam(request, 'runId');

    if (!runId) {
      return errorResponse(400, 'VALIDATION_ERROR', 'runId is required', reqId);
    }

    const body = (await request.json()) as Record<string, unknown>;
    if (typeof body.stepNumber !== 'number' || !['approve', 'reject'].includes(body.decision as string)) {
      return errorResponse(400, 'VALIDATION_ERROR', 'stepNumber (number) and decision (approve|reject) are required', reqId);
    }

    // Checkpoint decision handling deferred to P3-05 (run command handler skeleton).
    // Stub returns the decision acknowledgment.
    return successResponse({
      runId,
      stepNumber: body.stepNumber,
      decision: body.decision,
      updatedStatus: 'AwaitingApproval',
    });
  }, { domain: 'adminControlPlane', operation: 'checkpointDecision' })),
});

// ── Preflight Validation ───────────────────────────────────────────────────────

/**
 * POST /api/admin/preflight — Run preflight validation for an action.
 *
 * Request: IAdminPreflightRequest { actionKey, commandInput, targetEntityId? }
 * Response: 200 IAdminApiResponse<IAdminPreflightResponse>
 */
app.http('adminPreflight', {
  methods: ['POST'],
  authLevel: 'anonymous',
  route: 'admin/preflight',
  handler: withAuth(withTelemetry(async (request: HttpRequest, _context: InvocationContext, auth): Promise<HttpResponseInit> => {
    const reqId = extractOrGenerateRequestId(request);
    const scopeDenied = requireDelegatedScope(auth.claims, reqId);
    if (scopeDenied) return scopeDenied;

    const services = createAdminControlPlaneServiceFactory();

    const body = (await request.json()) as Record<string, unknown>;
    if (!body.actionKey || typeof body.actionKey !== 'string') {
      return errorResponse(400, 'VALIDATION_ERROR', 'actionKey is required', reqId);
    }

    const result = await services.preflightService.validate(body as never);
    return successResponse(result);
  }, { domain: 'adminControlPlane', operation: 'preflight' })),
});

// ── Preview / Dry-Run ──────────────────────────────────────────────────────────

/**
 * POST /api/admin/runs/preview — Preview / dry-run an action.
 *
 * Request: IAdminRunLaunchRequest with dryRun: true
 * Response: 200 IAdminApiResponse<IAdminPreviewResponse>
 */
app.http('adminPreview', {
  methods: ['POST'],
  authLevel: 'anonymous',
  route: 'admin/runs/preview',
  handler: withAuth(withTelemetry(async (request: HttpRequest, _context: InvocationContext, auth): Promise<HttpResponseInit> => {
    const reqId = extractOrGenerateRequestId(request);
    const scopeDenied = requireDelegatedScope(auth.claims, reqId);
    if (scopeDenied) return scopeDenied;
    const adminDenied = requireAdmin(auth.claims, reqId);
    if (adminDenied) return adminDenied;

    const services = createAdminControlPlaneServiceFactory();

    const body = (await request.json()) as Record<string, unknown>;
    if (!body.actionKey || typeof body.actionKey !== 'string') {
      return errorResponse(400, 'VALIDATION_ERROR', 'actionKey is required', reqId);
    }

    const actor = services.actorContextResolver.resolve({
      upn: auth.claims.upn,
      oid: auth.claims.oid,
      displayName: auth.claims.displayName ?? auth.claims.upn,
    });

    // Force dryRun: true for preview endpoint
    const launchRequest = { ...body, dryRun: true };
    const result = await services.runService.launchRun(launchRequest as never, actor);
    return successResponse(result);
  }, { domain: 'adminControlPlane', operation: 'preview' })),
});

// ── Get Config State ───────────────────────────────────────────────────────────

/**
 * GET /api/admin/config/{scope} — Get configuration state for a scope.
 *
 * Response: 200 IAdminApiResponse<IAdminConfigResponse>
 */
app.http('adminGetConfig', {
  methods: ['GET'],
  authLevel: 'anonymous',
  route: 'admin/config/{scope}',
  handler: withAuth(withTelemetry(async (request: HttpRequest, _context: InvocationContext, auth): Promise<HttpResponseInit> => {
    const reqId = extractOrGenerateRequestId(request);
    const scopeDenied = requireDelegatedScope(auth.claims, reqId);
    if (scopeDenied) return scopeDenied;

    const services = createAdminControlPlaneServiceFactory();
    const scope = getParam(request, 'scope');

    if (!scope) {
      return errorResponse(400, 'VALIDATION_ERROR', 'scope is required', reqId);
    }

    const result = await services.configService.getConfig(scope);
    return successResponse(result);
  }, { domain: 'adminControlPlane', operation: 'getConfig' })),
});

// ── List Action Metadata ───────────────────────────────────────────────────────

/**
 * GET /api/admin/actions — List available admin actions.
 *
 * Query: domain?
 * Response: 200 IAdminApiListResponse<IAdminActionMetadata>
 */
app.http('adminListActions', {
  methods: ['GET'],
  authLevel: 'anonymous',
  route: 'admin/actions',
  handler: withAuth(withTelemetry(async (request: HttpRequest, _context: InvocationContext, auth): Promise<HttpResponseInit> => {
    const reqId = extractOrGenerateRequestId(request);
    const scopeDenied = requireDelegatedScope(auth.claims, reqId);
    if (scopeDenied) return scopeDenied;

    // Action metadata listing deferred to P3-06 (adapter registry).
    // Stub returns empty list.
    return {
      status: 200,
      jsonBody: {
        items: [],
        pagination: { total: 0, page: 1, pageSize: 25, totalPages: 0 },
        requestId: reqId,
      },
    };
  }, { domain: 'adminControlPlane', operation: 'listActions' })),
});
