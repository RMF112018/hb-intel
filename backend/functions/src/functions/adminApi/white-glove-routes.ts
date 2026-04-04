/**
 * P9.1-04: White-glove device deployment API routes.
 *
 * Registers authenticated API endpoints for white-glove package run
 * management under /api/admin/white-glove/. Delegates to the
 * WhiteGloveRunService for orchestration.
 *
 * Route table:
 *   POST   /api/admin/white-glove/runs                                    — Launch package run
 *   GET    /api/admin/white-glove/runs                                    — List package runs
 *   GET    /api/admin/white-glove/runs/{runId}                            — Get package run result
 *   POST   /api/admin/white-glove/runs/{runId}/cancel                     — Cancel package run
 *   POST   /api/admin/white-glove/runs/{runId}/retry                      — Retry package run
 *   GET    /api/admin/white-glove/devices/{deviceRunId}                   — Get device run detail
 *   POST   /api/admin/white-glove/devices/{deviceRunId}/retry             — Retry device run
 *   POST   /api/admin/white-glove/devices/{deviceRunId}/checkpoint/{cpId} — Resolve checkpoint
 */

import { app, type HttpRequest, type HttpResponseInit, type InvocationContext } from '@azure/functions';
import { withAuth } from '../../middleware/auth.js';
import { extractOrGenerateRequestId } from '../../middleware/request-id.js';
import { requireAdmin, requireDelegatedScope } from '../../middleware/authorization.js';
import { createAdminControlPlaneServiceFactory } from '../../hosts/admin-control-plane/service-factory.js';
import { errorResponse, successResponse } from '../../utils/response-helpers.js';
import { withTelemetry } from '../../utils/withTelemetry.js';
import { AdminDomain, ObservabilityErrorSource } from '@hbc/models/admin-control-plane';
import { emitRouteError } from './observability-emitter.js';

// ─── POST /api/admin/white-glove/runs ───────────────────────────────────────

app.http('wgLaunchPackageRun', {
  methods: ['POST'],
  authLevel: 'anonymous',
  route: 'admin/white-glove/runs',
  handler: withAuth(withTelemetry(async (request: HttpRequest, _context: InvocationContext, auth): Promise<HttpResponseInit> => {
    const reqId = extractOrGenerateRequestId(request);
    const scopeDenied = requireDelegatedScope(auth.claims as never, reqId);
    if (scopeDenied) return scopeDenied;
    const adminDenied = requireAdmin(auth.claims as never, reqId);
    if (adminDenied) return adminDenied;

    const services = createAdminControlPlaneServiceFactory();
    const body = (await request.json()) as Record<string, unknown>;

    if (!body.packageFamily || typeof body.packageFamily !== 'string') {
      return errorResponse(400, 'VALIDATION_ERROR', 'packageFamily is required', reqId);
    }
    if (!body.employeeUpn || typeof body.employeeUpn !== 'string') {
      return errorResponse(400, 'VALIDATION_ERROR', 'employeeUpn is required', reqId);
    }
    if (!Array.isArray(body.devices) || body.devices.length === 0) {
      return errorResponse(400, 'VALIDATION_ERROR', 'devices array is required and must not be empty', reqId);
    }

    const actor = services.actorContextResolver.resolve({
      upn: auth.claims.upn,
      oid: auth.claims.oid,
      displayName: auth.claims.displayName ?? auth.claims.upn,
    });

    try {
      const result = await services.whiteGloveRunService.launchPackageRun(body as never, actor);
      return successResponse(result, 202);
    } catch (err) {
      emitRouteError(services, { domain: AdminDomain.WhiteGloveDeployment, source: ObservabilityErrorSource.WhiteGloveDeployment, operation: 'launchPackageRun', runId: null, actionKey: 'white-glove.launch' }, err);
      const message = err instanceof Error ? err.message : 'Launch failed';
      return errorResponse(400, 'LAUNCH_ERROR', message, reqId);
    }
  }, { domain: 'whiteGloveDeployment', operation: 'launchPackageRun' })),
});

