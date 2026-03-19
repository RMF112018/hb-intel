import type {
  ILead,
  IActiveProject,
  IEstimatingTracker,
  IEstimatingKickoff,
  IPortfolioSummary,
} from '@hbc/models';
import { LeadStage } from '@hbc/models';

// ─── Lead Fixtures ───────────────────────────────────────────────────────────

export const LEAD_FIXTURES: ILead[] = [
  {
    id: 1,
    title: 'Highway Bridge Replacement — I-95 Corridor',
    stage: LeadStage.Qualifying,
    clientName: 'ACME Construction',
    estimatedValue: 2500000,
    createdAt: '2026-01-15T09:00:00Z',
    updatedAt: '2026-03-16T14:30:00Z',
  },
  {
    id: 2,
    title: 'Downtown Office Tower Renovation',
    stage: LeadStage.Bidding,
    clientName: 'Metro Development Group',
    estimatedValue: 8500000,
    createdAt: '2026-02-01T10:00:00Z',
    updatedAt: '2026-03-10T11:00:00Z',
  },
  {
    id: 3,
    title: 'Warehouse Expansion — Phase 2',
    stage: LeadStage.Identified,
    clientName: 'LogiCorp Warehousing',
    estimatedValue: 1200000,
    createdAt: '2026-03-01T08:00:00Z',
    updatedAt: '2026-03-15T16:00:00Z',
  },
];

// ─── Project Fixtures ────────────────────────────────────────────────────────

export const PROJECT_FIXTURES: IActiveProject[] = [
  {
    id: '660e8400-e29b-41d4-a716-446655440001',
    name: 'Highway Bridge Replacement',
    number: 'PRJ-HBR001',
    status: 'Active',
    startDate: '2026-02-01T00:00:00Z',
    endDate: '2026-12-31T00:00:00Z',
  },
  {
    id: '660e8400-e29b-41d4-a716-446655440002',
    name: 'Downtown Office Tower',
    number: 'PRJ-DOT002',
    status: 'Active',
    startDate: '2026-03-01T00:00:00Z',
    endDate: '2027-06-30T00:00:00Z',
  },
  {
    id: '660e8400-e29b-41d4-a716-446655440003',
    name: 'School Gymnasium Addition',
    number: 'PRJ-SGA003',
    status: 'OnHold',
    startDate: '2026-04-01T00:00:00Z',
    endDate: '2026-10-31T00:00:00Z',
  },
];

export const PORTFOLIO_SUMMARY_FIXTURE: IPortfolioSummary = {
  totalProjects: 3,
  activeProjects: 2,
  totalContractValue: 12200000,
  averagePercentComplete: 35.5,
};

// ─── Estimating Fixtures ─────────────────────────────────────────────────────

export const ESTIMATING_TRACKER_FIXTURES: IEstimatingTracker[] = [
  {
    id: 1,
    projectId: '660e8400-e29b-41d4-a716-446655440001',
    bidNumber: 'BID-2026-001',
    status: 'InProgress',
    dueDate: '2026-04-15T17:00:00Z',
    createdAt: '2026-02-05T09:00:00Z',
    updatedAt: '2026-03-16T09:00:00Z',
  },
  {
    id: 2,
    projectId: '660e8400-e29b-41d4-a716-446655440002',
    bidNumber: 'BID-2026-002',
    status: 'Draft',
    dueDate: '2026-05-01T17:00:00Z',
    createdAt: '2026-03-01T10:00:00Z',
    updatedAt: '2026-03-14T15:00:00Z',
  },
];

export const ESTIMATING_KICKOFF_FIXTURES: IEstimatingKickoff[] = [
  {
    id: 1,
    projectId: '660e8400-e29b-41d4-a716-446655440001',
    kickoffDate: '2026-02-10T14:00:00Z',
    attendees: ['Alice PM', 'Bob Estimator', 'Charlie Superintendent'],
    notes: 'Initial scope review and bid strategy discussion',
    createdAt: '2026-02-05T09:00:00Z',
  },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

export function makePagedResponse<T>(
  allItems: T[],
  page: number,
  pageSize: number,
): { items: T[]; total: number; page: number; pageSize: number } {
  const startIdx = (page - 1) * pageSize;
  const endIdx = startIdx + pageSize;
  return {
    items: allItems.slice(startIdx, endIdx),
    total: allItems.length,
    page,
    pageSize,
  };
}
