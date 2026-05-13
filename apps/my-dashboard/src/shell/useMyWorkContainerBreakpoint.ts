import { useEffect, useState, type RefObject } from 'react';

export const MY_WORK_RESPONSIVE_MODES = [
  'phone',
  'tabletPortrait',
  'tabletLandscape',
  'smallLaptop',
  'standardLaptop',
  'largeLaptop',
  'desktop',
  'ultrawide',
] as const;

export type MyWorkResponsiveMode = (typeof MY_WORK_RESPONSIVE_MODES)[number];

const DEFAULT_MODE: MyWorkResponsiveMode = 'standardLaptop';

function widthToMode(width: number): MyWorkResponsiveMode {
  if (width < 480) return 'phone';
  if (width < 768) return 'tabletPortrait';
  if (width < 1024) return 'tabletLandscape';
  if (width < 1200) return 'smallLaptop';
  if (width < 1440) return 'standardLaptop';
  if (width < 1680) return 'largeLaptop';
  if (width < 1920) return 'desktop';
  return 'ultrawide';
}

/**
 * Derive a responsive mode token from the observed container width.
 *
 * `forceMode` (test-only) short-circuits the observer and is returned
 * directly. In jsdom (no `ResizeObserver`), the hook stays on its
 * initial mode, which keeps unit tests deterministic.
 */
export function useMyWorkContainerBreakpoint(
  ref: RefObject<HTMLElement>,
  forceMode?: MyWorkResponsiveMode,
): MyWorkResponsiveMode {
  const [mode, setMode] = useState<MyWorkResponsiveMode>(forceMode ?? DEFAULT_MODE);

  useEffect(() => {
    if (forceMode) {
      setMode(forceMode);
      return;
    }
    const node = ref.current;
    if (!node) return;
    if (typeof ResizeObserver === 'undefined') return;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const width = entry.contentRect?.width ?? node.getBoundingClientRect().width;
        setMode(widthToMode(width));
      }
    });
    observer.observe(node);
    return () => observer.disconnect();
  }, [forceMode, ref]);

  return forceMode ?? mode;
}
