import {
  NON_EXECUTION_STATEMENT,
  PROOF_ARTIFACT_KIND,
  PROOF_ARTIFACT_VERSION,
  type CreateDryRunProofArtifactsInput,
  type DryRunProofArtifact,
  type DryRunProofArtifacts,
  type ObjectPlanCoverageRow,
  type OperatorSummary,
} from '../contracts/dry-run-proof-artifact.js';
import {
  OBJECT_PLAN_KEYS,
  type PlannedObjectEntry,
} from '../contracts/provisioning-manifest.js';
import { validateProvisioningManifest } from '../validation/validate-provisioning-manifest.js';
import { renderDryRunProofMarkdown } from './render-dry-run-proof-markdown.js';
import { serializeDryRunProofJson } from './serialize-dry-run-proof-json.js';

function buildOperatorSummary(manifest: CreateDryRunProofArtifactsInput['manifest']): OperatorSummary {
  const objectPlanCoverage: ObjectPlanCoverageRow[] = [];
  for (const family of OBJECT_PLAN_KEYS) {
    const slot = manifest.objectPlans[family];
    const firstEntry: PlannedObjectEntry | undefined = slot.entries[0];
    objectPlanCoverage.push(
      Object.freeze({
        family,
        status: slot.status,
        entryCount: slot.entries.length,
        ...(firstEntry?.fieldCount !== undefined ? { fieldCount: firstEntry.fieldCount } : {}),
        ...(firstEntry?.requiredFieldCount !== undefined
          ? { requiredFieldCount: firstEntry.requiredFieldCount }
          : {}),
        ...(firstEntry?.optionalFieldCount !== undefined
          ? { optionalFieldCount: firstEntry.optionalFieldCount }
          : {}),
      }),
    );
  }

  return Object.freeze({
    site: Object.freeze({
      url: manifest.sitePlan.urlDerivation.resolved,
      title: manifest.sitePlan.title.resolved,
      urlStatus: manifest.sitePlan.urlDerivation.status,
      titleStatus: manifest.sitePlan.title.status,
      inputProjectNumber: manifest.sitePlan.urlDerivation.inputProjectNumber,
      projectBaseNumber: manifest.sitePlan.urlDerivation.projectBaseNumber,
      projectBaseNumberNoHyphen: manifest.sitePlan.urlDerivation.projectBaseNumberNoHyphen,
    }),
    objectPlanCoverage: Object.freeze(objectPlanCoverage),
    scans: Object.freeze({
      noSecretScan: manifest.proof.noSecretScan,
      noProcoreMirrorScan: manifest.proof.noProcoreMirrorScan,
      noTenantMutationScan: manifest.proof.noTenantMutationScan,
    }),
    plannedHash: manifest.proof.plannedHash,
    hashAlgorithm: manifest.proof.hashAlgorithm,
    sourceCoverage: manifest.proof.sourceCoverage,
  });
}

/**
 * Build the dry-run proof artifact JSON envelope and Markdown summary
 * from a valid provisioning manifest.
 *
 * Pure. No I/O. No tenant calls. No Graph / PnP / SPFx / Procore.
 * Deterministic when the same manifest and metadata are supplied.
 *
 * The artifact carries `dryRunOnly: true`, `tenantMutationAllowed: false`,
 * and `approvalState.approvalStatus: 'not-requested'`. The mutation gate
 * remains locked. The Markdown carries the canonical non-execution
 * statement; the validator rejects any artifact that omits or alters it.
 */
export function createDryRunProofArtifacts(
  input: CreateDryRunProofArtifactsInput,
): DryRunProofArtifacts {
  const { manifest, metadata } = input;

  const validation = validateProvisioningManifest(manifest);
  const validationView = Object.freeze({
    manifestValidationStatus: validation.ok ? ('ok' as const) : ('failed' as const),
    errors: Object.freeze([...validation.errors]),
  });

  const operatorSummary = buildOperatorSummary(manifest);

  const artifact: DryRunProofArtifact = Object.freeze({
    artifactVersion: PROOF_ARTIFACT_VERSION,
    artifactKind: PROOF_ARTIFACT_KIND,
    artifactId: metadata.artifactId,
    createdAt: metadata.createdAt,
    ...(metadata.sourceCommit ? { sourceCommit: metadata.sourceCommit } : {}),
    dryRunOnly: true,
    tenantMutationAllowed: false,
    approvalState: Object.freeze({
      approvalStatus: 'not-requested' as const,
      approvedBy: null,
      approvedAt: null,
      approvalRef: null,
    }),
    nonExecutionStatement: NON_EXECUTION_STATEMENT,
    manifest,
    operatorSummary,
    validation: validationView,
  });

  const json = serializeDryRunProofJson(artifact);
  const markdown = renderDryRunProofMarkdown(artifact);

  return Object.freeze({ artifact, json, markdown });
}
