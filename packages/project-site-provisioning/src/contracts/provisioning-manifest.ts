import type { MutationGate } from './mutation-gate.js';
import type { TemplateSource } from './template-source.js';

export const MANIFEST_SCAFFOLD_VERSION = '0.1.0-scaffold' as const;
export type ManifestScaffoldVersion = typeof MANIFEST_SCAFFOLD_VERSION;

export interface SitePlanPlaceholder {
  readonly status: 'planned';
  readonly urlDerivation: {
    readonly source: 'contract';
    readonly pattern: string;
    readonly resolved: null;
  };
  readonly title: {
    readonly source: 'contract';
    readonly resolved: null;
  };
}

export interface PlanArrayPlaceholder {
  readonly status: 'planned';
  readonly entries: readonly never[];
}

export interface ObjectPlans {
  readonly pages: PlanArrayPlaceholder;
  readonly libraries: PlanArrayPlaceholder;
  readonly lists: PlanArrayPlaceholder;
  readonly groups: PlanArrayPlaceholder;
  readonly permissionTemplates: PlanArrayPlaceholder;
  readonly modules: PlanArrayPlaceholder;
  readonly workflows: PlanArrayPlaceholder;
  readonly integrations: PlanArrayPlaceholder;
  readonly siteHealth: PlanArrayPlaceholder;
  readonly provisioningValidation: PlanArrayPlaceholder;
}

export const OBJECT_PLAN_KEYS = [
  'pages',
  'libraries',
  'lists',
  'groups',
  'permissionTemplates',
  'modules',
  'workflows',
  'integrations',
  'siteHealth',
  'provisioningValidation',
] as const satisfies readonly (keyof ObjectPlans)[];

export interface ProofPlaceholder {
  readonly plannedHash: null;
  readonly validationStatus: 'planned';
  readonly noSecretScan: 'planned';
  readonly noProcoreMirrorScan: 'planned';
}

export interface ProvisioningManifest {
  readonly manifestVersion: ManifestScaffoldVersion;
  readonly generatedFrom: TemplateSource;
  readonly generatedAt: string;
  readonly mutationGate: MutationGate;
  readonly sitePlan: SitePlanPlaceholder;
  readonly objectPlans: ObjectPlans;
  readonly proof: ProofPlaceholder;
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
