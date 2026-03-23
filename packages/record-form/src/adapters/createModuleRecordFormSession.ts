/**
 * SF23-T07 — Module record form session creation helper.
 *
 * Governing: SF23-T07, L-01
 */

import type { RecordFormMode, IRecordFormState } from '../types/index.js';
import { RecordFormModuleRegistry } from './RecordFormModuleRegistry.js';
import { createRecordFormSession } from '../model/lifecycle.js';

export function createModuleRecordFormSession(
  moduleKey: string,
  projectId: string,
  mode: RecordFormMode,
  authorUpn: string,
  options?: { recordId?: string | null; recordType?: string; schemaVersion?: string },
  now?: Date,
): IRecordFormState {
  const registration = RecordFormModuleRegistry.getByModule(moduleKey);
  if (!registration) throw new Error(`RecordFormModuleRegistry: "${moduleKey}" not registered.`);
  if (!registration.supportedModes.includes(mode)) {
    throw new Error(`Module "${moduleKey}" does not support mode "${mode}".`);
  }

  return createRecordFormSession({
    moduleKey,
    projectId,
    mode,
    complexityTier: registration.complexityTier,
    authorUpn,
    recordId: options?.recordId,
    schemaVersion: options?.schemaVersion,
  }, now);
}
