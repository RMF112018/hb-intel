/**
 * P3-E4-T03 version lifecycle operations for the forecast versioning ledger.
 * All functions are pure and deterministic given the same inputs + UUID generation.
 */

import type {
  ForecastDerivationReason,
  IForecastVersion,
  IReportCandidateDesignationResult,
} from '../types/index.js';

export const FINANCIAL_VERSIONING_SCOPE = 'financial/versioning';

/** Create the initial Working version for a project (T03 §3.4, reason: InitialSetup). */
export const createInitialVersion = (
  projectId: string,
  createdBy: string,
): IForecastVersion => ({
  forecastVersionId: crypto.randomUUID(),
  projectId,
  versionType: 'Working',
  versionNumber: 1,
  reportingMonth: null,
  derivedFromVersionId: null,
  derivationReason: 'InitialSetup',
  isReportCandidate: false,
  createdAt: new Date().toISOString(),
  createdBy,
  confirmedAt: null,
  confirmedBy: null,
  publishedAt: null,
  publishedByRunId: null,
  staleBudgetLineCount: 0,
  checklistCompletedAt: null,
  notes: null,
});

/**
 * Derive a new Working version from a source version (T03 §3.4).
 * The new version inherits the source's data state but starts with an empty checklist.
 */
export const deriveWorkingVersion = (
  sourceVersion: IForecastVersion,
  reason: ForecastDerivationReason,
  createdBy: string,
  nextVersionNumber: number,
): IForecastVersion => ({
  forecastVersionId: crypto.randomUUID(),
  projectId: sourceVersion.projectId,
  versionType: 'Working',
  versionNumber: nextVersionNumber,
  reportingMonth: null,
  derivedFromVersionId: sourceVersion.forecastVersionId,
  derivationReason: reason,
  isReportCandidate: false,
  createdAt: new Date().toISOString(),
  createdBy,
  confirmedAt: null,
  confirmedBy: null,
  publishedAt: null,
  publishedByRunId: null,
  staleBudgetLineCount: sourceVersion.staleBudgetLineCount,
  checklistCompletedAt: null,
  notes: null,
});

/** Transition a version to Superseded (T03 §3.5). */
export const transitionToSuperseded = (
  version: IForecastVersion,
): IForecastVersion => ({
  ...version,
  versionType: 'Superseded',
  isReportCandidate: false,
});

/**
 * Confirm a Working version → ConfirmedInternal (T03 §3.5).
 * Does NOT validate gate conditions — call validateConfirmationGate first.
 */
export const confirmVersion = (
  version: IForecastVersion,
  confirmedBy: string,
): IForecastVersion => {
  const now = new Date().toISOString();
  return {
    ...version,
    versionType: 'ConfirmedInternal',
    confirmedAt: now,
    confirmedBy,
    checklistCompletedAt: now,
  };
};

/**
 * Designate a ConfirmedInternal version as the report candidate (T03 §3.6).
 * Clears isReportCandidate on the prior holder if one exists.
 */
export const designateReportCandidate = (
  version: IForecastVersion,
  priorCandidate?: IForecastVersion | null,
): IReportCandidateDesignationResult => ({
  designated: { ...version, isReportCandidate: true },
  cleared: priorCandidate
    ? { ...priorCandidate, isReportCandidate: false }
    : null,
});

/**
 * Promote a ConfirmedInternal report-candidate to PublishedMonthly (T03 §3.5).
 * Triggered by P3-F1 report publication.
 */
export const promoteToPublished = (
  version: IForecastVersion,
  reportingMonth: string,
  publishedByRunId: string,
): IForecastVersion => ({
  ...version,
  versionType: 'PublishedMonthly',
  reportingMonth,
  publishedAt: new Date().toISOString(),
  publishedByRunId,
});
