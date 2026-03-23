/**
 * BD record-form adapter — SF23-T07 reference. Standard tier.
 *
 * Governing: SF23-T07
 */

import type {
  RecordFormMode,
  IRecordFormModuleRegistration,
  IRecordFormSchemaProvider,
  RecordFormFieldDefinition,
  RecordFormValidationRule,
} from '@hbc/record-form';

export const BD_RECORD_FORM_MODULE_KEY = 'business-development';

export const bdRecordFormSchemaProvider: IRecordFormSchemaProvider = {
  moduleKey: BD_RECORD_FORM_MODULE_KEY,
  getFieldDefinitions: (_recordType: string, _mode: RecordFormMode): RecordFormFieldDefinition[] => [],
  getValidationRules: (_recordType: string): RecordFormValidationRule[] => [],
};

export const bdRecordFormRegistration: IRecordFormModuleRegistration = {
  moduleKey: BD_RECORD_FORM_MODULE_KEY,
  displayName: 'Business Development',
  supportedModes: ['create', 'edit', 'duplicate'],
  supportedRecordTypes: ['pursuit', 'scorecard'],
  complexityTier: 'standard',
  schemaProvider: bdRecordFormSchemaProvider,
};
