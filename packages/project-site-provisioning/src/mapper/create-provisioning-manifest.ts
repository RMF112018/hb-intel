import {
  MANIFEST_VERSION,
  OBJECT_PLAN_KEYS,
  type ObjectPlans,
  type PlanFamilySection,
  type ProvisioningManifest,
  type Proof,
  type SourceCoverage,
} from '../contracts/provisioning-manifest.js';
import type { TemplateArtifacts } from '../contracts/template-artifacts.js';
import { createFrozenMutationGate } from '../guards/no-mutation-guard.js';
import { runNoProcoreMirrorScan } from '../scans/no-procore-mirror-scan.js';
import { runNoSecretScan } from '../scans/no-secret-scan.js';
import { runNoTenantMutationScan } from '../scans/no-tenant-mutation-scan.js';
import { validateProvisioningManifest } from '../validation/validate-provisioning-manifest.js';
import {
  HASH_EXCLUDED_SECTIONS,
  HASH_INCLUDED_SECTIONS,
  computePlannedHash,
} from './compute-planned-hash.js';
import { deriveSitePlan } from './derive-site-plan.js';
import { extractFamilyEntries } from './extract-family-entries.js';

export interface CreateProvisioningManifestInput {
  readonly templateArtifacts: TemplateArtifacts;
  readonly projectInputs?: {
    readonly projectNumber?: string;
    readonly projectName?: string;
  };
  readonly context?: {
    readonly now?: () => Date;
    readonly sourceCommit?: string;
  };
}

function buildObjectPlans(artifacts: TemplateArtifacts): ObjectPlans {
  const plans = {} as Record<string, PlanFamilySection>;
  for (const family of OBJECT_PLAN_KEYS) {
    const entries = extractFamilyEntries(family, artifacts);
    plans[family] = Object.freeze({
      status: entries.length > 0 ? 'planned' : 'placeholder',
      entries,
    });
  }
  return Object.freeze(plans) as ObjectPlans;
}

function buildSourceCoverage(artifacts: TemplateArtifacts): SourceCoverage {
  return Object.freeze({
    contractFamiliesDeclared: Object.keys(artifacts.templateContract.families ?? {}).length,
    fixturesProcessed: Object.values(artifacts.familyFixtures).filter(Boolean).length,
    fieldMapsProcessed: Object.values(artifacts.familyFieldMaps).filter(Boolean).length,
    objectCatalogRowsProcessed: artifacts.objectCatalog.rows.length,
  });
}

/**
 * Pure, deterministic contract-coverage mapper. Reads `TemplateArtifacts`,
 * builds the planned site plan, populates one family-level entry per
 * contract family that has a fixture, runs the no-secret /
 * no-Procore-mirror / no-tenant-mutation scans, computes the
 * deterministic SHA-256 of the planned content, and returns a frozen
 * mutation-locked manifest.
 *
 * No I/O. No tenant calls. No Graph / PnP / SPFx / Procore. Determinism
 * is preserved when the same artifacts, project inputs, `context.now`,
 * and `context.sourceCommit` are supplied.
 */
export function createProvisioningManifest(
  input: CreateProvisioningManifestInput,
): ProvisioningManifest {
  const { templateArtifacts, projectInputs, context } = input;
  const now = context?.now?.() ?? new Date();

  const generatedFrom = Object.freeze({
    packageName: '@hbc/project-site-template' as const,
    templateName: templateArtifacts.templateContract.templateName,
    templateVersion: templateArtifacts.templateContract.templateVersion,
    contractRef: templateArtifacts.templateContract.source?.contractRef ?? 'template-contract.json',
    ...(context?.sourceCommit ? { sourceCommit: context.sourceCommit } : {}),
  });

  const { sitePlan, warnings: siteWarnings } = deriveSitePlan(projectInputs);

  const objectPlans = buildObjectPlans(templateArtifacts);

  const mutationGate = createFrozenMutationGate();

  const hashableSubset = {
    manifestVersion: MANIFEST_VERSION,
    generatedFrom,
    mutationGate: {
      mutationLocked: mutationGate.mutationLocked,
      liveMutationAllowed: mutationGate.liveMutationAllowed,
      requiresHumanApproval: mutationGate.requiresHumanApproval,
    },
    sitePlan,
    objectPlans,
  };

  const plannedHash = computePlannedHash(hashableSubset);

  const noSecretScan = runNoSecretScan(hashableSubset);
  const noProcoreMirrorScan = runNoProcoreMirrorScan(hashableSubset, templateArtifacts);
  const noTenantMutationScan = runNoTenantMutationScan(hashableSubset);

  const proof: Proof = Object.freeze({
    plannedHash,
    hashAlgorithm: 'sha256' as const,
    hashInputSummary: Object.freeze({
      includedSections: Object.freeze([...HASH_INCLUDED_SECTIONS]),
      excludedSections: Object.freeze([...HASH_EXCLUDED_SECTIONS]),
      canonicalization: 'sorted-keys + JSON.stringify' as const,
    }),
    noSecretScan: Object.freeze(noSecretScan),
    noProcoreMirrorScan: Object.freeze(noProcoreMirrorScan),
    noTenantMutationScan: Object.freeze(noTenantMutationScan),
    sourceCoverage: buildSourceCoverage(templateArtifacts),
    validationStatus: 'planned-coverage' as const,
  });

  const warnings = Object.freeze([...siteWarnings] as readonly string[]);
  const blockers = Object.freeze([] as readonly string[]);

  const manifest: ProvisioningManifest = Object.freeze({
    manifestVersion: MANIFEST_VERSION,
    generatedFrom,
    generatedAt: now.toISOString(),
    mutationGate,
    sitePlan,
    objectPlans,
    proof,
    warnings,
    blockers,
  });

  const selfCheck = validateProvisioningManifest(manifest);
  if (!selfCheck.ok) {
    throw new Error(
      `createProvisioningManifest produced an internally invalid manifest:\n - ${selfCheck.errors.join('\n - ')}`,
    );
  }

  return manifest;
}
