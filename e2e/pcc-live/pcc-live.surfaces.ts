export const PCC_LIVE_SURFACE_IDS = [
  'project-home',
  'team-and-access',
  'documents',
  'project-readiness',
  'approvals',
  'external-systems',
  'control-center-settings',
  'site-health',
] as const;

export type PccLiveSurfaceId = (typeof PCC_LIVE_SURFACE_IDS)[number];

export interface PccLiveSurfaceDefinition {
  id: PccLiveSurfaceId;
  label: string;
  expectedTabSelector: string;
  /**
   * Broad compatibility selector — matches the active-panel marker
   * wherever it appears in the rendered tree. Wave 15A wave-b7 keeps
   * this selector unchanged so live smoke continues to find the marker
   * on tenant-deployed packages that predate the Phase 2 shell change.
   */
  expectedActivePanelSelector: string;
  /**
   * Shell-specific selector — Wave 15A wave-b7 Prompt 01 made shell
   * `<main role="tabpanel">` the semantic active-panel owner. Used by
   * the page object as evidence (not as a hard pass/fail gate) so
   * smoke can record whether the hosted package carries the Phase 2
   * shell change.
   */
  expectedShellActivePanelSelector: string;
  expectedHeroOrHeadingText?: string;
  expectedEvRefs: readonly ('EV-52' | 'EV-55')[];
}

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
    id: 'team-and-access',
    label: 'Team & Access',
    expectedTabSelector: '[data-pcc-tab-id="team-and-access"]',
    expectedActivePanelSelector: '[data-pcc-active-surface-panel="team-and-access"]',
    expectedShellActivePanelSelector:
      'main[role="tabpanel"][data-pcc-active-surface-panel="team-and-access"]',
    expectedEvRefs: ['EV-52', 'EV-55'],
  },
  {
    id: 'documents',
    label: 'Documents',
    expectedTabSelector: '[data-pcc-tab-id="documents"]',
    expectedActivePanelSelector: '[data-pcc-active-surface-panel="documents"]',
    expectedShellActivePanelSelector:
      'main[role="tabpanel"][data-pcc-active-surface-panel="documents"]',
    expectedEvRefs: ['EV-52', 'EV-55'],
  },
  {
    id: 'project-readiness',
    label: 'Project Readiness',
    expectedTabSelector: '[data-pcc-tab-id="project-readiness"]',
    expectedActivePanelSelector: '[data-pcc-active-surface-panel="project-readiness"]',
    expectedShellActivePanelSelector:
      'main[role="tabpanel"][data-pcc-active-surface-panel="project-readiness"]',
    expectedEvRefs: ['EV-52', 'EV-55'],
  },
  {
    id: 'approvals',
    label: 'Approvals',
    expectedTabSelector: '[data-pcc-tab-id="approvals"]',
    expectedActivePanelSelector: '[data-pcc-active-surface-panel="approvals"]',
    expectedShellActivePanelSelector:
      'main[role="tabpanel"][data-pcc-active-surface-panel="approvals"]',
    expectedEvRefs: ['EV-52', 'EV-55'],
  },
  {
    id: 'external-systems',
    label: 'External Platforms',
    expectedTabSelector: '[data-pcc-tab-id="external-systems"]',
    expectedActivePanelSelector: '[data-pcc-active-surface-panel="external-systems"]',
    expectedShellActivePanelSelector:
      'main[role="tabpanel"][data-pcc-active-surface-panel="external-systems"]',
    expectedEvRefs: ['EV-52', 'EV-55'],
  },
  {
    id: 'control-center-settings',
    label: 'Control Center Settings',
    expectedTabSelector: '[data-pcc-tab-id="control-center-settings"]',
    expectedActivePanelSelector: '[data-pcc-active-surface-panel="control-center-settings"]',
    expectedShellActivePanelSelector:
      'main[role="tabpanel"][data-pcc-active-surface-panel="control-center-settings"]',
    expectedEvRefs: ['EV-52', 'EV-55'],
  },
  {
    id: 'site-health',
    label: 'Site Health',
    expectedTabSelector: '[data-pcc-tab-id="site-health"]',
    expectedActivePanelSelector: '[data-pcc-active-surface-panel="site-health"]',
    expectedShellActivePanelSelector:
      'main[role="tabpanel"][data-pcc-active-surface-panel="site-health"]',
    expectedEvRefs: ['EV-52', 'EV-55'],
  },
] as const;

// Verified against packages/models/src/pcc/PccMvpSurfaces.ts for stable e2e-local ids.

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
