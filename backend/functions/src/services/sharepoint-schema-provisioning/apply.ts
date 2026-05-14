import type { IFieldDefinition } from '../sharepoint-service.js';
import type { IFieldMutation, IFieldSettingsUpdatePlan } from './types.js';

export interface ISharePointFieldUpdateTarget {
  update(values: Record<string, unknown>): Promise<void>;
}

export interface ISharePointListLike {
  fields: {
    addText(internalName: string, options: Record<string, unknown>): Promise<unknown>;
    addNumber(internalName: string, options: Record<string, unknown>): Promise<unknown>;
    addDateTime(internalName: string, options: Record<string, unknown>): Promise<unknown>;
    addBoolean(internalName: string, options: Record<string, unknown>): Promise<unknown>;
    addChoice(internalName: string, options: Record<string, unknown>): Promise<unknown>;
    addUser(internalName: string, options: Record<string, unknown>): Promise<unknown>;
    addUrl(internalName: string, options: Record<string, unknown>): Promise<unknown>;
    addLookup(internalName: string, options: Record<string, unknown>): Promise<unknown>;
    addMultilineText(internalName: string, options: Record<string, unknown>): Promise<unknown>;
    getByInternalNameOrTitle(internalName: string): ISharePointFieldUpdateTarget;
  };
}

export async function createSharePointField(
  list: ISharePointListLike,
  field: IFieldDefinition,
  options?: { lookupListIdResolver?: (lookupListTitle: string) => Promise<string> },
): Promise<void> {
  switch (field.type) {
    case 'Number':
      await list.fields.addNumber(field.internalName, { Required: field.required ?? false, Title: field.displayName });
      break;
    case 'DateTime':
      await list.fields.addDateTime(field.internalName, { Required: field.required ?? false, Title: field.displayName });
      break;
    case 'Boolean':
      await list.fields.addBoolean(field.internalName, { Required: field.required ?? false, Title: field.displayName });
      break;
    case 'Choice':
      await list.fields.addChoice(field.internalName, {
        Required: field.required ?? false,
        Title: field.displayName,
        Choices: field.choices ?? [],
      });
      break;
    case 'User':
      await list.fields.addUser(field.internalName, { Required: field.required ?? false, Title: field.displayName });
      break;
    case 'URL':
      await list.fields.addUrl(field.internalName, { Required: field.required ?? false, Title: field.displayName });
      break;
    case 'Lookup': {
      if (!field.lookupListTitle || !options?.lookupListIdResolver) {
        throw new Error('Lookup field creation requires lookupListTitle and lookupListIdResolver.');
      }
      const lookupListId = await options.lookupListIdResolver(field.lookupListTitle);
      await list.fields.addLookup(field.internalName, {
        Required: field.required ?? false,
        Title: field.displayName,
        LookupListId: lookupListId,
        LookupFieldName: field.lookupFieldName ?? 'ID',
      });
      break;
    }
    case 'MultiLineText':
      await list.fields.addMultilineText(field.internalName, {
        Required: field.required ?? false,
        Title: field.displayName,
        RichText: false,
      });
      break;
    case 'Text':
    default:
      await list.fields.addText(field.internalName, { Required: field.required ?? false, Title: field.displayName });
      break;
  }
}

export async function applyFieldSettingsUpdates(
  list: ISharePointListLike,
  listTitle: string,
  fieldInternalName: string,
  updates: IFieldSettingsUpdatePlan,
): Promise<IFieldMutation[]> {
  const mutations: IFieldMutation[] = [];
  const target = list.fields.getByInternalNameOrTitle(fieldInternalName);

  if (updates.required !== undefined) {
    await target.update({ Required: updates.required });
    mutations.push({ listTitle, fieldInternalName, action: 'required-updated' });
  }

  if (updates.choices) {
    await target.update({ Choices: updates.choices });
    mutations.push({ listTitle, fieldInternalName, action: 'choices-updated' });
  }

  if (updates.indexed === true) {
    await target.update({ Indexed: true });
    mutations.push({ listTitle, fieldInternalName, action: 'indexed' });
  }

  if (updates.defaultValue !== undefined) {
    await target.update({ DefaultValue: updates.defaultValue });
    mutations.push({ listTitle, fieldInternalName, action: 'defaulted' });
  }

  return mutations;
}
