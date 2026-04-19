import { describe, expect, it } from 'vitest';
import {
  resolvePriorityRailDeviceForEntryState,
  resolveLauncherPresentation,
  resolvePriorityRailDeviceForContainer,
  resolvePriorityRailPresentationForDevice,
  buildPriorityRailSections,
} from '../data/priorityActionsPresentation.js';
import { resolveEntryStateWithReason } from '../../webparts/hbHomepage/shell/breakpointPolicy.js';

describe('priorityActionsPresentation — launcher band', () => {
  it('maps shared shell entry-state snapshots without reclassifying breakpoints', () => {
    const resolved = resolveEntryStateWithReason({ width: 1560, height: 900 });
    const result = resolvePriorityRailDeviceForEntryState({
      entryState: resolved.state,
      entryStateReason: resolved.reason,
      shortHeightConstrained: resolved.shortHeightConstrained,
    });
    expect(result.shellState).toBe('standard-laptop');
    expect(result.deviceClass).toBe('laptop');
    expect(result.entryStateReason).toBe('width-match');
    expect(result.densityPosture).toBe('comfortable');
  });

  it('maps container dimensions to rail device classes via shell policy', () => {
    expect(resolvePriorityRailDeviceForContainer({ width: 1700, height: 900 }).deviceClass).toBe('desktop');
    expect(resolvePriorityRailDeviceForContainer({ width: 1300, height: 900 }).deviceClass).toBe('laptop');
    expect(resolvePriorityRailDeviceForContainer({ width: 1000, height: 900 }).deviceClass).toBe('tabletLandscape');
    expect(resolvePriorityRailDeviceForContainer({ width: 860, height: 900 }).deviceClass).toBe('tabletPortrait');
    expect(resolvePriorityRailDeviceForContainer({ width: 700, height: 900 }).deviceClass).toBe('phone');
  });

  it('keeps launcher classification aligned with shell state across key width transitions', () => {
    const at1600 = resolveEntryStateWithReason({ width: 1600, height: 900 });
    const below1600 = resolveEntryStateWithReason({ width: 1599, height: 900 });
    const at1180 = resolveEntryStateWithReason({ width: 1180, height: 900 });
    const below1180 = resolveEntryStateWithReason({ width: 1179, height: 900 });

    expect(
      resolvePriorityRailDeviceForEntryState({
        entryState: at1600.state,
        entryStateReason: at1600.reason,
        shortHeightConstrained: at1600.shortHeightConstrained,
      }).deviceClass,
    ).toBe('desktop');
    expect(
      resolvePriorityRailDeviceForEntryState({
        entryState: below1600.state,
        entryStateReason: below1600.reason,
        shortHeightConstrained: below1600.shortHeightConstrained,
      }).deviceClass,
    ).toBe('laptop');
    expect(
      resolvePriorityRailDeviceForEntryState({
        entryState: at1180.state,
        entryStateReason: at1180.reason,
        shortHeightConstrained: at1180.shortHeightConstrained,
      }).deviceClass,
    ).toBe('laptop');
    expect(
      resolvePriorityRailDeviceForEntryState({
        entryState: below1180.state,
        entryStateReason: below1180.reason,
        shortHeightConstrained: below1180.shortHeightConstrained,
      }).deviceClass,
    ).toBe('tabletLandscape');
  });

  it('applies short-height override mapping through shell policy', () => {
    const result = resolvePriorityRailDeviceForContainer({ width: 1000, height: 420 });
    expect(result.shortHeightConstrained).toBe(true);
    expect(result.densityPosture).toBe('compact');
    expect(result.launcherHandheldMode).toBe('single-entry-all-tools');
  });

  it('resolveLauncherPresentation picks sheet overflow on phone + short-height, menu elsewhere', () => {
    const desktop = resolveLauncherPresentation({
      deviceClass: 'desktop', shortHeightConstrained: false,
    } as Parameters<typeof resolveLauncherPresentation>[0]);
    expect(desktop.overflowStrategy).toBe('menu');
    expect(desktop.launcherHandheldMode).toBe('standard');

    const laptop = resolveLauncherPresentation({
      deviceClass: 'laptop', shortHeightConstrained: false,
    } as Parameters<typeof resolveLauncherPresentation>[0]);
    expect(laptop.overflowStrategy).toBe('menu');

    const phone = resolveLauncherPresentation({
      deviceClass: 'phone', shortHeightConstrained: false,
    } as Parameters<typeof resolveLauncherPresentation>[0]);
    expect(phone.overflowStrategy).toBe('sheet');
    expect(phone.launcherHandheldMode).toBe('single-entry-all-tools');

    const shortHeight = resolveLauncherPresentation({
      deviceClass: 'desktop', shortHeightConstrained: true,
    } as Parameters<typeof resolveLauncherPresentation>[0]);
    expect(shortHeight.overflowStrategy).toBe('sheet');
    expect(shortHeight.launcherHandheldMode).toBe('single-entry-all-tools');
  });

  it('resolvePriorityRailPresentationForDevice shim returns uniform rail layout with device-only overflow choice', () => {
    expect(resolvePriorityRailPresentationForDevice({}, 'desktop').layout).toBe('rail');
    expect(resolvePriorityRailPresentationForDevice({}, 'desktop').overflowStrategy).toBe('menu');
    expect(resolvePriorityRailPresentationForDevice({}, 'phone').overflowStrategy).toBe('sheet');
    expect(resolvePriorityRailPresentationForDevice({}, 'phone').launcherHandheldMode).toBe(
      'single-entry-all-tools',
    );
  });

  it('buildPriorityRailSections shim groups by first-seen order without featured promotion', () => {
    const sections = buildPriorityRailSections([
      { id: 'a', title: 'A', href: '/a', groupKey: 'approvals', groupTitle: 'Approvals' },
      { id: 'b', title: 'B', href: '/b', groupKey: 'safety', groupTitle: 'Safety' },
      { id: 'c', title: 'C', href: '/c', groupKey: 'approvals', groupTitle: 'Approvals' },
    ]);
    expect(sections?.map((s) => s.key)).toEqual(['approvals', 'safety']);
    expect(sections?.[0]?.actions.map((a) => a.id)).toEqual(['a', 'c']);
    // Launcher has no featured slot.
    for (const s of sections ?? []) {
      expect((s as { featured?: unknown }).featured).toBeUndefined();
    }
  });
});
