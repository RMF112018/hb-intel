/**
 * Admin Control Plane — app-binding API routes.
 *
 * Registers the API endpoints for managed-app binding operations:
 * get, list, publish, verify, and repair.
 *
 * Route table:
 *   GET    /api/admin/apps/{appId}/binding          — Get binding for a managed app
 *   GET    /api/admin/apps/bindings                  — List all app bindings
 *   POST   /api/admin/apps/{appId}/binding/publish   — Publish or update binding
 *   POST   /api/admin/apps/{appId}/binding/verify    — Verify binding against live state
 *   POST   /api/admin/apps/{appId}/binding/repair    — Repair a drifted binding
 *
 * See: Phase 6A binding architecture (P6A-02), shared contracts (P6A-03)
 *
 * @module admin-control-plane/routes
 */

import { app, type HttpRequest, type HttpResponseInit, type InvocationContext } from '@azure/functions';
import type { BackendMode } from '@hbc/models/admin-control-plane';
import { withAuth } from '../../middleware/auth.js';
import { extractOrGenerateRequestId } from '../../middleware/request-id.js';
import { requireAdmin, requireDelegatedScope } from '../../middleware/authorization.js';
import { createAdminControlPlaneServiceFactory } from '../../hosts/admin-control-plane/service-factory.js';
import { errorResponse, successResponse } from '../../utils/response-helpers.js';
import { withTelemetry } from '../../utils/withTelemetry.js';

// ── Get App Binding ──────────────────────────────────────────────────────────

/**
 * GET /api/admin/apps/{appId}/binding — Get binding for a managed app.
 *
 * Response: 200 with binding record, or 404 if not configured.
 */
app.http('adminGetAppBinding', {
  methods: ['GET'],
  authLevel: 'anonymous',
  route: 'admin/apps/{appId}/binding',
  handler: withAuth(withTelemetry(async (request: HttpRequest, _context: InvocationContext, auth): Promise<HttpResponseInit> => {
    const reqId = extractOrGenerateRequestId(request);

    const scopeDenied = requireDelegatedScope(auth.claims, reqId);
    if (scopeDenied) return scopeDenied;
    const adminDenied = requireAdmin(auth.claims, reqId);
    if (adminDenied) return adminDenied;

    const appId = request.params.appId ?? '';
    if (!appId) {
      return errorResponse(400, 'VALIDATION_ERROR', 'appId is required', reqId);
    }

    const services = createAdminControlPlaneServiceFactory();
    const binding = await services.bindingService.getBinding(appId);

    if (!binding) {
      return errorResponse(404, 'NOT_FOUND', `No binding configured for app '${appId}'`, reqId);
    }

    return successResponse(binding);
  }, { domain: 'adminControlPlane', operation: 'getAppBinding' })),
});

// ── List App Bindings ────────────────────────────────────────────────────────

/**
 * GET /api/admin/apps/bindings — List binding status for all managed apps.
 *
 * Response: 200 with array of binding records.
 */
app.http('adminListAppBindings', {
  methods: ['GET'],
  authLevel: 'anonymous',
  route: 'admin/apps/bindings',
  handler: withAuth(withTelemetry(async (request: HttpRequest, _context: InvocationContext, auth): Promise<HttpResponseInit> => {
    const reqId = extractOrGenerateRequestId(request);

    const scopeDenied = requireDelegatedScope(auth.claims, reqId);
    if (scopeDenied) return scopeDenied;
    const adminDenied = requireAdmin(auth.claims, reqId);
    if (adminDenied) return adminDenied;

    const services = createAdminControlPlaneServiceFactory();
    const bindings = await services.bindingService.listBindings();

    return successResponse(bindings);
  }, { domain: 'adminControlPlane', operation: 'listAppBindings' })),
});

// ── Publish App Binding ──────────────────────────────────────────────────────

/**
 * POST /api/admin/apps/{appId}/binding/publish — Publish or update a binding.
 *
 * Request: IAppBindingPublishRequest
 * Response: 201/200 IAppBindingPublishResult
 */
