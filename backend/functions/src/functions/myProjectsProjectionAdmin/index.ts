/**
 * My Projects projection — operator/admin seed + rebuild + status endpoints.
 *
 *   POST /api/admin/my-projects-projection/seed
 *     body: { dryRun?: boolean, notes?: string }
 *   POST /api/admin/my-projects-projection/rebuild
 *     body: {
 *       rebuildKind?: 'full-rebuild' | 'source-rebuild',
 *       sourceListKind?: 'Projects' | 'LegacyRegistry',
 *       dryRun?: boolean,
 *       notes?: string,
 *     }
 *   GET  /api/admin/my-projects-projection/status
 *     query: ?limit=5&runType=manual-rebuild&sourceListKind=Projects
 *
 * All business logic lives in
 * `services/my-projects-projection/admin/projection-admin-rebuild-handler.ts`.
 * Guard chain: `withAuth` → `requireDelegatedScope` → `requireAdmin`.
 */

import {
  app,
  type HttpRequest,
  type HttpResponseInit,
  type InvocationContext,
} from '@azure/functions';
import { randomUUID } from 'node:crypto';

import { withAuth, type AuthContext } from '../../middleware/auth.js';
import { requireAdmin, requireDelegatedScope } from '../../middleware/authorization.js';
import { extractOrGenerateRequestId } from '../../middleware/request-id.js';
import { withTelemetry } from '../../utils/withTelemetry.js';
import { GraphListClient } from '../../services/legacy-fallback/graph-list-client.js';
import { getProjectionConfig } from '../../services/my-projects-projection/projection-config.js';
import { SharePointProjectionControlStateRepository } from '../../services/my-projects-projection/state/sharepoint-control-state-repository.js';
import { SharePointProjectionRunRepository } from '../../services/my-projects-projection/state/sharepoint-run-repository.js';
import { SharePointStateStore } from '../../services/my-projects-projection/state/sharepoint-state-store.js';
import { createGraphMyProjectsRegistryRepository } from '../../services/my-projects-projection/registry/my-projects-registry-repository.js';
import { createGraphProjectionSourceFetchClient } from '../../services/my-projects-projection/engine/projection-source-fetch-client.js';
import { createProjectionSeedService } from '../../services/my-projects-projection/engine/projection-seed-service.js';
import {
  handleProjectionRebuild,
  handleProjectionSeed,
  handleProjectionStatus,
  type IProjectionAdminRebuildHandlerDeps,
} from '../../services/my-projects-projection/admin/projection-admin-rebuild-handler.js';

let cachedDeps: IProjectionAdminRebuildHandlerDeps | null = null;
let cachedRunRepository: SharePointProjectionRunRepository | null = null;
let cachedStore: SharePointStateStore | null = null;

function getStore(registrySiteUrl: string): SharePointStateStore {
  if (cachedStore === null) cachedStore = new SharePointStateStore(registrySiteUrl);
  return cachedStore;
}

function getRunRepository(registrySiteUrl: string): SharePointProjectionRunRepository {
  if (cachedRunRepository === null) {
    cachedRunRepository = new SharePointProjectionRunRepository(getStore(registrySiteUrl));
  }
  return cachedRunRepository;
}

function buildDeps(context: InvocationContext): IProjectionAdminRebuildHandlerDeps {
  if (cachedDeps !== null) {
    return {
      ...cachedDeps,
      leaseOwnerProvider: () => `admin-${context.invocationId ?? randomUUID()}`,
    };
  }
  const config = getProjectionConfig();
  const sourceGraph = new GraphListClient(config.sites.sourceSiteUrl);
  const registryGraph = new GraphListClient(config.sites.registrySiteUrl);
  const seedService = createProjectionSeedService({
    sourceFetchClient: createGraphProjectionSourceFetchClient({ graph: sourceGraph }),
    registryRepository: createGraphMyProjectsRegistryRepository({ graph: registryGraph }),
    leaseRepository: new SharePointProjectionControlStateRepository(getStore(config.sites.registrySiteUrl)),
    runRepository: getRunRepository(config.sites.registrySiteUrl),
  });
  cachedDeps = {
    seedService,
    runRepository: getRunRepository(config.sites.registrySiteUrl),
    rebuildLeaseTtlMinutes: config.leases.rebuildLeaseMinutes,
    runIdProvider: () => randomUUID(),
    projectionBatchIdProvider: () => randomUUID(),
    leaseOwnerProvider: () => `admin-${context.invocationId ?? randomUUID()}`,
  };
  return cachedDeps!;
}

function withAdminGuard(
  handler: (
    request: HttpRequest,
    context: InvocationContext,
    auth: AuthContext,
  ) => Promise<HttpResponseInit>,
): (
  request: HttpRequest,
  context: InvocationContext,
  auth: AuthContext,
) => Promise<HttpResponseInit> {
  return async (request, context, auth) => {
    const requestId = extractOrGenerateRequestId(request);
    const scopeDenied = requireDelegatedScope(auth.claims, requestId);
    if (scopeDenied) return scopeDenied;
    const adminDenied = requireAdmin(auth.claims, requestId);
    if (adminDenied) return adminDenied;
    return handler(request, context, auth);
  };
}

app.http('myProjectsProjectionAdminSeed', {
  route: 'admin/my-projects-projection/seed',
  methods: ['POST'],
  authLevel: 'anonymous',
  handler: withAuth(
    withTelemetry(
      withAdminGuard((request, context) => handleProjectionSeed(request, buildDeps(context))),
      { domain: 'myProjectsProjection', operation: 'seed' },
    ),
  ),
});

app.http('myProjectsProjectionAdminRebuild', {
  route: 'admin/my-projects-projection/rebuild',
  methods: ['POST'],
  authLevel: 'anonymous',
  handler: withAuth(
    withTelemetry(
      withAdminGuard((request, context) => handleProjectionRebuild(request, buildDeps(context))),
      { domain: 'myProjectsProjection', operation: 'rebuild' },
    ),
  ),
});

app.http('myProjectsProjectionAdminStatus', {
  route: 'admin/my-projects-projection/status',
  methods: ['GET'],
  authLevel: 'anonymous',
  handler: withAuth(
    withTelemetry(
      withAdminGuard((request) =>
        handleProjectionStatus(request, { runRepository: getRunRepository(getProjectionConfig().sites.registrySiteUrl) }),
      ),
      { domain: 'myProjectsProjection', operation: 'status' },
    ),
  ),
});
