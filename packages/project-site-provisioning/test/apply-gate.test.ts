import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  APPLY_GATE_DECISION_VERSION,
  APPLY_GATE_NOT_EXECUTABLE_REASON,
  type ApplyGateOperatorApproval,
  type ApplyGateRequest,
  type NonProductionTargetDeclaration,
  type RollbackPosture,
  createDryRunProofArtifacts,
  createProvisioningManifest,
  evaluateApplyGate,
  hashJsonProofArtifact,
  loadTemplateArtifactsFromPackage,
  serializeDryRunProofJson,
  validateApplyGateRequest,
} from '../src/index.js';

const HERE = dirname(fileURLToPath(import.meta.url));
const TEMPLATE_PKG_ROOT = join(HERE, '..', '..', 'project-site-template');
const FROZEN_NOW = () => new Date('2026-04-28T00:00:00.000Z');
const PROJECT_INPUTS = {
  projectNumber: '26-000-00',
  projectName: 'HB Standard Project Site Baseline',
};
const METADATA = {
  artifactId: 'project-site-provisioning-dry-run-baseline',
  createdAt: '2026-04-28T00:00:00.000Z',
};

const TARGET: NonProductionTargetDeclaration = Object.freeze({
  targetEnvironment: 'non-production',
  tenantName: 'hbintel-nonprod',
  tenantIdPlaceholder: 'NONPROD-TENANT-PLACEHOLDER',
  siteCollectionBaseUrl: 'https://hbintel-nonprod.sharepoint.com',
  allowedSitePathPrefix: '/sites/',
  operatorGroup: 'PCC-Apply-Gate-Operators-Nonprod',
  dataClassification: 'internal-non-production',
  mutationMode: 'blocked-in-step-5',
});

const ROLLBACK: RollbackPosture = Object.freeze({
  rollbackMode: 'manual-repair-plan',
  manualRepairOwner: 'PCC On-Call',
  manualRepairRunbookRef: 'docs/runbooks/pcc-manual-repair.md',
  knownIrreversibleActions: Object.freeze([] as readonly string[]),
  preMutationSnapshotRequired: true,
  postMutationValidationRequired: true,
});

const PENDING_APPROVAL: ApplyGateOperatorApproval = Object.freeze({
  approvalStatus: 'pending',
  approvedBy: null,
  approvedAt: null,
  approvalRef: null,
});

const APPROVED_APPROVAL: ApplyGateOperatorApproval = Object.freeze({
  approvalStatus: 'approved-for-non-production',
  approvalScope: 'non-production-only',
  approvedBy: 'pcc-operator@example.com',
  approvedAt: '2026-04-28T01:00:00.000Z',
  approvalRef: 'OP-NONPROD-2026-04-28-001',
});

function buildRequest(overrides: Partial<ApplyGateRequest> = {}): ApplyGateRequest {
  const artifacts = loadTemplateArtifactsFromPackage(TEMPLATE_PKG_ROOT);
  const manifest = createProvisioningManifest({
    templateArtifacts: artifacts,
    projectInputs: PROJECT_INPUTS,
    context: { now: FROZEN_NOW },
  });
  const { artifact, markdown } = createDryRunProofArtifacts({ manifest, metadata: METADATA });

  const base: ApplyGateRequest = {
    environment: 'non-production',
    targetTenant: TARGET,
    manifest,
    proofArtifact: artifact,
    proofMarkdown: markdown,
    operatorApproval: PENDING_APPROVAL,
    rollbackPosture: ROLLBACK,
    requestedBy: 'pcc-builder@example.com',
    requestedAt: '2026-04-28T00:30:00.000Z',
    requestRef: 'REQ-NONPROD-2026-04-28-001',
  };

  return { ...base, ...overrides };
}

const FROZEN_VALIDATED_AT = () => new Date('2026-04-28T02:00:00.000Z');

