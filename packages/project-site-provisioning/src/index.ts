/**
 * @hbc/project-site-provisioning
 *
 * Headless deterministic mapper / planner scaffold for the SP Project
 * Control Center Standard Project Site Template Contract.
 *
 * Phase 2 Step 2 scope: manifest contract types, mutation gate,
 * scaffold mapper, and runtime validator. This package does not
 * mutate tenants, call Graph or PnP, contain SPFx code, or contain
 * Procore runtime code. See README.md for boundaries.
 */

export type { MutationGate } from './contracts/mutation-gate.js';
export type { TemplateSource } from './contracts/template-source.js';
export {
  MANIFEST_SCAFFOLD_VERSION,
  OBJECT_PLAN_KEYS,
  REQUIRED_MANIFEST_KEYS,
} from './contracts/provisioning-manifest.js';
export type {
  ManifestScaffoldVersion,
  ObjectPlans,
  PlanArrayPlaceholder,
  ProofPlaceholder,
  ProvisioningManifest,
  SitePlanPlaceholder,
} from './contracts/provisioning-manifest.js';

export {
  PROHIBITED_MUTATION_KEYS,
  PROHIBITED_PROCORE_MIRROR_KEYS,
  PROHIBITED_SECRET_KEYS,
  assertNoMutationKeys,
  createFrozenMutationGate,
  findProhibitedKeys,
} from './guards/no-mutation-guard.js';
export type { ProhibitedMutationKey } from './guards/no-mutation-guard.js';

export {
  createProvisioningManifest,
} from './mapper/create-provisioning-manifest.js';
export type { CreateProvisioningManifestInput } from './mapper/create-provisioning-manifest.js';

export {
  validateProvisioningManifest,
} from './validation/validate-provisioning-manifest.js';
export type { ProvisioningManifestValidationResult } from './validation/validate-provisioning-manifest.js';
