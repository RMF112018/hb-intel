import { app, type HttpRequest, type HttpResponseInit, type InvocationContext } from '@azure/functions';
import type { IProvisionSiteRequest } from '@hbc/models';
import { randomUUID } from 'crypto';
import { createServiceFactory } from '../../services/service-factory.js';
import { SagaOrchestrator } from './saga-orchestrator.js';
import { createLogger } from '../../utils/logger.js';
import { validateToken, unauthorizedResponse, type IValidatedClaims } from '../../middleware/validateToken.js';

app.http('provisionProjectSite', {
  methods: ['POST'],
  authLevel: 'anonymous',
  route: 'provision-project-site',
  handler: async (request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> => {
    const logger = createLogger(context);
    let claims: IValidatedClaims;
    try {
      // D-PH6-03: Token validation is the first action for every provisioning HTTP endpoint.
      claims = await validateToken(request);
    } catch {
      return unauthorizedResponse('Invalid or missing Bearer token');
    }

    try {
      const body = (await request.json()) as IProvisionSiteRequest;
      // D-PH6-03 trust boundary: server overwrites identity from validated JWT claims.
      body.triggeredBy = claims.upn;
      const correlationId = body.correlationId ?? randomUUID();
      body.correlationId = correlationId;

      logger.info('Provisioning saga triggered', {
        projectId: body.projectId,
        projectNumber: body.projectNumber,
        correlationId,
        triggeredBy: body.triggeredBy,
      });

      if (!body.projectId || !body.projectNumber || !body.projectName || !body.triggeredBy) {
        return {
          status: 400,
          jsonBody: {
            error:
              'Missing required fields: projectId, projectNumber, projectName, triggeredBy',
          },
        };
      }

      if (!/^\d{2}-\d{3}-\d{2}$/.test(body.projectNumber)) {
        return { status: 400, jsonBody: { error: 'projectNumber must match ##-###-## format' } };
      }

      const services = createServiceFactory();
      const orchestrator = new SagaOrchestrator(services, logger);

      // Fire-and-forget: start saga asynchronously
      orchestrator.execute(body).catch((err) => {
        logger.error('Saga execution failed', {
          projectId: body.projectId,
          correlationId: body.correlationId,
          error: err instanceof Error ? err.message : String(err),
        });
      });

      return {
        status: 202,
        jsonBody: { message: 'Provisioning started', projectId: body.projectId, correlationId },
      };
    } catch (err) {
      logger.error('Failed to start provisioning', {
        error: err instanceof Error ? err.message : String(err),
      });
      return {
        status: 500,
        jsonBody: { error: 'Internal server error' },
      };
    }
  },
});

app.http('getProvisioningStatus', {
  methods: ['GET'],
  authLevel: 'anonymous',
  // D-PH6-01: route key migrated to immutable {projectId}.
  route: 'provisioning-status/{projectId}',
  handler: async (request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> => {
    const logger = createLogger(context);
    try {
      // D-PH6-03: endpoint access requires a valid Bearer token even for read operations.
      await validateToken(request);
    } catch {
      return unauthorizedResponse('Invalid or missing Bearer token');
    }

    const projectId = request.params.projectId;

    if (!projectId) {
      return { status: 400, jsonBody: { error: 'Missing projectId parameter' } };
    }

    try {
      const services = createServiceFactory();
      const status = await services.tableStorage.getProvisioningStatus(projectId);

      if (!status) {
        return { status: 404, jsonBody: { error: `No provisioning found for ${projectId}` } };
      }

      return { status: 200, jsonBody: status };
    } catch (err) {
      logger.error('Failed to get provisioning status', {
        projectId,
        error: err instanceof Error ? err.message : String(err),
      });
      return { status: 500, jsonBody: { error: 'Internal server error' } };
    }
  },
});

app.http('retryProvisioning', {
  methods: ['POST'],
  authLevel: 'anonymous',
  // D-PH6-01: retry endpoint now addresses the system key projectId.
  route: 'provisioning-retry/{projectId}',
  handler: async (request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> => {
    const logger = createLogger(context);
    try {
      await validateToken(request);
    } catch {
      return unauthorizedResponse('Invalid or missing Bearer token');
    }

    const projectId = request.params.projectId;

    if (!projectId) {
      return { status: 400, jsonBody: { error: 'Missing projectId parameter' } };
    }

    try {
      const services = createServiceFactory();
      const orchestrator = new SagaOrchestrator(services, logger);

      orchestrator.retry(projectId).catch((err) => {
        logger.error('Retry failed', {
          projectId,
          error: err instanceof Error ? err.message : String(err),
        });
      });

      return { status: 202, jsonBody: { message: 'Retry started', projectId } };
    } catch (err) {
      logger.error('Failed to start retry', {
        projectId,
        error: err instanceof Error ? err.message : String(err),
      });
      return { status: 500, jsonBody: { error: 'Internal server error' } };
    }
  },
});

app.http('escalateProvisioning', {
  methods: ['POST'],
  authLevel: 'anonymous',
  // D-PH6-01: escalation endpoint now addresses the system key projectId.
  route: 'provisioning-escalate/{projectId}',
  handler: async (request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> => {
    const logger = createLogger(context);
    let claims: IValidatedClaims;
    try {
      // D-PH6-03 trust boundary: escalation identity is sourced from validated JWT claims.
      claims = await validateToken(request);
    } catch {
      return unauthorizedResponse('Invalid or missing Bearer token');
    }

    const projectId = request.params.projectId;

    if (!projectId) {
      return { status: 400, jsonBody: { error: 'Missing projectId parameter' } };
    }

    try {
      void (await request.json());
      const services = createServiceFactory();
      await services.tableStorage.escalateProvisioning(projectId, claims.upn);

      logger.info(`Provisioning escalated for ${projectId} by ${claims.upn}`);
      return { status: 200, jsonBody: { message: 'Provisioning escalated', projectId } };
    } catch (err) {
      logger.error('Failed to escalate', {
        projectId,
        error: err instanceof Error ? err.message : String(err),
      });
      return { status: 500, jsonBody: { error: 'Internal server error' } };
    }
  },
});
