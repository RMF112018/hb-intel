import { useCallback, useState } from 'react';

/**
 * Local state for the currently selected module in the command rail.
 * Selection updates the center canvas and context rail reactively
 * but does NOT change the URL — the route stays at /project-hub/$projectId.
 */
export function useSelectedModule(): {
  selectedSlug: string | null;
  setSelectedSlug: (slug: string | null) => void;
  clearSelection: () => void;
} {
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null);
  const clearSelection = useCallback(() => setSelectedSlug(null), []);
  return { selectedSlug, setSelectedSlug, clearSelection };
}
