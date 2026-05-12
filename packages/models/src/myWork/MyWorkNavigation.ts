/**
 * My Work — typed navigation registry for the SPFx My Dashboard shell.
 *
 * Defines the canonical primary-surface and module identifiers, state
 * vocabulary, and metadata records that B03 shell composition (command
 * surface, hero band, bento grid, surface router, focused module shell)
 * consumes. This registry is metadata-only:
 *
 *   - pure TypeScript, no runtime side effects;
 *   - no React, SPFx, PnP, Azure, backend, or Adobe Sign SDK imports;
 *   - no aggregation, ranking, dedupe, or count semantics — those live
 *     in `@hbc/my-work-feed`;
 *   - no tenant URLs, no secrets, no API clients.
 *
 * MVP scope (B03):
 *   - single primary surface `my-work-home`;
 *   - single module `adobe-sign-action-queue` in `read-only` state.
 *
 * @module myWork
 */

// ─── Primary surfaces ────────────────────────────────────────────────────────

export const MY_WORK_PRIMARY_SURFACE_IDS = ['my-work-home'] as const;
export type MyWorkPrimarySurfaceId = (typeof MY_WORK_PRIMARY_SURFACE_IDS)[number];

// ─── Module identifiers ──────────────────────────────────────────────────────

export const MY_WORK_MODULE_IDS = ['adobe-sign-action-queue'] as const;
export type MyWorkModuleId = (typeof MY_WORK_MODULE_IDS)[number];

// ─── Module state vocabulary ────────────────────────────────────────────────
//
// B03 navigation states only. The read-model envelope concept `partial`
// belongs to source-status semantics and is intentionally excluded here.

export const MY_WORK_MODULE_STATES = [
  'available',
  'preview',
  'read-only',
  'configuration-required',
  'authorization-required',
  'principal-unresolved',
  'source-unavailable',
  'deferred',
] as const;
export type MyWorkModuleState = (typeof MY_WORK_MODULE_STATES)[number];

// ─── Source system identifiers (MVP-narrow) ─────────────────────────────────

export type MyWorkModuleSourceSystem = 'Adobe Sign';

// ─── Interfaces ─────────────────────────────────────────────────────────────

export interface MyWorkModuleStateCopy {
  readonly stateLabel: string;
  readonly reason: string;
}

export interface MyWorkNavigationModule {
  readonly id: MyWorkModuleId;
  readonly label: string;
  readonly parentSurfaceId: MyWorkPrimarySurfaceId;
  readonly state: MyWorkModuleState;
  readonly stateLabel: string;
  readonly summary: string;
  readonly authorityCue: string;
  readonly sourceSystem: MyWorkModuleSourceSystem;
  readonly selectable: boolean;
  readonly disabledReason?: string;
}

export interface MyWorkPrimaryNavigationSurface {
  readonly id: MyWorkPrimarySurfaceId;
  readonly label: string;
  readonly dashboardTitle: string;
  readonly dashboardDescription: string;
  readonly modules: readonly MyWorkModuleId[];
}

// ─── State copy ─────────────────────────────────────────────────────────────

export const MY_WORK_MODULE_STATE_COPY: Readonly<
  Record<MyWorkModuleState, MyWorkModuleStateCopy>
> = Object.freeze({
  available: {
    stateLabel: 'Available',
    reason: 'Module is available for use within the My Work shell.',
  },
  preview: {
    stateLabel: 'Preview',
    reason: 'Preview surface for early review. No source-system actions occur here.',
  },
  'read-only': {
    stateLabel: 'Read-only',
    reason: 'Queue visibility only. Source-system actions remain in the source application.',
  },
  'configuration-required': {
    stateLabel: 'Configuration required',
    reason: 'Source integration is not yet configured for this tenant.',
  },
  'authorization-required': {
    stateLabel: 'Authorization required',
    reason: 'Source-system authorization is required before this module can load data.',
  },
  'principal-unresolved': {
    stateLabel: 'Principal unresolved',
    reason: 'The current user could not be mapped to a source-system identity.',
  },
  'source-unavailable': {
    stateLabel: 'Source unavailable',
    reason: 'The upstream source system is currently unavailable.',
  },
  deferred: {
    stateLabel: 'Deferred',
    reason: 'Planned for a future release. Not active in the current shell.',
  },
});

