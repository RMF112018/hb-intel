import {
  NON_EXECUTION_STATEMENT,
  PROOF_ARTIFACT_KIND,
  PROOF_ARTIFACT_VERSION,
} from '../contracts/dry-run-proof-artifact.js';
import { OBJECT_PLAN_KEYS } from '../contracts/provisioning-manifest.js';
import { validateProvisioningManifest } from '../validation/validate-provisioning-manifest.js';

export interface DryRunProofArtifactValidationResult {
  readonly ok: boolean;
  readonly errors: readonly string[];
}

export interface ValidateDryRunProofArtifactInput {
  readonly artifact: unknown;
  readonly markdown: string;
}

export interface ValidateDryRunProofArtifactOptions {
  readonly allowBlockers?: boolean;
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/**
 * Runtime validator for the dry-run proof envelope plus its Markdown
 * summary. Rejects unlocked / live-mutation manifests, tampered
 * dry-run / tenant-mutation flags, missing or altered non-execution
 * statement, missing object-family coverage, failed manifest scans, and
 * present-by-default approval fields. Returns all violations.
 */
export function validateDryRunProofArtifact(
  input: ValidateDryRunProofArtifactInput,
  options: ValidateDryRunProofArtifactOptions = {},
): DryRunProofArtifactValidationResult {
  const errors: string[] = [];
  const { artifact, markdown } = input;

  if (!isPlainObject(artifact)) {
    return { ok: false, errors: ['proof artifact is not a plain object'] };
  }

  if (artifact['artifactVersion'] !== PROOF_ARTIFACT_VERSION) {
    errors.push(`artifactVersion must be "${PROOF_ARTIFACT_VERSION}"`);
  }
  if (artifact['artifactKind'] !== PROOF_ARTIFACT_KIND) {
    errors.push(`artifactKind must be "${PROOF_ARTIFACT_KIND}"`);
  }
  if (artifact['dryRunOnly'] !== true) {
    errors.push('artifact.dryRunOnly must be true');
  }
  if (artifact['tenantMutationAllowed'] !== false) {
    errors.push('artifact.tenantMutationAllowed must be false');
  }
  if (artifact['nonExecutionStatement'] !== NON_EXECUTION_STATEMENT) {
    errors.push('artifact.nonExecutionStatement must match the canonical sentinel');
  }

  if (typeof markdown !== 'string' || !markdown.includes(NON_EXECUTION_STATEMENT)) {
    errors.push('Markdown proof must include the canonical non-execution statement');
  }

  const approval = artifact['approvalState'];
  if (!isPlainObject(approval)) {
    errors.push('artifact.approvalState is missing or not an object');
  } else {
    const status = approval['approvalStatus'];
    if (status !== 'not-requested' && status !== 'pending') {
      errors.push('approvalState.approvalStatus must be "not-requested" or "pending"');
    }
    if (approval['approvedBy'] !== null) {
      errors.push('approvalState.approvedBy must be null');
    }
    if (approval['approvedAt'] !== null) {
      errors.push('approvalState.approvedAt must be null');
    }
    if (approval['approvalRef'] !== null) {
      errors.push('approvalState.approvalRef must be null');
    }
  }

  const manifest = artifact['manifest'];
  if (!isPlainObject(manifest)) {
    errors.push('artifact.manifest is missing or not an object');
  } else {
    const manifestValidation = validateProvisioningManifest(manifest);
    if (!manifestValidation.ok) {
      for (const e of manifestValidation.errors) {
        errors.push(`manifest: ${e}`);
      }
    }

    const objectPlans = manifest['objectPlans'];
    if (isPlainObject(objectPlans)) {
      for (const family of OBJECT_PLAN_KEYS) {
        const slot = objectPlans[family];
        if (!isPlainObject(slot) || !Array.isArray(slot['entries']) || slot['entries'].length === 0) {
          errors.push(`object family coverage incomplete: ${family}`);
        }
      }
    }

    const blockers = manifest['blockers'];
    if (Array.isArray(blockers) && blockers.length > 0 && options.allowBlockers !== true) {
      errors.push(`manifest carries ${blockers.length} blocker(s); set allowBlockers to bypass`);
    }
  }

  return { ok: errors.length === 0, errors: Object.freeze([...errors]) };
}
