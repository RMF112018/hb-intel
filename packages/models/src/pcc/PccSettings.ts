/**
 * PCC settings scope vocabulary.
 *
 * Wave 1 read-model only. Runtime feature-flag wiring, settings persistence,
 * and editor surfaces are out of scope.
 */

import type { PccPersona } from './PccUserRoles.js';

export const PCC_SETTINGS_SCOPES = [
  'site',
  'project',
  'tenant',
  'persona',
  'integration',
] as const;

export type PccSettingsScope = (typeof PCC_SETTINGS_SCOPES)[number];

export interface IPccSettingsRef {
  scope: PccSettingsScope;
  key: string;
  displayName: string;
  editorPersona: PccPersona;
}
