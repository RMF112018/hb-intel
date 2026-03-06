import { useMemo } from 'react';
import {
  resolveRestrictedZones,
  type DegradedModeSectionState,
  type ShellRestrictedZoneInput,
  type ShellRestrictedZoneState,
} from './degradedMode.js';
import {
  resolveShellStatusSnapshot,
  type ShellStatusResolutionInput,
  type ShellStatusSnapshot,
} from './shellStatus.js';
import type { ShellExperienceState } from './types.js';

/**
 * Shared shell-status hook for central status snapshot consumption.
 */
export function useShellStatusState(input: ShellStatusResolutionInput): ShellStatusSnapshot {
  return useMemo(() => resolveShellStatusSnapshot(input), [input]);
}

/**
 * Shared degraded-mode visibility rules hook.
 */
export function useDegradedModeVisibilityRules(params: {
  experienceState: ShellExperienceState;
  sections: readonly DegradedModeSectionState[];
  restrictedZones?: readonly ShellRestrictedZoneInput[];
}): {
  isDegradedMode: boolean;
  visibleSectionIds: readonly string[];
  restrictedSectionIds: readonly string[];
  restrictedZones: readonly ShellRestrictedZoneState[];
} {
  return useMemo(() => {
    const isDegradedMode = params.experienceState === 'degraded';
    const visibleSectionIds = params.sections
      .filter((section) => section.isVisible !== false)
      .map((section) => section.sectionId);
    const restrictedSectionIds = params.sections
      .filter((section) => section.restrictedInDegradedMode === true)
      .map((section) => section.sectionId);
    const restrictedZones = resolveRestrictedZones({
      isDegradedMode,
      zones: params.restrictedZones ?? [],
    });

    return {
      isDegradedMode,
      visibleSectionIds,
      restrictedSectionIds,
      restrictedZones,
    };
  }, [params.experienceState, params.restrictedZones, params.sections]);
}
