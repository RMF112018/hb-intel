import { app, type HttpRequest, type HttpResponseInit, type InvocationContext } from '@azure/functions';
import type { IProvisionSiteRequest, IProvisioningEscalation } from '@hbc/models';
import { createServiceFactory } from '../../services/service-factory.js';
import { SagaOrchestrator } from './saga-orchestrator.js';
import { createLogger } from '../../utils/logger.js';

app.http('provisionProjectSite', {
  methods: ['POST'],
  authLevel: 'anonymous',
  route: 'provision-project-site',
  handler: async (request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> => {
    const logger = createLogger(context);
    try {
      const body = (await request.json()) as IProvisionSiteRequest;

      if (!body.projectCode || !body.projectName || !body.triggeredBy) {
        return {
          status: 400,
          jsonBody: { error: 'Missing required fields: projectCode, projectName, triggeredBy' },
        };
      }

      const services = createServiceFactory();
      const orchestrator = new SagaOrchestrator(services, logger);

      // Fire-and-forget: start saga asynchronously
      orchestrator.execute(body).catch((err) => {
        logger.error('Saga execution failed', {
          projectCode: body.projectCode,
          error: err instanceof Error ? err.message : String(err),
        });
      });

      return {
        status: 202,
        jsonBody: { message: 'Provisioning started', projectCode: body.projectCode },
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
  route: 'provisioning-status/{projectCode}',
  handler: async (request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> => {
    const logger = createLogger(context);
    const projectCode = request.params.projectCode;

    if (!projectCode) {
      return { status: 400, jsonBody: { error: 'Missing projectCode parameter' } };
    }

    try {
      const services = createServiceFactory();
      const status = await services.tableStorage.getProvisioningStatus(projectCode);

      if (!status) {
        return { status: 404, jsonBody: { error: `No provisioning found for ${projectCode}` } };
      }

      return { status: 200, jsonBody: status };
    } catch (err) {
      logger.error('Failed to get provisioning status', {
        projectCode,
        error: err instanceof Error ? err.message : String(err),
      });
      return { status: 500, jsonBody: { error: 'Internal server error' } };
    }
  },
});

app.http('retryProvisioning', {
  methods: ['POST'],
  authLevel: 'anonymous',
  route: 'provisioning-retry/{projectCode}',
  handler: async (request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> => {
    const logger = createLogger(context);
    const projectCode = request.params.projectCode;

    if (!projectCode) {
      return { status: 400, jsonBody: { error: 'Missing projectCode parameter' } };
    }

    try {
      const services = createServiceFactory();
      const orchestrator = new SagaOrchestrator(services, logger);

      orchestrator.retry(projectCode).catch((err) => {
        logger.error('Retry failed', {
          projectCode,
          error: err instanceof Error ? err.message : String(err),
        });
      });

      return { status: 202, jsonBody: { message: 'Retry started', projectCode } };
    } catch (err) {
      logger.error('Failed to start retry', {
        projectCode,
        error: err instanceof Error ? err.message : String(err),
      });
      return { status: 500, jsonBody: { error: 'Internal server error' } };
    }
  },
});

app.http('escalateProvisioning', {
  methods: ['POST'],
  authLevel: 'anonymous',
  route: 'provisioning-escalate/{projectCode}',
  handler: async (request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> => {
    const logger = createLogger(context);
    const projectCode = request.params.projectCode;

    if (!projectCode) {
      return { status: 400, jsonBody: { error: 'Missing projectCode parameter' } };
    }

    try {
      const body = (await request.json()) as IProvisioningEscalation;
      const services = createServiceFactory();
      await services.tableStorage.escalateProvisioning(projectCode, body.escalatedBy);

      logger.info(`Provisioning escalated for ${projectCode} by ${body.escalatedBy}`);
      return { status: 200, jsonBody: { message: 'Provisioning escalated', projectCode } };
    } catch (err) {
      logger.error('Failed to escalate', {
        projectCode,
        error: err instanceof Error ? err.message : String(err),
      });
      return { status: 500, jsonBody: { error: 'Internal server error' } };
    }
  },
});
