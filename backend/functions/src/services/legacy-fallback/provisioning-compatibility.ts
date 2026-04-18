import type { IFieldDefinition } from '../sharepoint-service.js';

const SP_TYPE_COMPATIBILITY: Readonly<Record<IFieldDefinition['type'], readonly string[]>> = {
  Text: ['Text'],
  Number: ['Number', 'Currency'],
  DateTime: ['DateTime'],
  Boolean: ['Boolean'],
  Choice: ['Choice', 'MultiChoice'],
  User: ['User'],
  URL: ['URL'],
  Lookup: ['Lookup', 'LookupMulti'],
  MultiLineText: ['Note'],
};

export function normalizeListTitle(title: string): string {
  return title.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
}

export function isSharePointFieldTypeCompatible(
  desiredType: IFieldDefinition['type'],
  liveTypeAsString: string,
): boolean {
  const allowedTypes = SP_TYPE_COMPATIBILITY[desiredType];
  return allowedTypes.includes(liveTypeAsString);
}

export function getCompatibleSharePointFieldTypes(
  desiredType: IFieldDefinition['type'],
): readonly string[] {
  return SP_TYPE_COMPATIBILITY[desiredType];
}
