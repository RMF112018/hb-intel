import { useEffect, useState } from 'react';
import shell from './manageShell.module.css';

/** Breakpoint contract bands — see docs/breakpoint-contract.md */
export type ManageWidthBand =
  | 'wide-desktop'
  | 'desktop'
  | 'tablet-landscape'
  | 'tablet-portrait'
  | 'phone-portrait';

export interface ManageBreakpointContract {
  readonly widthBand: ManageWidthBand;
  /** Viewport height under ~640px — compress vertical rhythm */
  readonly shortHeight: boolean;
  /** Below ~360px — narrowest stable readable mode */
  readonly narrowestStable: boolean;
  /** Two-column registry + main when width allows governed row-sharing */
  readonly rowSharingEligible: boolean;
  readonly layoutGridClass: string;
}

function widthToBand(width: number): ManageWidthBand {
  if (width >= 1440) return 'wide-desktop';
  if (width >= 1024) return 'desktop';
  if (width >= 900) return 'tablet-landscape';
  if (width >= 600) return 'tablet-portrait';
  return 'phone-portrait';
}

export function useManageBreakpoint(): ManageBreakpointContract {
  const [dimensions, setDimensions] = useState(() => ({
    width: typeof window === 'undefined' ? 1280 : window.innerWidth,
    height: typeof window === 'undefined' ? 900 : window.innerHeight,
  }));

  useEffect(() => {
    const onResize = (): void => {
      setDimensions({ width: window.innerWidth, height: window.innerHeight });
    };
    window.addEventListener('resize', onResize);
    return (): void => window.removeEventListener('resize', onResize);
  }, []);

  const { width, height } = dimensions;
  const shortHeight = height < 640;
  const narrowestStable = width < 360;
  const rowSharingEligible = width >= 1100 && !narrowestStable;
  const layoutGridClass =
    width >= 960 && rowSharingEligible ? shell.layoutTwoCol : shell.layoutStacked;

  return {
    widthBand: widthToBand(width),
    shortHeight,
    narrowestStable,
    rowSharingEligible,
    layoutGridClass,
  };
}
