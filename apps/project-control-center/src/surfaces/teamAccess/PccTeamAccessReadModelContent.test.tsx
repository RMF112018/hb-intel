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

  it('renders preview marker and lane shell when the envelope is available', async () => {
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
      const marker = container.querySelector('[data-pcc-team-access-read-model-content]');
      expect(marker?.getAttribute('data-pcc-team-access-read-model-content')).toBe('preview');
    });
    expect(
      container.querySelector('[data-pcc-team-access-lane="team-viewer"]'),
    ).not.toBeNull();
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it('renders error marker and PccPreviewState when the envelope is backend-unavailable', async () => {
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
      const marker = container.querySelector('[data-pcc-team-access-read-model-content]');
      expect(marker?.getAttribute('data-pcc-team-access-read-model-content')).toBe('error');
    });
    expect(container.querySelector('[data-pcc-state="error"]')).not.toBeNull();
    expect(container.querySelector('[data-pcc-team-access-lane]')).toBeNull();
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it('renders loading marker and loading PccPreviewState when the envelope is pending', () => {
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

    const marker = container.querySelector('[data-pcc-team-access-read-model-content]');
    expect(marker?.getAttribute('data-pcc-team-access-read-model-content')).toBe('loading');
    expect(container.querySelector('[data-pcc-state="loading"]')).not.toBeNull();
    expect(container.querySelector('[data-pcc-team-access-lane]')).toBeNull();
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it('renders error marker when the client rejects (no crash)', async () => {
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
      const marker = container.querySelector('[data-pcc-team-access-read-model-content]');
      expect(marker?.getAttribute('data-pcc-team-access-read-model-content')).toBe('error');
    });
    expect(container.querySelector('[data-pcc-state="error"]')).not.toBeNull();
    expect(fetchSpy).not.toHaveBeenCalled();
  });
});
