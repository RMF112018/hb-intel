import { describe, expect, it } from 'vitest';
import {
  PaginationQuerySchema,
  CreateLeadSchema,
  UpdateLeadSchema,
  CreateProjectSchema,
  UpdateProjectSchema,
  CreateTrackerSchema,
  UpdateTrackerSchema,
  CreateKickoffSchema,
} from './index.js';

describe('P1-C2 PaginationQuerySchema', () => {
  it('applies defaults when no params provided', () => {
    const result = PaginationQuerySchema.parse({});
    expect(result).toEqual({ page: 1, pageSize: 25 });
  });

  it('coerces string values to numbers', () => {
    const result = PaginationQuerySchema.parse({ page: '3', pageSize: '50' });
    expect(result).toEqual({ page: 3, pageSize: 50 });
  });

  it('rejects pageSize over 100', () => {
    const result = PaginationQuerySchema.safeParse({ pageSize: '200' });
    expect(result.success).toBe(false);
  });

  it('rejects non-positive page', () => {
    const result = PaginationQuerySchema.safeParse({ page: '0' });
    expect(result.success).toBe(false);
  });

  it('includes optional search param', () => {
    const result = PaginationQuerySchema.parse({ search: 'test' });
    expect(result.search).toBe('test');
  });
});

describe('P1-C2 CreateLeadSchema', () => {
  const validLead = {
    title: 'Office Renovation',
    stage: 'Identified',
    clientName: 'Acme Corp',
    estimatedValue: 500000,
  };

  it('parses a valid lead payload', () => {
    const result = CreateLeadSchema.parse(validLead);
    expect(result).toEqual(validLead);
  });

  it('rejects missing required field (title)', () => {
    const { title: _, ...noTitle } = validLead;
    const result = CreateLeadSchema.safeParse(noTitle);
    expect(result.success).toBe(false);
  });

  it('rejects invalid enum value for stage', () => {
    const result = CreateLeadSchema.safeParse({ ...validLead, stage: 'InvalidStage' });
    expect(result.success).toBe(false);
  });

  it('rejects title exceeding max length', () => {
    const result = CreateLeadSchema.safeParse({ ...validLead, title: 'x'.repeat(256) });
    expect(result.success).toBe(false);
  });

  it('rejects negative estimatedValue', () => {
    const result = CreateLeadSchema.safeParse({ ...validLead, estimatedValue: -100 });
    expect(result.success).toBe(false);
  });

  it('accepts zero estimatedValue', () => {
    const result = CreateLeadSchema.parse({ ...validLead, estimatedValue: 0 });
    expect(result.estimatedValue).toBe(0);
  });

  it('accepts all valid LeadStage values', () => {
    for (const stage of ['Identified', 'Qualifying', 'BidDecision', 'Bidding', 'Awarded', 'Lost', 'Declined']) {
      expect(CreateLeadSchema.safeParse({ ...validLead, stage }).success).toBe(true);
    }
  });
});

describe('P1-C2 UpdateLeadSchema', () => {
  it('accepts partial payload with only one field', () => {
    const result = UpdateLeadSchema.parse({ title: 'New Title' });
    expect(result).toEqual({ title: 'New Title' });
  });

  it('accepts empty object', () => {
    const result = UpdateLeadSchema.parse({});
    expect(result).toEqual({});
  });
});

describe('P1-C2 CreateProjectSchema', () => {
  const validProject = {
    name: 'New Building',
    number: 'PRJ-001',
    status: 'Active',
    startDate: '2026-01-15T00:00:00.000Z',
    endDate: '2027-06-30T00:00:00.000Z',
  };

  it('parses a valid project payload', () => {
    const result = CreateProjectSchema.parse(validProject);
    expect(result).toEqual(validProject);
  });

  it('rejects missing required field (name)', () => {
    const { name: _, ...noName } = validProject;
    const result = CreateProjectSchema.safeParse(noName);
    expect(result.success).toBe(false);
  });

  it('rejects invalid datetime format', () => {
    const result = CreateProjectSchema.safeParse({ ...validProject, startDate: 'not-a-date' });
    expect(result.success).toBe(false);
  });

  it('rejects empty status', () => {
    const result = CreateProjectSchema.safeParse({ ...validProject, status: '' });
    expect(result.success).toBe(false);
  });
});

describe('P1-C2 UpdateProjectSchema', () => {
  it('accepts partial payload', () => {
    const result = UpdateProjectSchema.parse({ name: 'Updated Name' });
    expect(result).toEqual({ name: 'Updated Name' });
  });
});

describe('P1-C2 CreateTrackerSchema', () => {
  const validTracker = {
    projectId: '550e8400-e29b-41d4-a716-446655440000',
    bidNumber: 'BID-2026-001',
    status: 'Draft',
    dueDate: '2026-04-15T00:00:00.000Z',
  };

  it('parses a valid tracker payload', () => {
    const result = CreateTrackerSchema.parse(validTracker);
    expect(result).toEqual(validTracker);
  });

  it('rejects non-UUID projectId', () => {
    const result = CreateTrackerSchema.safeParse({ ...validTracker, projectId: 'not-uuid' });
    expect(result.success).toBe(false);
  });

  it('rejects invalid enum value for status', () => {
    const result = CreateTrackerSchema.safeParse({ ...validTracker, status: 'InvalidStatus' });
    expect(result.success).toBe(false);
  });

  it('accepts all valid EstimatingStatus values', () => {
    for (const status of ['Draft', 'InProgress', 'Submitted', 'Awarded', 'Lost']) {
      expect(CreateTrackerSchema.safeParse({ ...validTracker, status }).success).toBe(true);
    }
  });

  it('rejects missing bidNumber', () => {
    const { bidNumber: _, ...noBid } = validTracker;
    const result = CreateTrackerSchema.safeParse(noBid);
    expect(result.success).toBe(false);
  });
});

describe('P1-C2 UpdateTrackerSchema', () => {
  it('accepts partial payload', () => {
    const result = UpdateTrackerSchema.parse({ status: 'InProgress' });
    expect(result).toEqual({ status: 'InProgress' });
  });
});

describe('P1-C2 CreateKickoffSchema', () => {
  const validKickoff = {
    projectId: '550e8400-e29b-41d4-a716-446655440000',
    kickoffDate: '2026-04-01T09:00:00.000Z',
    attendees: ['Alice', 'Bob'],
    notes: 'Review scope and timeline',
  };

  it('parses a valid kickoff payload', () => {
    const result = CreateKickoffSchema.parse(validKickoff);
    expect(result).toEqual(validKickoff);
  });

  it('rejects empty attendees array', () => {
    const result = CreateKickoffSchema.safeParse({ ...validKickoff, attendees: [] });
    expect(result.success).toBe(false);
  });

  it('rejects attendees with empty strings', () => {
    const result = CreateKickoffSchema.safeParse({ ...validKickoff, attendees: [''] });
    expect(result.success).toBe(false);
  });

  it('rejects missing notes', () => {
    const { notes: _, ...noNotes } = validKickoff;
    const result = CreateKickoffSchema.safeParse(noNotes);
    expect(result.success).toBe(false);
  });

  it('rejects non-UUID projectId', () => {
    const result = CreateKickoffSchema.safeParse({ ...validKickoff, projectId: 'abc' });
    expect(result.success).toBe(false);
  });
});
