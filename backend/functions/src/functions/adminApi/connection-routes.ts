/**
 * P9-09: Connection management API routes.
 *
 * Registers authenticated API endpoints for hybrid identity connection
 * management under /api/admin/connections/. Delegates to the
 * ConnectionRegistryService for CRUD and health-test operations.
 *
 * Route table:
 *   GET    /api/admin/connections                     — List all connections
 *   POST   /api/admin/connections                     — Upsert a connection
 *   POST   /api/admin/connections/{connectorId}/test  — Test a connection
 */

import { app, type HttpRequest, type HttpResponseInit, type InvocationContext } from '@azure/functions';
import { withAuth } from '../../middleware/auth.js';
import { extractOrGenerateRequestId } from '../../middleware/request-id.js';
import { requireAdmin, requireDelegatedScope } from '../../middleware/authorization.js';
import { createAdminControlPlaneServiceFactory } from '../../hosts/admin-control-plane/service-factory.js';
import { errorResponse, successResponse } from '../../utils/response-helpers.js';
import { withTelemetry } from '../../utils/withTelemetry.js';
import type { ConnectorClass } from '../../services/connection-registry-service.js';

// ─── GET /api/admin/connections ───────────────────────────────────────────────

app.http('adminListConnections', {
  methods: ['GET'],
  authLevel: 'anonymous',
  route: 'admin/connections',
  handler: withAuth(withTelemetry(async (request: HttpRequest, _context: InvocationContext, auth): Promise<HttpResponseInit> => {
    const reqId = extractOrGenerateRequestId(request);
    const scopeDenied = requireDelegatedScope(auth.claims as never, reqId);
    if (scopeDenied) return scopeDenied;

    const services = createAdminControlPlaneServiceFactory();
    const connections = await services.connectionRegistry.listConnections();

    return successResponse({ connections });
  }, { domain: 'adminControlPlane', operation: 'listConnections' })),
});

// ─── POST /api/admin/connections ──────────────────────────────────────────────

app.http('adminUpsertConnection', {
  methods: ['POST'],
  authLevel: 'anonymous',
  route: 'admin/connections',
  handler: withAuth(withTelemetry(async (request: HttpRequest, _context: InvocationContext, auth): Promise<HttpResponseInit> => {
    const reqId = extractOrGenerateRequestId(request);
    const scopeDenied = requireDelegatedScope(auth.claims as never, reqId);
    if (scopeDenied) return scopeDenied;
    const adminDenied = requireAdmin(auth.claims as never, reqId);
    if (adminDenied) return adminDenied;

    const services = createAdminControlPlaneServiceFactory();
    const body = (await request.json()) as Record<string, unknown>;

    if (!body.connectorId || typeof body.connectorId !== 'string') {
      return errorResponse(400, 'VALIDATION_ERROR', 'connectorId is required', reqId);
    }
    if (!body.connectorClass || typeof body.connectorClass !== 'string') {
      return errorResponse(400, 'VALIDATION_ERROR', 'connectorClass is required', reqId);
    }
    if (!body.displayName || typeof body.displayName !== 'string') {
      return errorResponse(400, 'VALIDATION_ERROR', 'displayName is required', reqId);
    }

    const record = await services.connectionRegistry.upsertConnection(
      body.connectorId as string,
      {
        connectorClass: body.connectorClass as ConnectorClass,
        displayName: body.displayName as string,
        config: (body.config as Record<string, unknown>) ?? {},
        credential: body.credential as string | undefined,
        policyToggles: body.policyToggles as Record<string, boolean> | undefined,
      },
      auth.claims.upn,
    );

    return successResponse(record, 201);
  }, { domain: 'adminControlPlane', operation: 'upsertConnection' })),
});

// ─── POST /api/admin/connections/{connectorId}/test ───────────────────────────

app.http('adminTestConnection', {
  methods: ['POST'],
  authLevel: 'anonymous',
  route: 'admin/connections/{connectorId}/test',
  handler: withAuth(withTelemetry(async (request: HttpRequest, _context: InvocationContext, auth): Promise<HttpResponseInit> => {
    const reqId = extractOrGenerateRequestId(request);
    const scopeDenied = requireDelegatedScope(auth.claims as never, reqId);
    if (scopeDenied) return scopeDenied;
    const adminDenied = requireAdmin(auth.claims as never, reqId);
    if (adminDenied) return adminDenied;

    const services = createAdminControlPlaneServiceFactory();
    const connectorId = request.params.connectorId ?? '';

    if (!connectorId) {
      return errorResponse(400, 'VALIDATION_ERROR', 'connectorId is required', reqId);
    }

    try {
      const result = await services.connectionRegistry.testConnection(connectorId, auth.claims.upn);
      return successResponse(result);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Test failed';
      return errorResponse(404, 'NOT_FOUND', message, reqId);
    }
  }, { domain: 'adminControlPlane', operation: 'testConnection' })),
});

// ─── GET /api/admin/connections/{connectorId}/history ────────────────────────

app.http('adminGetConnectionHistory', {
  methods: ['GET'],
  authLevel: 'anonymous',
  route: 'admin/connections/{connectorId}/history',
  handler: withAuth(withTelemetry(async (request: HttpRequest, _context: InvocationContext, auth): Promise<HttpResponseInit> => {
    const reqId = extractOrGenerateRequestId(request);
    const scopeDenied = requireDelegatedScope(auth.claims as never, reqId);
    if (scopeDenied) return scopeDenied;

    const services = createAdminControlPlaneServiceFactory();
    const connectorId = request.params.connectorId ?? '';

    if (!connectorId) {
      return errorResponse(400, 'VALIDATION_ERROR', 'connectorId is required', reqId);
    }

    const history = await services.connectionRegistry.getConnectionHistory(connectorId);
    return successResponse({ connectorId, history });
  }, { domain: 'adminControlPlane', operation: 'getConnectionHistory' })),
});

// ─── PATCH /api/admin/connections/{connectorId}/policy ──────────────────────

app.http('adminUpdateConnectionPolicy', {
  methods: ['PATCH'],
  authLevel: 'anonymous',
  route: 'admin/connections/{connectorId}/policy',
  handler: withAuth(withTelemetry(async (request: HttpRequest, _context: InvocationContext, auth): Promise<HttpResponseInit> => {
    const reqId = extractOrGenerateRequestId(request);
    const scopeDenied = requireDelegatedScope(auth.claims as never, reqId);
    if (scopeDenied) return scopeDenied;
    const adminDenied = requireAdmin(auth.claims as never, reqId);
    if (adminDenied) return adminDenied;

    const services = createAdminControlPlaneServiceFactory();
    const connectorId = request.params.connectorId ?? '';

    if (!connectorId) {
      return errorResponse(400, 'VALIDATION_ERROR', 'connectorId is required', reqId);
    }

    const body = (await request.json()) as Record<string, unknown>;
    const toggles: Record<string, boolean> = {};
    for (const key of ['enabled', 'dryRunOnly', 'productionLaunchAllowed', 'highRiskCheckpointRequired']) {
      if (typeof body[key] === 'boolean') {
        toggles[key] = body[key] as boolean;
      }
    }

    try {
      const record = await services.connectionRegistry.updatePolicyToggles(connectorId, toggles, auth.claims.upn);
      return successResponse(record);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Update failed';
      return errorResponse(404, 'NOT_FOUND', message, reqId);
    }
  }, { domain: 'adminControlPlane', operation: 'updateConnectionPolicy' })),
});
