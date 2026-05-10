export const PCC_LIVE_SURFACE_IDS = [
  'project-home',
  'core-tools',
  'documents',
  'estimating-preconstruction',
  'startup-closeout',
  'project-controls',
  'cost-time',
  'systems-administration',
] as const;

export type PccLiveSurfaceId = (typeof PCC_LIVE_SURFACE_IDS)[number];

export interface PccLiveSurfaceDefinition {
  id: PccLiveSurfaceId;
  label: string;
  expectedTabSelector: string;
  /**
   * Broad compatibility selector — matches the active-panel marker
   * wherever it appears in the rendered tree. Phase 05 wave-b10 keeps
   * this selector unchanged so live smoke continues to find the marker
   * on tenant-deployed packages whether the active panel is owned by
   * the shell `<main role="tabpanel">` (Phase 04+) or any earlier
   * wrapper.
   */
  expectedActivePanelSelector: string;
  /**
   * Shell-specific selector — Phase 04 made shell `<main role="tabpanel">`
   * the semantic active-panel owner that carries
   * `data-pcc-active-surface-panel="${activePrimaryTabId}"`.
   */
  expectedShellActivePanelSelector: string;
  expectedHeroOrHeadingText?: string;
  expectedEvRefs: readonly ('EV-52' | 'EV-55')[];
}

// Phase 05 wave-b10 Prompt 08 — surface enumeration migrated from the
// eight legacy MVP surface ids (project-home, team-and-access,
// documents, project-readiness, approvals, external-systems,
// control-center-settings, site-health) to the eight Phase 05
// primary-tab ids (project-home, core-tools, documents,
// estimating-preconstruction, startup-closeout, project-controls,
// cost-time, systems-administration). The router and shell panel
// markers were migrated to `activePrimaryTabId` in Prompt 04 and the
// hero/header metadata in Prompt 06; the deployed `1.0.0.215` tenant
// shell exposes only Phase 05 primary tabs as `[data-pcc-tab-id]`.
// Visible labels match the registry (`getPrimaryNavigationTab(id).label`):
// Project Home, Core Tools, Document Control, Estimating &
// Preconstruction, Project Startup & Closeout, Project Controls,
// Cost & Time, Systems Administration.
export const PCC_LIVE_SURFACES: readonly PccLiveSurfaceDefinition[] = [
  {
    id: 'project-home',
    label: 'Project Home',
    expectedTabSelector: '[data-pcc-tab-id="project-home"]',
    expectedActivePanelSelector: '[data-pcc-active-surface-panel="project-home"]',
    expectedShellActivePanelSelector:
      'main[role="tabpanel"][data-pcc-active-surface-panel="project-home"]',
    expectedEvRefs: ['EV-52', 'EV-55'],
  },
  {
    id: 'core-tools',
    label: 'Core Tools',
    expectedTabSelector: '[data-pcc-tab-id="core-tools"]',
    expectedActivePanelSelector: '[data-pcc-active-surface-panel="core-tools"]',
    expectedShellActivePanelSelector:
      'main[role="tabpanel"][data-pcc-active-surface-panel="core-tools"]',
    expectedEvRefs: ['EV-52', 'EV-55'],
  },
  {
    id: 'documents',
    label: 'Document Control',
    expectedTabSelector: '[data-pcc-tab-id="documents"]',
    expectedActivePanelSelector: '[data-pcc-active-surface-panel="documents"]',
    expectedShellActivePanelSelector:
      'main[role="tabpanel"][data-pcc-active-surface-panel="documents"]',
    expectedEvRefs: ['EV-52', 'EV-55'],
  },
  {
    id: 'estimating-preconstruction',
    label: 'Estimating & Preconstruction',
    expectedTabSelector: '[data-pcc-tab-id="estimating-preconstruction"]',
    expectedActivePanelSelector: '[data-pcc-active-surface-panel="estimating-preconstruction"]',
    expectedShellActivePanelSelector:
      'main[role="tabpanel"][data-pcc-active-surface-panel="estimating-preconstruction"]',
    expectedEvRefs: ['EV-52', 'EV-55'],
  },
  {
    id: 'startup-closeout',
    label: 'Project Startup & Closeout',
    expectedTabSelector: '[data-pcc-tab-id="startup-closeout"]',
    expectedActivePanelSelector: '[data-pcc-active-surface-panel="startup-closeout"]',
    expectedShellActivePanelSelector:
      'main[role="tabpanel"][data-pcc-active-surface-panel="startup-closeout"]',
    expectedEvRefs: ['EV-52', 'EV-55'],
  },
  {
    id: 'project-controls',
    label: 'Project Controls',
    expectedTabSelector: '[data-pcc-tab-id="project-controls"]',
    expectedActivePanelSelector: '[data-pcc-active-surface-panel="project-controls"]',
    expectedShellActivePanelSelector:
      'main[role="tabpanel"][data-pcc-active-surface-panel="project-controls"]',
    expectedEvRefs: ['EV-52', 'EV-55'],
  },
  {
    id: 'cost-time',
    label: 'Cost & Time',
    expectedTabSelector: '[data-pcc-tab-id="cost-time"]',
    expectedActivePanelSelector: '[data-pcc-active-surface-panel="cost-time"]',
    expectedShellActivePanelSelector:
      'main[role="tabpanel"][data-pcc-active-surface-panel="cost-time"]',
    expectedEvRefs: ['EV-52', 'EV-55'],
  },
  {
    id: 'systems-administration',
    label: 'Systems Administration',
    expectedTabSelector: '[data-pcc-tab-id="systems-administration"]',
    expectedActivePanelSelector: '[data-pcc-active-surface-panel="systems-administration"]',
    expectedShellActivePanelSelector:
      'main[role="tabpanel"][data-pcc-active-surface-panel="systems-administration"]',
    expectedEvRefs: ['EV-52', 'EV-55'],
  },
] as const;

// Verified against packages/models/src/pcc/PccPrimaryNavigation.ts:
// PCC_PRIMARY_TAB_IDS and getPrimaryNavigationTab(id).label.

type IsExactlyString<T> = [T] extends [string] ? ([string] extends [T] ? true : false) : false;
type AssertFalse<T extends false> = T;
type AssertTrue<T extends true> = T;

type _SurfaceIdMustNotWidenToString = AssertFalse<IsExactlyString<PccLiveSurfaceId>>;
type _SurfaceCountIsEight = AssertTrue<
  (typeof PCC_LIVE_SURFACE_IDS)['length'] extends 8 ? true : false
>;

type SurfaceRegistryRecord = Record<PccLiveSurfaceId, PccLiveSurfaceDefinition>;
export const PCC_LIVE_SURFACE_REGISTRY: SurfaceRegistryRecord = Object.fromEntries(
  PCC_LIVE_SURFACES.map((surface) => [surface.id, surface]),
) as SurfaceRegistryRecord;
