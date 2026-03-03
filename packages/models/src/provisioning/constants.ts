/**
 * Provisioning saga constants.
 *
 * These are **runtime values** consumed by the Azure Functions saga orchestrator.
 *
 * @module provisioning/constants
 */

/** Ordered list of saga step names executed during site provisioning. */
export const SAGA_STEPS: readonly string[] = [
  'Create Site',
  'Document Library',
  'Template Files',
  'Data Lists',
  'Web Parts',
  'Permissions',
  'Hub Association',
] as const;

/** Total number of saga steps. */
export const TOTAL_SAGA_STEPS = 7;
