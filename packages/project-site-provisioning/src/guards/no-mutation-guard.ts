import type { MutationGate } from '../contracts/mutation-gate.js';

/**
 * Keys that indicate live tenant execution intent. A scaffold-stage
 * provisioning manifest must contain none of these at any depth. The
 * validator and runtime guard reject any manifest where one appears.
 */
export const PROHIBITED_MUTATION_KEYS = [
  'execute',
  'apply',
  'provision',
  'mutate',
  'createSite',
  'createList',
  'createLibrary',
  'createGroup',
  'assignPermission',
] as const;

export type ProhibitedMutationKey = (typeof PROHIBITED_MUTATION_KEYS)[number];

/**
 * Field-name patterns that identify Procore secret material. A manifest
 * must never carry keys matching these. Used by the validator's
 * no-secret scan.
 */
export const PROHIBITED_SECRET_KEYS = [
  'clientSecret',
  'client_secret',
  'apiKey',
  'api_key',
  'accessToken',
  'access_token',
  'bearerToken',
  'bearer_token',
  'refreshToken',
  'refresh_token',
] as const;

/**
 * Field-name patterns that indicate a full Procore mirror. A manifest
 * must never carry keys matching these. Procore remains operational/PM
 * state only; PCC must not become a Procore mirror in MVP.
 */
export const PROHIBITED_PROCORE_MIRROR_KEYS = [
  'procoreMirror',
  'procore_mirror',
  'mirrorTable',
  'mirror_table',
  'mirrorRecords',
  'mirror_records',
] as const;

/**
 * Return a frozen, scaffold-safe mutation gate. The literal types in
 * `MutationGate` plus `Object.freeze` make it both compile-time and
 * runtime impossible to widen via this factory.
 */
export function createFrozenMutationGate(): MutationGate {
  return Object.freeze({
    mutationLocked: true,
    liveMutationAllowed: false,
    requiresHumanApproval: true,
  } as const);
}

/**
 * Walk an unknown object graph and throw on the first prohibited key.
 * Exported for tests and for use inside the validator.
 */
export function assertNoMutationKeys(value: unknown, path = '$'): void {
  if (value === null || typeof value !== 'object') return;

  if (Array.isArray(value)) {
    for (let i = 0; i < value.length; i += 1) {
      assertNoMutationKeys(value[i], `${path}[${i}]`);
    }
    return;
  }

  for (const key of Object.keys(value)) {
    if ((PROHIBITED_MUTATION_KEYS as readonly string[]).includes(key)) {
      throw new Error(
        `Prohibited mutation key "${key}" found at ${path}.${key}; manifest must not declare live tenant execution intent.`,
      );
    }
    assertNoMutationKeys(
      (value as Record<string, unknown>)[key],
      `${path}.${key}`,
    );
  }
}

/**
 * Walk an unknown object graph and collect prohibited-key occurrences
 * without throwing. Used by the validator to report all violations at
 * once.
 */
export function findProhibitedKeys(
  value: unknown,
  prohibited: readonly string[],
  path = '$',
  found: string[] = [],
): string[] {
  if (value === null || typeof value !== 'object') return found;

  if (Array.isArray(value)) {
    for (let i = 0; i < value.length; i += 1) {
      findProhibitedKeys(value[i], prohibited, `${path}[${i}]`, found);
    }
    return found;
  }

  for (const key of Object.keys(value)) {
    if (prohibited.includes(key)) {
      found.push(`${path}.${key}`);
    }
    findProhibitedKeys(
      (value as Record<string, unknown>)[key],
      prohibited,
      `${path}.${key}`,
      found,
    );
  }
  return found;
}
