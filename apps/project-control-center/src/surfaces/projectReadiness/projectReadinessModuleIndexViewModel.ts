/**
 * Wave 15A B5 / Prompt 01 — module-index view-model.
 *
 * Pure ordered list of detail-section descriptors used by
 * `PccProjectReadinessModuleIndexCard` to render its view-selection
 * buttons. The `'command'` overview is rendered separately by the card
 * (it is always present) so this list contains only the seven detail
 * sections.
 *
 * Copy is strictly view-selection language. No executable verbs
 * (approve, submit, upload, sync, write back, create, delete, save,
 * launch, complete, mark, assign, escalate). No implementation
 * sequencing references (wave, prompt, coming soon).
 */

import type { PccProjectReadinessSectionId } from './projectReadinessSectionTypes';

export interface IPccProjectReadinessModuleIndexEntry {
  readonly sectionId: Exclude<PccProjectReadinessSectionId, 'command'>;
  readonly label: string;
  readonly summary: string;
}

export const PCC_PROJECT_READINESS_MODULE_INDEX_ENTRIES: readonly IPccProjectReadinessModuleIndexEntry[] =
  [
    {
      sectionId: 'lifecycle-readiness',
      label: 'View lifecycle readiness',
      summary: 'Phases, families, signals, and source traceability for project readiness items.',
    },
    {
      sectionId: 'permits-inspections',
      label: 'View permits and inspections',
      summary: 'Permit and inspection control center readiness signals.',
    },
    {
      sectionId: 'responsibility-matrix',
      label: 'View responsibility matrix',
      summary: 'Owner, reviewer, and accountability lanes across the readiness scope.',
    },
    {
      sectionId: 'constraints',
      label: 'View constraints log',
      summary: 'Make-ready constraints, exposure matrix, and lessons-learned references.',
    },
    {
      sectionId: 'buyout',
      label: 'View buyout log',
      summary: 'Procurement packages, lead-time exposure, and reconciliation references.',
    },
    {
      sectionId: 'procore-source-confidence',
      label: 'View Procore source confidence',
      summary: 'Source confidence and freshness posture for Procore-backed readiness inputs.',
    },
    {
      sectionId: 'unified-lifecycle',
      label: 'View unified lifecycle context',
      summary: 'Lifecycle timeline, project memory, and related-records traceability.',
    },
  ];
