import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, waitFor } from '@testing-library/react';
import {
  SAMPLE_PROJECT_PROFILE,
  SAMPLE_TEAM_ACCESS_PREVIEW_MODEL,
  type PccReadModelEnvelope,
  type PccTeamAccessReadModel,
} from '@hbc/models/pcc';
import { PccBentoGrid } from '../../layout/PccBentoGrid';
import { PccTeamAccessReadModelContent } from './PccTeamAccessReadModelContent';
import type { IPccTeamAccessReadModelClient } from './useTeamAccessReadModel';

function availableEnvelope(): PccReadModelEnvelope<PccTeamAccessReadModel> {
  return {
    projectId: SAMPLE_PROJECT_PROFILE.projectId,
    mode: 'fixture',
    sourceStatus: 'available',
    readOnly: true,
    warnings: [],
    generatedAtUtc: '2026-04-30T00:00:00.000Z',
    data: { preview: SAMPLE_TEAM_ACCESS_PREVIEW_MODEL },
  };
}

function backendUnavailableEnvelope(): PccReadModelEnvelope<PccTeamAccessReadModel> {
  return {
    projectId: SAMPLE_PROJECT_PROFILE.projectId,
    mode: 'fixture',
    sourceStatus: 'backend-unavailable',
    readOnly: true,
    warnings: [{ code: 'backend-unavailable', message: 'simulated' }],
    generatedAtUtc: '2026-04-30T00:00:00.000Z',
    data: { preview: SAMPLE_TEAM_ACCESS_PREVIEW_MODEL },
  };
}

describe('PccTeamAccessReadModelContent — state-rendering coverage', () => {
  let fetchSpy: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    fetchSpy = vi.fn();
    vi.stubGlobal('fetch', fetchSpy);
  });

  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
  });

  it('renders the lane shell when the envelope is available', async () => {
    const client: IPccTeamAccessReadModelClient = {
      async getTeamAccess() {
        return availableEnvelope();
      },
    };
    const { container } = render(
      <PccBentoGrid>
        <PccTeamAccessReadModelContent client={client} />
      </PccBentoGrid>,
    );

    await waitFor(() => {
      expect(container.querySelector('[data-pcc-team-access-lane="team-viewer"]')).not.toBeNull();
    });
    // Wave 15A wave-b9 Prompt 04 — `PccTeamAccessHeaderCard` (the only
    // surface-isolation emitter of `data-pcc-active-surface-panel="team-
    // and-access"` on the read-model preview path) was removed; Team &
    // Access is uniformly shell-only across all branches. In surface-
    // isolation rendering the shell <main> is not mounted, so the marker
    // count is now 0.
    const panels = container.querySelectorAll('[data-pcc-active-surface-panel="team-and-access"]');
    expect(panels).toHaveLength(0);
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it('renders an error PccPreviewState card when the envelope is backend-unavailable', async () => {
    const client: IPccTeamAccessReadModelClient = {
      async getTeamAccess() {
        return backendUnavailableEnvelope();
      },
    };
    const { container } = render(
      <PccBentoGrid>
        <PccTeamAccessReadModelContent client={client} />
      </PccBentoGrid>,
    );

    await waitFor(() => {
      expect(container.querySelector('[data-pcc-state="error"]')).not.toBeNull();
    });
    const grid = container.querySelector('[data-pcc-bento-grid]');
    const errorCard = container
      .querySelector('[data-pcc-state="error"]')!
      .closest('[data-pcc-card]');
    expect(errorCard?.parentElement === grid).toBe(true);
    expect(container.querySelector('[data-pcc-team-access-lane]')).toBeNull();
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it('renders a loading PccPreviewState card when the envelope is pending', () => {
    const client: IPccTeamAccessReadModelClient = {
      getTeamAccess() {
        return new Promise<PccReadModelEnvelope<PccTeamAccessReadModel>>(() => {
          // never resolves — keeps the hook in `loading` state
        });
      },
    };
    const { container } = render(
      <PccBentoGrid>
        <PccTeamAccessReadModelContent client={client} />
      </PccBentoGrid>,
    );

    expect(container.querySelector('[data-pcc-state="loading"]')).not.toBeNull();
    const grid = container.querySelector('[data-pcc-bento-grid]');
    const loadingCard = container
      .querySelector('[data-pcc-state="loading"]')!
      .closest('[data-pcc-card]');
    expect(loadingCard?.parentElement === grid).toBe(true);
    expect(container.querySelector('[data-pcc-team-access-lane]')).toBeNull();
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it('renders an error card when the client rejects (no crash)', async () => {
    const client: IPccTeamAccessReadModelClient = {
      async getTeamAccess() {
        throw new Error('boom');
      },
    };
    const { container } = render(
      <PccBentoGrid>
        <PccTeamAccessReadModelContent client={client} />
      </PccBentoGrid>,
    );

    await waitFor(() => {
      expect(container.querySelector('[data-pcc-state="error"]')).not.toBeNull();
    });
    const grid = container.querySelector('[data-pcc-bento-grid]');
    const errorCard = container
      .querySelector('[data-pcc-state="error"]')!
      .closest('[data-pcc-card]');
    expect(errorCard?.parentElement === grid).toBe(true);
    expect(fetchSpy).not.toHaveBeenCalled();
  });
});
