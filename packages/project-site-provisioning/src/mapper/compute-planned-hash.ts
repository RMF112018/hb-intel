import { createHash } from 'node:crypto';
import type { ProvisioningManifest } from '../contracts/provisioning-manifest.js';

/**
 * Sections of the manifest that contribute to `proof.plannedHash`.
 * `generatedAt`, `proof`, `warnings`, `blockers`, and the optional
 * approval triplet on `mutationGate` are excluded so the hash remains
 * stable across cosmetic or process-level variation while still
 * detecting any change to planned content.
 */
export const HASH_INCLUDED_SECTIONS = [
  'manifestVersion',
  'generatedFrom',
  'mutationGate.mutationLocked',
  'mutationGate.liveMutationAllowed',
  'mutationGate.requiresHumanApproval',
  'sitePlan',
  'objectPlans',
] as const;

export const HASH_EXCLUDED_SECTIONS = [
  'generatedAt',
  'proof',
  'warnings',
  'blockers',
  'mutationGate.approvedBy',
  'mutationGate.approvedAt',
  'mutationGate.approvalRef',
] as const;

export type HashableManifest = Pick<
  ProvisioningManifest,
  'manifestVersion' | 'generatedFrom' | 'sitePlan' | 'objectPlans'
> & {
  readonly mutationGate: {
    readonly mutationLocked: ProvisioningManifest['mutationGate']['mutationLocked'];
    readonly liveMutationAllowed: ProvisioningManifest['mutationGate']['liveMutationAllowed'];
    readonly requiresHumanApproval: ProvisioningManifest['mutationGate']['requiresHumanApproval'];
  };
};

function canonicalize(value: unknown): string {
  if (value === null) return 'null';
  if (typeof value === 'number' || typeof value === 'boolean') return JSON.stringify(value);
  if (typeof value === 'string') return JSON.stringify(value);
  if (typeof value === 'undefined') return 'null';
  if (Array.isArray(value)) {
    return `[${value.map((v) => canonicalize(v)).join(',')}]`;
  }
  if (typeof value === 'object') {
    const obj = value as Record<string, unknown>;
    const sortedKeys = Object.keys(obj).sort();
    const parts = sortedKeys.map((k) => `${JSON.stringify(k)}:${canonicalize(obj[k])}`);
    return `{${parts.join(',')}}`;
  }
  return 'null';
}

/**
 * Compute the deterministic SHA-256 of a manifest's planned content.
 * Caller must build the hashable subset (no `proof`, `generatedAt`,
 * `warnings`, `blockers`, or approval triplet on `mutationGate`).
 */
export function computePlannedHash(manifestSubset: HashableManifest): string {
  const canonical = canonicalize(manifestSubset);
  return createHash('sha256').update(canonical).digest('hex');
}
