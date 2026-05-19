import { describe, expect, it } from 'vitest';
import {
  MY_PROJECTS_PROJECTION_STORAGE_DESCRIPTOR,
  loadMyProjectsProjectionStorageSchema,
} from '../my-projects-projection/storage-list-descriptor.js';

describe('my-projects-projection storage descriptor integrity', () => {
  it('contains exactly seven lists and stays synchronized with schema JSON titles', () => {
    const schema = loadMyProjectsProjectionStorageSchema();
    expect(MY_PROJECTS_PROJECTION_STORAGE_DESCRIPTOR).toHaveLength(7);
    expect(schema.lists).toHaveLength(7);
    expect(MY_PROJECTS_PROJECTION_STORAGE_DESCRIPTOR.map((l) => l.title)).toEqual(
      schema.lists.map((l) => l.title),
    );
  });

  it('maps schema field metadata for required/indexed/unique/choices/default', () => {
    const schema = loadMyProjectsProjectionStorageSchema();
    for (const descriptor of MY_PROJECTS_PROJECTION_STORAGE_DESCRIPTOR) {
      const schemaList = schema.lists.find((l) => l.title === descriptor.title)!;
      expect(schemaList).toBeTruthy();
      for (const field of descriptor.fields) {
        const schemaField = schemaList.fields.find((f) => f.internalName === field.internalName)!;
        expect(schemaField).toBeTruthy();
        expect(field.required ?? false).toBe(schemaField.required ?? false);
        expect(field.indexed ?? false).toBe(schemaField.indexed ?? false);
        expect(field.unique ?? false).toBe(schemaField.unique ?? false);
        expect(field.choices ?? []).toEqual(schemaField.choices ?? []);
      }
    }
  });
});
