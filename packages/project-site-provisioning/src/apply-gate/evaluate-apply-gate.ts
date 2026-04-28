import {
  APPLY_GATE_DECISION_VERSION,
  APPLY_GATE_NOT_EXECUTABLE_REASON,
  type ApplyGateDecision,
  type ApplyGateRequest,
  type ApplyGateStatus,
} from '../contracts/apply-gate.js';
import { OBJECT_PLAN_KEYS } from '../contracts/provisioning-manifest.js';
import { serializeDryRunProofJson } from '../proof/serialize-dry-run-proof-json.js';
import { validateDryRunProofArtifact } from '../proof/validate-dry-run-proof-artifact.js';
import { validateProvisioningManifest } from '../validation/validate-provisioning-manifest.js';
import {
  hashJsonProofArtifact,
  hashMarkdownProofArtifact,
} from './hash-proof-artifacts.js';
import { validateApplyGateRequest } from './validate-apply-gate-request.js';

export interface EvaluateApplyGateOptions {
  readonly regeneratedProof?: {
    readonly json: string;
    readonly markdown: string;
  };
  readonly now?: () => Date;
}

const REQUIRED_HUMAN_ACTIONS_PENDING = Object.freeze([
  'Operator approval required (scope: non-production-only) before any future executor adapter may run.',
  'Future executor must verify proof artifact byte-match against the regenerated baseline before any tenant call.',
  'Future executor must confirm rollback posture, target tenant declaration, and locked manifest mutation gate.',
] as readonly string[]);

const REQUIRED_HUMAN_ACTIONS_READY = Object.freeze([
  'Future executor must regenerate the proof artifact pair and confirm byte-match before any tenant call.',
  'Future executor must verify the locked mutation gate, sentinel non-execution statement, and rollback posture inside the executor process.',
] as readonly string[]);

/**
 * Pure apply-gate evaluator. Consumes a frozen manifest, its dry-run
 * proof artifact, an operator approval, a non-production target, and a
 * rollback posture, and decides whether the request is *ready for a
 * future non-production apply*.
 *
 * Never executes anything. Always returns
 * `tenantMutationPerformed: false` and `nonProductionOnly: true`.
 * Production environments are rejected unconditionally.
 */
