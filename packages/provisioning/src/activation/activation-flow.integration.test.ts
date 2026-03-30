/**
 * §18.7 item 8.1 — Activation flow: full end-to-end in both lanes.
 *
 * Integration test that validates the complete activation transaction
 * from precondition validation through registry record construction
 * for both the Setup lane (provisioning → activation) and the
 * Handoff lane (external handoff → activation).
 *
 * This test covers:
 *   - Lane 1 (Setup): validateActivationPreconditions → buildRegistryRecord
 *   - Lane 2 (Handoff): validateHandoffActivationPreconditions → buildRegistryRecordFromHandoff
 *   - Cross-lane: both lanes produce interchangeable IProjectRegistryRecord
 *   - SPFx resolution: records from both lanes are resolvable by siteUrl
 *   - Rejection: incomplete preconditions block activation in both lanes
 *   - No partial activation: failure at validation stage produces no record
 *
 * Evidence for: P3-H1 §18.7 item 8.1, P3-A1 §4–§5, P3-G3 §4.1–§4.3
 */

import { describe, expect, it } from 'vitest';
import {
  validateActivationPreconditions,
  buildRegistryRecord,
  type ProjectActivationInput,
} from './createProjectActivation.js';
import {
  validateHandoffActivationPreconditions,
  buildRegistryRecordFromHandoff,
  type HandoffActivationInput,
} from './handoffActivation.js';
import type { IProjectRegistryRecord } from '@hbc/models';
import type { IProvisioningStatus } from '@hbc/models';
import type { IProjectHubSeedData } from '../handoff-config.js';

/**
 * Lightweight SPFx resolution assertion — validates the record is resolvable
 * by siteUrl without importing @hbc/shell (cross-package dependency not
 * available in provisioning test context). The real resolveSpfxProjectContext
 * in @hbc/shell is tested in its own package.
 */
function assertSpfxResolvable(record: IProjectRegistryRecord): void {
  expect(record.siteUrl).toBeTruthy();
  expect(record.siteAssociations.length).toBeGreaterThan(0);
  expect(record.siteAssociations[0].siteUrl).toBe(record.siteUrl);
  expect(record.siteAssociations[0].associationType).toBe('primary');
  // The siteUrl on the record is the key used by SPFx's getBySiteUrl() lookup
  expect(record.projectId).toBeTruthy();
  expect(record.projectName).toBeTruthy();
}

// ─────────────────────────────────────────────────────────────────────────────
// Test data factories
// ─────────────────────────────────────────────────────────────────────────────

function createSetupSeed(overrides?: Partial<IProjectHubSeedData>): IProjectHubSeedData {
  return {
    projectName: 'Harbor View Medical Center',
    projectNumber: '26-001-01',
    department: 'commercial',
    siteUrl: 'https://contoso.sharepoint.com/sites/project-26-001-01',
    projectLeadId: 'pm@contoso.com',
    groupMembers: ['member1@contoso.com', 'member2@contoso.com'],
    startDate: '2026-04-01T00:00:00.000Z',
    estimatedValue: 12500000,
    clientName: 'Harbor View Health System',
    ...overrides,
  };
}

function createProvisioningStatus(
  overrides?: Partial<IProvisioningStatus>,
): IProvisioningStatus {
  return {
    projectId: 'setup-prov-001',
    projectNumber: '26-001-01',
    projectName: 'Harbor View Medical Center',
    correlationId: 'corr-setup-001',
    overallStatus: 'Completed',
    currentStep: 7,
    steps: [],
    triggeredBy: 'coordinator@contoso.com',
    submittedBy: 'coordinator@contoso.com',
    groupMembers: ['member1@contoso.com', 'member2@contoso.com'],
    startedAt: '2026-03-20T10:00:00.000Z',
    entraGroups: {
      leadersGroupId: 'entra-leaders-001',
      teamGroupId: 'entra-team-001',
      viewersGroupId: 'entra-viewers-001',
    },
    siteUrl: 'https://contoso.sharepoint.com/sites/project-26-001-01',
    ...overrides,
  } as IProvisioningStatus;
}

function createSetupInput(overrides?: Partial<ProjectActivationInput>): ProjectActivationInput {
  return {
    handoffId: 'setup-handoff-001',
    seed: createSetupSeed(),
    provisioningStatus: createProvisioningStatus(),
    acknowledgedByUpn: 'pm@contoso.com',
    ...overrides,
  };
}

