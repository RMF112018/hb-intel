import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type {
  BackendCommandOptions,
  IngestionRunFilter,
  InspectionFilter,
  ProjectWeekFilter,
  ReviewQueueEntry,
} from '../ports/ISafetyInspectionRepository.js';
import type {
  IngestionUploadContext,
  IngestionRunResult,
  SafetyIngestionPreviewResult,
  SafetyFinding,
  SafetyIngestionRun,
  SafetyInspectionEvent,
  SafetyProjectWeekRecord,
  SafetyReportingPeriod,
} from '../domain/types.js';
import type { SafetyBackendCommandError } from '../adapters/sharepoint/errors.js';
import { useSafetyRepository } from './repositoryContext.js';

export const safetyQueryKeys = {
  reportingPeriods: () => ['safety', 'reporting-periods'] as const,
  projectWeeks: (filter: ProjectWeekFilter) => ['safety', 'project-weeks', filter] as const,
  projectWeek: (reportingPeriodId: string, projectNumber: string) =>
    ['safety', 'project-week', reportingPeriodId, projectNumber] as const,
  inspections: (filter: InspectionFilter) => ['safety', 'inspections', filter] as const,
  inspection: (id: string) => ['safety', 'inspection', id] as const,
  findings: (inspectionEventId: string) => ['safety', 'findings', inspectionEventId] as const,
  ingestionRuns: (filter: IngestionRunFilter) => ['safety', 'ingestion-runs', filter] as const,
  reviewQueue: (reportingPeriodId?: string) => ['safety', 'review-queue', reportingPeriodId] as const,
  preview: () => ['safety', 'ingestion-preview'] as const,
};

export function useReportingPeriods() {
  const repo = useSafetyRepository();
  return useQuery<ReadonlyArray<SafetyReportingPeriod>>({
    queryKey: safetyQueryKeys.reportingPeriods(),
    queryFn: () => repo.listReportingPeriods(),
  });
}

export function useProjectWeeks(filter: ProjectWeekFilter) {
  const repo = useSafetyRepository();
  return useQuery<ReadonlyArray<SafetyProjectWeekRecord>>({
    queryKey: safetyQueryKeys.projectWeeks(filter),
    queryFn: () => repo.listProjectWeeks(filter),
  });
}

export function useProjectWeek(reportingPeriodId: string, projectNumber: string) {
  const repo = useSafetyRepository();
  return useQuery<SafetyProjectWeekRecord | null>({
    queryKey: safetyQueryKeys.projectWeek(reportingPeriodId, projectNumber),
    queryFn: () => repo.getProjectWeek(reportingPeriodId, projectNumber),
    enabled: Boolean(reportingPeriodId && projectNumber),
  });
}

export function useInspections(filter: InspectionFilter) {
  const repo = useSafetyRepository();
  return useQuery<ReadonlyArray<SafetyInspectionEvent>>({
    queryKey: safetyQueryKeys.inspections(filter),
    queryFn: () => repo.listInspections(filter),
  });
}

export function useInspection(id: string) {
  const repo = useSafetyRepository();
  return useQuery<SafetyInspectionEvent | null>({
    queryKey: safetyQueryKeys.inspection(id),
    queryFn: () => repo.getInspection(id),
    enabled: Boolean(id),
  });
}

export function useFindings(inspectionEventId: string) {
  const repo = useSafetyRepository();
  return useQuery<ReadonlyArray<SafetyFinding>>({
    queryKey: safetyQueryKeys.findings(inspectionEventId),
    queryFn: () => repo.listFindingsForInspection(inspectionEventId),
    enabled: Boolean(inspectionEventId),
  });
}

export function useIngestionRuns(filter: IngestionRunFilter) {
  const repo = useSafetyRepository();
  return useQuery<ReadonlyArray<SafetyIngestionRun>>({
    queryKey: safetyQueryKeys.ingestionRuns(filter),
    queryFn: () => repo.listIngestionRuns(filter),
  });
}

export function useReviewQueue(reportingPeriodId?: string) {
  const repo = useSafetyRepository();
  return useQuery<ReadonlyArray<ReviewQueueEntry>>({
    queryKey: safetyQueryKeys.reviewQueue(reportingPeriodId),
    queryFn: () => repo.listReviewQueue(reportingPeriodId),
  });
}

export interface IngestionMutationInput {
  readonly file: File;
  readonly context: IngestionUploadContext;
  readonly commandOptions?: BackendCommandOptions;
}

export function useSafetyIngestion() {
  const repo = useSafetyRepository();
  const queryClient = useQueryClient();
  return useMutation<IngestionRunResult, SafetyBackendCommandError | Error, IngestionMutationInput>({
    mutationFn: ({ file, context, commandOptions }) => repo.ingestWorkbook(file, context, commandOptions),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['safety'] });
    },
  });
}

export interface ReplayIngestionInput {
  readonly parentRunId: string;
  readonly supersedePrior?: boolean;
  readonly commandOptions?: BackendCommandOptions;
}

export function useReplayIngestion() {
  const repo = useSafetyRepository();
  const queryClient = useQueryClient();
  return useMutation<IngestionRunResult, SafetyBackendCommandError | Error, ReplayIngestionInput>({
    mutationFn: ({ parentRunId, supersedePrior, commandOptions }) =>
      repo.replayIngestion(parentRunId, { supersedePrior, ...commandOptions }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['safety'] });
    },
  });
}

export interface PreviewIngestionInput {
  readonly file: File;
  readonly context: IngestionUploadContext;
  readonly commandOptions?: BackendCommandOptions;
}

export function useSafetyIngestionPreview() {
  const repo = useSafetyRepository();
  return useMutation<SafetyIngestionPreviewResult, SafetyBackendCommandError | Error, PreviewIngestionInput>({
    mutationFn: ({ file, context, commandOptions }) => repo.previewWorkbook(file, context, commandOptions),
  });
}
