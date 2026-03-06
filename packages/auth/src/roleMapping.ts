import type { AdapterIdentityPayload } from './types.js';
import type {
  RoleMappingException,
  RoleMappingHint,
  RoleMappingInput,
  RoleMappingOptions,
} from './types.js';

const DEFAULT_ROLE = 'Member';

/**
 * Convert provider/context identity into HB Intel app roles.
 *
 * Core rule (locked Option C): provider semantics are translated here once and
 * only the resulting app roles are consumed by feature code.
 *
 * Alignment notes:
 * - D-04: deterministic, route-safe role evaluation input.
 * - D-07: explicit role output supports deterministic guarded action checks.
 * - D-10: centralized mapping boundary prevents direct provider coupling.
 * - D-12: keeps shell/overlay rendering policy independent from provider shape.
 */
export function mapIdentityToAppRoles(
  identity: AdapterIdentityPayload,
  options?: RoleMappingOptions,
): string[] {
  const input = toRoleMappingInput(identity);
  const roles = new Set<string>(
    input.existingRoleNames
      .map((roleName) => roleName.trim())
      .filter((roleName) => roleName.length > 0),
  );

  const hint = mergeRoleMappingHints(input.rawContext?.payload, input.hint);

  // Keep explicit app role naming stable, regardless of provider semantics.
  if (hint.isSiteAdmin) {
    roles.add('Administrator');
  }

  // PWA path may retain provider-group hints in raw context for mapping only.
  for (const providerGroup of hint.providerGroupRefs ?? []) {
    if (providerGroup === 'HB-Intel-Admins') {
      roles.add('Administrator');
    }
    if (providerGroup === 'HB-Intel-Executives') {
      roles.add('Executive');
    }
  }

  for (const mappingException of options?.exceptions ?? []) {
    applyRoleMappingException(mappingException, input, roles);
  }

  if (roles.size === 0) {
    roles.add(options?.defaultRoleName ?? DEFAULT_ROLE);
  }

  return Array.from(roles).sort();
}

/**
 * Convert adapter identity into the canonical role-mapping input contract.
 */
export function toRoleMappingInput(identity: AdapterIdentityPayload): RoleMappingInput {
  return {
    providerIdentityRef: identity.providerIdentityRef,
    runtimeMode: identity.runtimeMode,
    existingRoleNames: identity.user.roles.map((role) => role.name),
    rawContext: identity.rawContext,
    hint: {
      loginName: identity.user.email,
    },
  };
}

function applyRoleMappingException(
  mappingException: RoleMappingException,
  input: RoleMappingInput,
  roles: Set<string>,
): void {
  if (!mappingException.when(input)) {
    return;
  }

  for (const roleName of mappingException.appendRoles) {
    const normalized = roleName.trim();
    if (normalized.length > 0) {
      roles.add(normalized);
    }
  }
}

function mergeRoleMappingHints(rawPayload: unknown, baseHint?: RoleMappingHint): RoleMappingHint {
  const payloadRecord = isRecord(rawPayload) ? rawPayload : {};
  const providerGroupRefs = Array.isArray(payloadRecord.providerGroupRefs)
    ? payloadRecord.providerGroupRefs.filter((value): value is string => typeof value === 'string')
    : baseHint?.providerGroupRefs;

  return {
    loginName:
      typeof payloadRecord.loginName === 'string'
        ? payloadRecord.loginName
        : baseHint?.loginName,
    isSiteAdmin:
      typeof payloadRecord.isSiteAdmin === 'boolean'
        ? payloadRecord.isSiteAdmin
        : baseHint?.isSiteAdmin,
    providerGroupRefs,
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}
