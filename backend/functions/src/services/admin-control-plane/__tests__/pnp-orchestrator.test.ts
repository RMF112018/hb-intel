import { describe, expect, it } from 'vitest';
import { InMemoryAdminRunService } from '../in-memory-run-service.js';
import { MockAdminAuditStore } from '../admin-audit-store.js';
import { MockAdminEvidenceStore } from '../evidence-service.js';
import { PnpOpsOrchestrator } from '../pnp-orchestrator.js';

const TEST_ACTOR = {
  upn: 'operator@hb.com',
  objectId: 'oid-123',
  displayName: 'Operator',
  capturedAt: new Date().toISOString(),
};

describe('PnpOpsOrchestrator', () => {
  it('completes a list-schema run and publishes artifacts', async () => {
    const runService = new InMemoryAdminRunService();
    const auditService = new MockAdminAuditStore();
    const evidenceService = new MockAdminEvidenceStore();
    const orchestrator = new PnpOpsOrchestrator(runService, auditService, evidenceService);

    const launchRequest = orchestrator.normalizeLaunchRequest({
      actionKey: 'sharepoint:pnp:list-schema-export',
      commandInput: {
        targetSiteUrl: 'https://tenant.sharepoint.com/sites/HBCentral',
        listFilters: ['People Culture Announcements'],
        executionIntent: {
          mode: 'read-only-export',
          source: 'spfx-webpart',
          requestedAt: new Date().toISOString(),
        },
      },
      targetEntityId: 'https://tenant.sharepoint.com/sites/HBCentral',
      dryRun: false,
    });

    const launched = await runService.launchRun(launchRequest, TEST_ACTOR);
    await orchestrator.executeRun(
      launched.runId,
      launchRequest,
      TEST_ACTOR,
      'https://functions.example.com',
    );

    const run = await runService.getRun(launched.runId);
    expect(run?.status).toBe('Completed');
    expect(run?.totalSteps).toBe(5);
    expect(run?.steps.some((step) => step.stepLabel.includes('Finalize'))).toBe(true);
    const events = await auditService.listByRunId(launched.runId);
    expect(events.length).toBeGreaterThan(0);
    const evidence = await evidenceService.listByRunId(launched.runId);
    expect(evidence.length).toBeGreaterThanOrEqual(5);
    const bundle = evidence.find((entry) => entry.label === 'artifact-bundle.zip');
    expect(bundle).toBeTruthy();
    if (bundle) {
      const payload = await evidenceService.getEvidencePayload(bundle.evidenceId);
      expect(payload?.inlinePayload?.contentType).toBe('application/zip');
      expect(payload?.inlinePayload?.isBundle).toBe(true);
    }
  });

  it('completes a site-groups-summary run without list/page filters', async () => {
    const runService = new InMemoryAdminRunService();
    const auditService = new MockAdminAuditStore();
    const evidenceService = new MockAdminEvidenceStore();
    const orchestrator = new PnpOpsOrchestrator(runService, auditService, evidenceService);

    const launchRequest = orchestrator.normalizeLaunchRequest({
      actionKey: 'sharepoint-control:extraction:site-groups-summary',
      commandInput: {
        targetSiteUrl: 'https://tenant.sharepoint.com/sites/HBCentral',
        executionIntent: {
          mode: 'read-only-export',
          source: 'spfx-webpart',
          requestedAt: new Date().toISOString(),
        },
      },
      targetEntityId: 'https://tenant.sharepoint.com/sites/HBCentral',
      dryRun: false,
    });

    const launched = await runService.launchRun(launchRequest, TEST_ACTOR);
    await orchestrator.executeRun(
      launched.runId,
      launchRequest,
      TEST_ACTOR,
      'https://functions.example.com',
    );

    const run = await runService.getRun(launched.runId);
    expect(run?.status).toBe('Completed');
    const evidence = await evidenceService.listByRunId(launched.runId);
    expect(evidence.length).toBeGreaterThanOrEqual(5);
  });

  it('fails run when required filters are missing', async () => {
    const runService = new InMemoryAdminRunService();
    const auditService = new MockAdminAuditStore();
    const evidenceService = new MockAdminEvidenceStore();
    const orchestrator = new PnpOpsOrchestrator(runService, auditService, evidenceService);

    const launchRequest = orchestrator.normalizeLaunchRequest({
      actionKey: 'sharepoint-control:extraction:list-schema',
      commandInput: {
        targetSiteUrl: 'https://tenant.sharepoint.com/sites/HBCentral',
        executionIntent: {
          mode: 'read-only-export',
          source: 'spfx-webpart',
          requestedAt: new Date().toISOString(),
        },
      },
      targetEntityId: 'https://tenant.sharepoint.com/sites/HBCentral',
      dryRun: false,
    });

    const launched = await runService.launchRun(launchRequest, TEST_ACTOR);
    await orchestrator.executeRun(
      launched.runId,
      launchRequest,
      TEST_ACTOR,
      'https://functions.example.com',
    );

    const run = await runService.getRun(launched.runId);
    expect(run?.status).toBe('Failed');
  });
});
