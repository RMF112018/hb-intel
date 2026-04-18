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
import { processCheckpointDecision } from '../../services/admin-control-plane/install-checkpoint-service.js';
import { normalizePnpActionKey, toActionMetadata } from '../../services/admin-control-plane/pnp-action-catalog.js';
import { errorResponse, successResponse } from '../../utils/response-helpers.js';
import { withTelemetry } from '../../utils/withTelemetry.js';
import { AdminDomain, ObservabilityErrorSource } from '@hbc/models/admin-control-plane';
import { emitRouteError } from './observability-emitter.js';

// P12-05: Observability routes (side-effect import for route registration)
import './observability-routes.js';

// P9.1-04: White-glove device deployment routes (side-effect import for route registration)
import './white-glove-routes.js';
import './legacy-fallback-routes.js';

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

    const normalizedRequest = services.pnpOpsOrchestrator.normalizeLaunchRequest(body as never);
    const result = await services.runService.launchRun(normalizedRequest as never, actor);

    if (services.pnpOpsOrchestrator.isPnpAction(String(normalizedRequest.actionKey))) {
      const backendUrl = (() => {
        try {
          return new URL(request.url).origin;
        } catch {
          return '';
        }
      })();
      void services.pnpOpsOrchestrator
        .executeRun(result.runId, normalizedRequest as never, actor, backendUrl)
        .catch((err) => {
          const message = err instanceof Error ? err.message : String(err);
          console.error(`[adminLaunchRun] PnP run orchestration failed for ${result.runId}: ${message}`);
        });
    }

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
      emitRouteError(services, { domain: AdminDomain.ProvisioningRollout, source: ObservabilityErrorSource.AdminRun, operation: 'cancelRun', runId, actionKey: 'admin.cancel-run' }, err);
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
      emitRouteError(services, { domain: AdminDomain.ProvisioningRollout, source: ObservabilityErrorSource.AdminRun, operation: 'retryRun', runId, actionKey: 'admin.retry-run' }, err);
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

    // P6-06: Real checkpoint decision processing
    const services = createAdminControlPlaneServiceFactory();
    const actor = services.actorContextResolver.resolve({
      upn: auth.claims.upn,
      oid: auth.claims.oid,
      displayName: auth.claims.displayName ?? auth.claims.upn,
    });

    const result = await processCheckpointDecision(
      services.runService,
      services.auditService,
      runId,
      body.stepNumber as number,
      body.decision as 'approve' | 'reject',
      actor,
      typeof body.comment === 'string' ? body.comment : undefined,
    );

    if (!result.success) {
      return errorResponse(409, 'CHECKPOINT_ERROR', result.error ?? 'Checkpoint decision failed', reqId);
    }

    return successResponse(result.response);
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

    const normalizedActionKey = normalizePnpActionKey(body.actionKey) ?? body.actionKey;
    const result = await services.preflightService.validate({
      ...body,
      actionKey: normalizedActionKey,
    } as never);
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
// ── List Audit Events for a Run ────────────────────────────────────────────────

/**
 * GET /api/admin/runs/{runId}/audit — List audit events for a run.
 *
 * Response: 200 IAdminApiListResponse<IAdminAuditRecord>
 */
app.http('adminListRunAuditEvents', {
  methods: ['GET'],
  authLevel: 'anonymous',
  route: 'admin/runs/{runId}/audit',
  handler: withAuth(withTelemetry(async (request: HttpRequest, _context: InvocationContext, auth): Promise<HttpResponseInit> => {
    const reqId = extractOrGenerateRequestId(request);
    const scopeDenied = requireDelegatedScope(auth.claims, reqId);
    if (scopeDenied) return scopeDenied;

    const services = createAdminControlPlaneServiceFactory();
    const runId = getParam(request, 'runId');

    if (!runId) {
      return errorResponse(400, 'VALIDATION_ERROR', 'runId is required', reqId);
    }

    const events = await services.auditService.listByRunId(runId);

    return {
      status: 200,
      jsonBody: {
        items: events,
        pagination: { total: events.length, page: 1, pageSize: events.length, totalPages: 1 },
        requestId: reqId,
      },
    };
  }, { domain: 'adminControlPlane', operation: 'listRunAuditEvents' })),
});

