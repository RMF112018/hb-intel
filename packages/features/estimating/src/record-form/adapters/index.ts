/**
 * Estimating record-form adapter — SF23-T07 reference. Essential tier.
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

export const ESTIMATING_RECORD_FORM_MODULE_KEY = 'estimating';

export const estimatingRecordFormSchemaProvider: IRecordFormSchemaProvider = {
  moduleKey: ESTIMATING_RECORD_FORM_MODULE_KEY,
  getFieldDefinitions: (_recordType: string, _mode: RecordFormMode): RecordFormFieldDefinition[] => [],
  getValidationRules: (_recordType: string): RecordFormValidationRule[] => [],
};

export const estimatingRecordFormRegistration: IRecordFormModuleRegistration = {
  moduleKey: ESTIMATING_RECORD_FORM_MODULE_KEY,
  displayName: 'Estimating',
  supportedModes: ['create', 'edit'],
  supportedRecordTypes: ['bid-readiness'],
  complexityTier: 'essential',
  schemaProvider: estimatingRecordFormSchemaProvider,
};
