import { describe, expect, it } from 'vitest';
import {
  escapeODataString,
  mapRawProjectRow,
  type RawProjectsListItem,
} from './projectsLookupSource.js';

describe('mapRawProjectRow', () => {
  it('maps a well-formed row to a ProjectLookupEntry', () => {
    const row: RawProjectsListItem = {
      Title: '21-105-02 — Bayshore Tower',
      field_1: 'PRJ-2104',
      field_2: '21-105-02',
      field_3: 'Bayshore Tower',
      field_4: 'Tampa, FL',
    };
    expect(mapRawProjectRow(row)).toEqual({
      projectId: 'PRJ-2104',
      projectNumber: '21-105-02',
      projectName: 'Bayshore Tower',
      projectLocation: 'Tampa, FL',
      displayTitle: '21-105-02 — Bayshore Tower',
    });
  });

  it('trims surrounding whitespace on every identity field', () => {
    const entry = mapRawProjectRow({
      field_1: '  PRJ-1  ',
      field_2: '  21-001-00  ',
      field_3: '  Alpha  ',
      field_4: '  Orlando  ',
    });
    expect(entry).toEqual({
      projectId: 'PRJ-1',
      projectNumber: '21-001-00',
      projectName: 'Alpha',
      projectLocation: 'Orlando',
      displayTitle: '21-001-00 — Alpha',
    });
  });

  it('returns null when ProjectId (field_1) is missing', () => {
    expect(
      mapRawProjectRow({ field_2: '21-001-00', field_3: 'Alpha' }),
    ).toBeNull();
    expect(mapRawProjectRow({ field_1: '   ', field_3: 'Alpha' })).toBeNull();
  });

  it('returns null when ProjectName (field_3) is missing', () => {
    expect(mapRawProjectRow({ field_1: 'PRJ-1' })).toBeNull();
    expect(mapRawProjectRow({ field_1: 'PRJ-1', field_3: '   ' })).toBeNull();
  });

  it('falls back to a composed displayTitle when Title is empty', () => {
    const entry = mapRawProjectRow({
      field_1: 'PRJ-2',
      field_2: '21-002-00',
      field_3: 'Beta',
    });
    expect(entry?.displayTitle).toBe('21-002-00 — Beta');
  });

  it('falls back to the project name alone when number and Title are missing', () => {
    const entry = mapRawProjectRow({ field_1: 'PRJ-3', field_3: 'Gamma' });
    expect(entry?.projectNumber).toBe('');
    expect(entry?.displayTitle).toBe('Gamma');
  });

  it('treats an empty ProjectLocation as absent rather than empty string', () => {
    const entry = mapRawProjectRow({
      field_1: 'PRJ-4',
      field_3: 'Delta',
      field_4: '   ',
    });
    expect(entry?.projectLocation).toBeUndefined();
  });
});

describe('escapeODataString', () => {
  it('doubles single quotes so an OData string literal cannot break out', () => {
    expect(escapeODataString("O'Malley")).toBe("O''Malley");
  });

  it('collapses CR/LF so a multi-line paste cannot inject filter syntax', () => {
    expect(escapeODataString('line1\nline2\r\nline3')).toBe('line1 line2 line3');
  });

  it('leaves ordinary substrings unchanged', () => {
    expect(escapeODataString('Bayshore 21-105')).toBe('Bayshore 21-105');
  });
});
