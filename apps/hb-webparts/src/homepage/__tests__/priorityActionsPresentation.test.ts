import { describe, expect, it } from 'vitest';
import {
  resolveLauncherPresentation,
  resolvePriorityRailDeviceForContainer,
  resolvePriorityRailPresentationForDevice,
  buildPriorityRailSections,
} from '../data/priorityActionsPresentation.js';

describe('priorityActionsPresentation — launcher band', () => {
  it('maps container dimensions to rail device classes via shell policy', () => {
    expect(resolvePriorityRailDeviceForContainer({ width: 1700, height: 900 }).deviceClass).toBe('desktop');
    expect(resolvePriorityRailDeviceForContainer({ width: 1300, height: 900 }).deviceClass).toBe('laptop');
    expect(resolvePriorityRailDeviceForContainer({ width: 1000, height: 900 }).deviceClass).toBe('tabletLandscape');
    expect(resolvePriorityRailDeviceForContainer({ width: 860, height: 900 }).deviceClass).toBe('tabletPortrait');
    expect(resolvePriorityRailDeviceForContainer({ width: 700, height: 900 }).deviceClass).toBe('phone');
  });

  it('applies short-height override mapping through shell policy', () => {
    const result = resolvePriorityRailDeviceForContainer({ width: 1000, height: 420 });
    expect(result.shortHeightConstrained).toBe(true);
  });

  it('resolveLauncherPresentation picks sheet overflow on phone + short-height, menu elsewhere', () => {
    const desktop = resolveLauncherPresentation({
      deviceClass: 'desktop', shortHeightConstrained: false,
    } as Parameters<typeof resolveLauncherPresentation>[0]);
    expect(desktop.overflowStrategy).toBe('menu');

    const laptop = resolveLauncherPresentation({
      deviceClass: 'laptop', shortHeightConstrained: false,
    } as Parameters<typeof resolveLauncherPresentation>[0]);
    expect(laptop.overflowStrategy).toBe('menu');

    const phone = resolveLauncherPresentation({
      deviceClass: 'phone', shortHeightConstrained: false,
    } as Parameters<typeof resolveLauncherPresentation>[0]);
    expect(phone.overflowStrategy).toBe('sheet');

    const shortHeight = resolveLauncherPresentation({
      deviceClass: 'desktop', shortHeightConstrained: true,
    } as Parameters<typeof resolveLauncherPresentation>[0]);
    expect(shortHeight.overflowStrategy).toBe('sheet');
  });

  it('resolvePriorityRailPresentationForDevice shim returns uniform rail layout with device-only overflow choice', () => {
    expect(resolvePriorityRailPresentationForDevice({}, 'desktop').layout).toBe('rail');
    expect(resolvePriorityRailPresentationForDevice({}, 'desktop').overflowStrategy).toBe('menu');
    expect(resolvePriorityRailPresentationForDevice({}, 'phone').overflowStrategy).toBe('sheet');
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
