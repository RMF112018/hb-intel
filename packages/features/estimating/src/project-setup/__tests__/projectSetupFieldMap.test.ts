import { describe, expect, it } from 'vitest';
import {
  PROJECT_SETUP_FIELD_MAP,
  resolveStepsForClarification,
} from '../config/projectSetupFieldMap.js';

// TC-CLAR-01: Field-to-step mapping for clarification routing
describe('PROJECT_SETUP_FIELD_MAP', () => {
  it('maps all Step 1 fields to project-info', () => {
    expect(PROJECT_SETUP_FIELD_MAP['projectName']).toBe('project-info');
    expect(PROJECT_SETUP_FIELD_MAP['projectStreetAddress']).toBe('project-info');
    expect(PROJECT_SETUP_FIELD_MAP['projectCity']).toBe('project-info');
    expect(PROJECT_SETUP_FIELD_MAP['projectCounty']).toBe('project-info');
    expect(PROJECT_SETUP_FIELD_MAP['projectState']).toBe('project-info');
    expect(PROJECT_SETUP_FIELD_MAP['projectZip']).toBe('project-info');
    expect(PROJECT_SETUP_FIELD_MAP['projectLocation']).toBe('project-info');
    expect(PROJECT_SETUP_FIELD_MAP['estimatedValue']).toBe('project-info');
    expect(PROJECT_SETUP_FIELD_MAP['clientName']).toBe('project-info');
    expect(PROJECT_SETUP_FIELD_MAP['startDate']).toBe('project-info');
    expect(PROJECT_SETUP_FIELD_MAP['procoreProject']).toBe('project-info');
  });

  it('maps all Step 2 fields to department', () => {
    expect(PROJECT_SETUP_FIELD_MAP['officeDivision']).toBe('department');
    expect(PROJECT_SETUP_FIELD_MAP['department']).toBe('department');
    expect(PROJECT_SETUP_FIELD_MAP['projectType']).toBe('department');
    expect(PROJECT_SETUP_FIELD_MAP['projectStage']).toBe('department');
    expect(PROJECT_SETUP_FIELD_MAP['contractType']).toBe('department');
  });

  it('maps all Step 3 fields to project-team', () => {
    expect(PROJECT_SETUP_FIELD_MAP['projectExecutiveUpn']).toBe('project-team');
    expect(PROJECT_SETUP_FIELD_MAP['projectManagerUpn']).toBe('project-team');
    expect(PROJECT_SETUP_FIELD_MAP['leadEstimatorUpn']).toBe('project-team');
    expect(PROJECT_SETUP_FIELD_MAP['supportingEstimatorUpns']).toBe('project-team');
    expect(PROJECT_SETUP_FIELD_MAP['additionalTeamMemberUpns']).toBe('project-team');
    expect(PROJECT_SETUP_FIELD_MAP['timberscanApproverUpn']).toBe('project-team');
  });

  it('maps Step 4 fields to template-addons', () => {
    expect(PROJECT_SETUP_FIELD_MAP['addOns']).toBe('template-addons');
  });

  it('covers exactly 23 fields', () => {
    expect(Object.keys(PROJECT_SETUP_FIELD_MAP)).toHaveLength(23);
  });
});

describe('resolveStepsForClarification', () => {
  it('returns empty array for no fields', () => {
    expect(resolveStepsForClarification([])).toEqual([]);
  });

  it('returns single step for a single field', () => {
    expect(resolveStepsForClarification(['projectName'])).toEqual(['project-info']);
  });

  it('deduplicates fields in the same step', () => {
    expect(resolveStepsForClarification(['projectName', 'projectCity'])).toEqual([
      'project-info',
    ]);
  });

  it('returns steps in wizard sequential order regardless of input order', () => {
    expect(
      resolveStepsForClarification(['projectExecutiveUpn', 'department', 'projectName']),
    ).toEqual(['project-info', 'department', 'project-team']);
  });

  it('ignores unknown field IDs', () => {
    expect(resolveStepsForClarification(['unknownField', 'projectName'])).toEqual([
      'project-info',
    ]);
  });

  it('handles all-unknown fields gracefully', () => {
    expect(resolveStepsForClarification(['foo', 'bar'])).toEqual([]);
  });

  it('resolves fields across all four mapped steps', () => {
    expect(
      resolveStepsForClarification(['addOns', 'department', 'timberscanApproverUpn', 'clientName']),
    ).toEqual(['project-info', 'department', 'project-team', 'template-addons']);
  });
});
