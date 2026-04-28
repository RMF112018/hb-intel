import type { MutationGate } from './mutation-gate.js';
import type { TemplateSource } from './template-source.js';
import type { ContractFamilyName } from './template-artifacts.js';

/**
 * Manifest version bumped at Phase 2 Step 3 to reflect contract-coverage
 * mapping. The literal type makes a stale or wrong version a compile-time
 * error in any callsite that constructs a manifest by hand.
 */
export const MANIFEST_VERSION = '0.2.0-contract-coverage' as const;
export type ManifestVersion = typeof MANIFEST_VERSION;

/**
 * Object-plan keys aligned 1:1 with the 14 contract families declared by
 * `@hbc/project-site-template`. Step 2's placeholder keys `groups` and
 * `permissionTemplates` were removed; the contract carries a single
 * `permissions` family that holds group + template structure as nested
 * fields. See the Step 3 closeout for the full normalization record.
 */
export const OBJECT_PLAN_KEYS = [
  'templateManifest',
  'enums',
  'settings',
  'permissions',
  'site',
  'pages',
  'libraries',
  'lists',
  'modules',
  'workflows',
  'integrations',
  'siteHealth',
  'provisioningValidation',
  'validationRules',
] as const;
export type ObjectPlanKey = (typeof OBJECT_PLAN_KEYS)[number];

export const OBJECT_PLAN_KEY_TO_FAMILY: Readonly<Record<ObjectPlanKey, ContractFamilyName>> = Object.freeze({
  templateManifest: 'template-manifest',
  enums: 'enums',
  settings: 'settings',
  permissions: 'permissions',
  site: 'site',
  pages: 'pages',
  libraries: 'libraries',
  lists: 'lists',
  modules: 'modules',
  workflows: 'workflows',
  integrations: 'integrations',
  siteHealth: 'site-health',
  provisioningValidation: 'provisioning-validation',
  validationRules: 'validation-rules',
});

export interface PlannedObjectEntry {
  readonly id: string;
  readonly family: ObjectPlanKey;
  readonly kind: string;
  readonly sourceContractSection?: string;
  readonly sourceCatalogId?: string;
  readonly sourceBlueprintSection?: string;
  readonly sourceDecisionRef?: string;
  readonly mvpStatus: string;
  readonly ownerCategory?: string;
  readonly validationRuleRefs: readonly string[];
  readonly blocksGenerationIfMissing: boolean;
  readonly fieldCount?: number;
  readonly requiredFieldCount?: number;
  readonly optionalFieldCount?: number;
  readonly dependencies?: readonly string[];
  readonly plannedOnly: true;
  readonly mutationAllowed: false;
}

export interface PlanFamilySection {
  readonly status: 'planned' | 'placeholder';
  readonly entries: readonly PlannedObjectEntry[];
}

export type ObjectPlans = Readonly<Record<ObjectPlanKey, PlanFamilySection>>;

export interface SitePlanUrlDerivation {
  readonly rule: string;
  readonly inputProjectNumber: string | null;
  readonly projectBaseNumber: string | null;
  readonly projectBaseNumberNoHyphen: string | null;
  readonly resolved: string | null;
  readonly status: 'derived' | 'placeholder';
}

export interface SitePlanTitle {
  readonly rule: string;
  readonly inputProjectNumber: string | null;
  readonly inputProjectName: string | null;
  readonly resolved: string | null;
  readonly status: 'derived' | 'placeholder';
}

export interface SitePlan {
  readonly status: 'planned' | 'placeholder';
  readonly urlDerivation: SitePlanUrlDerivation;
  readonly title: SitePlanTitle;
}

export interface ScanResult {
  readonly ok: boolean;
  readonly hits: readonly string[];
}

export interface SourceCoverage {
  readonly contractFamiliesDeclared: number;
  readonly fixturesProcessed: number;
  readonly fieldMapsProcessed: number;
  readonly objectCatalogRowsProcessed: number;
}

export interface HashInputSummary {
  readonly includedSections: readonly string[];
  readonly excludedSections: readonly string[];
  readonly canonicalization: 'sorted-keys + JSON.stringify';
}

export interface Proof {
  readonly plannedHash: string;
  readonly hashAlgorithm: 'sha256';
  readonly hashInputSummary: HashInputSummary;
  readonly noSecretScan: ScanResult;
  readonly noProcoreMirrorScan: ScanResult;
  readonly noTenantMutationScan: ScanResult;
  readonly sourceCoverage: SourceCoverage;
  readonly validationStatus: 'planned-coverage';
}

export interface ProvisioningManifest {
  readonly manifestVersion: ManifestVersion;
  readonly generatedFrom: TemplateSource;
  readonly generatedAt: string;
  readonly mutationGate: MutationGate;
  readonly sitePlan: SitePlan;
  readonly objectPlans: ObjectPlans;
  readonly proof: Proof;
  readonly warnings: readonly string[];
  readonly blockers: readonly string[];
}

export const REQUIRED_MANIFEST_KEYS = [
  'manifestVersion',
  'generatedFrom',
  'generatedAt',
  'mutationGate',
  'sitePlan',
  'objectPlans',
  'proof',
  'warnings',
  'blockers',
] as const satisfies readonly (keyof ProvisioningManifest)[];
