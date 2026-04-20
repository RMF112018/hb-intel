/**
 * ProjectPortfolioSpotlight — runtime state matrix.
 *
 * Proves that the webpart consumer distinguishes the four governed
 * runtime postures (loading, fetch-error, authoring-invalid, empty)
 * in addition to the happy render path, so a data-fetch failure
 * never collapses silently into "no data configured" messaging.
 */
import * as React from 'react';
import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../../../homepage/data/useProjectSpotlightData.js', () => ({
  useProjectSpotlightData: vi.fn(),
}));

import { useProjectSpotlightData } from '../../../homepage/data/useProjectSpotlightData.js';
import { ProjectPortfolioSpotlight } from '../ProjectPortfolioSpotlight.js';
import type { ProjectPortfolioSpotlightConfig } from '../../../homepage/webparts/operationalAwarenessContracts.js';

const mockHook = vi.mocked(useProjectSpotlightData);

const WELL_FORMED_CONFIG: Partial<ProjectPortfolioSpotlightConfig> = {
  heading: 'Project Spotlight',
  items: [
    {
      id: 'p1',
      title: 'Palm Beach Medical Campus Expansion',
      summary: 'Structural turnover enters final phase.',
      sector: 'Healthcare',
      location: 'Palm Beach, FL',
      featured: true,
      order: 1,
      status: { label: 'On Track', variant: 'success' },
    },
  ],
};

describe('ProjectPortfolioSpotlight — runtime state matrix', () => {
  beforeEach(() => {
    mockHook.mockReset();
  });

  it('loading — renders the homepage loading state', () => {
    mockHook.mockReturnValue({
      listConfig: undefined,
      isLoading: true,
      error: undefined,
    });
    const { container } = render(<ProjectPortfolioSpotlight />);
    expect(container.querySelector('[data-hbc-homepage="loading-state"]')).not.toBeNull();
    expect(container.querySelector('[data-hbc-homepage="error-state"]')).toBeNull();
  });

  it('fetch error with no fallback — renders distinct error state (not empty)', () => {
    mockHook.mockReturnValue({
      listConfig: undefined,
      isLoading: false,
      error: 'HTTP 500: Internal Server Error',
    });
    const { container } = render(<ProjectPortfolioSpotlight />);
    const errorEl = container.querySelector('[data-hbc-homepage="error-state"]');
    expect(errorEl).not.toBeNull();
    expect(errorEl?.getAttribute('role')).toBe('alert');
    expect(errorEl?.getAttribute('aria-live')).toBe('assertive');
    expect(
      screen.getByText('Project spotlight is temporarily unavailable'),
    ).toBeTruthy();
    expect(screen.getByText('HTTP 500: Internal Server Error')).toBeTruthy();
    // Must NOT fall through to the neutral empty state.
    expect(container.querySelector('[data-hbc-homepage="empty-state"]')).toBeNull();
  });

  it('fetch error WITH valid prop fallback — gracefully degrades (renders surface, no error chrome)', () => {
    mockHook.mockReturnValue({
      listConfig: undefined,
      isLoading: false,
      error: 'Network unreachable',
    });
    const { container } = render(
      <ProjectPortfolioSpotlight config={WELL_FORMED_CONFIG} />,
    );
    expect(container.querySelector('[data-hbc-homepage="error-state"]')).toBeNull();
    expect(container.querySelector('[data-hbc-homepage="empty-state"]')).toBeNull();
    expect(
      screen.getByText('Palm Beach Medical Campus Expansion'),
    ).toBeTruthy();
  });

  it('authoring invalid — items present but no featured — renders empty state with invalid message', () => {
    mockHook.mockReturnValue({
      listConfig: undefined,
      isLoading: false,
      error: undefined,
    });
    const { container } = render(
      <ProjectPortfolioSpotlight
        config={{
          heading: 'Project Spotlight',
          items: [
            {
              id: 'bad',
              title: '',
              summary: '',
              order: 1,
            } as never,
          ],
        }}
      />,
    );
    const emptyEl = container.querySelector('[data-hbc-homepage="empty-state"]');
    expect(emptyEl).not.toBeNull();
    expect(container.querySelector('[data-hbc-homepage="error-state"]')).toBeNull();
  });

  it('empty — no config, no error — renders empty state with noData message', () => {
    mockHook.mockReturnValue({
      listConfig: undefined,
      isLoading: false,
      error: undefined,
    });
    const { container } = render(<ProjectPortfolioSpotlight />);
    const emptyEl = container.querySelector('[data-hbc-homepage="empty-state"]');
    expect(emptyEl).not.toBeNull();
    expect(
      screen.getByText('No project spotlight items available'),
    ).toBeTruthy();
    expect(container.querySelector('[data-hbc-homepage="error-state"]')).toBeNull();
  });

  it('happy — list-sourced featured item — renders the Spotlight surface', () => {
    mockHook.mockReturnValue({
      listConfig: WELL_FORMED_CONFIG,
      isLoading: false,
      error: undefined,
    });
    const { container } = render(<ProjectPortfolioSpotlight />);
    expect(
      container.querySelector('[data-hbc-presentation="project-spotlight-surface"]'),
    ).not.toBeNull();
    expect(container.querySelector('[data-hbc-homepage="loading-state"]')).toBeNull();
    expect(container.querySelector('[data-hbc-homepage="error-state"]')).toBeNull();
    expect(container.querySelector('[data-hbc-homepage="empty-state"]')).toBeNull();
    expect(
      screen.getAllByText('Palm Beach Medical Campus Expansion').length,
    ).toBeGreaterThan(0);
  });
});
