import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  createDryRunProofArtifacts,
  createProvisioningManifest,
  loadTemplateArtifactsFromPackage,
} from '../src/index.js';

const HERE = dirname(fileURLToPath(import.meta.url));
const PACKAGE_ROOT = join(HERE, '..');
const TEMPLATE_PKG_ROOT = join(PACKAGE_ROOT, '..', 'project-site-template');
const PROOF_DIR = join(PACKAGE_ROOT, 'proof');

const ARTIFACT_ID = 'project-site-provisioning-dry-run-baseline';
const FROZEN_CLOCK = '2026-04-28T00:00:00.000Z';
const PROJECT_INPUTS = {
  projectNumber: '26-000-00',
  projectName: 'HB Standard Project Site Baseline',
};

function regenerate() {
  const artifacts = loadTemplateArtifactsFromPackage(TEMPLATE_PKG_ROOT);
  const manifest = createProvisioningManifest({
    templateArtifacts: artifacts,
    projectInputs: PROJECT_INPUTS,
    context: { now: () => new Date(FROZEN_CLOCK) },
  });
  return createDryRunProofArtifacts({
    manifest,
    metadata: { artifactId: ARTIFACT_ID, createdAt: FROZEN_CLOCK },
  });
}

describe('baseline determinism', () => {
  it('regenerated JSON matches the committed baseline byte-for-byte', () => {
    const committed = readFileSync(join(PROOF_DIR, `${ARTIFACT_ID}.json`), 'utf8');
    const { json } = regenerate();
    expect(json).toBe(committed);
  });

  it('regenerated Markdown matches the committed baseline byte-for-byte', () => {
    const committed = readFileSync(join(PROOF_DIR, `${ARTIFACT_ID}.md`), 'utf8');
    const { markdown } = regenerate();
    expect(markdown).toBe(committed);
  });
});
