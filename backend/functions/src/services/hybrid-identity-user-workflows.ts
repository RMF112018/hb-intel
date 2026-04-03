/**
 * P9-06: AD DS and cloud-only user lifecycle workflow handlers.
 *
 * Each handler receives a typed request + service container, validates input,
 * runs connector preflight, executes against the correct adapter (AD DS or Graph),
 * captures audit payload, and returns a normalized result.
 *
 * These handlers are pure workflow functions — they do not handle HTTP or auth.
 * API route handlers in hybrid-identity-routes.ts call these functions after
 * parsing the HTTP request and resolving auth context.
 */

import type { IAdminControlPlaneServiceContainer } from '../hosts/admin-control-plane/service-factory.js';
import type {
  IHybridIdentityResult,
  IHybridIdentityActor,
  IHybridIdentityAuditPayload,
  IHybridIdentitySyncState,
} from './hybrid-identity-contracts.js';
import {
  validateBaseRequest,
  validateUserIdentifier,
  validateUpn,
  validateSamAccountName,
  validateDistinguishedName,
  validateADDSUserProperties,
  validateCloudUserProperties,
  validateDestructiveConfirmation,
  validateConnectorPreflight,
} from './hybrid-identity-validators.js';
import { buildAuditPayload } from './hybrid-identity-workflow-router.js';
import type { HybridIdentityError } from './hybrid-identity-errors.js';

// ─── Shared helpers ────────────────────────────────────────────────────────────

const DEFAULT_SYNC_STATE: IHybridIdentitySyncState = {
  syncPending: true,
  estimatedSyncWindowMinutes: 30,
  lastKnownSyncTime: null,
};

function makeResult(
  actionId: IHybridIdentityResult['actionId'],
  correlationId: string,
  authorityUsed: IHybridIdentityResult['authorityUsed'],
  success: boolean,
  data?: Record<string, unknown>,
  error?: { code: string; message: string; operatorGuidance?: string },
  syncState?: IHybridIdentitySyncState,
): IHybridIdentityResult {
  return {
    actionId,
    success,
    correlationId,
    timestamp: new Date().toISOString(),
    authorityUsed,
    ...(data && { data }),
    ...(error && { error }),
    ...(syncState && { syncState }),
  };
}

function handleWorkflowError(
  actionId: IHybridIdentityResult['actionId'],
  correlationId: string,
  authorityUsed: IHybridIdentityResult['authorityUsed'],
  err: unknown,
): IHybridIdentityResult {
  const hybridErr = err as HybridIdentityError;
  const code = hybridErr.code ?? 'UNKNOWN';
  const message = err instanceof Error ? err.message : 'Unknown error';
  return makeResult(actionId, correlationId, authorityUsed, false, undefined, {
    code,
    message,
    operatorGuidance: message,
  });
}

// ─── U-01: Search users ────────────────────────────────────────────────────────

export async function executeUserSearch(
  params: { query: string; top?: number; actor: IHybridIdentityActor; correlationId: string },
  services: IAdminControlPlaneServiceContainer,
): Promise<{ result: IHybridIdentityResult; audit: IHybridIdentityAuditPayload }> {
  const { query, top, actor, correlationId } = params;

  try {
    await validateConnectorPreflight('user:search', services.connectionRegistry);
    const users = await services.graph.searchUsers(query, top);

    const result = makeResult('user:search', correlationId, 'visibility', true, {
      users,
      count: users.length,
    });
    const audit = buildAuditPayload({
      actionId: 'user:search',
      actor,
      target: { objectType: 'user', identifier: query, displayName: null },
      correlationId,
      success: true,
      connectorUsed: 'graph-identity',
    });
    return { result, audit };
  } catch (err) {
    const result = handleWorkflowError('user:search', correlationId, 'visibility', err);
    const audit = buildAuditPayload({
      actionId: 'user:search',
      actor,
      target: { objectType: 'user', identifier: query, displayName: null },
      correlationId,
      success: false,
      errorCode: result.error?.code,
      errorMessage: result.error?.message,
      connectorUsed: 'graph-identity',
    });
    return { result, audit };
  }
}

// ─── U-02: Read user profile ───────────────────────────────────────────────────

