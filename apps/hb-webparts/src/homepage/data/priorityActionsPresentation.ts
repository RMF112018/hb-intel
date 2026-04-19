/**
 * Priority Actions presentation — launcher band.
 *
 * Shared presentation helpers for two adjacent surfaces:
 * - homepage launcher band (`HbHomepageLauncherBand` + `HbcHomepageLauncher`)
 * - standalone rail webpart (`PriorityActionsRail` + `HbcPriorityRailSurface`)
 *
 * The hosted homepage authority is the launcher band path above. This file
 * keeps shared device/overflow helpers so both paths can remain aligned.
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
import type { SharedEntryStateSnapshot } from '../../webparts/hbHomepage/shell/useShellContainer.js';
import type { DeviceClass } from './priorityActionsNormalization.js';

export interface PriorityRailContainerDimensions {
  width: number;
  height: number;
}

export type PriorityRailOverflowStrategy = 'inline-disclosure' | 'menu' | 'sheet';
export type LauncherHandheldMode = 'standard' | 'single-entry-all-tools';
export type LauncherDrawerSource = 'overflow-only' | 'all-tools';
export type LauncherCapGovernance = 'binding-visible-cap' | 'all-tools-drawer';

export interface LauncherGovernanceDecision {
  handheldMode: LauncherHandheldMode;
  overflowStrategy: PriorityRailOverflowStrategy;
  drawerSource: LauncherDrawerSource;
  capGovernance: LauncherCapGovernance;
  isHandheld: boolean;
}

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
  densityPosture: 'airy' | 'comfortable' | 'compact';
  launcherHandheldMode: LauncherHandheldMode;
  launcherDrawerSource: LauncherDrawerSource;
  launcherCapGovernance: LauncherCapGovernance;
  launcherGovernance: LauncherGovernanceDecision;
}

export interface PriorityRailPresentationResolution {
  deviceClass: DeviceClass;
  shellState: ShellEntryStateId;
  layout: PriorityRailLayoutMode;
  overflowStrategy: PriorityRailOverflowStrategy;
  launcherHandheldMode: LauncherHandheldMode;
  launcherDrawerSource: LauncherDrawerSource;
  launcherCapGovernance: LauncherCapGovernance;
  launcherGovernance: LauncherGovernanceDecision;
  /** Back-compat field. The launcher band has no authored layout matrix. */
  authoredLayoutMode: string;
  /** Back-compat field. The launcher band applies no normalization steps. */
  normalizations: readonly string[];
}

function castRailDeviceClass(device: PriorityActionsDeviceClass): DeviceClass {
  return device;
}

function resolveLauncherDensityPosture(
  shellState: ShellEntryStateId,
): PriorityRailDeviceResolution['densityPosture'] {
  switch (shellState) {
    case 'ultrawide-desktop':
      return 'airy';
    case 'standard-laptop':
    case 'tablet-landscape':
      return 'comfortable';
    default:
      return 'compact';
  }
}

export function resolveLauncherHandheldMode(
  resolution: Pick<PriorityRailDeviceResolution, 'deviceClass' | 'shortHeightConstrained'>,
): LauncherHandheldMode {
  return resolution.deviceClass === 'phone' || resolution.shortHeightConstrained
    ? 'single-entry-all-tools'
    : 'standard';
}

export function resolveLauncherGovernance(
  resolution: Pick<PriorityRailDeviceResolution, 'deviceClass' | 'shortHeightConstrained'>,
): LauncherGovernanceDecision {
  const handheldMode = resolveLauncherHandheldMode(resolution);
  const isHandheld = handheldMode === 'single-entry-all-tools';
  return {
    handheldMode,
    overflowStrategy: isHandheld ? 'sheet' : 'menu',
    drawerSource: isHandheld ? 'all-tools' : 'overflow-only',
    capGovernance: isHandheld ? 'all-tools-drawer' : 'binding-visible-cap',
    isHandheld,
  };
}

