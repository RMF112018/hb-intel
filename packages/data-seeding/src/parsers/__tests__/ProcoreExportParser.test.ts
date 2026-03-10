import { describe, it, expect } from 'vitest';
import { ProcoreExportParser, ProcoreFormatError } from '../ProcoreExportParser';

function createJsonFile(content: unknown, sizeOverride?: number): File {
  const text = JSON.stringify(content);
  const file = new File([text], 'export.json', { type: 'application/json' });
  // jsdom File doesn't support text() — polyfill
  file.text = () => Promise.resolve(text);
  if (sizeOverride) {
    Object.defineProperty(file, 'size', { value: sizeOverride });
  }
  return file;
}

const validProcoreExport = {
  projects: [
    {
      id: 101,
      name: 'Highway Bridge',
      display_name: 'Highway Bridge Reconstruction',
      project_number: 'HB-2026-001',
      status: 'active',
      start_date: '2026-01-15',
      completion_date: '2026-12-31',
      value: '5000000',
      address: '123 Main St',
      city: 'Springfield',
      state_code: 'IL',
      owner_name: 'IDOT',
      project_manager: { id: 1, name: 'Jane Smith' },
      superintendent: { id: 2, name: 'Bob Jones' },
    },
    {
      id: 102,
      name: 'Office Tower',
      status: 'bidding',
    },
  ],
};

describe('ProcoreExportParser', () => {
  describe('isProcoreExport', () => {
    it('returns true for valid Procore project export', () => {
      expect(ProcoreExportParser.isProcoreExport(validProcoreExport)).toBe(true);
    });

    it('returns false for non-Procore JSON', () => {
      expect(ProcoreExportParser.isProcoreExport({ data: [1, 2, 3] })).toBe(false);
      expect(ProcoreExportParser.isProcoreExport({ projects: [] })).toBe(false);
      expect(ProcoreExportParser.isProcoreExport(null)).toBe(false);
      expect(ProcoreExportParser.isProcoreExport('string')).toBe(false);
    });
  });

  it('parses valid Procore project JSON export (D-08)', async () => {
    const file = createJsonFile(validProcoreExport);

    const result = await ProcoreExportParser.parse(file);

    expect(result.format).toBe('procore-export');
    expect(result.parsedOnServer).toBe(false);
    expect(result.rows).toHaveLength(2);
    expect(result.headers).toContain('procoreId');
    expect(result.headers).toContain('projectName');
    expect(result.rowCount).toBe(2);
  });

  it('maps all required Procore project fields', async () => {
    const file = createJsonFile(validProcoreExport);

    const result = await ProcoreExportParser.parse(file);
    const row = result.rows[0];

    expect(row.procoreId).toBe('101');
    expect(row.projectName).toBe('Highway Bridge Reconstruction');
    expect(row.projectNumber).toBe('HB-2026-001');
    expect(row.status).toBe('active');
    expect(row.startDate).toBe('2026-01-15');
    expect(row.completionDate).toBe('2026-12-31');
    expect(row.contractValue).toBe('5000000');
    expect(row.address).toBe('123 Main St');
    expect(row.city).toBe('Springfield');
    expect(row.stateCode).toBe('IL');
    expect(row.ownerName).toBe('IDOT');
    expect(row.projectManagerName).toBe('Jane Smith');
    expect(row.superintendentName).toBe('Bob Jones');
  });

  it('handles missing optional fields gracefully', async () => {
    const file = createJsonFile(validProcoreExport);

    const result = await ProcoreExportParser.parse(file);
    const minimalRow = result.rows[1];

    expect(minimalRow.procoreId).toBe('102');
    expect(minimalRow.projectName).toBe('Office Tower');
    expect(minimalRow.projectNumber).toBe('');
    expect(minimalRow.startDate).toBe('');
    expect(minimalRow.completionDate).toBe('');
    expect(minimalRow.contractValue).toBe('');
    expect(minimalRow.projectManagerName).toBe('');
    expect(minimalRow.superintendentName).toBe('');
  });

  it('throws for non-Procore JSON', async () => {
    const file = createJsonFile({ data: [1, 2, 3] });

    await expect(ProcoreExportParser.parse(file)).rejects.toThrow(
      'does not appear to be a Procore project export'
    );
  });

  it('throws for invalid JSON', async () => {
    const invalidJson = 'not valid json {{{';
    const file = new File([invalidJson], 'bad.json', { type: 'application/json' });
    file.text = () => Promise.resolve(invalidJson);

    await expect(ProcoreExportParser.parse(file)).rejects.toThrow('Invalid JSON');
  });

  it('returns parsedOnServer: true for large files', async () => {
    const file = createJsonFile(validProcoreExport, 11 * 1024 * 1024);

    const result = await ProcoreExportParser.parse(file);

    expect(result.parsedOnServer).toBe(true);
    expect(result.rows).toHaveLength(0);
  });

  it('ProcoreFormatError has correct name', () => {
    const error = new ProcoreFormatError('Test error');
    expect(error.name).toBe('ProcoreFormatError');
    expect(error.message).toBe('Test error');
    expect(error).toBeInstanceOf(Error);
  });
});
