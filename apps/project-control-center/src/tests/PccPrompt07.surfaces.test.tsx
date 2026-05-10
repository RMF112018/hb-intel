import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { PccBentoGrid } from '../layout/PccBentoGrid';
import { PccTeamAccessSurface } from '../surfaces/teamAccess/PccTeamAccessSurface';
import { PccControlCenterSettingsSurface } from '../surfaces/controlCenterSettings/PccControlCenterSettingsSurface';
import { PccApprovalsSurface } from '../surfaces/approvals/PccApprovalsSurface';
import { PccProjectReadinessSurface } from '../surfaces/projectReadiness/PccProjectReadinessSurface';

// Phase 05 wave-b10 Prompt 04 — these legacy surfaces are no longer
// reachable as primary tabs (team-and-access / approvals / project-
// readiness are now modules under Core Tools / Startup & Closeout;
// control-center-settings is a module under Systems Administration).
// Their internal preview-marker invariants still belong to each
// surface component, so we render them directly inside <PccBentoGrid>
// and assert the same structural markers without requiring routing.

interface SurfaceCase {
  readonly label: string;
  readonly element: React.ReactElement;
  readonly previewMarker: string;
}

const SURFACE_CASES: readonly SurfaceCase[] = [
  {
    label: 'team-and-access',
    element: <PccTeamAccessSurface />,
    previewMarker: '[data-pcc-team-access-lane="access-manager"]',
  },
  {
    label: 'control-center-settings',
    element: <PccControlCenterSettingsSurface />,
    previewMarker: '[data-pcc-settings-scope-grid]',
  },
  {
    label: 'approvals',
    element: <PccApprovalsSurface />,
    previewMarker: '[data-pcc-approvals-lane="policy"]',
  },
  {
    label: 'project-readiness',
    element: <PccProjectReadinessSurface />,
    previewMarker: '[data-pcc-readiness-region]',
  },
];

describe('Prompt 07 routed surface invariants (rendered in isolation under Phase 05)', () => {
  for (const surface of SURFACE_CASES) {
    it(`renders '${surface.label}' surface preview marker inside <PccBentoGrid>`, () => {
      const { container } = render(
        <PccBentoGrid forceMode="desktop">{surface.element}</PccBentoGrid>,
      );
      const marker = container.querySelector(surface.previewMarker);
      expect(
        marker,
        `surface '${surface.label}' must contain marker '${surface.previewMarker}'`,
      ).not.toBeNull();
    });
  }
});