export function resolvePriorityRailDeviceForEntryState(
  entryState: SharedEntryStateSnapshot,
): PriorityRailDeviceResolution {
  const deviceClass = castRailDeviceClass(
    mapShellEntryStateToPriorityActionsDeviceClass(entryState.entryState.id),
  );
  const launcherGovernance = resolveLauncherGovernance({
    deviceClass,
    shortHeightConstrained: entryState.shortHeightConstrained,
  });
  return {
    deviceClass,
    shellState: entryState.entryState.id,
    entryStateReason: entryState.entryStateReason,
    shortHeightConstrained: entryState.shortHeightConstrained,
    densityPosture: resolveLauncherDensityPosture(entryState.entryState.id),
    launcherHandheldMode: launcherGovernance.handheldMode,
    launcherDrawerSource: launcherGovernance.drawerSource,
    launcherCapGovernance: launcherGovernance.capGovernance,
    launcherGovernance,
  };
}

export function resolvePriorityRailDeviceForContainer(
  dimensions: PriorityRailContainerDimensions,
): PriorityRailDeviceResolution {
  const resolved = resolveEntryStateWithReason({ width: dimensions.width, height: dimensions.height });
  return resolvePriorityRailDeviceForEntryState({
    entryState: resolved.state,
    entryStateReason: resolved.reason,
    shortHeightConstrained: resolved.shortHeightConstrained,
  });
}

/**
 * Launcher presentation resolution used by the standalone rail surface.
 * The presentation decision is overflow strategy only: sheet on handheld /
 * short-height, menu everywhere else.
 */
export function resolveLauncherPresentation(
  resolution: PriorityRailDeviceResolution,
): PriorityRailPresentationResolution {
  const launcherHandheldMode =
    resolution.launcherHandheldMode ??
    resolveLauncherHandheldMode({
      deviceClass: resolution.deviceClass,
      shortHeightConstrained: resolution.shortHeightConstrained,
    });
  const launcherGovernance =
    resolution.launcherGovernance ??
    resolveLauncherGovernance({
      deviceClass: resolution.deviceClass,
      shortHeightConstrained: resolution.shortHeightConstrained,
    });
  return {
    deviceClass: resolution.deviceClass,
    shellState: mapPriorityActionsDeviceClassToShellState(resolution.deviceClass as PriorityActionsDeviceClass),
    layout: 'rail',
    overflowStrategy: launcherGovernance.overflowStrategy,
    launcherHandheldMode,
    launcherDrawerSource:
      resolution.launcherDrawerSource ?? launcherGovernance.drawerSource,
    launcherCapGovernance:
      resolution.launcherCapGovernance ?? launcherGovernance.capGovernance,
    launcherGovernance,
    authoredLayoutMode: 'launcher',
    normalizations: [],
  };
}

/**
 * Backward-compatibility shim. The authored-layout matrix was torn
 * down in favor of a uniform device-only resolution and ignores the
 * config matrix. Layout/cap fields remain list-stored for compatibility,
 * but do not govern homepage launcher runtime.
 */
export function resolvePriorityRailPresentationForDevice(
  _config: unknown,
  deviceClass: DeviceClass,
): PriorityRailPresentationResolution {
  const isHandheld = deviceClass === 'phone';
  const launcherGovernance: LauncherGovernanceDecision = {
    handheldMode: isHandheld ? 'single-entry-all-tools' : 'standard',
    overflowStrategy: isHandheld ? 'sheet' : 'menu',
    drawerSource: isHandheld ? 'all-tools' : 'overflow-only',
    capGovernance: isHandheld ? 'all-tools-drawer' : 'binding-visible-cap',
    isHandheld,
  };
  return {
    deviceClass,
    shellState: mapPriorityActionsDeviceClassToShellState(deviceClass as PriorityActionsDeviceClass),
    layout: 'rail',
    overflowStrategy: launcherGovernance.overflowStrategy,
    launcherHandheldMode: launcherGovernance.handheldMode,
    launcherDrawerSource: launcherGovernance.drawerSource,
    launcherCapGovernance: launcherGovernance.capGovernance,
    launcherGovernance,
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
