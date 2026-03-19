/**
 * Seed data constants for all 11 mock domains.
 * Each domain provides 1–3 realistic records used as initial in-memory state.
 */

import type {
  ILead,
  IScheduleActivity,
  IBuyoutEntry,
  IEstimatingTracker,
  IEstimatingKickoff,
  IComplianceEntry,
  IContractInfo,
  ICommitmentApproval,
  IRiskCostItem,
  IGoNoGoScorecard,
  IScorecardVersion,
  IProjectManagementPlan,
  IPMPSignature,
  IActiveProject,
  IInternalUser,
  IRole,
} from '@hbc/models';
import { LeadStage } from '@hbc/models';

// ---------------------------------------------------------------------------
// Leads
// ---------------------------------------------------------------------------

export const SEED_LEADS: ILead[] = [
  {
    id: 1,
    title: 'City Center Tower',
    stage: LeadStage.Qualifying,
    clientName: 'Metro Development Corp',
    estimatedValue: 45_000_000,
    createdAt: '2025-11-01T00:00:00Z',
    updatedAt: '2025-12-15T00:00:00Z',
  },
  {
    id: 2,
    title: 'Harbor Bridge Renovation',
    stage: LeadStage.Bidding,
    clientName: 'State DOT',
    estimatedValue: 18_500_000,
    createdAt: '2025-10-10T00:00:00Z',
    updatedAt: '2026-01-05T00:00:00Z',
  },
];

// ---------------------------------------------------------------------------
// Schedule
// ---------------------------------------------------------------------------

export const SEED_SCHEDULE_ACTIVITIES: IScheduleActivity[] = [
  {
    id: 1,
    projectId: 'PRJ-001',
    name: 'Foundation Excavation',
    startDate: '2026-01-15',
    endDate: '2026-03-01',
    percentComplete: 100,
    isCriticalPath: true,
  },
  {
    id: 2,
    projectId: 'PRJ-001',
    name: 'Structural Steel Erection',
    startDate: '2026-03-02',
    endDate: '2026-06-15',
    percentComplete: 35,
    isCriticalPath: true,
  },
];

// ---------------------------------------------------------------------------
// Buyout
// ---------------------------------------------------------------------------

export const SEED_BUYOUT_ENTRIES: IBuyoutEntry[] = [
  {
    id: 1,
    projectId: 'PRJ-001',
    costCode: '03-3100',
    description: 'Structural Concrete',
    budgetAmount: 2_400_000,
    committedAmount: 2_150_000,
    status: 'Committed',
  },
  {
    id: 2,
    projectId: 'PRJ-001',
    costCode: '05-1200',
    description: 'Structural Steel',
    budgetAmount: 3_800_000,
    committedAmount: 0,
    status: 'Pending',
  },
];

// ---------------------------------------------------------------------------
// Estimating
// ---------------------------------------------------------------------------

export const SEED_ESTIMATING_TRACKERS: IEstimatingTracker[] = [
  {
    id: 1,
    projectId: 'PRJ-001',
    bidNumber: 'BID-2026-001',
    status: 'InProgress',
    dueDate: '2026-04-15',
    createdAt: '2026-01-10T00:00:00Z',
    updatedAt: '2026-02-20T00:00:00Z',
  },
  {
    id: 2,
    projectId: 'PRJ-002',
    bidNumber: 'BID-2026-002',
    status: 'Draft',
    dueDate: '2026-05-01',
    createdAt: '2026-02-01T00:00:00Z',
    updatedAt: '2026-02-01T00:00:00Z',
  },
];

export const SEED_ESTIMATING_KICKOFFS: IEstimatingKickoff[] = [
  {
    id: 1,
    projectId: 'PRJ-001',
    kickoffDate: '2026-01-12T09:00:00Z',
    attendees: ['John Smith', 'Jane Doe', 'Bob Builder'],
    notes: 'Initial kickoff for City Center Tower bid.',
    createdAt: '2026-01-10T00:00:00Z',
  },
];

// ---------------------------------------------------------------------------
// Compliance
// ---------------------------------------------------------------------------

export const SEED_COMPLIANCE_ENTRIES: IComplianceEntry[] = [
  {
    id: 1,
    projectId: 'PRJ-001',
    vendorName: 'Acme Concrete LLC',
    requirementType: 'Insurance',
    status: 'Compliant',
    expirationDate: '2027-01-15',
  },
  {
    id: 2,
    projectId: 'PRJ-001',
    vendorName: 'Steel Works Inc',
    requirementType: 'License',
    status: 'ExpiringSoon',
    expirationDate: '2026-04-01',
  },
];

