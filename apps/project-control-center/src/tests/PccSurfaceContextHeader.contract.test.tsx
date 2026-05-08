/**
 * PccSurfaceContextHeader contract — wave-b2 Prompt 03 posture.
 *
 * After Prompt 03 removed the duplicated `PccSurfaceContextHeader` from
 * happy-path surfaces, the header remains the canonical "data unavailable"
 * posture pillar in degraded states only. This contract test enforces:
 *
 *   1. Negative happy-path invariant: the header must NOT render on any of
 *      the eight MVP surfaces' happy-path tabs (the shell hero band carries
 *      surface identity / description; surfaces own only their domain
 *      content).
 *   2. Positive degraded-state assertions: project-readiness and approvals
 *      keep the header in their loading branches (driven via a
 *      never-resolving read-model client) — and in their error branches
 *      (driven via a rejecting client) — with all six standardized fields
 *      present. These are the surfaces whose read-model surface owns a
 *      degraded-state branch in current repo truth.
 */

import { describe, it, expect } from 'vitest';
import { fireEvent, render, waitFor } from '@testing-library/react';
import { PCC_MVP_SURFACE_IDS, type PccProjectId } from '@hbc/models/pcc';
import { PccApp } from '../PccApp';
import { PccBentoGrid } from '../layout/PccBentoGrid';
import { PccApprovalsSurface } from '../surfaces/approvals/PccApprovalsSurface';
import { PccProjectReadinessSurface } from '../surfaces/projectReadiness/PccProjectReadinessSurface';
import { createPccFixtureReadModelClient } from '../api/pccFixtureReadModelClient';
import type { IPccApprovalsReadModelClient } from '../surfaces/approvals/approvalsViewModel';

const NEVER_RESOLVES = <T,>(): Promise<T> => new Promise<T>(() => {});
const ALWAYS_REJECTS = <T,>(): Promise<T> => Promise.reject(new Error('test: forced rejection'));

const STUB_PROJECT_ID = 'fixture-pcc-project-001' as PccProjectId;

function expectStandardContextFields(context: Element): void {
  expect(context.querySelector('[data-pcc-context-project]')).not.toBeNull();
  expect(context.querySelector('[data-pcc-context-surface]')).not.toBeNull();
  expect(context.querySelector('[data-pcc-context-surface-description]')).not.toBeNull();
  expect(context.querySelector('[data-pcc-context-posture]')).not.toBeNull();
  expect(context.querySelector('[data-pcc-context-source-status]')).not.toBeNull();
  expect(context.querySelector('[data-pcc-context-source-confidence]')).not.toBeNull();
  expect(context.querySelector('[data-pcc-context-last-updated]')).not.toBeNull();
}

describe('PccSurfaceContextHeader contract — happy-path negative invariant', () => {
  for (const surfaceId of PCC_MVP_SURFACE_IDS) {
    it(`does NOT render PccSurfaceContextHeader on the '${surfaceId}' happy-path tab`, () => {
      const { container } = render(<PccApp forceMode="desktop" />);
      const tab = container.querySelector(`[data-pcc-tab-id="${surfaceId}"]`);
      expect(tab).not.toBeNull();
      fireEvent.click(tab!);

      // Wave 15A wave-b7 Prompt 01 — shell <main role="tabpanel"> is the
      // semantic active-panel owner; surface command cards may retain a
      // card-level compatibility marker. Scope ownership assertion to the
      // shell panel.
      const shellPanels = container.querySelectorAll(
        `main[role="tabpanel"][data-pcc-active-surface-panel="${surfaceId}"]`,
      );
      expect(shellPanels).toHaveLength(1);
      expect(shellPanels[0]?.getAttribute('data-pcc-active-surface-panel')).toBe(surfaceId);

      // Wave-b2 Prompt 03: PccSurfaceContextHeader is removed from happy-path.
      const context = container.querySelector(`[data-pcc-surface-context-id="${surfaceId}"]`);
      expect(
        context,
        `surface context header must not render on '${surfaceId}' happy-path`,
      ).toBeNull();
    });
  }
});

describe('PccSurfaceContextHeader contract — degraded-state retention', () => {
  it('renders on PccApprovalsSurface loading branch', () => {
    const loadingClient: IPccApprovalsReadModelClient = {
      getApprovals: () => NEVER_RESOLVES(),
    };
    const { container } = render(
      <PccBentoGrid forceMode="desktop">
        <PccApprovalsSurface readModelClient={loadingClient} projectId={STUB_PROJECT_ID} />
      </PccBentoGrid>,
    );
    const context = container.querySelector('[data-pcc-surface-context-id="approvals"]');
    expect(
      context,
      'surface context header must render in approvals loading branch',
    ).not.toBeNull();
    expectStandardContextFields(context!);
  });

  it('renders on PccApprovalsSurface error branch', async () => {
    const errorClient: IPccApprovalsReadModelClient = {
      getApprovals: () => ALWAYS_REJECTS(),
    };
    const { container } = render(
      <PccBentoGrid forceMode="desktop">
        <PccApprovalsSurface readModelClient={errorClient} projectId={STUB_PROJECT_ID} />
      </PccBentoGrid>,
    );
    await waitFor(() => {
      const context = container.querySelector('[data-pcc-surface-context-id="approvals"]');
      expect(
        context,
        'surface context header must render in approvals error branch',
      ).not.toBeNull();
      expectStandardContextFields(context!);
    });
  });

  it('renders on PccProjectReadinessSurface loading branch', () => {
    // Use the full fixture client (so wide-intersection methods like
    // getProcoreProjectMapping, getResponsibilityMatrix, etc. resolve normally
    // via prototype lookup) and override only getProjectReadiness to never
    // resolve. That keeps the primary readiness view-model in `loading` status,
    // which is the branch that renders PccSurfaceContextHeader.
    // Uses Object.create so class-prototype methods remain reachable; spread
    // would not copy prototype methods.
    const fixtureClient = createPccFixtureReadModelClient();
    const loadingClient = Object.create(fixtureClient);
    loadingClient.getProjectReadiness = () => NEVER_RESOLVES();
    const { container } = render(
      <PccBentoGrid forceMode="desktop">
        <PccProjectReadinessSurface readModelClient={loadingClient} />
      </PccBentoGrid>,
    );
    const context = container.querySelector('[data-pcc-surface-context-id="project-readiness"]');
    expect(
      context,
      'surface context header must render in project-readiness loading branch',
    ).not.toBeNull();
    expectStandardContextFields(context!);
  });

  it('renders on PccProjectReadinessSurface error branch', async () => {
    const fixtureClient = createPccFixtureReadModelClient();
    const errorClient = Object.create(fixtureClient);
    errorClient.getProjectReadiness = () => ALWAYS_REJECTS();
    const { container } = render(
      <PccBentoGrid forceMode="desktop">
        <PccProjectReadinessSurface readModelClient={errorClient} />
      </PccBentoGrid>,
    );
    await waitFor(() => {
      const context = container.querySelector('[data-pcc-surface-context-id="project-readiness"]');
      expect(
        context,
        'surface context header must render in project-readiness error branch',
      ).not.toBeNull();
      expectStandardContextFields(context!);
    });
  });
});
