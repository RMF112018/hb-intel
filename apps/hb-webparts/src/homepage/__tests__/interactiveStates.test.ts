import { describe, expect, it } from 'vitest';
import { readFileSync, existsSync, readdirSync, statSync } from 'fs';
import { resolve, join } from 'path';

/**
 * Interactive-state system structural tests.
 *
 * Verifies that the CSS module for hover/focus-visible states exists,
 * exports the expected class names, and contains required pseudo-class
 * and reduced-motion rules.
 */

const CSS_MODULE_PATH = resolve(__dirname, '../homepage-interactive.module.css');

describe('homepage interactive CSS module', () => {
  it('CSS module file exists', () => {
    expect(existsSync(CSS_MODULE_PATH)).toBe(true);
  });

  const cssSource = readFileSync(CSS_MODULE_PATH, 'utf8');

  it('defines .ctaLink with hover and focus-visible states', () => {
    expect(cssSource).toContain('.ctaLink');
    expect(cssSource).toContain('.ctaLink:hover');
    expect(cssSource).toContain('.ctaLink:focus-visible');
  });

  it('defines .searchInput with focus-visible state', () => {
    expect(cssSource).toContain('.searchInput');
    expect(cssSource).toContain('.searchInput:focus-visible');
  });

  it('defines .topBandSection for full-width posture', () => {
    expect(cssSource).toContain('.topBandSection');
    expect(cssSource).toContain('width: 100%');
  });

  it('defines .mediaContainer for layout stability', () => {
    expect(cssSource).toContain('.mediaContainer');
  });

  it('includes prefers-reduced-motion blanket rule', () => {
    expect(cssSource).toContain('@media (prefers-reduced-motion: reduce)');
    expect(cssSource).toContain('transition: none');
  });

  it('focus-visible uses brand blue outline (#225391)', () => {
    // All focus-visible outlines should use brand blue
    const focusBlocks = cssSource.split(':focus-visible');
    for (let i = 1; i < focusBlocks.length; i++) {
      const block = focusBlocks[i].split('}')[0];
      if (block.includes('outline')) {
        expect(block).toContain('#225391');
      }
    }
  });
});

describe('CTA semantics audit', () => {
  it('all webpart CTA links use <a> elements with href (navigational)', () => {
    const webpartDir = resolve(__dirname, '../../webparts');

    const webpartFolders = readdirSync(webpartDir).filter((f: string) =>
      statSync(join(webpartDir, f)).isDirectory() && f !== 'hbWebparts',
    );

    for (const folder of webpartFolders) {
      const files = readdirSync(join(webpartDir, folder)).filter((f: string) => f.endsWith('.tsx'));
      for (const file of files) {
        const content = readFileSync(join(webpartDir, folder, file), 'utf8');
        // If the file contains CTA rendering, verify it uses <a href= (not <button>)
        if (content.includes('.cta.href')) {
          expect(
            content.includes('<a href=') || content.includes('<a\n') || content.includes('<HbcHomepageCta'),
            `${folder}/${file}: CTAs with href should use <a> elements or HbcHomepageCta`,
          ).toBe(true);
        }
      }
    }
  });
});
