import {
  useMutation,
  useQuery,
  useQueryClient,
  type QueryKey,
} from '@tanstack/react-query';
import { useOfflineQueue } from './useOfflineQueue';
import {
  deriveAcknowledgmentState,
  isNetworkFailure,
} from '../utils/acknowledgmentLogic';
import type {
  AckContextType,
  IAcknowledgmentState,
  ISubmitAcknowledgmentParams,
  ISubmitAcknowledgmentRequest,
  ISubmitAcknowledgmentResponse,
  IUseAcknowledgmentReturn,
} from '../types';
import type { IAcknowledgmentConfig } from '../types/IAcknowledgment';

// ─── Query Key Factory ───────────────────────────────────────────────────────

export const ackKeys = {
  all: ['acknowledgments'] as const,
  detail: (contextType: AckContextType, contextId: string): QueryKey =>
    ['acknowledgments', contextType, contextId] as const,
};

// ─── API Calls ───────────────────────────────────────────────────────────────

async function fetchAcknowledgmentState(
  contextType: AckContextType,
  contextId: string
): Promise<IAcknowledgmentState> {
  const res = await fetch(
    `/api/acknowledgments?contextType=${contextType}&contextId=${contextId}`
  );
  if (!res.ok) throw res;
  return res.json();
}

async function postAcknowledgment(
  body: ISubmitAcknowledgmentRequest
): Promise<ISubmitAcknowledgmentResponse> {
  const res = await fetch('/api/acknowledgments', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw res;
  return res.json();
}

// ─── Hook ────────────────────────────────────────────────────────────────────

export function useAcknowledgment<T>(
  config: IAcknowledgmentConfig<T>,
  contextId: string,
  currentUserId: string
): IUseAcknowledgmentReturn {
  const queryClient = useQueryClient();
  const offlineQueue = useOfflineQueue('acknowledgments'); // D-02

  const queryKey = ackKeys.detail(config.contextType, contextId);

  // ── Fetch (D-05) ──────────────────────────────────────────────────────────
  const { data: state, isLoading, isError } = useQuery<IAcknowledgmentState>({
    queryKey,
    queryFn: () => fetchAcknowledgmentState(config.contextType, contextId),
    staleTime: 30_000,           // D-05
    refetchOnWindowFocus: true,  // D-05
    refetchInterval: 60_000,     // D-05 — critical for sequential mode awareness
  });

  // ── Mutation ─────────────────────────────────────────────────────────────
  const { mutateAsync: submitMutation, isPending: isSubmitting } = useMutation<
    ISubmitAcknowledgmentResponse,
    unknown,
    ISubmitAcknowledgmentParams,
    { snapshot?: IAcknowledgmentState }
  >({
    mutationFn: (params) => {
      const body: ISubmitAcknowledgmentRequest = {
        contextType: config.contextType,
        contextId,
        partyUserId: currentUserId,
        status: params.status,
        declineReason: params.declineReason,
        declineCategory: params.declineCategory,
        acknowledgedAt: new Date().toISOString(), // D-02: client timestamp
        bypassSequentialOrder: params.bypassSequentialOrder, // D-01
      };
      return postAcknowledgment(body);
    },

    // ── Optimistic update (D-02) ────────────────────────────────────────────
    onMutate: async (params) => {
      await queryClient.cancelQueries({ queryKey });
      const snapshot = queryClient.getQueryData<IAcknowledgmentState>(queryKey);

      if (snapshot) {
        const optimisticEvent = {
          partyUserId: currentUserId,
          partyDisplayName: '(you)',
          status: params.status,
          acknowledgedAt: new Date().toISOString(),
          declineReason: params.declineReason,
          declineCategory: params.declineCategory,
          bypassSequentialOrder: params.bypassSequentialOrder,
          isPendingSync: false,
        };
        const optimisticEvents = [
          ...snapshot.events.filter((e) => e.partyUserId !== currentUserId),
          optimisticEvent,
        ];
        const parties = config.resolveParties(undefined as unknown as T);
        const optimisticState = deriveAcknowledgmentState(
          snapshot.config,
          parties,
          optimisticEvents
        );
        queryClient.setQueryData<IAcknowledgmentState>(queryKey, optimisticState);
      }

      return { snapshot };
    },

    onSuccess: (response) => {
      // Invalidate to fetch authoritative server state (D-02)
      queryClient.invalidateQueries({ queryKey });

      // Fire client-side callback for UI effects only (D-06)
      if (response.isComplete && config.onAllAcknowledged) {
        config.onAllAcknowledged(
          undefined as unknown as T,
          response.updatedState.events
        );
      }
    },

    onError: async (error, params, context) => {
      if (isNetworkFailure(error)) {
        // Network failure → offline queue (D-02)
        const body: ISubmitAcknowledgmentRequest = {
          contextType: config.contextType,
          contextId,
          partyUserId: currentUserId,
          status: params.status,
          declineReason: params.declineReason,
          declineCategory: params.declineCategory,
          acknowledgedAt: new Date().toISOString(),
          bypassSequentialOrder: params.bypassSequentialOrder,
        };
        await offlineQueue.enqueue({
          endpoint: '/api/acknowledgments',
          method: 'POST',
          body,
        });

        // Mark optimistic event as pending sync (D-02)
        const current = queryClient.getQueryData<IAcknowledgmentState>(queryKey);
        if (current) {
          const updated: IAcknowledgmentState = {
            ...current,
            events: current.events.map((e) =>
              e.partyUserId === currentUserId
                ? { ...e, isPendingSync: true }
                : e
            ),
          };
          queryClient.setQueryData<IAcknowledgmentState>(queryKey, updated);
        }
      } else {
        // Logical failure → rollback (D-02)
        if (context?.snapshot) {
          queryClient.setQueryData<IAcknowledgmentState>(queryKey, context.snapshot);
        }
      }
    },

    onSettled: () => {
      // Always re-sync from server after any mutation attempt
      queryClient.invalidateQueries({ queryKey });
    },
  });

  const submit = async (params: ISubmitAcknowledgmentParams): Promise<void> => {
    await submitMutation(params);
  };

  return { state, isLoading, isError, submit, isSubmitting };
}
