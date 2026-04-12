/**
 * Screenshot, trace, and report artifact naming discipline for the
 * Kudos stress suite.
 *
 * Naming convention:
 *   test-results/kudos/<group>/<spec>/<case>-<matrixTag>.<ext>
 *
 * The tag is the matrix coordinate (e.g. `A3-C1-E3-H1`) so artifacts
 * can be reconstructed into coverage reports without re-parsing spec
 * titles.
 */
import type { Page } from '@playwright/test';

export interface ArtifactNameInput {
  group: 'public' | 'companion' | 'shared' | 'hosted';
  spec: string;
  caseName: string;
  matrixParts: string[];
}

export function artifactBasename(input: ArtifactNameInput): string {
  const safe = (s: string) => s.replace(/[^a-zA-Z0-9._-]+/g, '-').replace(/^-+|-+$/g, '');
  const tag = input.matrixParts.map(safe).join('-');
  return `${safe(input.group)}/${safe(input.spec)}/${safe(input.caseName)}${tag ? `-${tag}` : ''}`;
}

export async function captureProof(page: Page, input: ArtifactNameInput): Promise<string> {
  const base = artifactBasename(input);
  const path = `test-results/kudos/${base}.png`;
  await page.screenshot({ path, fullPage: true });
  return path;
}