export async function executeUserRead(
  params: { userIdentifier: string; actor: IHybridIdentityActor; correlationId: string },
  services: IAdminControlPlaneServiceContainer,
): Promise<{ result: IHybridIdentityResult; audit: IHybridIdentityAuditPayload }> {
  const { userIdentifier, actor, correlationId } = params;

  try {
    validateUserIdentifier(userIdentifier, 'user:read');
    await validateConnectorPreflight('user:read', services.connectionRegistry);

    const user = await services.graph.getUser(userIdentifier);
    if (!user) {
      return buildNotFoundResponse('user:read', 'user', userIdentifier, actor, correlationId);
    }

    const result = makeResult('user:read', correlationId, 'visibility', true, { user });
    const audit = buildAuditPayload({
      actionId: 'user:read',
      actor,
      target: { objectType: 'user', identifier: userIdentifier, displayName: user.displayName },
      correlationId,
      success: true,
      connectorUsed: 'graph-identity',
    });
    return { result, audit };
  } catch (err) {
    const result = handleWorkflowError('user:read', correlationId, 'visibility', err);
    const audit = buildAuditPayload({
      actionId: 'user:read',
      actor,
      target: { objectType: 'user', identifier: userIdentifier, displayName: null },
      correlationId,
      success: false,
      errorCode: result.error?.code,
      errorMessage: result.error?.message,
    });
    return { result, audit };
  }
}

// ─── U-03: Create user (AD DS) ─────────────────────────────────────────────────

export async function executeUserCreateADDS(
  params: {
    samAccountName: string;
    userPrincipalName: string;
    displayName: string;
    givenName?: string;
    surname?: string;
    department?: string;
    title?: string;
    mail?: string;
    targetOu: string;
    actor: IHybridIdentityActor;
    correlationId: string;
  },
  services: IAdminControlPlaneServiceContainer,
): Promise<{ result: IHybridIdentityResult; audit: IHybridIdentityAuditPayload }> {
  const { actor, correlationId, ...props } = params;

  try {
    validateSamAccountName(props.samAccountName, 'user:create-adds');
    validateUpn(props.userPrincipalName, 'user:create-adds');
    validateDistinguishedName(`CN=placeholder,${props.targetOu}`, 'user:create-adds');
    await validateConnectorPreflight('user:create-adds', services.connectionRegistry);

    const record = await services.adDirectory.createUser({
      samAccountName: props.samAccountName,
      userPrincipalName: props.userPrincipalName,
      displayName: props.displayName,
      givenName: props.givenName,
      surname: props.surname,
      department: props.department,
      title: props.title,
      mail: props.mail,
      targetOu: props.targetOu,
    });

    const result = makeResult('user:create-adds', correlationId, 'ad-ds', true, {
      user: record,
    }, undefined, DEFAULT_SYNC_STATE);
    const audit = buildAuditPayload({
      actionId: 'user:create-adds',
      actor,
      target: { objectType: 'user', identifier: record.distinguishedName, displayName: record.displayName },
      correlationId,
      success: true,
      connectorUsed: 'ad-ds',
      syncState: DEFAULT_SYNC_STATE,
    });
    return { result, audit };
  } catch (err) {
    const result = handleWorkflowError('user:create-adds', correlationId, 'ad-ds', err);
    const audit = buildAuditPayload({
      actionId: 'user:create-adds',
      actor,
      target: { objectType: 'user', identifier: props.samAccountName, displayName: props.displayName },
      correlationId,
      success: false,
      errorCode: result.error?.code,
      errorMessage: result.error?.message,
      connectorUsed: 'ad-ds',
    });
    return { result, audit };
  }
}

// ─── U-04: Create cloud-only user ──────────────────────────────────────────────