// ─── Registry records ───────────────────────────────────────────────────────

export const MY_WORK_PRIMARY_NAVIGATION_SURFACES: readonly MyWorkPrimaryNavigationSurface[] = [
  {
    id: 'my-work-home',
    label: 'My Work Home',
    dashboardTitle: 'My Work',
    dashboardDescription:
      'Your personal command surface for work requiring attention across connected HB systems.',
    modules: ['adobe-sign-action-queue'],
  },
];

export const MY_WORK_NAVIGATION_MODULES: readonly MyWorkNavigationModule[] = [
  {
    id: 'adobe-sign-action-queue',
    label: 'Adobe Sign Action Queue',
    parentSurfaceId: 'my-work-home',
    state: 'read-only',
    stateLabel: MY_WORK_MODULE_STATE_COPY['read-only'].stateLabel,
    summary:
      'Agreements in Adobe Sign that require your review, signature, approval, or other source-defined action.',
    authorityCue: 'Queue visibility only. Agreement actions remain in Adobe Sign.',
    sourceSystem: 'Adobe Sign',
    selectable: true,
  },
];

// ─── Internal indices ───────────────────────────────────────────────────────

const PRIMARY_SURFACE_INDEX: ReadonlyMap<MyWorkPrimarySurfaceId, MyWorkPrimaryNavigationSurface> =
  new Map(MY_WORK_PRIMARY_NAVIGATION_SURFACES.map((surface) => [surface.id, surface]));

const MODULE_INDEX: ReadonlyMap<MyWorkModuleId, MyWorkNavigationModule> = new Map(
  MY_WORK_NAVIGATION_MODULES.map((mod) => [mod.id, mod]),
);

const PRIMARY_SURFACE_ID_SET: ReadonlySet<MyWorkPrimarySurfaceId> = new Set(
  MY_WORK_PRIMARY_SURFACE_IDS,
);

const MODULE_ID_SET: ReadonlySet<MyWorkModuleId> = new Set(MY_WORK_MODULE_IDS);

// ─── Helpers ────────────────────────────────────────────────────────────────

export const getMyWorkPrimaryNavigationSurface = (
  id: MyWorkPrimarySurfaceId,
): MyWorkPrimaryNavigationSurface => {
  const surface = PRIMARY_SURFACE_INDEX.get(id);
  if (!surface) {
    throw new Error(`Unknown My Work primary surface id: ${String(id)}`);
  }
  return surface;
};

export const getMyWorkModule = (id: MyWorkModuleId): MyWorkNavigationModule => {
  const mod = MODULE_INDEX.get(id);
  if (!mod) {
    throw new Error(`Unknown My Work module id: ${String(id)}`);
  }
  return mod;
};

export const getMyWorkModulesForPrimarySurface = (
  id: MyWorkPrimarySurfaceId,
): readonly MyWorkNavigationModule[] => {
  const surface = getMyWorkPrimaryNavigationSurface(id);
  return surface.modules.map((moduleId) => getMyWorkModule(moduleId));
};

export const isSelectableMyWorkModule = (mod: MyWorkNavigationModule): boolean => mod.selectable;

export const normalizeMyWorkPrimarySurfaceId = (id: unknown): MyWorkPrimarySurfaceId => {
  if (typeof id === 'string' && PRIMARY_SURFACE_ID_SET.has(id as MyWorkPrimarySurfaceId)) {
    return id as MyWorkPrimarySurfaceId;
  }
  return 'my-work-home';
};

export const normalizeMyWorkModuleId = (id: unknown): MyWorkModuleId | undefined => {
  if (typeof id === 'string' && MODULE_ID_SET.has(id as MyWorkModuleId)) {
    return id as MyWorkModuleId;
  }
  return undefined;
};