// ─── GET /api/admin/white-glove/runs ────────────────────────────────────────

app.http('wgListPackageRuns', {
  methods: ['GET'],
  authLevel: 'anonymous',
  route: 'admin/white-glove/runs',
  handler: withAuth(withTelemetry(async (request: HttpRequest, _context: InvocationContext, auth): Promise<HttpResponseInit> => {
    const reqId = extractOrGenerateRequestId(request);
    const scopeDenied = requireDelegatedScope(auth.claims as never, reqId);
    if (scopeDenied) return scopeDenied;

    const services = createAdminControlPlaneServiceFactory();
    const page = parseInt(request.query.get('page') ?? '1', 10);
    const pageSize = parseInt(request.query.get('pageSize') ?? '25', 10);
    const status = request.query.get('status') ?? undefined;

    const result = await services.whiteGloveRunService.listPackageRuns({ page, pageSize, status });

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
  }, { domain: 'whiteGloveDeployment', operation: 'listPackageRuns' })),
});

// ─── GET /api/admin/white-glove/runs/{runId} ────────────────────────────────

app.http('wgGetPackageRun', {
  methods: ['GET'],
  authLevel: 'anonymous',
  route: 'admin/white-glove/runs/{runId}',
  handler: withAuth(withTelemetry(async (request: HttpRequest, _context: InvocationContext, auth): Promise<HttpResponseInit> => {
    const reqId = extractOrGenerateRequestId(request);
    const scopeDenied = requireDelegatedScope(auth.claims as never, reqId);
    if (scopeDenied) return scopeDenied;

    const services = createAdminControlPlaneServiceFactory();
    const runId = request.params.runId ?? '';

    if (!runId) return errorResponse(400, 'VALIDATION_ERROR', 'runId is required', reqId);

    const result = await services.whiteGloveRunService.getPackageRun(runId);
    if (!result) return errorResponse(404, 'NOT_FOUND', `Package run ${runId} not found`, reqId);

    return successResponse(result);
  }, { domain: 'whiteGloveDeployment', operation: 'getPackageRun' })),
});

// ─── POST /api/admin/white-glove/runs/{runId}/cancel ────────────────────────

app.http('wgCancelPackageRun', {
  methods: ['POST'],
  authLevel: 'anonymous',
  route: 'admin/white-glove/runs/{runId}/cancel',
  handler: withAuth(withTelemetry(async (request: HttpRequest, _context: InvocationContext, auth): Promise<HttpResponseInit> => {
    const reqId = extractOrGenerateRequestId(request);
    const scopeDenied = requireDelegatedScope(auth.claims as never, reqId);
    if (scopeDenied) return scopeDenied;
    const adminDenied = requireAdmin(auth.claims as never, reqId);
    if (adminDenied) return adminDenied;

    const services = createAdminControlPlaneServiceFactory();
    const runId = request.params.runId ?? '';
    if (!runId) return errorResponse(400, 'VALIDATION_ERROR', 'runId is required', reqId);

    const body = (await request.json()) as Record<string, unknown>;
    const reason = typeof body.reason === 'string' ? body.reason : undefined;

    const actor = services.actorContextResolver.resolve({
      upn: auth.claims.upn,
      oid: auth.claims.oid,
      displayName: auth.claims.displayName ?? auth.claims.upn,
    });

    try {
      const result = await services.whiteGloveRunService.cancelPackageRun(runId, actor, reason);
      return successResponse(result);
    } catch (err) {
      emitRouteError(services, { domain: AdminDomain.WhiteGloveDeployment, source: ObservabilityErrorSource.WhiteGloveDeployment, operation: 'cancelPackageRun', runId, actionKey: 'white-glove.cancel' }, err);
      const message = err instanceof Error ? err.message : 'Cancel failed';
      if (message.includes('not found')) return errorResponse(404, 'NOT_FOUND', message, reqId);
      return errorResponse(409, 'INVALID_STATE', message, reqId);
    }
  }, { domain: 'whiteGloveDeployment', operation: 'cancelPackageRun' })),
});

