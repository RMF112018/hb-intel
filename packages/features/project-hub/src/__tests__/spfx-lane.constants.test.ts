import { describe, expect, it } from 'vitest';
import {
  PROJECT_HUB_SPFX_DASHBOARD_SURFACES,
  PROJECT_HUB_SPFX_MODULES,
  PROJECT_HUB_SPFX_MODULE_MAP,
} from '../spfx-lane/index.js';

describe('project-hub SPFx lane definitions', () => {
  it('defines the governed Stage 10.2 module family', () => {
    expect(PROJECT_HUB_SPFX_MODULES.map((module) => module.slug)).toEqual([
      'financial',
      'schedule',
      'constraints',
      'permits',
      'safety',
      'reports',
      'qc',
      'closeout',
      'startup',
      'subcontract-readiness',
      'warranty',
    ]);
  });

  it('keeps launch-to-PWA actions on the modules that require them', () => {
    expect(PROJECT_HUB_SPFX_MODULE_MAP.schedule.pwaEscalations.length).toBeGreaterThan(0);
    expect(PROJECT_HUB_SPFX_MODULE_MAP.reports.pwaEscalations.length).toBeGreaterThan(0);
    expect(PROJECT_HUB_SPFX_MODULE_MAP.qc.pwaEscalations).toHaveLength(0);
  });

  it('assigns a governed WorkspacePageShell layout to every routed SPFx module surface', () => {
    for (const module of PROJECT_HUB_SPFX_MODULES) {
      expect(module.pageLayout).toBe('dashboard');
    }
  });

  it('classifies the live routed SPFx surfaces against the governed T06 surface families', () => {
    expect(PROJECT_HUB_SPFX_DASHBOARD_SURFACES).toEqual([
      {
        id: 'summary-strip',
        label: 'Dashboard summary strip',
        primaryDataSurfaceType: 'summary-strip-kpi',
      },
      {
        id: 'escalation-hub',
        label: 'Dashboard escalation hub',
        primaryDataSurfaceType: 'card-list-view',
      },
      {
        id: 'module-launchers',
        label: 'Dashboard module launchers',
        primaryDataSurfaceType: 'card-list-view',
      },
    ]);

    for (const module of PROJECT_HUB_SPFX_MODULES) {
      expect(module.primaryDataSurfaceType).toBe('card-list-view');
    }
  });
});
