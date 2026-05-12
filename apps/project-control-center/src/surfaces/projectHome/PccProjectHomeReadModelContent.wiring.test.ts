import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

describe('PccProjectHomeReadModelContent document-control seam regression', () => {
  it('keeps PccDocumentControlCard wired to viewModel?.documentControl.data (Prompt 09A no-retarget guard)', () => {
    const filePath = resolve(
      process.cwd(),
      'src/surfaces/projectHome/PccProjectHomeReadModelContent.tsx',
    );
    const source = readFileSync(filePath, 'utf8');

    expect(source).toMatch(
      /<PccDocumentControlCard[\s\S]*sources=\{viewModel\?\.documentControl\.data\}/,
    );
    expect(source).not.toMatch(/<PccDocumentControlCard[\s\S]*documentControlHomeFeed/);
    expect(source).not.toMatch(/sources=\{viewModel\?\.documentControlHomeFeed\.data\}/);
  });
});
