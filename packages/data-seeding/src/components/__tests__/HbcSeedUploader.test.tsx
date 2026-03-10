import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import { HbcSeedUploader } from '../HbcSeedUploader';
import { createMockSeedConfig } from '@hbc/data-seeding/testing';

// Mock parsers used by HbcSeedUploader (it dynamic-imports them)
vi.mock('../../parsers/CsvParser', () => ({
  CsvParser: {
    parse: vi.fn().mockResolvedValue({
      headers: ['Name', 'Email'],
      rows: [{ Name: 'Acme', Email: 'acme@test.com' }],
      format: 'csv',
      fileSizeBytes: 500,
      rowCount: 1,
      parsedOnServer: false,
    }),
  },
}));

vi.mock('../../parsers/XlsxParser', () => ({
  XlsxParser: {
    parse: vi.fn().mockResolvedValue({
      headers: ['Name', 'Email'],
      rows: [{ Name: 'Acme', Email: 'acme@test.com' }],
      format: 'xlsx',
      fileSizeBytes: 500,
      rowCount: 1,
      parsedOnServer: false,
    }),
  },
}));

vi.mock('../../parsers/ProcoreExportParser', () => ({
  ProcoreExportParser: {
    parse: vi.fn().mockResolvedValue({
      headers: ['procoreId', 'projectName'],
      rows: [{ procoreId: '101', projectName: 'Test' }],
      format: 'procore-export',
      fileSizeBytes: 500,
      rowCount: 1,
      parsedOnServer: false,
    }),
  },
}));

