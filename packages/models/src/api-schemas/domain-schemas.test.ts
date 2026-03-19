import { describe, it, expect } from 'vitest';
import { LeadStage } from '../leads/index.js';
import {
  LeadSchema,
  LeadFormDataSchema,
  ActiveProjectSchema,
  PortfolioSummarySchema,
  EstimatingTrackerSchema,
  EstimatingKickoffSchema,
  ScheduleActivitySchema,
  ScheduleMetricsSchema,
  BuyoutEntrySchema,
  BuyoutSummarySchema,
  ComplianceEntrySchema,
  ComplianceSummarySchema,
  ContractInfoSchema,
  CommitmentApprovalSchema,
  RiskCostItemSchema,
  RiskCostManagementSchema,
  GoNoGoScorecardSchema,
  ScorecardVersionSchema,
  ProjectManagementPlanSchema,
  PMPSignatureSchema,
  RoleSchema,
  PermissionTemplateSchema,
  JobTitleMappingSchema,
  InternalUserSchema,
  ExternalUserSchema,
  CurrentUserSchema,
} from './index.js';

// ─── Lead ────────────────────────────────────────────────────────────────────

describe('LeadSchema', () => {
  const valid = {
    id: 1,
    title: 'Test Lead',
    stage: LeadStage.Identified,
    clientName: 'Acme Corp',
    estimatedValue: 500000,
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-02T00:00:00Z',
  };

  it('accepts valid lead', () => {
    expect(LeadSchema.safeParse(valid).success).toBe(true);
  });

  it('rejects invalid stage', () => {
    expect(LeadSchema.safeParse({ ...valid, stage: 'Invalid' }).success).toBe(false);
  });

  it('rejects missing title', () => {
    const { title: _, ...rest } = valid;
    expect(LeadSchema.safeParse(rest).success).toBe(false);
  });
});

describe('LeadFormDataSchema', () => {
  it('accepts valid form data', () => {
    expect(LeadFormDataSchema.safeParse({
      title: 'New Lead',
      stage: LeadStage.Qualifying,
      clientName: 'Client',
      estimatedValue: 100000,
    }).success).toBe(true);
  });
});

// ─── Project ─────────────────────────────────────────────────────────────────

describe('ActiveProjectSchema', () => {
  const valid = {
    id: 'uuid-1',
    name: 'Project Alpha',
    number: 'P-001',
    status: 'Active',
    startDate: '2026-01-01',
    endDate: '2026-12-31',
  };

  it('accepts valid project', () => {
    expect(ActiveProjectSchema.safeParse(valid).success).toBe(true);
  });

  it('rejects missing name', () => {
    const { name: _, ...rest } = valid;
    expect(ActiveProjectSchema.safeParse(rest).success).toBe(false);
  });
});

describe('PortfolioSummarySchema', () => {
  it('accepts valid summary', () => {
    expect(PortfolioSummarySchema.safeParse({
      totalProjects: 10,
      activeProjects: 7,
      totalContractValue: 5000000,
      averagePercentComplete: 45.5,
    }).success).toBe(true);
  });
});

// ─── Estimating ──────────────────────────────────────────────────────────────

describe('EstimatingTrackerSchema', () => {
  it('accepts valid tracker', () => {
    expect(EstimatingTrackerSchema.safeParse({
      id: 1,
      projectId: 'uuid-1',
      bidNumber: 'BID-001',
      status: 'Draft',
      dueDate: '2026-03-01',
      createdAt: '2026-01-01T00:00:00Z',
      updatedAt: '2026-01-02T00:00:00Z',
    }).success).toBe(true);
  });
});

describe('EstimatingKickoffSchema', () => {
  it('accepts valid kickoff', () => {
    expect(EstimatingKickoffSchema.safeParse({
      id: 1,
      projectId: 'uuid-1',
      kickoffDate: '2026-02-01',
      attendees: ['Alice', 'Bob'],
      notes: 'Initial meeting',
      createdAt: '2026-01-01T00:00:00Z',
    }).success).toBe(true);
  });
});

// ─── Schedule ────────────────────────────────────────────────────────────────

