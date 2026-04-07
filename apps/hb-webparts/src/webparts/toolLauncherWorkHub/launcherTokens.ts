/**
 * Shared launcher tokens — tone colors and priority constants.
 *
 * Phase 11D: Premium primitives and surface layer.
 * Extracted from LauncherFlagshipCard (BADGE_TONE_COLORS) and
 * LauncherUtilityRail (NOTICE_TONE_COLORS, TONE_PRIORITY) to
 * eliminate duplication across the launcher surface.
 */

/** Tone-to-color map for notice badges and status indicators across the launcher. */
export const LAUNCHER_TONE_COLORS: Record<string, { bg: string; color: string }> = {
  info: { bg: 'rgba(34,83,145,0.1)', color: '#225391' },
  warning: { bg: 'rgba(229,126,70,0.12)', color: '#b5652a' },
  critical: { bg: 'rgba(200,40,40,0.1)', color: '#a02020' },
  success: { bg: 'rgba(40,160,60,0.1)', color: '#1a7a2e' },
  neutral: { bg: 'rgba(0,0,0,0.06)', color: 'rgba(0,0,0,0.55)' },
};

/** Tone priority for sorting notices (lower = higher priority). */
export const LAUNCHER_TONE_PRIORITY: Record<string, number> = {
  critical: 0,
  warning: 1,
  info: 2,
  success: 3,
  neutral: 4,
};
