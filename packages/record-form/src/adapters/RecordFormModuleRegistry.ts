/**
 * SF23-T07 — Record form module adapter registry.
 *
 * Singleton: additive registration, freeze-on-write, duplicate rejection.
 *
 * Governing: SF23-T07, L-01
 */

import type { RecordFormMode, RecordFormComplexityTier } from '../types/index.js';

export interface IRecordFormSchemaProvider {
  moduleKey: string;
  getFieldDefinitions(recordType: string, mode: RecordFormMode): RecordFormFieldDefinition[];
  getValidationRules(recordType: string): RecordFormValidationRule[];
}

export interface RecordFormFieldDefinition {
  key: string;
  label: string;
  required: boolean;
  dataType: 'string' | 'number' | 'date' | 'boolean' | 'currency' | 'select';
}

export interface RecordFormValidationRule {
  fieldKey: string;
  rule: 'required' | 'min-length' | 'max-length' | 'pattern' | 'custom';
  params: Record<string, unknown>;
  message: string;
}

export interface IRecordFormModuleRegistration {
  moduleKey: string;
  displayName: string;
  supportedModes: RecordFormMode[];
  supportedRecordTypes: string[];
  complexityTier: RecordFormComplexityTier;
  schemaProvider: IRecordFormSchemaProvider;
}

let entries: IRecordFormModuleRegistration[] = [];
let frozen = false;

export const RecordFormModuleRegistry = {
  register(newEntries: IRecordFormModuleRegistration[]): void {
    if (frozen) throw new Error('RecordFormModuleRegistry is frozen.');
    for (const entry of newEntries) {
      if (!entry.moduleKey) throw new Error('moduleKey is required.');
      if (entry.schemaProvider.moduleKey !== entry.moduleKey) {
        throw new Error(`moduleKey "${entry.moduleKey}" does not match schemaProvider.moduleKey "${entry.schemaProvider.moduleKey}".`);
      }
      if (entries.some(e => e.moduleKey === entry.moduleKey)) {
        throw new Error(`Duplicate: "${entry.moduleKey}" already registered.`);
      }
      entries.push(Object.freeze({ ...entry }) as IRecordFormModuleRegistration);
    }
    frozen = true;
  },
  getAll(): IRecordFormModuleRegistration[] { return [...entries]; },
  getByModule(moduleKey: string): IRecordFormModuleRegistration | undefined { return entries.find(e => e.moduleKey === moduleKey); },
  getEnabled(): IRecordFormModuleRegistration[] { return [...entries]; },
  _resetForTesting(): void { entries = []; frozen = false; },
};
