import { describe, it, expect } from 'vitest';
import { autoMapHeaders, FUZZY_MATCH_THRESHOLD } from '../autoMapHeaders';
import { createMockSeedConfig } from '@hbc/data-seeding/testing';

describe('autoMapHeaders', () => {
  it('maps exact header matches (D-02)', () => {
    const config = createMockSeedConfig();
    const result = autoMapHeaders(['Name', 'Email Address', 'Numeric Value'], config.fieldMappings);

    expect(result['Name']).toBe('name');
    expect(result['Email Address']).toBe('email');
    expect(result['Numeric Value']).toBe('value');
  });

  it('maps case-insensitive exact matches', () => {
    const config = createMockSeedConfig();
    const result = autoMapHeaders(['name', 'email address', 'numeric value'], config.fieldMappings);

    expect(result['name']).toBe('name');
    expect(result['email address']).toBe('email');
    expect(result['numeric value']).toBe('value');
  });

  it('fuzzy-matches similar header names at ≥0.8 threshold (D-02)', () => {
    const config = createMockSeedConfig();
    // "Email Addres" (missing trailing 's') has similarity ~0.92 to "Email Address"
    const result = autoMapHeaders(['Name', 'Email Addres'], config.fieldMappings);

    expect(result['Name']).toBe('name');
    expect(result['Email Addres']).toBe('email');
  });

  it('does not match headers below the 0.8 threshold', () => {
    const config = createMockSeedConfig();
    const result = autoMapHeaders(['XYZ123', 'ABCDEF', 'GHIJKL'], config.fieldMappings);

    expect(Object.keys(result)).toHaveLength(0);
  });

  it('does not map two headers to the same destination field', () => {
    const config = createMockSeedConfig();
    const result = autoMapHeaders(['Name', 'Full Name'], config.fieldMappings);
    const mappedValues = Object.values(result);

    expect(new Set(mappedValues).size).toBe(mappedValues.length);
  });

  it('exports FUZZY_MATCH_THRESHOLD as 0.8', () => {
    expect(FUZZY_MATCH_THRESHOLD).toBe(0.8);
  });

  it('handles empty headers array', () => {
    const config = createMockSeedConfig();
    const result = autoMapHeaders([], config.fieldMappings);

    expect(Object.keys(result)).toHaveLength(0);
  });

  it('handles empty field mappings array', () => {
    const config = createMockSeedConfig({ fieldMappings: [] });
    const result = autoMapHeaders(['Name', 'Email'], config.fieldMappings);

    expect(Object.keys(result)).toHaveLength(0);
  });
});