// ─── POST /api/admin/white-glove/runs/{runId}/retry ─────────────────────────

app.http('wgRetryPackageRun', {
  methods: ['POST'],
  authLevel: 'anonymous',
  route: 'admin/white-glove/runs/{runId}/retry',
  handler: withAuth(withTelemetry(async (request: HttpRequest, _context: InvocationContext, auth): Promise<HttpResponseInit> => {
    const reqId = extractOrGenerateRequestId(request);
    const scopeDenied = requireDelegatedScope(auth.claims as never, reqId);
    if (scopeDenied) return scopeDenied;
    const adminDenied = requireAdmin(auth.claims as never, reqId);
    if (adminDenied) return adminDenied;

    const services = createAdminControlPlaneServiceFactory();
    const runId = request.params.runId ?? '';
    if (!runId) return errorResponse(400, 'VALIDATION_ERROR', 'runId is required', reqId);

    const actor = services.actorContextResolver.resolve({
      upn: auth.claims.upn,
      oid: auth.claims.oid,
      displayName: auth.claims.displayName ?? auth.claims.upn,
    });

    try {
      const result = await services.whiteGloveRunService.retryPackageRun(runId, actor);
      return successResponse(result, 202);
    } catch (err) {
      emitRouteError(services, { domain: AdminDomain.WhiteGloveDeployment, source: ObservabilityErrorSource.WhiteGloveDeployment, operation: 'retryPackageRun', runId, actionKey: 'white-glove.retry' }, err);
      const message = err instanceof Error ? err.message : 'Retry failed';
      if (message.includes('not found')) return errorResponse(404, 'NOT_FOUND', message, reqId);
      return errorResponse(409, 'INVALID_STATE', message, reqId);
    }
  }, { domain: 'whiteGloveDeployment', operation: 'retryPackageRun' })),
});

// ─── GET /api/admin/white-glove/devices/{deviceRunId} ───────────────────────

app.http('wgGetDeviceRun', {
  methods: ['GET'],
  authLevel: 'anonymous',
  route: 'admin/white-glove/devices/{deviceRunId}',
  handler: withAuth(withTelemetry(async (request: HttpRequest, _context: InvocationContext, auth): Promise<HttpResponseInit> => {
    const reqId = extractOrGenerateRequestId(request);
    const scopeDenied = requireDelegatedScope(auth.claims as never, reqId);
    if (scopeDenied) return scopeDenied;

    const services = createAdminControlPlaneServiceFactory();
    const deviceRunId = request.params.deviceRunId ?? '';
    if (!deviceRunId) return errorResponse(400, 'VALIDATION_ERROR', 'deviceRunId is required', reqId);

    const result = await services.whiteGloveRunService.getDeviceRun(deviceRunId);
    if (!result) return errorResponse(404, 'NOT_FOUND', `Device run ${deviceRunId} not found`, reqId);

    return successResponse(result);
  }, { domain: 'whiteGloveDeployment', operation: 'getDeviceRun' })),
});

// ─── POST /api/admin/white-glove/devices/{deviceRunId}/retry ────────────────

