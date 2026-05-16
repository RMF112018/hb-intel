/**
 * My Work read-model backend routes.
 *
 * Registers protected GET endpoints behind the standard
 * `withAuth(withTelemetry(...))` envelope:
 *   - GET /api/my-work/me/home
 *   - GET /api/my-work/me/adobe-sign/action-queue
 *   - GET /api/my-work/me/project-links
 *
 * The actor principal is derived from validated auth claims inside
 * the handler and passed to the provider; no actor/user/principal
 * override is parsed from the request. The queue route validates
 * `pageSize` (integer 1–50) and bounds `cursor` length (≤ 256).
 *
 * @module hosts/my-work-read-model/my-work-read-model-routes
 */

import {
  app,
  type HttpRequest,
  type HttpResponseInit,
  type InvocationContext,
} from '@azure/functions';

import type {
  MyWorkActorSummary,
  MyWorkAdobeSignActionQueueQuery,
  MyWorkAdobeSignRecentCompletionsQuery,
} from '@hbc/models/myWork';

import { withAuth } from '../../middleware/auth.js';
import { extractOrGenerateRequestId } from '../../middleware/request-id.js';
import { createLogger } from '../../utils/logger.js';
import { errorResponse, successResponse } from '../../utils/response-helpers.js';
import { withTelemetry } from '../../utils/withTelemetry.js';

import type { AdobeSignRuntimeDiagnosticReporter } from './read-models/adobe-sign/adobe-sign-runtime-diagnostics.js';
import { resolveMyWorkReadModelProvider } from './read-models/my-work-read-model-provider-resolver.js';
import type {
  IMyWorkReadModelProvider,
  MyWorkReadContext,
} from './read-models/my-work-read-model-provider.js';
import type { MyProjectLinksRuntimeDiagnosticReporter } from './read-models/project-links/my-project-links-runtime-diagnostics.js';

const provider: IMyWorkReadModelProvider = resolveMyWorkReadModelProvider(process.env);

const MAX_CURSOR_LENGTH = 256;

const actorFromClaims = (claims: {
  oid: string;
  upn: string;
  displayName?: string;
}): MyWorkActorSummary => ({
  displayName: claims.displayName ?? claims.upn,
  principalName: claims.upn,
  hbcUserId: claims.oid,
});

type QueueQueryParseResult =
  | { readonly ok: true; readonly query: MyWorkAdobeSignActionQueueQuery }
  | { readonly ok: false; readonly response: HttpResponseInit };

const parseQueueQuery = (request: HttpRequest, requestId: string): QueueQueryParseResult => {
  const pageSizeRaw = request.query.get('pageSize');
  const cursorRaw = request.query.get('cursor');
  const query: { pageSize?: number; cursor?: string } = {};

  if (pageSizeRaw !== null && pageSizeRaw !== '') {
    const parsed = Number(pageSizeRaw);
    if (!Number.isInteger(parsed) || parsed < 1 || parsed > 50) {
      return {
        ok: false,
        response: errorResponse(
          400,
          'VALIDATION_ERROR',
          'pageSize must be an integer between 1 and 50',
          requestId,
        ),
      };
    }
    query.pageSize = parsed;
  }

  if (cursorRaw !== null && cursorRaw.length > 0) {
    if (cursorRaw.length > MAX_CURSOR_LENGTH) {
      return {
        ok: false,
        response: errorResponse(
          400,
          'VALIDATION_ERROR',
          `cursor must be at most ${MAX_CURSOR_LENGTH} characters`,
          requestId,
        ),
      };
    }
    query.cursor = cursorRaw;
  }

  return { ok: true, query };
};

type RecentCompletionsQueryParseResult =
  | { readonly ok: true; readonly query: MyWorkAdobeSignRecentCompletionsQuery }
  | { readonly ok: false; readonly response: HttpResponseInit };

const parseRecentCompletionsQuery = (
  request: HttpRequest,
  requestId: string,
): RecentCompletionsQueryParseResult => {
  const pageSizeRaw = request.query.get('pageSize');
  const cursorRaw = request.query.get('cursor');
  const query: { pageSize?: number; cursor?: string } = {};

  if (pageSizeRaw !== null && pageSizeRaw !== '') {
    const parsed = Number(pageSizeRaw);
    if (!Number.isInteger(parsed) || parsed < 1 || parsed > 50) {
      return {
        ok: false,
        response: errorResponse(
          400,
          'VALIDATION_ERROR',
          'pageSize must be an integer between 1 and 50',
          requestId,
        ),
      };
    }
    query.pageSize = parsed;
  }

  if (cursorRaw !== null && cursorRaw.length > 0) {
    if (cursorRaw.length > MAX_CURSOR_LENGTH) {
      return {
        ok: false,
        response: errorResponse(
          400,
          'VALIDATION_ERROR',
          `cursor must be at most ${MAX_CURSOR_LENGTH} characters`,
          requestId,
        ),
      };
    }
    query.cursor = cursorRaw;
  }

  return { ok: true, query };
};

