/**
 * Team & Access — lane footprint, in-card hierarchy, disabled-affordance
 * integration, and bento direct-child invariants. Per-component scoped
 * (feedback_per_component_marker_scoping). No card-in-card patterns.
 */

import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, render } from '@testing-library/react';
import { PccBentoGrid } from '../layout/PccBentoGrid';
import { PccTeamAccessSurface } from '../surfaces/teamAccess/PccTeamAccessSurface';

afterEach(() => {
  cleanup();
});

function renderAccessManagerSurface() {
  return render(
    <PccBentoGrid forceMode="wideDesktop">
      <PccTeamAccessSurface previewPersona="project-manager" previewHasProjectSiteAccess={true} />
    </PccBentoGrid>,
  );
}

function findCardForLane(container: HTMLElement, laneId: string): HTMLElement {
  const lane = container.querySelector(`[data-pcc-team-access-lane="${laneId}"]`);
  expect(lane, `lane '${laneId}' should render`).not.toBeNull();
  const card = lane!.closest('[data-pcc-card]');
  expect(card, `lane '${laneId}' should be wrapped in a PccDashboardCard`).not.toBeNull();
  return card as HTMLElement;
}

describe('Team & Access — lane footprints + bento direct-child invariants', () => {
  it('Team Viewer, Permission Request, and Access Manager lanes are direct bento grid children with the expected footprints', () => {
    const { container } = renderAccessManagerSurface();
    const grid = container.querySelector('[data-pcc-bento-grid]');
    expect(grid, 'bento grid should render').not.toBeNull();

    const teamViewerCard = findCardForLane(container as HTMLElement, 'team-viewer');
    expect(teamViewerCard.parentElement === grid).toBe(true);
    expect(teamViewerCard.getAttribute('data-pcc-footprint')).toBe('wide');

    const permissionRequestCard = findCardForLane(container as HTMLElement, 'permission-request');
    expect(permissionRequestCard.parentElement === grid).toBe(true);
    expect(permissionRequestCard.getAttribute('data-pcc-footprint')).toBe('wide');

    const accessManagerCard = findCardForLane(container as HTMLElement, 'access-manager');
    expect(accessManagerCard.parentElement === grid).toBe(true);
    expect(accessManagerCard.getAttribute('data-pcc-footprint')).toBe('full');
  });

  it('exactly one [data-pcc-active-surface-panel="team-and-access"] exists (active-panel ownership preserved)', () => {
    const { container } = renderAccessManagerSurface();
    const panels = container.querySelectorAll('[data-pcc-active-surface-panel]');
    expect(panels).toHaveLength(1);
    expect(panels[0].getAttribute('data-pcc-active-surface-panel')).toBe('team-and-access');
  });

  it('no Team & Access lane card is nested inside another card (no card-in-card)', () => {
    const { container } = renderAccessManagerSurface();
    for (const laneId of ['team-viewer', 'permission-request', 'access-manager']) {
      const lane = container.querySelector(`[data-pcc-team-access-lane="${laneId}"]`);
      expect(lane, `lane '${laneId}' should render`).not.toBeNull();
      const card = lane!.closest('[data-pcc-card]');
      expect(card).not.toBeNull();
      const outerCard = card?.parentElement?.closest('[data-pcc-card]');
      expect(outerCard, `lane '${laneId}' must not be nested inside another card`).toBeNull();
    }
  });
});

describe('Team & Access — Permission Request lane has explicit in-card hierarchy', () => {
  it('renders dedicated lane sections for request, templates, and queue', () => {
    const { container } = renderAccessManagerSurface();
    const lane = container.querySelector('[data-pcc-team-access-lane="permission-request"]');
    expect(lane).not.toBeNull();

    expect(lane!.querySelector('[data-pcc-lane-section="request-form"]')).not.toBeNull();
    expect(lane!.querySelector('[data-pcc-lane-section="permission-templates"]')).not.toBeNull();
    expect(lane!.querySelector('[data-pcc-lane-section="request-queue"]')).not.toBeNull();
  });
});

describe('Team & Access — Access Manager lane in-card hierarchy + disabled-affordance contract', () => {
  it('renders dedicated lane sections for actions, execution status, execution queue, and templates', () => {
    const { container } = renderAccessManagerSurface();
    const lane = container.querySelector('[data-pcc-team-access-lane="access-manager"]');
    expect(lane).not.toBeNull();

    expect(lane!.querySelector('[data-pcc-lane-section="access-manager-actions"]')).not.toBeNull();
    expect(lane!.querySelector('[data-pcc-lane-section="execution-status"]')).not.toBeNull();
    expect(lane!.querySelector('[data-pcc-lane-section="execution-queue"]')).not.toBeNull();
    expect(lane!.querySelector('[data-pcc-lane-section="permission-templates"]')).not.toBeNull();
  });

  it('renders the three access-manager actions through PccDisabledAffordance with paired reason captions', () => {
    const { container } = renderAccessManagerSurface();
    const lane = container.querySelector('[data-pcc-team-access-lane="access-manager"]');
    expect(lane).not.toBeNull();

    const list = lane!.querySelector('[data-pcc-access-manager-action-list]');
    expect(list, 'access-manager action list should render').not.toBeNull();

    const buttons = list!.querySelectorAll('[data-pcc-disabled-affordance-variant]');
    expect(buttons.length).toBe(3);

    for (const button of Array.from(buttons)) {
      expect(button.getAttribute('aria-disabled')).toBe('true');
      const describedBy = button.getAttribute('aria-describedby') ?? '';
      const firstId = describedBy.split(' ')[0];
      const reasonNode = list!.querySelector(`#${CSS.escape(firstId)}`);
      expect(reasonNode, 'aria-describedby must resolve to a reason node').not.toBeNull();
      expect((reasonNode!.textContent ?? '').length).toBeGreaterThan(0);
    }
  });

  it('the access-manager action list is a direct child of the access-manager lane card (no nested card)', () => {
    const { container } = renderAccessManagerSurface();
    const list = container.querySelector('[data-pcc-access-manager-action-list]');
    expect(list).not.toBeNull();
    const innerCard = list!.parentElement?.closest('[data-pcc-card]');
    const laneCard = container
      .querySelector('[data-pcc-team-access-lane="access-manager"]')
      ?.closest('[data-pcc-card]');
    expect(innerCard).toBe(laneCard);
  });
});
