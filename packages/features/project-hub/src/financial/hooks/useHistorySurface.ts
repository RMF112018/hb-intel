/**
 * useHistorySurface — view-ready data hook for the History / Audit surface.
 *
 * Mock data initially. Will wire to IFinancialRepository.
 * Stage 2 — investigation workspace governance defined; no audit event persistence.
 */

import { useMemo } from 'react';
import type { FinancialViewerRole, FinancialComplexityTier } from './useFinancialControlCenter.js';

export interface VersionHistoryEntry {
  readonly id: string;
  readonly versionNumber: number;
  readonly state: string;
  readonly createdAt: string;
  readonly confirmedAt: string | null;
  readonly publishedAt: string | null;
  readonly derivationReason: string | null;
  readonly reportingMonth: string;
}

export interface AuditEventEntry {
  readonly id: string;
  readonly eventType: string;
  readonly summary: string;
  readonly actor: string;
  readonly occurredAt: string;
  readonly significance: 'routine' | 'notable' | 'critical';
}

export interface HistorySurfaceData {
  readonly versions: readonly VersionHistoryEntry[];
  readonly auditEvents: readonly AuditEventEntry[];
  readonly reportingMonth: string;
}

export function useHistorySurface(_options?: {
  viewerRole?: FinancialViewerRole;
  complexityTier?: FinancialComplexityTier;
}): HistorySurfaceData {
  return useMemo(() => ({
    versions: [
      { id: 'ver-1', versionNumber: 1, state: 'PublishedMonthly', createdAt: '2026-01-05T09:00:00Z', confirmedAt: '2026-01-28T16:00:00Z', publishedAt: '2026-01-31T18:00:00Z', derivationReason: null, reportingMonth: 'January 2026' },
      { id: 'ver-2', versionNumber: 2, state: 'PublishedMonthly', createdAt: '2026-02-03T09:00:00Z', confirmedAt: '2026-02-25T15:00:00Z', publishedAt: '2026-02-28T18:00:00Z', derivationReason: 'NewPeriod', reportingMonth: 'February 2026' },
      { id: 'ver-3', versionNumber: 3, state: 'Working', createdAt: '2026-03-03T09:00:00Z', confirmedAt: null, publishedAt: null, derivationReason: 'NewPeriod', reportingMonth: 'March 2026' },
    ],
    auditEvents: [
      { id: 'evt-1', eventType: 'BudgetImported', summary: 'Budget CSV imported — 142 lines processed, 0 reconciliation conditions', actor: 'John Smith', occurredAt: '2026-03-05T10:30:00Z', significance: 'notable' },
      { id: 'evt-2', eventType: 'ForecastVersionDerived', summary: 'Version 3 derived from Version 2 (NewPeriod)', actor: 'John Smith', occurredAt: '2026-03-03T09:00:00Z', significance: 'routine' },
      { id: 'evt-3', eventType: 'ForecastVersionPublished', summary: 'Version 2 promoted to PublishedMonthly for February 2026', actor: 'System (P3-F1)', occurredAt: '2026-02-28T18:00:00Z', significance: 'critical' },
      { id: 'evt-4', eventType: 'ForecastVersionConfirmed', summary: 'Version 2 confirmed by PM', actor: 'John Smith', occurredAt: '2026-02-25T15:00:00Z', significance: 'notable' },
      { id: 'evt-5', eventType: 'BuyoutLineExecuted', summary: 'Buyout line Division 09 advanced to ContractExecuted', actor: 'John Smith', occurredAt: '2026-02-20T11:00:00Z', significance: 'notable' },
    ],
    reportingMonth: 'March 2026',
  }), []);
}
