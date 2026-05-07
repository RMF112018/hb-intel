import type { PccLiveResponsiveMode, PccLiveViewportDefinition } from './pcc-live.breakpoint.types';

export const PCC_LIVE_RESPONSIVE_MODES = [
  'phone',
  'tabletPortrait',
  'tabletLandscape',
  'smallLaptop',
  'standardLaptop',
  'largeLaptop',
  'desktop',
  'ultrawide',
] as const;

export const PCC_LIVE_RESPONSIVE_COLUMNS: Record<PccLiveResponsiveMode, number> = {
  phone: 1,
  tabletPortrait: 2,
  tabletLandscape: 6,
  smallLaptop: 8,
  standardLaptop: 10,
  largeLaptop: 12,
  desktop: 12,
  ultrawide: 12,
};

export function resolvePccLiveResponsiveMode(inlineSizePx: number): PccLiveResponsiveMode {
  if (inlineSizePx < 480) return 'phone';
  if (inlineSizePx <= 768) return 'tabletPortrait';
  if (inlineSizePx <= 1024) return 'tabletLandscape';
  if (inlineSizePx <= 1180) return 'smallLaptop';
  if (inlineSizePx <= 1440) return 'standardLaptop';
  if (inlineSizePx <= 1599) return 'largeLaptop';
  if (inlineSizePx <= 1919) return 'desktop';
  return 'ultrawide';
}

export const PCC_LIVE_VIEWPORT_MATRIX = [
  { id: 'phone-390', label: 'Phone 390', width: 390, height: 844, touch: true },
  {
    id: 'tablet-portrait-768',
    label: 'Tablet Portrait 768',
    width: 768,
    height: 1024,
    touch: true,
  },
  {
    id: 'tablet-landscape-1024',
    label: 'Tablet Landscape 1024',
    width: 1024,
    height: 768,
    touch: true,
  },
  {
    id: 'small-laptop-1180',
    label: 'Small Laptop 1180',
    width: 1180,
    height: 820,
    touch: false,
  },
  {
    id: 'standard-laptop-1366',
    label: 'Standard Laptop 1366',
    width: 1366,
    height: 900,
    touch: false,
  },
  {
    id: 'large-laptop-1536',
    label: 'Large Laptop 1536',
    width: 1536,
    height: 960,
    touch: false,
  },
  {
    id: 'desktop-1728',
    label: 'Desktop 1728',
    width: 1728,
    height: 1117,
    touch: false,
  },
  {
    id: 'ultrawide-2048',
    label: 'Ultrawide 2048',
    width: 2048,
    height: 1280,
    touch: false,
  },
] as const satisfies readonly PccLiveViewportDefinition[];

type AssertTrue<T extends true> = T;
type _ModeCount = AssertTrue<(typeof PCC_LIVE_RESPONSIVE_MODES)['length'] extends 8 ? true : false>;
type _ViewportCount = AssertTrue<
  (typeof PCC_LIVE_VIEWPORT_MATRIX)['length'] extends 8 ? true : false
>;