export function evaluateApplyGate(
  request: ApplyGateRequest,
  options: EvaluateApplyGateOptions = {},
): ApplyGateDecision {
  const errors: string[] = [];
  const warnings: string[] = [];

  const validatedAt = (options.now?.() ?? new Date()).toISOString();

  // Hashes are emitted on every decision regardless of block status.
  const manifestHash = request.manifest?.proof?.plannedHash ?? '';
  const proofJsonString = (() => {
    try {
      return serializeDryRunProofJson(request.proofArtifact);
    } catch {
      return '';
    }
  })();
  const proofArtifactHash = proofJsonString ? hashJsonProofArtifact(proofJsonString) : '';
  const proofMarkdownHash =
    typeof request.proofMarkdown === 'string'
      ? hashMarkdownProofArtifact(request.proofMarkdown)
      : '';

  // 1. Request shape validation.
  const requestValidation = validateApplyGateRequest(request);
  if (!requestValidation.ok) {
    for (const e of requestValidation.errors) errors.push(`request: ${e}`);
  }

  // 2. Production rejection (hard).
  if (request?.environment === 'production') {
    errors.push('production environment is rejected in Phase 2 Step 5');
  }

  // 3. Target tenant non-production scope.
  if (request?.targetTenant && request.targetTenant.targetEnvironment !== 'non-production') {
    errors.push('targetTenant.targetEnvironment must be "non-production"');
  }

  // 4. Manifest validation.
  if (request?.manifest) {
    const manifestValidation = validateProvisioningManifest(request.manifest);
    if (!manifestValidation.ok) {
      for (const e of manifestValidation.errors) errors.push(`manifest: ${e}`);
    }

    // Object-plan coverage completeness across all 14 families.
    if (
      request.manifest.objectPlans &&
      typeof request.manifest.objectPlans === 'object'
    ) {
      for (const family of OBJECT_PLAN_KEYS) {
        const slot = (request.manifest.objectPlans as Record<string, unknown>)[family];
        const entries =
          slot && typeof slot === 'object' && 'entries' in slot
            ? (slot as { entries: unknown }).entries
            : undefined;
        if (!Array.isArray(entries) || entries.length === 0) {
          errors.push(`object family coverage incomplete: ${family}`);
        }
      }
    }

    // Manifest mutation gate must be locked.
    const gate = request.manifest.mutationGate;
    if (
      !gate ||
      gate.mutationLocked !== true ||
      gate.liveMutationAllowed !== false ||
      gate.requiresHumanApproval !== true
    ) {
      errors.push('manifest mutationGate must be locked');
    }

    // Blockers must be empty.
    if (Array.isArray(request.manifest.blockers) && request.manifest.blockers.length > 0) {
      errors.push(`manifest carries ${request.manifest.blockers.length} blocker(s)`);
    }

    // All three scans must pass.
    const proof = request.manifest.proof;
    for (const scanName of ['noSecretScan', 'noProcoreMirrorScan', 'noTenantMutationScan'] as const) {
      const scan = proof?.[scanName];
      if (!scan || scan.ok !== true) {
        errors.push(`manifest.proof.${scanName}.ok must be true`);
      }
    }
  }

  // 5. Proof artifact validation (envelope + sentinel).
  if (request?.proofArtifact) {
    const proofValidation = validateDryRunProofArtifact({
      artifact: request.proofArtifact,
      markdown: typeof request.proofMarkdown === 'string' ? request.proofMarkdown : '',
    });
    if (!proofValidation.ok) {
      for (const e of proofValidation.errors) errors.push(`proof: ${e}`);
    }
  }

  // 6. Manifest hash must match proof artifact's embedded manifest hash.
  if (
    request?.manifest?.proof?.plannedHash &&
    request?.proofArtifact?.manifest?.proof?.plannedHash &&
    request.manifest.proof.plannedHash !== request.proofArtifact.manifest.proof.plannedHash
  ) {
    errors.push(
      'manifest.proof.plannedHash does not match proofArtifact.manifest.proof.plannedHash',
    );
  }

  // 7. Optional byte-match against regenerated proof.
  if (options.regeneratedProof) {
    if (proofJsonString && options.regeneratedProof.json !== proofJsonString) {
      errors.push('proof JSON byte mismatch against regenerated baseline');
    }
    if (
      typeof request.proofMarkdown === 'string' &&
      options.regeneratedProof.markdown !== request.proofMarkdown
    ) {
      errors.push('proof Markdown byte mismatch against regenerated baseline');
    }

    // Optional dry-run baseline ref check.
    if (request.dryRunBaselineRef !== undefined) {
      const regeneratedHash = hashJsonProofArtifact(options.regeneratedProof.json);
      if (regeneratedHash !== request.dryRunBaselineRef) {
        errors.push(
          'dryRunBaselineRef does not match the regenerated proof artifact JSON hash',
        );
      }
    }
  }

  // 8. Approval state rules.
  const approval = request?.operatorApproval;
  if (approval) {
    if (approval.approvalStatus === 'rejected') {
      errors.push('operatorApproval.approvalStatus is "rejected"');
    }
    if (approval.approvalStatus === 'approved-for-non-production') {
      if (approval.approvalScope !== 'non-production-only') {
        errors.push(
          'approvalStatus "approved-for-non-production" requires approvalScope "non-production-only"',
        );
      }
      if (
        typeof approval.approvedBy !== 'string' ||
        approval.approvedBy.length === 0 ||
        typeof approval.approvedAt !== 'string' ||
        approval.approvedAt.length === 0
      ) {
        errors.push(
          'approved-for-non-production requires approvedBy and approvedAt to be non-empty strings',
        );
      }
    }
  }

  // Decision shaping.
  let status: ApplyGateStatus;
  let requiredHumanActions: readonly string[];
  if (errors.length > 0) {
    status = 'blocked';
    requiredHumanActions = Object.freeze([
      'Resolve apply-gate errors before resubmitting.',
    ] as readonly string[]);
  } else if (
    approval?.approvalStatus === 'approved-for-non-production' &&
    approval.approvalScope === 'non-production-only'
  ) {
    status = 'ready-for-non-production-apply';
    requiredHumanActions = REQUIRED_HUMAN_ACTIONS_READY;
  } else {
    status = 'not-executable-in-this-step';
    requiredHumanActions = REQUIRED_HUMAN_ACTIONS_PENDING;
  }

  const decision: ApplyGateDecision = Object.freeze({
    decisionVersion: APPLY_GATE_DECISION_VERSION,
    ok: errors.length === 0,
    status,
    errors: Object.freeze([...errors]),
    warnings: Object.freeze([...warnings]),
    requiredHumanActions,
    validatedAt,
    manifestHash,
    proofArtifactHash,
    proofMarkdownHash,
    nonProductionOnly: true,
    tenantMutationPerformed: false,
    notExecutableReason: APPLY_GATE_NOT_EXECUTABLE_REASON,
  });

  return decision;
}
