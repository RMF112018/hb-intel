/**
 * usePublicKudosData — public + archive kudos derivation.
 *
 * Extracted from HbKudos.tsx: loads list config, applies the locked
 * public-visibility / archive-eligibility predicates (with the legacy
 * pre-workflowStatus fallback), and exposes loading/error state plus
 * a refresh handle for the celebrate mutation.
 *
 * Visibility rules (preserved from HbKudos.tsx):
 *   Public: isPubliclyVisible + !hasAgedOff, with legacy fallback for
 *     entries lacking workflowStatus (approved + homepageEnabled != false).
 *   Archive: isArchiveEligible || isAssociatedVisible(currentUserId),
 *     with legacy fallback for approved entries not explicitly removed.
 */
import * as React from 'react';
import { usePeopleCultureData } from '../../../homepage/data/usePeopleCultureData.js';
import {
  hasAgedOff,
  isArchiveEligible,
  isAssociatedVisible,
  isPubliclyVisible,
  type KudosEntry,
} from '../../../homepage/webparts/kudosContracts.js';
import { sortByRecency } from './kudosFeatured.js';

export interface UsePublicKudosDataResult {
  allKudos: KudosEntry[];
  publicKudos: KudosEntry[];
  archiveKudos: KudosEntry[];
  isLoading: boolean;
  error?: string;
  hasListConfig: boolean;
  refresh: () => void;
}

export function usePublicKudosData(
  ageOffDays: number,
  currentUserId: number | undefined,
): UsePublicKudosDataResult {
  const { listConfig, isLoading, error, refresh } = usePeopleCultureData();
  const allKudos: KudosEntry[] = listConfig?.kudos ?? [];

  const publicKudos = React.useMemo(
    () =>
      allKudos.filter((entry) => {
        if (entry.workflowStatus) {
          if (!isPubliclyVisible(entry)) return false;
          if (hasAgedOff(entry, ageOffDays)) return false;
          return true;
        }
        if (entry.status !== 'approved') return false;
        if (entry.homepageEnabled === false) return false;
        return true;
      }),
    [allKudos, ageOffDays],
  );

  const archiveKudos = React.useMemo(
    () =>
      sortByRecency(
        allKudos.filter((entry) => {
          if (entry.workflowStatus) {
            if (isArchiveEligible(entry)) return true;
            return isAssociatedVisible(entry, currentUserId);
          }
          if (entry.status !== 'approved') return false;
          if ((entry as Partial<{ isRemovedFromPublicView: boolean }>).isRemovedFromPublicView === true) return false;
          return true;
        }),
      ),
    [allKudos, currentUserId],
  );

  return {
    allKudos,
    publicKudos,
    archiveKudos,
    isLoading,
    error: error ?? undefined,
    hasListConfig: Boolean(listConfig),
    refresh,
  };
}
