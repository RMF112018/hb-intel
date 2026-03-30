import { describe, expect, it } from 'vitest';
import {
  CONTRACT_TYPE_OPTIONS,
  getProjectTypeOptionsForDepartment,
  isSelectableProjectType,
  isValidProjectStage,
  isValidProjectTypeForDepartment,
  OFFICE_DIVISION_OPTIONS,
  PROJECT_STAGE_OPTIONS,
} from '../config/departmentTypeOptions.js';

describe('departmentTypeOptions', () => {
  it('exposes the exact Office & Division endpoints', () => {
    expect(OFFICE_DIVISION_OPTIONS[0]?.label).toBe('Luxury Residential (01-10)');
    expect(OFFICE_DIVISION_OPTIONS[OFFICE_DIVISION_OPTIONS.length - 1]?.label).toBe(
      'Hedrick Overhead or Related Entity (01-05)',
    );
  });

  it('exposes the exact Project Stage options', () => {
    expect(PROJECT_STAGE_OPTIONS.map((option) => option.value)).toEqual([
      'Lead',
      'Pursuit',
      'Preconstruction',
      'Construction',
      'Closeout',
      'Warranty',
    ]);
  });

  it('marks category rows as non-selectable in commercial project types', () => {
    const commercialOptions = getProjectTypeOptionsForDepartment('commercial');
    const retailHeader = commercialOptions.find((option) => option.label === 'Retail Facilities');
    const retailChild = commercialOptions.find(
      (option) => option.label === 'Strip malls and neighborhood shopping centers',
    );

    expect(retailHeader).toBeDefined();
    expect(isSelectableProjectType(retailHeader!)).toBe(false);
    expect(isSelectableProjectType(retailChild!)).toBe(true);
  });

  it('validates department-specific project type membership', () => {
    expect(isValidProjectTypeForDepartment('commercial', 'Corporate headquarters')).toBe(true);
    expect(isValidProjectTypeForDepartment('luxury-residential', 'Corporate headquarters')).toBe(false);
    expect(isValidProjectTypeForDepartment('luxury-residential', 'Custom-built luxury residences')).toBe(true);
  });

  it('validates project stage membership and exposes the contract type list', () => {
    expect(isValidProjectStage('Lead')).toBe(true);
    expect(isValidProjectStage('Active')).toBe(false);
    expect(CONTRACT_TYPE_OPTIONS.some((option) => option.value === 'Design-Build (DB) Contract')).toBe(true);
  });
});
