import type {
  PriorityRailActionModel,
  PriorityRailLayoutMode,
} from '@hbc/ui-kit/homepage';
import {
  mapPriorityActionsDeviceClassToShellState,
  mapShellEntryStateToPriorityActionsDeviceClass,
  type PriorityActionsDeviceClass,
} from '../entryStack/entryStackOrchestration.js';
import {
  resolveEntryStateWithReason,
  type EntryStateSelectionReason,
} from '../../webparts/hbHomepage/shell/breakpointPolicy.js';
import type { ShellEntryStateId } from '../../webparts/hbHomepage/shell/shellTypes.js';
import type { PriorityActionsConfigResolved } from './priorityActionsContracts.js';
import type { DeviceClass } from './priorityActionsNormalization.js';

export interface PriorityRailContainerDimensions {
  width: number;
  height: number;
}

export type PriorityRailPresentationNormalization =
  | 'desktop-segmented-to-grid'
  | 'desktop-hybrid-to-grid'
  | 'desktop-hybrid-to-rail'
  | 'tablet-hybrid-to-rail'
  | 'tablet-portrait-to-compact'
  | 'mobile-grid-to-compact-menu'
  | 'mobile-scroll-to-compact-inline';

export type PriorityRailOverflowStrategy = 'inline-disclosure' | 'menu' | 'sheet';

export interface PriorityRailSectionModel {
  key: string;
  title?: string;
  actions: PriorityRailActionModel[];
  /**
   * Optional flagship-featured action promoted ahead of the section row
   * list when the consumer surface opts into `homepage-flagship` context.
   * Selected by `buildPriorityRailSections` based on wrapper-declared
   * featured keys (preferred) or the first badge-variant `critical` /
   * `warning` action in the section (fallback). Absent when the section
   * has no viable candidate; default-context consumers ignore this field.
   */
  featured?: PriorityRailActionModel;
}

export interface BuildPriorityRailSectionsOptions {
  readonly featuredActionKeys?: readonly string[];
}

export interface PriorityRailDeviceResolution {
  deviceClass: DeviceClass;
  shellState: ShellEntryStateId;
  entryStateReason: EntryStateSelectionReason;
  shortHeightConstrained: boolean;
}

export interface PriorityRailPresentationResolution {
  deviceClass: DeviceClass;
  shellState: ShellEntryStateId;
  layout: PriorityRailLayoutMode;
  overflowStrategy: PriorityRailOverflowStrategy;
  authoredLayoutMode: string;
  normalizations: PriorityRailPresentationNormalization[];
}

function castRailDeviceClass(device: PriorityActionsDeviceClass): DeviceClass {
  return device;
}

export function resolvePriorityRailDeviceForContainer(
  dimensions: PriorityRailContainerDimensions,
): PriorityRailDeviceResolution {
  const resolved = resolveEntryStateWithReason({ width: dimensions.width, height: dimensions.height });
  const deviceClass = castRailDeviceClass(mapShellEntryStateToPriorityActionsDeviceClass(resolved.state.id));
  return {
    deviceClass,
    shellState: resolved.state.id,
    entryStateReason: resolved.reason,
    shortHeightConstrained: resolved.shortHeightConstrained,
  };
}

