import { describe, expect, it } from 'vitest';
import {
  MY_PROJECT_ASSIGNMENT_ROLE_BY_ID,
  MY_PROJECT_ASSIGNMENT_ROLE_BY_INTERNAL_FIELD,
  MY_PROJECT_ASSIGNMENT_ROLE_COUNT,
  MY_PROJECT_ASSIGNMENT_ROLE_DEFINITIONS,
  MY_PROJECT_ASSIGNMENT_ROLE_IDS,
} from './MyProjectAssignmentRoles.js';

describe('MyProjectAssignmentRoles', () => {
  it('defines exactly fourteen canonical role IDs', () => {
    expect(MY_PROJECT_ASSIGNMENT_ROLE_IDS).toHaveLength(14);
    expect(MY_PROJECT_ASSIGNMENT_ROLE_COUNT).toBe(14);
  });

  it('contains exactly fourteen role definitions', () => {
    expect(MY_PROJECT_ASSIGNMENT_ROLE_DEFINITIONS).toHaveLength(14);
  });

  it('has unique role IDs and internal field names', () => {
    const ids = new Set(MY_PROJECT_ASSIGNMENT_ROLE_DEFINITIONS.map((entry) => entry.roleId));
    const fields = new Set(MY_PROJECT_ASSIGNMENT_ROLE_DEFINITIONS.map((entry) => entry.internalField));
    expect(ids.size).toBe(14);
    expect(fields.size).toBe(14);
  });

  it('anchors expected order boundaries', () => {
    expect(MY_PROJECT_ASSIGNMENT_ROLE_DEFINITIONS[0]?.roleId).toBe('lead-estimator');
    expect(MY_PROJECT_ASSIGNMENT_ROLE_DEFINITIONS[13]?.roleId).toBe('warranty-manager');
    expect(MY_PROJECT_ASSIGNMENT_ROLE_DEFINITIONS[0]?.priority).toBe(1);
    expect(MY_PROJECT_ASSIGNMENT_ROLE_DEFINITIONS[13]?.priority).toBe(14);
  });

  it('exposes lookup maps by role id and internal field', () => {
    expect(MY_PROJECT_ASSIGNMENT_ROLE_BY_ID['project-manager'].internalField).toBe('projectManagerUpns');
    expect(MY_PROJECT_ASSIGNMENT_ROLE_BY_INTERNAL_FIELD['warrantyManagerUpns'].roleId).toBe('warranty-manager');
  });
});