const createAdobeSignRuntimeDiagnosticsReporter = (
  context: InvocationContext,
  requestId: string,
): AdobeSignRuntimeDiagnosticReporter => {
  const logger = createLogger(context);
  return {
    trackAdobeSignRuntimeEvent(name, properties) {
      logger.trackEvent(name, {
        domain: 'my-work-read-model',
        runtimeOperation: 'adobe-sign-runtime',
        correlationId: requestId,
        ...properties,
      });
    },
  };
};

const createMyProjectLinksRuntimeDiagnosticsReporter = (
  context: InvocationContext,
  requestId: string,
): MyProjectLinksRuntimeDiagnosticReporter => {
  const logger = createLogger(context);
  return {
    trackMyProjectLinksRuntimeEvent(name, properties) {
      logger.trackEvent(name, {
        domain: 'my-work-read-model',
        runtimeOperation: 'my-project-links-runtime',
        correlationId: requestId,
        ...properties,
      });
    },
  };
};

app.http('getMyWorkHome', {
  methods: ['GET'],
  authLevel: 'anonymous',
  route: 'my-work/me/home',
  handler: withAuth(
    withTelemetry(
      async (
        request: HttpRequest,
        _context: InvocationContext,
        auth,
      ): Promise<HttpResponseInit> => {
        const requestId = extractOrGenerateRequestId(request);
        try {
          const context: MyWorkReadContext = {
            actor: actorFromClaims(auth.claims),
            requestId,
            diagnostics: createAdobeSignRuntimeDiagnosticsReporter(_context, requestId),
          };
          const envelope = await provider.getMyWorkHome(context);
          return successResponse(envelope);
        } catch {
          return errorResponse(500, 'INTERNAL_ERROR', 'Internal server error', requestId);
        }
      },
      { domain: 'my-work-read-model', operation: 'getMyWorkHome' },
    ),
  ),
});

app.http('getMyWorkAdobeSignActionQueue', {
  methods: ['GET'],
  authLevel: 'anonymous',
  route: 'my-work/me/adobe-sign/action-queue',
  handler: withAuth(
    withTelemetry(
      async (
        request: HttpRequest,
        _context: InvocationContext,
        auth,
      ): Promise<HttpResponseInit> => {
        const requestId = extractOrGenerateRequestId(request);
        const parsed = parseQueueQuery(request, requestId);
        if (!parsed.ok) return parsed.response;
        try {
          const context: MyWorkReadContext = {
            actor: actorFromClaims(auth.claims),
            requestId,
            diagnostics: createAdobeSignRuntimeDiagnosticsReporter(_context, requestId),
          };
          const envelope = await provider.getAdobeSignActionQueue(context, parsed.query);
          return successResponse(envelope);
        } catch {
          return errorResponse(500, 'INTERNAL_ERROR', 'Internal server error', requestId);
        }
      },
      {
        domain: 'my-work-read-model',
        operation: 'getMyWorkAdobeSignActionQueue',
      },
    ),
  ),
});

app.http('getMyWorkAdobeSignRecentCompletions', {
  methods: ['GET'],
  authLevel: 'anonymous',
  route: 'my-work/me/adobe-sign/recent-completions',
  handler: withAuth(
    withTelemetry(
      async (
        request: HttpRequest,
        _context: InvocationContext,
        auth,
      ): Promise<HttpResponseInit> => {
        const requestId = extractOrGenerateRequestId(request);
        const parsed = parseRecentCompletionsQuery(request, requestId);
        if (!parsed.ok) return parsed.response;
        try {
          const context: MyWorkReadContext = {
            actor: actorFromClaims(auth.claims),
            requestId,
            diagnostics: createAdobeSignRuntimeDiagnosticsReporter(_context, requestId),
          };
          const envelope = await provider.getAdobeSignRecentCompletions(context, parsed.query);
          return successResponse(envelope);
        } catch {
          return errorResponse(500, 'INTERNAL_ERROR', 'Internal server error', requestId);
        }
      },
      {
        domain: 'my-work-read-model',
        operation: 'getMyWorkAdobeSignRecentCompletions',
      },
    ),
  ),
});

app.http('getMyWorkProjectLinks', {
  methods: ['GET'],
  authLevel: 'anonymous',
  route: 'my-work/me/project-links',
  handler: withAuth(
    withTelemetry(
      async (
        request: HttpRequest,
        _context: InvocationContext,
        auth,
      ): Promise<HttpResponseInit> => {
        const requestId = extractOrGenerateRequestId(request);
        try {
          const context: MyWorkReadContext = {
            actor: actorFromClaims(auth.claims),
            requestId,
            projectLinksDiagnostics: createMyProjectLinksRuntimeDiagnosticsReporter(
              _context,
              requestId,
            ),
          };
          const envelope = await provider.getMyProjectLinks(context);
          return successResponse(envelope);
        } catch {
          return errorResponse(500, 'INTERNAL_ERROR', 'Internal server error', requestId);
        }
      },
      {
        domain: 'my-work-read-model',
        operation: 'getMyWorkProjectLinks',
      },
    ),
  ),
});
