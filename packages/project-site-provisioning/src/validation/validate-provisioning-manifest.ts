import {
  MANIFEST_VERSION,
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

const HEX64 = /^[0-9a-f]{64}$/;

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isScanResult(value: unknown): value is { ok: boolean; hits: readonly string[] } {
  if (!isPlainObject(value)) return false;
  if (typeof value['ok'] !== 'boolean') return false;
  if (!Array.isArray(value['hits'])) return false;
  return true;
}

/**
 * Runtime validator for an `unknown` value claiming to be a
 * ProvisioningManifest. Confirms version, mutation gate, proof
 * (hash + scans + source coverage), required top-level fields,
 * and the 14 object-plan slots. Returns all violations rather than
 * throwing on the first.
 */
export function validateProvisioningManifest(value: unknown): ProvisioningManifestValidationResult {
  const errors: string[] = [];

  if (!isPlainObject(value)) {
    return { ok: false, errors: ['manifest is not a plain object'] };
  }

  for (const key of REQUIRED_MANIFEST_KEYS) {
    if (!(key in value)) {
      errors.push(`missing required top-level field: ${key}`);
    }
  }

  if (value['manifestVersion'] !== MANIFEST_VERSION) {
    errors.push(`manifestVersion must be "${MANIFEST_VERSION}"; got ${JSON.stringify(value['manifestVersion'])}`);
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

  const proof = value['proof'];
  if (!isPlainObject(proof)) {
    errors.push('proof is missing or not an object');
  } else {
    if (typeof proof['plannedHash'] !== 'string' || !HEX64.test(proof['plannedHash'])) {
      errors.push('proof.plannedHash must be a 64-character lowercase hex string');
    }
    if (proof['hashAlgorithm'] !== 'sha256') {
      errors.push('proof.hashAlgorithm must be "sha256"');
    }
    if (!isScanResult(proof['noSecretScan'])) {
      errors.push('proof.noSecretScan must be a ScanResult');
    } else if (proof['noSecretScan'].ok !== true) {
      errors.push(`proof.noSecretScan failed; hits: ${proof['noSecretScan'].hits.join(', ')}`);
    }
    if (!isScanResult(proof['noProcoreMirrorScan'])) {
      errors.push('proof.noProcoreMirrorScan must be a ScanResult');
    } else if (proof['noProcoreMirrorScan'].ok !== true) {
      errors.push(`proof.noProcoreMirrorScan failed; hits: ${proof['noProcoreMirrorScan'].hits.join(', ')}`);
    }
    if (!isScanResult(proof['noTenantMutationScan'])) {
      errors.push('proof.noTenantMutationScan must be a ScanResult');
    } else if (proof['noTenantMutationScan'].ok !== true) {
      errors.push(`proof.noTenantMutationScan failed; hits: ${proof['noTenantMutationScan'].hits.join(', ')}`);
    }
    if (!isPlainObject(proof['sourceCoverage'])) {
      errors.push('proof.sourceCoverage must be an object');
    } else {
      const sc = proof['sourceCoverage'];
      for (const counter of ['contractFamiliesDeclared', 'fixturesProcessed', 'fieldMapsProcessed', 'objectCatalogRowsProcessed']) {
        const v = sc[counter];
        if (typeof v !== 'number' || !Number.isInteger(v) || v < 0) {
          errors.push(`proof.sourceCoverage.${counter} must be a non-negative integer`);
        }
      }
    }
    if (proof['validationStatus'] !== 'planned-coverage') {
      errors.push('proof.validationStatus must be "planned-coverage"');
    }
  }

  // Existing Step 2 prohibited-key scans, kept as a defense in depth in
  // addition to the proof scan results above.
  const mutationKeyHits = findProhibitedKeys(value, [...PROHIBITED_MUTATION_KEYS]);
  for (const hit of mutationKeyHits) errors.push(`prohibited mutation key found at ${hit}`);

  const secretHits = findProhibitedKeys(value, [...PROHIBITED_SECRET_KEYS]);
  for (const hit of secretHits) errors.push(`prohibited secret-class key found at ${hit}`);

  const mirrorHits = findProhibitedKeys(value, [...PROHIBITED_PROCORE_MIRROR_KEYS]);
  for (const hit of mirrorHits) errors.push(`prohibited Procore-mirror key found at ${hit}`);

  return { ok: errors.length === 0, errors: Object.freeze([...errors]) };
}
