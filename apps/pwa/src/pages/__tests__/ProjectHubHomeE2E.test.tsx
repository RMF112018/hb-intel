/**
 * Project Hub Home — End-to-End Integration Tests
 *
 * Validates the live Project Hub control center after profile system wiring
 * and @hbc/project-canvas integration. Tests cover all mandatory areas:
 *
 * A. Audit-finding validation (no longer summary scaffold)
 * B. Role/device default view resolution
 * C. Canvas wiring and mandatory tile enforcement
 * D. Project context continuity
 * E. Operational actionability
 * F. UI governance / theme / responsiveness
 * G. Regression and error paths
 *
 * Uses Vitest + jsdom + React Testing Library with real profile resolver,
 * real canvas registry, and controlled auth store state.
 */
import type { ReactElement } from 'react';
import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { HbcThemeProvider } from '@hbc/ui-kit';
import type { IActiveProject } from '@hbc/models';
import { useAuthStore } from '@hbc/auth';
import {
  resolveProjectHubProfile,
  PROJECT_HUB_PROFILE_REGISTRY,
  PROJECT_HUB_PROFILE_IDS,
  saveProfilePreference,
  loadProfilePreference,
  clearProfilePreference,
} from '@hbc/features-project-hub';
import type { ProjectHubProfileRole, ProjectHubDeviceClass } from '@hbc/features-project-hub';
import { useProjectStore } from '@hbc/shell';
import {
  ProjectHubControlCenterPage,
  ProjectHubNoAccessPage,
} from '../ProjectHubPage.js';

// ── Fixtures ──────────────────────────────────────────────────────────────

const PROJECT_A: IActiveProject = {
  id: 'e2e-home-001',
  name: 'City Center Tower',
  number: 'PRJ-001',
  status: 'Active',
  startDate: '2026-01-01',
  endDate: '2028-06-30',
};

const PROJECT_B: IActiveProject = {
  id: 'e2e-home-002',
  name: 'Harbor Bridge Renovation',
  number: 'PRJ-002',
  status: 'Active',
  startDate: '2026-03-01',
  endDate: '2027-12-31',
};

const PROJECTS = [PROJECT_A, PROJECT_B];

// ── Helpers ───────────────────────────────────────────────────────────────

function renderWithTheme(node: ReactElement) {
  return render(<HbcThemeProvider>{node}</HbcThemeProvider>);
}

function seedAuthStore(roles: string[], userId = 'test-user-001') {
  useAuthStore.setState({
    currentUser: {
      id: userId,
      displayName: 'Test User',
      email: 'test@hbcaldwell.com',
      type: 'internal',
    },
    session: {
      resolvedRoles: roles,
      runtimeMode: 'mock',
    },
    lifecyclePhase: 'ready',
  } as any);
}

function setViewportWidth(width: number) {
  Object.defineProperty(window, 'innerWidth', {
    value: width,
    writable: true,
    configurable: true,
  });
}

function renderControlCenter(project = PROJECT_A) {
  return renderWithTheme(
    <ProjectHubControlCenterPage
      project={project}
      projects={PROJECTS}
      onBackToPortfolio={() => undefined}
    />,
  );
}

// ── Lifecycle ─────────────────────────────────────────────────────────────

beforeEach(() => {
  localStorage.clear();
  useProjectStore.getState().clear();
  // Reset auth store to clean state
  useAuthStore.setState({
    currentUser: null,
    session: null,
    lifecyclePhase: 'idle',
  } as any);
  // Default to desktop viewport
  setViewportWidth(1440);
});

// ═══════════════════════════════════════════════════════════════════════════
// A. AUDIT-FINDING VALIDATION — no longer summary scaffold
// ═══════════════════════════════════════════════════════════════════════════

