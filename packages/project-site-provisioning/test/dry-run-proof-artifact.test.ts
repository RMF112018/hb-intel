import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  NON_EXECUTION_STATEMENT,
  OBJECT_PLAN_KEYS,
  PROOF_ARTIFACT_KIND,
  PROOF_ARTIFACT_VERSION,
  createDryRunProofArtifacts,
  createProvisioningManifest,
  loadTemplateArtifactsFromPackage,
  validateDryRunProofArtifact,
} from '../src/index.js';
import invalidDryRunFalse from './fixtures/invalid-proof-dry-run-false.fixture.json' with { type: 'json' };
import invalidTenantMutation from './fixtures/invalid-proof-tenant-mutation-allowed.fixture.json' with { type: 'json' };
import invalidIncomplete from './fixtures/invalid-proof-incomplete-coverage.fixture.json' with { type: 'json' };
import invalidFailedScan from './fixtures/invalid-proof-failed-scan.fixture.json' with { type: 'json' };

const HERE = dirname(fileURLToPath(import.meta.url));
const TEMPLATE_PKG_ROOT = join(HERE, '..', '..', 'project-site-template');

const FROZEN_NOW = () => new Date('2026-04-28T00:00:00.000Z');
const PROJECT_INPUTS = { projectNumber: '26-000-00', projectName: 'HB Test' };
const METADATA = {
  artifactId: 'unit-test-artifact',
  createdAt: '2026-04-28T00:00:00.000Z',
};

function buildProof() {
  const artifacts = loadTemplateArtifactsFromPackage(TEMPLATE_PKG_ROOT);
  const manifest = createProvisioningManifest({
    templateArtifacts: artifacts,
    projectInputs: PROJECT_INPUTS,
    context: { now: FROZEN_NOW },
  });
  return createDryRunProofArtifacts({ manifest, metadata: METADATA });
}

describe('createDryRunProofArtifacts', () => {
  it('emits a locked dry-run envelope', () => {
    const { artifact } = buildProof();
    expect(artifact.artifactVersion).toBe(PROOF_ARTIFACT_VERSION);
    expect(artifact.artifactKind).toBe(PROOF_ARTIFACT_KIND);
    expect(artifact.dryRunOnly).toBe(true);
    expect(artifact.tenantMutationAllowed).toBe(false);
    expect(artifact.approvalState.approvalStatus).toBe('not-requested');
    expect(artifact.approvalState.approvedBy).toBeNull();
    expect(artifact.approvalState.approvedAt).toBeNull();
    expect(artifact.approvalState.approvalRef).toBeNull();
    expect(artifact.nonExecutionStatement).toBe(NON_EXECUTION_STATEMENT);
  });

  it('preserves the locked mutation gate from the manifest', () => {
    const { artifact } = buildProof();
    expect(artifact.manifest.mutationGate.mutationLocked).toBe(true);
    expect(artifact.manifest.mutationGate.liveMutationAllowed).toBe(false);
    expect(artifact.manifest.mutationGate.requiresHumanApproval).toBe(true);
  });

  it('renders Markdown with the verbatim non-execution statement', () => {
    const { markdown } = buildProof();
    expect(markdown.includes(NON_EXECUTION_STATEMENT)).toBe(true);
    expect(markdown.endsWith('\n')).toBe(true);
  });

  it('renders Markdown rows for every object-plan family', () => {
    const { markdown } = buildProof();
    for (const family of OBJECT_PLAN_KEYS) {
      const linePattern = new RegExp(`\\| ${family} \\|`);
      expect(linePattern.test(markdown), `markdown missing row for ${family}`).toBe(true);
    }
  });

  it('emits JSON with trailing newline and plannedHash + scan results', () => {
    const { artifact, json } = buildProof();
    expect(json.endsWith('\n')).toBe(true);
    const parsed = JSON.parse(json);
    expect(parsed.operatorSummary.plannedHash).toBe(artifact.manifest.proof.plannedHash);
    expect(parsed.operatorSummary.scans.noSecretScan.ok).toBe(true);
    expect(parsed.operatorSummary.scans.noProcoreMirrorScan.ok).toBe(true);
    expect(parsed.operatorSummary.scans.noTenantMutationScan.ok).toBe(true);
  });

  it('produces byte-identical output for identical inputs', () => {
    const a = buildProof();
    const b = buildProof();
    expect(a.json).toBe(b.json);
    expect(a.markdown).toBe(b.markdown);
  });

  it('produces different output when manifest content changes', () => {
    const a = buildProof();
    const artifacts = loadTemplateArtifactsFromPackage(TEMPLATE_PKG_ROOT);
    const altered = createProvisioningManifest({
      templateArtifacts: artifacts,
      projectInputs: { projectNumber: '99-999-99', projectName: 'Different' },
      context: { now: FROZEN_NOW },
    });
    const b = createDryRunProofArtifacts({ manifest: altered, metadata: METADATA });
    expect(a.json).not.toBe(b.json);
    expect(a.markdown).not.toBe(b.markdown);
    expect(a.artifact.manifest.proof.plannedHash).not.toBe(b.artifact.manifest.proof.plannedHash);
  });

  it('keeps plannedHash stable when only createdAt changes', () => {
    const a = buildProof();
    const artifacts = loadTemplateArtifactsFromPackage(TEMPLATE_PKG_ROOT);
    const manifest = createProvisioningManifest({
      templateArtifacts: artifacts,
      projectInputs: PROJECT_INPUTS,
      context: { now: FROZEN_NOW },
    });
    const b = createDryRunProofArtifacts({
      manifest,
      metadata: { ...METADATA, createdAt: '2099-12-31T23:59:59.000Z' },
    });
    expect(a.artifact.manifest.proof.plannedHash).toBe(b.artifact.manifest.proof.plannedHash);
    expect(a.json).not.toBe(b.json); // createdAt differs in the envelope
  });

  it('passes its own validator', () => {
    const { artifact, markdown } = buildProof();
    const result = validateDryRunProofArtifact({ artifact, markdown });
    expect(result.ok, `validator errors:\n - ${result.errors.join('\n - ')}`).toBe(true);
  });
});

