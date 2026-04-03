/**
 * P9-06: Hybrid Identity user lifecycle API routes.
 *
 * Registers authenticated API endpoints for user administration under
 * /api/admin/identity/users/. All routes use the standard admin middleware
 * chain (withAuth → withTelemetry) and delegate to workflow handlers.
 *
 * Route table:
 *   POST   /api/admin/identity/users/search        — Search users
 *   GET    /api/admin/identity/users/{id}           — Read user profile
 *   POST   /api/admin/identity/users                — Create user (AD DS or cloud)
 *   PATCH  /api/admin/identity/users/{id}           — Update user properties
 *   POST   /api/admin/identity/users/{id}/enable    — Enable user
 *   POST   /api/admin/identity/users/{id}/disable   — Disable user
 *   DELETE /api/admin/identity/users/{id}            — Delete user
 */

import { app, type HttpRequest, type HttpResponseInit, type InvocationContext } from '@azure/functions';
import { withAuth } from '../../middleware/auth.js';
import { extractOrGenerateRequestId } from '../../middleware/request-id.js';
import { requireAdmin, requireDelegatedScope } from '../../middleware/authorization.js';
import { createAdminControlPlaneServiceFactory } from '../../hosts/admin-control-plane/service-factory.js';
import { errorResponse, successResponse } from '../../utils/response-helpers.js';
import { withTelemetry } from '../../utils/withTelemetry.js';
import {
  executeUserSearch,
  executeUserRead,
  executeUserCreateADDS,
  executeUserCreateCloud,
  executeUserUpdateADDS,
  executeUserUpdateCloud,
  executeUserToggleADDS,
  executeUserToggleCloud,
  executeUserDeleteADDS,
  executeUserDeleteCloud,
} from '../../services/hybrid-identity-user-workflows.js';
import type { HybridIdentityError } from '../../services/hybrid-identity-errors.js';
import type { IHybridIdentityAuditPayload } from '../../services/hybrid-identity-contracts.js';
import type { IAdminAuditRecord } from '@hbc/models/admin-control-plane';
import { AdminAuditEventType } from '@hbc/models/admin-control-plane';
import type { IAdminControlPlaneServiceContainer } from '../../hosts/admin-control-plane/service-factory.js';

// ─── Error → HTTP status mapping ───────────────────────────────────────────────

function mapErrorToStatus(err: unknown): { status: number; code: string } {
  const hybridErr = err as HybridIdentityError;
  switch (hybridErr.code) {
    case 'VALIDATION':                    return { status: 400, code: hybridErr.code };
    case 'NOT_FOUND':                     return { status: 404, code: hybridErr.code };
    case 'CONFLICT':                      return { status: 409, code: hybridErr.code };
    case 'AUTHORITY_MISMATCH':            return { status: 422, code: hybridErr.code };
    case 'PHASE_BOUNDARY':                return { status: 501, code: hybridErr.code };
    case 'GRAPH_PERMISSION_INSUFFICIENT':
    case 'ADDS_PERMISSION_INSUFFICIENT':  return { status: 403, code: hybridErr.code };
    case 'ADDS_CONNECTIVITY':
    case 'ADDS_AUTHENTICATION':
    case 'GRAPH_TRANSIENT':               return { status: 502, code: hybridErr.code };
    case 'CONNECTION_NOT_CONFIGURED':
    case 'CONNECTION_UNHEALTHY':          return { status: 503, code: hybridErr.code };
    case 'PROTECTED_TARGET':              return { status: 403, code: hybridErr.code };
    case 'SYNC_PENDING':                  return { status: 200, code: hybridErr.code }; // not an error
    default:                              return { status: 500, code: 'INTERNAL_ERROR' };
  }
}

/** Standard admin auth checks for state-changing operations. */
function checkAdminAuth(claims: { upn: string; oid: string; displayName?: string; roles?: string[] }, reqId: string): HttpResponseInit | null {
  const scopeDenied = requireDelegatedScope(claims as never, reqId);
  if (scopeDenied) return scopeDenied;
  const adminDenied = requireAdmin(claims as never, reqId);
  if (adminDenied) return adminDenied;
  return null;
}

/** Resolve actor from auth claims. */
function resolveActor(services: ReturnType<typeof createAdminControlPlaneServiceFactory>, claims: { upn: string; oid: string; displayName?: string }) {
  return {
    upn: claims.upn,
    oid: claims.oid,
    displayName: claims.displayName ?? claims.upn,
  };
}

