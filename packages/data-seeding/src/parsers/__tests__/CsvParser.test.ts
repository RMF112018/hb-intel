import { describe, it, expect } from 'vitest';
import { CsvParser } from '../CsvParser';

function createCsvFile(content: string, sizeOverride?: number): File {
  const file = new File([content], 'test.csv', { type: 'text/csv' });
  // jsdom File doesn't support text() — polyfill
  file.text = () => Promise.resolve(content);
  if (sizeOverride) {
    Object.defineProperty(file, 'size', { value: sizeOverride });
  }
  return file;
}

describe('CsvParser', () => {
  it('parses standard CSV with headers', async () => {
    const csv = 'Name,Email,Value\nAcme Corp,acme@test.com,50000\nBeta Inc,beta@test.com,75000';
    const file = createCsvFile(csv);

    const result = await CsvParser.parse(file);

    expect(result.format).toBe('csv');
    expect(result.parsedOnServer).toBe(false);
    expect(result.headers).toEqual(['Name', 'Email', 'Value']);
    expect(result.rows).toHaveLength(2);
    expect(result.rows[0]).toEqual({ Name: 'Acme Corp', Email: 'acme@test.com', Value: '50000' });
    expect(result.rows[1]).toEqual({ Name: 'Beta Inc', Email: 'beta@test.com', Value: '75000' });
  });

  it('handles quoted fields with embedded commas', async () => {
    const csv = 'Name,Address\n"Smith, John","123 Main St, Apt 4"';
    const file = createCsvFile(csv);

    const result = await CsvParser.parse(file);

    expect(result.rows[0]).toEqual({ Name: 'Smith, John', Address: '123 Main St, Apt 4' });
  });

  it('handles Windows CRLF line endings', async () => {
    const csv = 'Name,Email\r\nAcme,acme@test.com\r\nBeta,beta@test.com';
    const file = createCsvFile(csv);

    const result = await CsvParser.parse(file);

    expect(result.rows).toHaveLength(2);
    expect(result.rows[0]).toEqual({ Name: 'Acme', Email: 'acme@test.com' });
  });

  it('strips UTF-8 BOM', async () => {
    const csv = '\uFEFFName,Email\nAcme,acme@test.com';
    const file = createCsvFile(csv);

    const result = await CsvParser.parse(file);

    expect(result.headers).toEqual(['Name', 'Email']);
    expect(result.rows).toHaveLength(1);
  });

  it('filters empty rows', async () => {
    const csv = 'Name,Email\nAcme,acme@test.com\n\n\nBeta,beta@test.com\n';
    const file = createCsvFile(csv);

    const result = await CsvParser.parse(file);

    expect(result.rows).toHaveLength(2);
  });

  it('returns parsedOnServer: true for large files (D-01)', async () => {
    const file = createCsvFile('Name\nTest', 11 * 1024 * 1024);

    const result = await CsvParser.parse(file);

    expect(result.parsedOnServer).toBe(true);
    expect(result.rows).toHaveLength(0);
  });

  it('returns empty result for empty file', async () => {
    const file = createCsvFile('');

    const result = await CsvParser.parse(file);

    expect(result.headers).toHaveLength(0);
    expect(result.rows).toHaveLength(0);
    expect(result.rowCount).toBe(0);
  });

  it('handles escaped quotes inside quoted fields', async () => {
    const csv = 'Name,Note\n"Acme ""Best"" Corp","said ""hello"""';
    const file = createCsvFile(csv);

    const result = await CsvParser.parse(file);

    expect(result.rows[0]).toEqual({ Name: 'Acme "Best" Corp', Note: 'said "hello"' });
  });
});
