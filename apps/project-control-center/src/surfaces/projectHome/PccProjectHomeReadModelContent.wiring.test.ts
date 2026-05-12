import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

describe('PccProjectHomeReadModelContent document-control seam regression', () => {
  it('wires PccDocumentControlCard to viewModel?.documentControlHomeFeed.data (Prompt 09B retarget guard)', () => {
    const filePath = resolve(
      process.cwd(),
      'src/surfaces/projectHome/PccProjectHomeReadModelContent.tsx',
    );
    const source = readFileSync(filePath, 'utf8');

    expect(source).toMatch(
      /<PccDocumentControlCard[\s\S]*state=\{viewModel\?\.documentControlHomeFeed\.state \?\? 'preview'\}/,
    );
    expect(source).toMatch(
      /<PccDocumentControlCard[\s\S]*homeFeed=\{viewModel\?\.documentControlHomeFeed\.data\}/,
    );
    expect(source).not.toMatch(/sources=\{viewModel\?\.documentControl\.data\}/);
    expect(source).not.toMatch(/homeFeed=\{viewModel\?\.documentControl\.data\}/);
  });
});
