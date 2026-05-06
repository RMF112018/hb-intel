import { useEffect, useRef, useState, type RefObject } from 'react';
import { resolveResponsiveMode, type PccResponsiveMode } from './footprints';

export interface UseContainerBreakpointResult {
  ref: RefObject<HTMLDivElement>;
  mode: PccResponsiveMode;
  inlineSize: number;
}

export function useContainerBreakpoint(
  initialMode: PccResponsiveMode = 'standardLaptop',
): UseContainerBreakpointResult {
  const ref = useRef<HTMLDivElement>(null);
  const [mode, setMode] = useState<PccResponsiveMode>(initialMode);
  const [inlineSize, setInlineSize] = useState(0);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    if (typeof ResizeObserver === 'undefined') return;

    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (!entry) return;
      const width = entry.contentBoxSize?.[0]?.inlineSize ?? entry.contentRect.width;
      setInlineSize(width);
      setMode(resolveResponsiveMode(width));
    });
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return { ref, mode, inlineSize };
}