/** Persist a hybrid identity audit payload as an admin audit record (fire-and-forget). */
function persistIdentityAudit(services: IAdminControlPlaneServiceContainer, audit: IHybridIdentityAuditPayload): void {
  const verb = audit.actionId.split(':').pop() ?? audit.actionId;
  const record: IAdminAuditRecord = {
    auditId: crypto.randomUUID(),
    eventType: audit.success ? AdminAuditEventType.RunCompleted : AdminAuditEventType.RunFailed,
    timestamp: audit.timestamp,
    domain: 'entra-control' as IAdminAuditRecord['domain'],
    actionKey: `entra-control:identity:${verb}` as IAdminAuditRecord['actionKey'],
    runId: audit.correlationId,
    checkpointInstanceId: null,
    actor: { upn: audit.actor.upn, objectId: audit.actor.oid, displayName: audit.actor.displayName, capturedAt: audit.timestamp },
    rationale: null,
    evidenceRef: null,
    configSnapshotRef: null,
    runStatusAtEvent: null,
    summary: `${audit.actionId} on ${audit.target.objectType} "${audit.target.displayName ?? audit.target.identifier}" — ${audit.success ? 'succeeded' : `failed: ${audit.errorMessage ?? 'unknown'}`}`,
  };
  services.auditService.recordEvent(record).catch(() => {});
}

// ─── POST /api/admin/identity/users/search ──────────────────────────────────────

app.http('identityUserSearch', {
  methods: ['POST'],
  authLevel: 'anonymous',
  route: 'admin/identity/users/search',
  handler: withAuth(withTelemetry(async (request: HttpRequest, _context: InvocationContext, auth): Promise<HttpResponseInit> => {
    const reqId = extractOrGenerateRequestId(request);
    const denied = checkAdminAuth(auth.claims, reqId);
    if (denied) return denied;

    const services = createAdminControlPlaneServiceFactory();
    const actor = resolveActor(services, auth.claims);
    const body = (await request.json()) as Record<string, unknown>;

    if (!body.query || typeof body.query !== 'string') {
      return errorResponse(400, 'VALIDATION_ERROR', 'query is required', reqId);
    }

    const { result, audit } = await executeUserSearch(
      { query: body.query, top: typeof body.top === 'number' ? body.top : undefined, actor, correlationId: reqId },
      services,
    );
    persistIdentityAudit(services, audit);

    if (!result.success) {
      const mapped = mapErrorToStatus({ code: result.error?.code } as never);
      return errorResponse(mapped.status, result.error?.code ?? 'ERROR', result.error?.message ?? 'Search failed', reqId);
    }
    return successResponse(result.data);
  }, { domain: 'adminControlPlane', operation: 'identityUserSearch' })),
});

// ─── GET /api/admin/identity/users/{id} ─────────────────────────────────────────

app.http('identityUserRead', {
  methods: ['GET'],
  authLevel: 'anonymous',
  route: 'admin/identity/users/{userId}',
  handler: withAuth(withTelemetry(async (request: HttpRequest, _context: InvocationContext, auth): Promise<HttpResponseInit> => {
    const reqId = extractOrGenerateRequestId(request);
    const scopeDenied = requireDelegatedScope(auth.claims as never, reqId);
    if (scopeDenied) return scopeDenied;

    const services = createAdminControlPlaneServiceFactory();
    const actor = resolveActor(services, auth.claims);
    const userId = request.params.userId ?? '';

    const { result, audit } = await executeUserRead({ userIdentifier: userId, actor, correlationId: reqId }, services);
    persistIdentityAudit(services, audit);

    if (!result.success) {
      if (result.error?.code === 'NOT_FOUND') return errorResponse(404, 'NOT_FOUND', result.error.message, reqId);
      const mapped = mapErrorToStatus({ code: result.error?.code } as never);
      return errorResponse(mapped.status, result.error?.code ?? 'ERROR', result.error?.message ?? 'Read failed', reqId);
    }
    return successResponse(result.data);
  }, { domain: 'adminControlPlane', operation: 'identityUserRead' })),
});

// ─── POST /api/admin/identity/users ─────────────────────────────────────────────

