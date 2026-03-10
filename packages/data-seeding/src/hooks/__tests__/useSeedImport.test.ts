import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useSeedImport } from '../useSeedImport';
import { createMockSeedConfig } from '@hbc/data-seeding/testing';

// Mock SeedApi
vi.mock('../../api/SeedApi', () => ({
  SeedApi: {
    importBatch: vi.fn(),
    recordCompletion: vi.fn(),
    parseStreaming: vi.fn(),
  },
}));

// Mock parsers - the hook imports these directly
vi.mock('../../parsers/CsvParser', () => ({
  CsvParser: {
    parse: vi.fn(),
  },
}));

vi.mock('../../parsers/XlsxParser', () => ({
  XlsxParser: {
    parse: vi.fn(),
    peekHeaders: vi.fn(),
  },
}));

vi.mock('../../parsers/ProcoreExportParser', () => ({
  ProcoreExportParser: {
    parse: vi.fn(),
    isProcoreExport: vi.fn(),
  },
}));

// Import mocked modules for test setup
const { SeedApi } = await vi.importMock<typeof import('../../api/SeedApi')>('../../api/SeedApi');
const { CsvParser } = await vi.importMock<typeof import('../../parsers/CsvParser')>('../../parsers/CsvParser');
const { XlsxParser } = await vi.importMock<typeof import('../../parsers/XlsxParser')>('../../parsers/XlsxParser');
const { ProcoreExportParser } = await vi.importMock<typeof import('../../parsers/ProcoreExportParser')>('../../parsers/ProcoreExportParser');