// ── List Audit Events by Type ──────────────────────────────────────────────────

/**
 * GET /api/admin/audit — List audit events with optional type filter.
 *
 * Query: eventType?, since?, limit?
 * Response: 200 IAdminApiListResponse<IAdminAuditRecord>
 */
app.http('adminListAuditEvents', {
  methods: ['GET'],
  authLevel: 'anonymous',
  route: 'admin/audit',
  handler: withAuth(withTelemetry(async (request: HttpRequest, _context: InvocationContext, auth): Promise<HttpResponseInit> => {
    const reqId = extractOrGenerateRequestId(request);
    const scopeDenied = requireDelegatedScope(auth.claims, reqId);
    if (scopeDenied) return scopeDenied;

    const services = createAdminControlPlaneServiceFactory();
    const eventType = request.query.get('eventType') ?? undefined;
    const since = request.query.get('since') ?? undefined;
    const limitStr = request.query.get('limit');
    const limit = limitStr ? parseInt(limitStr, 10) : undefined;

    if (!eventType) {
      return errorResponse(400, 'VALIDATION_ERROR', 'eventType query parameter is required', reqId);
    }

    const events = await services.auditService.listByEventType(
      eventType as never,
      { since, limit },
    );

    return {
      status: 200,
      jsonBody: {
        items: events,
        pagination: { total: events.length, page: 1, pageSize: events.length, totalPages: 1 },
        requestId: reqId,
      },
    };
  }, { domain: 'adminControlPlane', operation: 'listAuditEvents' })),
});

// ── Get Evidence Manifest for a Run ────────────────────────────────────────────

/**
 * GET /api/admin/runs/{runId}/evidence — Get evidence manifest for a run.
 *
 * Returns all evidence references associated with the run's audit events.
 * Phase 4 returns evidence refs from audit records; Phase 6 adds dedicated evidence store.
 *
 * Response: 200 IAdminApiResponse<{ runId, evidenceRefs[] }>
 */
app.http('adminGetRunEvidence', {
  methods: ['GET'],
  authLevel: 'anonymous',
  route: 'admin/runs/{runId}/evidence',
  handler: withAuth(withTelemetry(async (request: HttpRequest, _context: InvocationContext, auth): Promise<HttpResponseInit> => {
    const reqId = extractOrGenerateRequestId(request);
    const scopeDenied = requireDelegatedScope(auth.claims, reqId);
    if (scopeDenied) return scopeDenied;

    const services = createAdminControlPlaneServiceFactory();
    const runId = getParam(request, 'runId');

    if (!runId) {
      return errorResponse(400, 'VALIDATION_ERROR', 'runId is required', reqId);
    }

    const evidenceRefs = await services.evidenceService.listByRunId(runId);

    const backendOrigin = (() => {
      try {
        return new URL(request.url).origin;
      } catch {
        return '';
      }
    })();
    const mappedEvidenceRefs = await Promise.all(evidenceRefs.map(async (ref) => {
      const payload = await services.evidenceService.getEvidencePayload(ref.evidenceId);
      const inline = payload?.inlinePayload ?? null;
      return {
        ...ref,
        downloadUrl: backendOrigin
          ? `${backendOrigin}/api/admin/runs/${encodeURIComponent(runId)}/artifacts/${encodeURIComponent(ref.evidenceId)}/download`
          : null,
        fileName: typeof inline?.fileName === 'string' ? inline.fileName : ref.label,
        contentType: typeof inline?.contentType === 'string' ? inline.contentType : null,
        sizeBytes: typeof inline?.sizeBytes === 'number' ? inline.sizeBytes : null,
        isBundle: inline?.isBundle === true,
        bundleFormat: typeof inline?.bundleFormat === 'string' ? inline.bundleFormat : null,
        availability: payload?.offloaded ? 'offloaded' : (typeof inline?.availability === 'string' ? inline.availability : 'available'),
      };
    }));

    return successResponse({
      runId,
      evidenceRefs: mappedEvidenceRefs,
      total: mappedEvidenceRefs.length,
    });
  }, { domain: 'adminControlPlane', operation: 'getRunEvidence' })),
});

