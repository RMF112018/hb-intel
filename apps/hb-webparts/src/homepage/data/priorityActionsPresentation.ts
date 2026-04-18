/**
 * Priority Actions presentation — launcher band.
 *
 * The rail renders as a flat launcher grid beneath the homepage hero.
 * Presentation is driven by container size, not an authored per-device
 * layout matrix: tile density falls out of CSS container queries, and
 * the data layer only supplies `deviceClass` + `shortHeightConstrained`
 * for overflow-strategy selection.
 */
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
import type { DeviceClass } from './priorityActionsNormalization.js';

export interface PriorityRailContainerDimensions {
  width: number;
  height: number;
}

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
  /** Back-compat field. The launcher band has no authored layout matrix. */
  authoredLayoutMode: string;
  /** Back-compat field. The launcher band applies no normalization steps. */
  normalizations: readonly string[];
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

/**
 * Launcher presentation resolution. The surface is always a flat grid;
 * the only device-class decision is overflow strategy — sheet on
 * handheld / short-height, menu everywhere else.
 */
export function resolveLauncherPresentation(
  resolution: PriorityRailDeviceResolution,
): PriorityRailPresentationResolution {
  const isHandheld = resolution.deviceClass === 'phone';
  const useSheet = isHandheld || resolution.shortHeightConstrained;
  return {
    deviceClass: resolution.deviceClass,
    shellState: mapPriorityActionsDeviceClassToShellState(resolution.deviceClass as PriorityActionsDeviceClass),
    layout: 'rail',
    overflowStrategy: useSheet ? 'sheet' : 'menu',
    authoredLayoutMode: 'launcher',
    normalizations: [],
  };
}

/**
 * Backward-compatibility shim. The authored-layout matrix was torn
 * down in favor of a uniform launcher grid; this now returns a
 * device-only resolution and ignores the config matrix.
 */
export function resolvePriorityRailPresentationForDevice(
  _config: unknown,
  deviceClass: DeviceClass,
): PriorityRailPresentationResolution {
  const isHandheld = deviceClass === 'phone';
  return {
    deviceClass,
    shellState: mapPriorityActionsDeviceClassToShellState(deviceClass as PriorityActionsDeviceClass),
    layout: 'rail',
    overflowStrategy: isHandheld ? 'sheet' : 'menu',
    authoredLayoutMode: 'launcher',
    normalizations: [],
  };
}

/**
 * Backward-compatibility shim. Groups actions by groupKey / groupTitle
 * without any featured-slot promotion (the launcher grid has no
 * featured slot).
 */
export function buildPriorityRailSections(
  actions: readonly PriorityRailActionModel[],
): PriorityRailSectionModel[] | undefined {
  if (actions.length === 0) return undefined;
  const hasGrouping = actions.some((a) => a.groupKey || a.groupTitle);
  if (!hasGrouping) return undefined;
  const map = new Map<string, PriorityRailSectionModel>();
  for (const action of actions) {
    const key = (action.groupKey || action.groupTitle || '__ungrouped').trim() || '__ungrouped';
    const existing = map.get(key);
    if (existing) {
      existing.actions.push(action);
      continue;
    }
    map.set(key, {
      key,
      title: action.groupTitle || action.groupKey || undefined,
      actions: [action],
    });
  }
  return Array.from(map.values());
}
