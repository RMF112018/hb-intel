/**
 * Default query & mutation options — Blueprint §1c.
 *
 * staleTime  = 5 min  →  data considered fresh, no background refetch
 * gcTime     = 10 min →  unused cache entries garbage-collected
 */

import {
  useMutation,
  useQueryClient,
  type QueryKey,
  type UseMutationOptions,
} from '@tanstack/react-query';

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

// ---------------------------------------------------------------------------
// Optimistic mutation helper — PH3 §3.1 Step 3
// ---------------------------------------------------------------------------

export interface UseOptimisticMutationOptions<TData, TVariables> {
  /** The async function that performs the server mutation. */
  mutationFn: (variables: TVariables) => Promise<TData>;
  /** Query key(s) to invalidate on settle. */
  invalidateKey: QueryKey;
  /** Optional optimistic cache updater — receives the variables. */
  onMutateOptimistic?: (variables: TVariables) => void;
}

/**
 * Generic optimistic-mutation hook.
 *
 * Handles the full cancel → snapshot → optimistic update → rollback → invalidate
 * lifecycle so individual domain hooks stay minimal.
 *
 * @example
 * ```ts
 * const mutation = useOptimisticMutation({
 *   mutationFn: (data) => repo.create(data),
 *   invalidateKey: queryKeys.leads.all,
 * });
 * ```
 */
export function useOptimisticMutation<TData, TVariables>(
  opts: UseOptimisticMutationOptions<TData, TVariables>,
) {
  const qc = useQueryClient();

  return useMutation<TData, Error, TVariables, { previousData: unknown }>({
    mutationFn: opts.mutationFn,
    onMutate: async (variables) => {
      // Cancel any in-flight queries for this key to prevent overwriting optimistic data
      await qc.cancelQueries({ queryKey: opts.invalidateKey });

      // Snapshot previous data for rollback
      const previousData = qc.getQueryData(opts.invalidateKey);

      // Apply optimistic update if provided
      if (opts.onMutateOptimistic) {
        opts.onMutateOptimistic(variables);
      }

      return { previousData };
    },
    onError: (_error, _variables, context) => {
      // Rollback to snapshot on error
      if (context?.previousData !== undefined) {
        qc.setQueryData(opts.invalidateKey, context.previousData);
      }
    },
    onSettled: () => {
      // Always invalidate to sync with server state
      void qc.invalidateQueries({ queryKey: opts.invalidateKey });
    },
    ...defaultMutationOptions,
  });
}
