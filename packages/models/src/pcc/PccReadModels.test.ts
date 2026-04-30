import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import {
  PCC_READ_MODEL_MODES,
  PCC_READ_MODEL_SOURCE_STATUSES,
  type PccReadModelEnvelope,
  type PccProjectProfileReadModel,
  type PccWorkCenterRegistryReadModel,
  type PccProjectHomeReadModel,
  type PccPriorityActionsReadModel,
  type PccDocumentControlReadModel,
  type PccExternalLinksReadModel,
  type PccSiteHealthReadModel,
  type PccTeamAccessReadModel,
  type PccSettingsReadModel,
  type PccReadModelResponseMap,
  type PccReadModelMode,
  type PccReadModelSourceStatus,
} from './index.js';

describe('PccReadModels exports and typing', () => {
  it('exports all required mode and source-status literals', () => {
    expect([...PCC_READ_MODEL_MODES]).toEqual(['fixture', 'mock', 'local']);
    expect([...PCC_READ_MODEL_SOURCE_STATUSES]).toEqual([
      'available',
      'backend-unavailable',
      'source-unavailable',
      'missing-config',
      'stale',
      'unauthorized',
      'forbidden',
    ]);
  });

  it('mode and source-status union types reject invalid literals', () => {
    const mode: PccReadModelMode = 'fixture';
    const sourceStatus: PccReadModelSourceStatus = 'available';
    expect(mode).toBe('fixture');
    expect(sourceStatus).toBe('available');

    // @ts-expect-error invalid mode
    const invalidMode: PccReadModelMode = 'live';
    // @ts-expect-error invalid source status
    const invalidSourceStatus: PccReadModelSourceStatus = 'connected';

    expect(invalidMode).toBeTypeOf('string');
    expect(invalidSourceStatus).toBeTypeOf('string');
  });

  it('envelope type wraps each required read-model shape', () => {
    const profileEnvelope: PccReadModelEnvelope<PccProjectProfileReadModel> = {
      mode: 'fixture',
      sourceStatus: 'available',
      readOnly: true,
      warnings: [],
      data: {
        profile: {
          projectId: 'p-1' as never,
          projectNumber: '00-000-00' as never,
          projectName: 'Project Example',
          projectType: 'commercial',
          projectStage: 'preconstruction',
          projectStatus: 'active',
        },
      },
    };

    const modulesEnvelope: PccReadModelEnvelope<PccWorkCenterRegistryReadModel> = {
      mode: 'mock',
      sourceStatus: 'source-unavailable',
      readOnly: true,
      warnings: [{ code: 'source-unavailable', message: 'Using mock registry.' }],
      data: { surfaces: {} },
    };

    const homeEnvelope: PccReadModelEnvelope<PccProjectHomeReadModel> = {
      mode: 'local',
      sourceStatus: 'missing-config',
      readOnly: true,
      warnings: [{ code: 'missing-config', message: 'Config missing.' }],
      data: {
        profile: profileEnvelope.data.profile,
        priorityActions: [],
        missingConfigurations: [],
      },
    };

    const actionsEnvelope: PccReadModelEnvelope<PccPriorityActionsReadModel> = {
      mode: 'fixture',
      sourceStatus: 'stale',
      readOnly: true,
      warnings: [{ code: 'stale', message: 'Data timestamp is stale.' }],
      data: { actions: [] },
    };

    const documentEnvelope: PccReadModelEnvelope<PccDocumentControlReadModel> = {
      mode: 'mock',
      sourceStatus: 'backend-unavailable',
      readOnly: true,
      warnings: [{ code: 'backend-unavailable', message: 'Backend unavailable.' }],
      data: { sources: [] },
    };

    const linksEnvelope: PccReadModelEnvelope<PccExternalLinksReadModel> = {
      mode: 'mock',
      sourceStatus: 'forbidden',
      readOnly: true,
      warnings: [{ code: 'forbidden', message: 'Forbidden for current role.' }],
      data: { links: [], missingConfigurations: [] },
    };

    const siteHealthEnvelope: PccReadModelEnvelope<PccSiteHealthReadModel> = {
      mode: 'local',
      sourceStatus: 'unauthorized',
      readOnly: true,
      warnings: [{ code: 'unauthorized', message: 'Unauthorized context.' }],
      data: {
        summary: {
          siteUrl: 'https://example.invalid/sites/p-1' as never,
          overallSeverity: 'Info',
          failingChecks: 0,
          warningChecks: 0,
          repairAvailable: false,
        },
      },
    };

    const teamAccessEnvelope: PccReadModelEnvelope<PccTeamAccessReadModel> = {
      mode: 'fixture',
      sourceStatus: 'available',
      readOnly: true,
      warnings: [],
      data: {
        preview: {
          lanes: [
            {
              lane: 'team-viewer',
              teamMapLabel: 'Team',
              internalCount: 0,
              externalCount: 0,
              guestCount: 0,
              members: [],
              currentUser: {
                memberId: 'u-1' as never,
                persona: 'project-manager',
                projectRoleLabel: 'PM',
                permissionTemplateLabel: 'Template',
                hasProjectSiteAccess: true,
                audienceState: 'has-project-access',
              },
            },
            {
              lane: 'permission-request',
              requestAccessEnabled: true,
              requestChangeEnabled: true,
              requestTemplateOptions: [],
              requestPreviewRecords: [],
            },
            {
              lane: 'access-manager',
              managerPersonas: [],
              canAddOrSearchUserPreview: true,
              assignmentFormPreviewEnabled: true,
              permissionTemplateOptions: [],
              approvalCommentPreviewEnabled: true,
              executionStatus: 'preview-only',
              executionStatusLabel: 'Preview only',
              auditPreviewLabel: 'No execution',
            },
          ],
        },
      },
    };

    const settingsEnvelope: PccReadModelEnvelope<PccSettingsReadModel> = {
      mode: 'fixture',
      sourceStatus: 'available',
      readOnly: true,
      warnings: [],
      data: { settings: [] },
    };

    const map: PccReadModelResponseMap = {
      profile: profileEnvelope,
      modules: modulesEnvelope,
      home: homeEnvelope,
      'priority-actions': actionsEnvelope,
      'document-control': documentEnvelope,
      'external-links': linksEnvelope,
      'site-health': siteHealthEnvelope,
      'team-access': teamAccessEnvelope,
      settings: settingsEnvelope,
    };

    expect(map.profile.readOnly).toBe(true);
    expect(map.modules.mode).toBe('mock');
    expect(map.home.sourceStatus).toBe('missing-config');
    expect(map['site-health'].warnings[0]?.code).toBe('unauthorized');
  });
});

