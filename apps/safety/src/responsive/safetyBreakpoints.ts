import { useEffect, useState, type RefObject } from 'react';

/**
 * Safety app responsive contract (Phase-04 audit G-02 foundation).
 *
 * The Safety app runs inside an SPFx webpart inside a SharePoint page canvas.
 * Raw viewport width does not reflect the real usable layout slot — a narrow
 * hosted section can render in a wide viewport and vice versa. This module
 * establishes one coherent mode contract derived from the actual Safety app
 * content container's width via ResizeObserver.
 *
 * This is an internal contract. Nothing is exported from the package. The
 * mode string is written to a `data-safety-mode` attribute on the app
 * content container by App.tsx; in-scope page surfaces opt in via
 * `[data-safety-mode="..."]` selectors in webpart.css.
 */

export type SafetyLayoutMode = 'minimal' | 'compact' | 'medium' | 'wide';

/**
 * Mode thresholds (px, on the observed content container's inline width).
 *
 * A mode is selected when the observed width is >= its threshold, with the
 * smallest mode ("minimal") being the fall-through. Thresholds are chosen
 * so each mode represents a real change in affordance density, not viewport
 * reflow: "wide" enables multi-column primary layouts, "medium" keeps them
 * dense but stacks secondary columns, "compact" collapses to single-column
 * but preserves cluster spacing, "minimal" is phone-portrait fallback.
 */
export const SAFETY_LAYOUT_THRESHOLDS = {
  compact: 540,
  medium: 840,
  wide: 1100,
} as const;

export function resolveSafetyLayoutMode(widthPx: number): SafetyLayoutMode {
  if (widthPx >= SAFETY_LAYOUT_THRESHOLDS.wide) return 'wide';
  if (widthPx >= SAFETY_LAYOUT_THRESHOLDS.medium) return 'medium';
  if (widthPx >= SAFETY_LAYOUT_THRESHOLDS.compact) return 'compact';
  return 'minimal';
}

/**
 * Hook: derives the Safety layout mode from the observed width of the
 * element targeted by `ref`. The ref must point at the real app content
 * container — not `document.documentElement`, not a shell-owned outer
 * wrapper, and not any element whose width does not reflect the usable
 * layout slot in hosted SPFx conditions.
 *
 * SSR-safe: defaults to "wide" when ResizeObserver is unavailable or the
 * ref is not yet mounted. The attribute write driven from this hook is a
 * layout hint, not a correctness gate.
 */
export function useSafetyLayoutMode(ref: RefObject<HTMLElement | null>): SafetyLayoutMode {
  const [mode, setMode] = useState<SafetyLayoutMode>('wide');

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof ResizeObserver === 'undefined') {
      setMode(resolveSafetyLayoutMode(el.getBoundingClientRect().width));
      return;
    }

    const update = (widthPx: number): void => {
      const next = resolveSafetyLayoutMode(widthPx);
      setMode((prev) => (prev === next ? prev : next));
    };

    // Seed with the current measured width before the observer fires.
    update(el.getBoundingClientRect().width);

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        // Prefer contentBoxSize when available (per-axis), fall back to
        // contentRect for older engines.
        const inlineSize =
          Array.isArray(entry.contentBoxSize) && entry.contentBoxSize[0]
            ? entry.contentBoxSize[0].inlineSize
            : entry.contentRect.width;
        update(inlineSize);
      }
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, [ref]);

  return mode;
}
