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
  expectedActivePanelSelector: string;
  expectedHeroOrHeadingText?: string;
  expectedEvRefs: readonly ('EV-52' | 'EV-55')[];
}

export const PCC_LIVE_SURFACES: readonly PccLiveSurfaceDefinition[] = [
  {
    id: 'project-home',
    label: 'Project Home',
    expectedTabSelector: '[data-pcc-tab-id="project-home"]',
    expectedActivePanelSelector: '[data-pcc-active-surface-panel="project-home"]',
    expectedEvRefs: ['EV-52', 'EV-55'],
  },
  {
    id: 'team-and-access',
    label: 'Team & Access',
    expectedTabSelector: '[data-pcc-tab-id="team-and-access"]',
    expectedActivePanelSelector: '[data-pcc-active-surface-panel="team-and-access"]',
    expectedEvRefs: ['EV-52', 'EV-55'],
  },
  {
    id: 'documents',
    label: 'Documents',
    expectedTabSelector: '[data-pcc-tab-id="documents"]',
    expectedActivePanelSelector: '[data-pcc-active-surface-panel="documents"]',
    expectedEvRefs: ['EV-52', 'EV-55'],
  },
  {
    id: 'project-readiness',
    label: 'Project Readiness',
    expectedTabSelector: '[data-pcc-tab-id="project-readiness"]',
    expectedActivePanelSelector: '[data-pcc-active-surface-panel="project-readiness"]',
    expectedEvRefs: ['EV-52', 'EV-55'],
  },
  {
    id: 'approvals',
    label: 'Approvals',
    expectedTabSelector: '[data-pcc-tab-id="approvals"]',
    expectedActivePanelSelector: '[data-pcc-active-surface-panel="approvals"]',
    expectedEvRefs: ['EV-52', 'EV-55'],
  },
  {
    id: 'external-systems',
    label: 'External Platforms',
    expectedTabSelector: '[data-pcc-tab-id="external-systems"]',
    expectedActivePanelSelector: '[data-pcc-active-surface-panel="external-systems"]',
    expectedEvRefs: ['EV-52', 'EV-55'],
  },
  {
    id: 'control-center-settings',
    label: 'Control Center Settings',
    expectedTabSelector: '[data-pcc-tab-id="control-center-settings"]',
    expectedActivePanelSelector: '[data-pcc-active-surface-panel="control-center-settings"]',
    expectedEvRefs: ['EV-52', 'EV-55'],
  },
  {
    id: 'site-health',
    label: 'Site Health',
    expectedTabSelector: '[data-pcc-tab-id="site-health"]',
    expectedActivePanelSelector: '[data-pcc-active-surface-panel="site-health"]',
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
