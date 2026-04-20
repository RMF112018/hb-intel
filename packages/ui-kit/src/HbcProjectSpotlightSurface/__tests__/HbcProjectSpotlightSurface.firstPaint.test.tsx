/**
 * HbcProjectSpotlightSurface — first-paint mode stability.
 *
 * Pins the Phase 02 Prompt 04 invariant: a Spotlight render with no
 * `forceMode` override must not commit `'wide'` as its initial mode.
 * The hook defaults to the most selective mode (`'minimal'`) and then
 * upgrades synchronously from the first `getBoundingClientRect` read,
 * so narrow containers never emit a visible false-wide first paint.
 */
import * as React from 'react';
import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import {
  HbcProjectSpotlightSurface,
  type ProjectSpotlightSurfaceModel,
} from '../index.js';

const MODEL: ProjectSpotlightSurfaceModel = {
  heading: 'Project Spotlight',
  featured: {
    id: 'featured',
    title: 'Palm Beach Medical Campus Expansion',
    summary: 'Structural turnover enters final phase.',
    status: { label: 'On Track', variant: 'success' },
    milestones: [],
    teamMembers: [],
    completeness: 'full',
  },
  secondary: [],
};

describe('HbcProjectSpotlightSurface — first-paint mode stability', () => {
  it('does not commit a wide posture on the first paint when no mode is forced', () => {
    const { container } = render(<HbcProjectSpotlightSurface model={MODEL} />);
    const root = container.querySelector(
      '[data-hbc-presentation="project-spotlight-surface"]',
    );
    expect(root).not.toBeNull();
    const mode = root?.getAttribute('data-layout-mode');
    // jsdom reports 0×0 for getBoundingClientRect, which resolves to
    // 'minimal'. The critical invariant is that the first commit is
    // not 'wide' — a safer default is acceptable, a false-wide is not.
    expect(mode).not.toBe('wide');
    expect(mode).toBe('minimal');
  });

  it('honors an explicit forceMode override on first paint', () => {
    const { container } = render(
      <HbcProjectSpotlightSurface model={MODEL} forceMode="wide" />,
    );
    const root = container.querySelector(
      '[data-hbc-presentation="project-spotlight-surface"]',
    );
    expect(root?.getAttribute('data-layout-mode')).toBe('wide');
  });
});