app.http('identityUserCreate', {
  methods: ['POST'],
  authLevel: 'anonymous',
  route: 'admin/identity/users',
  handler: withAuth(withTelemetry(async (request: HttpRequest, _context: InvocationContext, auth): Promise<HttpResponseInit> => {
    const reqId = extractOrGenerateRequestId(request);
    const denied = checkAdminAuth(auth.claims, reqId);
    if (denied) return denied;

    const services = createAdminControlPlaneServiceFactory();
    const actor = resolveActor(services, auth.claims);
    const body = (await request.json()) as Record<string, unknown>;

    const authority = body.authority as string;
    let outcome: { result: { success: boolean; error?: { code?: string; message?: string }; data?: Record<string, unknown>; syncState?: unknown }; audit: IHybridIdentityAuditPayload };

    if (authority === 'ad-ds') {
      if (!body.samAccountName || !body.userPrincipalName || !body.displayName || !body.targetOu) {
        return errorResponse(400, 'VALIDATION_ERROR', 'samAccountName, userPrincipalName, displayName, and targetOu are required for AD DS user creation', reqId);
      }
      outcome = await executeUserCreateADDS({
        samAccountName: body.samAccountName as string,
        userPrincipalName: body.userPrincipalName as string,
        displayName: body.displayName as string,
        givenName: body.givenName as string | undefined,
        surname: body.surname as string | undefined,
        department: body.department as string | undefined,
        title: body.title as string | undefined,
        mail: body.mail as string | undefined,
        targetOu: body.targetOu as string,
        actor,
        correlationId: reqId,
      }, services);
    } else if (authority === 'entra' || authority === 'cloud') {
      if (!body.displayName || !body.userPrincipalName || !body.mailNickname || !body.password) {
        return errorResponse(400, 'VALIDATION_ERROR', 'displayName, userPrincipalName, mailNickname, and password are required for cloud user creation', reqId);
      }
      outcome = await executeUserCreateCloud({
        displayName: body.displayName as string,
        userPrincipalName: body.userPrincipalName as string,
        mailNickname: body.mailNickname as string,
        password: body.password as string,
        forceChangePassword: body.forceChangePassword !== false,
        jobTitle: body.jobTitle as string | undefined,
        department: body.department as string | undefined,
        actor,
        correlationId: reqId,
      }, services);
    } else {
      return errorResponse(400, 'VALIDATION_ERROR', 'authority must be "ad-ds" or "entra"', reqId);
    }

    persistIdentityAudit(services, outcome.audit);

    if (!outcome.result.success) {
      const mapped = mapErrorToStatus({ code: outcome.result.error?.code } as never);
      return errorResponse(mapped.status, outcome.result.error?.code ?? 'ERROR', outcome.result.error?.message ?? 'Create failed', reqId);
    }
    return successResponse(outcome.result.data, 201);
  }, { domain: 'adminControlPlane', operation: 'identityUserCreate' })),
});

// ─── PATCH /api/admin/identity/users/{id} ───────────────────────────────────────

app.http('identityUserUpdate', {
  methods: ['PATCH'],
  authLevel: 'anonymous',
  route: 'admin/identity/users/{userId}',
  handler: withAuth(withTelemetry(async (request: HttpRequest, _context: InvocationContext, auth): Promise<HttpResponseInit> => {
    const reqId = extractOrGenerateRequestId(request);
    const denied = checkAdminAuth(auth.claims, reqId);
    if (denied) return denied;

    const services = createAdminControlPlaneServiceFactory();
    const actor = resolveActor(services, auth.claims);
    const userId = request.params.userId ?? '';
    const body = (await request.json()) as Record<string, unknown>;

    const authority = body.authority as string;
    const properties = body.properties as Record<string, unknown> | undefined;

    if (!properties || typeof properties !== 'object') {
      return errorResponse(400, 'VALIDATION_ERROR', 'properties object is required', reqId);
    }

    let outcome: { result: { success: boolean; error?: { code?: string; message?: string }; data?: Record<string, unknown> }; audit: IHybridIdentityAuditPayload };

    if (authority === 'ad-ds') {
      outcome = await executeUserUpdateADDS({ distinguishedName: userId, properties, actor, correlationId: reqId }, services);
    } else if (authority === 'entra' || authority === 'cloud') {
      outcome = await executeUserUpdateCloud({ userId, properties, actor, correlationId: reqId }, services);
    } else {
      return errorResponse(400, 'VALIDATION_ERROR', 'authority must be "ad-ds" or "entra"', reqId);
    }
    persistIdentityAudit(services, outcome.audit);

    if (!outcome.result.success) {
      const mapped = mapErrorToStatus({ code: outcome.result.error?.code } as never);
      return errorResponse(mapped.status, outcome.result.error?.code ?? 'ERROR', outcome.result.error?.message ?? 'Update failed', reqId);
    }
    return successResponse(outcome.result.data);
  }, { domain: 'adminControlPlane', operation: 'identityUserUpdate' })),
});

// ─── POST /api/admin/identity/users/{id}/enable ─────────────────────────────────

