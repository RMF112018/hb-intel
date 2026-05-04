import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import {
  DOCUMENT_CONTROL_UNIVERSAL_HARD_NO_RULES,
  DOCUMENT_CONTROL_WAVE7_LANES,
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
  type PccProjectReadinessFrameworkReadModel,
  type PccLifecycleReadinessReadModel,
  type PccPermitInspectionControlCenterReadModel,
  type PccResponsibilityMatrixReadModel,
  type PccConstraintsLogReadModel,
  type PccBuyoutLogReadModel,
  type PccProcoreProjectMappingReadModel,
  type PccUnifiedLifecycleReadModel,
  type PccProjectMemoryReadModel,
  type PccProjectLensesReadModel,
  type PccProjectTraceabilityReadModel,
  type PccWarrantyTraceReadModel,
  type PccCrossProjectKnowledgeReadModel,
  type PccUnifiedSearchAskHbiReadModel,
} from './index.js';
import {
  LIFECYCLE_READINESS_LIBRARY_FAMILY_COUNTS,
  LIFECYCLE_READINESS_LIBRARY_TOTAL,
} from './LifecycleReadiness.js';
import { PERMIT_INSPECTION_CONTROL_CENTER_FIXTURE } from './fixtures/permitInspectionControlCenter.js';
import { SAMPLE_RESPONSIBILITY_MATRIX_READ_MODEL } from './fixtures/responsibilityMatrix.js';
import { SAMPLE_CONSTRAINTS_LOG_READ_MODEL } from './fixtures/constraintsLog.js';
import { SAMPLE_BUYOUT_LOG_READ_MODEL } from './fixtures/buyoutLog.js';
import { SAMPLE_PROCORE_PROJECT_MAPPING_READ_MODEL } from './fixtures/procoreProjectMapping.js';
import {
  SAMPLE_CROSS_PROJECT_KNOWLEDGE_READ_MODEL,
  SAMPLE_PROJECT_LENSES_READ_MODEL,
  SAMPLE_PROJECT_MEMORY_READ_MODEL,
  SAMPLE_PROJECT_TRACEABILITY_READ_MODEL,
  SAMPLE_UNIFIED_LIFECYCLE_READ_MODEL,
  SAMPLE_UNIFIED_SEARCH_ASK_HBI_READ_MODEL,
  SAMPLE_WARRANTY_TRACE_READ_MODEL,
} from './fixtures/unifiedLifecycleReadModels.js';

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
      data: {
        sources: [],
        wave7LaneVocabulary: DOCUMENT_CONTROL_WAVE7_LANES,
        sourceRegistry: [
          {
            sourceKey: 'registry-project-record',
            displayName: 'Project Record Library',
            wave7Lane: 'project-record',
            sourceKind: 'sharepoint-library',
            enabled: true,
            binding: {
              kind: 'sharepoint-library',
              siteId: 'site-1',
              driveId: 'drive-1',
              listId: 'list-1',
            },
          },
          {
            sourceKey: 'registry-my-project-files',
            displayName: 'My Project Files',
            wave7Lane: 'my-project-files',
            sourceKind: 'my-project-files',
            enabled: true,
            binding: {
              kind: 'my-project-files',
              rootFolderName: 'My Project Files',
              userObjectId: 'user-1',
              projectId: 'p-1',
              projectFolderName: '00-000-00-Project Example',
              projectFolderPath: '/My Project Files/00-000-00-Project Example',
            },
          },
        ],
        sourceHealth: [
          {
            sourceKey: 'registry-project-record',
            state: 'healthy',
            message: 'Source is available',
          },
        ],
        sourceHealthStates: ['healthy'],
        reviewStates: ['pending'],
        reviewTypes: ['project-execution-review'],
        hardNoRules: DOCUMENT_CONTROL_UNIVERSAL_HARD_NO_RULES,
      },
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

    const projectReadinessEnvelope: PccReadModelEnvelope<PccProjectReadinessFrameworkReadModel> = {
      mode: 'fixture',
      sourceStatus: 'available',
      readOnly: true,
      warnings: [],
      data: {
        items: [],
        domainSummaries: [],
        gateSummaries: [],
        ownershipSummaries: [],
        evidenceSummary: [],
        blockerSummary: [],
        sourceHealthSummary: [],
      },
    };

    const lifecycleReadinessEnvelope: PccReadModelEnvelope<PccLifecycleReadinessReadModel> = {
      mode: 'fixture',
      sourceStatus: 'available',
      readOnly: true,
      warnings: [],
      data: {
        summary: {
          totalProjectItems: 0,
          statusCounts: {
            'not-started': 0,
            'in-progress': 0,
            blocked: 0,
            'needs-evidence': 0,
            'needs-review': 0,
            approved: 0,
            returned: 0,
            complete: 0,
            failed: 0,
            deferred: 0,
            'not-applicable': 0,
            waived: 0,
          },
          headlinePosture: 'unknown',
        },
        templateLibraryMetadata: {
          total: LIFECYCLE_READINESS_LIBRARY_TOTAL,
          familyCounts: LIFECYCLE_READINESS_LIBRARY_FAMILY_COUNTS,
          sourceDocuments: [],
        },
        sampleTemplateItems: [],
        sampleProjectItems: [],
        gates: [],
        domains: [],
        phases: [],
        evidenceSummary: [],
        blockerSummary: [],
      },
    };

    const responsibilityMatrixEnvelope: PccReadModelEnvelope<PccResponsibilityMatrixReadModel> = {
      mode: 'fixture',
      sourceStatus: 'available',
      readOnly: true,
      warnings: [],
      data: SAMPLE_RESPONSIBILITY_MATRIX_READ_MODEL,
    };

    const permitInspectionControlCenterEnvelope: PccReadModelEnvelope<PccPermitInspectionControlCenterReadModel> =
      {
        mode: 'fixture',
        sourceStatus: 'available',
        readOnly: true,
        warnings: [],
        data: PERMIT_INSPECTION_CONTROL_CENTER_FIXTURE,
      };

    const constraintsLogEnvelope: PccReadModelEnvelope<PccConstraintsLogReadModel> = {
      mode: 'fixture',
      sourceStatus: 'available',
      readOnly: true,
      warnings: [],
      data: SAMPLE_CONSTRAINTS_LOG_READ_MODEL,
    };

    const buyoutLogEnvelope: PccReadModelEnvelope<PccBuyoutLogReadModel> = {
      mode: 'fixture',
      sourceStatus: 'available',
      readOnly: true,
      warnings: [],
      data: SAMPLE_BUYOUT_LOG_READ_MODEL,
    };

    const procoreProjectMappingEnvelope: PccReadModelEnvelope<PccProcoreProjectMappingReadModel> = {
      mode: 'fixture',
      sourceStatus: 'available',
      readOnly: true,
      warnings: [],
      data: SAMPLE_PROCORE_PROJECT_MAPPING_READ_MODEL,
    };

    const unifiedLifecycleEnvelope: PccReadModelEnvelope<PccUnifiedLifecycleReadModel> = {
      mode: 'fixture',
      sourceStatus: 'available',
      readOnly: true,
      warnings: [],
      data: SAMPLE_UNIFIED_LIFECYCLE_READ_MODEL,
    };

    const projectMemoryEnvelope: PccReadModelEnvelope<PccProjectMemoryReadModel> = {
      mode: 'fixture',
      sourceStatus: 'available',
      readOnly: true,
      warnings: [],
      data: SAMPLE_PROJECT_MEMORY_READ_MODEL,
    };

    const projectLensesEnvelope: PccReadModelEnvelope<PccProjectLensesReadModel> = {
      mode: 'fixture',
      sourceStatus: 'available',
      readOnly: true,
      warnings: [],
      data: SAMPLE_PROJECT_LENSES_READ_MODEL,
    };

    const projectTraceabilityEnvelope: PccReadModelEnvelope<PccProjectTraceabilityReadModel> = {
      mode: 'fixture',
      sourceStatus: 'available',
      readOnly: true,
      warnings: [],
      data: SAMPLE_PROJECT_TRACEABILITY_READ_MODEL,
    };

    const warrantyTraceEnvelope: PccReadModelEnvelope<PccWarrantyTraceReadModel> = {
      mode: 'fixture',
      sourceStatus: 'available',
      readOnly: true,
      warnings: [],
      data: SAMPLE_WARRANTY_TRACE_READ_MODEL,
    };

    const crossProjectKnowledgeEnvelope: PccReadModelEnvelope<PccCrossProjectKnowledgeReadModel> = {
      mode: 'fixture',
      sourceStatus: 'available',
      readOnly: true,
      warnings: [],
      data: SAMPLE_CROSS_PROJECT_KNOWLEDGE_READ_MODEL,
    };

    const unifiedSearchEnvelope: PccReadModelEnvelope<PccUnifiedSearchAskHbiReadModel> = {
      mode: 'fixture',
      sourceStatus: 'available',
      readOnly: true,
      warnings: [],
      data: SAMPLE_UNIFIED_SEARCH_ASK_HBI_READ_MODEL,
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
      'project-readiness': projectReadinessEnvelope,
      'lifecycle-readiness': lifecycleReadinessEnvelope,
      'permit-inspection-control-center': permitInspectionControlCenterEnvelope,
      'responsibility-matrix': responsibilityMatrixEnvelope,
      'constraints-log': constraintsLogEnvelope,
      'buyout-log': buyoutLogEnvelope,
      'procore-project-mapping': procoreProjectMappingEnvelope,
      'unified-lifecycle': unifiedLifecycleEnvelope,
      'project-memory': projectMemoryEnvelope,
      'project-lenses': projectLensesEnvelope,
      'project-traceability': projectTraceabilityEnvelope,
      'warranty-trace': warrantyTraceEnvelope,
      'cross-project-knowledge': crossProjectKnowledgeEnvelope,
      'unified-search': unifiedSearchEnvelope,
    };

    expect(map.profile.readOnly).toBe(true);
    expect(map.modules.mode).toBe('mock');
    expect(map.home.sourceStatus).toBe('missing-config');
    expect(map['site-health'].warnings[0]?.code).toBe('unauthorized');
  });

  it('document-control read-model remains backward compatible and serializable', () => {
    const legacyOnly: PccDocumentControlReadModel = { sources: [] };
    expect(legacyOnly.sources).toEqual([]);

    const wave7Additive: PccDocumentControlReadModel = {
      sources: [],
      wave7LaneVocabulary: DOCUMENT_CONTROL_WAVE7_LANES,
      sourceRegistry: [],
      sourceHealth: [],
      sourceHealthStates: [],
      reviewStates: [],
      reviewTypes: [],
      hardNoRules: DOCUMENT_CONTROL_UNIVERSAL_HARD_NO_RULES,
    };

    const encoded = JSON.stringify(wave7Additive);
    const decoded = JSON.parse(encoded) as PccDocumentControlReadModel;
    expect(decoded.wave7LaneVocabulary).toEqual(DOCUMENT_CONTROL_WAVE7_LANES);
    expect(decoded.hardNoRules).toEqual(DOCUMENT_CONTROL_UNIVERSAL_HARD_NO_RULES);
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
