import { describe, expect, it } from 'vitest';
import {
  buildPriorityRailSections,
  resolvePriorityRailDeviceForContainer,
  resolvePriorityRailPresentationForDevice,
} from '../data/priorityActionsPresentation.js';

const CONFIG = {
  desktopLayoutMode: 'segmented',
  tabletLayoutMode: 'hybrid',
  mobileLayoutMode: 'grid',
} as const;

describe('priorityActionsPresentation', () => {
  it('maps container dimensions to rail device classes via shell policy', () => {
    expect(resolvePriorityRailDeviceForContainer({ width: 1700, height: 900 }).deviceClass).toBe('desktop');
    expect(resolvePriorityRailDeviceForContainer({ width: 1300, height: 900 }).deviceClass).toBe('laptop');
    expect(resolvePriorityRailDeviceForContainer({ width: 1000, height: 900 }).deviceClass).toBe('tabletLandscape');
    expect(resolvePriorityRailDeviceForContainer({ width: 860, height: 900 }).deviceClass).toBe('tabletPortrait');
    expect(resolvePriorityRailDeviceForContainer({ width: 700, height: 900 }).deviceClass).toBe('phone');
  });

  it('applies short-height override mapping through shell policy', () => {
    const result = resolvePriorityRailDeviceForContainer({ width: 1000, height: 420 });
    expect(result.deviceClass).toBe('phone');
    expect(result.shortHeightConstrained).toBe(true);
    expect(result.entryStateReason).toBe('short-height-override');
  });

  it('returns a full inspectable resolution (device, shell state, reason, short-height) for standard-laptop', () => {
    const result = resolvePriorityRailDeviceForContainer({ width: 1300, height: 900 });
    expect(result.deviceClass).toBe('laptop');
    expect(result.shellState).toBe('standard-laptop');
    expect(result.shortHeightConstrained).toBe(false);
    expect(typeof result.entryStateReason).toBe('string');
    expect(result.entryStateReason.length).toBeGreaterThan(0);
  });

  it('resolves authored layout modes into explicit runtime behavior with normalization flags', () => {
    const desktop = resolvePriorityRailPresentationForDevice(CONFIG, 'desktop');
    expect(desktop.layout).toBe('grid');
    // Prompt-04: desktop/laptop/tablet overflow is an anchored secondary
    // command layer, not an inline appended list.
    expect(desktop.overflowStrategy).toBe('menu');
    expect(desktop.normalizations).toEqual(['desktop-segmented-to-grid']);

    // Prompt-05: tabletPortrait decisively steps into `compact` rather
    // than sharing tabletLandscape's rail, so the narrow-tablet state is
    // a materially different mode, not a compressed rail.
    const tablet = resolvePriorityRailPresentationForDevice(CONFIG, 'tabletPortrait');
    expect(tablet.layout).toBe('compact');
    expect(tablet.overflowStrategy).toBe('menu');
    expect(tablet.normalizations).toEqual(['tablet-portrait-to-compact']);

    const tabletLandscape = resolvePriorityRailPresentationForDevice(CONFIG, 'tabletLandscape');
    expect(tabletLandscape.layout).toBe('rail');
    expect(tabletLandscape.normalizations).toEqual(['tablet-hybrid-to-rail']);

    const phone = resolvePriorityRailPresentationForDevice(CONFIG, 'phone');
    expect(phone.layout).toBe('compact');
    expect(phone.overflowStrategy).toBe('menu');
    expect(phone.normalizations).toEqual(['mobile-grid-to-compact-menu']);
  });

  it('Prompt-04 overflow-strategy matrix: desktop/tablet → menu, phone sheet-trigger → sheet, phone scroll → inline-disclosure', () => {
    const desktopRail = resolvePriorityRailPresentationForDevice(
      { desktopLayoutMode: 'rail', tabletLayoutMode: 'rail', mobileLayoutMode: 'scroll' },
      'desktop',
    );
    expect(desktopRail.overflowStrategy).toBe('menu');

    const laptopHybrid = resolvePriorityRailPresentationForDevice(
      { desktopLayoutMode: 'hybrid', tabletLayoutMode: 'rail', mobileLayoutMode: 'scroll' },
      'laptop',
    );
    expect(laptopHybrid.overflowStrategy).toBe('menu');

    const tabletLandscapeGrid = resolvePriorityRailPresentationForDevice(
      { desktopLayoutMode: 'rail', tabletLayoutMode: 'grid', mobileLayoutMode: 'scroll' },
      'tabletLandscape',
    );
    expect(tabletLandscapeGrid.overflowStrategy).toBe('menu');

    const tabletPortraitRail = resolvePriorityRailPresentationForDevice(
      { desktopLayoutMode: 'rail', tabletLayoutMode: 'rail', mobileLayoutMode: 'scroll' },
      'tabletPortrait',
    );
    expect(tabletPortraitRail.overflowStrategy).toBe('menu');

    const phoneSheet = resolvePriorityRailPresentationForDevice(
      { desktopLayoutMode: 'rail', tabletLayoutMode: 'rail', mobileLayoutMode: 'sheet-trigger' },
      'phone',
    );
    expect(phoneSheet.overflowStrategy).toBe('sheet');

    const phoneScroll = resolvePriorityRailPresentationForDevice(
      { desktopLayoutMode: 'rail', tabletLayoutMode: 'rail', mobileLayoutMode: 'scroll' },
      'phone',
    );
    expect(phoneScroll.overflowStrategy).toBe('inline-disclosure');
  });

  it('Prompt-05 layout-divergence matrix produces materially different layouts across device classes', () => {
    // Desktop hybrid → grid (wide confident flagship field)
    const desktopHybrid = resolvePriorityRailPresentationForDevice(
      { desktopLayoutMode: 'hybrid', tabletLayoutMode: 'rail', mobileLayoutMode: 'scroll' },
      'desktop',
    );
    expect(desktopHybrid.layout).toBe('grid');
    expect(desktopHybrid.normalizations).toEqual(['desktop-hybrid-to-grid']);

    // Laptop hybrid → rail (narrower, stays a rail)
    const laptopHybrid = resolvePriorityRailPresentationForDevice(
      { desktopLayoutMode: 'hybrid', tabletLayoutMode: 'rail', mobileLayoutMode: 'scroll' },
      'laptop',
    );
    expect(laptopHybrid.layout).toBe('rail');
    expect(laptopHybrid.normalizations).toEqual(['desktop-hybrid-to-rail']);

    // TabletLandscape keeps authored mode (rail stays rail, grid stays grid)
    const tabletLandscapeRail = resolvePriorityRailPresentationForDevice(
      { desktopLayoutMode: 'rail', tabletLayoutMode: 'rail', mobileLayoutMode: 'scroll' },
      'tabletLandscape',
    );
    expect(tabletLandscapeRail.layout).toBe('rail');
    const tabletLandscapeGrid = resolvePriorityRailPresentationForDevice(
      { desktopLayoutMode: 'rail', tabletLayoutMode: 'grid', mobileLayoutMode: 'scroll' },
      'tabletLandscape',
    );
    expect(tabletLandscapeGrid.layout).toBe('grid');

    // TabletPortrait collapses to `compact` across ALL tablet modes —
    // decisive step away from landscape, so the narrow-tablet state is a
    // genuinely different mode (not a squeezed rail).
    for (const tabletLayoutMode of ['rail', 'grid', 'hybrid'] as const) {
      const result = resolvePriorityRailPresentationForDevice(
        { desktopLayoutMode: 'rail', tabletLayoutMode, mobileLayoutMode: 'scroll' },
        'tabletPortrait',
      );
      expect(result.layout).toBe('compact');
      expect(result.normalizations).toEqual(['tablet-portrait-to-compact']);
    }

    // Phone always simplifies decisively to `compact` and diverges only
    // via overflow strategy.
    for (const mobileLayoutMode of ['scroll', 'grid', 'sheet-trigger'] as const) {
      const result = resolvePriorityRailPresentationForDevice(
        { desktopLayoutMode: 'rail', tabletLayoutMode: 'rail', mobileLayoutMode },
        'phone',
      );
      expect(result.layout).toBe('compact');
    }
  });

  it('builds deterministic grouped sections from first-seen group order', () => {
    const sections = buildPriorityRailSections([
      { id: 'a', title: 'A', href: '/a', groupKey: 'approvals', groupTitle: 'Approvals' },
      { id: 'b', title: 'B', href: '/b', groupKey: 'safety', groupTitle: 'Safety' },
      { id: 'c', title: 'C', href: '/c', groupKey: 'approvals', groupTitle: 'Approvals' },
    ]);

    expect(sections?.map((section) => section.key)).toEqual(['approvals', 'safety']);
    expect(sections?.[0]?.actions.map((action: { id: string }) => action.id)).toEqual(['a', 'c']);
  });

  it('promotes wrapper-declared featuredActionKeys into section.featured', () => {
    const sections = buildPriorityRailSections(
      [
        { id: 'a', title: 'A', href: '/a', groupKey: 'approvals', groupTitle: 'Approvals' },
        { id: 'b', title: 'B', href: '/b', groupKey: 'approvals', groupTitle: 'Approvals' },
        { id: 'c', title: 'C', href: '/c', groupKey: 'safety', groupTitle: 'Safety' },
      ],
      { featuredActionKeys: ['b'] },
    );
    const approvals = sections?.find((section) => section.key === 'approvals');
    expect(approvals?.featured?.id).toBe('b');
    const safety = sections?.find((section) => section.key === 'safety');
    expect(safety?.featured).toBeUndefined();
  });

  it('falls back to critical > warning badge variant when no featuredActionKeys match', () => {
    const sections = buildPriorityRailSections([
      {
        id: 'x',
        title: 'X',
        href: '/x',
        groupKey: 'approvals',
        groupTitle: 'Approvals',
        badge: { label: 'Warn', variant: 'warning' },
      },
      {
        id: 'y',
        title: 'Y',
        href: '/y',
        groupKey: 'approvals',
        groupTitle: 'Approvals',
        badge: { label: 'Crit', variant: 'critical' },
      },
    ]);
    const approvals = sections?.[0];
    expect(approvals?.featured?.id).toBe('y');
  });

  it('returns no featured assignment when no keys match and no critical/warning badge exists', () => {
    const sections = buildPriorityRailSections(
      [
        { id: 'a', title: 'A', href: '/a', groupKey: 'approvals', groupTitle: 'Approvals' },
        { id: 'b', title: 'B', href: '/b', groupKey: 'approvals', groupTitle: 'Approvals' },
      ],
      { featuredActionKeys: ['does-not-exist'] },
    );
    expect(sections?.[0]?.featured).toBeUndefined();
  });
});