export async function executeUserCreateCloud(
  params: {
    displayName: string;
    userPrincipalName: string;
    mailNickname: string;
    password: string;
    forceChangePassword: boolean;
    jobTitle?: string;
    department?: string;
    actor: IHybridIdentityActor;
    correlationId: string;
  },
  services: IAdminControlPlaneServiceContainer,
): Promise<{ result: IHybridIdentityResult; audit: IHybridIdentityAuditPayload }> {
  const { actor, correlationId, ...props } = params;

  try {
    validateUpn(props.userPrincipalName, 'user:create-cloud');
    await validateConnectorPreflight('user:create-cloud', services.connectionRegistry);

    const userId = await services.graph.createCloudUser({
      displayName: props.displayName,
      userPrincipalName: props.userPrincipalName,
      mailNickname: props.mailNickname,
      accountEnabled: true,
      passwordProfile: {
        password: props.password,
        forceChangePasswordNextSignIn: props.forceChangePassword,
      },
      jobTitle: props.jobTitle,
      department: props.department,
    });

    const result = makeResult('user:create-cloud', correlationId, 'entra', true, { userId });
    const audit = buildAuditPayload({
      actionId: 'user:create-cloud',
      actor,
      target: { objectType: 'user', identifier: props.userPrincipalName, displayName: props.displayName },
      correlationId,
      success: true,
      connectorUsed: 'graph-identity',
    });
    return { result, audit };
  } catch (err) {
    const result = handleWorkflowError('user:create-cloud', correlationId, 'entra', err);
    const audit = buildAuditPayload({
      actionId: 'user:create-cloud',
      actor,
      target: { objectType: 'user', identifier: props.userPrincipalName, displayName: props.displayName },
      correlationId,
      success: false,
      errorCode: result.error?.code,
      errorMessage: result.error?.message,
      connectorUsed: 'graph-identity',
    });
    return { result, audit };
  }
}

// ─── U-05: Update user (AD DS) ─────────────────────────────────────────────────

export async function executeUserUpdateADDS(
  params: {
    distinguishedName: string;
    properties: Record<string, unknown>;
    actor: IHybridIdentityActor;
    correlationId: string;
  },
  services: IAdminControlPlaneServiceContainer,
): Promise<{ result: IHybridIdentityResult; audit: IHybridIdentityAuditPayload }> {
  const { distinguishedName, properties, actor, correlationId } = params;

  try {
    validateDistinguishedName(distinguishedName, 'user:update-adds');
    validateADDSUserProperties(properties, 'user:update-adds');
    await validateConnectorPreflight('user:update-adds', services.connectionRegistry);

    await services.adDirectory.updateUser(distinguishedName, properties);

    const result = makeResult('user:update-adds', correlationId, 'ad-ds', true, {
      distinguishedName,
      updatedProperties: Object.keys(properties),
    }, undefined, DEFAULT_SYNC_STATE);
    const audit = buildAuditPayload({
      actionId: 'user:update-adds',
      actor,
      target: { objectType: 'user', identifier: distinguishedName, displayName: null },
      correlationId,
      success: true,
      connectorUsed: 'ad-ds',
      syncState: DEFAULT_SYNC_STATE,
    });
    return { result, audit };
  } catch (err) {
    const result = handleWorkflowError('user:update-adds', correlationId, 'ad-ds', err);
    const audit = buildAuditPayload({
      actionId: 'user:update-adds',
      actor,
      target: { objectType: 'user', identifier: distinguishedName, displayName: null },
      correlationId,
      success: false,
      errorCode: result.error?.code,
      errorMessage: result.error?.message,
      connectorUsed: 'ad-ds',
    });
    return { result, audit };
  }
}

// ─── U-06: Update cloud-only user ──────────────────────────────────────────────

export async function executeUserUpdateCloud(
  params: {
    userId: string;
    properties: Record<string, unknown>;
    actor: IHybridIdentityActor;
    correlationId: string;
  },
  services: IAdminControlPlaneServiceContainer,
): Promise<{ result: IHybridIdentityResult; audit: IHybridIdentityAuditPayload }> {
  const { userId, properties, actor, correlationId } = params;

  try {
    validateCloudUserProperties(properties, 'user:update-cloud');
    await validateConnectorPreflight('user:update-cloud', services.connectionRegistry);

    await services.graph.updateCloudUser(userId, properties as never);

    const result = makeResult('user:update-cloud', correlationId, 'entra', true, {
      userId,
      updatedProperties: Object.keys(properties),
    });
    const audit = buildAuditPayload({
      actionId: 'user:update-cloud',
      actor,
      target: { objectType: 'user', identifier: userId, displayName: null },
      correlationId,
      success: true,
      connectorUsed: 'graph-identity',
    });
    return { result, audit };
  } catch (err) {
    const result = handleWorkflowError('user:update-cloud', correlationId, 'entra', err);
    const audit = buildAuditPayload({
      actionId: 'user:update-cloud',
      actor,
      target: { objectType: 'user', identifier: userId, displayName: null },
      correlationId,
      success: false,
      errorCode: result.error?.code,
      errorMessage: result.error?.message,
      connectorUsed: 'graph-identity',
    });
    return { result, audit };
  }
}

