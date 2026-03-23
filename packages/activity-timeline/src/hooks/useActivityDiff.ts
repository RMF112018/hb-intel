/**
 * SF28-T04 — Activity diff expansion state hook.
 *
 * Manages which event diff entries are expanded in the UI.
 */
import { useCallback, useState } from 'react';

export interface UseActivityDiffResult {
  /** Set of event IDs whose diffs are currently expanded */
  expandedDiffIds: Set<string>;
  /** Toggle diff expansion for an event */
  toggleDiff: (eventId: string) => void;
  /** Check if an event's diff is expanded */
  isDiffExpanded: (eventId: string) => boolean;
  /** Collapse all expanded diffs */
  collapseAll: () => void;
}

export function useActivityDiff(): UseActivityDiffResult {
  const [expandedDiffIds, setExpandedDiffIds] = useState<Set<string>>(new Set());

  const toggleDiff = useCallback((eventId: string) => {
    setExpandedDiffIds((prev) => {
      const next = new Set(prev);
      if (next.has(eventId)) {
        next.delete(eventId);
      } else {
        next.add(eventId);
      }
      return next;
    });
  }, []);

  const isDiffExpanded = useCallback(
    (eventId: string) => expandedDiffIds.has(eventId),
    [expandedDiffIds],
  );

  const collapseAll = useCallback(() => {
    setExpandedDiffIds(new Set());
  }, []);

  return { expandedDiffIds, toggleDiff, isDiffExpanded, collapseAll };
}
