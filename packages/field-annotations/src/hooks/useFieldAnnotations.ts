import { useQuery } from '@tanstack/react-query';
import { AnnotationApi } from '../api/AnnotationApi';
import type {
  IFieldAnnotation,
  IAnnotationCounts,
  IUseFieldAnnotationsResult,
} from '../types/IFieldAnnotation';
import { ANNOTATION_STALE_TIME_RECORD_MS } from '../constants/annotationDefaults';

// ─────────────────────────────────────────────────────────────────────────────
// Query key factory — used by useFieldAnnotation and useAnnotationActions
// for cache invalidation
// ─────────────────────────────────────────────────────────────────────────────

export function fieldAnnotationsQueryKey(recordType: string, recordId: string) {
  return ['field-annotations', recordType, recordId] as const;
}

export function fieldAnnotationQueryKey(
  recordType: string,
  recordId: string,
  fieldKey: string
) {
  return ['field-annotations', recordType, recordId, fieldKey] as const;
}

// ─────────────────────────────────────────────────────────────────────────────
// Count aggregation helper
// ─────────────────────────────────────────────────────────────────────────────

export function computeAnnotationCounts(annotations: IFieldAnnotation[]): IAnnotationCounts {
  const open = annotations.filter((a) => a.status === 'open');
  return {
    totalOpen: open.length,
    openClarificationRequests: open.filter((a) => a.intent === 'clarification-request').length,
    openRevisionFlags: open.filter((a) => a.intent === 'flag-for-revision').length,
    openComments: open.filter((a) => a.intent === 'comment').length,
    totalResolved: annotations.filter((a) => a.status === 'resolved').length,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// useFieldAnnotations — all annotations for a record
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Loads all annotations (open + resolved) for a given record.
 *
 * Primary consumers:
 *  - HbcAnnotationSummary (record-level panel)
 *  - Consuming module's IBicNextMoveConfig.resolveIsBlocked (via counts.openClarificationRequests)
 *  - @hbc/acknowledgment pre-sign-off review panel
 *
 * @param recordType - Record type namespace (e.g., 'bd-scorecard')
 * @param recordId   - Parent record UUID
 * @param enabled    - Set false to skip the query (e.g., when record ID is not yet known)
 *
 * @example — BIC blocking resolver in a consuming module
 * const { counts } = useFieldAnnotations('bd-scorecard', scorecard.id);
 * const isBlocked = counts.openClarificationRequests > 0 || counts.openRevisionFlags > 0;
 */
export function useFieldAnnotations(
  recordType: string,
  recordId: string,
  enabled = true
): IUseFieldAnnotationsResult {
  const query = useQuery({
    queryKey: fieldAnnotationsQueryKey(recordType, recordId),
    queryFn: () => AnnotationApi.list(recordType, recordId),
    staleTime: ANNOTATION_STALE_TIME_RECORD_MS,
    enabled: enabled && Boolean(recordType) && Boolean(recordId),
  });

  const annotations = query.data ?? [];
  const counts = computeAnnotationCounts(annotations);

  return {
    annotations,
    counts,
    isLoading: query.isLoading,
    isError: query.isError,
    refetch: query.refetch,
  };
}
