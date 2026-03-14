import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { IProvisioningStatus } from '@hbc/models';
import { executeStep3 } from './step3-template-files.js';
import { createMockServices } from '../../../test-utils/mock-services.js';
import { TEMPLATE_FILE_MANIFEST } from '../../../config/template-file-manifest.js';
import { ADD_ON_DEFINITIONS } from '../../../config/add-on-definitions.js';
import { DEPARTMENT_FOLDER_TREES, DEPARTMENT_LIBRARIES } from '../../../config/core-libraries.js';

/**
 * W0-G2-T09: Step 3 (Upload Template Files) behavior tests.
 * TC-STEP-01 through TC-STEP-06, TC-SEED-03 through TC-SEED-05,
 * TC-FAIL-06, TC-IDEM-04, and supplemental coverage.
 */
describe('W0-G2-T09: Step 3 — Upload Template Files', () => {
  const makeStatus = (overrides?: Partial<IProvisioningStatus>): IProvisioningStatus => ({
    projectId: 'project-t09',
    projectNumber: '25-009-01',
    projectName: 'T09 Test Project',
    correlationId: 'corr-t09',
    overallStatus: 'InProgress',
    currentStep: 3,
    steps: [],
    siteUrl: 'https://hbconstruction.sharepoint.com/sites/25-009-01',
    triggeredBy: 'controller@hb.com',
    submittedBy: 'submitter@hb.com',
    groupMembers: ['member1@hb.com'],
    startedAt: new Date().toISOString(),
    step5DeferredToTimer: false,
    step5TimerRetryCount: 0,
    retryCount: 0,
    ...overrides,
  });

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('TC-STEP-01: calls uploadTemplateFile for all manifest entries', async () => {
    const services = createMockServices();
    const status = makeStatus();

    const result = await executeStep3(services, status);

    expect(result.status).toBe('Completed');
    // Core manifest entries — each should produce exactly one uploadTemplateFile call
    expect(services.sharePoint.uploadTemplateFile).toHaveBeenCalledTimes(TEMPLATE_FILE_MANIFEST.length);

    for (const entry of TEMPLATE_FILE_MANIFEST) {
      expect(services.sharePoint.uploadTemplateFile).toHaveBeenCalledWith(
        status.siteUrl,
        entry
      );
    }
  });

  it('TC-STEP-02: creates Commercial Documents library for department=commercial', async () => {
    const services = createMockServices();
    const status = makeStatus({ department: 'commercial' } as Partial<IProvisioningStatus>);

    const result = await executeStep3(services, status);

    expect(result.status).toBe('Completed');
    expect(services.sharePoint.createDocumentLibrary).toHaveBeenCalledWith(
      status.siteUrl,
      'Commercial Documents'
    );
  });

  it('TC-STEP-03: creates Luxury Residential Documents library for department=luxury-residential', async () => {
    const services = createMockServices();
    const status = makeStatus({ department: 'luxury-residential' } as Partial<IProvisioningStatus>);

    const result = await executeStep3(services, status);

    expect(result.status).toBe('Completed');
    expect(services.sharePoint.createDocumentLibrary).toHaveBeenCalledWith(
      status.siteUrl,
      'Luxury Residential Documents'
    );
  });

  it('TC-STEP-04: creates commercial folder tree (34 folders)', async () => {
    const services = createMockServices();
    const status = makeStatus({ department: 'commercial' } as Partial<IProvisioningStatus>);
    const expectedFolders = DEPARTMENT_FOLDER_TREES.commercial.folders;

    const result = await executeStep3(services, status);

    expect(result.status).toBe('Completed');
    expect(services.sharePoint.createFolderIfNotExists).toHaveBeenCalledTimes(expectedFolders.length);
    expect(expectedFolders.length).toBe(34);

    for (const folderPath of expectedFolders) {
      expect(services.sharePoint.createFolderIfNotExists).toHaveBeenCalledWith(
        status.siteUrl,
        'Commercial Documents',
        folderPath
      );
    }
  });

  it('TC-STEP-05: creates luxury-residential folder tree (37 folders)', async () => {
    const services = createMockServices();
    const status = makeStatus({ department: 'luxury-residential' } as Partial<IProvisioningStatus>);
    const expectedFolders = DEPARTMENT_FOLDER_TREES['luxury-residential'].folders;

    const result = await executeStep3(services, status);

    expect(result.status).toBe('Completed');
    expect(services.sharePoint.createFolderIfNotExists).toHaveBeenCalledTimes(expectedFolders.length);
    expect(expectedFolders.length).toBe(37);

    for (const folderPath of expectedFolders) {
      expect(services.sharePoint.createFolderIfNotExists).toHaveBeenCalledWith(
        status.siteUrl,
        'Luxury Residential Documents',
        folderPath
      );
    }
  });

  it('TC-STEP-06 / TC-SEED-04: graceful skip for missing asset + metadata', async () => {
    const services = createMockServices();
    const status = makeStatus();

    // Simulate all uploads returning false (asset file not on disk)
    services.sharePoint.uploadTemplateFile.mockResolvedValue(false);

    const result = await executeStep3(services, status);

    // Step still completes — missing assets are warnings, not errors
    expect(result.status).toBe('Completed');
    // Metadata should record the missing assets
    expect(result.metadata).toBeDefined();
    expect(result.metadata!.missingAssets).toHaveLength(TEMPLATE_FILE_MANIFEST.length);
    expect(result.metadata!.missingAssetCount).toBe(TEMPLATE_FILE_MANIFEST.length);
  });

  it('TC-SEED-03: file re-run invokes uploadTemplateFile (service handles no-overwrite)', async () => {
    const services = createMockServices();
    const status = makeStatus();

    // First run
    await executeStep3(services, status);
    const firstCallCount = services.sharePoint.uploadTemplateFile.mock.calls.length;

    // Second run (simulates idempotent re-run)
    await executeStep3(services, status);
    const totalCalls = services.sharePoint.uploadTemplateFile.mock.calls.length;

    // Each run should attempt all uploads — idempotency is internal to the service
    expect(totalCalls).toBe(firstCallCount * 2);
  });

  it('TC-SEED-05: safety template entries exist in TEMPLATE_FILE_MANIFEST', () => {
    const safetyFileNames = ['JHA Form Template.docx', 'Incident Report Form.docx', 'Site Specific Safety Plan Template.docx'];
    const manifestFileNames = TEMPLATE_FILE_MANIFEST.map((e) => e.fileName);

    for (const name of safetyFileNames) {
      expect(manifestFileNames, `TEMPLATE_FILE_MANIFEST must include ${name}`).toContain(name);
    }
  });

  it('no department provisioning when department is unset', async () => {
    const services = createMockServices();
    const status = makeStatus(); // no department field

    await executeStep3(services, status);

    expect(services.sharePoint.createDocumentLibrary).not.toHaveBeenCalled();
    expect(services.sharePoint.createFolderIfNotExists).not.toHaveBeenCalled();
  });

  it('TC-FAIL-06 / TC-IDEM-04: folder creation failure fails step, retry succeeds', async () => {
    const services = createMockServices();
    const status = makeStatus({ department: 'commercial' } as Partial<IProvisioningStatus>);

    // First run: createFolderIfNotExists throws mid-way
    let folderCallCount = 0;
    services.sharePoint.createFolderIfNotExists.mockImplementation(async () => {
      folderCallCount++;
      if (folderCallCount === 5) throw new Error('folder creation network error');
    });

    const failResult = await executeStep3(services, status);
    expect(failResult.status).toBe('Failed');
    expect(failResult.errorMessage).toContain('folder creation network error');

    // Retry: reset mock to succeed
    services.sharePoint.createFolderIfNotExists.mockResolvedValue(undefined);
    const retryResult = await executeStep3(services, status);
    expect(retryResult.status).toBe('Completed');
  });

  it('add-on template files are uploaded when addOns is set', async () => {
    const services = createMockServices();
    const status = makeStatus();
    // Set addOns through type-safe cast
    (status as unknown as Record<string, unknown>).addOns = ['safety-pack'];

    const result = await executeStep3(services, status);

    expect(result.status).toBe('Completed');
    // Core manifest + safety-pack add-on file
    const safetyPack = ADD_ON_DEFINITIONS['safety-pack'];
    const expectedCalls = TEMPLATE_FILE_MANIFEST.length + safetyPack.templateFiles.length;
    expect(services.sharePoint.uploadTemplateFile).toHaveBeenCalledTimes(expectedCalls);

    // Verify the add-on file was uploaded
    for (const fileEntry of safetyPack.templateFiles) {
      expect(services.sharePoint.uploadTemplateFile).toHaveBeenCalledWith(
        status.siteUrl,
        fileEntry
      );
    }
  });

  it('department library creation is skipped when library already exists', async () => {
    const services = createMockServices();
    const status = makeStatus({ department: 'commercial' } as Partial<IProvisioningStatus>);
    services.sharePoint.documentLibraryExists.mockResolvedValue(true);

    const result = await executeStep3(services, status);

    expect(result.status).toBe('Completed');
    expect(services.sharePoint.createDocumentLibrary).not.toHaveBeenCalled();
  });
});
