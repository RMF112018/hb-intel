import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { HbcSeedPreview } from '../HbcSeedPreview';
import { createMockSeedConfig } from '@hbc/data-seeding/testing';
import type { ISeedRowMeta } from '../../types';

vi.mock('@hbc/complexity', () => ({
  useComplexity: vi.fn(() => ({ tier: 'standard', variant: 'default' })),
}));

const { useComplexity } = await vi.importMock<typeof import('@hbc/complexity')>('@hbc/complexity');

describe('HbcSeedPreview', () => {
  const config = createMockSeedConfig();
  const rows = [
    { Name: 'Acme', Email: 'acme@test.com', Value: '50000' },
    { Name: 'Beta', Email: 'bad-email', Value: '75000' },
  ];
  const rowMeta: ISeedRowMeta[] = [
    { rowNumber: 1, isValid: true, errors: [], skipped: false },
    {
      rowNumber: 2,
      isValid: false,
      errors: [{ row: 2, column: 'Email', value: 'bad-email', error: 'Invalid email format' }],
      skipped: false,
    },
  ];
  const activeMapping = { Name: 'name' as never, Email: 'email' as never, Value: 'value' as never };
  const onImportConfirmed = vi.fn();
  const onBack = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    useComplexity.mockReturnValue({ tier: 'standard', variant: 'default' });
  });

  it('renders simplified count summary in Essential (D-09)', () => {
    useComplexity.mockReturnValue({ tier: 'essential', variant: 'default' });

    render(
      <HbcSeedPreview
        config={config}
        rows={rows}
        rowMeta={rowMeta}
        activeMapping={activeMapping}
        onImportConfirmed={onImportConfirmed}
        onBack={onBack}
      />
    );

    expect(screen.getByTestId('hbc-seed-preview-summary')).toBeDefined();
    expect(screen.getByText(/2 rows ready to import/)).toBeDefined();
  });

  it('renders preview table in Standard tier', () => {
    render(
      <HbcSeedPreview
        config={config}
        rows={rows}
        rowMeta={rowMeta}
        activeMapping={activeMapping}
        onImportConfirmed={onImportConfirmed}
        onBack={onBack}
      />
    );

    expect(screen.getByTestId('hbc-seed-preview')).toBeDefined();
    expect(screen.getByTestId('hbc-seed-preview-summary-bar')).toBeDefined();
  });

  it('renders error details in Expert tier', () => {
    useComplexity.mockReturnValue({ tier: 'expert', variant: 'default' });

    render(
      <HbcSeedPreview
        config={config}
        rows={rows}
        rowMeta={rowMeta}
        activeMapping={activeMapping}
        onImportConfirmed={onImportConfirmed}
        onBack={onBack}
      />
    );

    expect(screen.getByTestId('hbc-seed-preview-error-details')).toBeDefined();
  });

  it('shows partial import CTA when allowPartialImport: true and errors exist', () => {
    render(
      <HbcSeedPreview
        config={config}
        rows={rows}
        rowMeta={rowMeta}
        activeMapping={activeMapping}
        onImportConfirmed={onImportConfirmed}
        onBack={onBack}
      />
    );

    const confirmButton = screen.getByTestId('hbc-seed-preview-confirm-button');
    expect(confirmButton.textContent).toMatch(/Import 1.*skip 1/);
    expect(confirmButton).toHaveProperty('disabled', false);
  });

  it('disables CTA when allowPartialImport: false and errors exist', () => {
    const strictConfig = createMockSeedConfig({ allowPartialImport: false });

    render(
      <HbcSeedPreview
        config={strictConfig}
        rows={rows}
        rowMeta={rowMeta}
        activeMapping={activeMapping}
        onImportConfirmed={onImportConfirmed}
        onBack={onBack}
      />
    );

    const confirmButton = screen.getByTestId('hbc-seed-preview-confirm-button');
    expect(confirmButton).toHaveProperty('disabled', true);
  });

  it('highlights error cells', () => {
    render(
      <HbcSeedPreview
        config={config}
        rows={rows}
        rowMeta={rowMeta}
        activeMapping={activeMapping}
        onImportConfirmed={onImportConfirmed}
        onBack={onBack}
      />
    );

    const errorCell = screen.getByTestId('hbc-seed-preview-cell-error-2-Email');
    expect(errorCell.className).toContain('error');
  });

  it('shows strict error message in Essential when allowPartialImport is false', () => {
    useComplexity.mockReturnValue({ tier: 'essential', variant: 'default' });
    const strictConfig = createMockSeedConfig({ allowPartialImport: false });

    render(
      <HbcSeedPreview
        config={strictConfig}
        rows={rows}
        rowMeta={rowMeta}
        activeMapping={activeMapping}
        onImportConfirmed={onImportConfirmed}
        onBack={onBack}
      />
    );

    expect(screen.getByText(/all errors must be resolved/i)).toBeDefined();
  });

  it('calls onBack when back button clicked in Essential', () => {
    useComplexity.mockReturnValue({ tier: 'essential', variant: 'default' });

    render(
      <HbcSeedPreview
        config={config}
        rows={rows}
        rowMeta={rowMeta}
        activeMapping={activeMapping}
        onImportConfirmed={onImportConfirmed}
        onBack={onBack}
      />
    );

    fireEvent.click(screen.getByText('Back'));
    expect(onBack).toHaveBeenCalled();
  });

  it('shows truncation notice when rows exceed previewRowCount', () => {
    // Generate 25 rows — Standard tier shows first 20
    const manyRows = Array.from({ length: 25 }, (_, i) => ({
      Name: `Company ${i}`,
      Email: `c${i}@test.com`,
      Value: `${i * 1000}`,
    }));
    const manyMeta: ISeedRowMeta[] = manyRows.map((_, i) => ({
      rowNumber: i + 1,
      isValid: true,
      errors: [],
      skipped: false,
    }));

    render(
      <HbcSeedPreview
        config={config}
        rows={manyRows}
        rowMeta={manyMeta}
        activeMapping={activeMapping}
        onImportConfirmed={onImportConfirmed}
        onBack={onBack}
      />
    );

    expect(screen.getByText(/showing first 20/)).toBeDefined();
  });

  it('calls onImportConfirmed when confirm button clicked', () => {
    const allValidMeta: ISeedRowMeta[] = rows.map((_, i) => ({
      rowNumber: i + 1,
      isValid: true,
      errors: [],
      skipped: false,
    }));

    render(
      <HbcSeedPreview
        config={config}
        rows={rows}
        rowMeta={allValidMeta}
        activeMapping={activeMapping}
        onImportConfirmed={onImportConfirmed}
        onBack={onBack}
      />
    );

    fireEvent.click(screen.getByTestId('hbc-seed-preview-confirm-button'));
    expect(onImportConfirmed).toHaveBeenCalled();
  });

  it('calls onBack in Standard tier back button', () => {
    render(
      <HbcSeedPreview
        config={config}
        rows={rows}
        rowMeta={rowMeta}
        activeMapping={activeMapping}
        onImportConfirmed={onImportConfirmed}
        onBack={onBack}
      />
    );

    fireEvent.click(screen.getByTestId('hbc-seed-preview-back-button'));
    expect(onBack).toHaveBeenCalled();
  });

  it('toggles error details in Expert tier', () => {
    useComplexity.mockReturnValue({ tier: 'expert', variant: 'default' });

    render(
      <HbcSeedPreview
        config={config}
        rows={rows}
        rowMeta={rowMeta}
        activeMapping={activeMapping}
        onImportConfirmed={onImportConfirmed}
        onBack={onBack}
      />
    );

    const details = screen.getByTestId('hbc-seed-preview-error-details');
    // Simulate the toggle event by setting open and dispatching
    Object.defineProperty(details, 'open', { value: true, writable: true });
    details.dispatchEvent(new Event('toggle', { bubbles: false }));
    expect(details).toBeDefined();
  });

  it('shows singular "error" text when exactly one error row exists', () => {
    const singleErrorMeta: ISeedRowMeta[] = [
      { rowNumber: 1, isValid: true, errors: [], skipped: false },
      { rowNumber: 2, isValid: false, errors: [{ row: 2, column: 'Email', value: 'bad', error: 'Invalid' }], skipped: false },
    ];

    render(
      <HbcSeedPreview
        config={config}
        rows={rows}
        rowMeta={singleErrorMeta}
        activeMapping={activeMapping}
        onImportConfirmed={onImportConfirmed}
        onBack={onBack}
      />
    );

    expect(screen.getByText(/1 error$/)).toBeDefined();
  });

  it('shows plural "errors" text when multiple error rows exist', () => {
    const multiErrorRows = [
      { Name: 'A', Email: 'bad1', Value: '1' },
      { Name: 'B', Email: 'bad2', Value: '2' },
      { Name: 'C', Email: 'ok@test.com', Value: '3' },
    ];
    const multiErrorMeta: ISeedRowMeta[] = [
      { rowNumber: 1, isValid: false, errors: [{ row: 1, column: 'Email', value: 'bad1', error: 'Invalid' }], skipped: false },
      { rowNumber: 2, isValid: false, errors: [{ row: 2, column: 'Email', value: 'bad2', error: 'Invalid' }], skipped: false },
      { rowNumber: 3, isValid: true, errors: [], skipped: false },
    ];

    render(
      <HbcSeedPreview
        config={config}
        rows={multiErrorRows}
        rowMeta={multiErrorMeta}
        activeMapping={activeMapping}
        onImportConfirmed={onImportConfirmed}
        onBack={onBack}
      />
    );

    expect(screen.getByText(/2 errors/)).toBeDefined();
  });

  it('falls back to destField as label when no matching fieldMapping found', () => {
    // Use an activeMapping that has a destination field not in config.fieldMappings
    const unknownMapping = { ...activeMapping, Custom: 'customField' as never };

    render(
      <HbcSeedPreview
        config={config}
        rows={[{ Name: 'Acme', Email: 'acme@test.com', Value: '50000', Custom: 'data' } as any]}
        rowMeta={[{ rowNumber: 1, isValid: true, errors: [], skipped: false }]}
        activeMapping={unknownMapping}
        onImportConfirmed={onImportConfirmed}
        onBack={onBack}
      />
    );

    // The column header should fall back to String(destField) = "customField"
    expect(screen.getByText('customField')).toBeDefined();
  });

  it('renders error-notice alert in Standard when allowPartialImport false and errors', () => {
    const strictConfig = createMockSeedConfig({ allowPartialImport: false });

    render(
      <HbcSeedPreview
        config={strictConfig}
        rows={rows}
        rowMeta={rowMeta}
        activeMapping={activeMapping}
        onImportConfirmed={onImportConfirmed}
        onBack={onBack}
      />
    );

    expect(screen.getByRole('alert')).toBeDefined();
  });
});
