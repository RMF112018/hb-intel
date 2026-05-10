import type { PccPrimaryTabId } from '@hbc/models/pcc';

/**
 * Phase 05 wave-b10 Prompt 06 — shell hero descriptions keyed to
 * `PccPrimaryTabId`. The eight Phase 05 primary tabs each carry a
 * concise description rendered as the hero secondary line under the
 * primary title. Document Control posture (visible label "Document
 * Control" for internal id `documents`) is reflected in the description
 * copy. Cost & Time references review/no-writeback posture without
 * implying Sage integration.
 *
 * The hero never falls back to a registry `description` field — this
 * compact taxonomy gives the PCC shell a deliberate product voice and
 * is line-clamped (1 line on desktop/laptop, 2 lines on compact) by
 * `PccProjectHeroBand.module.css`.
 */
export const PCC_SURFACE_HERO_DESCRIPTIONS: Record<PccPrimaryTabId, string> = {
  'project-home': 'Daily project command view for priority actions and near-term operating focus.',
  'core-tools':
    'Cross-cutting project tools for assistance, access, directory, platforms, and checkpoints.',
  documents:
    'Document Control view for project records, files, drawings, and external document references.',
  'estimating-preconstruction':
    'Preconstruction continuity view for handoff context, assumptions, alternates, and exclusions.',
  'startup-closeout':
    'Startup and closeout continuity view for readiness, responsibilities, turnover, and warranty posture.',
  'project-controls':
    'Project Controls view for permits, inspections, constraints, compliance, field operations, and communication.',
  'cost-time':
    'Cost and time view for financial review, schedule posture, procurement, buyout, and exposure context.',
  'systems-administration':
    'Systems Administration view for site health, settings, integration posture, and module configuration.',
};