app.http('adminPublishAppBinding', {
  methods: ['POST'],
  authLevel: 'anonymous',
  route: 'admin/apps/{appId}/binding/publish',
  handler: withAuth(withTelemetry(async (request: HttpRequest, _context: InvocationContext, auth): Promise<HttpResponseInit> => {
    const reqId = extractOrGenerateRequestId(request);

    const scopeDenied = requireDelegatedScope(auth.claims, reqId);
    if (scopeDenied) return scopeDenied;
    const adminDenied = requireAdmin(auth.claims, reqId);
    if (adminDenied) return adminDenied;

    const appId = request.params.appId ?? '';
    if (!appId) {
      return errorResponse(400, 'VALIDATION_ERROR', 'appId is required', reqId);
    }

    const body = (await request.json()) as Record<string, unknown>;

    if (!body.functionAppUrl || typeof body.functionAppUrl !== 'string') {
      return errorResponse(400, 'VALIDATION_ERROR', 'functionAppUrl is required', reqId);
    }
    if (!body.apiAudience || typeof body.apiAudience !== 'string') {
      return errorResponse(400, 'VALIDATION_ERROR', 'apiAudience is required', reqId);
    }

    const services = createAdminControlPlaneServiceFactory();
    const actor = services.actorContextResolver.resolve({
      upn: auth.claims.upn,
      oid: auth.claims.oid,
      displayName: auth.claims.displayName ?? auth.claims.upn,
    });

    const publishRequest = {
      appId,
      functionAppUrl: body.functionAppUrl as string,
      apiAudience: body.apiAudience as string,
      backendMode: ((body.backendMode as string) ?? 'production') as BackendMode,
      allowBackendModeSwitch: body.allowBackendModeSwitch === true,
      publishSource: (body.publishSource as string) ?? 'manual-publish',
    };

    const result = await services.bindingService.publishBinding(publishRequest, actor);
    return successResponse(result, result.created ? 201 : 200);
  }, { domain: 'adminControlPlane', operation: 'publishAppBinding' })),
});

// ── Verify App Binding ───────────────────────────────────────────────────────

/**
 * POST /api/admin/apps/{appId}/binding/verify — Verify binding against live state.
 *
 * Response: 200 IAppBindingVerificationResult
 */
app.http('adminVerifyAppBinding', {
  methods: ['POST'],
  authLevel: 'anonymous',
  route: 'admin/apps/{appId}/binding/verify',
  handler: withAuth(withTelemetry(async (request: HttpRequest, _context: InvocationContext, auth): Promise<HttpResponseInit> => {
    const reqId = extractOrGenerateRequestId(request);

    const scopeDenied = requireDelegatedScope(auth.claims, reqId);
    if (scopeDenied) return scopeDenied;
    const adminDenied = requireAdmin(auth.claims, reqId);
    if (adminDenied) return adminDenied;

    const appId = request.params.appId ?? '';
    if (!appId) {
      return errorResponse(400, 'VALIDATION_ERROR', 'appId is required', reqId);
    }

    const services = createAdminControlPlaneServiceFactory();
    const result = await services.bindingService.verifyBinding(appId);

    return successResponse(result);
  }, { domain: 'adminControlPlane', operation: 'verifyAppBinding' })),
});

// ── Repair App Binding ───────────────────────────────────────────────────────

/**
 * POST /api/admin/apps/{appId}/binding/repair — Repair a drifted binding.
 *
 * Request: IAppBindingRepairRequest
 * Response: 200 IAppBindingRepairResult
 */
app.http('adminRepairAppBinding', {
  methods: ['POST'],
  authLevel: 'anonymous',
  route: 'admin/apps/{appId}/binding/repair',
  handler: withAuth(withTelemetry(async (request: HttpRequest, _context: InvocationContext, auth): Promise<HttpResponseInit> => {
    const reqId = extractOrGenerateRequestId(request);

    const scopeDenied = requireDelegatedScope(auth.claims, reqId);
    if (scopeDenied) return scopeDenied;
    const adminDenied = requireAdmin(auth.claims, reqId);
    if (adminDenied) return adminDenied;

    const appId = request.params.appId ?? '';
    if (!appId) {
      return errorResponse(400, 'VALIDATION_ERROR', 'appId is required', reqId);
    }

    const body = (await request.json()) as Record<string, unknown>;

    const services = createAdminControlPlaneServiceFactory();
    const actor = services.actorContextResolver.resolve({
      upn: auth.claims.upn,
      oid: auth.claims.oid,
      displayName: auth.claims.displayName ?? auth.claims.upn,
    });

    const repairRequest = {
      appId,
      functionAppUrl: (body.functionAppUrl as string) ?? null,
      apiAudience: (body.apiAudience as string) ?? null,
      backendMode: (body.backendMode as BackendMode) ?? null,
      allowBackendModeSwitch: body.allowBackendModeSwitch != null ? Boolean(body.allowBackendModeSwitch) : null,
      rationale: (body.rationale as string) ?? '',
    };

    const result = await services.bindingService.repairBinding(repairRequest, actor);
    return successResponse(result);
  }, { domain: 'adminControlPlane', operation: 'repairAppBinding' })),
});
