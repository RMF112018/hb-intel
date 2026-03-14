/**
 * W0-G2-T08: Pure validation functions for list definitions.
 * All functions accept list definitions as arguments — no config imports.
 */

import type { IListDefinition } from '../services/sharepoint-service.js';
import type { IValidationResult } from './types.js';

const VALID_FIELD_TYPES = [
  'Text',
  'Number',
  'DateTime',
  'Boolean',
  'Choice',
  'User',
  'URL',
  'Lookup',
  'MultiLineText',
] as const;

/**
 * Validates every list has a pid field with correct properties:
 * internalName: 'pid', type: 'Text', required: true, indexed: true,
 * defaultValue containing '{{projectNumber}}'.
 */
export function validatePidContract(lists: IListDefinition[]): IValidationResult[] {
  return lists.map((list) => {
    const pidField = list.fields.find((f) => f.internalName === 'pid');
    if (!pidField) {
      return {
        rule: 'pid-contract',
        passed: false,
        message: `List "${list.title}" is missing the pid field.`,
        details: { listTitle: list.title },
      };
    }

    const errors: string[] = [];
    if (pidField.type !== 'Text') errors.push(`pid type is "${pidField.type}", expected "Text"`);
    if (pidField.required !== true) errors.push('pid is not required');
    if (pidField.indexed !== true) errors.push('pid is not indexed');
    if (!pidField.defaultValue?.includes('{{projectNumber}}')) {
      errors.push(`pid defaultValue is "${pidField.defaultValue ?? 'undefined'}", expected to contain "{{projectNumber}}"`);
    }

    return {
      rule: 'pid-contract',
      passed: errors.length === 0,
      message:
        errors.length === 0
          ? `List "${list.title}" pid contract is valid.`
          : `List "${list.title}" pid contract violations: ${errors.join('; ')}`,
      details: { listTitle: list.title, errors },
    };
  });
}

/**
 * Validates parent/child lookup relationships:
 * - Every list with parentListTitle references an existing list title
 * - Has at least one Lookup field with matching lookupListTitle
 * - Parent has lower provisioningOrder than child
 */
export function validateParentChildLookups(lists: IListDefinition[]): IValidationResult[] {
  const results: IValidationResult[] = [];
  const titleSet = new Set(lists.map((l) => l.title));

  for (const list of lists) {
    if (!list.parentListTitle) continue;

    const errors: string[] = [];

    if (!titleSet.has(list.parentListTitle)) {
      errors.push(`parentListTitle "${list.parentListTitle}" does not match any list title`);
    }

    const lookupFields = list.fields.filter(
      (f) => f.type === 'Lookup' && f.lookupListTitle === list.parentListTitle
    );
    if (lookupFields.length === 0) {
      errors.push(
        `No Lookup field references parentListTitle "${list.parentListTitle}"`
      );
    }

    const parent = lists.find((l) => l.title === list.parentListTitle);
    if (parent && (parent.provisioningOrder ?? 0) >= (list.provisioningOrder ?? 0)) {
      errors.push(
        `Parent "${parent.title}" provisioningOrder (${parent.provisioningOrder ?? 0}) must be lower than child "${list.title}" (${list.provisioningOrder ?? 0})`
      );
    }

    results.push({
      rule: 'parent-child-lookup',
      passed: errors.length === 0,
      message:
        errors.length === 0
          ? `List "${list.title}" parent/child relationship is valid.`
          : `List "${list.title}" parent/child violations: ${errors.join('; ')}`,
      details: { listTitle: list.title, parentListTitle: list.parentListTitle, errors },
    });
  }

  return results;
}

/**
 * Validates structural completeness of list definitions:
 * - Non-empty title/description
 * - template: 100
 * - At least one field
 * - No duplicate internalNames within a list
 * - All fields have valid type values
 */
export function validateListCompleteness(lists: IListDefinition[]): IValidationResult[] {
  return lists.map((list) => {
    const errors: string[] = [];

    if (!list.title || list.title.trim() === '') errors.push('Empty title');
    if (!list.description || list.description.trim() === '') errors.push('Empty description');
    if (list.template !== 100) errors.push(`template is ${list.template}, expected 100`);
    if (list.fields.length === 0) errors.push('No fields defined');

    // Check for duplicate internalNames
    const seen = new Set<string>();
    for (const field of list.fields) {
      if (seen.has(field.internalName)) {
        errors.push(`Duplicate internalName "${field.internalName}"`);
      }
      seen.add(field.internalName);

      if (!VALID_FIELD_TYPES.includes(field.type as (typeof VALID_FIELD_TYPES)[number])) {
        errors.push(`Field "${field.internalName}" has invalid type "${field.type}"`);
      }
    }

    return {
      rule: 'list-completeness',
      passed: errors.length === 0,
      message:
        errors.length === 0
          ? `List "${list.title}" is structurally complete.`
          : `List "${list.title}" completeness violations: ${errors.join('; ')}`,
      details: { listTitle: list.title, fieldCount: list.fields.length, errors },
    };
  });
}

/**
 * Validates no title collision across core and workflow list sets.
 */
export function validateNoDuplicateTitles(
  coreLists: IListDefinition[],
  workflowLists: IListDefinition[]
): IValidationResult[] {
  const allTitles = [...coreLists, ...workflowLists].map((l) => l.title);
  const seen = new Set<string>();
  const duplicates: string[] = [];

  for (const title of allTitles) {
    if (seen.has(title)) {
      duplicates.push(title);
    }
    seen.add(title);
  }

  return [
    {
      rule: 'no-duplicate-titles',
      passed: duplicates.length === 0,
      message:
        duplicates.length === 0
          ? `All ${allTitles.length} list titles are unique across core and workflow sets.`
          : `Duplicate titles found: ${duplicates.join(', ')}`,
      details: { totalLists: allTitles.length, duplicates },
    },
  ];
}
