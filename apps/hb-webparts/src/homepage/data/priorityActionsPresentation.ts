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
  | 'desktop-hybrid-to-rail'
  | 'tablet-hybrid-to-rail'
  | 'mobile-grid-to-compact-menu'
  | 'mobile-scroll-to-compact-inline';

export type PriorityRailOverflowStrategy = 'inline-disclosure' | 'menu' | 'sheet';

export interface PriorityRailSectionModel {
  key: string;
  title?: string;
  actions: PriorityRailActionModel[];
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

  if (deviceClass === 'desktop' || deviceClass === 'laptop') {
    if (config.desktopLayoutMode === 'segmented') {
      return {
        deviceClass,
        shellState,
        layout: 'grid',
        overflowStrategy: 'inline-disclosure',
        authoredLayoutMode: 'segmented',
        normalizations: ['desktop-segmented-to-grid'],
      };
    }
    if (config.desktopLayoutMode === 'hybrid') {
      return {
        deviceClass,
        shellState,
        layout: 'rail',
        overflowStrategy: 'inline-disclosure',
        authoredLayoutMode: 'hybrid',
        normalizations: ['desktop-hybrid-to-rail'],
      };
    }
    return {
      deviceClass,
      shellState,
      layout: 'rail',
      overflowStrategy: 'inline-disclosure',
      authoredLayoutMode: 'rail',
      normalizations: [],
    };
  }

  if (deviceClass === 'tabletLandscape' || deviceClass === 'tabletPortrait') {
    if (config.tabletLayoutMode === 'grid') {
      return {
        deviceClass,
        shellState,
        layout: 'grid',
        overflowStrategy: 'inline-disclosure',
        authoredLayoutMode: 'grid',
        normalizations: [],
      };
    }
    if (config.tabletLayoutMode === 'hybrid') {
      return {
        deviceClass,
        shellState,
        layout: 'rail',
        overflowStrategy: 'inline-disclosure',
        authoredLayoutMode: 'hybrid',
        normalizations: ['tablet-hybrid-to-rail'],
      };
    }
    return {
      deviceClass,
      shellState,
      layout: 'rail',
      overflowStrategy: 'inline-disclosure',
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
): PriorityRailSectionModel[] | undefined {
  if (actions.length === 0) {
    return undefined;
  }

  const hasGrouping = actions.some((action) => action.groupKey || action.groupTitle);
  if (!hasGrouping) {
    return undefined;
  }

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

  return Array.from(sectionsByKey.values());
}
