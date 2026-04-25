import {
  app,
  type HttpRequest,
  type HttpResponseInit,
  type InvocationContext,
} from '@azure/functions';
import { withAuth, type AuthContext } from '../../middleware/auth.js';
import { extractOrGenerateRequestId } from '../../middleware/request-id.js';
import {
  authorizeSafetyRoute,
  emitAuthorizationTelemetry,
  type SafetyRouteAction,
} from '../../middleware/authorization.js';
import { errorResponse, successResponse } from '../../utils/response-helpers.js';
import { withTelemetry } from '../../utils/withTelemetry.js';
import { assertAdapterModeValid } from '../../utils/adapter-mode-guard.js';
import { createLogger } from '../../utils/logger.js';
import { MockSharePointService, SharePointService } from '../../services/sharepoint-service.js';
import {
  SafetyFieldExcellenceValidationError,
  type SafetyFieldExcellenceCandidateListRequest,
  type SafetyFieldExcellenceRollupRequest,
} from '../../services/safety-field-excellence-rollup-service.js';
import type { SafetyActivityEvidence } from '../../../../../packages/features/safety/src/excellence/index.js';

function authorizeExcellenceRoute(
  action: SafetyRouteAction,
  context: InvocationContext,
  auth: AuthContext,
  requestId: string,
): HttpResponseInit | null {
  const decision = authorizeSafetyRoute(auth.claims, action, requestId);
  const logger = createLogger(context);
  emitAuthorizationTelemetry(logger, {
    action: `safety-route-${action}`,
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

function parseOptionalString(value: unknown): string | undefined {
  return typeof value === 'string' && value.length > 0 ? value : undefined;
}

function parseOptionalPositiveInteger(value: unknown): number | undefined {
  return typeof value === 'number' && Number.isInteger(value) && value > 0 ? value : undefined;
}

function parseRollingWindowWeeks(value: unknown): number | undefined {
  if (typeof value !== 'number' || !Number.isFinite(value)) return undefined;
  if (value <= 0 || value > 52) return undefined;
  return Math.floor(value);
}

function parseActivityEvidenceMap(
  value: unknown,
): Record<string, SafetyActivityEvidence> | undefined {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return undefined;
  const out: Record<string, SafetyActivityEvidence> = {};
  for (const [key, entry] of Object.entries(value as Record<string, unknown>)) {
    if (!entry || typeof entry !== 'object' || Array.isArray(entry)) continue;
    const candidate = entry as Record<string, unknown>;
    const status = candidate.status;
    const source = candidate.source;
    if (
      (status === 'proven' || status === 'inferred' || status === 'missing') &&
      (source === 'manual' ||
        source === 'daily-log' ||
        source === 'project-stage' ||
        source === 'inspection-density' ||
        source === 'none')
    ) {
      out[key] = {
        status,
        source,
        activeTradeCount: typeof candidate.activeTradeCount === 'number'
          ? candidate.activeTradeCount
          : undefined,
        estimatedManpower: typeof candidate.estimatedManpower === 'number'
          ? candidate.estimatedManpower
          : undefined,
        projectStage: parseOptionalString(candidate.projectStage),
        notes: parseOptionalString(candidate.notes),
      };
    }
  }
  return Object.keys(out).length > 0 ? out : undefined;
}

function parseRollupRequest(body: Record<string, unknown>): SafetyFieldExcellenceRollupRequest {
  return {
    reportingPeriodId: parseOptionalString(body.reportingPeriodId),
    reportingPeriodSpItemId: parseOptionalPositiveInteger(body.reportingPeriodSpItemId),
    rollingWindowWeeks: parseRollingWindowWeeks(body.rollingWindowWeeks),
    generatorVersion: parseOptionalString(body.generatorVersion),
    generatedAt: parseOptionalString(body.generatedAt),
    activityEvidenceByProjectNumber: parseActivityEvidenceMap(
      body.activityEvidenceByProjectNumber,
    ),
  };
}

function buildSharePointService(): SharePointService | MockSharePointService {
  const mode = assertAdapterModeValid();
  return mode === 'mock' || process.env.NODE_ENV === 'test'
    ? new MockSharePointService()
    : new SharePointService();
}

app.http('safetyFieldExcellenceRollupDryRun', {
  methods: ['POST'],
  authLevel: 'anonymous',
  route: 'safety-field-excellence/rollup/dry-run',
  handler: withAuth(
    withTelemetry(
      async (request: HttpRequest, context: InvocationContext, auth): Promise<HttpResponseInit> => {
        const requestId = extractOrGenerateRequestId(request);
        const denied = authorizeExcellenceRoute('excellence-rollup-read', context, auth, requestId);
        if (denied) return denied;

        let body: Record<string, unknown> = {};
        try {
          body = (await request.json()) as Record<string, unknown>;
        } catch {
          body = {};
        }

        const parsed = parseRollupRequest(body);
        try {
          const sharePoint = buildSharePointService();
          const result = await sharePoint.runSafetyFieldExcellenceRollup(parsed, true, requestId);
          return successResponse(result);
        } catch (err) {
          if (err instanceof SafetyFieldExcellenceValidationError) {
            return errorResponse(400, err.code, err.message, requestId);
          }
          const message = err instanceof Error ? err.message : String(err);
          return errorResponse(500, 'INTERNAL_ERROR', message, requestId);
        }
      },
      { domain: 'adminControlPlane', operation: 'safetyFieldExcellenceRollupDryRun' },
    ),
  ),
});

app.http('safetyFieldExcellenceRollupGenerate', {
  methods: ['POST'],
  authLevel: 'anonymous',
  route: 'safety-field-excellence/rollup/generate',
  handler: withAuth(
    withTelemetry(
      async (request: HttpRequest, context: InvocationContext, auth): Promise<HttpResponseInit> => {
        const requestId = extractOrGenerateRequestId(request);
        const denied = authorizeExcellenceRoute(
          'excellence-rollup-generate',
          context,
          auth,
          requestId,
        );
        if (denied) return denied;

        let body: Record<string, unknown> = {};
        try {
          body = (await request.json()) as Record<string, unknown>;
        } catch {
          body = {};
        }

        const parsed = parseRollupRequest(body);
        try {
          const sharePoint = buildSharePointService();
          const result = await sharePoint.runSafetyFieldExcellenceRollup(parsed, false, requestId);
          return successResponse(result);
        } catch (err) {
          if (err instanceof SafetyFieldExcellenceValidationError) {
            return errorResponse(400, err.code, err.message, requestId);
          }
          const message = err instanceof Error ? err.message : String(err);
          return errorResponse(500, 'INTERNAL_ERROR', message, requestId);
        }
      },
      { domain: 'adminControlPlane', operation: 'safetyFieldExcellenceRollupGenerate' },
    ),
  ),
});

app.http('safetyFieldExcellenceListCandidates', {
  methods: ['GET'],
  authLevel: 'anonymous',
  route: 'safety-field-excellence/reporting-periods/{reportingPeriodId}/candidates',
  handler: withAuth(
    withTelemetry(
      async (request: HttpRequest, context: InvocationContext, auth): Promise<HttpResponseInit> => {
        const requestId = extractOrGenerateRequestId(request);
        const denied = authorizeExcellenceRoute('excellence-rollup-read', context, auth, requestId);
        if (denied) return denied;

        const reportingPeriodId = String(request.params.reportingPeriodId ?? '').trim();
        if (!reportingPeriodId) {
          return errorResponse(
            400,
            'VALIDATION_ERROR',
            'reportingPeriodId is required.',
            requestId,
          );
        }

        const reportingPeriodSpItemId = parseOptionalPositiveInteger(
          Number(request.query.get('reportingPeriodSpItemId') ?? ''),
        );
        const listRequest: SafetyFieldExcellenceCandidateListRequest = {
          reportingPeriodId,
          reportingPeriodSpItemId,
          generatorVersion: parseOptionalString(request.query.get('generatorVersion') ?? undefined),
          eligibilityStatus: parseOptionalString(request.query.get('eligibilityStatus') ?? undefined),
          publishRecommendation: parseOptionalString(
            request.query.get('recommendation') ?? undefined,
          ),
          top: parseOptionalPositiveInteger(Number(request.query.get('top') ?? '')),
        };

        try {
          const sharePoint = buildSharePointService();
          const result = await sharePoint.listSafetyFieldExcellenceCandidates(listRequest, requestId);
          return successResponse(result);
        } catch (err) {
          if (err instanceof SafetyFieldExcellenceValidationError) {
            return errorResponse(400, err.code, err.message, requestId);
          }
          const message = err instanceof Error ? err.message : String(err);
          return errorResponse(500, 'INTERNAL_ERROR', message, requestId);
        }
      },
      { domain: 'adminControlPlane', operation: 'safetyFieldExcellenceListCandidates' },
    ),
  ),
});
