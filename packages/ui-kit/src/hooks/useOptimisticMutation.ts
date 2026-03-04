/**
 * useOptimisticMutation — Optimistic UI updates with automatic revert
 * PH4.12 §Step 5 | Blueprint §1d
 *
 * Toast-optional: accepts onShowError callback instead of importing useToast directly.
 * Consumers pass `toast.addToast(...)` as the callback.
 */
import { useState, useCallback } from 'react';

export interface UseOptimisticMutationOptions<TData, TVariables> {
  /** Async mutation function */
  mutationFn: (variables: TVariables) => Promise<TData>;
  /** Called immediately before the async mutation — apply optimistic state here */
  onOptimisticUpdate: (variables: TVariables) => void;
  /** Called on error — revert optimistic state here */
  onRevert: (variables: TVariables) => void;
  /** Called on successful mutation */
  onSuccess?: (data: TData, variables: TVariables) => void;
  /** Called on error (in addition to revert) */
  onError?: (error: unknown, variables: TVariables) => void;
  /** Optional error display callback (e.g., toast.addToast) */
  onShowError?: (message: string) => void;
}

export interface UseOptimisticMutationReturn<TVariables> {
  /** Trigger the optimistic mutation */
  mutate: (variables: TVariables) => void;
  /** Whether a mutation is currently in flight */
  isPending: boolean;
}

export function useOptimisticMutation<TData = unknown, TVariables = void>(
  options: UseOptimisticMutationOptions<TData, TVariables>,
): UseOptimisticMutationReturn<TVariables> {
  const [isPending, setIsPending] = useState(false);

  const mutate = useCallback(
    (variables: TVariables) => {
      // Apply optimistic update immediately
      options.onOptimisticUpdate(variables);
      setIsPending(true);

      options
        .mutationFn(variables)
        .then((data) => {
          options.onSuccess?.(data, variables);
        })
        .catch((error: unknown) => {
          // Revert optimistic state
          options.onRevert(variables);
          // Show error to user
          const message =
            error instanceof Error ? error.message : 'An error occurred';
          options.onShowError?.(message);
          options.onError?.(error, variables);
        })
        .finally(() => {
          setIsPending(false);
        });
    },
    [options],
  );

  return { mutate, isPending };
}
