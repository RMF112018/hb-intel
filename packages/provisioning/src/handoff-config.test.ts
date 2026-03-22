import { describe, expect, it } from 'vitest';
import type { IProjectSetupRequest } from '@hbc/models';
import {
  SETUP_TO_PROJECT_HUB_HANDOFF_CONFIG,
  validateSetupHandoffReadiness,
  resolveProjectHubUrl,
} from './handoff-config.js';

function makeRequest(overrides?: Partial<IProjectSetupRequest>): IProjectSetupRequest {
  return {
    requestId: 'req-1',
    projectId: 'proj-1',
    projectName: 'Test Project',
    projectLocation: 'New York, NY',
    projectType: 'Ground-Up',
    projectStage: 'Pursuit',
    submittedBy: 'coordinator@example.com',
    submittedAt: '2026-03-01T00:00:00.000Z',
    state: 'Completed',
    projectNumber: '26-001-01',
    groupMembers: ['member@example.com'],
    department: 'commercial',
    projectLeadId: 'lead@example.com',
    siteUrl: 'https://hbc.sharepoint.com/sites/proj-1',
    retryCount: 0,
    ...overrides,
  };
}

// ─── validateSetupHandoffReadiness ───────────────────────────────────────────

describe('validateSetupHandoffReadiness', () => {
  it('returns null for a fully ready request', () => {
    expect(validateSetupHandoffReadiness(makeRequest())).toBeNull();
  });

  it('fails when state is not Completed', () => {
    const result = validateSetupHandoffReadiness(makeRequest({ state: 'Provisioning' }));
    expect(result).toContain('fully completed');
  });

  it('fails when siteUrl is missing', () => {
    const result = validateSetupHandoffReadiness(makeRequest({ siteUrl: undefined }));
    expect(result).toContain('site URL');
  });

  it('fails when siteUrl is empty', () => {
    const result = validateSetupHandoffReadiness(makeRequest({ siteUrl: '' }));
    expect(result).toContain('site URL');
  });

  it('fails when department is missing', () => {
    const result = validateSetupHandoffReadiness(makeRequest({ department: undefined }));
    expect(result).toContain('Department');
  });

  it('fails when projectLeadId is missing', () => {
    const result = validateSetupHandoffReadiness(makeRequest({ projectLeadId: undefined }));
    expect(result).toContain('Project lead');
  });

  it('returns the first failing condition (state before siteUrl)', () => {
    const result = validateSetupHandoffReadiness(
      makeRequest({ state: 'Provisioning', siteUrl: undefined }),
    );
    expect(result).toContain('fully completed');
  });
});

// ─── resolveProjectHubUrl ───────────────────────────────────────────────────

describe('resolveProjectHubUrl', () => {
  it('returns siteUrl for a completed request with a site URL', () => {
    expect(resolveProjectHubUrl(makeRequest())).toBe('https://hbc.sharepoint.com/sites/proj-1');
  });

  it('returns null when state is not Completed', () => {
    expect(resolveProjectHubUrl(makeRequest({ state: 'Provisioning' }))).toBeNull();
  });

  it('returns null when siteUrl is undefined', () => {
    expect(resolveProjectHubUrl(makeRequest({ siteUrl: undefined }))).toBeNull();
  });

  it('returns null when siteUrl is empty string', () => {
    expect(resolveProjectHubUrl(makeRequest({ siteUrl: '' }))).toBeNull();
  });

  it('returns null when state is not Completed even if siteUrl is present', () => {
    expect(resolveProjectHubUrl(makeRequest({ state: 'Failed', siteUrl: 'https://example.com' }))).toBeNull();
  });
});

// ─── SETUP_TO_PROJECT_HUB_HANDOFF_CONFIG ─────────────────────────────────────