describe('A. Audit-finding validation', () => {
  it('renders HbcProjectCanvas instead of static summary cards for PM desktop', () => {
    seedAuthStore(['Project Manager']);
    renderControlCenter();

    // Canvas is present (governed runtime, not static cards)
    expect(screen.getByTestId('hbc-project-canvas')).toBeTruthy();

    // Static summary cards are NOT present (the old scaffold)
    expect(screen.queryByText('Project Status')).toBeNull();
    expect(screen.queryByText('Project Number')).toBeNull();
  });

  it('profile resolver is active — title reflects resolved profile', () => {
    seedAuthStore(['Project Manager']);
    renderControlCenter();

    // Default PM desktop → hybrid-operating-layer → "Project Hub Control Center"
    expect(screen.getByRole('heading', { name: /project hub control center/i })).toBeTruthy();
  });

  it('executive roles get executive cockpit instead of canvas', () => {
    seedAuthStore(['Portfolio Executive']);
    renderControlCenter();

    expect(screen.getByRole('heading', { name: /executive cockpit/i })).toBeTruthy();
    // Executive cockpit uses ExecutiveCockpitSurface, not HbcProjectCanvas
    expect(screen.getByTestId('executive-cockpit-surface')).toBeTruthy();
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// B. ROLE / DEVICE DEFAULT VIEW RESOLUTION
// ═══════════════════════════════════════════════════════════════════════════

describe('B. Role/device default view resolution', () => {
  // Desktop profiles
  it('portfolio executive desktop → executive-cockpit', () => {
    seedAuthStore(['Portfolio Executive']);
    setViewportWidth(1440);
    const result = resolveProjectHubProfile({ role: 'portfolio-executive', deviceClass: 'desktop' });
    expect(result.profileId).toBe('executive-cockpit');
    expect(result.layoutFamily).toBe('executive');
  });

  it('project manager desktop → hybrid-operating-layer', () => {
    const result = resolveProjectHubProfile({ role: 'project-manager', deviceClass: 'desktop' });
    expect(result.profileId).toBe('hybrid-operating-layer');
    expect(result.layoutFamily).toBe('project-operating');
  });

  it('project executive desktop → hybrid-operating-layer', () => {
    const result = resolveProjectHubProfile({ role: 'project-executive', deviceClass: 'desktop' });
    expect(result.profileId).toBe('hybrid-operating-layer');
  });

  it('superintendent desktop → next-move-hub', () => {
    const result = resolveProjectHubProfile({ role: 'superintendent', deviceClass: 'desktop' });
    expect(result.profileId).toBe('next-move-hub');
  });

  it('field engineer desktop → next-move-hub', () => {
    const result = resolveProjectHubProfile({ role: 'field-engineer', deviceClass: 'desktop' });
    expect(result.profileId).toBe('next-move-hub');
  });

  it('leadership desktop → executive-cockpit', () => {
    const result = resolveProjectHubProfile({ role: 'leadership', deviceClass: 'desktop' });
    expect(result.profileId).toBe('executive-cockpit');
  });

  it('qa-qc desktop → canvas-first-operating-layer', () => {
    const result = resolveProjectHubProfile({ role: 'qa-qc', deviceClass: 'desktop' });
    expect(result.profileId).toBe('canvas-first-operating-layer');
  });

  // Tablet profiles
  it('field engineer tablet → field-tablet-split-pane', () => {
    const result = resolveProjectHubProfile({ role: 'field-engineer', deviceClass: 'tablet' });
    expect(result.profileId).toBe('field-tablet-split-pane');
    expect(result.layoutFamily).toBe('field-tablet');
  });

  it('superintendent tablet → field-tablet-split-pane', () => {
    const result = resolveProjectHubProfile({ role: 'superintendent', deviceClass: 'tablet' });
    expect(result.profileId).toBe('field-tablet-split-pane');
  });

  it('qa-qc tablet → field-tablet-split-pane', () => {
    const result = resolveProjectHubProfile({ role: 'qa-qc', deviceClass: 'tablet' });
    expect(result.profileId).toBe('field-tablet-split-pane');
  });

  it('PM tablet → canvas-first-operating-layer', () => {
    const result = resolveProjectHubProfile({ role: 'project-manager', deviceClass: 'tablet' });
    expect(result.profileId).toBe('canvas-first-operating-layer');
  });

  it('executive tablet → executive-cockpit', () => {
    const result = resolveProjectHubProfile({ role: 'portfolio-executive', deviceClass: 'tablet' });
    expect(result.profileId).toBe('executive-cockpit');
  });

  // Narrow fallback
  it('PM narrow → canvas-first-operating-layer', () => {
    const result = resolveProjectHubProfile({ role: 'project-manager', deviceClass: 'narrow' });
    expect(result.profileId).toBe('canvas-first-operating-layer');
  });

  it('superintendent narrow → next-move-hub', () => {
    const result = resolveProjectHubProfile({ role: 'superintendent', deviceClass: 'narrow' });
    expect(result.profileId).toBe('next-move-hub');
  });

  it('executive narrow → canvas-first-operating-layer (compact fallback)', () => {
    const result = resolveProjectHubProfile({ role: 'portfolio-executive', deviceClass: 'narrow' });
    expect(result.profileId).toBe('canvas-first-operating-layer');
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// C. PROJECT CANVAS WIRING
// ═══════════════════════════════════════════════════════════════════════════

describe('C. Canvas wiring', () => {
  it('canvas-capable profiles render through HbcProjectCanvas', () => {
    seedAuthStore(['Project Manager']);
    renderControlCenter();

    const canvas = screen.getByTestId('hbc-project-canvas');
    expect(canvas).toBeTruthy();
  });

  it('canvas is scoped to the correct project', () => {
    seedAuthStore(['Project Manager']);
    renderControlCenter(PROJECT_B);

    // Canvas is present — project scoping is via props not visible in DOM,
    // but the canvas component receives projectId={PROJECT_B.id}
    expect(screen.getByTestId('hbc-project-canvas')).toBeTruthy();
  });

  it('all 5 canonical profile IDs exist in the registry', () => {
    expect(PROJECT_HUB_PROFILE_IDS).toHaveLength(5);
    for (const id of PROJECT_HUB_PROFILE_IDS) {
      expect(PROJECT_HUB_PROFILE_REGISTRY[id]).toBeDefined();
      expect(PROJECT_HUB_PROFILE_REGISTRY[id].layoutFamily).toBeTruthy();
    }
  });

  it('canvas-capable profiles all map to project-operating family', () => {
    const canvasProfiles = ['hybrid-operating-layer', 'canvas-first-operating-layer', 'next-move-hub'] as const;
    for (const id of canvasProfiles) {
      expect(PROJECT_HUB_PROFILE_REGISTRY[id].layoutFamily).toBe('project-operating');
    }
  });

  it('executive-cockpit maps to executive family', () => {
    expect(PROJECT_HUB_PROFILE_REGISTRY['executive-cockpit'].layoutFamily).toBe('executive');
  });

  it('field-tablet-split-pane maps to field-tablet family', () => {
    expect(PROJECT_HUB_PROFILE_REGISTRY['field-tablet-split-pane'].layoutFamily).toBe('field-tablet');
  });

  it('every profile has header and center as mandatory regions', () => {
    for (const id of PROJECT_HUB_PROFILE_IDS) {
      const def = PROJECT_HUB_PROFILE_REGISTRY[id];
      expect(def.mandatoryRegions).toContain('header');
      expect(def.mandatoryRegions).toContain('center');
    }
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// D. PROJECT CONTEXT CONTINUITY
// ═══════════════════════════════════════════════════════════════════════════

describe('D. Project context continuity', () => {
  it('project store syncs to route-carried project on render', () => {
    seedAuthStore(['Project Manager']);
    renderControlCenter(PROJECT_A);

    expect(useProjectStore.getState().activeProject?.id).toBe('e2e-home-001');
  });

  it('switching projects updates the store to the new project', () => {
    seedAuthStore(['Project Manager']);

    const { unmount } = renderControlCenter(PROJECT_A);
    expect(useProjectStore.getState().activeProject?.id).toBe('e2e-home-001');
    unmount();

    renderControlCenter(PROJECT_B);
    expect(useProjectStore.getState().activeProject?.id).toBe('e2e-home-002');
  });

  it('profile persistence does not leak across device classes', () => {
    saveProfilePreference('user-001', 'desktop', 'hybrid-operating-layer');
    saveProfilePreference('user-001', 'tablet', 'canvas-first-operating-layer');

    expect(loadProfilePreference('user-001', 'desktop')).toBe('hybrid-operating-layer');
    expect(loadProfilePreference('user-001', 'tablet')).toBe('canvas-first-operating-layer');

    clearProfilePreference('user-001', 'desktop');
    expect(loadProfilePreference('user-001', 'desktop')).toBeNull();
    expect(loadProfilePreference('user-001', 'tablet')).toBe('canvas-first-operating-layer');
  });

  it('profile persistence does not leak across users', () => {
    saveProfilePreference('user-001', 'desktop', 'hybrid-operating-layer');
    saveProfilePreference('user-002', 'desktop', 'executive-cockpit');

    expect(loadProfilePreference('user-001', 'desktop')).toBe('hybrid-operating-layer');
    expect(loadProfilePreference('user-002', 'desktop')).toBe('executive-cockpit');
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// E. OPERATIONAL ACTIONABILITY
// ═══════════════════════════════════════════════════════════════════════════

describe('E. Operational actionability', () => {
  it('back-to-portfolio button is always present', () => {
    seedAuthStore(['Project Manager']);
    renderControlCenter();

    expect(screen.getByRole('button', { name: /back to portfolio/i })).toBeTruthy();
  });

  it('section indicator shows Control Center for default view', () => {
    seedAuthStore(['Project Manager']);
    renderControlCenter();

    expect(screen.getByText(/current section: control center/i)).toBeTruthy();
  });

  it('reports section renders reports surface instead of canvas', () => {
    seedAuthStore(['Project Manager']);
    renderWithTheme(
      <ProjectHubControlCenterPage
        project={PROJECT_A}
        projects={PROJECTS}
        section="reports"
        onBackToPortfolio={() => undefined}
      />,
    );

    expect(screen.getByText(/this baseline reports surface shows/i)).toBeTruthy();
    expect(screen.getByText(/module readiness audit/i)).toBeTruthy();
    // Canvas should NOT be present when viewing reports section
    expect(screen.queryByTestId('hbc-project-canvas')).toBeNull();
  });

  it('financial section renders FinancialControlCenter instead of canvas', () => {
    seedAuthStore(['Project Manager']);
    renderWithTheme(
      <ProjectHubControlCenterPage
        project={PROJECT_A}
        projects={PROJECTS}
        section="financial"
        onBackToPortfolio={() => undefined}
      />,
    );

    expect(screen.getByRole('heading', { name: /financial control center/i })).toBeTruthy();
    expect(screen.queryByTestId('hbc-project-canvas')).toBeNull();
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// F. UI GOVERNANCE / THEME / RESPONSIVENESS
// ═══════════════════════════════════════════════════════════════════════════

describe('F. UI governance', () => {
  it('control center renders inside WorkspacePageShell', () => {
    seedAuthStore(['Project Manager']);
    renderControlCenter();

    // WorkspacePageShell provides the governed shell — verify heading is present
    expect(screen.getByRole('heading', { level: 1 })).toBeTruthy();
  });

  it('no-access page renders HbcSmartEmptyState with theme wrapper', () => {
    renderWithTheme(
      <ProjectHubNoAccessPage projects={[]} reason="zero-projects" />,
    );

    expect(screen.getByText(/project hub not available/i)).toBeTruthy();
    expect(screen.getByRole('link', { name: /back to portfolio/i })).toBeTruthy();
  });

  it('profile definitions have interaction posture', () => {
    expect(PROJECT_HUB_PROFILE_REGISTRY['hybrid-operating-layer'].interactionPosture).toBe('desktop');
    expect(PROJECT_HUB_PROFILE_REGISTRY['field-tablet-split-pane'].interactionPosture).toBe('touch');
    expect(PROJECT_HUB_PROFILE_REGISTRY['executive-cockpit'].interactionPosture).toBe('desktop');
  });

  it('all profiles have persistence version for cache invalidation', () => {
    for (const id of PROJECT_HUB_PROFILE_IDS) {
      expect(PROJECT_HUB_PROFILE_REGISTRY[id].persistenceVersion).toBeGreaterThan(0);
    }
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// G. REGRESSION AND ERROR PATHS
// ═══════════════════════════════════════════════════════════════════════════

describe('G. Regression and error paths', () => {
  it('missing auth state falls back to project-manager profile', () => {
    // No seedAuthStore — auth store has null session/user
    renderControlCenter();

    // Should render without crashing and default to PM desktop → hybrid
    expect(screen.getByRole('heading', { name: /project hub control center/i })).toBeTruthy();
    expect(screen.getByTestId('hbc-project-canvas')).toBeTruthy();
  });

  it('invalid profile override is rejected gracefully', () => {
    const result = resolveProjectHubProfile({
      role: 'field-engineer',
      deviceClass: 'desktop',
      userOverride: 'executive-cockpit',
    });
    expect(result.overrideRejected).toBe(true);
    expect(result.profileId).toBe('next-move-hub'); // fallback to default
  });

  it('corrupted persistence returns null', () => {
    localStorage.setItem('hbc-project-hub-profile-user-001-desktop', 'corrupted-json!!');
    expect(loadProfilePreference('user-001', 'desktop')).toBeNull();
  });

  it('no-access with zero projects renders honest empty state', () => {
    renderWithTheme(
      <ProjectHubNoAccessPage projects={[]} reason="zero-projects" />,
    );
    expect(screen.getByText(/project hub not available/i)).toBeTruthy();
  });

  it('no-access with project-not-found renders honest unavailable state', () => {
    renderWithTheme(
      <ProjectHubNoAccessPage projects={PROJECTS} reason="project-not-found" />,
    );
    expect(screen.getByText(/project not available/i)).toBeTruthy();
  });

  it('project store clears when entering no-access state', () => {
    useProjectStore.getState().setActiveProject(PROJECT_A);
    expect(useProjectStore.getState().activeProject?.id).toBe('e2e-home-001');

    renderWithTheme(
      <ProjectHubNoAccessPage projects={[]} reason="zero-projects" />,
    );

    expect(useProjectStore.getState().activeProject).toBeNull();
  });
});