describe('validateDryRunProofArtifact', () => {
  const goodMarkdown = `(prefix)\n${NON_EXECUTION_STATEMENT}\n(suffix)`;

  it('rejects an artifact with dryRunOnly: false', () => {
    const r = validateDryRunProofArtifact({ artifact: invalidDryRunFalse, markdown: goodMarkdown });
    expect(r.ok).toBe(false);
    expect(r.errors.some((e) => e.includes('dryRunOnly must be true'))).toBe(true);
  });

  it('rejects an artifact with tenantMutationAllowed: true', () => {
    const r = validateDryRunProofArtifact({ artifact: invalidTenantMutation, markdown: goodMarkdown });
    expect(r.ok).toBe(false);
    expect(r.errors.some((e) => e.includes('tenantMutationAllowed must be false'))).toBe(true);
  });

  it('rejects an artifact with incomplete object family coverage', () => {
    const r = validateDryRunProofArtifact({ artifact: invalidIncomplete, markdown: goodMarkdown });
    expect(r.ok).toBe(false);
    expect(r.errors.some((e) => e.includes('object family coverage incomplete'))).toBe(true);
  });

  it('rejects an artifact whose manifest reports a failed scan', () => {
    const r = validateDryRunProofArtifact({ artifact: invalidFailedScan, markdown: goodMarkdown });
    expect(r.ok).toBe(false);
    expect(r.errors.some((e) => e.toLowerCase().includes('nosecretscan failed'))).toBe(true);
  });

  it('rejects an artifact with markdown missing the non-execution statement', () => {
    const { artifact } = buildProof();
    const r = validateDryRunProofArtifact({
      artifact,
      markdown: 'this string lacks the canonical sentinel.',
    });
    expect(r.ok).toBe(false);
    expect(r.errors.some((e) => e.includes('non-execution statement'))).toBe(true);
  });

  it('rejects an artifact with an approved-state shape', () => {
    const { artifact } = buildProof();
    const tampered = {
      ...artifact,
      approvalState: { approvalStatus: 'approved', approvedBy: 'someone', approvedAt: 'now', approvalRef: 'R-1' },
    };
    const r = validateDryRunProofArtifact({ artifact: tampered, markdown: NON_EXECUTION_STATEMENT });
    expect(r.ok).toBe(false);
    expect(r.errors.some((e) => e.includes('approvalStatus'))).toBe(true);
  });

  it('rejects an artifact carrying blockers when allowBlockers is unset', () => {
    const { artifact } = buildProof();
    const tampered = {
      ...artifact,
      manifest: { ...artifact.manifest, blockers: ['simulated-blocker'] },
    };
    const r = validateDryRunProofArtifact({ artifact: tampered, markdown: NON_EXECUTION_STATEMENT });
    expect(r.ok).toBe(false);
    expect(r.errors.some((e) => e.includes('blocker'))).toBe(true);
  });

  it('accepts blockers when allowBlockers: true', () => {
    const { artifact } = buildProof();
    const tampered = {
      ...artifact,
      manifest: { ...artifact.manifest, blockers: ['simulated-blocker'] },
    };
    const r = validateDryRunProofArtifact(
      { artifact: tampered, markdown: NON_EXECUTION_STATEMENT },
      { allowBlockers: true },
    );
    expect(r.errors.filter((e) => e.includes('blocker'))).toEqual([]);
  });

  it('rejects non-object input', () => {
    expect(validateDryRunProofArtifact({ artifact: null, markdown: '' }).ok).toBe(false);
    expect(validateDryRunProofArtifact({ artifact: 42, markdown: '' }).ok).toBe(false);
  });
});