describe('ScheduleActivitySchema', () => {
  it('accepts valid activity', () => {
    expect(ScheduleActivitySchema.safeParse({
      id: 1,
      projectId: 'uuid-1',
      name: 'Foundation',
      startDate: '2026-01-15',
      endDate: '2026-02-15',
      percentComplete: 75,
      isCriticalPath: true,
    }).success).toBe(true);
  });
});

describe('ScheduleMetricsSchema', () => {
  it('accepts valid metrics', () => {
    expect(ScheduleMetricsSchema.safeParse({
      projectId: 'uuid-1',
      totalActivities: 50,
      completedActivities: 30,
      criticalPathVariance: -2.5,
      overallPercentComplete: 60,
    }).success).toBe(true);
  });
});

// ─── Buyout ──────────────────────────────────────────────────────────────────

describe('BuyoutEntrySchema', () => {
  it('accepts valid entry', () => {
    expect(BuyoutEntrySchema.safeParse({
      id: 1,
      projectId: 'uuid-1',
      costCode: '03-100',
      description: 'Concrete',
      budgetAmount: 250000,
      committedAmount: 200000,
      status: 'InProgress',
    }).success).toBe(true);
  });
});

describe('BuyoutSummarySchema', () => {
  it('accepts valid summary', () => {
    expect(BuyoutSummarySchema.safeParse({
      projectId: 'uuid-1',
      totalBudget: 1000000,
      totalCommitted: 750000,
      totalRemaining: 250000,
      percentBoughtOut: 75,
    }).success).toBe(true);
  });
});

// ─── Compliance ──────────────────────────────────────────────────────────────

describe('ComplianceEntrySchema', () => {
  it('accepts valid entry', () => {
    expect(ComplianceEntrySchema.safeParse({
      id: 1,
      projectId: 'uuid-1',
      vendorName: 'SubCo',
      requirementType: 'Insurance',
      status: 'Compliant',
      expirationDate: '2027-01-01',
    }).success).toBe(true);
  });
});

describe('ComplianceSummarySchema', () => {
  it('accepts valid summary', () => {
    expect(ComplianceSummarySchema.safeParse({
      projectId: 'uuid-1',
      totalEntries: 20,
      compliant: 15,
      nonCompliant: 3,
      expiringSoon: 2,
    }).success).toBe(true);
  });
});

// ─── Contract ────────────────────────────────────────────────────────────────

describe('ContractInfoSchema', () => {
  it('accepts valid contract', () => {
    expect(ContractInfoSchema.safeParse({
      id: 1,
      projectId: 'uuid-1',
      contractNumber: 'C-001',
      vendorName: 'BuildCo',
      amount: 500000,
      status: 'Executed',
      executedDate: '2026-01-15',
    }).success).toBe(true);
  });
});

describe('CommitmentApprovalSchema', () => {
  it('accepts valid approval', () => {
    expect(CommitmentApprovalSchema.safeParse({
      id: 1,
      contractId: 10,
      approverName: 'Jane Doe',
      approvedAt: '2026-01-20T10:00:00Z',
      status: 'Approved',
      notes: 'LGTM',
    }).success).toBe(true);
  });
});

// ─── Risk ────────────────────────────────────────────────────────────────────

describe('RiskCostItemSchema', () => {
  it('accepts valid risk item', () => {
    expect(RiskCostItemSchema.safeParse({
      id: 1,
      projectId: 'uuid-1',
      description: 'Weather delay',
      category: 'Schedule',
      estimatedImpact: 50000,
      probability: 0.3,
      status: 'Open',
    }).success).toBe(true);
  });
});

describe('RiskCostManagementSchema', () => {
  it('accepts valid management with nested items', () => {
    expect(RiskCostManagementSchema.safeParse({
      projectId: 'uuid-1',
      totalExposure: 100000,
      mitigatedAmount: 40000,
      contingencyBudget: 60000,
      items: [{
        id: 1,
        projectId: 'uuid-1',
        description: 'Weather',
        category: 'Schedule',
        estimatedImpact: 50000,
        probability: 0.3,
        status: 'Open',
      }],
    }).success).toBe(true);
  });
});

// ─── Scorecard ───────────────────────────────────────────────────────────────

describe('GoNoGoScorecardSchema', () => {
  it('accepts valid scorecard', () => {
    expect(GoNoGoScorecardSchema.safeParse({
      id: 1,
      projectId: 'uuid-1',
      version: 1,
      overallScore: 85,
      recommendation: 'Go',
      createdAt: '2026-01-01T00:00:00Z',
      updatedAt: '2026-01-02T00:00:00Z',
    }).success).toBe(true);
  });
});

