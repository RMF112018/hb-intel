/**
 * useTeamViewerHostSafeLayout — SPFx-hosted safe-zone layout for TeamViewer.
 *
 * Same detection semantics as the Kudos host-safe layout hook, re-implemented
 * locally to keep TeamViewer decoupled from the Kudos runtime. When a second
 * consumer appears, promote this into `homepage/shared/useHostSafeLayout.ts`.
 */
import { useEffect, useState, type CSSProperties } from 'react';

export const TEAM_VIEWER_SAFE_ZONE_SIZE_PX = 72;
const SAFE_ZONE_TOP_MIN_PX = 12;
const SAFE_ZONE_BOTTOM_MIN_PX = 64;

export function detectTeamViewerHostedEnvironment(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    return window.self !== window.top;
  } catch {
    return false;
  }
}

export interface TeamViewerHostSafeLayout {
  isHosted: boolean;
  safeZonePadding: CSSProperties;
}

export function useTeamViewerHostSafeLayout(): TeamViewerHostSafeLayout {
  const [isHosted, setIsHosted] = useState<boolean>(() => detectTeamViewerHostedEnvironment());

  useEffect(() => {
    const detected = detectTeamViewerHostedEnvironment();
    if (detected !== isHosted) setIsHosted(detected);
    // Run once at mount; host framing does not change at runtime.

  }, []);

  const safeZonePadding: CSSProperties = isHosted
    ? {
        paddingTop: `max(${SAFE_ZONE_TOP_MIN_PX}px, env(safe-area-inset-top, 0px))`,
        paddingRight: TEAM_VIEWER_SAFE_ZONE_SIZE_PX,
        paddingBottom: `max(${TEAM_VIEWER_SAFE_ZONE_SIZE_PX}px, calc(env(safe-area-inset-bottom, 0px) + ${SAFE_ZONE_BOTTOM_MIN_PX}px))`,
      }
    : {};

  return { isHosted, safeZonePadding };
}
