/**
 * `useSpotlightLayoutMode` — container-measurement resolver hook.
 *
 * Observes the Spotlight surface's own container (not the viewport) and
 * resolves the active `SpotlightLayoutMode` from usable width plus
 * vertical pressure. This is the authoritative runtime entry into the
 * mode system; `resolveSpotlightLayoutMode` is the pure equivalent
 * for tests and SSR-style deterministic rendering.
 *
 * First-paint strategy (Phase 02 Prompt 04):
 *   1. The fallback default is `'minimal'`, not `'wide'`. Any surface
 *      that cannot yet be measured reads as the most selective mode so
 *      narrow containers never emit a visible false-wide first paint.
 *   2. Measurement runs in `useLayoutEffect`. In client contexts that
 *      means the synchronous first `getBoundingClientRect` read replaces
 *      the conservative default before the browser paints — the user
 *      never sees the `'minimal'` fallback when the container is
 *      attached and laid out.
 *   3. `ResizeObserver` is attached in the same layout effect and
 *      drives subsequent container-aware transitions (SharePoint
 *      section resize, split-view toggles, nested mounts).
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
   * environments without `ResizeObserver`, or during SSR. Defaults to
   * `'minimal'` — the most selective posture — so a pre-measurement
   * commit can never over-furnish a narrow container.
   */
  readonly initialMode?: SpotlightLayoutMode;
}

export interface UseSpotlightLayoutModeResult {
  readonly mode: SpotlightLayoutMode;
  readonly ref: React.RefObject<HTMLElement | null>;
}

/**
 * `useLayoutEffect` logs a warning on the server. The Spotlight is a
 * client-only surface but the hook still prefers the SSR-safe alias so
 * consumers that render on the server (tests, tooling) do not see a
 * noisy warning — behavior is identical on the client where it matters.
 */
const useIsomorphicLayoutEffect =
  typeof window !== 'undefined' ? React.useLayoutEffect : React.useEffect;

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
  const { forceMode, initialMode = 'minimal' } = options;
  const ref = React.useRef<HTMLElement | null>(null);
  const [mode, setMode] = React.useState<SpotlightLayoutMode>(
    forceMode ?? initialMode,
  );

  useIsomorphicLayoutEffect(() => {
    if (forceMode) {
      setMode(forceMode);
      return;
    }
    const node = ref.current;
    if (!node) return;

    // Synchronous first-paint measurement. `useLayoutEffect` commits
    // this setState before the browser paints, so the conservative
    // `'minimal'` fallback never flashes when the container is
    // attached and laid out at mount time.
    const rect = node.getBoundingClientRect();
    const initial = resolveSpotlightLayoutMode({
      width: rect.width,
      height: rect.height,
    });
    setMode((prev) => (prev === initial ? prev : initial));

    if (typeof ResizeObserver === 'undefined') return;

    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (!entry) return;
      const target = (entry.target as HTMLElement).getBoundingClientRect();
      const width = entry.contentRect.width || target.width;
      const height = entry.contentRect.height || target.height;
      const next = resolveSpotlightLayoutMode({ width, height });
      setMode((prev) => (prev === next ? prev : next));
    });
    observer.observe(node);
    return () => observer.disconnect();
  }, [forceMode]);

  return { mode, ref };
}