describe('ScorecardVersionSchema', () => {
  it('accepts valid version with snapshot', () => {
    expect(ScorecardVersionSchema.safeParse({
      id: 1,
      scorecardId: 10,
      version: 2,
      snapshot: { criteria: [1, 2, 3], notes: 'review' },
      createdAt: '2026-01-15T00:00:00Z',
    }).success).toBe(true);
  });
});

// ─── PMP ─────────────────────────────────────────────────────────────────────

describe('ProjectManagementPlanSchema', () => {
  it('accepts valid PMP', () => {
    expect(ProjectManagementPlanSchema.safeParse({
      id: 1,
      projectId: 'uuid-1',
      version: 1,
      status: 'Draft',
      createdAt: '2026-01-01T00:00:00Z',
      updatedAt: '2026-01-02T00:00:00Z',
    }).success).toBe(true);
  });
});

describe('PMPSignatureSchema', () => {
  it('accepts valid signature', () => {
    expect(PMPSignatureSchema.safeParse({
      id: 1,
      pmpId: 10,
      signerName: 'John Smith',
      role: 'ProjectManager',
      signedAt: '2026-01-20T14:00:00Z',
      status: 'Signed',
    }).success).toBe(true);
  });
});

// ─── Auth ────────────────────────────────────────────────────────────────────

describe('RoleSchema', () => {
  it('accepts valid role', () => {
    expect(RoleSchema.safeParse({
      id: 'role-1',
      name: 'Project Manager',
      grants: ['project.read', 'project.write'],
    }).success).toBe(true);
  });
});

describe('PermissionTemplateSchema', () => {
  it('accepts valid template', () => {
    expect(PermissionTemplateSchema.safeParse({
      id: 'tmpl-1',
      name: 'Standard PM',
      description: 'Default PM permissions',
      grants: ['project.read', 'schedule.write'],
    }).success).toBe(true);
  });
});

describe('JobTitleMappingSchema', () => {
  it('accepts valid mapping', () => {
    expect(JobTitleMappingSchema.safeParse({
      id: 'map-1',
      roleId: 'role-1',
      roleName: 'Project Manager',
      aliases: ['PM', 'Project Mgr'],
      matchMode: 'contains',
      active: true,
      updatedAt: '2026-01-01T00:00:00Z',
      updatedBy: 'admin@hbc.com',
    }).success).toBe(true);
  });

  it('rejects invalid matchMode', () => {
    expect(JobTitleMappingSchema.safeParse({
      id: 'map-1',
      roleId: 'role-1',
      roleName: 'PM',
      aliases: [],
      matchMode: 'regex',
      active: true,
      updatedAt: '2026-01-01',
      updatedBy: 'admin',
    }).success).toBe(false);
  });
});

describe('CurrentUserSchema (discriminated union)', () => {
  it('accepts internal user', () => {
    expect(CurrentUserSchema.safeParse({
      type: 'internal',
      id: 'user-1',
      displayName: 'Alice',
      email: 'alice@hbc.com',
      jobTitle: 'Project Manager',
      roles: [{ id: 'r1', name: 'PM', grants: ['project.read'], source: 'job-title' }],
    }).success).toBe(true);
  });

  it('accepts external user', () => {
    expect(CurrentUserSchema.safeParse({
      type: 'external',
      id: 'ext-1',
      displayName: 'Bob External',
      email: 'bob@vendor.com',
      projectAccess: [{ projectId: 'p1', grants: ['doc.read'], invitedAt: '2026-01-01' }],
    }).success).toBe(true);
  });

  it('rejects unknown type discriminator', () => {
    expect(CurrentUserSchema.safeParse({
      type: 'unknown',
      id: 'x',
      displayName: 'X',
      email: 'x@x.com',
    }).success).toBe(false);
  });

  it('accepts internal user without optional jobTitle', () => {
    expect(CurrentUserSchema.safeParse({
      type: 'internal',
      id: 'user-2',
      displayName: 'Charlie',
      email: 'charlie@hbc.com',
      roles: [],
    }).success).toBe(true);
  });
});
