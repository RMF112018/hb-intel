#!/usr/bin/env node
/**
 * Regenerate the deterministic dry-run proof artifact baseline pair under
 * `packages/project-site-provisioning/proof/`.
 *
 * Package-local. No network. No tenant access. No environment variables.
 * Reads `@hbc/project-site-template` artifacts from the workspace path,
 * runs the Step 3 contract-coverage mapper with frozen project inputs and
 * a frozen clock, then emits the JSON envelope and Markdown summary that
 * are committed alongside the package as the regression baseline.
 *
 * Run via:
 *   pnpm --filter @hbc/project-site-provisioning generate:proof
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  createDryRunProofArtifacts,
  createProvisioningManifest,
  loadTemplateArtifactsFromPackage,
} from '../dist/src/index.js';

const HERE = dirname(fileURLToPath(import.meta.url));
const PACKAGE_ROOT = join(HERE, '..');
const TEMPLATE_PKG_ROOT = join(PACKAGE_ROOT, '..', 'project-site-template');
const PROOF_DIR = join(PACKAGE_ROOT, 'proof');

const ARTIFACT_ID = 'project-site-provisioning-dry-run-baseline';
const FROZEN_CLOCK = '2026-04-28T00:00:00.000Z';
const PROJECT_INPUTS = Object.freeze({
  projectNumber: '26-000-00',
  projectName: 'HB Standard Project Site Baseline',
});

function main() {
  const artifacts = loadTemplateArtifactsFromPackage(TEMPLATE_PKG_ROOT);

  const manifest = createProvisioningManifest({
    templateArtifacts: artifacts,
    projectInputs: PROJECT_INPUTS,
    context: { now: () => new Date(FROZEN_CLOCK) },
  });

  const { json, markdown } = createDryRunProofArtifacts({
    manifest,
    metadata: {
      artifactId: ARTIFACT_ID,
      createdAt: FROZEN_CLOCK,
    },
  });

  mkdirSync(PROOF_DIR, { recursive: true });
  writeFileSync(join(PROOF_DIR, `${ARTIFACT_ID}.json`), json);
  writeFileSync(join(PROOF_DIR, `${ARTIFACT_ID}.md`), markdown);

  // eslint-disable-next-line no-console
  console.log(`[generate-baseline-proof] wrote ${ARTIFACT_ID}.{json,md} to ${PROOF_DIR}`);
}

main();
