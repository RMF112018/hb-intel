// @vitest-environment jsdom
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import type { ReactNode } from 'react';
import { SafetyRepositoryProvider } from './repositoryContext.js';
import {
  useReplayIngestion,
  useSafetyIngestion,
  useSafetyIngestionPreview,
} from './queries.js';
import type { ISafetyInspectionRepository } from '../ports/ISafetyInspectionRepository.js';
import type {
  IngestionUploadContext,
  IngestionRunResult,
  SafetyIngestionPreviewResult,
} from '../domain/types.js';

function createRepository(overrides: Partial<ISafetyInspectionRepository>): ISafetyInspectionRepository {
  const notImplemented = async () => {
    throw new Error('not needed in mutation contract tests');
  };
  return {
    listReportingPeriods: notImplemented,
    getReportingPeriod: notImplemented,
    createReportingPeriod: notImplemented,
    listProjectWeeks: notImplemented,
    getProjectWeek: notImplemented,
    listInspections: notImplemented,
    findInspectionsForProjectWeek: notImplemented,
    getInspection: notImplemented,
    listFindingsForInspection: notImplemented,
    listIngestionRuns: notImplemented,
    listReviewQueue: notImplemented,
    previewWorkbook: notImplemented,
    ingestWorkbook: notImplemented,
    replayIngestion: notImplemented,
    retryIngestion: notImplemented,
    ...overrides,
  } as ISafetyInspectionRepository;
}

function renderWithRepository<T>(hook: () => T, repository: ISafetyInspectionRepository) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      <SafetyRepositoryProvider repository={repository}>{children}</SafetyRepositoryProvider>
    </QueryClientProvider>
  );
  return { ...renderHook(hook, { wrapper }), queryClient };
}

const previewResult: SafetyIngestionPreviewResult = {
  success: true,
  requestAccepted: true,
  diagnostics: [],
  preview: {
    commitReadiness: true,
    terminalStatusCandidate: 'committed',
    unresolvedProjects: [],
    unresolvedReportingPeriod: false,
    parseIssues: [],
    schemaIssues: [],
  },
};

const ingestResult: IngestionRunResult = {
  runId: 'run-1',
  terminalStatus: 'committed',
  createdInspectionEventIds: [],
  diagnostics: [],
};

const context: IngestionUploadContext = {
  uploadedByUpn: 'operator@hb.com',
  uploadedAt: '2026-04-24T00:00:00.000Z',
  fileName: 'checklist.xlsx',
  reportingPeriodId: 'period-1',
  reportingPeriodSpItemId: 1,
  projectNumber: 'P-1234',
  projectSourceClassification: 'project',
  projectLookupId: 1001,
  inspectionNumber: '7',
  inspectionDate: '2026-04-24',
};

describe('safety mutation hooks contracts', () => {
  it('useSafetyIngestionPreview maps to previewWorkbook and passes command options', async () => {
    const previewWorkbook = vi.fn().mockResolvedValue(previewResult);
    const repository = createRepository({ previewWorkbook });
    const { result } = renderWithRepository(() => useSafetyIngestionPreview(), repository);
    const file = new File(['test'], 'checklist.xlsx');
    const signal = new AbortController().signal;
    const commandOptions = { requestId: 'preview-1', timeoutMs: 2000, signal };

    const resolved = await result.current.mutateAsync({ file, context, commandOptions });

    expect(resolved).toEqual(previewResult);
    expect(previewWorkbook).toHaveBeenCalledTimes(1);
    expect(previewWorkbook).toHaveBeenCalledWith(file, context, commandOptions);
  });

  it('useSafetyIngestion maps to ingestWorkbook, passes command options, and invalidates safety key', async () => {
    const ingestWorkbook = vi.fn().mockResolvedValue(ingestResult);
    const repository = createRepository({ ingestWorkbook });
    const { result, queryClient } = renderWithRepository(() => useSafetyIngestion(), repository);
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');
    const file = new File(['test'], 'checklist.xlsx');
    const signal = new AbortController().signal;
    const commandOptions = { requestId: 'ingest-1', timeoutMs: 3000, signal };

    const resolved = await result.current.mutateAsync({ file, context, commandOptions });

    expect(resolved).toEqual(ingestResult);
    expect(ingestWorkbook).toHaveBeenCalledTimes(1);
    expect(ingestWorkbook).toHaveBeenCalledWith(file, context, commandOptions);
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['safety'] });
  });

  it('useReplayIngestion maps to replayIngestion, passes command options, and invalidates safety key', async () => {
    const replayIngestion = vi.fn().mockResolvedValue(ingestResult);
    const repository = createRepository({ replayIngestion });
    const { result, queryClient } = renderWithRepository(() => useReplayIngestion(), repository);
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');
    const signal = new AbortController().signal;

    const resolved = await result.current.mutateAsync({
      parentRunId: 'run-parent',
      supersedePrior: true,
      commandOptions: { requestId: 'replay-1', timeoutMs: 4000, signal },
    });

    expect(resolved).toEqual(ingestResult);
    expect(replayIngestion).toHaveBeenCalledTimes(1);
    expect(replayIngestion).toHaveBeenCalledWith('run-parent', {
      supersedePrior: true,
      requestId: 'replay-1',
      timeoutMs: 4000,
      signal,
    });
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['safety'] });
  });
});
