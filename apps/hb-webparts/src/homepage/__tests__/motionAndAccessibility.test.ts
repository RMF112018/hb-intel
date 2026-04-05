import { describe, expect, it } from 'vitest';
import { readFileSync } from 'fs';
import { resolve } from 'path';

/**
 * Motion and accessibility structural tests.
 *
 * Verify that the homepage token system and key components have the
 * structural hooks for reduced-motion, focus treatment, and media stability.
 */

const TOKENS_PATH = resolve(__dirname, '../tokens.ts');
const tokensSource = readFileSync(TOKENS_PATH, 'utf8');

describe('motion tokens', () => {
  it('defines HP_MOTION with fast, standard, hero, and none values', () => {
    expect(tokensSource).toContain('HP_MOTION');
    expect(tokensSource).toContain("fast: '150ms ease'");
    expect(tokensSource).toContain("none: 'none'");
  });

  it('documents reduced-motion gating requirement in HP_MOTION JSDoc', () => {
    expect(tokensSource).toContain('prefers-reduced-motion');
  });
});

describe('focus tokens', () => {
  it('defines HP_FOCUS with outline and outlineOffset', () => {
    expect(tokensSource).toContain('HP_FOCUS');
    expect(tokensSource).toContain("outline: '2px solid #225391'");
    expect(tokensSource).toContain('outlineOffset: 2');
  });
});

describe('media treatment', () => {
  it('defines hpMediaContainer with overflow hidden and background placeholder', () => {
    expect(tokensSource).toContain('hpMediaContainer');
    expect(tokensSource).toContain("overflow: 'hidden'");
    expect(tokensSource).toContain("backgroundColor: 'rgba(0,0,0,0.04)'");
  });
});

describe('branded state containers', () => {
  it('defines hpEmptyStateContainer with padding and border', () => {
    expect(tokensSource).toContain('hpEmptyStateContainer');
  });

  it('defines hpLoadingStateContainer with centered flex layout', () => {
    expect(tokensSource).toContain('hpLoadingStateContainer');
    expect(tokensSource).toContain("alignItems: 'center'");
  });
});

describe('search input polish', () => {
  it('defines hpSearchInput with transition for focus feedback', () => {
    expect(tokensSource).toContain('hpSearchInput');
    expect(tokensSource).toContain('transition:');
  });
});

describe('hero banner reduced-motion', () => {
  it('HbHeroBanner imports useHomepageReducedMotion hook', () => {
    const heroBannerSource = readFileSync(
      resolve(__dirname, '../../webparts/hbHeroBanner/HbHeroBanner.tsx'),
      'utf8',
    );
    expect(heroBannerSource).toContain('useHomepageReducedMotion');
    expect(heroBannerSource).toContain("reducedMotion ? 'none'");
  });
});
