import { describe, expect, it } from 'vitest';
import {
  evaluateEmergencyBoundary,
  runEmergencyAccessWorkflow,
} from './emergencyAccess.js';

describe('emergencyAccess workflow', () => {
  const baseCommand = {
    requestId: 'req-emergency-1',
    targetUserId: 'user-1',
    baseRoleId: 'project-manager',
    requestedChange: {
      mode: 'grant' as const,
      grants: ['project-hub:approve'],
    },
    targetFeatureId: 'project-hub',
    targetAction: 'approve',
    requesterId: 'admin-1',
    requesterRoles: ['Administrator'],
    emergencyReason: 'Critical outage requires immediate break-glass authorization path.',
    normalWorkflowAvailable: false,
    requestedAt: '2026-03-06T00:00:00.000Z',
  };

  it('blocks emergency request when requester is not authorized', () => {
    const result = evaluateEmergencyBoundary({
      ...baseCommand,
      requesterRoles: ['ProjectManager'],
    });

    expect(result.allowed).toBe(false);
  });

  it('blocks emergency substitution when normal workflow is available without boundary reason', () => {
    const result = evaluateEmergencyBoundary({
      ...baseCommand,
      normalWorkflowAvailable: true,
      boundaryBypassReason: undefined,
    });

    expect(result.allowed).toBe(false);
  });

  it('grants emergency access with short expiration and post-action review', () => {
    const result = runEmergencyAccessWorkflow(baseCommand);

    expect(result.ok).toBe(true);
    expect(result.override?.emergency).toBe(true);
    expect(result.override?.review.reviewRequired).toBe(true);
    expect(result.audit?.length).toBe(2);
    expect(result.audit?.some((event) => event.eventType === 'review-flag-generated')).toBe(true);
  });
});