// ── Download Run Artifact by Evidence ID ──────────────────────────────────────

/**
 * GET /api/admin/runs/{runId}/artifacts/{evidenceId}/download — download one artifact payload.
 */
app.http('adminDownloadRunArtifact', {
  methods: ['GET'],
  authLevel: 'anonymous',
  route: 'admin/runs/{runId}/artifacts/{evidenceId}/download',
  handler: withAuth(withTelemetry(async (request: HttpRequest, _context: InvocationContext, auth): Promise<HttpResponseInit> => {
    const reqId = extractOrGenerateRequestId(request);
    const scopeDenied = requireDelegatedScope(auth.claims, reqId);
    if (scopeDenied) return scopeDenied;

    const services = createAdminControlPlaneServiceFactory();
    const runId = getParam(request, 'runId');
    const evidenceId = getParam(request, 'evidenceId');
    if (!runId || !evidenceId) {
      return errorResponse(400, 'VALIDATION_ERROR', 'runId and evidenceId are required', reqId);
    }

    const payload = await services.evidenceService.getEvidencePayload(evidenceId);
    if (!payload || payload.runId !== runId) {
      return errorResponse(404, 'NOT_FOUND', `Artifact ${evidenceId} not found for run ${runId}`, reqId);
    }
    if (payload.offloaded || !payload.inlinePayload) {
      return errorResponse(409, 'ARTIFACT_UNAVAILABLE', 'Artifact payload is offloaded or unavailable inline', reqId);
    }

    const fileName = typeof payload.inlinePayload.fileName === 'string'
      ? payload.inlinePayload.fileName
      : `${evidenceId}.json`;
    const contentType = typeof payload.inlinePayload.contentType === 'string'
      ? payload.inlinePayload.contentType
      : 'application/json';
    const encoding = typeof payload.inlinePayload.contentEncoding === 'string'
      ? payload.inlinePayload.contentEncoding
      : 'utf-8';
    const content = typeof payload.inlinePayload.content === 'string'
      ? payload.inlinePayload.content
      : JSON.stringify(payload.inlinePayload, null, 2);
    const body = encoding === 'base64'
      ? Buffer.from(content, 'base64')
      : content;

    return {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="${fileName}"`,
        'Cache-Control': 'no-store',
      },
      body,
    };
  }, { domain: 'adminControlPlane', operation: 'downloadRunArtifact' })),
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

    const domain = request.query.get('domain');
    const matchesDomain = !domain || domain === 'sharepoint-control';
    const hasBasePrereqs =
      typeof process.env.HBC_ADAPTER_MODE === 'string' &&
      process.env.HBC_ADAPTER_MODE.length > 0 &&
      typeof process.env.AZURE_TABLE_ENDPOINT === 'string' &&
      process.env.AZURE_TABLE_ENDPOINT.length > 0;

    const items = matchesDomain
      ? toActionMetadata(
          hasBasePrereqs,
          hasBasePrereqs ? null : 'Backend prerequisites are not fully configured (HBC_ADAPTER_MODE, AZURE_TABLE_ENDPOINT).',
        )
      : [];

    return {
      status: 200,
      jsonBody: {
        items,
        pagination: {
          total: items.length,
          page: 1,
          pageSize: 25,
          totalPages: items.length === 0 ? 0 : 1,
        },
        requestId: reqId,
      },
    };
  }, { domain: 'adminControlPlane', operation: 'listActions' })),
});
