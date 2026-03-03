/**
 * Default query & mutation options — Blueprint §1c.
 *
 * staleTime  = 5 min  →  data considered fresh, no background refetch
 * gcTime     = 10 min →  unused cache entries garbage-collected
 */

export const DEFAULT_STALE_TIME = 5 * 60 * 1000;
export const DEFAULT_GC_TIME = 10 * 60 * 1000;

export const defaultQueryOptions = {
  staleTime: DEFAULT_STALE_TIME,
  gcTime: DEFAULT_GC_TIME,
  retry: 2,
  refetchOnWindowFocus: false,
} as const;

export const defaultMutationOptions = {
  retry: 0,
} as const;
