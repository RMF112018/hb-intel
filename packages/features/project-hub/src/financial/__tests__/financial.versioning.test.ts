import { describe, expect, it } from 'vitest';

import {
  createInitialVersion,
  deriveWorkingVersion,
  transitionToSuperseded,
  confirmVersion,
  designateReportCandidate,
  promoteToPublished,
} from '../../index.js';
import { createMockForecastVersion, mockVersioningScenarios } from '../../../testing/index.js';

describe('P3-E4-T03 version lifecycle operations', () => {
  describe('createInitialVersion', () => {
    it('creates a Working version with versionNumber 1 and InitialSetup reason', () => {
      const version = createInitialVersion('proj-1', 'user-1');
      expect(version.versionType).toBe('Working');
      expect(version.versionNumber).toBe(1);
      expect(version.derivationReason).toBe('InitialSetup');
      expect(version.derivedFromVersionId).toBeNull();
      expect(version.projectId).toBe('proj-1');
      expect(version.createdBy).toBe('user-1');
      expect(version.isReportCandidate).toBe(false);
      expect(version.forecastVersionId).toBeTruthy();
    });
  });

  describe('deriveWorkingVersion', () => {
    it('creates a new Working version derived from source', () => {
      const source = mockVersioningScenarios.confirmedVersion;
      const derived = deriveWorkingVersion(source, 'PostConfirmationEdit', 'user-1', 5);
      expect(derived.versionType).toBe('Working');
      expect(derived.derivedFromVersionId).toBe(source.forecastVersionId);
      expect(derived.derivationReason).toBe('PostConfirmationEdit');
      expect(derived.versionNumber).toBe(5);
      expect(derived.projectId).toBe(source.projectId);
      expect(derived.isReportCandidate).toBe(false);
      expect(derived.confirmedAt).toBeNull();
      expect(derived.checklistCompletedAt).toBeNull();
    });

    it('creates version with BudgetImport reason', () => {
      const source = createMockForecastVersion();
      const derived = deriveWorkingVersion(source, 'BudgetImport', 'user-1', 2);
      expect(derived.derivationReason).toBe('BudgetImport');
    });
  });

  describe('transitionToSuperseded', () => {
    it('transitions version to Superseded and clears report candidate flag', () => {
      const version = mockVersioningScenarios.reportCandidateVersion;
      const superseded = transitionToSuperseded(version);
      expect(superseded.versionType).toBe('Superseded');
      expect(superseded.isReportCandidate).toBe(false);
      expect(superseded.forecastVersionId).toBe(version.forecastVersionId);
    });
  });

  describe('confirmVersion', () => {
    it('transitions Working to ConfirmedInternal with timestamps', () => {
      const working = createMockForecastVersion({ versionType: 'Working' });
      const confirmed = confirmVersion(working, 'user-pm');
      expect(confirmed.versionType).toBe('ConfirmedInternal');
      expect(confirmed.confirmedBy).toBe('user-pm');
      expect(confirmed.confirmedAt).toBeTruthy();
      expect(confirmed.checklistCompletedAt).toBeTruthy();
    });
  });

  describe('designateReportCandidate', () => {
    it('sets isReportCandidate on target version', () => {
      const version = mockVersioningScenarios.confirmedVersion;
      const result = designateReportCandidate(version);
      expect(result.designated.isReportCandidate).toBe(true);
      expect(result.cleared).toBeNull();
    });

    it('clears isReportCandidate on prior holder', () => {
      const target = mockVersioningScenarios.confirmedVersion;
      const prior = mockVersioningScenarios.reportCandidateVersion;
      const result = designateReportCandidate(target, prior);
      expect(result.designated.isReportCandidate).toBe(true);
      expect(result.cleared).not.toBeNull();
      expect(result.cleared!.isReportCandidate).toBe(false);
      expect(result.cleared!.forecastVersionId).toBe(prior.forecastVersionId);
    });
  });

  describe('promoteToPublished', () => {
    it('transitions to PublishedMonthly with reporting month and run ID', () => {
      const candidate = mockVersioningScenarios.reportCandidateVersion;
      const published = promoteToPublished(candidate, '2026-03', 'run-001');
      expect(published.versionType).toBe('PublishedMonthly');
      expect(published.reportingMonth).toBe('2026-03');
      expect(published.publishedByRunId).toBe('run-001');
      expect(published.publishedAt).toBeTruthy();
    });
  });
});
