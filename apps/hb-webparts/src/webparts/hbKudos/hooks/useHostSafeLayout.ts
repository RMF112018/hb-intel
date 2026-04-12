/**
 * useHostSafeLayout — SharePoint-hosted iframe safe-zone layout.
 *
 * When the HB Kudos webpart is hosted inside the SharePoint iframe the
 * persistent bottom-right assistant overlay can visually overlap archive
 * rows / footer content. This hook detects the hosted environment and
 * returns a padding rule plus an `isHosted` flag so the runtime can
 * render a 72x72 sentinel element the harness uses to assert non-overlap.
 *
 * Safe-area insets on devices that report them (iOS notches, etc.) are
 * respected; bottom-right reserves a 72px minimum plus any inset.
 */
import type * as React from 'react';

export interface HostSafeLayout {
  isHosted: boolean;
  safeZonePadding: React.CSSProperties;
}

export function useHostSafeLayout(): HostSafeLayout {
  const isHosted =
    typeof window !== 'undefined' && window.self !== window.top;
  const safeZonePadding: React.CSSProperties = isHosted
    ? {
        paddingTop: 'max(12px, env(safe-area-inset-top, 0px))',
        paddingRight: 72,
        paddingBottom: 'max(72px, calc(env(safe-area-inset-bottom, 0px) + 64px))',
      }
    : {};
  return { isHosted, safeZonePadding };
}
