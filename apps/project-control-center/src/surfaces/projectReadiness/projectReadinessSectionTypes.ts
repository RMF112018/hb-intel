/**
 * Wave 15A B5 / Prompt 01 — Project Readiness section-id contract.
 *
 * Internal selection vocabulary for the command-first Project Readiness
 * surface. Each id corresponds to one panel of the surface: a default
 * `'command'` overview, plus seven detail sections that the Prompt 02
 * detail-section renderer will swap into view.
 *
 * These ids are intentionally distinct from the existing
 * `data-pcc-readiness-section` DOM markers (e.g. this file's
 * `'permits-inspections'` vs. the rendered marker
 * `'permit-inspection-control-center'`). The mapping between selection
 * id and DOM section is the detail-renderer's responsibility.
 */

export type PccProjectReadinessSectionId =
  | 'command'
  | 'lifecycle-readiness'
  | 'permits-inspections'
  | 'responsibility-matrix'
  | 'constraints'
  | 'buyout'
  | 'procore-source-confidence'
  | 'unified-lifecycle';

export const PCC_PROJECT_READINESS_DEFAULT_SECTION: PccProjectReadinessSectionId = 'command';
