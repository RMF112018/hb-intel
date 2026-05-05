import { app, type HttpRequest, type HttpResponseInit } from '@azure/functions';
import { withAuth } from '../../middleware/auth.js';
import { extractOrGenerateRequestId } from '../../middleware/request-id.js';
import { errorResponse, successResponse } from '../../utils/response-helpers.js';
import { withTelemetry } from '../../utils/withTelemetry.js';
import { PccMockReadModelProvider } from './read-models/pcc-mock-read-model-provider.js';
import type { PccProjectId } from '@hbc/models/pcc';

const provider = new PccMockReadModelProvider();

type RouteLoader = (projectId: PccProjectId, request: HttpRequest) => Promise<unknown>;

function registerPccReadRoute(name: string, route: string, load: RouteLoader): void {
  app.http(name, {
    methods: ['GET'],
    authLevel: 'anonymous',
    route,
    handler: withAuth(
      withTelemetry(
        async (request: HttpRequest): Promise<HttpResponseInit> => {
          const requestId = extractOrGenerateRequestId(request);
          const projectId = request.params.projectId;
          if (!projectId) {
            return errorResponse(400, 'VALIDATION_ERROR', 'projectId is required', requestId);
          }

          try {
            const envelope = await load(projectId as PccProjectId, request);
            return successResponse(envelope);
          } catch {
            return errorResponse(500, 'INTERNAL_ERROR', 'Internal server error', requestId);
          }
        },
        { domain: 'pcc-read-model', operation: name },
      ),
    ),
  });
}

registerPccReadRoute(
  'getPccProjectProfile',
  'pcc/projects/{projectId}/profile',
  async (projectId) => provider.getProjectProfile(projectId),
);

registerPccReadRoute(
  'getPccProjectModules',
  'pcc/projects/{projectId}/modules',
  async (projectId) => provider.getModuleRegistry(projectId),
);

registerPccReadRoute('getPccProjectHome', 'pcc/projects/{projectId}/home', async (projectId) =>
  provider.getProjectHome(projectId),
);

registerPccReadRoute(
  'getPccProjectPriorityActions',
  'pcc/projects/{projectId}/priority-actions',
  async (projectId) => provider.getPriorityActions(projectId),
);

registerPccReadRoute(
  'getPccProjectDocumentControl',
  'pcc/projects/{projectId}/document-control',
  async (projectId) => provider.getDocumentControl(projectId),
);

registerPccReadRoute(
  'getPccProjectExternalLinks',
  'pcc/projects/{projectId}/external-links',
  async (projectId) => provider.getExternalLinks(projectId),
);

registerPccReadRoute(
  'getPccProjectSiteHealth',
  'pcc/projects/{projectId}/site-health',
  async (projectId) => provider.getSiteHealth(projectId),
);

registerPccReadRoute(
  'getPccProjectTeamAccess',
  'pcc/projects/{projectId}/team-access',
  async (projectId) => provider.getTeamAccess(projectId),
);

registerPccReadRoute(
  'getPccProjectReadiness',
  'pcc/projects/{projectId}/project-readiness',
  async (projectId) => provider.getProjectReadiness(projectId),
);

registerPccReadRoute(
  'getPccLifecycleReadiness',
  'pcc/projects/{projectId}/lifecycle-readiness',
  async (projectId) => provider.getLifecycleReadiness(projectId),
);

registerPccReadRoute(
  'getPccPermitInspectionControlCenter',
  'pcc/projects/{projectId}/permit-inspection-control-center',
  async (projectId) => provider.getPermitInspectionControlCenter(projectId),
);

registerPccReadRoute(
  'getPccProjectResponsibilityMatrix',
  'pcc/projects/{projectId}/responsibility-matrix',
  async (projectId) => provider.getResponsibilityMatrix(projectId),
);

registerPccReadRoute(
  'getPccProjectConstraintsLog',
  'pcc/projects/{projectId}/constraints-log',
  async (projectId) => provider.getConstraintsLog(projectId),
);

registerPccReadRoute(
  'getPccProjectBuyoutLog',
  'pcc/projects/{projectId}/buyout-log',
  async (projectId) => provider.getBuyoutLog(projectId),
);

registerPccReadRoute(
  'getPccProcoreProjectMapping',
  'pcc/projects/{projectId}/procore-project-mapping',
  async (projectId) => provider.getProcoreProjectMapping(projectId),
);

registerPccReadRoute(
  'getPccProcoreSyncHealth',
  'pcc/projects/{projectId}/procore-sync-health',
  async (projectId) => provider.getProcoreSyncHealth(projectId),
);

registerPccReadRoute(
  'getPccUnifiedLifecycle',
  'pcc/projects/{projectId}/unified-lifecycle',
  async (projectId) => provider.getUnifiedLifecycle(projectId),
);

registerPccReadRoute(
  'getPccProjectMemory',
  'pcc/projects/{projectId}/project-memory',
  async (projectId) => provider.getProjectMemory(projectId),
);

registerPccReadRoute(
  'getPccProjectLenses',
  'pcc/projects/{projectId}/project-lenses',
  async (projectId) => provider.getProjectLenses(projectId),
);

registerPccReadRoute(
  'getPccProjectTraceability',
  'pcc/projects/{projectId}/project-traceability',
  async (projectId) => provider.getProjectTraceability(projectId),
);

registerPccReadRoute(
  'getPccWarrantyTrace',
  'pcc/projects/{projectId}/warranty-trace',
  async (projectId) => provider.getWarrantyTrace(projectId),
);

registerPccReadRoute(
  'getPccCrossProjectKnowledge',
  'pcc/projects/{projectId}/cross-project-knowledge',
  async (projectId) => provider.getCrossProjectKnowledge(projectId),
);

registerPccReadRoute(
  'getPccUnifiedSearch',
  'pcc/projects/{projectId}/unified-search',
  async (projectId, request) =>
    provider.getUnifiedSearch(projectId, undefined, request.query?.get('q') ?? undefined),
);

// Wave 14 / Prompt 03 — composite approvals/checkpoints read-model.
// GET-only thin mapping layer: the route MUST NOT derive viewerPersona,
// actor, or auth-role from the query string. Provider-level tests cover
// the optional viewerPersona branch directly.
registerPccReadRoute(
  'getPccProjectApprovals',
  'pcc/projects/{projectId}/approvals',
  async (projectId) => provider.getApprovals(projectId),
);
