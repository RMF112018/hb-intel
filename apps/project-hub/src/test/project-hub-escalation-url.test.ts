import { describe, expect, it } from 'vitest';
import {
  buildProjectHubEscalationUrl,
  buildProjectModuleLaunchUrl,
} from '../spfx/buildProjectHubEscalationUrl.js';
import { PROJECT_HUB_SPFX_MODULE_MAP } from '@hbc/features-project-hub';

interface ProjectHubWindow extends Window {
  _hbIntelPwaBaseUrl?: string;
}

describe('Stage 10.3 escalation URL builders', () => {
  it('builds the dashboard and workspace escalation routes defined in P3-G2', () => {
    Object.defineProperty(window as ProjectHubWindow, '_hbIntelPwaBaseUrl', {
      configurable: true,
      writable: true,
      value: 'https://hb-intel.example.com',
    });

    expect(
      buildProjectHubEscalationUrl('cross-project-navigation', {}),
    ).toBe('https://hb-intel.example.com/project-hub?source=spfx');
    expect(
      buildProjectHubEscalationUrl('multi-project-portfolio', {}),
    ).toBe('https://hb-intel.example.com/project-hub?source=spfx');
    expect(
      buildProjectHubEscalationUrl('personal-work-hub', {}),
    ).toBe('https://hb-intel.example.com/my-work?source=spfx');
    expect(
      buildProjectHubEscalationUrl('full-work-queue-feed', {
        projectId: 'PRJ-001',
        returnTo: '/sites/project-hub',
      }),
    ).toContain('/my-work?projectId=PRJ-001');
    expect(
      buildProjectHubEscalationUrl('full-activity-timeline', {
        projectId: 'PRJ-001',
        returnTo: '/sites/project-hub',
      }),
    ).toContain('/project-hub/PRJ-001/activity');
    expect(
      buildProjectHubEscalationUrl('advanced-canvas-admin', {
        projectId: 'PRJ-001',
        returnTo: '/sites/project-hub',
      }),
    ).toContain('admin=canvas');
  });

  it('builds the reports and executive-review escalation routes defined in P3-G2', () => {
    Object.defineProperty(window as ProjectHubWindow, '_hbIntelPwaBaseUrl', {
      configurable: true,
      writable: true,
      value: 'https://hb-intel.example.com',
    });

    expect(
      buildProjectHubEscalationUrl('advanced-draft-recovery', {
        projectId: 'PRJ-001',
      }),
    ).toContain('/project-hub/PRJ-001?recovery=true');
    expect(
      buildProjectHubEscalationUrl('multi-run-review-comparison', {
        projectId: 'PRJ-001',
        returnTo: '/sites/project-hub/reports',
      }),
    ).toContain('/project-hub/PRJ-001/review?view=compare');
    expect(
      buildProjectHubEscalationUrl('full-executive-review-history', {
        projectId: 'PRJ-001',
        returnTo: '/sites/project-hub/reports',
      }),
    ).toContain('/project-hub/PRJ-001/review?view=history');
    expect(
      buildProjectHubEscalationUrl('executive-review-thread-management', {
        projectId: 'PRJ-001',
        reviewArtifactId: 'REV-ART-001',
        returnTo: '/sites/project-hub/reports',
      }),
    ).toContain('artifact=REV-ART-001');
    expect(
      buildProjectHubEscalationUrl('executive-review-thread-management', {
        projectId: 'PRJ-001',
      }),
    ).toBeNull();
  });

  it('builds canonical module launches from shared module actions', () => {
    Object.defineProperty(window as ProjectHubWindow, '_hbIntelPwaBaseUrl', {
      configurable: true,
      writable: true,
      value: 'https://hb-intel.example.com',
    });

    const scheduleImport = buildProjectModuleLaunchUrl(
      'PRJ-001',
      PROJECT_HUB_SPFX_MODULE_MAP.schedule.pwaEscalations[0],
      { returnTo: '/sites/project-hub/schedule' },
    );
    const reportsHistory = buildProjectModuleLaunchUrl(
      'PRJ-001',
      PROJECT_HUB_SPFX_MODULE_MAP.reports.pwaEscalations[0],
      { returnTo: '/sites/project-hub/reports' },
    );

    expect(scheduleImport).toContain('/project-hub/PRJ-001/schedule?action=import');
    expect(reportsHistory).toContain('/project-hub/PRJ-001/reports?view=history');
  });
});
