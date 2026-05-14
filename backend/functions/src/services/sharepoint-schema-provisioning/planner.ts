import type { IFieldDefinition } from '../sharepoint-service.js';
import {
  getCompatibleSharePointFieldTypes,
  isSharePointFieldTypeCompatible,
} from './compatibility.js';
import type {
  IFieldPlanAction,
  IFieldSettingsUpdatePlan,
  ILiveSharePointFieldSnapshot,
  IUnresolvedMutation,
} from './types.js';

function sameChoices(a: string[] | undefined, b: string[] | undefined): boolean {
  const left = Array.isArray(a) ? a : [];
  const right = Array.isArray(b) ? b : [];
  return JSON.stringify(left) === JSON.stringify(right);
}

export function resolveLiveFieldForDefinition(
  field: IFieldDefinition,
  liveFields: ReadonlyArray<ILiveSharePointFieldSnapshot>,
): ILiveSharePointFieldSnapshot | null {
  return (
    liveFields.find((entry) => entry.InternalName === field.internalName) ??
    liveFields.find((entry) => entry.Title === field.displayName) ??
    null
  );
}

export function buildFieldPlan(
  listTitle: string,
  field: IFieldDefinition,
  liveField: ILiveSharePointFieldSnapshot | null,
): IFieldPlanAction {
  if (!liveField) {
    return { kind: 'create', field };
  }

  if (!isSharePointFieldTypeCompatible(field.type, liveField.TypeAsString)) {
    const unresolved: IUnresolvedMutation = {
      listTitle,
      fieldInternalName: field.internalName,
      desiredType: field.type,
      liveType: liveField.TypeAsString,
      reason:
        `Type mismatch cannot be auto-converted safely. ` +
        `Allowed live types for ${field.type}: ${getCompatibleSharePointFieldTypes(field.type).join(', ')}`,
    };
    return { kind: 'blocker-wrong-type', field, unresolved };
  }

  const updates: IFieldSettingsUpdatePlan = {};
  let hasUpdates = false;

  if (field.required !== undefined && liveField.Required !== field.required) {
    updates.required = field.required;
    hasUpdates = true;
  }

  if (field.type === 'Choice' && field.choices && field.choices.length > 0 && !sameChoices(liveField.Choices, field.choices)) {
    updates.choices = [...field.choices];
    hasUpdates = true;
  }

  if (field.indexed === true && liveField.Indexed !== true) {
    updates.indexed = true;
    hasUpdates = true;
  }

  if (field.defaultValue !== undefined && liveField.DefaultValue !== field.defaultValue) {
    updates.defaultValue = field.defaultValue;
    hasUpdates = true;
  }

  if (!hasUpdates) {
    return { kind: 'no-op', field, liveField };
  }

  return { kind: 'update-settings', field, liveField, updates };
}

export function buildListFieldPlans(
  listTitle: string,
  fields: ReadonlyArray<IFieldDefinition>,
  liveFields: ReadonlyArray<ILiveSharePointFieldSnapshot>,
): {
  plans: IFieldPlanAction[];
  unresolvedMutations: IUnresolvedMutation[];
} {
  const plans = fields.map((field) => buildFieldPlan(listTitle, field, resolveLiveFieldForDefinition(field, liveFields)));
  const unresolvedMutations = plans
    .filter((plan): plan is Extract<IFieldPlanAction, { kind: 'blocker-wrong-type' }> => plan.kind === 'blocker-wrong-type')
    .map((plan) => plan.unresolved);
  return { plans, unresolvedMutations };
}

export function validateProvisionedFields(
  fields: ReadonlyArray<IFieldDefinition>,
  liveFields: ReadonlyArray<Pick<ILiveSharePointFieldSnapshot, 'InternalName' | 'TypeAsString' | 'Indexed'>>,
): boolean {
  return fields.every((field) => {
    const liveField = liveFields.find((entry) => entry.InternalName === field.internalName);
    if (!liveField) return false;
    if (!isSharePointFieldTypeCompatible(field.type, liveField.TypeAsString)) return false;
    if (field.indexed === true && liveField.Indexed !== true) return false;
    return true;
  });
}
