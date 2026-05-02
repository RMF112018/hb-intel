import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import {
  PERMIT_INSPECTION_CONTROL_CENTER_FIXTURE,
  SAMPLE_PROJECT_PROFILES,
  type PccProjectId,
} from '@hbc/models/pcc';
import { PccMockReadModelProvider } from './pcc-mock-read-model-provider.js';

const KNOWN_PROJECT_ID: PccProjectId = SAMPLE_PROJECT_PROFILES[0].projectId;
const UNKNOWN_PROJECT_ID: PccProjectId =
  'project-unknown-permit-inspection-fixture-001' as PccProjectId;

const PROVIDER_SOURCE_FILE = fileURLToPath(
  new URL('./pcc-mock-read-model-provider.ts', import.meta.url),
);

function stripCommentsAndStrings(source: string): string {
  return source
    .replace(/\/\*[\s\S]*?\*\//g, ' ')
    .replace(/\/\/.*$/gm, ' ')
    .replace(/'[^'\\]*(?:\\.[^'\\]*)*'/g, ' ')
    .replace(/"[^"\\]*(?:\\.[^"\\]*)*"/g, ' ')
    .replace(/`[^`\\]*(?:\\.[^`\\]*)*`/g, ' ');
}

describe('PccMockReadModelProvider.getPermitInspectionControlCenter — known project', () => {
  const provider = new PccMockReadModelProvider();

  it('returns a read-only mock envelope with available status and the deterministic fixture', async () => {
    const envelope = await provider.getPermitInspectionControlCenter(KNOWN_PROJECT_ID);

    expect(envelope.readOnly).toBe(true);
    expect(envelope.mode).toBe('mock');
    expect(envelope.sourceStatus).toBe('available');
    expect(envelope.warnings).toHaveLength(0);
    expect(envelope.projectId).toBe(KNOWN_PROJECT_ID);
    expect(envelope.data).toBe(PERMIT_INSPECTION_CONTROL_CENTER_FIXTURE);
  });

  it('preserves the canonical fixture content (permits, inspections, AHJ launcher posture)', async () => {
    const envelope = await provider.getPermitInspectionControlCenter(KNOWN_PROJECT_ID);
    const data = envelope.data;

    expect(data.permits.length).toBeGreaterThan(0);
    expect(data.inspections.length).toBeGreaterThan(0);
    expect(data.ahjProfiles.length).toBeGreaterThan(0);
    for (const ahj of data.ahjProfiles) {
      expect(ahj.launcherOnly).toBe(true);
    }
    expect(data.summary.permitCount).toBe(data.permits.length);
    expect(data.summary.inspectionCount).toBe(data.inspections.length);
  });

  it('echoes optional viewerPersona on the envelope when provided', async () => {
    const envelope = await provider.getPermitInspectionControlCenter(
      KNOWN_PROJECT_ID,
      'project-manager',
    );
    expect(envelope.viewerPersona).toBe('project-manager');
  });
});

describe('PccMockReadModelProvider.getPermitInspectionControlCenter — unknown project', () => {
  const provider = new PccMockReadModelProvider();

  it('returns the empty Permit & Inspection Control Center read model with source-unavailable status', async () => {
    const envelope = await provider.getPermitInspectionControlCenter(UNKNOWN_PROJECT_ID);

    expect(envelope.readOnly).toBe(true);
    expect(envelope.mode).toBe('mock');
    expect(envelope.sourceStatus).toBe('source-unavailable');
    expect(envelope.projectId).toBe(UNKNOWN_PROJECT_ID);

    expect(envelope.warnings).toHaveLength(1);
    const warning = envelope.warnings[0];
    expect(warning.code).toBe('source-unavailable');
    expect(warning.message).toContain(UNKNOWN_PROJECT_ID);
    expect(warning.source).toBe('pcc-mock-fixtures');
  });

  it('returns empty arrays and zeroed summary counts for unknown projects', async () => {
    const envelope = await provider.getPermitInspectionControlCenter(UNKNOWN_PROJECT_ID);
    const data = envelope.data;

    expect(data.permits).toEqual([]);
    expect(data.inspections).toEqual([]);
    expect(data.reinspectionLineages).toEqual([]);
    expect(data.ahjProfiles).toEqual([]);
    expect(data.feeExposure).toEqual([]);
    expect(data.priorityActionSignals).toEqual([]);
    expect(data.readinessSignals).toEqual([]);
    expect(data.approvalSignals).toEqual([]);
    expect(data.permitTransitions).toEqual([]);
    expect(data.inspectionTransitions).toEqual([]);

    expect(data.summary.permitCount).toBe(0);
    expect(data.summary.expiringCount).toBe(0);
    expect(data.summary.expiredCount).toBe(0);
    expect(data.summary.pendingRevisionCount).toBe(0);
    expect(data.summary.inspectionCount).toBe(0);
    expect(data.summary.failedInspectionCount).toBe(0);
    expect(data.summary.openReinspectionCount).toBe(0);
    expect(data.summary.openFeeExposureCount).toBe(0);
    expect(data.summary.evidenceMissingCount).toBe(0);
    expect(data.summary.ahjLauncherCount).toBe(0);
  });
});

describe('PccMockReadModelProvider.getPermitInspectionControlCenter — backend-unavailable simulation', () => {
  const provider = new PccMockReadModelProvider({ simulateBackendUnavailable: true });

  it('returns the empty read model with backend-unavailable status and warning', async () => {
    const envelope = await provider.getPermitInspectionControlCenter(KNOWN_PROJECT_ID);

    expect(envelope.readOnly).toBe(true);
    expect(envelope.mode).toBe('mock');
    expect(envelope.sourceStatus).toBe('backend-unavailable');
    expect(envelope.projectId).toBe(KNOWN_PROJECT_ID);

    expect(envelope.warnings).toHaveLength(1);
    expect(envelope.warnings[0].code).toBe('backend-unavailable');
    expect(envelope.warnings[0].message).toBe(
      'Mock provider configured to simulate backend-unavailable.',
    );

    expect(envelope.data.permits).toEqual([]);
    expect(envelope.data.inspections).toEqual([]);
    expect(envelope.data.summary.permitCount).toBe(0);
    expect(envelope.data.summary.ahjLauncherCount).toBe(0);
  });

  it('produces the same empty body shape as the unknown-project branch', async () => {
    const unavailable = await provider.getPermitInspectionControlCenter(KNOWN_PROJECT_ID);
    const unknown = await new PccMockReadModelProvider().getPermitInspectionControlCenter(
      UNKNOWN_PROJECT_ID,
    );
    expect(unavailable.data).toEqual(unknown.data);
  });
});

describe('PccMockReadModelProvider source posture (no runtime, no mutation)', () => {
  const stripped = stripCommentsAndStrings(readFileSync(PROVIDER_SOURCE_FILE, 'utf8'));

  const FORBIDDEN_IMPORT_PATTERNS: readonly RegExp[] = [
    /\b@microsoft\/sp-/,
    /\b@pnp\//,
    /\b@azure\/(?!functions\b)/,
    /\baxios\b/,
    /\bnode-fetch\b/,
    /procore-sdk/i,
    /\b@microsoft\/microsoft-graph-client\b/,
  ];

  const FORBIDDEN_EXECUTABLE_TOKENS: readonly RegExp[] = [
    /\bprovision\b/i,
    /\bexecute\b/i,
    /\brepair\b/i,
    /\bmirror\b/i,
    /\bwriteBack\b/i,
    /\bupload\b/i,
    /\bmutate\b/i,
    /\bapprove\b/i,
    /\breject\b/i,
    /\bMSGraphClient\b/,
    /\bGraphServiceClient\b/,
    /\bsp\.web\b/,
    /_api\/web/,
    /\baddUserToGroup\b/,
    /\bremoveUserFromGroup\b/,
    /\baddTeamMember\b/,
    /\baddChannelMember\b/,
    /\bjoinedTeams\b/,
    /\bgraphMembers\b/,
  ];

  it('imports no forbidden runtime clients', () => {
    const importLines = stripped
      .split('\n')
      .filter((line) => /\bimport\b/.test(line) || /\bfrom\b/.test(line));
    for (const line of importLines) {
      for (const pattern of FORBIDDEN_IMPORT_PATTERNS) {
        expect(pattern.test(line), `forbidden import: ${line.trim()}`).toBe(false);
      }
    }
  });

  it('contains no mutation/execution tokens in executable source', () => {
    for (const pattern of FORBIDDEN_EXECUTABLE_TOKENS) {
      expect(stripped, `matched ${pattern}`).not.toMatch(pattern);
    }
  });
});