app.http('wgRetryDeviceRun', {
  methods: ['POST'],
  authLevel: 'anonymous',
  route: 'admin/white-glove/devices/{deviceRunId}/retry',
  handler: withAuth(withTelemetry(async (request: HttpRequest, _context: InvocationContext, auth): Promise<HttpResponseInit> => {
    const reqId = extractOrGenerateRequestId(request);
    const scopeDenied = requireDelegatedScope(auth.claims as never, reqId);
    if (scopeDenied) return scopeDenied;
    const adminDenied = requireAdmin(auth.claims as never, reqId);
    if (adminDenied) return adminDenied;

    const services = createAdminControlPlaneServiceFactory();
    const deviceRunId = request.params.deviceRunId ?? '';
    if (!deviceRunId) return errorResponse(400, 'VALIDATION_ERROR', 'deviceRunId is required', reqId);

    const actor = services.actorContextResolver.resolve({
      upn: auth.claims.upn,
      oid: auth.claims.oid,
      displayName: auth.claims.displayName ?? auth.claims.upn,
    });

    try {
      const result = await services.whiteGloveRunService.retryDeviceRun(deviceRunId, actor);
      return successResponse(result, 202);
    } catch (err) {
      emitRouteError(services, { domain: AdminDomain.WhiteGloveDeployment, source: ObservabilityErrorSource.WhiteGloveDeployment, operation: 'retryDeviceRun', runId: deviceRunId, actionKey: 'white-glove.retry-device' }, err);
      const message = err instanceof Error ? err.message : 'Retry failed';
      if (message.includes('not found')) return errorResponse(404, 'NOT_FOUND', message, reqId);
      return errorResponse(409, 'INVALID_STATE', message, reqId);
    }
  }, { domain: 'whiteGloveDeployment', operation: 'retryDeviceRun' })),
});

// ─── POST /api/admin/white-glove/devices/{deviceRunId}/checkpoint/{cpId} ────

app.http('wgResolveCheckpoint', {
  methods: ['POST'],
  authLevel: 'anonymous',
  route: 'admin/white-glove/devices/{deviceRunId}/checkpoint/{cpId}',
  handler: withAuth(withTelemetry(async (request: HttpRequest, _context: InvocationContext, auth): Promise<HttpResponseInit> => {
    const reqId = extractOrGenerateRequestId(request);
    const scopeDenied = requireDelegatedScope(auth.claims as never, reqId);
    if (scopeDenied) return scopeDenied;
    const adminDenied = requireAdmin(auth.claims as never, reqId);
    if (adminDenied) return adminDenied;

    const services = createAdminControlPlaneServiceFactory();
    const deviceRunId = request.params.deviceRunId ?? '';
    const cpId = request.params.cpId ?? '';
    if (!deviceRunId) return errorResponse(400, 'VALIDATION_ERROR', 'deviceRunId is required', reqId);
    if (!cpId) return errorResponse(400, 'VALIDATION_ERROR', 'checkpoint ID is required', reqId);

    const body = (await request.json()) as Record<string, unknown>;
    if (!['approve', 'reject'].includes(body.decision as string)) {
      return errorResponse(400, 'VALIDATION_ERROR', 'decision must be approve or reject', reqId);
    }

    const actor = services.actorContextResolver.resolve({
      upn: auth.claims.upn,
      oid: auth.claims.oid,
      displayName: auth.claims.displayName ?? auth.claims.upn,
    });

    try {
      const result = await services.whiteGloveRunService.resolveDeviceCheckpoint(
        deviceRunId,
        cpId,
        body.decision as 'approve' | 'reject',
        actor,
        typeof body.comment === 'string' ? body.comment : undefined,
      );
      return successResponse(result);
    } catch (err) {
      emitRouteError(services, { domain: AdminDomain.WhiteGloveDeployment, source: ObservabilityErrorSource.WhiteGloveDeployment, operation: 'resolveCheckpoint', runId: null, actionKey: 'white-glove.resolve-checkpoint' }, err);
      const message = err instanceof Error ? err.message : 'Checkpoint resolution failed';
      if (message.includes('not found')) return errorResponse(404, 'NOT_FOUND', message, reqId);
      return errorResponse(409, 'CHECKPOINT_ERROR', message, reqId);
    }
  }, { domain: 'whiteGloveDeployment', operation: 'resolveCheckpoint' })),
});