describe('useSeedImport', () => {
  const config = createMockSeedConfig();
  const importerContext = { userId: 'user-001', userName: 'Test User' };

  beforeEach(() => {
    vi.clearAllMocks();
    // Mock crypto.randomUUID
    vi.stubGlobal('crypto', { randomUUID: () => 'test-uuid-123' });
  });

  it('starts in idle state', () => {
    const { result } = renderHook(() => useSeedImport(config, importerContext));

    expect(result.current.status).toBe('idle');
    expect(result.current.rows).toHaveLength(0);
    expect(result.current.isFileParsed).toBe(false);
    expect(result.current.isMappingComplete).toBe(false);
    expect(result.current.isReadyToImport).toBe(false);
  });

  it('transitions to previewing after successful CSV file parse', async () => {
    CsvParser.parse.mockResolvedValue({
      headers: ['Name', 'Email', 'Value'],
      rows: [
        { Name: 'Acme', Email: 'acme@test.com', Value: '50000' },
        { Name: 'Beta', Email: 'beta@test.com', Value: '75000' },
      ],
      format: 'csv',
      fileSizeBytes: 1000,
      rowCount: 2,
      parsedOnServer: false,
    });

    const { result } = renderHook(() => useSeedImport(config, importerContext));

    const csvFile = new File(['Name,Email,Value\nAcme,acme@test.com,50000'], 'test.csv', { type: 'text/csv' });

    await act(async () => {
      await result.current.onFileSelected(csvFile);
    });

    expect(result.current.status).toBe('previewing');
    expect(result.current.rows).toHaveLength(2);
    expect(result.current.detectedHeaders).toEqual(['Name', 'Email', 'Value']);
    expect(result.current.isFileParsed).toBe(true);
  });

  it('transitions to failed on parse error', async () => {
    CsvParser.parse.mockRejectedValue(new Error('Parse error'));

    const { result } = renderHook(() => useSeedImport(config, importerContext));

    const csvFile = new File(['bad'], 'test.csv', { type: 'text/csv' });

    await act(async () => {
      await result.current.onFileSelected(csvFile);
    });

    expect(result.current.status).toBe('failed');
  });

  it('re-runs validation when mapping confirmed (D-03)', async () => {
    CsvParser.parse.mockResolvedValue({
      headers: ['Name', 'Email', 'Value'],
      rows: [
        { Name: 'Acme', Email: 'bad-email', Value: '50000' },
      ],
      format: 'csv',
      fileSizeBytes: 500,
      rowCount: 1,
      parsedOnServer: false,
    });

    const { result } = renderHook(() => useSeedImport(config, importerContext));

    const csvFile = new File(['data'], 'test.csv', { type: 'text/csv' });
    await act(async () => {
      await result.current.onFileSelected(csvFile);
    });

    act(() => {
      result.current.onMappingConfirmed({ Name: 'name' as never, Email: 'email' as never });
    });

    expect(result.current.rowMeta).toHaveLength(1);
    expect(result.current.rowMeta[0].isValid).toBe(false);
    expect(result.current.invalidRowCount).toBe(1);
  });

  it('imports all rows when all valid', async () => {
    CsvParser.parse.mockResolvedValue({
      headers: ['Name', 'Email'],
      rows: [{ Name: 'Acme', Email: 'acme@test.com' }],
      format: 'csv',
      fileSizeBytes: 500,
      rowCount: 1,
      parsedOnServer: false,
    });

    SeedApi.importBatch.mockResolvedValue({
      batchIndex: 0,
      importedCount: 1,
      failedCount: 0,
      errors: [],
    });
    SeedApi.recordCompletion.mockResolvedValue({ importId: 'test-uuid-123' });

    const { result } = renderHook(() => useSeedImport(config, importerContext));

    const csvFile = new File(['data'], 'test.csv', { type: 'text/csv' });
    await act(async () => {
      await result.current.onFileSelected(csvFile);
    });

    act(() => {
      result.current.onMappingConfirmed({ Name: 'name' as never, Email: 'email' as never });
    });

    await act(async () => {
      await result.current.onImportConfirmed();
    });

    expect(result.current.status).toBe('complete');
    expect(result.current.result).not.toBeNull();
    expect(result.current.result?.successCount).toBe(1);
  });

  it('transitions to partial when some rows fail (D-04)', async () => {
    CsvParser.parse.mockResolvedValue({
      headers: ['Name', 'Email'],
      rows: [
        { Name: 'Acme', Email: 'acme@test.com' },
        { Name: 'Beta', Email: 'beta@test.com' },
      ],
      format: 'csv',
      fileSizeBytes: 500,
      rowCount: 2,
      parsedOnServer: false,
    });

    SeedApi.importBatch.mockResolvedValue({
      batchIndex: 0,
      importedCount: 1,
      failedCount: 1,
      errors: [{ row: 2, column: 'Email', value: 'beta@test.com', error: 'Server error' }],
    });
    SeedApi.recordCompletion.mockResolvedValue({ importId: 'test-uuid-123' });

    const { result } = renderHook(() => useSeedImport(config, importerContext));

    const csvFile = new File(['data'], 'test.csv', { type: 'text/csv' });
    await act(async () => {
      await result.current.onFileSelected(csvFile);
    });

    act(() => {
      result.current.onMappingConfirmed({ Name: 'name' as never, Email: 'email' as never });
    });

    await act(async () => {
      await result.current.onImportConfirmed();
    });

    expect(result.current.status).toBe('partial');
    expect(result.current.result?.errorCount).toBeGreaterThan(0);
    expect(result.current.result?.successCount).toBeGreaterThan(0);
  });

  it('transitions to failed on SeedApi hard error', async () => {
    CsvParser.parse.mockResolvedValue({
      headers: ['Name'],
      rows: [{ Name: 'Acme' }],
      format: 'csv',
      fileSizeBytes: 500,
      rowCount: 1,
      parsedOnServer: false,
    });

    SeedApi.importBatch.mockRejectedValue(new Error('Network error'));

    const { result } = renderHook(() => useSeedImport(config, importerContext));

    const csvFile = new File(['data'], 'test.csv', { type: 'text/csv' });
    await act(async () => {
      await result.current.onFileSelected(csvFile);
    });

    act(() => {
      result.current.onMappingConfirmed({ Name: 'name' as never });
    });

    await act(async () => {
      await result.current.onImportConfirmed();
    });

    expect(result.current.status).toBe('failed');
  });

  it('resets to idle on onReset call', async () => {
    CsvParser.parse.mockResolvedValue({
      headers: ['Name'],
      rows: [{ Name: 'Acme' }],
      format: 'csv',
      fileSizeBytes: 500,
      rowCount: 1,
      parsedOnServer: false,
    });

    const { result } = renderHook(() => useSeedImport(config, importerContext));

    const csvFile = new File(['data'], 'test.csv', { type: 'text/csv' });
    await act(async () => {
      await result.current.onFileSelected(csvFile);
    });

    expect(result.current.status).toBe('previewing');

    act(() => {
      result.current.onReset();
    });

    expect(result.current.status).toBe('idle');
    expect(result.current.rows).toHaveLength(0);
    expect(result.current.isFileParsed).toBe(false);
  });

  it('rejects unsupported file format', async () => {
    const { result } = renderHook(() => useSeedImport(config, importerContext));

    const pdfFile = new File(['data'], 'test.pdf', { type: 'application/pdf' });

    await act(async () => {
      await result.current.onFileSelected(pdfFile);
    });

    expect(result.current.status).toBe('failed');
  });

  it('parses xlsx files through XlsxParser', async () => {
    XlsxParser.parse.mockResolvedValue({
      headers: ['Name', 'Email'],
      rows: [{ Name: 'Acme', Email: 'acme@test.com' }],
      format: 'xlsx',
      fileSizeBytes: 500,
      rowCount: 1,
      parsedOnServer: false,
    });

    const xlsxConfig = createMockSeedConfig({ acceptedFormats: ['xlsx'] });
    const { result } = renderHook(() => useSeedImport(xlsxConfig, importerContext));

    const xlsxFile = new File(['data'], 'test.xlsx', {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });

    await act(async () => {
      await result.current.onFileSelected(xlsxFile);
    });

    expect(result.current.status).toBe('previewing');
    expect(XlsxParser.parse).toHaveBeenCalled();
  });

  it('rejects large files with error', async () => {
    const { result } = renderHook(() => useSeedImport(config, importerContext));

    const largeFile = new File(['x'], 'big.csv', { type: 'text/csv' });
    Object.defineProperty(largeFile, 'size', { value: 11 * 1024 * 1024 });

    await act(async () => {
      await result.current.onFileSelected(largeFile);
    });

    expect(result.current.status).toBe('failed');
  });

  it('skips auto-mapping when config.autoMapHeaders is false', async () => {
    CsvParser.parse.mockResolvedValue({
      headers: ['Name', 'Email'],
      rows: [{ Name: 'Acme', Email: 'acme@test.com' }],
      format: 'csv',
      fileSizeBytes: 500,
      rowCount: 1,
      parsedOnServer: false,
    });

    const noAutoMapConfig = createMockSeedConfig({ autoMapHeaders: false });
    const { result } = renderHook(() => useSeedImport(noAutoMapConfig, importerContext));

    const csvFile = new File(['data'], 'test.csv', { type: 'text/csv' });
    await act(async () => {
      await result.current.onFileSelected(csvFile);
    });

    expect(result.current.status).toBe('previewing');
    // With autoMapHeaders disabled, activeMapping should be empty
    expect(Object.keys(result.current.activeMapping)).toHaveLength(0);
  });

  it('filters valid rows only when allowPartialImport is true during import', async () => {
    CsvParser.parse.mockResolvedValue({
      headers: ['Name', 'Email'],
      rows: [
        { Name: 'Acme', Email: 'acme@test.com' },
        { Name: '', Email: 'no-name@test.com' },
      ],
      format: 'csv',
      fileSizeBytes: 500,
      rowCount: 2,
      parsedOnServer: false,
    });

    SeedApi.importBatch.mockResolvedValue({
      batchIndex: 0,
      importedCount: 1,
      failedCount: 0,
      errors: [],
    });
    SeedApi.recordCompletion.mockResolvedValue({ importId: 'test-uuid-123' });

    const partialConfig = createMockSeedConfig({ allowPartialImport: true });
    const { result } = renderHook(() => useSeedImport(partialConfig, importerContext));

    const csvFile = new File(['data'], 'test.csv', { type: 'text/csv' });
    await act(async () => {
      await result.current.onFileSelected(csvFile);
    });

    // Confirm mapping — the second row (Name empty) should fail required validation
    act(() => {
      result.current.onMappingConfirmed({ Name: 'name' as never, Email: 'email' as never });
    });

    await act(async () => {
      await result.current.onImportConfirmed();
    });

    // 1 valid imported, 1 invalid skipped — errorCount includes skipped rows, so status is 'partial'
    expect(result.current.status).toBe('partial');
  });

  it('onRetryErrors triggers re-import when in partial state with invalid rows', async () => {
    CsvParser.parse.mockResolvedValue({
      headers: ['Name', 'Email'],
      rows: [
        { Name: 'Acme', Email: 'acme@test.com' },
        { Name: '', Email: 'beta@test.com' }, // Name empty → validation fail
      ],
      format: 'csv',
      fileSizeBytes: 500,
      rowCount: 2,
      parsedOnServer: false,
    });

    SeedApi.importBatch.mockResolvedValue({
      batchIndex: 0,
      importedCount: 1,
      failedCount: 0,
      errors: [],
    });
    SeedApi.recordCompletion.mockResolvedValue({ importId: 'test-uuid-123' });

    const partialConfig = createMockSeedConfig({ allowPartialImport: true });
    const { result } = renderHook(() => useSeedImport(partialConfig, importerContext));

    const csvFile = new File(['data'], 'test.csv', { type: 'text/csv' });
    await act(async () => {
      await result.current.onFileSelected(csvFile);
    });

    act(() => {
      result.current.onMappingConfirmed({ Name: 'name' as never, Email: 'email' as never });
    });

    // Row 2 has empty Name (required) → partial import skips it
    await act(async () => {
      await result.current.onImportConfirmed();
    });

    expect(result.current.status).toBe('partial');

    // Now retry — onRetryErrors should call onImportConfirmed again
    await act(async () => {
      await result.current.onRetryErrors();
    });

    expect(SeedApi.importBatch).toHaveBeenCalledTimes(2);
  });

  it('parses JSON files through ProcoreExportParser', async () => {
    ProcoreExportParser.parse.mockResolvedValue({
      headers: ['procoreId', 'projectName'],
      rows: [{ procoreId: '101', projectName: 'Test' }],
      format: 'procore-export',
      fileSizeBytes: 500,
      rowCount: 1,
      parsedOnServer: false,
    });

    const jsonConfig = createMockSeedConfig({ acceptedFormats: ['json', 'procore-export'] });
    const { result } = renderHook(() => useSeedImport(jsonConfig, importerContext));

    const jsonFile = new File(['{}'], 'export.json', { type: 'application/json' });

    await act(async () => {
      await result.current.onFileSelected(jsonFile);
    });

    expect(result.current.status).toBe('previewing');
    expect(ProcoreExportParser.parse).toHaveBeenCalled();
  });

  it('imports all rows when allowPartialImport is false and all valid', async () => {
    CsvParser.parse.mockResolvedValue({
      headers: ['Name', 'Email'],
      rows: [{ Name: 'Acme', Email: 'acme@test.com' }],
      format: 'csv',
      fileSizeBytes: 500,
      rowCount: 1,
      parsedOnServer: false,
    });

    SeedApi.importBatch.mockResolvedValue({
      batchIndex: 0,
      importedCount: 1,
      failedCount: 0,
      errors: [],
    });
    SeedApi.recordCompletion.mockResolvedValue({ importId: 'test-uuid-123' });

    const strictConfig = createMockSeedConfig({ allowPartialImport: false });
    const { result } = renderHook(() => useSeedImport(strictConfig, importerContext));

    const csvFile = new File(['data'], 'test.csv', { type: 'text/csv' });
    await act(async () => {
      await result.current.onFileSelected(csvFile);
    });

    act(() => {
      result.current.onMappingConfirmed({ Name: 'name' as never, Email: 'email' as never });
    });

    await act(async () => {
      await result.current.onImportConfirmed();
    });

    expect(result.current.status).toBe('complete');
  });

  it('transitions to failed when import returns all errors (0 success)', async () => {
    CsvParser.parse.mockResolvedValue({
      headers: ['Name', 'Email'],
      rows: [{ Name: 'Acme', Email: 'acme@test.com' }],
      format: 'csv',
      fileSizeBytes: 500,
      rowCount: 1,
      parsedOnServer: false,
    });

    SeedApi.importBatch.mockResolvedValue({
      batchIndex: 0,
      importedCount: 0,
      failedCount: 1,
      errors: [{ row: 1, column: 'Name', value: 'Acme', error: 'Server rejected' }],
    });
    SeedApi.recordCompletion.mockResolvedValue({ importId: 'test-uuid-123' });

    const { result } = renderHook(() => useSeedImport(config, importerContext));

    const csvFile = new File(['data'], 'test.csv', { type: 'text/csv' });
    await act(async () => {
      await result.current.onFileSelected(csvFile);
    });

    act(() => {
      result.current.onMappingConfirmed({ Name: 'name' as never, Email: 'email' as never });
    });

    await act(async () => {
      await result.current.onImportConfirmed();
    });

    // All rows failed — status should be 'failed' (not 'partial')
    expect(result.current.status).toBe('failed');
    expect(result.current.result?.errorCount).toBeGreaterThan(0);
    expect(result.current.result?.successCount).toBe(0);
  });

  it('calls config.onImportComplete callback when provided', async () => {
    const onImportComplete = vi.fn();
    CsvParser.parse.mockResolvedValue({
      headers: ['Name'],
      rows: [{ Name: 'Acme' }],
      format: 'csv',
      fileSizeBytes: 500,
      rowCount: 1,
      parsedOnServer: false,
    });

    SeedApi.importBatch.mockResolvedValue({
      batchIndex: 0,
      importedCount: 1,
      failedCount: 0,
      errors: [],
    });
    SeedApi.recordCompletion.mockResolvedValue({ importId: 'test-uuid-123' });

    const configWithCallback = createMockSeedConfig({ onImportComplete });
    const { result } = renderHook(() => useSeedImport(configWithCallback, importerContext));

    const csvFile = new File(['data'], 'test.csv', { type: 'text/csv' });
    await act(async () => {
      await result.current.onFileSelected(csvFile);
    });

    act(() => {
      result.current.onMappingConfirmed({ Name: 'name' as never });
    });

    await act(async () => {
      await result.current.onImportConfirmed();
    });

    expect(onImportComplete).toHaveBeenCalledWith(
      expect.objectContaining({ successCount: 1 })
    );
  });

  it('onRetryErrors is a no-op when not in partial state', async () => {
    const { result } = renderHook(() => useSeedImport(config, importerContext));

    await act(async () => {
      await result.current.onRetryErrors();
    });

    // Should not have called any API
    expect(SeedApi.importBatch).not.toHaveBeenCalled();
  });
});
