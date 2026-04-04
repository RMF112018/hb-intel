/**
 * Admin Control Plane — Observability API Routes
 *
 * HTTP trigger functions for the Phase 12 observability surfaces. These
 * endpoints power the SPFx operator console's alert dashboard, probe
 * health views, error log, and correlated run timelines.
 *
 * All endpoints require delegated-scope + admin authorization.
 *
 * @module admin-api/observability
 */

import { app } from '@azure/functions';
import type { HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';
import { withAuth } from '../../middleware/auth.js';
import type { AuthContext } from '../../middleware/auth.js';
import { requireDelegatedScope, requireAdmin } from '../../middleware/authorization.js';
import { extractOrGenerateRequestId } from '../../middleware/request-id.js';
import { successResponse, errorResponse } from '../../utils/response-helpers.js';
import { withTelemetry } from '../../utils/withTelemetry.js';
import { createAdminControlPlaneServiceFactory } from '../../hosts/admin-control-plane/service-factory.js';
import type {
  IObservabilityAlertQuery,
  IObservabilityProbeSnapshotQuery,
  IObservabilityErrorQuery,
} from '@hbc/models/admin-control-plane';
import { assembleDashboardSummary } from '../../services/admin-control-plane/observability-dashboard-service.js';
import { assembleRunTimeline } from '../../services/admin-control-plane/observability-timeline-service.js';

// ─── Helpers ────────────────────────────────────────────────────────────────────

function getParam(request: HttpRequest, name: string): string {
  return request.params[name] ?? '';
}

function getQueryInt(request: HttpRequest, name: string, defaultVal: number): number {
  const raw = request.query.get(name);
  if (!raw) return defaultVal;
  const parsed = parseInt(raw, 10);
  return isNaN(parsed) ? defaultVal : parsed;
}

function checkAuth(auth: AuthContext, reqId: string): HttpResponseInit | null {
  const scopeDenied = requireDelegatedScope(auth.claims, reqId);
  if (scopeDenied) return scopeDenied;
  const adminDenied = requireAdmin(auth.claims, reqId);
  if (adminDenied) return adminDenied;
  return null;
}

function resolveActor(services: ReturnType<typeof createAdminControlPlaneServiceFactory>, auth: AuthContext) {
  return services.actorContextResolver.resolve({
    upn: auth.claims.upn,
    oid: auth.claims.oid,
    displayName: auth.claims.displayName ?? auth.claims.upn,
  });
}

// ─── Alert Endpoints ────────────────────────────────────────────────────────────

app.http('obsListAlerts', {
  methods: ['GET'],
  authLevel: 'anonymous',
  route: 'admin/observability/alerts',
  handler: withAuth(withTelemetry(async (
    request: HttpRequest, _context: InvocationContext, auth,
  ): Promise<HttpResponseInit> => {
    const reqId = extractOrGenerateRequestId(request);
    const denied = checkAuth(auth, reqId);
    if (denied) return denied;

    const services = createAdminControlPlaneServiceFactory();
    const query: IObservabilityAlertQuery = {
      status: (request.query.get('status') as IObservabilityAlertQuery['status']) ?? null,
      category: (request.query.get('category') as IObservabilityAlertQuery['category']) ?? null,
      severity: (request.query.get('severity') as IObservabilityAlertQuery['severity']) ?? null,
      domain: (request.query.get('domain') as IObservabilityAlertQuery['domain']) ?? null,
      from: request.query.get('from') ?? null,
      to: request.query.get('to') ?? null,
      cursor: request.query.get('cursor') ?? null,
      limit: Math.min(200, getQueryInt(request, 'limit', 50)),
    };

    const result = await services.observabilityAlertStore.listAlerts(query);
    return successResponse(result);
  }, { domain: 'observability', operation: 'listAlerts' })),
});

app.http('obsGetAlert', {
  methods: ['GET'],
  authLevel: 'anonymous',
  route: 'admin/observability/alerts/{alertId}',
  handler: withAuth(withTelemetry(async (
    request: HttpRequest, _context: InvocationContext, auth,
  ): Promise<HttpResponseInit> => {
    const reqId = extractOrGenerateRequestId(request);
    const denied = checkAuth(auth, reqId);
    if (denied) return denied;

    const alertId = getParam(request, 'alertId');
    if (!alertId) return errorResponse(400, 'VALIDATION_ERROR', 'alertId is required', reqId);

    const services = createAdminControlPlaneServiceFactory();
    const alert = await services.observabilityAlertStore.getAlert(alertId);
    if (!alert) return errorResponse(404, 'NOT_FOUND', `Alert ${alertId} not found`, reqId);

    return successResponse(alert);
  }, { domain: 'observability', operation: 'getAlert' })),
});

app.http('obsAcknowledgeAlert', {
  methods: ['POST'],
  authLevel: 'anonymous',
  route: 'admin/observability/alerts/{alertId}/acknowledge',
  handler: withAuth(withTelemetry(async (
    request: HttpRequest, _context: InvocationContext, auth,
  ): Promise<HttpResponseInit> => {
    const reqId = extractOrGenerateRequestId(request);
    const denied = checkAuth(auth, reqId);
    if (denied) return denied;

    const alertId = getParam(request, 'alertId');
    if (!alertId) return errorResponse(400, 'VALIDATION_ERROR', 'alertId is required', reqId);

    const services = createAdminControlPlaneServiceFactory();
    const actor = resolveActor(services, auth);

    try {
      const updated = await services.observabilityAlertStore.acknowledgeAlert(alertId, actor);
      return successResponse(updated);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Acknowledge failed';
      if (msg.includes('not found')) return errorResponse(404, 'NOT_FOUND', msg, reqId);
      return errorResponse(400, 'ACKNOWLEDGE_ERROR', msg, reqId);
    }
  }, { domain: 'observability', operation: 'acknowledgeAlert' })),
});

app.http('obsResolveAlert', {
  methods: ['POST'],
  authLevel: 'anonymous',
  route: 'admin/observability/alerts/{alertId}/resolve',
  handler: withAuth(withTelemetry(async (
    request: HttpRequest, _context: InvocationContext, auth,
  ): Promise<HttpResponseInit> => {
    const reqId = extractOrGenerateRequestId(request);
    const denied = checkAuth(auth, reqId);
    if (denied) return denied;

    const alertId = getParam(request, 'alertId');
    if (!alertId) return errorResponse(400, 'VALIDATION_ERROR', 'alertId is required', reqId);

    const services = createAdminControlPlaneServiceFactory();
    const actor = resolveActor(services, auth);

    try {
      const updated = await services.observabilityAlertStore.resolveAlert(alertId, actor);
      return successResponse(updated);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Resolve failed';
      if (msg.includes('not found')) return errorResponse(404, 'NOT_FOUND', msg, reqId);
      return errorResponse(400, 'RESOLVE_ERROR', msg, reqId);
    }
  }, { domain: 'observability', operation: 'resolveAlert' })),
});

app.http('obsGetAlertSummary', {
  methods: ['GET'],
  authLevel: 'anonymous',
  route: 'admin/observability/alerts/summary',
  handler: withAuth(withTelemetry(async (
    request: HttpRequest, _context: InvocationContext, auth,
  ): Promise<HttpResponseInit> => {
    const reqId = extractOrGenerateRequestId(request);
    const denied = checkAuth(auth, reqId);
    if (denied) return denied;

    const services = createAdminControlPlaneServiceFactory();
    const summary = await services.observabilityAlertStore.getAlertSummary();
    return successResponse(summary);
  }, { domain: 'observability', operation: 'getAlertSummary' })),
});

app.http('obsIngestAlerts', {
  methods: ['POST'],
  authLevel: 'anonymous',
  route: 'admin/observability/alerts/ingest',
  handler: withAuth(withTelemetry(async (
    request: HttpRequest, _context: InvocationContext, auth,
  ): Promise<HttpResponseInit> => {
    const reqId = extractOrGenerateRequestId(request);
    const denied = checkAuth(auth, reqId);
    if (denied) return denied;

    const body = (await request.json()) as Record<string, unknown>;
    if (!body.alerts || !Array.isArray(body.alerts)) {
      return errorResponse(400, 'VALIDATION_ERROR', 'alerts array is required', reqId);
    }
    if (!body.evaluatedAt || typeof body.evaluatedAt !== 'string') {
      return errorResponse(400, 'VALIDATION_ERROR', 'evaluatedAt is required', reqId);
    }

    const services = createAdminControlPlaneServiceFactory();
    const result = await services.observabilityAlertStore.ingestAlerts(body as never);
    return successResponse(result, 202);
  }, { domain: 'observability', operation: 'ingestAlerts' })),
});

// ─── Probe Endpoints ────────────────────────────────────────────────────────────

app.http('obsGetLatestProbeSnapshot', {
  methods: ['GET'],
  authLevel: 'anonymous',
  route: 'admin/observability/probes/latest',
  handler: withAuth(withTelemetry(async (
    request: HttpRequest, _context: InvocationContext, auth,
  ): Promise<HttpResponseInit> => {
    const reqId = extractOrGenerateRequestId(request);
    const denied = checkAuth(auth, reqId);
    if (denied) return denied;

    const services = createAdminControlPlaneServiceFactory();
    const snapshot = await services.observabilityProbeStore.getLatestSnapshot();
    return successResponse(snapshot);
  }, { domain: 'observability', operation: 'getLatestProbeSnapshot' })),
});

app.http('obsSubmitProbeSnapshot', {
  methods: ['POST'],
  authLevel: 'anonymous',
  route: 'admin/observability/probes/snapshots',
  handler: withAuth(withTelemetry(async (
    request: HttpRequest, _context: InvocationContext, auth,
  ): Promise<HttpResponseInit> => {
    const reqId = extractOrGenerateRequestId(request);
    const denied = checkAuth(auth, reqId);
    if (denied) return denied;

    const body = (await request.json()) as Record<string, unknown>;
    if (!body.snapshotId || typeof body.snapshotId !== 'string') {
      return errorResponse(400, 'VALIDATION_ERROR', 'snapshotId is required', reqId);
    }
    if (!body.capturedAt || typeof body.capturedAt !== 'string') {
      return errorResponse(400, 'VALIDATION_ERROR', 'capturedAt is required', reqId);
    }

    const services = createAdminControlPlaneServiceFactory();
    const result = await services.observabilityProbeStore.saveSnapshot(body as never);
    return successResponse(result, 202);
  }, { domain: 'observability', operation: 'submitProbeSnapshot' })),
});

app.http('obsListProbeSnapshots', {
  methods: ['GET'],
  authLevel: 'anonymous',
  route: 'admin/observability/probes/history',
  handler: withAuth(withTelemetry(async (
    request: HttpRequest, _context: InvocationContext, auth,
  ): Promise<HttpResponseInit> => {
    const reqId = extractOrGenerateRequestId(request);
    const denied = checkAuth(auth, reqId);
    if (denied) return denied;

    const services = createAdminControlPlaneServiceFactory();
    const query: IObservabilityProbeSnapshotQuery = {
      probeKey: (request.query.get('probeKey') as IObservabilityProbeSnapshotQuery['probeKey']) ?? null,
      from: request.query.get('from') ?? null,
      to: request.query.get('to') ?? null,
      cursor: request.query.get('cursor') ?? null,
      limit: Math.min(200, getQueryInt(request, 'limit', 50)),
    };

    const result = await services.observabilityProbeStore.listSnapshots(query);
    return successResponse(result);
  }, { domain: 'observability', operation: 'listProbeSnapshots' })),
});

app.http('obsGetProbeHealthSummary', {
  methods: ['GET'],
  authLevel: 'anonymous',
  route: 'admin/observability/probes/health',
  handler: withAuth(withTelemetry(async (
    request: HttpRequest, _context: InvocationContext, auth,
  ): Promise<HttpResponseInit> => {
    const reqId = extractOrGenerateRequestId(request);
    const denied = checkAuth(auth, reqId);
    if (denied) return denied;

    const services = createAdminControlPlaneServiceFactory();
    const summary = await services.observabilityProbeStore.getHealthSummary();
    return successResponse(summary);
  }, { domain: 'observability', operation: 'getProbeHealthSummary' })),
});

// ─── Error Endpoints ────────────────────────────────────────────────────────────

app.http('obsListErrors', {
  methods: ['GET'],
  authLevel: 'anonymous',
  route: 'admin/observability/errors',
  handler: withAuth(withTelemetry(async (
    request: HttpRequest, _context: InvocationContext, auth,
  ): Promise<HttpResponseInit> => {
    const reqId = extractOrGenerateRequestId(request);
    const denied = checkAuth(auth, reqId);
    if (denied) return denied;

    const services = createAdminControlPlaneServiceFactory();
    const query: IObservabilityErrorQuery = {
      domain: (request.query.get('domain') as IObservabilityErrorQuery['domain']) ?? null,
      source: (request.query.get('source') as IObservabilityErrorQuery['source']) ?? null,
      classification: (request.query.get('classification') as IObservabilityErrorQuery['classification']) ?? null,
      severity: (request.query.get('severity') as IObservabilityErrorQuery['severity']) ?? null,
      runId: request.query.get('runId') ?? null,
      from: request.query.get('from') ?? null,
      to: request.query.get('to') ?? null,
      cursor: request.query.get('cursor') ?? null,
      limit: Math.min(200, getQueryInt(request, 'limit', 50)),
    };

    const result = await services.observabilityErrorStore.listErrors(query);
    return successResponse(result);
  }, { domain: 'observability', operation: 'listErrors' })),
});

app.http('obsGetError', {
  methods: ['GET'],
  authLevel: 'anonymous',
  route: 'admin/observability/errors/{errorId}',
  handler: withAuth(withTelemetry(async (
    request: HttpRequest, _context: InvocationContext, auth,
  ): Promise<HttpResponseInit> => {
    const reqId = extractOrGenerateRequestId(request);
    const denied = checkAuth(auth, reqId);
    if (denied) return denied;

    const errorId = getParam(request, 'errorId');
    if (!errorId) return errorResponse(400, 'VALIDATION_ERROR', 'errorId is required', reqId);

    const services = createAdminControlPlaneServiceFactory();
    const error = await services.observabilityErrorStore.getError(errorId);
    if (!error) return errorResponse(404, 'NOT_FOUND', `Error ${errorId} not found`, reqId);

    return successResponse(error);
  }, { domain: 'observability', operation: 'getError' })),
});

app.http('obsIngestErrors', {
  methods: ['POST'],
  authLevel: 'anonymous',
  route: 'admin/observability/errors/ingest',
  handler: withAuth(withTelemetry(async (
    request: HttpRequest, _context: InvocationContext, auth,
  ): Promise<HttpResponseInit> => {
    const reqId = extractOrGenerateRequestId(request);
    const denied = checkAuth(auth, reqId);
    if (denied) return denied;

    const body = (await request.json()) as Record<string, unknown>;
    if (!body.errors || !Array.isArray(body.errors)) {
      return errorResponse(400, 'VALIDATION_ERROR', 'errors array is required', reqId);
    }

    const services = createAdminControlPlaneServiceFactory();
    const result = await services.observabilityErrorStore.ingestErrors(body as never);
    return successResponse(result, 202);
  }, { domain: 'observability', operation: 'ingestErrors' })),
});

// ─── Dashboard and Timeline Endpoints ───────────────────────────────────────────

app.http('obsGetDashboardSummary', {
  methods: ['GET'],
  authLevel: 'anonymous',
  route: 'admin/observability/dashboard',
  handler: withAuth(withTelemetry(async (
    request: HttpRequest, _context: InvocationContext, auth,
  ): Promise<HttpResponseInit> => {
    const reqId = extractOrGenerateRequestId(request);
    const denied = checkAuth(auth, reqId);
    if (denied) return denied;

    const services = createAdminControlPlaneServiceFactory();
    const summary = await assembleDashboardSummary(
      services.observabilityAlertStore,
      services.observabilityProbeStore,
      services.observabilityErrorStore,
    );
    return successResponse(summary);
  }, { domain: 'observability', operation: 'getDashboardSummary' })),
});

app.http('obsGetRunTimeline', {
  methods: ['GET'],
  authLevel: 'anonymous',
  route: 'admin/observability/timeline/{runId}',
  handler: withAuth(withTelemetry(async (
    request: HttpRequest, _context: InvocationContext, auth,
  ): Promise<HttpResponseInit> => {
    const reqId = extractOrGenerateRequestId(request);
    const denied = checkAuth(auth, reqId);
    if (denied) return denied;

    const runId = getParam(request, 'runId');
    if (!runId) return errorResponse(400, 'VALIDATION_ERROR', 'runId is required', reqId);

    const limit = Math.min(200, getQueryInt(request, 'limit', 100));

    const services = createAdminControlPlaneServiceFactory();
    const timeline = await assembleRunTimeline(
      services.auditService,
      services.observabilityAlertStore,
      services.observabilityErrorStore,
      runId,
      limit,
    );
    return successResponse(timeline);
  }, { domain: 'observability', operation: 'getRunTimeline' })),
});
