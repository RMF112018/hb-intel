import type { IFieldDefinition } from '../sharepoint-service.js';

export interface ILiveSharePointFieldSnapshot {
  InternalName: string;
  Title: string;
  TypeAsString: string;
  Required?: boolean;
  Indexed?: boolean;
  DefaultValue?: string;
  Choices?: string[];
}

export interface IFieldMutation {
  listTitle: string;
  fieldInternalName: string;
  action: 'created' | 'updated' | 'indexed' | 'defaulted' | 'required-updated' | 'choices-updated';
}

export interface IUnresolvedMutation {
  listTitle: string;
  fieldInternalName: string;
  desiredType: IFieldDefinition['type'];
  liveType: string;
  reason: string;
}

export interface IListProvisioningResult {
  targetDescriptorTitle: string;
  resolvedListTitle: string;
  createdList: boolean;
  schemaValidated: boolean;
  fieldMutations: IFieldMutation[];
  unresolvedMutations: IUnresolvedMutation[];
}

export interface IProvisioningReport {
  hostSiteUrl: string;
  startedAtUtc: string;
  completedAtUtc: string;
  listResults: IListProvisioningResult[];
  unresolvedMutations: IUnresolvedMutation[];
}

export interface IFieldSettingsUpdatePlan {
  required?: boolean;
  indexed?: boolean;
  defaultValue?: string;
  choices?: string[];
}

export type IFieldPlanAction =
  | { kind: 'create'; field: IFieldDefinition }
  | { kind: 'update-settings'; field: IFieldDefinition; liveField: ILiveSharePointFieldSnapshot; updates: IFieldSettingsUpdatePlan }
  | { kind: 'blocker-wrong-type'; field: IFieldDefinition; unresolved: IUnresolvedMutation }
  | { kind: 'no-op'; field: IFieldDefinition; liveField: ILiveSharePointFieldSnapshot };
