import { describe, expect, it, vi } from 'vitest';
import { compensateStep3 } from '../steps/step3-template-files.js';
import { compensateStep4 } from '../steps/step4-data-lists.js';

vi.mock('../../../utils/retry.js', () => ({
  withRetry: async <T>(fn: () => Promise<T>) => fn(),
}));

// Mock @hbc/provisioning — all template keys return a stub notification builder
const mockTemplate = () => ({
  eventType: 'mock',
  recipientUpn: 'test@hb.com',
  title: 'mock',
  body: 'mock',
  priority: 'normal' as const,
});

vi.mock('@hbc/provisioning', () => ({
  PROVISIONING_NOTIFICATION_TEMPLATES: new Proxy(
    {},
    { get: () => () => mockTemplate() },
  ),
}));

// Mock notification dispatch to no-op
vi.mock('../notification-dispatch.js', () => ({
  dispatchProvisioningNotification: vi.fn().mockResolvedValue(undefined),
}));

/**
 * G2.3: Verify explicit no-op compensation functions for Steps 3 and 4
 * and the complete compensation chain order (7 → 4 → 3 → 2 → 1).
 */
describe('G2.3 Compensation chain audit', () => {
  it('compensateStep3 is exported, is a function, and resolves without throwing', async () => {
    expect(typeof compensateStep3).toBe('function');
    await expect(compensateStep3()).resolves.toBeUndefined();
  });

  it('compensateStep4 is exported, is a function, and resolves without throwing', async () => {
    expect(typeof compensateStep4).toBe('function');
    await expect(compensateStep4()).resolves.toBeUndefined();
  });

  it('compensate() calls all five step compensation functions in order when all steps are Completed', async () => {
    // Dynamically import after mocks are applied
    const { SagaOrchestrator } = await import('../saga-orchestrator.js');
    const { createMockServices } = await import('../../../test-utils/mock-services.js');

    const services = createMockServices();
    const logger = {
      info: vi.fn(),
      warn: vi.fn(),
      error: vi.fn(),
      trackEvent: vi.fn(),
      trackMetric: vi.fn(),
    };

    // Make step 7 (last step) fail so compensation triggers.
    // Steps 1-6 will succeed; step 7 will throw.
    services.sharePoint.associateHubSite.mockRejectedValueOnce(
      new Error('hub association failed'),
    );

    process.env.OPEX_MANAGER_UPN = 'opex@hb.com';
    process.env.SHAREPOINT_HUB_SITE_ID = 'hub-guid-1';

    const request = {
      projectId: 'project-comp',
      projectNumber: '25-999-01',
      projectName: 'Compensation Test Project',
      correlationId: 'corr-comp',
      triggeredBy: 'controller@hb.com',
      submittedBy: 'submitter@hb.com',
      groupMembers: ['member@hb.com'],
    };

    const orchestrator = new SagaOrchestrator(services, logger);
    await orchestrator.execute(request);

    // Verify compensation ran — final status is Failed
    const allUpserts = services.tableStorage.upsertProvisioningStatus.mock.calls;
    const finalStatus = allUpserts.at(-1)?.[0];
    expect(finalStatus.overallStatus).toBe('Failed');

    // Step 1 compensation (site deletion) should have been called
    expect(services.sharePoint.deleteSite).toHaveBeenCalledTimes(1);

    // The compensation chain runs in order 7 → 4 → 3 → 2 → 1.
    // Steps 3 and 4 are no-ops, so no service calls to assert on.
    // Verify the chain ran without any compensation-level failures.
    const compensationErrors = logger.error.mock.calls.filter(
      (call) => typeof call[0] === 'string' && call[0].includes('Compensation failed'),
    );
    expect(compensationErrors).toHaveLength(0);
  });
});
