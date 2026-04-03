/**
 * P9-05: Validation primitives for hybrid identity requests.
 *
 * Input validation for user/group identifiers, property mutations,
 * source-of-authority compatibility, destructive-action confirmation,
 * and connector-aware preflight.
 */

import { IdentityValidationError } from './hybrid-identity-errors.js';
import type { IdentityAuthorityType } from './graph-service.js';
import type { ConnectorClass } from './connection-registry-service.js';
import type { IConnectionRegistryService } from './connection-registry-service.js';
import type { HybridIdentityActionId, IHybridIdentityRequest } from './hybrid-identity-contracts.js';

// ─── Identifier validation ─────────────────────────────────────────────────────

const UPN_PATTERN = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
const GUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const SAM_ACCOUNT_PATTERN = /^[a-zA-Z0-9._-]{1,20}$/;
const DN_PATTERN = /^CN=.+,(OU|DC)=.+$/i;

/** Validate a UPN (user@domain.com). */
export function validateUpn(upn: string, context: string): void {
  if (!upn || !UPN_PATTERN.test(upn)) {
    throw new IdentityValidationError(context, `Invalid UPN format: "${upn}". Expected user@domain.tld`);
  }
}

/** Validate a GUID / object ID. */
export function validateObjectId(id: string, context: string): void {
  if (!id || !GUID_PATTERN.test(id)) {
    throw new IdentityValidationError(context, `Invalid object ID format: "${id}". Expected UUID.`);
  }
}

/** Validate a sAMAccountName. */
export function validateSamAccountName(sam: string, context: string): void {
  if (!sam || !SAM_ACCOUNT_PATTERN.test(sam)) {
    throw new IdentityValidationError(context, `Invalid sAMAccountName: "${sam}". Max 20 chars, alphanumeric/._- only.`);
  }
}

/** Validate a distinguished name. */
export function validateDistinguishedName(dn: string, context: string): void {
  if (!dn || !DN_PATTERN.test(dn)) {
    throw new IdentityValidationError(context, `Invalid distinguished name: "${dn}". Expected CN=...,OU=... or CN=...,DC=...`);
  }
}

/** Validate a user identifier (accepts UPN, GUID, or sAMAccountName). */
export function validateUserIdentifier(identifier: string, context: string): void {
  if (!identifier || identifier.trim().length === 0) {
    throw new IdentityValidationError(context, 'User identifier is required.');
  }
  // Accept any of: UPN, GUID, or sAMAccountName — the Graph/AD DS services resolve
}

// ─── Property mutation validation ──────────────────────────────────────────────

const ALLOWED_ADDS_USER_PROPERTIES = new Set(['displayName', 'department', 'title', 'mail', 'givenName', 'surname']);
const ALLOWED_CLOUD_USER_PROPERTIES = new Set(['displayName', 'jobTitle', 'department', 'mail']);

/** Validate that update properties are in the allowed set for AD DS users. */
export function validateADDSUserProperties(properties: Record<string, unknown>, context: string): void {
  const keys = Object.keys(properties);
  if (keys.length === 0) {
    throw new IdentityValidationError(context, 'At least one property must be specified for update.');
  }
  for (const key of keys) {
    if (!ALLOWED_ADDS_USER_PROPERTIES.has(key)) {
      throw new IdentityValidationError(context, `Property "${key}" is not an allowed AD DS user update property. Allowed: ${[...ALLOWED_ADDS_USER_PROPERTIES].join(', ')}`);
    }
  }
}

/** Validate that update properties are in the allowed set for cloud-only users. */
export function validateCloudUserProperties(properties: Record<string, unknown>, context: string): void {
  const keys = Object.keys(properties);
  if (keys.length === 0) {
    throw new IdentityValidationError(context, 'At least one property must be specified for update.');
  }
  for (const key of keys) {
    if (!ALLOWED_CLOUD_USER_PROPERTIES.has(key)) {
      throw new IdentityValidationError(context, `Property "${key}" is not an allowed cloud user update property. Allowed: ${[...ALLOWED_CLOUD_USER_PROPERTIES].join(', ')}`);
    }
  }
}

// ─── Source-of-authority compatibility ──────────────────────────────────────────

/** Actions that require AD DS authority. */
const ADDS_ACTIONS = new Set<HybridIdentityActionId>([
  'user:create-adds', 'user:update-adds', 'user:disable-adds', 'user:enable-adds', 'user:delete-adds',
  'group:create-adds', 'group:add-members-adds', 'group:remove-members-adds', 'group:delete-adds',
]);

/** Actions that require Entra/cloud authority. */
const CLOUD_ACTIONS = new Set<HybridIdentityActionId>([
  'user:create-cloud', 'user:update-cloud', 'user:disable-cloud', 'user:enable-cloud', 'user:delete-cloud',
  'group:create-cloud', 'group:update-cloud', 'group:add-members-cloud', 'group:remove-members-cloud', 'group:delete-cloud',
]);

/**
 * Validate that the action is compatible with the target object's authority type.
 * Prevents AD DS mutations on cloud-only objects and vice versa.
 */
