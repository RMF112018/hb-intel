import { describe, expect, it } from 'vitest';

import {
  MY_PROJECT_LINK_WARNING_CODES,
  type MyProjectLinkWarningCode,
  type MyProjectLinksReadModel,
} from './MyProjectLinksReadModel.js';

describe('MyProjectLinksReadModel', () => {
  it('exposes the required warning codes in stable order', () => {
    expect(MY_PROJECT_LINK_WARNING_CODES).toEqual([
      'sharepoint-launch-unavailable',
      'procore-launch-unavailable',
      'procore-project-invalid',
      'building-connected-launch-unavailable',
      'building-connected-url-invalid',
      'document-crunch-launch-unavailable',
      'document-crunch-url-invalid',
      'assignment-source-bounded',
      'projects-source-partial',
      'legacy-registry-source-partial',
      'legacy-match-state-excluded',
      'legacy-role-data-preserved',
      'schema-transition-legacy-role-fallback-used',
    ]);
  });

  it('accepts a valid read-model payload shape', () => {
    const model: MyProjectLinksReadModel = {
      moduleId: 'my-project-links',
      actor: {
        principalName: 'avery.lead@hb.example.com',
        displayName: 'Avery Project Lead',
      },
      summary: {
        assignedProjectCount: 1,
        dualLaunchReadyCount: 1,
        sharePointReadyCount: 1,
        procoreReadyCount: 1,
        noSharePointLaunchCount: 0,
        noProcoreLaunchCount: 0,
        buildingConnectedReadyCount: 1,
        documentCrunchReadyCount: 1,
        noBuildingConnectedLaunchCount: 0,
        noDocumentCrunchLaunchCount: 0,
        multiPlatformReadyCount: 1,
        projectsOnlyCount: 1,
        mergedCount: 0,
        legacyOnlyCount: 0,
      },
      items: [
        {
          recordKey: 'projects:101',
          source: 'projects-only',
          projectName: 'Sample Project',
          projectNumber: '24-100-01',
          assignmentRoles: ['project-manager'],
          sharePointAction: {
            state: 'available',
            kind: 'project-site',
            label: 'Open SharePoint Site',
            href: 'https://example.invalid/sites/24-100-01',
          },
          procoreAction: {
            state: 'available',
            label: 'Open Procore',
            procoreProject: '1234567',
            href: 'https://app.procore.com/1234567/project/home',
          },
          buildingConnectedAction: {
            state: 'available',
            label: 'Open BuildingConnected',
            href: 'https://buildingconnected.example.invalid/projects/24-100-01',
          },
          documentCrunchAction: {
            state: 'available',
            label: 'Open Document Crunch',
            href: 'https://documentcrunch.example.invalid/projects/24-100-01',
          },
          provenance: {
            projectsListItemId: 101,
          },
          warnings: [],
        },
      ],
      sourceReadiness: {
        projects: 'available',
        legacyFallbackRegistry: 'available',
      },
    };

    expect(model.moduleId).toBe('my-project-links');
    expect(model.items[0]?.source).toBe('projects-only');
  });

  it('allows each warning code value through the typed contract', () => {
    for (const code of MY_PROJECT_LINK_WARNING_CODES) {
      const typed: MyProjectLinkWarningCode = code;
      expect(typed).toBe(code);
    }
  });
});
