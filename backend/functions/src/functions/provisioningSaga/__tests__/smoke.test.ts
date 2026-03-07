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
