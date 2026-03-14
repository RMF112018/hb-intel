import { afterEach, describe, expect, it } from 'vitest';
import { randomUUID } from 'crypto';
import { SharePointService } from '../../../services/sharepoint-service.js';
import { HB_INTEL_LIST_DEFINITIONS } from '../../../config/list-definitions.js';

const SMOKE_TEST = process.env.SMOKE_TEST === 'true';
const createdSiteUrls: string[] = [];

/**
 * D-PH6-15 Layer 2 smoke tests against real SharePoint APIs.
 * Tests are opt-in and gated by SMOKE_TEST=true to protect default local/PR runs.
 */
describe.runIf(SMOKE_TEST)('D-PH6-15 SharePoint smoke tests', () => {
  afterEach(async () => {
    const service = new SharePointService();

    // Strict cleanup strategy: every site created in a test is deleted before next test executes.
    for (const siteUrl of createdSiteUrls.splice(0)) {
      await service.deleteSite(siteUrl).catch(() => {
        // Cleanup failures are intentionally swallowed to avoid masking root-cause assertions.
      });
    }
  });

  it('1. creates a SharePoint site and verifies existence lookup', async () => {
    const service = new SharePointService();
    const projectId = `smoke-1-${randomUUID()}`;
    const siteUrl = await service.createSite(projectId, '99-001-01', 'PH6 15 Smoke Site 1');
    createdSiteUrls.push(siteUrl);

    const found = await service.siteExists(projectId);
    expect(siteUrl).toContain('/sites/99-001-01');
    expect(found).toBe(siteUrl);
  }, 180_000);

  it('2. creates document library idempotently on repeated invocation', async () => {
    const service = new SharePointService();
    const siteUrl = await service.createSite(`smoke-2-${randomUUID()}`, '99-002-01', 'PH6 15 Smoke Site 2');
    createdSiteUrls.push(siteUrl);

    await service.createDocumentLibrary(siteUrl, 'Project Documents');
    await expect(service.createDocumentLibrary(siteUrl, 'Project Documents')).resolves.not.toThrow();
  }, 180_000);

  it('3. creates data lists idempotently on repeated invocation', async () => {
    const service = new SharePointService();
    const siteUrl = await service.createSite(`smoke-3-${randomUUID()}`, '99-003-01', 'PH6 15 Smoke Site 3');
    createdSiteUrls.push(siteUrl);

    await service.createDataLists(siteUrl, HB_INTEL_LIST_DEFINITIONS);
    await expect(service.createDataLists(siteUrl, HB_INTEL_LIST_DEFINITIONS)).resolves.not.toThrow();
  }, 180_000);

  it('4. writes an audit record without throwing', async () => {
    const service = new SharePointService();

    await expect(
      service.writeAuditRecord({
        projectId: `smoke-4-${randomUUID()}`,
        projectNumber: '99-004-01',
        projectName: 'PH6 15 Smoke Site 4',
        correlationId: randomUUID(),
        event: 'Started',
        triggeredBy: 'smoke@hbconstruction.com',
        submittedBy: 'smoke@hbconstruction.com',
        timestamp: new Date().toISOString(),
      })
    ).resolves.not.toThrow();
  }, 120_000);

  it('5. associates hub idempotently when hub id is configured', async () => {
    const service = new SharePointService();
    const hubSiteId = process.env.SHAREPOINT_HUB_SITE_ID;
    if (!hubSiteId) {
      return;
    }

    const siteUrl = await service.createSite(`smoke-5-${randomUUID()}`, '99-005-01', 'PH6 15 Smoke Site 5');
    createdSiteUrls.push(siteUrl);

    await service.associateHubSite(siteUrl, hubSiteId);
    expect(await service.isHubAssociated(siteUrl)).toBe(true);
    await expect(service.associateHubSite(siteUrl, hubSiteId)).resolves.not.toThrow();
  }, 180_000);
});

/**
 * W0-G2-T09: Integration test scaffolds for live SharePoint verification.
 * Gated by SHAREPOINT_INTEGRATION_TEST=true — separate from SMOKE_TEST.
 * These are .todo() placeholders that register the TC ID and will be
 * implemented when a safe dev-tenant is available.
 */
describe.runIf(process.env.SHAREPOINT_INTEGRATION_TEST === 'true')(
  'W0-G2-T09: Integration — live SharePoint verification',
  () => {
    // pid contract verification
    it.todo('TC-PID-02: pid default value is projectNumber on live site');
    it.todo('TC-PID-04: pid consistent across all list insertions');

    // Parent/child relationship verification
    it.todo('TC-PARENT-01: All parent lists exist after provisioning');
    it.todo('TC-PARENT-02: All child lists exist after provisioning');
    it.todo('TC-PARENT-03: ParentRecord Lookup points to correct parent');
    it.todo('TC-PARENT-04: Lookup target list is reachable');

    // Department library/folder verification
    it.todo('TC-DEPT-01: Commercial has Commercial Documents, not Luxury');
    it.todo('TC-DEPT-02: Luxury-residential has LR Documents, not Commercial');
    it.todo('TC-DEPT-03: Core libraries exist regardless of department');
    it.todo('TC-DEPT-04: Commercial L1 folders match spec');
    it.todo('TC-DEPT-05: Commercial L2 folders match spec');
    it.todo('TC-DEPT-06: Luxury-residential L1 folders match spec');
    it.todo('TC-DEPT-07: Luxury-residential L2 folders match spec');
    it.todo('TC-DEPT-08: No L3 folders created');

    // Seeded file verification
    it.todo('TC-SEED-01: All available-asset entries present on live site');
    it.todo('TC-SEED-02: Uploaded files are non-zero-byte');

    // Idempotency verification
    it.todo('TC-IDEM-01: Full clean run — all structures created');
    it.todo('TC-IDEM-02: Full retry — all structures idempotently skipped');
    it.todo('TC-IDEM-05: Full retry produces identical site state');

    // Migration/coexistence verification
    it.todo('TC-MCOEX-01: G2 lists are empty at provisioning time');
    it.todo('TC-MCOEX-02: Empty list query does not throw');
    it.todo('TC-MCOEX-03: Seeded file and list coexist without conflict');

    // Pilot readiness verification
    it.todo('TC-PILOT-01: Step 4 duration within Azure Function timeout');
    it.todo('TC-PILOT-02: withRetry under concurrent provisioning load');
  }
);
