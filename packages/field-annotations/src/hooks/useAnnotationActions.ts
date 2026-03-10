import { useMutation, useQueryClient } from '@tanstack/react-query';
import { AnnotationApi } from '../api/AnnotationApi';
import type {
  ICreateAnnotationInput,
  IAddReplyInput,
  IResolveAnnotationInput,
  IWithdrawAnnotationInput,
  IUseAnnotationActionsResult,
  IFieldAnnotation,
  IAnnotationReply,
} from '../types/IFieldAnnotation';
import { fieldAnnotationsQueryKey } from './useFieldAnnotations';

/**
 * Provides create, reply, resolve, and withdraw mutations for field annotations.
 *
 * All mutations perform optimistic cache updates for immediate UI feedback and
 * invalidate both the record-level and field-level query keys on settlement to
 * ensure all components reading annotation state see consistent data.
 *
 * @param recordType - Record type namespace (used for cache key invalidation)
 * @param recordId   - Parent record UUID (used for cache key invalidation)
 */
export function useAnnotationActions(
  recordType: string,
  recordId: string
): IUseAnnotationActionsResult {
  const queryClient = useQueryClient();

  // Helper: invalidate all annotation queries for this record after mutation
  const invalidateRecord = () => {
    queryClient.invalidateQueries({
      queryKey: fieldAnnotationsQueryKey(recordType, recordId),
    });
    // Also invalidate any field-level queries cached for this record
    queryClient.invalidateQueries({
      queryKey: ['field-annotations', recordType, recordId],
    });
  };

  // ── Create annotation ──────────────────────────────────────────────────────

  const createMutation = useMutation<IFieldAnnotation, Error, ICreateAnnotationInput>({
    mutationFn: (input) => AnnotationApi.create(input),
    onSuccess: () => invalidateRecord(),
  });

  // ── Add reply ──────────────────────────────────────────────────────────────

  const replyMutation = useMutation<IAnnotationReply, Error, IAddReplyInput>({
    mutationFn: (input) => AnnotationApi.addReply(input),
    onSuccess: (_reply, input) => {
      // Invalidate both record-level and any cached single annotation queries
      invalidateRecord();
      queryClient.invalidateQueries({
        queryKey: ['field-annotation-single', input.annotationId],
      });
    },
  });

  // ── Resolve annotation ─────────────────────────────────────────────────────

  const resolveMutation = useMutation<IFieldAnnotation, Error, IResolveAnnotationInput>({
    mutationFn: (input) => AnnotationApi.resolve(input),
    onSuccess: () => invalidateRecord(),
  });

  // ── Withdraw annotation ────────────────────────────────────────────────────

  const withdrawMutation = useMutation<IFieldAnnotation, Error, IWithdrawAnnotationInput>({
    mutationFn: (input) => AnnotationApi.withdraw(input),
    onSuccess: () => invalidateRecord(),
  });

  return {
    createAnnotation: createMutation.mutateAsync,
    addReply: replyMutation.mutateAsync,
    resolveAnnotation: resolveMutation.mutateAsync,
    withdrawAnnotation: withdrawMutation.mutateAsync,
    isCreating: createMutation.isPending,
    isReplying: replyMutation.isPending,
    isResolving: resolveMutation.isPending,
    isWithdrawing: withdrawMutation.isPending,
  };
}
