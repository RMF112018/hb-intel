import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, render } from '@testing-library/react';
import { PccCommandSearch } from '../shell/PccCommandSearch';

// Phase 08 Prompt 05 — PccCommandSearch preview capsule.
//
// Dedicated coverage for the premium, non-interactive preview capsule.
// Locks the variant markers, visible copy, preview examples (expanded
// variant only), non-interactive descendant contract, and decorative SVG
// accessibility posture. Variant-by-mode behavior remains covered by
// PccProjectHeroBand tests; this file owns the component-level contract.

describe('PccCommandSearch (Phase 08 Prompt 05)', () => {
  // PCC SPFx workspace runs vitest with `globals: false`. Explicit cleanup
  // keeps each render scoped.
  afterEach(() => {
    cleanup();
  });

  describe('expanded variant', () => {
    it('renders the expanded root markers', () => {
      const { container } = render(<PccCommandSearch />);
      const capsule = container.querySelector('[data-pcc-command-search="expanded"]');
      expect(capsule).not.toBeNull();
      expect(capsule!.getAttribute('data-pcc-command-search-state')).toBe('preview');
    });

    it('renders the title, helper, and advisory cue copy', () => {
      const { container } = render(<PccCommandSearch />);
      const title = container.querySelector('[data-pcc-command-search-title]');
      expect(title?.textContent).toBe('Command Search — Preview');

      const helper = container.querySelector('[data-pcc-command-search-helper]');
      expect(helper?.textContent).toBe(
        'Search, HBI prompts, and project commands are preview-only in this phase.',
      );

      const cue = container.querySelector('[data-pcc-command-search-cue]');
      expect(cue?.textContent).toContain('Advisory only');
      expect(cue?.textContent).toContain('no decisions');
      expect(cue?.textContent).toContain('no writeback');
    });

    it('renders three deterministic non-interactive preview examples', () => {
      const { container } = render(<PccCommandSearch />);
      const examplesGroup = container.querySelector('[data-pcc-command-search-examples]');
      expect(examplesGroup).not.toBeNull();

      const examples = container.querySelectorAll('[data-pcc-command-search-example]');
      expect(examples).toHaveLength(3);

      const ids = Array.from(examples).map((node) =>
        node.getAttribute('data-pcc-command-search-example'),
      );
      expect(ids).toEqual(['ask-hbi', 'find-records', 'review-blockers']);

      const texts = Array.from(examples).map((node) => node.textContent?.trim() ?? '');
      expect(texts).toEqual([
        'Ask HBI for project context',
        'Find project records',
        'Review blocking signals',
      ]);

      for (const example of Array.from(examples)) {
        expect(example.tagName).toBe('SPAN');
      }
    });

    it('emits stable child markers exactly once each', () => {
      const { container } = render(<PccCommandSearch />);
      expect(container.querySelectorAll('[data-pcc-command-search-glyph]')).toHaveLength(1);
      expect(container.querySelectorAll('[data-pcc-command-search-title]')).toHaveLength(1);
      expect(container.querySelectorAll('[data-pcc-command-search-helper]')).toHaveLength(1);
      expect(container.querySelectorAll('[data-pcc-command-search-cue]')).toHaveLength(1);
      expect(container.querySelectorAll('[data-pcc-command-search-examples]')).toHaveLength(1);
    });
  });

  describe('icon variant', () => {
    it('renders the icon root markers', () => {
      const { container } = render(<PccCommandSearch variant="icon" />);
      const capsule = container.querySelector('[data-pcc-command-search="icon"]');
      expect(capsule).not.toBeNull();
      expect(capsule!.getAttribute('data-pcc-command-search-state')).toBe('preview');
    });

    it('renders only the glyph and the title (no helper, no cue, no examples)', () => {
      const { container } = render(<PccCommandSearch variant="icon" />);
      const title = container.querySelector('[data-pcc-command-search-title]');
      expect(title?.textContent).toBe('Command Search — Preview');
      expect(container.querySelectorAll('[data-pcc-command-search-glyph]')).toHaveLength(1);

      expect(container.querySelectorAll('[data-pcc-command-search-helper]')).toHaveLength(0);
      expect(container.querySelectorAll('[data-pcc-command-search-cue]')).toHaveLength(0);
      expect(container.querySelectorAll('[data-pcc-command-search-examples]')).toHaveLength(0);
      expect(container.querySelectorAll('[data-pcc-command-search-example]')).toHaveLength(0);
    });
  });

  describe('non-interactive contract (both variants)', () => {
    it.each(['expanded', 'icon'] as const)(
      'renders no interactive descendants for the "%s" variant',
      (variant) => {
        cleanup();
        const { container } = render(<PccCommandSearch variant={variant} />);
        expect(container.querySelectorAll('input')).toHaveLength(0);
        expect(container.querySelectorAll('button')).toHaveLength(0);
        expect(container.querySelectorAll('a')).toHaveLength(0);
        expect(container.querySelectorAll('select')).toHaveLength(0);
        expect(container.querySelectorAll('textarea')).toHaveLength(0);
        expect(container.querySelectorAll('[tabindex="0"]')).toHaveLength(0);
        expect(container.querySelectorAll('[role="button"]')).toHaveLength(0);
        expect(container.querySelectorAll('[role="searchbox"]')).toHaveLength(0);
        expect(container.querySelectorAll('[role="combobox"]')).toHaveLength(0);
        expect(container.querySelectorAll('[role="textbox"]')).toHaveLength(0);
      },
    );

    it.each(['expanded', 'icon'] as const)(
      'decorative SVG glyph carries aria-hidden and focusable=false for the "%s" variant',
      (variant) => {
        cleanup();
        const { container } = render(<PccCommandSearch variant={variant} />);
        const svgs = container.querySelectorAll('svg');
        expect(svgs.length).toBeGreaterThan(0);
        for (const svg of Array.from(svgs)) {
          expect(svg.getAttribute('aria-hidden')).toBe('true');
          expect(svg.getAttribute('focusable')).toBe('false');
        }
      },
    );
  });
});
