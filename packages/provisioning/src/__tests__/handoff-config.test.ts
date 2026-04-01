/**
 * Gate 12 (P2-C4 §8): Provisioning handoff config validation.
 * Scenarios 2 and 7 from the handoff criteria matrix.
 */
import { describe, it, expect, vi } from 'vitest';
import type { IProjectSetupRequest } from '@hbc/models';
import {
  SETUP_TO_PROJECT_HUB_HANDOFF_CONFIG,
  validateSetupHandoffReadiness,
} from '../handoff-config.js';

function createCompletedRequest(overrides: Partial<IProjectSetupRequest> = {}): IProjectSetupRequest {
  return {
    requestId: 'req-001',
    projectName: 'Harbor View Medical Center',
    projectNumber: 'HV-2025-001',
    state: 'Completed',
    department: 'Healthcare',
    siteUrl: 'https://hbconstruction.sharepoint.com/sites/HV-2025-001',
    projectManagerUpn: 'user-lead-001',
    groupMembers: ['user-001', 'user-002'],
    requesterId: 'user-requester-001',
    startDate: '2025-01-15',
    estimatedValue: 45000000,
    clientName: 'Harbor Health Systems',
    ...overrides,
  } as IProjectSetupRequest;
}

describe('SETUP_TO_PROJECT_HUB_HANDOFF_CONFIG (P2-C4 §8)', () => {
  describe('validateSetupHandoffReadiness', () => {
    it('returns null when request is Completed with all required fields', () => {
      expect(validateSetupHandoffReadiness(createCompletedRequest())).toBeNull();
    });

    it('returns error when state is not Completed', () => {
      const result = validateSetupHandoffReadiness(createCompletedRequest({ state: 'In Progress' as IProjectSetupRequest['state'] }));
      expect(result).toContain('completed');
    });

    it('returns error when siteUrl is missing', () => {
      const result = validateSetupHandoffReadiness(createCompletedRequest({ siteUrl: '' }));
      expect(result).toContain('site URL');
    });

    it('returns error when department is missing', () => {
      const result = validateSetupHandoffReadiness(createCompletedRequest({ department: undefined as unknown as string }));
      expect(result).toContain('Department');
    });

    it('returns error when projectManagerUpn is missing', () => {
      const result = validateSetupHandoffReadiness(createCompletedRequest({ projectManagerUpn: '' }));
      expect(result).toContain('Project manager');
    });
  });

  describe('mapSourceToDestination', () => {
    it('maps request fields to IProjectHubSeedData', () => {
      const request = createCompletedRequest();
      const seed = SETUP_TO_PROJECT_HUB_HANDOFF_CONFIG.mapSourceToDestination(request);
      expect(seed.projectName).toBe('Harbor View Medical Center');
      expect(seed.projectNumber).toBe('HV-2025-001');
      expect(seed.department).toBe('Healthcare');
      expect(seed.siteUrl).toBe('https://hbconstruction.sharepoint.com/sites/HV-2025-001');
      expect(seed.projectManagerUpn).toBe('user-lead-001');
      expect(seed.groupMembers).toEqual(['user-001', 'user-002']);
    });
  });

  describe('onAcknowledged (Phase 3 activation)', () => {
    it('returns UUID v4 destinationRecordId', async () => {
      const consoleSpy = vi.spyOn(console, 'info').mockImplementation(() => {});
      const request = createCompletedRequest();
      const seed = SETUP_TO_PROJECT_HUB_HANDOFF_CONFIG.mapSourceToDestination(request);
      const mockPkg = {
        handoffId: 'handoff-abc',
        destinationSeedData: seed,
      };

      const result = await SETUP_TO_PROJECT_HUB_HANDOFF_CONFIG.onAcknowledged(mockPkg as never);
      expect(result.destinationRecordId).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
      );
      consoleSpy.mockRestore();
    });
  });

  describe('onRejected', () => {
    it('completes without error', async () => {
      const consoleSpy = vi.spyOn(console, 'info').mockImplementation(() => {});
      const mockPkg = {
        handoffId: 'handoff-xyz',
        rejectionReason: 'Incorrect department assignment',
      };

      await expect(
        SETUP_TO_PROJECT_HUB_HANDOFF_CONFIG.onRejected(mockPkg as never),
      ).resolves.not.toThrow();
      consoleSpy.mockRestore();
    });
  });

  describe('resolveRecipient', () => {
    it('returns project manager identity when projectManagerUpn is set', () => {
      const request = createCompletedRequest({ projectManagerUpn: 'lead-42' });
      const recipient = SETUP_TO_PROJECT_HUB_HANDOFF_CONFIG.resolveRecipient(request);
      expect(recipient).toEqual({
        userId: 'lead-42',
        displayName: 'Project Manager',
        role: 'Project Manager',
      });
    });

    it('returns null when projectManagerUpn is missing', () => {
      const request = createCompletedRequest({ projectManagerUpn: '' });
      const recipient = SETUP_TO_PROJECT_HUB_HANDOFF_CONFIG.resolveRecipient(request);
      expect(recipient).toBeNull();
    });
  });
});
