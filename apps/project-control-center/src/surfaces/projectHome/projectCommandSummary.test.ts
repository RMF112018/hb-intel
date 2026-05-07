import { describe, it, expect } from 'vitest';
import type {
  IExternalSystemMissingConfig,
  IPriorityAction,
  PccReadModelSourceStatus,
  SiteHealthSeverity,
} from '@hbc/models/pcc';
import {
  PROJECT_COMMAND_HBI_ADVISORY_CUE,
  buildProjectCommandSummary,
} from './projectCommandSummary';
import type { IPccApprovalsCheckpointsCardViewModel } from './PccApprovalsCheckpointsCard';

function action(severity: SiteHealthSeverity | undefined, id: string): IPriorityAction {
  return { id, category: 'workflow', title: id, severity };
}

function missingConfig(
  systemId: string,
  severity: SiteHealthSeverity,
): IExternalSystemMissingConfig {
  return {
    systemId: systemId as IExternalSystemMissingConfig['systemId'],
    severity,
    requiredBefore: 'preconstruction',
    message: `${systemId}-message`,
    ownerPersona: 'project-manager',
  };
}

const ALL_STATUSES: readonly PccReadModelSourceStatus[] = [
  'available',
  'backend-unavailable',
  'source-unavailable',
  'missing-config',
  'stale',
  'unauthorized',
  'forbidden',
];

describe('buildProjectCommandSummary', () => {
  it('counts only high-tone priority actions via priorityToneForAction', () => {
    const summary = buildProjectCommandSummary({
      priorityActions: [
        action('Blocking', 'p1'),
        action('Security Risk', 'p2'),
        action('Repair Required', 'p3'),
        action('Warning', 'p4'),
        action('Info', 'p5'),
        action(undefined, 'p6'),
      ],
      sourceMode: 'fixture',
    });
    expect(summary.highPriorityActionCount).toBe(3);
  });

  it('omits highPriorityActionCount when priorityActions is undefined', () => {
    const summary = buildProjectCommandSummary({ sourceMode: 'fixture' });
    expect(summary.highPriorityActionCount).toBeUndefined();
  });

  it('passes pendingApprovalCount through from approvalsCard.pendingActiveCount', () => {
    const approvalsCard: IPccApprovalsCheckpointsCardViewModel = {
      rows: [],
      pendingActiveCount: 4,
      terminalCount: 1,
      totalRequests: 5,
    };
    const summary = buildProjectCommandSummary({ approvalsCard, sourceMode: 'read-model' });
    expect(summary.pendingApprovalCount).toBe(4);
  });

  it('omits pendingApprovalCount when approvalsCard is absent', () => {
    const summary = buildProjectCommandSummary({ sourceMode: 'fixture' });
    expect(summary.pendingApprovalCount).toBeUndefined();
  });

  it('counts only high-severity missing configurations (Blocking, Security Risk, Repair Required)', () => {
    const summary = buildProjectCommandSummary({
      missingConfigurations: [
        missingConfig('a', 'Blocking'),
        missingConfig('b', 'Security Risk'),
        missingConfig('c', 'Repair Required'),
        missingConfig('d', 'Warning'),
        missingConfig('e', 'Info'),
      ],
      sourceMode: 'fixture',
    });
    expect(summary.blockingMissingConfigCount).toBe(3);
  });

  it('omits blockingMissingConfigCount when missingConfigurations is undefined', () => {
    const summary = buildProjectCommandSummary({ sourceMode: 'fixture' });
    expect(summary.blockingMissingConfigCount).toBeUndefined();
  });

  it('returns the canonical fixture source label when sourceMode is fixture', () => {
    const summary = buildProjectCommandSummary({ sourceMode: 'fixture' });
    expect(summary.sourceLabel).toBe('Source: fixture preview');
  });

  it('maps every PccReadModelSourceStatus value to a non-empty source label', () => {
    for (const status of ALL_STATUSES) {
      const summary = buildProjectCommandSummary({
        sourceMode: 'read-model',
        sourceStatus: status,
      });
      expect(summary.sourceLabel.length, `status '${status}' must yield a label`).toBeGreaterThan(
        0,
      );
      expect(summary.sourceLabel.startsWith('Source:')).toBe(true);
    }
  });

  it('produces distinct labels for available, backend-unavailable, source-unavailable, and missing-config', () => {
    const labels = new Set(
      (['available', 'backend-unavailable', 'source-unavailable', 'missing-config'] as const).map(
        (s) =>
          buildProjectCommandSummary({ sourceMode: 'read-model', sourceStatus: s }).sourceLabel,
      ),
    );
    expect(labels.size).toBe(4);
  });

  it('falls back to a "status pending" label when read-model mode has no sourceStatus', () => {
    const summary = buildProjectCommandSummary({ sourceMode: 'read-model' });
    expect(summary.sourceLabel).toContain('status pending');
  });

  it('always sets the HBI advisory cue to the canonical no-writeback wording', () => {
    const summary = buildProjectCommandSummary({ sourceMode: 'fixture' });
    expect(summary.hbiAdvisoryCue).toBe(PROJECT_COMMAND_HBI_ADVISORY_CUE);
    expect(summary.hbiAdvisoryCue).toContain('HBI advisory');
    expect(summary.hbiAdvisoryCue).toContain('no writeback');
  });
});