// ---------------------------------------------------------------------------
// Contracts
// ---------------------------------------------------------------------------

export const SEED_CONTRACTS: IContractInfo[] = [
  {
    id: 1,
    projectId: 'PRJ-001',
    contractNumber: 'CTR-2026-001',
    vendorName: 'Acme Concrete LLC',
    amount: 2_150_000,
    status: 'Executed',
    executedDate: '2026-01-20',
  },
  {
    id: 2,
    projectId: 'PRJ-001',
    contractNumber: 'CTR-2026-002',
    vendorName: 'Steel Works Inc',
    amount: 3_800_000,
    status: 'Draft',
    executedDate: '',
  },
];

export const SEED_CONTRACT_APPROVALS: ICommitmentApproval[] = [
  {
    id: 1,
    contractId: 1,
    approverName: 'Sarah Johnson',
    approvedAt: '2026-01-18T14:30:00Z',
    status: 'Approved',
    notes: 'Reviewed and approved per project budget.',
  },
];

// ---------------------------------------------------------------------------
// Risk
// ---------------------------------------------------------------------------

export const SEED_RISK_ITEMS: IRiskCostItem[] = [
  {
    id: 1,
    projectId: 'PRJ-001',
    description: 'Steel price escalation beyond budget allowance',
    category: 'Financial',
    estimatedImpact: 450_000,
    probability: 0.35,
    status: 'Open',
  },
  {
    id: 2,
    projectId: 'PRJ-001',
    description: 'Subcontractor workforce shortage during peak season',
    category: 'Schedule',
    estimatedImpact: 220_000,
    probability: 0.5,
    status: 'Mitigating',
  },
];

// ---------------------------------------------------------------------------
// Scorecard
// ---------------------------------------------------------------------------

export const SEED_SCORECARDS: IGoNoGoScorecard[] = [
  {
    id: 1,
    projectId: 'PRJ-001',
    version: 1,
    overallScore: 78,
    recommendation: 'Go',
    createdAt: '2026-01-05T00:00:00Z',
    updatedAt: '2026-01-10T00:00:00Z',
  },
];

export const SEED_SCORECARD_VERSIONS: IScorecardVersion[] = [
  {
    id: 1,
    scorecardId: 1,
    version: 1,
    snapshot: { overallScore: 78, recommendation: 'Go' },
    createdAt: '2026-01-05T00:00:00Z',
  },
];

// ---------------------------------------------------------------------------
// PMP
// ---------------------------------------------------------------------------

export const SEED_PMPS: IProjectManagementPlan[] = [
  {
    id: 1,
    projectId: 'PRJ-001',
    version: 1,
    status: 'Draft',
    createdAt: '2026-01-08T00:00:00Z',
    updatedAt: '2026-02-15T00:00:00Z',
  },
];

export const SEED_PMP_SIGNATURES: IPMPSignature[] = [
  {
    id: 1,
    pmpId: 1,
    signerName: 'John Smith',
    role: 'Project Manager',
    signedAt: '2026-02-15T10:00:00Z',
    status: 'Signed',
  },
];

// ---------------------------------------------------------------------------
// Project
// ---------------------------------------------------------------------------

export const SEED_PROJECTS: IActiveProject[] = [
  {
    id: 'proj-uuid-001',
    name: 'City Center Tower',
    number: 'PRJ-001',
    status: 'Active',
    startDate: '2026-01-01',
    endDate: '2028-06-30',
  },
  {
    id: 'proj-uuid-002',
    name: 'Harbor Bridge Renovation',
    number: 'PRJ-002',
    status: 'Active',
    startDate: '2026-03-01',
    endDate: '2027-12-31',
  },
];

// ---------------------------------------------------------------------------
// Auth
// ---------------------------------------------------------------------------

export const SEED_ROLES: IRole[] = [
  {
    id: 'role-admin',
    name: 'Administrator',
    grants: ['project:*', 'user:*', 'audit:*', 'settings:*'],
  },
  {
    id: 'role-pm',
    name: 'Project Manager',
    grants: ['project:read', 'project:write', 'document:*', 'reports:read'],
  },
];

export const SEED_CURRENT_USER: IInternalUser = {
  type: 'internal',
  id: 'user-uuid-001',
  displayName: 'Dev User',
  email: 'dev@hbconstruction.com',
  jobTitle: 'Project Manager',
  roles: [
    {
      id: 'role-admin',
      name: 'Administrator',
      grants: ['project:*', 'user:*', 'audit:*', 'settings:*'],
      source: 'manual',
    },
  ],
};