app.http('identityUserEnable', {
  methods: ['POST'],
  authLevel: 'anonymous',
  route: 'admin/identity/users/{userId}/enable',
  handler: withAuth(withTelemetry(async (request: HttpRequest, _context: InvocationContext, auth): Promise<HttpResponseInit> => {
    const reqId = extractOrGenerateRequestId(request);
    const denied = checkAdminAuth(auth.claims, reqId);
    if (denied) return denied;

    const services = createAdminControlPlaneServiceFactory();
    const actor = resolveActor(services, auth.claims);
    const userId = request.params.userId ?? '';
    const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
    const authority = (body.authority as string) ?? 'ad-ds';

    let outcome: { result: { success: boolean; error?: { code?: string; message?: string }; data?: Record<string, unknown> }; audit: IHybridIdentityAuditPayload };

    if (authority === 'ad-ds') {
      outcome = await executeUserToggleADDS({ distinguishedName: userId, enabled: true, actor, correlationId: reqId }, services);
    } else {
      outcome = await executeUserToggleCloud({ userId, enabled: true, actor, correlationId: reqId }, services);
    }
    persistIdentityAudit(services, outcome.audit);

    if (!outcome.result.success) {
      const mapped = mapErrorToStatus({ code: outcome.result.error?.code } as never);
      return errorResponse(mapped.status, outcome.result.error?.code ?? 'ERROR', outcome.result.error?.message ?? 'Enable failed', reqId);
    }
    return successResponse(outcome.result.data);
  }, { domain: 'adminControlPlane', operation: 'identityUserEnable' })),
});

// ─── POST /api/admin/identity/users/{id}/disable ────────────────────────────────

app.http('identityUserDisable', {
  methods: ['POST'],
  authLevel: 'anonymous',
  route: 'admin/identity/users/{userId}/disable',
  handler: withAuth(withTelemetry(async (request: HttpRequest, _context: InvocationContext, auth): Promise<HttpResponseInit> => {
    const reqId = extractOrGenerateRequestId(request);
    const denied = checkAdminAuth(auth.claims, reqId);
    if (denied) return denied;

    const services = createAdminControlPlaneServiceFactory();
    const actor = resolveActor(services, auth.claims);
    const userId = request.params.userId ?? '';
    const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
    const authority = (body.authority as string) ?? 'ad-ds';

    let outcome: { result: { success: boolean; error?: { code?: string; message?: string }; data?: Record<string, unknown> }; audit: IHybridIdentityAuditPayload };

    if (authority === 'ad-ds') {
      outcome = await executeUserToggleADDS({ distinguishedName: userId, enabled: false, actor, correlationId: reqId }, services);
    } else {
      outcome = await executeUserToggleCloud({ userId, enabled: false, actor, correlationId: reqId }, services);
    }
    persistIdentityAudit(services, outcome.audit);

    if (!outcome.result.success) {
      const mapped = mapErrorToStatus({ code: outcome.result.error?.code } as never);
      return errorResponse(mapped.status, outcome.result.error?.code ?? 'ERROR', outcome.result.error?.message ?? 'Disable failed', reqId);
    }
    return successResponse(outcome.result.data);
  }, { domain: 'adminControlPlane', operation: 'identityUserDisable' })),
});

// ─── DELETE /api/admin/identity/users/{id} ──────────────────────────────────────

app.http('identityUserDelete', {
  methods: ['DELETE'],
  authLevel: 'anonymous',
  route: 'admin/identity/users/{userId}',
  handler: withAuth(withTelemetry(async (request: HttpRequest, _context: InvocationContext, auth): Promise<HttpResponseInit> => {
    const reqId = extractOrGenerateRequestId(request);
    const denied = checkAdminAuth(auth.claims, reqId);
    if (denied) return denied;

    const services = createAdminControlPlaneServiceFactory();
    const actor = resolveActor(services, auth.claims);
    const userId = request.params.userId ?? '';
    const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
    const authority = (body.authority as string) ?? 'ad-ds';
    const confirmationToken = body.confirmationToken as string | undefined;

    if (!confirmationToken) {
      return errorResponse(400, 'VALIDATION_ERROR', 'confirmationToken is required for destructive operations', reqId);
    }

    let outcome: { result: { success: boolean; error?: { code?: string; message?: string }; data?: Record<string, unknown> }; audit: IHybridIdentityAuditPayload };

    if (authority === 'ad-ds') {
      outcome = await executeUserDeleteADDS({ distinguishedName: userId, confirmationToken, actor, correlationId: reqId }, services);
    } else {
      outcome = await executeUserDeleteCloud({ userId, confirmationToken, actor, correlationId: reqId }, services);
    }
    persistIdentityAudit(services, outcome.audit);

    if (!outcome.result.success) {
      const mapped = mapErrorToStatus({ code: outcome.result.error?.code } as never);
      return errorResponse(mapped.status, outcome.result.error?.code ?? 'ERROR', outcome.result.error?.message ?? 'Delete failed', reqId);
    }
    return successResponse(outcome.result.data);
  }, { domain: 'adminControlPlane', operation: 'identityUserDelete' })),
});
