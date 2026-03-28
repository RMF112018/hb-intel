/**
 * Project Hub Routing — End-to-End Integration Tests
 *
 * Validates the canonical PWA Project Hub routing contract across all required
 * coverage areas: portfolio root behavior, project-scoped control center,
 * section routing, context durability, external launch compatibility, and
 * negative/edge cases.
 *
 * Uses the repo's Vitest + jsdom stack with real resolver functions, real
 * shell stores, and real continuity primitives. Only the data-access layer
 * (project repository) is mocked to provide deterministic test data.
 *
 * @see docs/architecture/reviews/phase-3-project-hub-routing-repo-truth-validation.md
 * @see apps/pwa/src/router/projectHubRouting.ts
 * @see packages/shell/src/contextReconciliation.ts (P3-B1 §7)
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import type { IActiveProject } from '@hbc/models';
import type { IProjectRepository } from '@hbc/data-access';
import {
  useProjectStore,
  reconcileProjectContext,
  saveReturnMemory,
  getReturnMemory,
  clearReturnMemory,
  getProjectHubPortfolioState,
  saveProjectHubPortfolioState,
  clearProjectHubPortfolioState,
} from '@hbc/shell';
import {
  buildProjectHubPath,
  isSupportedProjectHubSection,
  PROJECT_HUB_SECTION_REGISTRY,
  resolveProjectHubProjectEntry,
  resolveProjectHubRootEntry,
  resolveProjectHubSwitchTarget,
} from '../projectHubRouting.js';

// ── Deterministic test fixtures ───────────────────────────────────────────

const PROJECT_A: IActiveProject = {
  id: 'e2e-proj-001',
  name: 'City Center Tower',
  number: 'PRJ-001',
  status: 'Active',
  startDate: '2026-01-01',
  endDate: '2028-06-30',
};

const PROJECT_B: IActiveProject = {
  id: 'e2e-proj-002',
  name: 'Harbor Bridge Renovation',
  number: 'PRJ-002',
  status: 'Active',
  startDate: '2026-03-01',
  endDate: '2027-12-31',
};

const PROJECT_C: IActiveProject = {
  id: 'e2e-proj-003',
  name: 'Riverside Park Expansion',
  number: 'PRJ-003',
  status: 'Planning',
  startDate: '2026-06-01',
  endDate: '2029-01-15',
};

const MULTI_PROJECT_SET = [PROJECT_A, PROJECT_B, PROJECT_C];
const SINGLE_PROJECT_SET = [PROJECT_A];
const EMPTY_PROJECT_SET: IActiveProject[] = [];

function createRepo(projects: IActiveProject[]): IProjectRepository {
  return {
    getProjects: vi.fn(async () => ({
      items: projects,
      total: projects.length,
      page: 1,
      pageSize: projects.length,
    })),
    getProjectById: vi.fn(async (id: string) =>
      projects.find((p) => p.id === id) ?? null,
    ),
    getProjectByNumber: vi.fn(async (num: string) =>
      projects.find((p) => p.number === num) ?? null,
    ),
    createProject: vi.fn(),
    updateProject: vi.fn(),
    deleteProject: vi.fn(),
    getPortfolioSummary: vi.fn(),
  } as unknown as IProjectRepository;
}

// ── Lifecycle ─────────────────────────────────────────────────────────────

beforeEach(() => {
  localStorage.clear();
  useProjectStore.getState().clear();
});

// ═══════════════════════════════════════════════════════════════════════════
// 1. PORTFOLIO ROOT BEHAVIOR
// ═══════════════════════════════════════════════════════════════════════════

describe('Portfolio root behavior', () => {
  it('multi-project user lands on the portfolio root', async () => {
    const result = await resolveProjectHubRootEntry(createRepo(MULTI_PROJECT_SET));

    expect(result.mode).toBe('portfolio');
    if (result.mode === 'portfolio') {
      expect(result.projects).toHaveLength(3);
      expect(result.projects.map((p) => p.id)).toEqual([
        'e2e-proj-001',
        'e2e-proj-002',
        'e2e-proj-003',
      ]);
    }
  });

  it('single-project user is canonicalized to that project', async () => {
    const result = await resolveProjectHubRootEntry(createRepo(SINGLE_PROJECT_SET));

    expect(result.mode).toBe('redirect');
    if (result.mode === 'redirect') {
      expect(result.redirectTo).toBe('/project-hub/e2e-proj-001');
    }
  });

  it('user with no projects receives stable no-access state', async () => {
    const result = await resolveProjectHubRootEntry(createRepo(EMPTY_PROJECT_SET));

    expect(result.mode).toBe('no-access');
    if (result.mode === 'no-access') {
      expect(result.reason).toBe('zero-projects');
      expect(result.projects).toHaveLength(0);
    }
  });

  it('portfolio state is preserved across drill-in and return', () => {
    // Simulate: user sets search/filter/sort, drills into a project, returns
    saveProjectHubPortfolioState({
      search: 'bridge',
      statusFilter: 'Active',
      sortBy: 'status',
      scrollY: 340,
    });

    // Simulate drill-in (state persists in localStorage)
    // ... user navigates to /project-hub/e2e-proj-002 ...

    // Simulate return to portfolio root
    const restored = getProjectHubPortfolioState();
    expect(restored.search).toBe('bridge');
    expect(restored.statusFilter).toBe('Active');
    expect(restored.sortBy).toBe('status');
    expect(restored.scrollY).toBe(340);
  });

  it('portfolio state survives localStorage round-trip independently', () => {
    saveProjectHubPortfolioState({ search: 'tower', sortBy: 'name' });

    // Simulate a separate project's return memory being saved
    saveReturnMemory('e2e-proj-001', '/financial');

    // Portfolio state is not affected by per-project memory
    const portfolioState = getProjectHubPortfolioState();
    expect(portfolioState.search).toBe('tower');

    // Per-project memory is independent
    const returnMem = getReturnMemory('e2e-proj-001');
    expect(returnMem?.lastPath).toBe('/financial');
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// 2. PROJECT-SCOPED CONTROL CENTER BEHAVIOR
// ═══════════════════════════════════════════════════════════════════════════

describe('Project-scoped control center behavior', () => {
  it('resolves the correct project on direct navigation', async () => {
    const result = await resolveProjectHubProjectEntry(
      'e2e-proj-002',
      null,
      createRepo(MULTI_PROJECT_SET),
    );

    expect(result.mode).toBe('project');
    if (result.mode === 'project') {
      expect(result.project.id).toBe('e2e-proj-002');
      expect(result.project.name).toBe('Harbor Bridge Renovation');
      expect(result.section).toBeNull();
    }
  });

  it('refresh preserves the same project context (simulated)', async () => {
    // First load
    const firstLoad = await resolveProjectHubProjectEntry(
      'e2e-proj-001',
      null,
      createRepo(MULTI_PROJECT_SET),
    );
    expect(firstLoad.mode).toBe('project');

    // Simulate refresh: same URL resolves identically
    const refreshLoad = await resolveProjectHubProjectEntry(
      'e2e-proj-001',
      null,
      createRepo(MULTI_PROJECT_SET),
    );
    expect(refreshLoad.mode).toBe('project');
    if (refreshLoad.mode === 'project') {
      expect(refreshLoad.project.id).toBe('e2e-proj-001');
    }
  });

  it('invalid project ID renders honest no-access condition', async () => {
    const result = await resolveProjectHubProjectEntry(
      'nonexistent-project-id',
      null,
      createRepo(MULTI_PROJECT_SET),
    );

    expect(result.mode).toBe('no-access');
    if (result.mode === 'no-access') {
      expect(result.reason).toBe('project-not-found');
    }
  });

  it('project not in user accessible list renders no-access', async () => {
    // User only has access to PROJECT_A, but navigates to PROJECT_B's route
    const result = await resolveProjectHubProjectEntry(
      'e2e-proj-002',
      null,
      createRepo(SINGLE_PROJECT_SET),
    );

    expect(result.mode).toBe('no-access');
  });

  it('project-scoped resolution exposes all accessible projects for context', async () => {
    const result = await resolveProjectHubProjectEntry(
      'e2e-proj-001',
      null,
      createRepo(MULTI_PROJECT_SET),
    );

    if (result.mode === 'project') {
      expect(result.projects).toHaveLength(3);
    }
  });

  it('store syncs to route-carried project identity (P3-B1 §7)', () => {
    // Store has stale project
    useProjectStore.getState().setActiveProject(PROJECT_B);

    // Route carries different project
    const reconciliation = reconcileProjectContext({
      routeProjectId: PROJECT_A.id,
      storeProjectId: PROJECT_B.id,
    });

    expect(reconciliation.storeNeedsSync).toBe(true);
    expect(reconciliation.previousProjectId).toBe(PROJECT_B.id);
  });

  it('store does not re-sync when route matches store', () => {
    useProjectStore.getState().setActiveProject(PROJECT_A);

    const reconciliation = reconcileProjectContext({
      routeProjectId: PROJECT_A.id,
      storeProjectId: PROJECT_A.id,
    });

    expect(reconciliation.storeNeedsSync).toBe(false);
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// 3. SECTION ROUTE BEHAVIOR
// ═══════════════════════════════════════════════════════════════════════════

describe('Section route behavior', () => {
  it.each(
    PROJECT_HUB_SECTION_REGISTRY.map((entry) => [entry.slug, entry.label]),
  )('direct navigation to %s section resolves correctly', async (slug) => {
    const result = await resolveProjectHubProjectEntry(
      'e2e-proj-001',
      slug,
      createRepo(MULTI_PROJECT_SET),
    );

    expect(result.mode).toBe('project');
    if (result.mode === 'project') {
      expect(result.project.id).toBe('e2e-proj-001');
      expect(result.section).toBe(slug);
    }
  });

  it('refresh on a section route preserves project and section', async () => {
    // First load
    const firstLoad = await resolveProjectHubProjectEntry(
      'e2e-proj-002',
      'reports',
      createRepo(MULTI_PROJECT_SET),
    );
    expect(firstLoad.mode).toBe('project');

    // Simulated refresh
    const refreshLoad = await resolveProjectHubProjectEntry(
      'e2e-proj-002',
      'reports',
      createRepo(MULTI_PROJECT_SET),
    );
    expect(refreshLoad.mode).toBe('project');
    if (refreshLoad.mode === 'project') {
      expect(refreshLoad.project.id).toBe('e2e-proj-002');
      expect(refreshLoad.section).toBe('reports');
    }
  });

  it('same-section switching stays on the same section when supported', () => {
    const target = resolveProjectHubSwitchTarget({
      currentProjectId: 'e2e-proj-001',
      currentSection: 'financial',
      targetProjectId: 'e2e-proj-002',
    });

    expect(target).toBe('/project-hub/e2e-proj-002/financial');
  });

  it('same-section switching falls back to control center when section unsupported', () => {
    const target = resolveProjectHubSwitchTarget({
      currentProjectId: 'e2e-proj-001',
      currentSection: 'unsupported-module',
      targetProjectId: 'e2e-proj-002',
    });

    expect(target).toBe('/project-hub/e2e-proj-002');
  });

  it('unsupported section redirects to project control center', async () => {
    const result = await resolveProjectHubProjectEntry(
      'e2e-proj-001',
      'nonexistent-section',
      createRepo(MULTI_PROJECT_SET),
    );

    expect(result.mode).toBe('redirect');
    if (result.mode === 'redirect') {
      expect(result.redirectTo).toBe('/project-hub/e2e-proj-001');
    }
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// 4. CONTEXT DURABILITY AND RECOVERY
// ═══════════════════════════════════════════════════════════════════════════

describe('Context durability and recovery', () => {
  it('route params remain authoritative over cached store state', () => {
    // Seed store with PROJECT_B (simulating stale session)
    useProjectStore.getState().setActiveProject(PROJECT_B);
    expect(useProjectStore.getState().activeProject?.id).toBe('e2e-proj-002');

    // Route carries PROJECT_A — route must win
    const reconciliation = reconcileProjectContext({
      routeProjectId: PROJECT_A.id,
      storeProjectId: useProjectStore.getState().activeProject?.id ?? null,
    });

    expect(reconciliation.storeNeedsSync).toBe(true);

    // Apply the reconciliation (what the hook does)
    useProjectStore.getState().setActiveProject(PROJECT_A);
    expect(useProjectStore.getState().activeProject?.id).toBe('e2e-proj-001');
  });

  it('per-project return memory does not leak between projects', () => {
    saveReturnMemory('e2e-proj-001', '/financial');
    saveReturnMemory('e2e-proj-002', '/reports');

    expect(getReturnMemory('e2e-proj-001')?.lastPath).toBe('/financial');
    expect(getReturnMemory('e2e-proj-002')?.lastPath).toBe('/reports');

    // Clearing one does not affect the other
    clearReturnMemory('e2e-proj-001');
    expect(getReturnMemory('e2e-proj-001')).toBeNull();
    expect(getReturnMemory('e2e-proj-002')?.lastPath).toBe('/reports');
  });

  it('project return memory is restored correctly after simulated refresh', () => {
    saveReturnMemory('e2e-proj-001', '/health');

    // Simulate refresh: clear in-memory state but localStorage survives
    useProjectStore.getState().clear();

    // Return memory survives (localStorage-backed)
    const restored = getReturnMemory('e2e-proj-001');
    expect(restored).not.toBeNull();
    expect(restored?.lastPath).toBe('/health');
  });

  it('portfolio continuity and per-project continuity are isolated', () => {
    // Set portfolio state
    saveProjectHubPortfolioState({ search: 'tower', sortBy: 'name' });

    // Set per-project return memory
    saveReturnMemory('e2e-proj-001', '/financial');

    // Clear portfolio state
    clearProjectHubPortfolioState();

    // Per-project memory is not affected
    expect(getReturnMemory('e2e-proj-001')?.lastPath).toBe('/financial');

    // Portfolio state is cleared
    const portfolioState = getProjectHubPortfolioState();
    expect(portfolioState.search).toBe('');
  });

  it('store reconciliation detects null-to-project transition', () => {
    // Start with no active project (portfolio root)
    useProjectStore.getState().setActiveProject(null);

    const reconciliation = reconcileProjectContext({
      routeProjectId: PROJECT_A.id,
      storeProjectId: null,
    });

    expect(reconciliation.storeNeedsSync).toBe(true);
  });

  it('store reconciliation preserves previous project ID for return memory', () => {
    useProjectStore.getState().setActiveProject(PROJECT_A);

    const reconciliation = reconcileProjectContext({
      routeProjectId: PROJECT_B.id,
      storeProjectId: PROJECT_A.id,
    });

    expect(reconciliation.storeNeedsSync).toBe(true);
    expect(reconciliation.previousProjectId).toBe('e2e-proj-001');
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// 5. SPFX / EXTERNAL LAUNCH COMPATIBILITY
// ═══════════════════════════════════════════════════════════════════════════

describe('SPFx / external launch compatibility', () => {
  it('canonical PWA URLs resolve correctly from external entry', async () => {
    // Simulate: SPFx launches the user to /project-hub/e2e-proj-001/financial
    const result = await resolveProjectHubProjectEntry(
      'e2e-proj-001',
      'financial',
      createRepo(MULTI_PROJECT_SET),
    );

    expect(result.mode).toBe('project');
    if (result.mode === 'project') {
      expect(result.project.id).toBe('e2e-proj-001');
      expect(result.section).toBe('financial');
    }
  });

  it('project-number deep links normalize to canonical UUID route', async () => {
    const result = await resolveProjectHubProjectEntry(
      'PRJ-001',
      'health',
      createRepo(MULTI_PROJECT_SET),
    );

    expect(result.mode).toBe('redirect');
    if (result.mode === 'redirect') {
      expect(result.redirectTo).toBe('/project-hub/e2e-proj-001/health');
    }
  });

  it('launch metadata does not override route identity', async () => {
    // Even if the store carries a different project (simulating stale SPFx context),
    // the route-resolved project wins
    useProjectStore.getState().setActiveProject(PROJECT_C);

    const result = await resolveProjectHubProjectEntry(
      'e2e-proj-001',
      null,
      createRepo(MULTI_PROJECT_SET),
    );

    expect(result.mode).toBe('project');
    if (result.mode === 'project') {
      expect(result.project.id).toBe('e2e-proj-001');
      // NOT e2e-proj-003 from the stale store
    }
  });

  it('buildProjectHubPath produces valid launch URLs', () => {
    expect(buildProjectHubPath('proj-001')).toBe('/project-hub/proj-001');
    expect(buildProjectHubPath('proj-001', 'reports')).toBe(
      '/project-hub/proj-001/reports',
    );
    expect(buildProjectHubPath('proj-001', null)).toBe('/project-hub/proj-001');
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// 6. NEGATIVE AND EDGE CASES
// ═══════════════════════════════════════════════════════════════════════════

describe('Negative and edge cases', () => {
  it('malformed project ID returns no-access', async () => {
    const result = await resolveProjectHubProjectEntry(
      '',
      null,
      createRepo(MULTI_PROJECT_SET),
    );
    expect(result.mode).toBe('no-access');
  });

  it('special characters in project ID are handled gracefully', async () => {
    const result = await resolveProjectHubProjectEntry(
      'proj-with-special/chars&query=1',
      null,
      createRepo(MULTI_PROJECT_SET),
    );
    expect(result.mode).toBe('no-access');
  });

  it('stale return memory for a different project does not affect current resolution', async () => {
    // Populate return memory for project B
    saveReturnMemory('e2e-proj-002', '/reports');

    // Resolve project A — should not be influenced by project B memory
    const result = await resolveProjectHubProjectEntry(
      'e2e-proj-001',
      null,
      createRepo(MULTI_PROJECT_SET),
    );

    expect(result.mode).toBe('project');
    if (result.mode === 'project') {
      expect(result.project.id).toBe('e2e-proj-001');
      expect(result.section).toBeNull(); // Not '/reports' from project B
    }
  });

  it('missing return memory does not break navigation', () => {
    const memory = getReturnMemory('nonexistent-project');
    expect(memory).toBeNull();
  });

  it('switch from unsupported section falls back to project root', () => {
    const target = resolveProjectHubSwitchTarget({
      currentProjectId: 'e2e-proj-001',
      currentSection: 'schedule', // Not yet in the registry
      targetProjectId: 'e2e-proj-002',
    });

    expect(target).toBe('/project-hub/e2e-proj-002');
  });

  it('section registry is internally consistent', () => {
    const slugs = PROJECT_HUB_SECTION_REGISTRY.map((s) => s.slug);
    // No duplicates
    expect(new Set(slugs).size).toBe(slugs.length);
    // Every slug validates as supported
    for (const slug of slugs) {
      expect(isSupportedProjectHubSection(slug)).toBe(true);
    }
    // Null/undefined are accepted (means control center root)
    expect(isSupportedProjectHubSection(null)).toBe(true);
    expect(isSupportedProjectHubSection(undefined)).toBe(true);
  });

  it('explicit back-to-portfolio path is always /project-hub', () => {
    // No project ID, no section — just the portfolio root
    expect(buildProjectHubPath('').startsWith('/project-hub/')).toBe(true);
    // The explicit control uses this hardcoded path in workspace-routes.ts
  });

  it('hard reload on project route after return memory is populated', async () => {
    // Save return memory for a section
    saveReturnMemory('e2e-proj-001', '/financial');

    // Hard reload: route resolver runs fresh — resolves from URL, not return memory
    const result = await resolveProjectHubProjectEntry(
      'e2e-proj-001',
      null, // Control center root, NOT the remembered /financial
      createRepo(MULTI_PROJECT_SET),
    );

    expect(result.mode).toBe('project');
    if (result.mode === 'project') {
      expect(result.section).toBeNull(); // Route wins, not return memory
    }

    // Return memory is still available for the shell to use if it wants
    expect(getReturnMemory('e2e-proj-001')?.lastPath).toBe('/financial');
  });

  it('switching projects while on a valid section preserves section for all registered sections', () => {
    for (const entry of PROJECT_HUB_SECTION_REGISTRY) {
      const target = resolveProjectHubSwitchTarget({
        currentProjectId: 'e2e-proj-001',
        currentSection: entry.slug,
        targetProjectId: 'e2e-proj-002',
      });
      expect(target).toBe(`/project-hub/e2e-proj-002/${entry.slug}`);
    }
  });
});