describe('validateApplyGateRequest', () => {
  it('accepts a well-formed request', () => {
    const r = validateApplyGateRequest(buildRequest());
    expect(r.ok, `errors: ${r.errors.join('; ')}`).toBe(true);
  });

  it('rejects a non-object input', () => {
    expect(validateApplyGateRequest(null).ok).toBe(false);
    expect(validateApplyGateRequest(42).ok).toBe(false);
  });

  it('rejects requests missing required top-level fields', () => {
    const { rollbackPosture: _omit, ...stripped } = buildRequest();
    void _omit;
    const r = validateApplyGateRequest(stripped);
    expect(r.ok).toBe(false);
    expect(r.errors.some((e) => e.includes('rollbackPosture'))).toBe(true);
  });

  it('rejects unknown environment values', () => {
    const r = validateApplyGateRequest(buildRequest({ environment: 'staging' as never }));
    expect(r.ok).toBe(false);
    expect(r.errors.some((e) => e.includes('environment'))).toBe(true);
  });

  it('rejects an unknown approvalStatus', () => {
    const tampered = buildRequest({
      operatorApproval: { ...PENDING_APPROVAL, approvalStatus: 'mystery' as never },
    });
    const r = validateApplyGateRequest(tampered);
    expect(r.ok).toBe(false);
    expect(r.errors.some((e) => e.includes('approvalStatus'))).toBe(true);
  });
});

describe('evaluateApplyGate (decision shape)', () => {
  it('always emits decisionVersion, hashes, and locked literal flags', () => {
    const decision = evaluateApplyGate(buildRequest(), { now: FROZEN_VALIDATED_AT });
    expect(decision.decisionVersion).toBe(APPLY_GATE_DECISION_VERSION);
    expect(decision.nonProductionOnly).toBe(true);
    expect(decision.tenantMutationPerformed).toBe(false);
    expect(decision.notExecutableReason).toBe(APPLY_GATE_NOT_EXECUTABLE_REASON);
    expect(decision.manifestHash).toMatch(/^[0-9a-f]{64}$/);
    expect(decision.proofArtifactHash).toMatch(/^[0-9a-f]{64}$/);
    expect(decision.proofMarkdownHash).toMatch(/^[0-9a-f]{64}$/);
    expect(decision.validatedAt).toBe('2026-04-28T02:00:00.000Z');
  });
});

describe('evaluateApplyGate (positive paths)', () => {
  it('returns not-executable-in-this-step for a clean pending request', () => {
    const decision = evaluateApplyGate(buildRequest(), { now: FROZEN_VALIDATED_AT });
    expect(decision.ok).toBe(true);
    expect(decision.status).toBe('not-executable-in-this-step');
    expect(decision.errors).toEqual([]);
    expect(decision.requiredHumanActions.some((s) => s.includes('Operator approval'))).toBe(true);
  });

  it('returns ready-for-non-production-apply when approval is approved with non-production-only scope', () => {
    const decision = evaluateApplyGate(buildRequest({ operatorApproval: APPROVED_APPROVAL }), {
      now: FROZEN_VALIDATED_AT,
    });
    expect(decision.ok).toBe(true);
    expect(decision.status).toBe('ready-for-non-production-apply');
    expect(decision.errors).toEqual([]);
    expect(decision.tenantMutationPerformed).toBe(false);
    expect(decision.nonProductionOnly).toBe(true);
    expect(decision.requiredHumanActions.some((s) => s.includes('byte-match'))).toBe(true);
  });

  it('passes byte-match when regenerated proof matches the supplied proof', () => {
    const req = buildRequest({ operatorApproval: APPROVED_APPROVAL });
    const regeneratedJson = serializeDryRunProofJson(req.proofArtifact);
    const regeneratedMarkdown = req.proofMarkdown;
    const decision = evaluateApplyGate(req, {
      now: FROZEN_VALIDATED_AT,
      regeneratedProof: { json: regeneratedJson, markdown: regeneratedMarkdown },
    });
    expect(decision.ok).toBe(true);
    expect(decision.status).toBe('ready-for-non-production-apply');
  });

  it('honours dryRunBaselineRef when it matches the regenerated JSON hash', () => {
    const req = buildRequest({ operatorApproval: APPROVED_APPROVAL });
    const regeneratedJson = serializeDryRunProofJson(req.proofArtifact);
    const baselineHash = hashJsonProofArtifact(regeneratedJson);
    const decision = evaluateApplyGate(
      { ...req, dryRunBaselineRef: baselineHash },
      {
        now: FROZEN_VALIDATED_AT,
        regeneratedProof: { json: regeneratedJson, markdown: req.proofMarkdown },
      },
    );
    expect(decision.ok).toBe(true);
    expect(decision.status).toBe('ready-for-non-production-apply');
  });
});

