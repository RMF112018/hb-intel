import { describe, expect, it } from 'vitest';
import {
  buildProjectLocationSummary,
  normalizeProjectSetupRequestFields,
} from '../config/projectLocationFields.js';

describe('projectLocationFields', () => {
  it('builds a comma-separated legacy location summary from structured fields', () => {
    expect(
      buildProjectLocationSummary({
        projectStreetAddress: '100 Main Street',
        projectCity: 'Charlotte',
        projectCounty: 'Mecklenburg',
        projectState: 'NC',
        projectZip: '28202',
      }),
    ).toBe('100 Main Street, Charlotte, Mecklenburg, NC, 28202');
  });

  it('hydrates legacy projectLocation into street address when structured fields are absent', () => {
    expect(
      normalizeProjectSetupRequestFields({
        projectLocation: 'Legacy Location',
      }),
    ).toMatchObject({
      projectStreetAddress: 'Legacy Location',
      projectLocation: 'Legacy Location',
    });
  });

  it('prefers structured fields when deriving the compatibility projectLocation', () => {
    expect(
      normalizeProjectSetupRequestFields({
        projectStreetAddress: '100 Main Street',
        projectCity: 'Charlotte',
        projectLocation: 'Old value',
      }),
    ).toMatchObject({
      projectStreetAddress: '100 Main Street',
      projectCity: 'Charlotte',
      projectLocation: '100 Main Street, Charlotte',
    });
  });
});
