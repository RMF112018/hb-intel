/**
 * My Projects projection — admin endpoint pure handler.
 *
 * Routes operator commands to the subscription manager:
 *   - reconcile             → ensureAllSubscriptions
 *   - reconcile-source      → ensureSubscription(sourceListKind)
 *   - force-reset           → forceResetSubscription(sourceListKind)
 *   - get-status            → getStatus
 *
 * The Function wrapper enforces `withAuth + requireDelegatedScope + requireAdmin`
 * BEFORE invoking this handler. This handler trusts the caller is authorized
 * and only validates the body shape.
 */

import type { HttpRequest, HttpResponseInit } from '@azure/functions';
import { errorResponse, successResponse } from '../../../utils/response-helpers.js';
import { SOURCE_LIST_KINDS, type SourceListKind } from '../projection-types.js';
import type { ProjectionSubscriptionManager } from './projection-subscription-manager.js';

export type ProjectionSubscriptionAdminCommand =
  | { readonly command: 'reconcile' }
  | { readonly command: 'reconcile-source'; readonly sourceListKind: SourceListKind }
  | { readonly command: 'force-reset'; readonly sourceListKind: SourceListKind }
  | { readonly command: 'get-status' };

export interface IProjectionSubscriptionAdminDeps {
  readonly manager: ProjectionSubscriptionManager;
  readonly correlationId?: string;
}

function isSourceListKind(value: unknown): value is SourceListKind {
  return typeof value === 'string' && (SOURCE_LIST_KINDS as readonly string[]).includes(value);
}

function parseCommand(body: unknown): ProjectionSubscriptionAdminCommand | { error: string } {
  if (typeof body !== 'object' || body === null) {
    return { error: 'Request body must be a JSON object.' };
  }
  const candidate = body as Record<string, unknown>;
  const command = candidate.command;
  if (command === 'reconcile') {
    return { command: 'reconcile' };
  }
  if (command === 'get-status') {
    return { command: 'get-status' };
  }
  if (command === 'reconcile-source') {
    if (!isSourceListKind(candidate.sourceListKind)) {
      return { error: 'reconcile-source requires sourceListKind: Projects | LegacyRegistry.' };
    }
    return { command: 'reconcile-source', sourceListKind: candidate.sourceListKind };
  }
  if (command === 'force-reset') {
    if (!isSourceListKind(candidate.sourceListKind)) {
      return { error: 'force-reset requires sourceListKind: Projects | LegacyRegistry.' };
    }
    return { command: 'force-reset', sourceListKind: candidate.sourceListKind };
  }
  return {
    error: 'Unknown command. Allowed: reconcile | reconcile-source | force-reset | get-status.',
  };
}

export async function handleProjectionSubscriptionAdmin(
  request: HttpRequest,
  deps: IProjectionSubscriptionAdminDeps,
): Promise<HttpResponseInit> {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return errorResponse(400, 'VALIDATION_ERROR', 'Invalid JSON body', deps.correlationId);
  }
  const parsed = parseCommand(body);
  if ('error' in parsed) {
    return errorResponse(400, 'VALIDATION_ERROR', parsed.error, deps.correlationId);
  }
  switch (parsed.command) {
    case 'reconcile': {
      const outcome = await deps.manager.ensureAllSubscriptions();
      return successResponse(outcome, outcome.hasFailures ? 207 : 200);
    }
    case 'reconcile-source': {
      const outcome = await deps.manager.ensureSubscription(parsed.sourceListKind);
      const status = outcome.action.endsWith('-failed') ? 207 : 200;
      return successResponse(outcome, status);
    }
    case 'force-reset': {
      const outcome = await deps.manager.forceResetSubscription(parsed.sourceListKind);
      const status = outcome.action === 'reset-failed' ? 207 : 200;
      return successResponse(outcome, status);
    }
    case 'get-status': {
      const outcome = await deps.manager.getStatus();
      return successResponse(outcome, 200);
    }
    default: {
      const exhaustive: never = parsed;
      void exhaustive;
      return errorResponse(400, 'VALIDATION_ERROR', 'Unknown command.', deps.correlationId);
    }
  }
}
