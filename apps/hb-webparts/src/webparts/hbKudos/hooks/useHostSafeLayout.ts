/**
 * useHostSafeLayout — SharePoint-hosted iframe safe-zone layout.
 *
 * When the HB Kudos webpart is hosted inside the SharePoint iframe the
 * persistent bottom-right assistant overlay can visually overlap archive
 * rows / footer content. This hook detects the hosted environment and
 * returns a padding rule plus an `isHosted` flag so the runtime can
 * render a `SAFE_ZONE_SIZE_PX × SAFE_ZONE_SIZE_PX` sentinel element
 * the harness uses to assert non-overlap.
 *
 * Safe-area insets on devices that report them (iOS notches, etc.) are
 * respected; bottom-right reserves `SAFE_ZONE_SIZE_PX` plus any inset.
 *
 * Phase-20 Wave 3 host-safe hardening:
 *   - The size of the sentinel and the right/bottom padding it reserves
 *     now flow from a single exported constant (`SAFE_ZONE_SIZE_PX`),
 *     so consumers, sentinel rendering, and padding math cannot drift.
 *   - Detection is stabilized with `useState` + a deferred check via
 *     `useEffect` so React re-renders see a consistent value when the
 *     environment is resolved after mount (rare, but removes the
 *     render-time global access that used to happen every re-render).
 *   - Exports `SAFE_ZONE_SIZE_PX` and `detectHostedEnvironment` so the
 *     sentinel element in `HbKudos.tsx` and any future harness/helper
 *     read from the same source of truth.
 */
import { useEffect, useState } from 'react';
import type * as React from 'react';

/**
 * Pixel size of the bottom-right assistant safe zone. Used both as the
 * reserved padding in the hosted layout and as the width/height of the
 * sentinel element the dev harness asserts against.
 */
export const SAFE_ZONE_SIZE_PX = 72;

/** Minimum top padding in the hosted environment (below notch insets). */
const SAFE_ZONE_TOP_MIN_PX = 12;

/** Minimum bottom padding in the hosted environment (above bottom insets). */
const SAFE_ZONE_BOTTOM_MIN_PX = 64;

/**
 * Pure check: are we rendered inside a cross-context frame?
 * Returns `false` in any non-browser context and when same-frame access
 * throws (some hosts tighten policy — treat as not-hosted so the
 * webpart degrades to the native layout rather than triggering
 * incorrect safe-zone padding).
 */
export function detectHostedEnvironment(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    return window.self !== window.top;
  } catch {
    return false;
  }
}

export interface HostSafeLayout {
  isHosted: boolean;
  safeZonePadding: React.CSSProperties;
}

export function useHostSafeLayout(): HostSafeLayout {
  // Initialize from the synchronous detection so the first render is
  // already correct in SPFx (where `window.top` access is fast). The
  // committed `useEffect` below re-checks once after mount to guard
  // against environments where the initial access returned a stale
  // value — a belt-and-braces measure that keeps the runtime quiet
  // when everything is already correct.
  const [isHosted, setIsHosted] = useState<boolean>(() => detectHostedEnvironment());

  useEffect(() => {
    const detected = detectHostedEnvironment();
    if (detected !== isHosted) setIsHosted(detected);
    // Run once at mount; host framing does not change at runtime.
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const safeZonePadding: React.CSSProperties = isHosted
    ? {
        paddingTop: `max(${SAFE_ZONE_TOP_MIN_PX}px, env(safe-area-inset-top, 0px))`,
        paddingRight: SAFE_ZONE_SIZE_PX,
        paddingBottom: `max(${SAFE_ZONE_SIZE_PX}px, calc(env(safe-area-inset-bottom, 0px) + ${SAFE_ZONE_BOTTOM_MIN_PX}px))`,
      }
    : {};

  return { isHosted, safeZonePadding };
}
