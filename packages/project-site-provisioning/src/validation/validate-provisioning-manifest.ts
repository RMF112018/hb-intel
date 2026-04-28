import {
  OBJECT_PLAN_KEYS,
  REQUIRED_MANIFEST_KEYS,
} from '../contracts/provisioning-manifest.js';
import {
  PROHIBITED_MUTATION_KEYS,
  PROHIBITED_PROCORE_MIRROR_KEYS,
  PROHIBITED_SECRET_KEYS,
  findProhibitedKeys,
} from '../guards/no-mutation-guard.js';

export interface ProvisioningManifestValidationResult {
  readonly ok: boolean;
  readonly errors: readonly string[];
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/**
 * Runtime validator for an `unknown` value claiming to be a
 * ProvisioningManifest. Confirms the mutation gate, no prohibited
 * mutation/secret/Procore-mirror keys, required top-level fields, and
 * the ten object plan slots. Returns all violations rather than
 * throwing on the first.
 */
export function validateProvisioningManifest(
  value: unknown,
): ProvisioningManifestValidationResult {
  const errors: string[] = [];

  if (!isPlainObject(value)) {
    return { ok: false, errors: ['manifest is not a plain object'] };
  }

  for (const key of REQUIRED_MANIFEST_KEYS) {
    if (!(key in value)) {
      errors.push(`missing required top-level field: ${key}`);
    }
  }

  const gate = value['mutationGate'];
  if (!isPlainObject(gate)) {
    errors.push('mutationGate is missing or not an object');
  } else {
    if (gate['mutationLocked'] !== true) {
      errors.push('mutationGate.mutationLocked must be true');
    }
    if (gate['liveMutationAllowed'] !== false) {
      errors.push('mutationGate.liveMutationAllowed must be false');
    }
    if (gate['requiresHumanApproval'] !== true) {
      errors.push('mutationGate.requiresHumanApproval must be true');
    }
  }

  const objectPlans = value['objectPlans'];
  if (!isPlainObject(objectPlans)) {
    errors.push('objectPlans is missing or not an object');
  } else {
    for (const key of OBJECT_PLAN_KEYS) {
      const slot = objectPlans[key];
      if (!isPlainObject(slot)) {
        errors.push(`objectPlans.${key} is missing or not an object`);
        continue;
      }
      if (!Array.isArray(slot['entries'])) {
        errors.push(`objectPlans.${key}.entries must be an array`);
      }
    }
  }

  const mutationKeyHits = findProhibitedKeys(value, [
    ...PROHIBITED_MUTATION_KEYS,
  ]);
  for (const hit of mutationKeyHits) {
    errors.push(`prohibited mutation key found at ${hit}`);
  }

  const secretHits = findProhibitedKeys(value, [...PROHIBITED_SECRET_KEYS]);
  for (const hit of secretHits) {
    errors.push(`prohibited secret-class key found at ${hit}`);
  }

  const mirrorHits = findProhibitedKeys(value, [
    ...PROHIBITED_PROCORE_MIRROR_KEYS,
  ]);
  for (const hit of mirrorHits) {
    errors.push(`prohibited Procore-mirror key found at ${hit}`);
  }

  return { ok: errors.length === 0, errors };
}
