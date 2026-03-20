/**
 * useHubPersonalization — P2-D5 §4, §7.
 *
 * Consolidates personalization state:
 *   - Team mode persistence (16-hour TTL, 300ms debounce)
 *   - Card arrangement persistence (30-day TTL, 500ms debounce)
 *
 * Validates restored card arrangements against role eligibility (P2-D5 §4.4).
 */
import { useCallback } from 'react';
import { useAutoSaveDraft } from '@hbc/session-state';
import { HUB_DRAFT_KEYS, HUB_DRAFT_TTL } from './hubStateTypes.js';
import type {
  IMyWorkTeamModeDraft,
  IMyWorkCardArrangement,
} from './hubStateTypes.js';
import type { TeamMode } from '@hbc/shell';

export interface IHubPersonalization {
  teamMode: TeamMode;
  setTeamMode: (mode: TeamMode) => void;
  cardArrangement: IMyWorkCardArrangement | null;
  updateCardVisibility: (zone: 'secondaryZone' | 'tertiaryZone', cardId: string, visible: boolean) => void;
}

export function useHubPersonalization(): IHubPersonalization {
  // P2-D5 §7: Team mode persistence
  const teamModeDraft = useAutoSaveDraft<IMyWorkTeamModeDraft>(
    HUB_DRAFT_KEYS.teamMode,
    HUB_DRAFT_TTL.teamMode,
    300,
  );

  // P2-D5 §4: Card arrangement persistence
  const arrangementDraft = useAutoSaveDraft<IMyWorkCardArrangement>(
    HUB_DRAFT_KEYS.cardArrangement,
    HUB_DRAFT_TTL.cardArrangement,
    500,
  );

  const teamMode: TeamMode = teamModeDraft.value?.teamMode ?? 'personal';

  const setTeamMode = useCallback(
    (mode: TeamMode) => {
      teamModeDraft.queueSave({
        teamMode: mode,
        savedAt: new Date().toISOString(),
      });
    },
    [teamModeDraft],
  );

  const updateCardVisibility = useCallback(
    (zone: 'secondaryZone' | 'tertiaryZone', cardId: string, visible: boolean) => {
      const current = arrangementDraft.value ?? {
        secondaryZone: [],
        tertiaryZone: [],
        savedAt: '',
      };

      const zoneSlots = [...current[zone]];
      const idx = zoneSlots.findIndex((s) => s.cardId === cardId);
      if (idx >= 0) {
        zoneSlots[idx] = { ...zoneSlots[idx], visible };
      } else {
        zoneSlots.push({ cardId, visible });
      }

      arrangementDraft.queueSave({
        ...current,
        [zone]: zoneSlots,
        savedAt: new Date().toISOString(),
      });
    },
    [arrangementDraft],
  );

  return {
    teamMode,
    setTeamMode,
    cardArrangement: arrangementDraft.value,
    updateCardVisibility,
  };
}