export function validateAuthorityCompatibility(
  actionId: HybridIdentityActionId,
  targetAuthority: IdentityAuthorityType,
  context: string,
): void {
  if (ADDS_ACTIONS.has(actionId) && targetAuthority === 'entra') {
    throw new IdentityValidationError(context, `Action "${actionId}" requires AD DS authority, but target is cloud-only (Entra).`);
  }
  if (CLOUD_ACTIONS.has(actionId) && targetAuthority === 'ad-ds') {
    throw new IdentityValidationError(context, `Action "${actionId}" requires cloud/Entra authority, but target is AD DS-synced.`);
  }
}

// ─── Destructive action confirmation ───────────────────────────────────────────

/** Actions that require a confirmation token for destructive operations. */
const DESTRUCTIVE_ACTIONS = new Set<HybridIdentityActionId>([
  'user:delete-adds', 'user:delete-cloud',
  'group:delete-cloud', 'group:delete-adds',
]);

/** Validate that destructive actions include a confirmation token. */
export function validateDestructiveConfirmation(
  actionId: HybridIdentityActionId,
  confirmationToken: string | undefined,
  context: string,
): void {
  if (DESTRUCTIVE_ACTIONS.has(actionId) && (!confirmationToken || confirmationToken.trim().length === 0)) {
    throw new IdentityValidationError(context, `Action "${actionId}" is destructive and requires a confirmation token.`);
  }
}

// ─── Connector-aware preflight ─────────────────────────────────────────────────

/** Map action IDs to their required connector class. */
const ACTION_CONNECTOR_MAP = new Map<HybridIdentityActionId, ConnectorClass[]>([
  ['user:create-adds', ['ad-ds']],
  ['user:update-adds', ['ad-ds']],
  ['user:disable-adds', ['ad-ds']],
  ['user:enable-adds', ['ad-ds']],
  ['user:delete-adds', ['ad-ds']],
  ['group:create-adds', ['ad-ds']],
  ['group:add-members-adds', ['ad-ds']],
  ['group:remove-members-adds', ['ad-ds']],
  ['group:delete-adds', ['ad-ds']],
  ['user:search', ['graph-identity']],
  ['user:read', ['graph-identity']],
  ['user:create-cloud', ['graph-identity']],
  ['user:update-cloud', ['graph-identity']],
  ['user:disable-cloud', ['graph-identity']],
  ['user:enable-cloud', ['graph-identity']],
  ['user:delete-cloud', ['graph-identity']],
  ['group:search', ['graph-identity']],
  ['group:read', ['graph-identity']],
  ['group:read-members', ['graph-identity']],
  ['group:create-cloud', ['graph-identity']],
  ['group:update-cloud', ['graph-identity']],
  ['group:add-members-cloud', ['graph-identity']],
  ['group:remove-members-cloud', ['graph-identity']],
  ['group:delete-cloud', ['graph-identity']],
  ['sync:check-user', ['graph-identity']],
  ['sync:check-group', ['graph-identity']],
  ['sync:check-org', ['graph-identity']],
  ['sync:verify-propagation', ['graph-identity']],
]);

/** Get required connectors for an action. */
export function getRequiredConnectors(actionId: HybridIdentityActionId): readonly ConnectorClass[] {
  return ACTION_CONNECTOR_MAP.get(actionId) ?? [];
}

/**
 * Validate that all required connectors for the action are configured and healthy.
 * Throws ConnectionNotConfiguredError or ConnectionUnhealthyError on failure.
 */
export async function validateConnectorPreflight(
  actionId: HybridIdentityActionId,
  connectionRegistry: IConnectionRegistryService,
): Promise<void> {
  const required = getRequiredConnectors(actionId);
  for (const connectorClass of required) {
    await connectionRegistry.assertHealthy(connectorClass);
  }
}

// ─── Base request validation ───────────────────────────────────────────────────

/** Validate common fields present on all hybrid identity requests. */
export function validateBaseRequest(request: IHybridIdentityRequest, context: string): void {
  if (!request.actionId) {
    throw new IdentityValidationError(context, 'actionId is required.');
  }
  if (!request.actor?.upn) {
    throw new IdentityValidationError(context, 'actor.upn is required.');
  }
  if (!request.correlationId) {
    throw new IdentityValidationError(context, 'correlationId is required.');
  }
}

// ─── Member list validation ────────────────────────────────────────────────────

/** Validate a list of member UPNs is non-empty and valid. */
export function validateMemberUpnList(upns: readonly string[], context: string): void {
  if (!upns || upns.length === 0) {
    throw new IdentityValidationError(context, 'At least one member UPN is required.');
  }
  for (const upn of upns) {
    validateUpn(upn, context);
  }
}

/** Validate a list of member DNs is non-empty and valid. */
export function validateMemberDnList(dns: readonly string[], context: string): void {
  if (!dns || dns.length === 0) {
    throw new IdentityValidationError(context, 'At least one member DN is required.');
  }
  for (const dn of dns) {
    validateDistinguishedName(dn, context);
  }
}