describe('SETUP_TO_PROJECT_HUB_HANDOFF_CONFIG', () => {
  it('has correct route metadata', () => {
    expect(SETUP_TO_PROJECT_HUB_HANDOFF_CONFIG.sourceModule).toBe('estimating');
    expect(SETUP_TO_PROJECT_HUB_HANDOFF_CONFIG.sourceRecordType).toBe('project-setup-request');
    expect(SETUP_TO_PROJECT_HUB_HANDOFF_CONFIG.destinationModule).toBe('project-hub');
    expect(SETUP_TO_PROJECT_HUB_HANDOFF_CONFIG.destinationRecordType).toBe('project-record');
  });

  it('has a human-readable route label', () => {
    expect(SETUP_TO_PROJECT_HUB_HANDOFF_CONFIG.routeLabel).toBe('Project Setup → Project Hub');
  });

  describe('mapSourceToDestination', () => {
    it('maps all seed data fields from a completed request', () => {
      const seed = SETUP_TO_PROJECT_HUB_HANDOFF_CONFIG.mapSourceToDestination(makeRequest());
      expect(seed).toEqual({
        projectName: 'Test Project',
        projectNumber: '26-001-01',
        department: 'commercial',
        siteUrl: 'https://hbc.sharepoint.com/sites/proj-1',
        projectLeadId: 'lead@example.com',
        groupMembers: ['member@example.com'],
        startDate: undefined,
        estimatedValue: undefined,
        clientName: undefined,
      });
    });

    it('includes optional fields when present', () => {
      const seed = SETUP_TO_PROJECT_HUB_HANDOFF_CONFIG.mapSourceToDestination(
        makeRequest({ startDate: '2026-06-01', estimatedValue: 5_000_000, clientName: 'ACME' }),
      );
      expect(seed.startDate).toBe('2026-06-01');
      expect(seed.estimatedValue).toBe(5_000_000);
      expect(seed.clientName).toBe('ACME');
    });
  });

  describe('resolveDocuments', () => {
    it('returns empty array in Wave 0', async () => {
      const docs = await SETUP_TO_PROJECT_HUB_HANDOFF_CONFIG.resolveDocuments(makeRequest());
      expect(docs).toEqual([]);
    });
  });

  describe('resolveRecipient', () => {
    it('returns the project lead', () => {
      const recipient = SETUP_TO_PROJECT_HUB_HANDOFF_CONFIG.resolveRecipient(makeRequest());
      expect(recipient).not.toBeNull();
      expect(recipient!.userId).toBe('lead@example.com');
      expect(recipient!.role).toBe('Project Lead');
    });

    it('returns null when projectLeadId is missing', () => {
      const recipient = SETUP_TO_PROJECT_HUB_HANDOFF_CONFIG.resolveRecipient(
        makeRequest({ projectLeadId: undefined }),
      );
      expect(recipient).toBeNull();
    });
  });

  describe('validateReadiness', () => {
    it('delegates to validateSetupHandoffReadiness', () => {
      expect(SETUP_TO_PROJECT_HUB_HANDOFF_CONFIG.validateReadiness(makeRequest())).toBeNull();
      expect(
        SETUP_TO_PROJECT_HUB_HANDOFF_CONFIG.validateReadiness(
          makeRequest({ state: 'Provisioning' }),
        ),
      ).toContain('fully completed');
    });
  });

  describe('onAcknowledged (Phase 3 activation)', () => {
    it('returns UUID v4 destinationRecordId', async () => {
      const result = await SETUP_TO_PROJECT_HUB_HANDOFF_CONFIG.onAcknowledged({
        handoffId: 'h-1',
        destinationSeedData: {},
      } as Parameters<typeof SETUP_TO_PROJECT_HUB_HANDOFF_CONFIG.onAcknowledged>[0]);
      expect(result.destinationRecordId).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
      );
    });
  });

  describe('onRejected (Wave 0 no-op)', () => {
    it('completes without error', async () => {
      await expect(
        SETUP_TO_PROJECT_HUB_HANDOFF_CONFIG.onRejected({
          handoffId: 'h-1',
          sourceRecordId: 'req-1',
          rejectionReason: 'test',
        } as Parameters<typeof SETUP_TO_PROJECT_HUB_HANDOFF_CONFIG.onRejected>[0]),
      ).resolves.toBeUndefined();
    });
  });
});
