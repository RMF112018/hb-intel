import { describe, expect, it } from 'vitest';
import {
  PROJECT_HUB_BASELINE_REPORT_FAMILIES,
  PROJECT_HUB_REPORT_MODULE_AUDIT,
  getProjectHubReportsSummary,
} from '../reports/index.js';

describe('project-hub reports baseline catalog', () => {
  it('locks the baseline report family inventory to the four approved families', () => {
    expect(PROJECT_HUB_BASELINE_REPORT_FAMILIES.map((family) => family.key)).toEqual([
      'px-review',
      'owner-report',
      'sub-scorecard',
      'lessons-learned',
    ]);
  });

  it('keeps closeout artifacts as the strongest currently defined report sources', () => {
    const closeoutFamilies = PROJECT_HUB_BASELINE_REPORT_FAMILIES.filter((family) =>
      family.sourceModules.includes('P3-E10 Closeout'),
    );

    expect(closeoutFamilies.map((family) => family.key)).toEqual([
      'sub-scorecard',
      'lessons-learned',
    ]);
  });

  it('marks the central Reports module as not yet implemented', () => {
    const reportsRow = PROJECT_HUB_REPORT_MODULE_AUDIT.find((row) => row.module === 'P3-E9 Reports');

    expect(reportsRow?.canReportsConsumeToday).toBe('no');
    expect(reportsRow?.gapOrBlocker).toMatch(/central Reports module/i);
  });

  it('treats QC as not yet consumable until a snapshot seam exists', () => {
    const qcRow = PROJECT_HUB_REPORT_MODULE_AUDIT.find((row) => row.module === 'P3-E15 QC');

    expect(qcRow?.currentImplementationStatus).toMatch(/foundation-only/i);
    expect(qcRow?.canReportsConsumeToday).toBe('no');
  });

  it('summarizes the baseline catalog and current source landscape', () => {
    expect(getProjectHubReportsSummary()).toEqual({
      baselineFamilyCount: 4,
      sourceModulesAudited: 12,
      partialSourceCount: 7,
      blockedSourceCount: 5,
      moduleLocalReportSurfaceCount: 15,
      closeoutArtifactFamilyCount: 2,
      qcFoundationRecordFamilyCount: 21,
    });
  });
});
