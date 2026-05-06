import type { PccMvpSurfaceId } from '@hbc/models/pcc';

/**
 * Hero-surface description copy. One short supporting line per surface.
 *
 * The hero never falls back to `PCC_MVP_SURFACES[id].description` — that
 * vocabulary is governed by `@hbc/models` and may grow long over time.
 * This compact taxonomy gives the PCC shell a deliberate product voice
 * and is line-clamped (1 line on desktop/laptop, 2 lines on compact) by
 * `PccProjectHeroBand.module.css`.
 */
export const PCC_SURFACE_HERO_DESCRIPTIONS: Record<PccMvpSurfaceId, string> = {
  'project-home': 'Daily project command view for priority actions and operational rollups.',
  'team-and-access': 'Team visibility, access posture, and permission request context.',
  documents: 'Project document access posture across SharePoint, OneDrive, and external platforms.',
  'project-readiness': 'Readiness posture, blockers, evidence, and startup-to-closeout controls.',
  approvals: 'Approval checkpoints, routing posture, and pending decision context.',
  'external-systems':
    'Launch and mapping posture for platforms outside the SharePoint project site.',
  'control-center-settings': 'Project, site, persona, and integration setting context.',
  'site-health': 'Configuration drift, repair posture, and site operating health signals.',
};