describe('Prompt 03 contract source has no mutation-intent terms', () => {
  it('new read-model contract file contains no execution/mutation helper tokens', () => {
    const filePath = fileURLToPath(new URL('./PccReadModels.ts', import.meta.url));
    const source = readFileSync(filePath, 'utf8');
    const scrubbed = source
      .replace(/\/\*[\s\S]*?\*\//g, ' ')
      .replace(/\/\/.*$/gm, ' ')
      .replace(/'[^'\\]*(?:\\.[^'\\]*)*'/g, ' ')
      .replace(/"[^"\\]*(?:\\.[^"\\]*)*"/g, ' ')
      .replace(/`[^`\\]*(?:\\.[^`\\]*)*`/g, ' ');

    const forbidden = [
      /\bapply\b/i,
      /\bexecute\b/i,
      /\brepair\b/i,
      /\bprovision\b/i,
      /\bsync\b/i,
      /\bmirror\b/i,
      /\bwriteBack\b/i,
      /\bupload\b/i,
      /\bdelete\b/i,
      /\bpermissionMutate\b/i,
      /\bfetch\b/i,
      /\bclient\b/i,
      /\bservice\b/i,
    ];

    for (const pattern of forbidden) {
      expect(scrubbed).not.toMatch(pattern);
    }
  });
});
