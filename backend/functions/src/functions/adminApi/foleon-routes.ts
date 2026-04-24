import { app, type HttpRequest, type HttpResponseInit, type InvocationContext } from '@azure/functions';
import { withAuth, type AuthContext } from '../../middleware/auth.js';
import { extractOrGenerateRequestId } from '../../middleware/request-id.js';
import {
  authorizeFoleonRoute,
  emitAuthorizationTelemetry,
  type FoleonRouteAction,
} from '../../middleware/authorization.js';
import { errorResponse, successResponse } from '../../utils/response-helpers.js';
import { withTelemetry } from '../../utils/withTelemetry.js';
import { createLogger } from '../../utils/logger.js';
import {
  createFoleonService,
  FoleonServiceError,
  type IFoleonService,
} from '../../services/foleon-service.js';
import type {
  FoleonContentMutationRequest,
  FoleonPlacementMutationRequest,
} from '../../services/foleon-types.js';

function authorizeFoleonCommandRoute(
  action: FoleonRouteAction,
  context: InvocationContext,
  auth: AuthContext,
  requestId: string,
): HttpResponseInit | null {
  const decision = authorizeFoleonRoute(auth.claims, action, requestId);
  const logger = createLogger(context);
  emitAuthorizationTelemetry(logger, {
    action: `foleon-route-${action}`,
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

function routeFailure(err: unknown, requestId: string): HttpResponseInit {
  if (err instanceof FoleonServiceError) {
    return errorResponse(err.status, err.code, err.message, requestId, {
      retryable: err.retryable,
      ...(err.details ?? {}),
    });
  }
  const message = err instanceof Error ? err.message : String(err);
  return errorResponse(500, 'FOLEON_SYNC_FAILED', message, requestId, { retryable: false });
}

async function readJsonBody<T>(request: HttpRequest): Promise<T> {
  return await request.json() as T;
}

function service(): IFoleonService {
  return createFoleonService();
}

app.http('foleonListContent', {
  methods: ['GET'],
  authLevel: 'anonymous',
  route: 'foleon/content',
  handler: withAuth(
    withTelemetry(async (_request, context, auth): Promise<HttpResponseInit> => {
      const requestId = extractOrGenerateRequestId(_request);
      const denied = authorizeFoleonCommandRoute('view', context, auth, requestId);
      if (denied) return denied;
      try {
        return successResponse(await service().listContent());
      } catch (err) {
        return routeFailure(err, requestId);
      }
    }, { domain: 'foleon', operation: 'listContent' }),
  ),
});

app.http('foleonGetContent', {
  methods: ['GET'],
  authLevel: 'anonymous',
  route: 'foleon/content/{id}',
  handler: withAuth(
    withTelemetry(async (request, context, auth): Promise<HttpResponseInit> => {
      const requestId = extractOrGenerateRequestId(request);
      const denied = authorizeFoleonCommandRoute('view', context, auth, requestId);
      if (denied) return denied;
      try {
        return successResponse(await service().getContent(String(request.params.id)));
      } catch (err) {
        return routeFailure(err, requestId);
      }
    }, { domain: 'foleon', operation: 'getContent' }),
  ),
});

app.http('foleonCreateContent', {
  methods: ['POST'],
  authLevel: 'anonymous',
  route: 'foleon/content',
  handler: withAuth(
    withTelemetry(async (request, context, auth): Promise<HttpResponseInit> => {
      const requestId = extractOrGenerateRequestId(request);
      const denied = authorizeFoleonCommandRoute('edit', context, auth, requestId);
      if (denied) return denied;
      try {
        const body = await readJsonBody<FoleonContentMutationRequest>(request);
        return successResponse(await service().createContent(body, requestId), 201);
      } catch (err) {
        return routeFailure(err, requestId);
      }
    }, { domain: 'foleon', operation: 'createContent' }),
  ),
});

app.http('foleonUpdateContent', {
  methods: ['PATCH'],
  authLevel: 'anonymous',
  route: 'foleon/content/{id}',
  handler: withAuth(
    withTelemetry(async (request, context, auth): Promise<HttpResponseInit> => {
      const requestId = extractOrGenerateRequestId(request);
      const denied = authorizeFoleonCommandRoute('edit', context, auth, requestId);
      if (denied) return denied;
      try {
        const body = await readJsonBody<FoleonContentMutationRequest>(request);
        return successResponse(await service().updateContent(String(request.params.id), body, requestId));
      } catch (err) {
        return routeFailure(err, requestId);
      }
    }, { domain: 'foleon', operation: 'updateContent' }),
  ),
});

app.http('foleonValidateContent', {
  methods: ['POST'],
  authLevel: 'anonymous',
  route: 'foleon/content/{id}/validate',
  handler: withAuth(
    withTelemetry(async (request, context, auth): Promise<HttpResponseInit> => {
      const requestId = extractOrGenerateRequestId(request);
      const denied = authorizeFoleonCommandRoute('edit', context, auth, requestId);
      if (denied) return denied;
      try {
        return successResponse(await service().validateContent(String(request.params.id), requestId));
      } catch (err) {
        return routeFailure(err, requestId);
      }
    }, { domain: 'foleon', operation: 'validateContent' }),
  ),
});

app.http('foleonPublishContent', {
  methods: ['POST'],
  authLevel: 'anonymous',
  route: 'foleon/content/{id}/publish',
  handler: withAuth(
    withTelemetry(async (request, context, auth): Promise<HttpResponseInit> => {
      const requestId = extractOrGenerateRequestId(request);
      const denied = authorizeFoleonCommandRoute('publish', context, auth, requestId);
      if (denied) return denied;
      try {
        return successResponse(await service().publishContent(String(request.params.id), requestId));
      } catch (err) {
        return routeFailure(err, requestId);
      }
    }, { domain: 'foleon', operation: 'publishContent' }),
  ),
});

app.http('foleonSuppressContent', {
  methods: ['POST'],
  authLevel: 'anonymous',
  route: 'foleon/content/{id}/suppress',
  handler: withAuth(
    withTelemetry(async (request, context, auth): Promise<HttpResponseInit> => {
      const requestId = extractOrGenerateRequestId(request);
      const denied = authorizeFoleonCommandRoute('publish', context, auth, requestId);
      if (denied) return denied;
      try {
        return successResponse(await service().suppressContent(String(request.params.id), requestId));
      } catch (err) {
        return routeFailure(err, requestId);
      }
    }, { domain: 'foleon', operation: 'suppressContent' }),
  ),
});

app.http('foleonListPlacements', {
  methods: ['GET'],
  authLevel: 'anonymous',
  route: 'foleon/placements',
  handler: withAuth(
    withTelemetry(async (request, context, auth): Promise<HttpResponseInit> => {
      const requestId = extractOrGenerateRequestId(request);
      const denied = authorizeFoleonCommandRoute('view', context, auth, requestId);
      if (denied) return denied;
      try {
        return successResponse(await service().listPlacements());
      } catch (err) {
        return routeFailure(err, requestId);
      }
    }, { domain: 'foleon', operation: 'listPlacements' }),
  ),
});

app.http('foleonCreatePlacement', {
  methods: ['POST'],
  authLevel: 'anonymous',
  route: 'foleon/placements',
  handler: withAuth(
    withTelemetry(async (request, context, auth): Promise<HttpResponseInit> => {
      const requestId = extractOrGenerateRequestId(request);
      const denied = authorizeFoleonCommandRoute('place', context, auth, requestId);
      if (denied) return denied;
      try {
        const body = await readJsonBody<FoleonPlacementMutationRequest>(request);
        return successResponse(await service().createPlacement(body, requestId), 201);
      } catch (err) {
        return routeFailure(err, requestId);
      }
    }, { domain: 'foleon', operation: 'createPlacement' }),
  ),
});

app.http('foleonUpdatePlacement', {
  methods: ['PATCH'],
  authLevel: 'anonymous',
  route: 'foleon/placements/{id}',
  handler: withAuth(
    withTelemetry(async (request, context, auth): Promise<HttpResponseInit> => {
      const requestId = extractOrGenerateRequestId(request);
      const denied = authorizeFoleonCommandRoute('place', context, auth, requestId);
      if (denied) return denied;
      try {
        const body = await readJsonBody<FoleonPlacementMutationRequest>(request);
        return successResponse(await service().updatePlacement(String(request.params.id), body, requestId));
      } catch (err) {
        return routeFailure(err, requestId);
      }
    }, { domain: 'foleon', operation: 'updatePlacement' }),
  ),
});

app.http('foleonDeletePlacement', {
  methods: ['DELETE'],
  authLevel: 'anonymous',
  route: 'foleon/placements/{id}',
  handler: withAuth(
    withTelemetry(async (request, context, auth): Promise<HttpResponseInit> => {
      const requestId = extractOrGenerateRequestId(request);
      const denied = authorizeFoleonCommandRoute('place', context, auth, requestId);
      if (denied) return denied;
      try {
        return successResponse(await service().deletePlacement(String(request.params.id), requestId));
      } catch (err) {
        return routeFailure(err, requestId);
      }
    }, { domain: 'foleon', operation: 'deletePlacement' }),
  ),
});

app.http('foleonSyncDocs', {
  methods: ['POST'],
  authLevel: 'anonymous',
  route: 'foleon/sync/docs',
  handler: withAuth(
    withTelemetry(async (request, context, auth): Promise<HttpResponseInit> => {
      const requestId = extractOrGenerateRequestId(request);
      const denied = authorizeFoleonCommandRoute('sync', context, auth, requestId);
      if (denied) return denied;
      return successResponse(await service().syncDocs(requestId, auth.claims.upn));
    }, { domain: 'foleon', operation: 'syncDocs' }),
  ),
});

app.http('foleonSyncProjects', {
  methods: ['POST'],
  authLevel: 'anonymous',
  route: 'foleon/sync/projects',
  handler: withAuth(
    withTelemetry(async (request, context, auth): Promise<HttpResponseInit> => {
      const requestId = extractOrGenerateRequestId(request);
      const denied = authorizeFoleonCommandRoute('sync', context, auth, requestId);
      if (denied) return denied;
      return successResponse(await service().syncProjects(requestId, auth.claims.upn));
    }, { domain: 'foleon', operation: 'syncProjects' }),
  ),
});

app.http('foleonSyncStatus', {
  methods: ['GET'],
  authLevel: 'anonymous',
  route: 'foleon/sync/status',
  handler: withAuth(
    withTelemetry(async (request, context, auth): Promise<HttpResponseInit> => {
      const requestId = extractOrGenerateRequestId(request);
      const denied = authorizeFoleonCommandRoute('view', context, auth, requestId);
      if (denied) return denied;
      return successResponse(await service().getSyncStatus());
    }, { domain: 'foleon', operation: 'syncStatus' }),
  ),
});

app.http('foleonSyncRuns', {
  methods: ['GET'],
  authLevel: 'anonymous',
  route: 'foleon/sync/runs',
  handler: withAuth(
    withTelemetry(async (request, context, auth): Promise<HttpResponseInit> => {
      const requestId = extractOrGenerateRequestId(request);
      const denied = authorizeFoleonCommandRoute('sync', context, auth, requestId);
      if (denied) return denied;
      return successResponse(await service().listSyncRuns());
    }, { domain: 'foleon', operation: 'syncRuns' }),
  ),
});

app.http('foleonProvisionSharePoint', {
  methods: ['POST'],
  authLevel: 'anonymous',
  route: 'foleon/provision-sharepoint',
  handler: withAuth(
    withTelemetry(async (request, context, auth): Promise<HttpResponseInit> => {
      const requestId = extractOrGenerateRequestId(request);
      const denied = authorizeFoleonCommandRoute('admin', context, auth, requestId);
      if (denied) return denied;
      return successResponse(await service().provisionSharePoint(requestId));
    }, { domain: 'foleon', operation: 'provisionSharePoint' }),
  ),
});

app.http('foleonValidateSharePoint', {
  methods: ['POST'],
  authLevel: 'anonymous',
  route: 'foleon/validate-sharepoint',
  handler: withAuth(
    withTelemetry(async (request, context, auth): Promise<HttpResponseInit> => {
      const requestId = extractOrGenerateRequestId(request);
      const denied = authorizeFoleonCommandRoute('admin', context, auth, requestId);
      if (denied) return denied;
      return successResponse(await service().validateSharePoint(requestId));
    }, { domain: 'foleon', operation: 'validateSharePoint' }),
  ),
});

app.http('foleonSafeConfig', {
  methods: ['GET'],
  authLevel: 'anonymous',
  route: 'foleon/config',
  handler: withAuth(
    withTelemetry(async (request, context, auth): Promise<HttpResponseInit> => {
      const requestId = extractOrGenerateRequestId(request);
      const denied = authorizeFoleonCommandRoute('view', context, auth, requestId);
      if (denied) return denied;
      return successResponse(await service().getSafeConfig());
    }, { domain: 'foleon', operation: 'safeConfig' }),
  ),
});
