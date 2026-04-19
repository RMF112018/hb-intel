import { describe, expect, it } from 'vitest';
import {
  mapProjectIndexRow,
  resolveProjectIndexFieldNames,
  type IProjectIndexFieldNames,
} from '../legacy-fallback/project-index-provider.js';
import { resolveSpField } from '../projects-list-mapper.js';

describe('legacy-fallback project-index-provider', () => {
  it('resolves field names through the projects-list mapper, not hard-coded keys', () => {
    const resolved = resolveProjectIndexFieldNames();
    expect(resolved.numberField).toBe(resolveSpField('projectNumber'));
    expect(resolved.nameField).toBe(resolveSpField('projectName'));
    expect(resolved.yearField).toBe(resolveSpField('year'));
  });

  it('reads row values through the resolved field names (drift guard)', () => {
    const arbitrary: IProjectIndexFieldNames = {
      numberField: 'alpha',
      nameField: 'beta',
      yearField: 'gamma',
    };

    const record = mapProjectIndexRow(
      {
        Id: 42,
        Title: 'ignored when explicit name present',
        alpha: ' 25-123-01 ',
        beta: ' Downtown Retrofit ',
        gamma: 2024,
        // Hard-coded field_2 / field_3 keys must NOT leak into the read path.
        field_2: 'HARDCODED-NUMBER',
        field_3: 'HARDCODED-NAME',
      },
      arbitrary,
    );

    expect(record).not.toBeNull();
    expect(record?.projectListItemId).toBe(42);
    expect(record?.projectNumber).toBe('25-123-01');
    expect(record?.projectTitle).toBe('Downtown Retrofit');
    expect(record?.year).toBe(2024);
  });

  it('falls back to Title when the resolved name field is empty', () => {
    const record = mapProjectIndexRow(
      { Id: 7, Title: 'Fallback Title', alpha: '24-001-00', beta: '', gamma: null },
      { numberField: 'alpha', nameField: 'beta', yearField: 'gamma' },
    );
    expect(record?.projectTitle).toBe('Fallback Title');
    expect(record?.year).toBeNull();
  });

  it('returns null when both the resolved name field and Title are empty', () => {
    const record = mapProjectIndexRow(
      { Id: 1, Title: '', alpha: '24-001-00', beta: '  ', gamma: 2025 },
      { numberField: 'alpha', nameField: 'beta', yearField: 'gamma' },
    );
    expect(record).toBeNull();
  });

  it('coerces non-integer year to null', () => {
    const record = mapProjectIndexRow(
      { Id: 2, Title: 'X', alpha: '', beta: 'X', gamma: 2024.5 },
      { numberField: 'alpha', nameField: 'beta', yearField: 'gamma' },
    );
    expect(record?.year).toBeNull();
  });
});
