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

/**
 * Pure threshold ladder for the My Work shell. Aligned to PCC's documented
 * breakpoint policy (smallLaptop ≤ 1180, largeLaptop ≤ 1599, desktop ≤ 1919).
 */
export function resolveMyWorkResponsiveMode(inlineSizePx: number): MyWorkResponsiveMode {
  if (inlineSizePx < 480) return 'phone';
  if (inlineSizePx <= 768) return 'tabletPortrait';
  if (inlineSizePx <= 1024) return 'tabletLandscape';
  if (inlineSizePx <= 1180) return 'smallLaptop';
  if (inlineSizePx <= 1440) return 'standardLaptop';
  if (inlineSizePx <= 1599) return 'largeLaptop';
  if (inlineSizePx <= 1919) return 'desktop';
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
        const width =
          entry.contentBoxSize?.[0]?.inlineSize ??
          entry.contentRect?.width ??
          node.getBoundingClientRect().width;
        setMode(resolveMyWorkResponsiveMode(width));
      }
    });
    observer.observe(node);
    return () => observer.disconnect();
  }, [forceMode, ref]);

  return forceMode ?? mode;
}