export function resolvePriorityRailPresentationForDevice(
  config: Pick<PriorityActionsConfigResolved, 'desktopLayoutMode' | 'tabletLayoutMode' | 'mobileLayoutMode'>,
  deviceClass: DeviceClass,
): PriorityRailPresentationResolution {
  const shellState = mapPriorityActionsDeviceClassToShellState(deviceClass as PriorityActionsDeviceClass);

  // ── Desktop / laptop / tablet overflow (Prompt-04) ───────────────────
  // Use an anchored menu strategy so deferred actions read as a governed
  // secondary command layer rather than an appended inline list that
  // footers the primary strip. Sheet remains for small handheld cases
  // below; inline-disclosure is reserved for the mobile scroll fallback
  // where an in-flow disclosure is still the best fit.
  //
  // ── Mode divergence matrix (Prompt-05) ────────────────────────────────
  // The prior matrix collapsed `rail` and `hybrid` into identical 'rail'
  // outcomes across desktop + tablet, and always gave tabletPortrait the
  // same layout as tabletLandscape. The matrix below makes each step
  // materially different:
  //
  //   device          | rail      | segmented/grid | hybrid
  //   ----------------+-----------+----------------+----------
  //   desktop         | rail      | grid           | grid   ← wide, confident
  //   laptop          | rail      | grid           | rail   ← narrower
  //   tabletLandscape | rail      | grid           | rail
  //   tabletPortrait  | compact   | compact        | compact ← decisive step
  //   phone           | compact   | compact        | compact
  //
  // tabletPortrait is promoted to `compact` across all authored tablet
  // modes so the narrow-tablet band no longer reads as a squeezed rail.
  // It still diverges from phone via overflowStrategy (menu vs. sheet /
  // inline-disclosure) as governed in the mobile branch below.
  if (deviceClass === 'desktop' || deviceClass === 'laptop') {
    if (config.desktopLayoutMode === 'segmented') {
      return {
        deviceClass,
        shellState,
        layout: 'grid',
        overflowStrategy: 'menu',
        authoredLayoutMode: 'segmented',
        normalizations: ['desktop-segmented-to-grid'],
      };
    }
    if (config.desktopLayoutMode === 'hybrid') {
      // Desktop leans into `grid` for hybrid; laptop keeps `rail` so the
      // two widths express materially different flagship fields.
      const hybridLayout: PriorityRailLayoutMode = deviceClass === 'desktop' ? 'grid' : 'rail';
      return {
        deviceClass,
        shellState,
        layout: hybridLayout,
        overflowStrategy: 'menu',
        authoredLayoutMode: 'hybrid',
        normalizations:
          deviceClass === 'desktop'
            ? ['desktop-hybrid-to-grid']
            : ['desktop-hybrid-to-rail'],
      };
    }
    return {
      deviceClass,
      shellState,
      layout: 'rail',
      overflowStrategy: 'menu',
      authoredLayoutMode: 'rail',
      normalizations: [],
    };
  }

  if (deviceClass === 'tabletLandscape' || deviceClass === 'tabletPortrait') {
    // tabletPortrait always compacts — decisive step away from the
    // tabletLandscape rail/grid so the narrow-tablet band reads as a
    // compact command menu, not a compressed rail.
    if (deviceClass === 'tabletPortrait') {
      return {
        deviceClass,
        shellState,
        layout: 'compact',
        overflowStrategy: 'menu',
        authoredLayoutMode: config.tabletLayoutMode,
        normalizations: ['tablet-portrait-to-compact'],
      };
    }
    if (config.tabletLayoutMode === 'grid') {
      return {
        deviceClass,
        shellState,
        layout: 'grid',
        overflowStrategy: 'menu',
        authoredLayoutMode: 'grid',
        normalizations: [],
      };
    }
    if (config.tabletLayoutMode === 'hybrid') {
      return {
        deviceClass,
        shellState,
        layout: 'rail',
        overflowStrategy: 'menu',
        authoredLayoutMode: 'hybrid',
        normalizations: ['tablet-hybrid-to-rail'],
      };
    }
    return {
      deviceClass,
      shellState,
      layout: 'rail',
      overflowStrategy: 'menu',
      authoredLayoutMode: 'rail',
      normalizations: [],
    };
  }

  if (config.mobileLayoutMode === 'sheet-trigger') {
    return {
      deviceClass,
      shellState,
      layout: 'compact',
      overflowStrategy: 'sheet',
      authoredLayoutMode: 'sheet-trigger',
      normalizations: [],
    };
  }

  if (config.mobileLayoutMode === 'grid') {
    return {
      deviceClass,
      shellState,
      layout: 'compact',
      overflowStrategy: 'menu',
      authoredLayoutMode: 'grid',
      normalizations: ['mobile-grid-to-compact-menu'],
    };
  }

  return {
    deviceClass,
    shellState,
    layout: 'compact',
    overflowStrategy: 'inline-disclosure',
    authoredLayoutMode: 'scroll',
    normalizations: ['mobile-scroll-to-compact-inline'],
  };
}

export function buildPriorityRailSections(
  actions: readonly PriorityRailActionModel[],
  options?: BuildPriorityRailSectionsOptions,
): PriorityRailSectionModel[] | undefined {
  if (actions.length === 0) {
    return undefined;
  }

  const hasGrouping = actions.some((action) => action.groupKey || action.groupTitle);
  if (!hasGrouping) {
    return undefined;
  }

  const featuredKeySet = new Set(
    (options?.featuredActionKeys ?? []).filter((key) => typeof key === 'string' && key.length > 0),
  );

  const sectionsByKey = new Map<string, PriorityRailSectionModel>();
  for (const action of actions) {
    const sectionKey = (action.groupKey || action.groupTitle || '__ungrouped').trim() || '__ungrouped';
    const existing = sectionsByKey.get(sectionKey);
    if (existing) {
      existing.actions.push(action);
      continue;
    }
    sectionsByKey.set(sectionKey, {
      key: sectionKey,
      title: action.groupTitle || action.groupKey || undefined,
      actions: [action],
    });
  }

  const sections = Array.from(sectionsByKey.values());

  for (const section of sections) {
    const featured = resolveSectionFeaturedAction(section.actions, featuredKeySet);
    if (featured) {
      section.featured = featured;
    }
  }

  return sections;
}

function resolveSectionFeaturedAction(
  actions: readonly PriorityRailActionModel[],
  featuredKeySet: ReadonlySet<string>,
): PriorityRailActionModel | undefined {
  if (featuredKeySet.size > 0) {
    const explicit = actions.find((action) => featuredKeySet.has(action.id));
    if (explicit) return explicit;
  }

  const explicitFlag = actions.find((action) => action.featured === true);
  if (explicitFlag) return explicitFlag;

  const critical = actions.find((action) => action.badge?.variant === 'critical');
  if (critical) return critical;

  const warning = actions.find((action) => action.badge?.variant === 'warning');
  if (warning) return warning;

  return undefined;
}
