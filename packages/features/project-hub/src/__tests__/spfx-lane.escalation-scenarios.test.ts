import { describe, expect, it } from 'vitest';

import {
  PROJECT_HUB_SPFX_DASHBOARD_ESCALATIONS,
  PROJECT_HUB_SPFX_ESCALATION_SCENARIOS,
  PROJECT_HUB_SPFX_REPORTS_REVIEW_ESCALATIONS,
} from '../index.js';

describe('Stage 10.3 SPFx escalation scenarios', () => {
  it('defines the full 13-scenario escalation map', () => {
    expect(PROJECT_HUB_SPFX_ESCALATION_SCENARIOS).toHaveLength(13);
  });

  it('keeps dashboard and home-canvas launches explicit', () => {
    expect(PROJECT_HUB_SPFX_DASHBOARD_ESCALATIONS.map((scenario) => scenario.id)).toEqual([
      'cross-project-navigation',
      'multi-project-portfolio',
      'full-work-queue-feed',
      'full-activity-timeline',
      'advanced-canvas-admin',
      'personal-work-hub',
    ]);
  });

  it('keeps reports and executive-review launches explicit', () => {
    expect(PROJECT_HUB_SPFX_REPORTS_REVIEW_ESCALATIONS.map((scenario) => scenario.id)).toEqual([
      'advanced-draft-recovery',
      'executive-review-thread-management',
      'multi-run-review-comparison',
      'full-executive-review-history',
    ]);
  });
});
