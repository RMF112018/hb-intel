import { describe, expect, it } from 'vitest';
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

import {
  createAutopsyStepWizardConfig,
  createAutopsyWizardSections,
  createPostBidAutopsyReferenceIntegrations,
  POST_BID_AUTOPSY_INTEGRATIONS_SCOPE,
  projectAutopsyToBicActions,
  projectAutopsyToCanvasTasks,
  projectAutopsyToHealthIndicatorTelemetry,
  projectAutopsyToNotificationPayloads,
  projectAutopsyToRelatedItems,
  projectAutopsyToScoreBenchmarkSignal,
  projectAutopsyToStrategicIntelligenceSeed,
} from '@hbc/post-bid-autopsy';
import {
  createMockAutopsyRecordSnapshot,
  createMockDisagreementAutopsyRecordSnapshot,
  createMockOverdueAutopsyRecordSnapshot,
  createMockPublishableAutopsyRecordSnapshot,
  createMockRedactedAutopsyRecordSnapshot,
  createMockStaleAutopsyRecordSnapshot,
} from '@hbc/post-bid-autopsy/testing';

describe('post-bid autopsy integrations', () => {
  it('projects BIC actions with stable ids', () => {
    const record = createMockPublishableAutopsyRecordSnapshot();
    const result = projectAutopsyToBicActions(record);

    expect(result[0]?.itemKey).toBe('post-bid-autopsy::autopsy-mock::pricing');
    expect(result[0]?.status).toBe('approved');
  });

  it('projects canvas tasks for section work and disagreement/stale cases', () => {
    const disagreement = createMockDisagreementAutopsyRecordSnapshot();
    const stale = createMockStaleAutopsyRecordSnapshot();

    expect(projectAutopsyToCanvasTasks(disagreement).some((item) => item.taskType === 'disagreement-escalation')).toBe(true);
    expect(projectAutopsyToCanvasTasks(stale).some((item) => item.taskType === 'stale-revalidation')).toBe(true);
  });

  it('projects related items with redacted variants', () => {
    const redacted = createMockRedactedAutopsyRecordSnapshot();
    const result = projectAutopsyToRelatedItems(redacted);

    expect(result.some((item) => item.redacted)).toBe(true);
    expect(result.every((item) => item.href !== undefined)).toBe(true);
  });

  it('projects trigger, escalation, publication, and revalidation notifications', () => {
    const publishable = createMockPublishableAutopsyRecordSnapshot();
    const overdue = createMockOverdueAutopsyRecordSnapshot();
    const stale = createMockStaleAutopsyRecordSnapshot();

    expect(projectAutopsyToNotificationPayloads(publishable).some((item) => item.type === 'publication-reminder')).toBe(true);
    expect(projectAutopsyToNotificationPayloads(overdue).some((item) => item.type === 'overdue-escalation')).toBe(true);
    expect(projectAutopsyToNotificationPayloads(stale).some((item) => item.type === 'revalidation-reminder')).toBe(true);
  });

  it('projects strategic intelligence and benchmark outputs only when publishable', () => {
    const publishable = createMockPublishableAutopsyRecordSnapshot();
    const blocked = createMockAutopsyRecordSnapshot();
    const redacted = createMockRedactedAutopsyRecordSnapshot();

    expect(projectAutopsyToStrategicIntelligenceSeed(publishable)?.redacted).toBe(false);
    expect(projectAutopsyToStrategicIntelligenceSeed(redacted)?.redacted).toBe(true);
    expect(projectAutopsyToStrategicIntelligenceSeed(blocked)).toBeNull();
    expect(projectAutopsyToScoreBenchmarkSignal(publishable)?.benchmarkSignalId).toBe('benchmark:autopsy-mock');
    expect(projectAutopsyToScoreBenchmarkSignal(blocked)).toBeNull();
  });

  it('maps telemetry to health-indicator semantics and exposes the canonical wizard model', () => {
    const stale = createMockStaleAutopsyRecordSnapshot();
    const telemetry = projectAutopsyToHealthIndicatorTelemetry(stale);
    const sections = createAutopsyWizardSections(stale);
    const wizard = createAutopsyStepWizardConfig(stale);

    expect(telemetry.readyToBidRate).toBe(0.7);
    expect(sections).toHaveLength(5);
    expect(wizard.steps.map((step) => step.stepId)).toEqual([
      'outcome-context',
      'evidence-references',
      'findings-recommendations',
      'disagreements-approval',
      'impact-preview-submit',
    ]);
  });

  it('exports the primitive integrations factory and scope', () => {
    const integrations = createPostBidAutopsyReferenceIntegrations();

    expect(POST_BID_AUTOPSY_INTEGRATIONS_SCOPE).toBe('post-bid-autopsy/integrations');
    expect(typeof integrations.projectToBicActions).toBe('function');
    expect(typeof integrations.createWizardConfig).toBe('function');
  });

  it('keeps the integration layer boundary-safe', () => {
    const integrationDir = join(process.cwd(), 'src', 'integrations');
    const files = readdirSync(integrationDir).filter((file) => file.endsWith('.ts'));
    const contents = files.map((file) => readFileSync(join(integrationDir, file), 'utf8')).join('\n');

    expect(contents).not.toMatch(/from 'apps\//);
    expect(contents).not.toMatch(/from '@hbc\/[^']+\/[^']+'/);
  });
});
