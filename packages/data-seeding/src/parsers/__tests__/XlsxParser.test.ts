import { describe, it, expect, vi, beforeEach } from 'vitest';
import { XlsxParser } from '../XlsxParser';

// The xlsx module is mocked in test-setup.ts
// Dynamic import('xlsx') resolves to the same mock
const xlsxMock = await vi.importMock<typeof import('xlsx')>('xlsx');

function createMockFile(name: string, sizeBytes: number): File {
  const buffer = new ArrayBuffer(sizeBytes);
  const file = new File([buffer], name, {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
  // jsdom File doesn't support arrayBuffer() — polyfill
  file.arrayBuffer = () => Promise.resolve(buffer);
  return file;
}

describe('XlsxParser', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('parses a small Excel file to row arrays', async () => {
    const file = createMockFile('test.xlsx', 5000);

    xlsxMock.read.mockReturnValue({
      SheetNames: ['Sheet1'],
      Sheets: { Sheet1: {} },
    });
    xlsxMock.utils.sheet_to_json.mockReturnValue([
      ['Name', 'Email', 'Value'],
      ['Acme Corp', 'acme@test.com', '50000'],
      ['Beta Inc', 'beta@test.com', '75000'],
    ]);

    const result = await XlsxParser.parse(file);

    expect(result.format).toBe('xlsx');
    expect(result.parsedOnServer).toBe(false);
    expect(result.headers).toEqual(['Name', 'Email', 'Value']);
    expect(result.rows).toHaveLength(2);
    expect(result.rows[0]).toEqual({ Name: 'Acme Corp', Email: 'acme@test.com', Value: '50000' });
    expect(result.rowCount).toBe(2);
    expect(result.fileSizeBytes).toBe(5000);
  });

  it('strips empty rows', async () => {
    const file = createMockFile('test.xlsx', 3000);

    xlsxMock.read.mockReturnValue({
      SheetNames: ['Sheet1'],
      Sheets: { Sheet1: {} },
    });
    xlsxMock.utils.sheet_to_json.mockReturnValue([
      ['Name', 'Email'],
      ['Acme Corp', 'acme@test.com'],
      ['', ''],
      ['Beta Inc', 'beta@test.com'],
    ]);

    const result = await XlsxParser.parse(file);

    expect(result.rows).toHaveLength(2);
    expect(result.rowCount).toBe(2);
  });

  it('returns parsedOnServer: true for large files (D-01)', async () => {
    const buffer = new ArrayBuffer(11 * 1024 * 1024);
    const largeFile = new File([buffer], 'large.xlsx', {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
    Object.defineProperty(largeFile, 'size', { value: 11 * 1024 * 1024 });

    const result = await XlsxParser.parse(largeFile);

    expect(result.parsedOnServer).toBe(true);
    expect(result.rows).toHaveLength(0);
    expect(result.headers).toHaveLength(0);
    expect(result.format).toBe('xlsx');
  });

  it('throws for file with no sheets', async () => {
    const file = createMockFile('empty.xlsx', 1000);

    xlsxMock.read.mockReturnValue({
      SheetNames: [],
      Sheets: {},
    });

    await expect(XlsxParser.parse(file)).rejects.toThrow('no sheets');
  });

  it('returns empty result for file with empty sheet', async () => {
    const file = createMockFile('empty-sheet.xlsx', 1000);

    xlsxMock.read.mockReturnValue({
      SheetNames: ['Sheet1'],
      Sheets: { Sheet1: {} },
    });
    xlsxMock.utils.sheet_to_json.mockReturnValue([]);

    const result = await XlsxParser.parse(file);

    expect(result.headers).toHaveLength(0);
    expect(result.rows).toHaveLength(0);
    expect(result.rowCount).toBe(0);
  });

  it('peekHeaders reads only first row', async () => {
    const file = createMockFile('test.xlsx', 2000);

    xlsxMock.read.mockReturnValue({
      SheetNames: ['Sheet1'],
      Sheets: { Sheet1: {} },
    });
    xlsxMock.utils.sheet_to_json.mockReturnValue([
      ['Name', 'Email', 'Value'],
    ]);

    const headers = await XlsxParser.peekHeaders(file);

    expect(headers).toEqual(['Name', 'Email', 'Value']);
    expect(xlsxMock.read).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ sheetRows: 1 })
    );
  });

  it('peekHeaders returns empty for file with no sheets', async () => {
    const file = createMockFile('empty.xlsx', 1000);

    xlsxMock.read.mockReturnValue({
      SheetNames: [],
      Sheets: {},
    });

    const headers = await XlsxParser.peekHeaders(file);
    expect(headers).toEqual([]);
  });

  it('peekHeaders returns empty for empty header row', async () => {
    const file = createMockFile('empty-header.xlsx', 1000);

    xlsxMock.read.mockReturnValue({
      SheetNames: ['Sheet1'],
      Sheets: { Sheet1: {} },
    });
    xlsxMock.utils.sheet_to_json.mockReturnValue([]);

    const headers = await XlsxParser.peekHeaders(file);
    expect(headers).toEqual([]);
  });

  it('parse handles cells with null/undefined values', async () => {
    const file = createMockFile('nulls.xlsx', 2000);

    xlsxMock.read.mockReturnValue({
      SheetNames: ['Sheet1'],
      Sheets: { Sheet1: {} },
    });
    xlsxMock.utils.sheet_to_json.mockReturnValue([
      ['Name', 'Email'],
      ['Acme', null],
    ]);

    const result = await XlsxParser.parse(file);

    expect(result.rows[0]).toEqual({ Name: 'Acme', Email: '' });
  });
});