describe('HbcSeedUploader', () => {
  const config = createMockSeedConfig();
  const onFileLoaded = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders drag-drop zone with browse button', () => {
    render(
      <HbcSeedUploader config={config} onFileLoaded={onFileLoaded} />
    );

    expect(screen.getByTestId('hbc-seed-uploader')).toBeDefined();
    expect(screen.getByTestId('hbc-seed-uploader-browse-button')).toBeDefined();
    expect(screen.getByText(/Accepted formats/)).toBeDefined();
  });

  it('shows error state for unsupported format', async () => {
    render(
      <HbcSeedUploader config={config} onFileLoaded={onFileLoaded} />
    );

    const input = screen.getByTestId('hbc-seed-uploader-input');
    const pdfFile = new File(['data'], 'test.pdf', { type: 'application/pdf' });

    await fireEvent.change(input, { target: { files: [pdfFile] } });

    expect(await screen.findByTestId('hbc-seed-uploader-error')).toBeDefined();
  });

  it('shows replace button in ready state after successful CSV parse', async () => {
    render(
      <HbcSeedUploader config={config} onFileLoaded={onFileLoaded} />
    );

    const input = screen.getByTestId('hbc-seed-uploader-input');
    const csvFile = new File(['Name,Email\nAcme,a@t.com'], 'test.csv', { type: 'text/csv' });

    await fireEvent.change(input, { target: { files: [csvFile] } });

    expect(await screen.findByTestId('hbc-seed-uploader-ready')).toBeDefined();
    expect(screen.getByTestId('hbc-seed-uploader-replace-button')).toBeDefined();
  });

  it('calls onFileLoaded after successful small-file parse', async () => {
    render(
      <HbcSeedUploader config={config} onFileLoaded={onFileLoaded} />
    );

    const input = screen.getByTestId('hbc-seed-uploader-input');
    const csvFile = new File(['Name,Email\nAcme,a@t.com'], 'test.csv', { type: 'text/csv' });

    await fireEvent.change(input, { target: { files: [csvFile] } });

    await screen.findByTestId('hbc-seed-uploader-ready');

    expect(onFileLoaded).toHaveBeenCalledWith(
      expect.arrayContaining([expect.objectContaining({ Name: 'Acme' })]),
      expect.arrayContaining(['Name', 'Email'])
    );
  });

  it('disables interaction when disabled prop is true', () => {
    render(
      <HbcSeedUploader config={config} onFileLoaded={onFileLoaded} disabled />
    );

    const button = screen.getByTestId('hbc-seed-uploader-browse-button');
    expect(button).toHaveProperty('disabled', true);
  });

  it('handles drag over and drag leave states', () => {
    render(
      <HbcSeedUploader config={config} onFileLoaded={onFileLoaded} />
    );

    const dropZone = screen.getByTestId('hbc-seed-uploader');

    fireEvent.dragOver(dropZone, { preventDefault: vi.fn() });
    expect(dropZone.className).toContain('dragging');

    fireEvent.dragLeave(dropZone);
    expect(dropZone.className).not.toContain('dragging');
  });

  it('handles file drop', async () => {
    render(
      <HbcSeedUploader config={config} onFileLoaded={onFileLoaded} />
    );

    const dropZone = screen.getByTestId('hbc-seed-uploader');
    const csvFile = new File(['data'], 'test.csv', { type: 'text/csv' });

    fireEvent.drop(dropZone, {
      preventDefault: vi.fn(),
      dataTransfer: { files: [csvFile] },
    });

    await screen.findByTestId('hbc-seed-uploader-ready');
    expect(onFileLoaded).toHaveBeenCalled();
  });

  it('handles xlsx file format', async () => {
    const xlsxConfig = createMockSeedConfig({ acceptedFormats: ['xlsx'] });
    render(
      <HbcSeedUploader config={xlsxConfig} onFileLoaded={onFileLoaded} />
    );

    const input = screen.getByTestId('hbc-seed-uploader-input');
    const xlsxFile = new File(['data'], 'test.xlsx', {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });

    await fireEvent.change(input, { target: { files: [xlsxFile] } });

    await screen.findByTestId('hbc-seed-uploader-ready');
    expect(screen.getByText('XLSX')).toBeDefined();
  });

  it('handles json/procore-export format', async () => {
    const jsonConfig = createMockSeedConfig({ acceptedFormats: ['json', 'procore-export'] });
    render(
      <HbcSeedUploader config={jsonConfig} onFileLoaded={onFileLoaded} />
    );

    const input = screen.getByTestId('hbc-seed-uploader-input');
    const jsonFile = new File(['{}'], 'export.json', { type: 'application/json' });

    await fireEvent.change(input, { target: { files: [jsonFile] } });

    await screen.findByTestId('hbc-seed-uploader-ready');
    expect(screen.getByText('Procore Export')).toBeDefined();
  });

  it('shows error on large file without uploadFile callback', async () => {
    render(
      <HbcSeedUploader config={config} onFileLoaded={onFileLoaded} />
    );

    const input = screen.getByTestId('hbc-seed-uploader-input');
    const largeFile = new File(['x'], 'large.csv', { type: 'text/csv' });
    Object.defineProperty(largeFile, 'size', { value: 11 * 1024 * 1024 });

    await fireEvent.change(input, { target: { files: [largeFile] } });

    expect(await screen.findByTestId('hbc-seed-uploader-error')).toBeDefined();
  });

  it('handles large file with uploadFile callback', async () => {
    const uploadFile = vi.fn().mockResolvedValue({
      documentId: 'doc-001',
      sharepointUrl: 'https://sp.example.com/doc',
    });
    const onLargeFileUploaded = vi.fn();

    render(
      <HbcSeedUploader
        config={config}
        onFileLoaded={onFileLoaded}
        uploadFile={uploadFile}
        onLargeFileUploaded={onLargeFileUploaded}
      />
    );

    const input = screen.getByTestId('hbc-seed-uploader-input');
    const largeFile = new File(['x'], 'large.csv', { type: 'text/csv' });
    Object.defineProperty(largeFile, 'size', { value: 11 * 1024 * 1024 });

    await fireEvent.change(input, { target: { files: [largeFile] } });

    await screen.findByTestId('hbc-seed-uploader-ready');
    expect(uploadFile).toHaveBeenCalled();
    expect(onLargeFileUploaded).toHaveBeenCalled();
  });

  it('replace button resets to idle and opens file picker', async () => {
    render(
      <HbcSeedUploader config={config} onFileLoaded={onFileLoaded} />
    );

    const input = screen.getByTestId('hbc-seed-uploader-input');
    const csvFile = new File(['data'], 'test.csv', { type: 'text/csv' });

    await fireEvent.change(input, { target: { files: [csvFile] } });
    await screen.findByTestId('hbc-seed-uploader-ready');

    const replaceButton = screen.getByTestId('hbc-seed-uploader-replace-button');
    fireEvent.click(replaceButton);

    // After clicking replace, the uploader resets to idle
    await waitFor(() => {
      expect(screen.getByTestId('hbc-seed-uploader-browse-button')).toBeDefined();
    });
  });

  it('retry button on error resets to idle', async () => {
    render(
      <HbcSeedUploader config={config} onFileLoaded={onFileLoaded} />
    );

    const input = screen.getByTestId('hbc-seed-uploader-input');
    const pdfFile = new File(['data'], 'test.pdf', { type: 'application/pdf' });

    await fireEvent.change(input, { target: { files: [pdfFile] } });

    const retryButton = await screen.findByTestId('hbc-seed-uploader-retry-button');
    fireEvent.click(retryButton);

    await waitFor(() => {
      expect(screen.getByTestId('hbc-seed-uploader-browse-button')).toBeDefined();
    });
  });

  it('shows error with generic message when large file upload throws non-Error', async () => {
    const uploadFile = vi.fn().mockRejectedValue('non-error-string');

    render(
      <HbcSeedUploader
        config={config}
        onFileLoaded={onFileLoaded}
        uploadFile={uploadFile}
      />
    );

    const input = screen.getByTestId('hbc-seed-uploader-input');
    const largeFile = new File(['x'], 'large.csv', { type: 'text/csv' });
    Object.defineProperty(largeFile, 'size', { value: 11 * 1024 * 1024 });

    await fireEvent.change(input, { target: { files: [largeFile] } });

    expect(await screen.findByTestId('hbc-seed-uploader-error')).toBeDefined();
    expect(screen.getByText(/Unknown error/)).toBeDefined();
  });

  it('shows error when large file upload fails', async () => {
    const uploadFile = vi.fn().mockRejectedValue(new Error('Upload timeout'));

    render(
      <HbcSeedUploader
        config={config}
        onFileLoaded={onFileLoaded}
        uploadFile={uploadFile}
      />
    );

    const input = screen.getByTestId('hbc-seed-uploader-input');
    const largeFile = new File(['x'], 'large.csv', { type: 'text/csv' });
    Object.defineProperty(largeFile, 'size', { value: 11 * 1024 * 1024 });

    await fireEvent.change(input, { target: { files: [largeFile] } });

    expect(await screen.findByTestId('hbc-seed-uploader-error')).toBeDefined();
    expect(screen.getByText(/Upload failed/)).toBeDefined();
  });

  it('shows generic parse error when parser throws non-Error', async () => {
    const { CsvParser } = await vi.importMock<typeof import('../../parsers/CsvParser')>('../../parsers/CsvParser');
    CsvParser.parse.mockRejectedValueOnce('non-error-string');

    render(
      <HbcSeedUploader config={config} onFileLoaded={onFileLoaded} />
    );

    const input = screen.getByTestId('hbc-seed-uploader-input');
    const csvFile = new File(['bad'], 'test.csv', { type: 'text/csv' });

    await fireEvent.change(input, { target: { files: [csvFile] } });

    const errorEl = await screen.findByTestId('hbc-seed-uploader-error');
    expect(errorEl.textContent).toContain('Failed to parse file');
  });

  it('shows parse error when parser throws', async () => {
    const { CsvParser } = await vi.importMock<typeof import('../../parsers/CsvParser')>('../../parsers/CsvParser');
    CsvParser.parse.mockRejectedValueOnce(new Error('Malformed CSV'));

    render(
      <HbcSeedUploader config={config} onFileLoaded={onFileLoaded} />
    );

    const input = screen.getByTestId('hbc-seed-uploader-input');
    const csvFile = new File(['bad'], 'test.csv', { type: 'text/csv' });

    await fireEvent.change(input, { target: { files: [csvFile] } });

    expect(await screen.findByTestId('hbc-seed-uploader-error')).toBeDefined();
  });
});
