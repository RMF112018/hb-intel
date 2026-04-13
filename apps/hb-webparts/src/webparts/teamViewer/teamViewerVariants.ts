/**
 * teamViewerVariants — class-variance-authority definitions for TeamViewer.
 *
 * Variants express persona: a refined, people-centric tile with
 * decisive hover/focus/press states that degrade gracefully when the
 * tile is non-interactive (drawer disabled). The vocabulary is small
 * on purpose — density is the single axis that matters for a team
 * strip; interactivity layers in the focus/press affordances.
 */
import type * as React from 'react';
import { cva } from '@hbc/ui-kit/homepage';

/**
 * Person-tile base styles. Rendered inline so the card can live in any
 * SPFx section column width without pulling a CSS module through the
 * build. Hover/focus/press affordances are applied via pseudo-classes
 * embedded in the class name suffix below.
 */
export const personTile = cva(
  [
    'tv-tile',
    // Layout fundamentals
    'tv-tile--layout-row',
    // Interaction affordances
    'tv-tile--hover',
    'tv-tile--focus',
    'tv-tile--press',
  ].join(' '),
  {
    variants: {
      density: {
        compact: 'tv-tile--compact',
        standard: 'tv-tile--standard',
        expanded: 'tv-tile--expanded',
      },
      interactive: {
        true: 'tv-tile--interactive',
        false: 'tv-tile--static',
      },
      featured: {
        true: 'tv-tile--featured',
        false: '',
      },
    },
    defaultVariants: {
      density: 'standard',
      interactive: false,
      featured: false,
    },
  },
);

/**
 * Build the `--tv-*` CSS custom-property bridge once per webpart root.
 * Kept centralized so every component reads the same color/tempo values.
 */
export function teamViewerCSSVars(): Record<string, string> {
  return {
    '--tv-text-strong': '#111827',
    '--tv-text-muted': '#4b5563',
    '--tv-surface-1': '#ffffff',
    '--tv-surface-2': '#f3f4f6',
    '--tv-border-subtle': 'rgba(17, 24, 39, 0.08)',
    '--tv-border-strong': 'rgba(17, 24, 39, 0.16)',
    '--tv-accent-from': '#1e3a8a',
    '--tv-accent-to': '#3b82f6',
    '--tv-accent-soft': 'rgba(59, 130, 246, 0.08)',
    '--tv-focus-ring': '#2563eb',
    '--tv-space-xs': '6px',
    '--tv-space-sm': '12px',
    '--tv-space-md': '16px',
    '--tv-space-lg': '24px',
  };
}

/**
 * Inline style map for the tile — keeps CVA class names available for
 * future CSS-module lift, but gives the runtime deterministic inline
 * styling today without adding a second module.
 */
export function tileInlineStyle(params: {
  interactive: boolean;
  density: 'compact' | 'standard' | 'expanded';
  featured: boolean;
  state: 'rest' | 'hover' | 'focus' | 'press';
}): React.CSSProperties {
  const padding =
    params.density === 'compact' ? '8px 10px' : params.density === 'expanded' ? '14px 16px' : '10px 12px';
  const borderColor =
    params.state === 'focus'
      ? 'var(--tv-focus-ring, #2563eb)'
      : params.state === 'hover' || params.state === 'press'
        ? 'var(--tv-border-strong, rgba(17,24,39,0.16))'
        : 'var(--tv-border-subtle, rgba(17,24,39,0.08))';
  const background =
    params.state === 'press'
      ? 'var(--tv-surface-2, #f3f4f6)'
      : params.state === 'hover'
        ? 'var(--tv-accent-soft, rgba(59,130,246,0.08))'
        : 'var(--tv-surface-1, #ffffff)';
  const boxShadow = params.featured
    ? '0 1px 0 rgba(17,24,39,0.04), 0 6px 20px rgba(30,58,138,0.10)'
    : params.state === 'hover'
      ? '0 1px 0 rgba(17,24,39,0.04), 0 6px 16px rgba(17,24,39,0.08)'
      : '0 1px 0 rgba(17,24,39,0.04)';
  const transform = params.state === 'press' ? 'translateY(0)' : params.state === 'hover' ? 'translateY(-1px)' : 'translateY(0)';

  return {
    display: 'flex',
    alignItems: 'center',
    gap: params.density === 'compact' ? 10 : 14,
    padding,
    borderRadius: 14,
    border: '1px solid',
    borderColor,
    background,
    color: 'var(--tv-text-strong, #111827)',
    textAlign: 'left',
    width: '100%',
    cursor: params.interactive ? 'pointer' : 'default',
    transition:
      'background-color 140ms ease, border-color 140ms ease, box-shadow 180ms ease, transform 140ms ease',
    boxShadow,
    transform,
    outline: 'none',
    minWidth: 0,
  };
}

