/**
 * useHubPersonalization — P2-D5 §7.
 *
 * Consolidates personalization state:
 *   - Team mode persistence (16-hour TTL, 300ms debounce)
 *
 * Card arrangement (P2-D5 §4) is managed by HbcProjectCanvas internally
 * via useCanvasConfig + CanvasApi — not by this hook.
 */
import { useCallback } from 'react';
import { useAutoSaveDraft } from '@hbc/session-state';
import { useCurrentSession } from '@hbc/auth';
import { HUB_DRAFT_KEYS, HUB_DRAFT_TTL } from './hubStateTypes.js';
import type { IMyWorkTeamModeDraft } from './hubStateTypes.js';
import type { TeamMode } from '@hbc/shell';

export interface IHubPersonalization {
  teamMode: TeamMode;
  setTeamMode: (mode: TeamMode) => void;
}

export function useHubPersonalization(): IHubPersonalization {
  // P2-D5 §7: Team mode persistence
  const teamModeDraft = useAutoSaveDraft<IMyWorkTeamModeDraft>(
    HUB_DRAFT_KEYS.teamMode,
    HUB_DRAFT_TTL.teamMode,
    300,
  );

  // ADR-0117: Executive defaults to 'my-team'; all other roles default to 'personal'.
  // P2-D5 §3 governs for Executive; P2-B2 §4 governs for other roles.
  const session = useCurrentSession();
  const isExecutive = session?.resolvedRoles.includes('Executive') ?? false;
  const teamMode: TeamMode = teamModeDraft.value?.teamMode ?? (isExecutive ? 'my-team' : 'personal');

  const setTeamMode = useCallback(
    (mode: TeamMode) => {
      teamModeDraft.queueSave({
        teamMode: mode,
        savedAt: new Date().toISOString(),
      });
    },
    [teamModeDraft],
  );

  return {
    teamMode,
    setTeamMode,
  };
}
