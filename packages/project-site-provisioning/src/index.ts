/**
 * @hbc/project-site-provisioning
 *
 * Headless deterministic mapper / planner for the SP Project Control
 * Center Standard Project Site Template Contract.
 *
 * Phase 2 Step 3 scope: contract-coverage mapping. The package consumes
 * `@hbc/project-site-template` artifacts and produces a frozen,
 * mutation-locked manifest with planned-only family coverage, deterministic
 * proof hash, and three guard scans (no-secret, no-Procore-mirror,
 * no-tenant-mutation). It does not mutate tenants, call Graph or PnP,
 * contain SPFx code, or contain Procore runtime code. See README.md for
 * boundaries.
 */

export type { MutationGate } from './contracts/mutation-gate.js';
export type { TemplateSource } from './contracts/template-source.js';

export {
  CONTRACT_FAMILY_NAMES,
} from './contracts/template-artifacts.js';
export type {
  CommonFieldDefinition,
  CommonFields,
  ContractFamilyName,
  FamilyDependencyEdge,
  FamilyFieldDefinition,
  FamilyFieldDependencies,
  FamilyFieldMap,
  FamilyFixture,
  ObjectCatalog,
  ObjectCatalogRow,
  TemplateArtifacts,
  TemplateContractData,
} from './contracts/template-artifacts.js';

export {
  MANIFEST_VERSION,
  OBJECT_PLAN_KEYS,
  OBJECT_PLAN_KEY_TO_FAMILY,
  REQUIRED_MANIFEST_KEYS,
} from './contracts/provisioning-manifest.js';
export type {
  HashInputSummary,
  ManifestVersion,
  ObjectPlanKey,
  ObjectPlans,
  PlanFamilySection,
  PlannedObjectEntry,
  Proof,
  ProvisioningManifest,
  ScanResult,
  SitePlan,
  SitePlanTitle,
  SitePlanUrlDerivation,
  SourceCoverage,
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
  HASH_EXCLUDED_SECTIONS,
  HASH_INCLUDED_SECTIONS,
  computePlannedHash,
} from './mapper/compute-planned-hash.js';
export type { HashableManifest } from './mapper/compute-planned-hash.js';
export {
  createProvisioningManifest,
} from './mapper/create-provisioning-manifest.js';
export type { CreateProvisioningManifestInput } from './mapper/create-provisioning-manifest.js';
export {
  deriveSitePlan,
} from './mapper/derive-site-plan.js';
export type {
  SitePlanDerivationInput,
  SitePlanDerivationResult,
} from './mapper/derive-site-plan.js';
export {
  extractFamilyEntries,
} from './mapper/extract-family-entries.js';

export {
  PROCORE_MIRROR_KEY_TOKENS,
  runNoProcoreMirrorScan,
} from './scans/no-procore-mirror-scan.js';
export {
  SECRET_KEY_TOKENS,
  runNoSecretScan,
} from './scans/no-secret-scan.js';
export {
  runNoTenantMutationScan,
} from './scans/no-tenant-mutation-scan.js';

export {
  loadTemplateArtifactsFromPackage,
} from './loaders/load-template-artifacts.js';

export {
  validateProvisioningManifest,
} from './validation/validate-provisioning-manifest.js';
export type { ProvisioningManifestValidationResult } from './validation/validate-provisioning-manifest.js';

export {
  NON_EXECUTION_STATEMENT,
  PROOF_ARTIFACT_KIND,
  PROOF_ARTIFACT_VERSION,
} from './contracts/dry-run-proof-artifact.js';
export type {
  ApprovalState,
  CreateDryRunProofArtifactsInput,
  DryRunProofArtifact,
  DryRunProofArtifacts,
  ObjectPlanCoverageRow,
  OperatorSummary,
  OperatorSummarySite,
} from './contracts/dry-run-proof-artifact.js';

export {
  createDryRunProofArtifacts,
} from './proof/create-dry-run-proof-artifacts.js';
export {
  serializeDryRunProofJson,
} from './proof/serialize-dry-run-proof-json.js';
export {
  renderDryRunProofMarkdown,
} from './proof/render-dry-run-proof-markdown.js';
export {
  validateDryRunProofArtifact,
} from './proof/validate-dry-run-proof-artifact.js';
export type {
  DryRunProofArtifactValidationResult,
  ValidateDryRunProofArtifactInput,
  ValidateDryRunProofArtifactOptions,
} from './proof/validate-dry-run-proof-artifact.js';

export {
  APPLY_GATE_APPROVAL_STATUSES,
  APPLY_GATE_DECISION_VERSION,
  APPLY_GATE_NOT_EXECUTABLE_REASON,
} from './contracts/apply-gate.js';
export type {
  ApplyGateApprovalScope,
  ApplyGateApprovalStatus,
  ApplyGateDecision,
  ApplyGateDecisionVersion,
  ApplyGateEnvironment,
  ApplyGateOperatorApproval,
  ApplyGateRequest,
  ApplyGateStatus,
  NonProductionTargetDeclaration,
  RollbackMode,
  RollbackPosture,
} from './contracts/apply-gate.js';

export {
  hashJsonProofArtifact,
  hashMarkdownProofArtifact,
} from './apply-gate/hash-proof-artifacts.js';
export {
  validateApplyGateRequest,
} from './apply-gate/validate-apply-gate-request.js';
export type { ApplyGateRequestValidationResult } from './apply-gate/validate-apply-gate-request.js';
export {
  evaluateApplyGate,
} from './apply-gate/evaluate-apply-gate.js';
export type { EvaluateApplyGateOptions } from './apply-gate/evaluate-apply-gate.js';