// ─── U-07/U-09: Disable/Enable user (AD DS) ────────────────────────────────────

export async function executeUserToggleADDS(
  params: {
    distinguishedName: string;
    enabled: boolean;
    actor: IHybridIdentityActor;
    correlationId: string;
  },
  services: IAdminControlPlaneServiceContainer,
): Promise<{ result: IHybridIdentityResult; audit: IHybridIdentityAuditPayload }> {
  const { distinguishedName, enabled, actor, correlationId } = params;
  const actionId = enabled ? 'user:enable-adds' as const : 'user:disable-adds' as const;

  try {
    validateDistinguishedName(distinguishedName, actionId);
    await validateConnectorPreflight(actionId, services.connectionRegistry);

    await services.adDirectory.setAccountEnabled(distinguishedName, enabled);

    const result = makeResult(actionId, correlationId, 'ad-ds', true, {
      distinguishedName,
      accountEnabled: enabled,
    }, undefined, DEFAULT_SYNC_STATE);
    const audit = buildAuditPayload({
      actionId,
      actor,
      target: { objectType: 'user', identifier: distinguishedName, displayName: null },
      correlationId,
      success: true,
      connectorUsed: 'ad-ds',
      syncState: DEFAULT_SYNC_STATE,
    });
    return { result, audit };
  } catch (err) {
    const result = handleWorkflowError(actionId, correlationId, 'ad-ds', err);
    const audit = buildAuditPayload({
      actionId,
      actor,
      target: { objectType: 'user', identifier: distinguishedName, displayName: null },
      correlationId,
      success: false,
      errorCode: result.error?.code,
      errorMessage: result.error?.message,
      connectorUsed: 'ad-ds',
    });
    return { result, audit };
  }
}

// ─── U-08/U-10: Disable/Enable cloud-only user ─────────────────────────────────

export async function executeUserToggleCloud(
  params: {
    userId: string;
    enabled: boolean;
    actor: IHybridIdentityActor;
    correlationId: string;
  },
  services: IAdminControlPlaneServiceContainer,
): Promise<{ result: IHybridIdentityResult; audit: IHybridIdentityAuditPayload }> {
  const { userId, enabled, actor, correlationId } = params;
  const actionId = enabled ? 'user:enable-cloud' as const : 'user:disable-cloud' as const;

  try {
    await validateConnectorPreflight(actionId, services.connectionRegistry);

    await services.graph.setCloudUserAccountEnabled(userId, enabled);

    const result = makeResult(actionId, correlationId, 'entra', true, {
      userId,
      accountEnabled: enabled,
    });
    const audit = buildAuditPayload({
      actionId,
      actor,
      target: { objectType: 'user', identifier: userId, displayName: null },
      correlationId,
      success: true,
      connectorUsed: 'graph-identity',
    });
    return { result, audit };
  } catch (err) {
    const result = handleWorkflowError(actionId, correlationId, 'entra', err);
    const audit = buildAuditPayload({
      actionId,
      actor,
      target: { objectType: 'user', identifier: userId, displayName: null },
      correlationId,
      success: false,
      errorCode: result.error?.code,
      errorMessage: result.error?.message,
      connectorUsed: 'graph-identity',
    });
    return { result, audit };
  }
}

// ─── U-11: Delete user (AD DS) ─────────────────────────────────────────────────

