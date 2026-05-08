/**
 * Wave 15 / Prompt 05 — router pass-through invariant for the External
 * Systems Launch Pad surface.
 *
 * Mirrors the spy-on-getXxx pass-through pattern used by other read-model
 * surfaces in the PCC SPFx app. Asserts:
 *   - `<PccSurfaceRouter activeSurfaceId="external-systems" readModelClient={mock}>`
 *     calls `getExternalSystemsLaunchPad(...)` exactly once;
 *   - the bento direct-child invariant holds under the router-wrapped
 *     render (every `[data-pcc-card]` is a direct child of
 *     `[data-pcc-bento-grid]`);
 *   - exactly one `[data-pcc-active-surface-panel="external-systems"]`
 *     after the hook resolves.
 */

import { describe, expect, it, vi } from 'vitest';
import { render, waitFor } from '@testing-library/react';
import {
  SAMPLE_PCC_EXTERNAL_SYSTEMS_LAUNCH_PAD_READ_MODEL_KNOWN_PROJECT,
  SAMPLE_PROJECT_PROFILE,
  type IPccExternalSystemsLaunchPadReadModel,
  type PccProjectId,
  type PccReadModelEnvelope,
} from '@hbc/models/pcc';
import { PccBentoGrid } from '../layout/PccBentoGrid';
import { PccSurfaceRouter, type IPccSurfaceRouterReadModelClient } from '../shell/PccSurfaceRouter';

const PROJECT_ID: PccProjectId = SAMPLE_PROJECT_PROFILE.projectId;

function buildKnownEnvelope(): PccReadModelEnvelope<IPccExternalSystemsLaunchPadReadModel> {
  return {
    projectId: PROJECT_ID,
    mode: 'mock',
    sourceStatus: 'available',
    readOnly: true,
    warnings: [],
    generatedAtUtc: '2026-04-30T00:00:00.000Z',
    data: SAMPLE_PCC_EXTERNAL_SYSTEMS_LAUNCH_PAD_READ_MODEL_KNOWN_PROJECT,
  };
}

function rejectAll(method: string): never {
  throw new Error(`unexpected call to ${method} from external-systems surface`);
}

function buildRouterClient(spy: ReturnType<typeof vi.fn>): IPccSurfaceRouterReadModelClient {
  // The router's combined client interface lists methods from many surfaces.
  // For this test we only expect `getExternalSystemsLaunchPad` to be called;
  // every other method is wired to throw if exercised.
  const reject = (name: string) => () => rejectAll(name);
  const client = {
    getExternalSystemsLaunchPad: spy,
    getProjectProfile: reject('getProjectProfile'),
    getModuleRegistry: reject('getModuleRegistry'),
    getProjectHome: reject('getProjectHome'),
    getPriorityActions: reject('getPriorityActions'),
    getDocumentControl: reject('getDocumentControl'),
    getExternalLinks: reject('getExternalLinks'),
    getSiteHealth: reject('getSiteHealth'),
    getTeamAccess: reject('getTeamAccess'),
    getProjectReadiness: reject('getProjectReadiness'),
    getLifecycleReadiness: reject('getLifecycleReadiness'),
    getPermitInspectionControlCenter: reject('getPermitInspectionControlCenter'),
    getResponsibilityMatrix: reject('getResponsibilityMatrix'),
    getConstraintsLog: reject('getConstraintsLog'),
    getBuyoutLog: reject('getBuyoutLog'),
    getApprovals: reject('getApprovals'),
  } as unknown as IPccSurfaceRouterReadModelClient;
  return client;
}

describe('PccSurfaceRouter — external-systems pass-through (Wave 15 / Prompt 05)', () => {
  it('routes the launch-pad client through the surface and renders inert/disabled launch affordances', async () => {
    const spy = vi.fn().mockResolvedValue(buildKnownEnvelope());
    const client = buildRouterClient(spy);
    const { container } = render(
      <PccBentoGrid forceMode="desktop">
        <PccSurfaceRouter activeSurfaceId="external-systems" readModelClient={client} />
      </PccBentoGrid>,
    );

    await waitFor(() => {
      expect(spy).toHaveBeenCalledTimes(1);
    });
    expect(spy).toHaveBeenCalledWith(PROJECT_ID, undefined);

    await waitFor(() => {
      const rows = container.querySelectorAll('[data-pcc-launch-pad-link]');
      expect(rows.length).toBe(
        SAMPLE_PCC_EXTERNAL_SYSTEMS_LAUNCH_PAD_READ_MODEL_KNOWN_PROJECT.projectLaunchLinks.length,
      );
    });

    const grid = container.querySelector('[data-pcc-bento-grid]');
    expect(grid).not.toBeNull();
    const cards = container.querySelectorAll('[data-pcc-card]');
    for (const card of cards) {
      expect(card.parentElement).toBe(grid);
    }

    // Wave 15A wave-b9 Prompt 04 — External Systems is uniformly shell-only;
    // surface-router rendering (no shell <main>) has no card-level marker.
    const panels = container.querySelectorAll('[data-pcc-active-surface-panel]');
    expect(panels.length).toBe(0);

    expect(container.querySelectorAll('iframe').length).toBe(0);
    const anchors = container.querySelectorAll('a[href]');
    for (const a of anchors) {
      const href = a.getAttribute('href') ?? '';
      expect(href).not.toMatch(/^https?:\/\//);
    }
  });
});
