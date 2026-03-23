/**
 * SF23-T07 — Record form module adapters and registry.
 *
 * Governing: SF23-T07, L-01 through L-06
 */

export { RecordFormModuleRegistry } from './RecordFormModuleRegistry.js';
export type {
  IRecordFormModuleRegistration,
  IRecordFormSchemaProvider,
  RecordFormFieldDefinition,
  RecordFormValidationRule,
} from './RecordFormModuleRegistry.js';
export { createModuleRecordFormSession } from './createModuleRecordFormSession.js';