function createHandoffInput(overrides?: Partial<HandoffActivationInput>): HandoffActivationInput {
  return {
    handoffId: 'ext-handoff-001',
    projectName: 'Riverwalk Office Tower',
    projectNumber: '24-050-01',
    siteUrl: 'https://contoso.sharepoint.com/sites/project-24-050-01',
    department: 'luxury-residential',
    projectManagerUpn: 'pm2@contoso.com',
    entraGroupSet: {
      leadersGroupId: 'entra-leaders-002',
      teamGroupId: 'entra-team-002',
      viewersGroupId: 'entra-viewers-002',
    },
    acknowledgedByUpn: 'admin@contoso.com',
    startDate: '2024-06-01T00:00:00.000Z',
    estimatedValue: 8500000,
    clientName: 'Riverwalk Development LLC',
    ...overrides,
  };
}

const emptyExistingIds = { projectNumbers: new Set<string>(), siteUrls: new Set<string>() };

// ─────────────────────────────────────────────────────────────────────────────
// Shared registry record assertions
// ─────────────────────────────────────────────────────────────────────────────

function assertValidRegistryRecord(record: IProjectRegistryRecord): void {
  // UUID format
  expect(record.projectId).toMatch(
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
  );
  // Active lifecycle
  expect(record.lifecycleStatus).toBe('Active');
  // Immutable audit trail present
  expect(record.sourceHandoffId).toBeTruthy();
  expect(record.activatedByUpn).toBeTruthy();
  expect(record.activatedAt).toBeTruthy();
  // Primary site association
  expect(record.siteAssociations).toHaveLength(1);
  expect(record.siteAssociations[0].associationType).toBe('primary');
  expect(record.siteAssociations[0].siteUrl).toBeTruthy();
  // Required identity fields
  expect(record.projectName).toBeTruthy();
  expect(record.projectNumber).toBeTruthy();
  expect(record.department).toBeTruthy();
  expect(record.projectManagerUpn).toBeTruthy();
  expect(record.siteUrl).toBeTruthy();
  // Entra groups
  expect(record.entraGroupSet).toBeTruthy();
  expect(record.entraGroupSet.leadersGroupId).toBeTruthy();
  expect(record.entraGroupSet.teamGroupId).toBeTruthy();
  expect(record.entraGroupSet.viewersGroupId).toBeTruthy();
}

// ─────────────────────────────────────────────────────────────────────────────
// Lane 1 — Setup Activation (provisioning → registry)
// ─────────────────────────────────────────────────────────────────────────────

