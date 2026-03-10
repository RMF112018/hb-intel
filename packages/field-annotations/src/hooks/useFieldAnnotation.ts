import { useQuery } from '@tanstack/react-query';
import { AnnotationApi } from '../api/AnnotationApi';
import type { IUseFieldAnnotationResult } from '../types/IFieldAnnotation';
import { ANNOTATION_STALE_TIME_FIELD_MS } from '../constants/annotationDefaults';
import { fieldAnnotationQueryKey } from './useFieldAnnotations';

/**
 * Loads all annotations for a specific field on a record.
 *
 * Primary consumer: HbcAnnotationMarker (renders the indicator dot for a single field).
 * HbcAnnotationThread is opened by the marker and reuses this hook's data via
 * TanStack Query cache — no duplicate network requests.
 *
 * Uses a shorter stale time (30s vs 60s) because field-level threads are viewed
 * during active collaborative review sessions where freshness matters more.
 *
 * @param recordType - Record type namespace
 * @param recordId   - Parent record UUID
 * @param fieldKey   - Stable field key constant
 * @param enabled    - Set false to skip the query (e.g., user does not have annotation visibility)
 */
export function useFieldAnnotation(
  recordType: string,
  recordId: string,
  fieldKey: string,
  enabled = true
): IUseFieldAnnotationResult {
  const query = useQuery({
    queryKey: fieldAnnotationQueryKey(recordType, recordId, fieldKey),
    queryFn: () => AnnotationApi.list(recordType, recordId, { fieldKey }),
    staleTime: ANNOTATION_STALE_TIME_FIELD_MS,
    enabled: enabled && Boolean(recordType) && Boolean(recordId) && Boolean(fieldKey),
  });

  const annotations = query.data ?? [];
  const openCount = annotations.filter((a) => a.status === 'open').length;

  return {
    annotations,
    openCount,
    isLoading: query.isLoading,
    isError: query.isError,
  };
}
