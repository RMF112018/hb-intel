import {
  MANIFEST_SCAFFOLD_VERSION,
  OBJECT_PLAN_KEYS,
  type ObjectPlans,
  type PlanArrayPlaceholder,
  type ProvisioningManifest,
} from '../contracts/provisioning-manifest.js';
import { createFrozenMutationGate } from '../guards/no-mutation-guard.js';

export interface CreateProvisioningManifestInput {
  readonly templateContract: {
    readonly templateName: string;
    readonly templateVersion: string;
    readonly source?: {
      readonly contractRef?: string;
    };
  };
  readonly context?: {
    readonly now?: () => Date;
    readonly sourceCommit?: string;
  };
}

const PLANNED_PLAN_ARRAY: PlanArrayPlaceholder = Object.freeze({
  status: 'planned',
  entries: Object.freeze([] as readonly never[]),
});

const PLANNED_SITE_PLAN = Object.freeze({
  status: 'planned' as const,
  urlDerivation: Object.freeze({
    source: 'contract' as const,
    pattern: '/sites/{ProjectBaseNumberNoHyphen}',
    resolved: null,
  }),
  title: Object.freeze({
    source: 'contract' as const,
    resolved: null,
  }),
});

const PLANNED_PROOF = Object.freeze({
  plannedHash: null,
  validationStatus: 'planned' as const,
  noSecretScan: 'planned' as const,
  noProcoreMirrorScan: 'planned' as const,
});

function buildEmptyObjectPlans(): ObjectPlans {
  const plans = {} as Record<keyof ObjectPlans, PlanArrayPlaceholder>;
  for (const key of OBJECT_PLAN_KEYS) {
    plans[key] = PLANNED_PLAN_ARRAY;
  }
  return Object.freeze(plans) as ObjectPlans;
}

/**
 * Pure, deterministic scaffold mapper. Reads only the identity fields
 * from a Standard Project Site Template Contract and returns a frozen,
 * mutation-locked manifest with planned-only object plans, planned proof
 * placeholders, and empty warnings/blockers.
 *
 * No I/O. No tenant calls. No Graph/PnP/SPFx/Procore.
 *
 * Determinism: when the same `templateContract` and `context.now` are
 * supplied, two calls return manifests that serialize to byte-identical
 * JSON.
 */
export function createProvisioningManifest(
  input: CreateProvisioningManifestInput,
): ProvisioningManifest {
  const { templateContract, context } = input;
  const now = context?.now?.() ?? new Date();

  const generatedFrom = Object.freeze({
    packageName: '@hbc/project-site-template' as const,
    templateName: templateContract.templateName,
    templateVersion: templateContract.templateVersion,
    contractRef: templateContract.source?.contractRef ?? 'template-contract.json',
    ...(context?.sourceCommit ? { sourceCommit: context.sourceCommit } : {}),
  });

  return Object.freeze({
    manifestVersion: MANIFEST_SCAFFOLD_VERSION,
    generatedFrom,
    generatedAt: now.toISOString(),
    mutationGate: createFrozenMutationGate(),
    sitePlan: PLANNED_SITE_PLAN,
    objectPlans: buildEmptyObjectPlans(),
    proof: PLANNED_PROOF,
    warnings: Object.freeze([] as readonly string[]),
    blockers: Object.freeze([] as readonly string[]),
  });
}