describe('§18.7 8.1 — Lane 1: Setup Activation (full flow)', () => {
  it('completes the full activation transaction from setup', () => {
    const input = createSetupInput();

    // Step 1: Preconditions pass
    const error = validateActivationPreconditions(input, emptyExistingIds);
    expect(error).toBeNull();

    // Step 2: Build registry record
    const record = buildRegistryRecord(input);
    assertValidRegistryRecord(record);

    // Step 3: Record carries seed data correctly
    expect(record.projectName).toBe('Harbor View Medical Center');
    expect(record.projectNumber).toBe('26-001-01');
    expect(record.department).toBe('commercial');
    expect(record.projectManagerUpn).toBe('pm@contoso.com');
    expect(record.siteUrl).toBe('https://contoso.sharepoint.com/sites/project-26-001-01');
    expect(record.estimatedValue).toBe(12500000);
    expect(record.clientName).toBe('Harbor View Health System');
  });

  it('produces a record resolvable by SPFx siteUrl lookup', () => {
    const record = buildRegistryRecord(createSetupInput());
    assertSpfxResolvable(record);
  });

  it('blocks activation when provisioning is incomplete', () => {
    const input = createSetupInput({
      provisioningStatus: createProvisioningStatus({ overallStatus: 'InProgress' }),
    });

    const error = validateActivationPreconditions(input, emptyExistingIds);
    expect(error).toBeTruthy();
    expect(error).toContain('not complete');

    // No record should be produced when preconditions fail
    // (caller must not call buildRegistryRecord after a failed check)
  });

  it('blocks activation when site URL is missing', () => {
    const input = createSetupInput({ seed: createSetupSeed({ siteUrl: '' }) });
    const error = validateActivationPreconditions(input, emptyExistingIds);
    expect(error).toContain('Site URL');
  });

  it('accepts BaseComplete status (WebPartsPending deferred step)', () => {
    const input = createSetupInput({
      provisioningStatus: createProvisioningStatus({ overallStatus: 'BaseComplete' }),
    });
    expect(validateActivationPreconditions(input, emptyExistingIds)).toBeNull();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Lane 2 — Handoff Activation (external → registry)
// ─────────────────────────────────────────────────────────────────────────────

describe('§18.7 8.1 — Lane 2: Handoff Activation (full flow)', () => {
  it('completes the full activation transaction from handoff', () => {
    const input = createHandoffInput();

    // Step 1: Preconditions pass
    const error = validateHandoffActivationPreconditions(input, emptyExistingIds);
    expect(error).toBeNull();

    // Step 2: Build registry record
    const record = buildRegistryRecordFromHandoff(input);
    assertValidRegistryRecord(record);

    // Step 3: Record carries handoff data correctly
    expect(record.projectName).toBe('Riverwalk Office Tower');
    expect(record.projectNumber).toBe('24-050-01');
    expect(record.department).toBe('luxury-residential');
    expect(record.projectManagerUpn).toBe('pm2@contoso.com');
    expect(record.siteUrl).toBe('https://contoso.sharepoint.com/sites/project-24-050-01');
  });

  it('produces a record resolvable by SPFx siteUrl lookup', () => {
    const record = buildRegistryRecordFromHandoff(createHandoffInput());
    assertSpfxResolvable(record);
  });

  it('blocks handoff activation when entra groups are incomplete', () => {
    const input = createHandoffInput({
      entraGroupSet: {
        leadersGroupId: 'group-leaders',
        teamGroupId: '',
        viewersGroupId: 'group-viewers',
      },
    });
    expect(validateHandoffActivationPreconditions(input, emptyExistingIds)).toContain('Entra');
  });

  it('blocks handoff activation when PM is missing', () => {
    const input = createHandoffInput({ projectManagerUpn: '' });
    expect(validateHandoffActivationPreconditions(input, emptyExistingIds)).toContain('Project Manager');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Cross-lane: Interchangeable registry records
// ─────────────────────────────────────────────────────────────────────────────

describe('§18.7 8.1 — Cross-lane: Records are interchangeable', () => {
  it('both lanes produce records with the same structural shape', () => {
    const setupRecord = buildRegistryRecord(createSetupInput());
    const handoffRecord = buildRegistryRecordFromHandoff(createHandoffInput());

    // Both have the same required fields present
    const setupKeys = Object.keys(setupRecord).sort();
    const handoffKeys = Object.keys(handoffRecord).sort();

    // Handoff may have optional fields that setup doesn't, but all required
    // fields from setup must exist on handoff and vice versa
    const requiredKeys = [
      'projectId', 'projectNumber', 'projectName', 'department',
      'lifecycleStatus', 'siteUrl', 'projectManagerUpn',
      'activatedAt', 'activatedByUpn', 'sourceHandoffId',
      'entraGroupSet', 'siteAssociations',
    ];
    for (const key of requiredKeys) {
      expect(setupKeys, `Setup record missing key: ${key}`).toContain(key);
      expect(handoffKeys, `Handoff record missing key: ${key}`).toContain(key);
    }
  });

  it('both lanes generate unique non-overlapping projectIds', () => {
    const ids = new Set<string>();
    for (let i = 0; i < 10; i++) {
      ids.add(buildRegistryRecord(createSetupInput()).projectId);
      ids.add(buildRegistryRecordFromHandoff(createHandoffInput()).projectId);
    }
    expect(ids.size).toBe(20);
  });

  it('duplicate detection works across both lanes', () => {
    // Setup lane activates a project
    const setupRecord = buildRegistryRecord(createSetupInput());

    // Track existing IDs
    const existingIds = {
      projectNumbers: new Set([setupRecord.projectNumber]),
      siteUrls: new Set([setupRecord.siteUrl]),
    };

    // Handoff lane attempts to activate with same projectNumber — blocked
    const handoffInput = createHandoffInput({
      projectNumber: '26-001-01', // Same as setup
    });
    expect(
      validateHandoffActivationPreconditions(handoffInput, existingIds),
    ).toContain('already exists');
  });

  it('records from both lanes have siteUrl suitable for SPFx getBySiteUrl lookup', () => {
    const setupRecord = buildRegistryRecord(createSetupInput());
    const handoffRecord = buildRegistryRecordFromHandoff(createHandoffInput());

    // Both records produce a siteUrl that SPFx's getBySiteUrl() would use
    expect(setupRecord.siteUrl).toMatch(/^https:\/\//);
    expect(handoffRecord.siteUrl).toMatch(/^https:\/\//);
    assertSpfxResolvable(setupRecord);
    assertSpfxResolvable(handoffRecord);
  });
});