export async function executeUserDeleteADDS(
  params: {
    distinguishedName: string;
    confirmationToken: string;
    actor: IHybridIdentityActor;
    correlationId: string;
  },
  services: IAdminControlPlaneServiceContainer,
): Promise<{ result: IHybridIdentityResult; audit: IHybridIdentityAuditPayload }> {
  const { distinguishedName, confirmationToken, actor, correlationId } = params;

  try {
    validateDistinguishedName(distinguishedName, 'user:delete-adds');
    validateDestructiveConfirmation('user:delete-adds', confirmationToken, 'user:delete-adds');
    await validateConnectorPreflight('user:delete-adds', services.connectionRegistry);

    await services.adDirectory.deleteUser(distinguishedName);

    const result = makeResult('user:delete-adds', correlationId, 'ad-ds', true, {
      distinguishedName,
      deleted: true,
    }, undefined, DEFAULT_SYNC_STATE);
    const audit = buildAuditPayload({
      actionId: 'user:delete-adds',
      actor,
      target: { objectType: 'user', identifier: distinguishedName, displayName: null },
      correlationId,
      success: true,
      connectorUsed: 'ad-ds',
      syncState: DEFAULT_SYNC_STATE,
      evidenceSummary: `User ${distinguishedName} deleted from AD DS`,
    });
    return { result, audit };
  } catch (err) {
    const result = handleWorkflowError('user:delete-adds', correlationId, 'ad-ds', err);
    const audit = buildAuditPayload({
      actionId: 'user:delete-adds',
      actor,
      target: { objectType: 'user', identifier: distinguishedName, displayName: null },
      correlationId,
      success: false,
      errorCode: result.error?.code,
      errorMessage: result.error?.message,
      connectorUsed: 'ad-ds',
    });
    return { result, audit };
  }
}

// ─── U-12: Delete cloud-only user ──────────────────────────────────────────────

export async function executeUserDeleteCloud(
  params: {
    userId: string;
    confirmationToken: string;
    actor: IHybridIdentityActor;
    correlationId: string;
  },
  services: IAdminControlPlaneServiceContainer,
): Promise<{ result: IHybridIdentityResult; audit: IHybridIdentityAuditPayload }> {
  const { userId, confirmationToken, actor, correlationId } = params;

  try {
    validateDestructiveConfirmation('user:delete-cloud', confirmationToken, 'user:delete-cloud');
    await validateConnectorPreflight('user:delete-cloud', services.connectionRegistry);

    await services.graph.deleteCloudUser(userId);

    const result = makeResult('user:delete-cloud', correlationId, 'entra', true, {
      userId,
      deleted: true,
    });
    const audit = buildAuditPayload({
      actionId: 'user:delete-cloud',
      actor,
      target: { objectType: 'user', identifier: userId, displayName: null },
      correlationId,
      success: true,
      connectorUsed: 'graph-identity',
      evidenceSummary: `Cloud-only user ${userId} deleted (soft-delete, 30-day recovery window)`,
    });
    return { result, audit };
  } catch (err) {
    const result = handleWorkflowError('user:delete-cloud', correlationId, 'entra', err);
    const audit = buildAuditPayload({
      actionId: 'user:delete-cloud',
      actor,
      target: { objectType: 'user', identifier: userId, displayName: null },
      correlationId,
      success: false,
      errorCode: result.error?.code,
      errorMessage: result.error?.message,
      connectorUsed: 'graph-identity',
    });
    return { result, audit };
  }
}

// ─── Helpers ───────────────────────────────────────────────────────────────────

function buildNotFoundResponse(
  actionId: IHybridIdentityResult['actionId'],
  objectType: string,
  identifier: string,
  actor: IHybridIdentityActor,
  correlationId: string,
): { result: IHybridIdentityResult; audit: IHybridIdentityAuditPayload } {
  const result = makeResult(actionId, correlationId, 'visibility', false, undefined, {
    code: 'NOT_FOUND',
    message: `${objectType} not found: ${identifier}`,
  });
  const audit = buildAuditPayload({
    actionId,
    actor,
    target: { objectType: objectType as 'user', identifier, displayName: null },
    correlationId,
    success: false,
    errorCode: 'NOT_FOUND',
    errorMessage: `${objectType} not found: ${identifier}`,
  });
  return { result, audit };
}
