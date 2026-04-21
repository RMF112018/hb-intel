/**
 * HbcProjectSpotlightSurface — team-panel posture stability.
 *
 * Pins the Phase 02 Prompt 01 invariant: the team detail panel's
 * anchored-vs-sheet posture must track the resolved Spotlight layout
 * mode, not viewport media queries. Anchored popover in wide/medium,
 * bottom sheet in compact/minimal — regardless of what the browser
 * viewport happens to be.
 */
import * as React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import {
  HbcProjectSpotlightSurface,
  type ProjectSpotlightSurfaceModel,
  type SpotlightLayoutMode,
} from '../index.js';
import { resolveTeamPanelPosture } from '../TeamStrip.js';

const MODEL: ProjectSpotlightSurfaceModel = {
  heading: 'Project Spotlight',
  featured: {
    id: 'featured',
    title: 'Palm Beach Medical Campus Expansion',
    summary: 'Structural turnover enters final phase.',
    status: { label: 'On Track', variant: 'success' },
    image: {
      src: 'https://cdn.example.invalid/projects/palm-beach.jpg',
      alt: 'Palm Beach aerial',
    },
    milestones: [],
    teamMembers: [
      { id: 't1', displayName: 'Jane Smith', role: 'PM' },
      { id: 't2', displayName: 'Mike Torres', role: 'Superintendent' },
    ],
    completeness: 'full',
  },
  secondary: [],
};

function openTeamPanel(container: HTMLElement): void {
  const trigger = container.querySelector(
    '[data-hbc-homepage="team-strip"] button',
  ) as HTMLButtonElement | null;
  if (!trigger) throw new Error('team-strip trigger not found');
  fireEvent.click(trigger);
}

describe('HbcProjectSpotlightSurface — team panel posture', () => {
  it('resolves posture from mode, not viewport', () => {
    expect(resolveTeamPanelPosture('wide')).toBe('anchored');
    expect(resolveTeamPanelPosture('medium')).toBe('anchored');
    expect(resolveTeamPanelPosture('compact')).toBe('sheet');
    expect(resolveTeamPanelPosture('minimal')).toBe('sheet');
  });

  const cases: Array<{ mode: SpotlightLayoutMode; expected: 'anchored' | 'sheet' }> = [
    { mode: 'wide', expected: 'anchored' },
    { mode: 'medium', expected: 'anchored' },
    { mode: 'compact', expected: 'sheet' },
    { mode: 'minimal', expected: 'sheet' },
  ];

  for (const { mode, expected } of cases) {
    it(`stamps data-panel-posture="${expected}" on open in ${mode} mode`, () => {
      const { container } = render(
        <HbcProjectSpotlightSurface model={MODEL} forceMode={mode} />,
      );
      // Details disclosure is closed in compact/minimal by default —
      // open it first so the team trigger renders.
      const detailsBtn = container.querySelector(
        'button[aria-controls][aria-expanded="false"]',
      ) as HTMLButtonElement | null;
      if (detailsBtn && /spotlight details/i.test(detailsBtn.textContent ?? '')) {
        fireEvent.click(detailsBtn);
      }
      // Minimal suppresses the team strip entirely (matrix rule);
      // skip the posture check in that case but keep the resolver
      // assertion above to prove the logic still covers it.
      const teamStripHost = container.querySelector(
        '[data-hbc-homepage="team-strip"]',
      );
      if (!teamStripHost) {
        expect(mode).toBe('minimal');
        return;
      }
      openTeamPanel(container);
      const panel = screen.getByRole('dialog', { name: 'Project team members' });
      expect(panel.getAttribute('data-panel-posture')).toBe(expected);
      const backdrop = container.querySelector(
        '[data-panel-posture][aria-hidden="true"]',
      );
      expect(backdrop?.getAttribute('data-panel-posture')).toBe(expected);
    });
  }

  it('preserves keyboard dismiss + focus return in either posture', () => {
    const { container } = render(
      <HbcProjectSpotlightSurface model={MODEL} forceMode="compact" />,
    );
    // Expand details so the team trigger is mounted.
    const detailsBtn = container.querySelector(
      'button[aria-controls][aria-expanded="false"]',
    ) as HTMLButtonElement;
    fireEvent.click(detailsBtn);

    const trigger = container.querySelector(
      '[data-hbc-homepage="team-strip"] button',
    ) as HTMLButtonElement;
    trigger.focus();
    fireEvent.click(trigger);
    expect(screen.getByRole('dialog', { name: 'Project team members' })).toBeTruthy();

    fireEvent.keyDown(document, { key: 'Escape' });
    expect(
      screen.queryByRole('dialog', { name: 'Project team members' }),
    ).toBeNull();
    expect(document.activeElement).toBe(trigger);
  });
});
