import { useQuery } from '@tanstack/react-query';
import { resolveProjectSitesPeopleDisplayLabels } from '../projectSitesPeopleDisplay.js';

const STALE_TIME_MS = 10 * 60 * 1000;

export function useProjectSitesPeopleDisplayLabels(upns: string[]): Record<string, string> {
  const unique = Array.from(new Set(upns.map((v) => v.trim()).filter(Boolean))).sort((a, b) =>
    a.localeCompare(b),
  );

  const { data } = useQuery({
    queryKey: ['project-sites-people-display', ...unique],
    queryFn: () => resolveProjectSitesPeopleDisplayLabels(unique),
    enabled: unique.length > 0,
    staleTime: STALE_TIME_MS,
    retry: 0,
  });

  return data ?? {};
}