describe('evaluateApplyGate (block conditions)', () => {
  it('blocks production environment', () => {
    const decision = evaluateApplyGate(buildRequest({ environment: 'production' }), {
      now: FROZEN_VALIDATED_AT,
    });
    expect(decision.ok).toBe(false);
    expect(decision.status).toBe('blocked');
    expect(decision.errors.some((e) => e.toLowerCase().includes('production'))).toBe(true);
  });

  it('blocks when targetTenant.targetEnvironment is not non-production', () => {
    const tampered = buildRequest({
      targetTenant: { ...TARGET, targetEnvironment: 'production' as never },
    });
    const decision = evaluateApplyGate(tampered, { now: FROZEN_VALIDATED_AT });
    expect(decision.ok).toBe(false);
    expect(decision.errors.some((e) => e.includes('targetEnvironment'))).toBe(true);
  });

  it('blocks when rollback posture is missing required fields', () => {
    const tampered = buildRequest({
      rollbackPosture: { ...ROLLBACK, manualRepairOwner: '' as never },
    });
    const decision = evaluateApplyGate(tampered, { now: FROZEN_VALIDATED_AT });
    expect(decision.ok).toBe(false);
    expect(decision.errors.some((e) => e.includes('manualRepairOwner'))).toBe(true);
  });

  it('blocks when operatorApproval is rejected', () => {
    const tampered = buildRequest({
      operatorApproval: { ...PENDING_APPROVAL, approvalStatus: 'rejected' },
    });
    const decision = evaluateApplyGate(tampered, { now: FROZEN_VALIDATED_AT });
    expect(decision.ok).toBe(false);
    expect(decision.errors.some((e) => e.toLowerCase().includes('rejected'))).toBe(true);
  });

  it('blocks approved-for-non-production without non-production-only scope', () => {
    const tampered = buildRequest({
      operatorApproval: {
        approvalStatus: 'approved-for-non-production',
        approvedBy: 'op@example.com',
        approvedAt: '2026-04-28T01:00:00.000Z',
        approvalRef: 'X',
      },
    });
    const decision = evaluateApplyGate(tampered, { now: FROZEN_VALIDATED_AT });
    expect(decision.ok).toBe(false);
    expect(decision.errors.some((e) => e.includes('non-production-only'))).toBe(true);
  });

  it('blocks approved-for-non-production with empty approvedBy / approvedAt', () => {
    const tampered = buildRequest({
      operatorApproval: {
        approvalStatus: 'approved-for-non-production',
        approvalScope: 'non-production-only',
        approvedBy: null,
        approvedAt: null,
        approvalRef: null,
      },
    });
    const decision = evaluateApplyGate(tampered, { now: FROZEN_VALIDATED_AT });
    expect(decision.ok).toBe(false);
    expect(decision.errors.some((e) => e.includes('approvedBy and approvedAt'))).toBe(true);
  });

  it('blocks when manifest mutation gate is unlocked', () => {
    const req = buildRequest();
    const tampered: ApplyGateRequest = {
      ...req,
      manifest: {
        ...req.manifest,
        mutationGate: {
          ...req.manifest.mutationGate,
          mutationLocked: false as never,
        },
      },
    };
    const decision = evaluateApplyGate(tampered, { now: FROZEN_VALIDATED_AT });
    expect(decision.ok).toBe(false);
    expect(decision.errors.some((e) => e.includes('mutationGate must be locked'))).toBe(true);
  });

  it('blocks when manifest carries blockers', () => {
    const req = buildRequest();
    const tampered: ApplyGateRequest = {
      ...req,
      manifest: { ...req.manifest, blockers: Object.freeze(['simulated-blocker']) },
    };
    const decision = evaluateApplyGate(tampered, { now: FROZEN_VALIDATED_AT });
    expect(decision.ok).toBe(false);
    expect(decision.errors.some((e) => e.includes('blocker'))).toBe(true);
  });

  it('blocks when a manifest scan is failing', () => {
    const req = buildRequest();
    const tampered: ApplyGateRequest = {
      ...req,
      manifest: {
        ...req.manifest,
        proof: {
          ...req.manifest.proof,
          noSecretScan: { ok: false, hits: Object.freeze(['$.fake']) },
        },
      },
    };
    const decision = evaluateApplyGate(tampered, { now: FROZEN_VALIDATED_AT });
    expect(decision.ok).toBe(false);
    expect(decision.errors.some((e) => e.includes('noSecretScan'))).toBe(true);
  });

  it('blocks when object family coverage is incomplete', () => {
    const req = buildRequest();
    const tampered: ApplyGateRequest = {
      ...req,
      manifest: {
        ...req.manifest,
        objectPlans: {
          ...req.manifest.objectPlans,
          pages: { status: 'placeholder', entries: Object.freeze([]) },
        } as never,
      },
    };
    const decision = evaluateApplyGate(tampered, { now: FROZEN_VALIDATED_AT });
    expect(decision.ok).toBe(false);
    expect(decision.errors.some((e) => e.includes('object family coverage incomplete: pages'))).toBe(true);
  });

  it('blocks when proofMarkdown omits the non-execution sentinel', () => {
    const tampered = buildRequest({ proofMarkdown: 'no sentinel here' });
    const decision = evaluateApplyGate(tampered, { now: FROZEN_VALIDATED_AT });
    expect(decision.ok).toBe(false);
    expect(decision.errors.some((e) => e.includes('non-execution statement'))).toBe(true);
  });

  it('blocks when manifest plannedHash differs from proof artifact embedded hash', () => {
    const req = buildRequest();
    const tampered: ApplyGateRequest = {
      ...req,
      manifest: {
        ...req.manifest,
        proof: { ...req.manifest.proof, plannedHash: 'a'.repeat(64) },
      },
    };
    const decision = evaluateApplyGate(tampered, { now: FROZEN_VALIDATED_AT });
    expect(decision.ok).toBe(false);
    expect(decision.errors.some((e) => e.toLowerCase().includes('does not match'))).toBe(true);
  });

  it('blocks when regenerated proof JSON byte-mismatches the supplied proof', () => {
    const req = buildRequest({ operatorApproval: APPROVED_APPROVAL });
    const decision = evaluateApplyGate(req, {
      now: FROZEN_VALIDATED_AT,
      regeneratedProof: {
        json: '{"different":"json"}\n',
        markdown: req.proofMarkdown,
      },
    });
    expect(decision.ok).toBe(false);
    expect(decision.errors.some((e) => e.includes('JSON byte mismatch'))).toBe(true);
  });

  it('blocks when regenerated proof Markdown byte-mismatches the supplied proof', () => {
    const req = buildRequest({ operatorApproval: APPROVED_APPROVAL });
    const regeneratedJson = serializeDryRunProofJson(req.proofArtifact);
    const decision = evaluateApplyGate(req, {
      now: FROZEN_VALIDATED_AT,
      regeneratedProof: { json: regeneratedJson, markdown: 'not the same markdown' },
    });
    expect(decision.ok).toBe(false);
    expect(decision.errors.some((e) => e.includes('Markdown byte mismatch'))).toBe(true);
  });

  it('blocks when dryRunBaselineRef does not match the regenerated JSON hash', () => {
    const req = buildRequest({
      operatorApproval: APPROVED_APPROVAL,
      dryRunBaselineRef: 'b'.repeat(64),
    });
    const regeneratedJson = serializeDryRunProofJson(req.proofArtifact);
    const decision = evaluateApplyGate(req, {
      now: FROZEN_VALIDATED_AT,
      regeneratedProof: { json: regeneratedJson, markdown: req.proofMarkdown },
    });
    expect(decision.ok).toBe(false);
    expect(decision.errors.some((e) => e.includes('dryRunBaselineRef'))).toBe(true);
  });

  it('blocks when proof artifact dryRunOnly is flipped to false', () => {
    const req = buildRequest();
    const tampered: ApplyGateRequest = {
      ...req,
      proofArtifact: { ...req.proofArtifact, dryRunOnly: false as never },
    };
    const decision = evaluateApplyGate(tampered, { now: FROZEN_VALIDATED_AT });
    expect(decision.ok).toBe(false);
    expect(decision.errors.some((e) => e.includes('dryRunOnly'))).toBe(true);
  });

  it('blocked decisions still emit hashes and the literal flags', () => {
    const decision = evaluateApplyGate(buildRequest({ environment: 'production' }), {
      now: FROZEN_VALIDATED_AT,
    });
    expect(decision.tenantMutationPerformed).toBe(false);
    expect(decision.nonProductionOnly).toBe(true);
    expect(decision.notExecutableReason).toBe(APPLY_GATE_NOT_EXECUTABLE_REASON);
    expect(decision.manifestHash).toMatch(/^[0-9a-f]{64}$/);
  });
});
