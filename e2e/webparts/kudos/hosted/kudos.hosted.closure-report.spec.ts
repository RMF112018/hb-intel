/**
 * Phase-23 Prompt 09 — hosted closure report emitter.
 *
 * Statically scans every `kudos.hosted.*.spec.ts` file in this
 * directory, extracts each `test(...)` title + its `matrixTag(...)`
 * coordinates, and writes a single JSON artifact to
 * `test-results/kudos-hosted-closure-report.json` reviewers can cite
 * when closing out Phase-23 Finding 9.
 *
 * This spec asserts zero product behavior — it only aggregates the
 * hosted suite's self-documented matrix coverage into one file so
 * closure review does not require scanning the full Playwright
 * report.
 */
import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import { expect, test } from '@playwright/test';

const HOSTED_DIR = path.resolve(__dirname);
const OUTPUT_PATH = path.resolve(
  __dirname,
  '../../../../test-results/kudos-hosted-closure-report.json',
);

interface TestEntry {
  spec: string;
  title: string;
  matrixTags: string[];
}

interface SpecEntry {
  spec: string;
  tests: TestEntry[];
}

test.describe('kudos.hosted.closure-report', () => {
  test('emit hosted closure report artifact', async () => {
    const files = (await fs.readdir(HOSTED_DIR)).filter(
      (f) => f.endsWith('.spec.ts') && f !== path.basename(__filename),
    );

    const specs: SpecEntry[] = [];
    const testPattern = /\btest\(\s*`([^`]+)`/g;
    const tagPattern = /matrixTag\(([^)]*)\)/g;

    for (const file of files.sort()) {
      const src = await fs.readFile(path.join(HOSTED_DIR, file), 'utf8');
      const tests: TestEntry[] = [];
      let match: RegExpExecArray | null;
      testPattern.lastIndex = 0;
      while ((match = testPattern.exec(src)) !== null) {
        const raw = match[1];
        const tagMatches: string[] = [];
        let tagMatch: RegExpExecArray | null;
        tagPattern.lastIndex = 0;
        while ((tagMatch = tagPattern.exec(raw)) !== null) {
          // Extract quoted args, e.g. 'H1', 'P0' → ['H1','P0'].
          const args = tagMatch[1].match(/'([^']+)'/g) ?? [];
          for (const a of args) tagMatches.push(a.slice(1, -1));
        }
        // Strip ${matrixTag(...)} so the title reads cleanly.
        const cleanTitle = raw.replace(/\s*\$\{matrixTag\([^)]*\)\}/g, '').trim();
        tests.push({ spec: file, title: cleanTitle, matrixTags: tagMatches });
      }
      specs.push({ spec: file, tests });
    }

    const totalTests = specs.reduce((acc, s) => acc + s.tests.length, 0);
    const matrixCoverage = Array.from(
      new Set(specs.flatMap((s) => s.tests.flatMap((t) => t.matrixTags))),
    ).sort();

    const report = {
      generatedAt: new Date().toISOString(),
      suite: 'kudos.hosted',
      totalSpecs: specs.length,
      totalTests,
      matrixCoverage,
      specs,
    };

    await fs.mkdir(path.dirname(OUTPUT_PATH), { recursive: true });
    await fs.writeFile(OUTPUT_PATH, JSON.stringify(report, null, 2), 'utf8');

    // Sanity checks — the aggregator is worthless if it finds nothing.
    expect(totalTests).toBeGreaterThan(0);
    expect(matrixCoverage.length).toBeGreaterThan(0);
  });
});
