import { describe, it, expect } from 'vitest';
import { validateRow, validateAllRows } from '../validateRow';
import { createMockSeedConfig } from '@hbc/data-seeding/testing';

describe('validateRow', () => {
  const config = createMockSeedConfig();

  const validMapping: Record<string, string> = {
    Name: 'name',
    Email: 'email',
    Value: 'value',
  };

  it('returns isValid: true for a valid row (D-03)', () => {
    const row = { Name: 'Acme Corp', Email: 'acme@test.com', Value: '50000' };
    const meta = validateRow(row, 1, validMapping, config.fieldMappings);

    expect(meta.isValid).toBe(true);
    expect(meta.errors).toHaveLength(0);
    expect(meta.rowNumber).toBe(1);
    expect(meta.skipped).toBe(false);
  });

  it('surfaces required field error for empty required column', () => {
    const row = { Name: '', Email: 'acme@test.com', Value: '50000' };
    const meta = validateRow(row, 1, validMapping, config.fieldMappings);

    expect(meta.isValid).toBe(false);
    expect(meta.errors).toHaveLength(1);
    expect(meta.errors[0].column).toBe('Name');
    expect(meta.errors[0].error).toContain('required');
  });

  it('runs custom validate function and surfaces error (D-03)', () => {
    const row = { Name: 'Acme', Email: 'not-an-email', Value: '50000' };
    const meta = validateRow(row, 2, validMapping, config.fieldMappings);

    expect(meta.isValid).toBe(false);
    expect(meta.errors).toHaveLength(1);
    expect(meta.errors[0].column).toBe('Email');
    expect(meta.errors[0].error).toBe('Invalid email format');
    expect(meta.errors[0].value).toBe('not-an-email');
    expect(meta.errors[0].row).toBe(2);
  });

  it('returns multiple errors for multiple invalid fields', () => {
    const row = { Name: '', Email: 'bad-email', Value: '50000' };
    const meta = validateRow(row, 3, validMapping, config.fieldMappings);

    expect(meta.isValid).toBe(false);
    expect(meta.errors).toHaveLength(2);
    expect(meta.errors.map((e) => e.column)).toContain('Name');
    expect(meta.errors.map((e) => e.column)).toContain('Email');
  });

  it('does not error on unmapped optional fields', () => {
    const partialMapping: Record<string, string> = { Name: 'name' };
    const row = { Name: 'Acme', Email: 'bad', Value: 'bad' };
    const meta = validateRow(row, 1, partialMapping, config.fieldMappings);

    expect(meta.isValid).toBe(true);
    expect(meta.errors).toHaveLength(0);
  });

  it('allows empty optional fields', () => {
    const row = { Name: 'Acme', Email: '', Value: '' };
    const meta = validateRow(row, 1, validMapping, config.fieldMappings);

    expect(meta.isValid).toBe(true);
    expect(meta.errors).toHaveLength(0);
  });

  it('handles row missing mapped column key (nullish fallback)', () => {
    // Row has Name mapped but the key doesn't exist in the row object
    const row = { Email: 'acme@test.com' } as Record<string, string>;
    const meta = validateRow(row, 1, validMapping, config.fieldMappings);

    // Name is required and missing from the row → should error
    expect(meta.isValid).toBe(false);
    expect(meta.errors.some((e) => e.column === 'Name')).toBe(true);
  });

  it('skips required field check when required field is not in activeMapping', () => {
    // Name is required but not mapped — should NOT produce a row-level error
    const noNameMapping: Record<string, string> = { Email: 'email' };
    const row = { Name: '', Email: 'acme@test.com' };
    const meta = validateRow(row, 1, noNameMapping, config.fieldMappings);

    // Should be valid because the unmapped required field is a config-level issue, not row-level
    expect(meta.isValid).toBe(true);
    expect(meta.errors).toHaveLength(0);
  });
});

describe('validateAllRows', () => {
  const config = createMockSeedConfig();
  const validMapping: Record<string, string> = { Name: 'name', Email: 'email' };

  it('validates all rows with 1-based row numbers', () => {
    const rows = [
      { Name: 'Acme', Email: 'acme@test.com' },
      { Name: '', Email: 'beta@test.com' },
      { Name: 'Gamma', Email: 'bad-email' },
    ];

    const results = validateAllRows(rows, validMapping, config.fieldMappings);

    expect(results).toHaveLength(3);
    expect(results[0].rowNumber).toBe(1);
    expect(results[0].isValid).toBe(true);
    expect(results[1].rowNumber).toBe(2);
    expect(results[1].isValid).toBe(false);
    expect(results[2].rowNumber).toBe(3);
    expect(results[2].isValid).toBe(false);
  });
});
