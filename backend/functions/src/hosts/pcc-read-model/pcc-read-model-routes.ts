import { app, type HttpRequest, type HttpResponseInit } from '@azure/functions';
import { withAuth } from '../../middleware/auth.js';
import { extractOrGenerateRequestId } from '../../middleware/request-id.js';
import { errorResponse, successResponse } from '../../utils/response-helpers.js';
import { withTelemetry } from '../../utils/withTelemetry.js';
import { PccMockReadModelProvider } from './read-models/pcc-mock-read-model-provider.js';
import type { PccProjectId } from '@hbc/models/pcc';

const provider = new PccMockReadModelProvider();

type RouteLoader = (projectId: PccProjectId) => Promise<unknown>;

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
            const envelope = await load(projectId as PccProjectId);
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
