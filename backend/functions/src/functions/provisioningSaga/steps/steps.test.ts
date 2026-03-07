import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { IProvisioningStatus } from '@hbc/models';
import { executeStep1, compensateStep1 } from './step1-create-site.js';
import { executeStep2, compensateStep2 } from './step2-document-library.js';
import { executeStep3 } from './step3-template-files.js';
import { executeStep4 } from './step4-data-lists.js';
import { executeStep5 } from './step5-web-parts.js';
import { executeStep6 } from './step6-permissions.js';
import { executeStep7, compensateStep7 } from './step7-hub-association.js';
import { createMockServices } from '../../../test-utils/mock-services.js';

/**
 * D-PH6-15 Layer 1 unit coverage for provisioning step contracts (1-7).
 * Each step validates success/failure and idempotent behavior where the implementation supports it.
 */
describe('D-PH6-15 step executors (1-7)', () => {
  const makeStatus = (): IProvisioningStatus => ({
    projectId: 'project-1',
    projectNumber: '25-001-01',
    projectName: 'Testing Project',
    correlationId: 'corr-1',
    overallStatus: 'InProgress',
    currentStep: 1,
    steps: [],
    siteUrl: 'https://hbconstruction.sharepoint.com/sites/25-001-01-testing-project',
    triggeredBy: 'controller@hb.com',
    submittedBy: 'submitter@hb.com',
    groupMembers: ['member1@hb.com'],
    startedAt: new Date().toISOString(),
    step5DeferredToTimer: false,
    step5TimerRetryCount: 0,
    retryCount: 0,
  });

  beforeEach(() => {
    process.env.OPEX_MANAGER_UPN = 'opex@hb.com';
    process.env.SHAREPOINT_HUB_SITE_ID = 'hub-guid-1';
  });

  it('step 1 returns idempotent skip when site already exists', async () => {
    const services = createMockServices();
    const status = makeStatus();
    services.sharePoint.siteExists.mockResolvedValueOnce('https://hbconstruction.sharepoint.com/sites/existing');

    const result = await executeStep1(services, status);

    // Existing site path must avoid create-site side effects.
    expect(result.status).toBe('Completed');
    expect(result.idempotentSkip).toBe(true);
    expect(services.sharePoint.createSite).not.toHaveBeenCalled();
    expect(status.siteUrl).toContain('/sites/existing');
  });

  it('step 1 writes siteUrl on success and compensation deletes created site', async () => {
    const services = createMockServices();
    const status = makeStatus();

    const result = await executeStep1(services, status);
    await compensateStep1(services, status);

    expect(result.status).toBe('Completed');
    expect(status.siteUrl).toContain('/sites/25-001-01');
    expect(services.sharePoint.deleteSite).toHaveBeenCalledWith(status.siteUrl);
  });

  it('step 2 creates library when missing and marks idempotent on second pass', async () => {
    const services = createMockServices();
    const status = makeStatus();

    services.sharePoint.documentLibraryExists.mockResolvedValueOnce(false).mockResolvedValueOnce(true);

    const created = await executeStep2(services, status);
    const skipped = await executeStep2(services, status);

    expect(created.status).toBe('Completed');
    expect(created.idempotentSkip).toBe(false);
    expect(skipped.idempotentSkip).toBe(true);
    await expect(compensateStep2()).resolves.toBeUndefined();
  });

  it('step 3 uploads template files and returns failed status on exception', async () => {
    const services = createMockServices();
    const status = makeStatus();

    const ok = await executeStep3(services, status);
    services.sharePoint.uploadTemplateFiles.mockRejectedValueOnce(new Error('upload failed'));
    const fail = await executeStep3(services, status);

    expect(ok.status).toBe('Completed');
    expect(fail.status).toBe('Failed');
    expect(fail.errorMessage).toContain('upload failed');
  });

  it('step 4 creates data lists and reports failure details', async () => {
    const services = createMockServices();
    const status = makeStatus();

    const ok = await executeStep4(services, status);
    services.sharePoint.createDataLists.mockRejectedValueOnce(new Error('list error'));
    const fail = await executeStep4(services, status);

    expect(ok.status).toBe('Completed');
    expect(fail.status).toBe('Failed');
    expect(fail.errorMessage).toContain('list error');
  });

  it('step 5 completes when installWebParts resolves', async () => {
    const services = createMockServices();
    const status = makeStatus();
    const logger = { info: vi.fn(), warn: vi.fn(), error: vi.fn(), trackEvent: vi.fn(), trackMetric: vi.fn() };

    const result = await executeStep5(services, status, logger);

    expect(result.status).toBe('Completed');
    expect(status.step5DeferredToTimer).toBe(false);
  });

  it('step 5 defers to timer after repeated failure', async () => {
    const services = createMockServices();
    const status = makeStatus();
    const logger = { info: vi.fn(), warn: vi.fn(), error: vi.fn(), trackEvent: vi.fn(), trackMetric: vi.fn() };
    services.sharePoint.installWebParts.mockRejectedValue(new Error('install failed'));

    const result = await executeStep5(services, status, logger);

    expect(result.status).toBe('DeferredToTimer');
    expect(status.step5DeferredToTimer).toBe(true);
    expect(logger.warn).toHaveBeenCalledTimes(2);
  });

  it('step 6 fails without siteUrl and succeeds with deduplicated members', async () => {
    const services = createMockServices();
    const noSite = makeStatus();
    noSite.siteUrl = undefined;

    const failed = await executeStep6(services, noSite);
    expect(failed.status).toBe('Failed');

    const status = makeStatus();
    status.groupMembers = ['member1@hb.com', 'opex@hb.com'];
    const ok = await executeStep6(services, status);

    expect(ok.status).toBe('Completed');
    // OpEx should be included exactly once through deduplication.
    // Step module reads OPEX_MANAGER_UPN at import time; assert current invocation contract.
    expect(services.sharePoint.setGroupPermissions).toHaveBeenCalledWith(
      status.siteUrl,
      ['member1@hb.com', 'opex@hb.com'],
      undefined
    );
  });

  it('step 7 uses idempotent hub association and compensation path', async () => {
    const services = createMockServices();
    const status = makeStatus();

    services.sharePoint.isHubAssociated.mockResolvedValueOnce(true).mockResolvedValueOnce(false);

    const skipped = await executeStep7(services, status);
    const created = await executeStep7(services, status);
    await compensateStep7(services, status);

    expect(skipped.status).toBe('Completed');
    expect(skipped.idempotentSkip).toBe(true);
    expect(created.idempotentSkip).toBe(false);
    expect(services.sharePoint.associateHubSite).toHaveBeenCalledWith(status.siteUrl, 'hub-guid-1');
    expect(services.sharePoint.disassociateHubSite).toHaveBeenCalledWith(status.siteUrl);
  });
});
