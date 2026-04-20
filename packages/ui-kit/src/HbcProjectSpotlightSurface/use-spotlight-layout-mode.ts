/**
 * `useSpotlightLayoutMode` — container-measurement resolver hook.
 *
 * Observes the Spotlight surface's own container (not the viewport) and
 * resolves the active `SpotlightLayoutMode` from usable width plus
 * vertical pressure. This is the authoritative runtime entry into the
 * mode system; `resolveSpotlightLayoutMode` is the pure equivalent
 * for tests and SSR-style deterministic rendering.
 */
import * as React from 'react';
import {
  resolveSpotlightLayoutMode,
  type SpotlightLayoutMode,
} from './layout-mode.js';

export interface UseSpotlightLayoutModeOptions {
  /**
   * Optional mode override. When provided, the hook skips measurement
   * and returns the forced mode verbatim. Useful for stories and
   * deterministic snapshot tests.
   */
  readonly forceMode?: SpotlightLayoutMode;
  /**
   * Fallback mode used before the first measurement settles, for
   * environments without `ResizeObserver`, or during SSR.
   */
  readonly initialMode?: SpotlightLayoutMode;
}

export interface UseSpotlightLayoutModeResult {
  readonly mode: SpotlightLayoutMode;
  readonly ref: React.RefObject<HTMLElement | null>;
}

/**
 * Returns the active layout mode for the Spotlight surface along with a
 * ref to attach to the surface's root element. The hook reads
 * `contentBoxSize` from a `ResizeObserver` so it responds to real
 * container size changes (SharePoint section resize, split-view
 * toggles, nested mounts), not to viewport media queries.
 */
export function useSpotlightLayoutMode(
  options: UseSpotlightLayoutModeOptions = {},
): UseSpotlightLayoutModeResult {
  const { forceMode, initialMode = 'wide' } = options;
  const ref = React.useRef<HTMLElement | null>(null);
  const [mode, setMode] = React.useState<SpotlightLayoutMode>(
    forceMode ?? initialMode,
  );

  React.useEffect(() => {
    if (forceMode) {
      setMode(forceMode);
      return;
    }
    const node = ref.current;
    if (!node) return;
    if (typeof ResizeObserver === 'undefined') {
      const rect = node.getBoundingClientRect();
      setMode(
        resolveSpotlightLayoutMode({ width: rect.width, height: rect.height }),
      );
      return;
    }

    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (!entry) return;
      const rect = (entry.target as HTMLElement).getBoundingClientRect();
      const width = entry.contentRect.width || rect.width;
      const height = entry.contentRect.height || rect.height;
      const next = resolveSpotlightLayoutMode({ width, height });
      setMode((prev) => (prev === next ? prev : next));
    });
    observer.observe(node);
    return () => observer.disconnect();
  }, [forceMode]);

  return { mode, ref };
}
