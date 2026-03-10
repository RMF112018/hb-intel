import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import { HbcSeedPreview } from '../HbcSeedPreview';
import type { ISeedRowMeta } from '../../types';

const config = {
  name: 'BD Active Leads',
  recordType: 'bd-lead',
  acceptedFormats: ['xlsx', 'csv'] as const,
  autoMapHeaders: true,
  allowPartialImport: true,
  batchSize: 50,
  fieldMappings: [
    { sourceColumn: 'Name', destinationField: 'name', label: 'Name', required: true },
    { sourceColumn: 'Email', destinationField: 'email', label: 'Email Address', required: false },
    { sourceColumn: 'Value', destinationField: 'value', label: 'Numeric Value', required: false },
  ],
};

function generateRows(count: number) {
  return Array.from({ length: count }, (_, i) => ({
    Name: `Company ${i + 1}`,
    Email: i % 7 === 0 ? 'bad-email' : `contact${i + 1}@example.com`,
    Value: String((i + 1) * 10000),
  }));
}

function generateRowMeta(rows: Record<string, string>[]): ISeedRowMeta[] {
  return rows.map((row, i) => {
    const errors = [];
    if (row.Email === 'bad-email') {
      errors.push({ row: i + 1, column: 'Email', value: 'bad-email', error: 'Invalid email format' });
    }
    return { rowNumber: i + 1, isValid: errors.length === 0, errors, skipped: false };
  });
}

const sampleRows = generateRows(30);
const sampleMeta = generateRowMeta(sampleRows);

const activeMapping = { Name: 'name', Email: 'email', Value: 'value' } as any;

const meta: Meta<typeof HbcSeedPreview> = {
  title: 'Data Seeding/HbcSeedPreview',
  component: HbcSeedPreview,
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;
type Story = StoryObj<typeof HbcSeedPreview>;

export const StandardWithErrors: Story = {
  args: {
    config: config as any,
    rows: sampleRows,
    rowMeta: sampleMeta,
    activeMapping,
    onImportConfirmed: () => console.log('Import confirmed'),
    onBack: () => console.log('Back'),
  },
};

export const AllValid: Story = {
  args: {
    config: config as any,
    rows: generateRows(10).map((r) => ({ ...r, Email: `valid${Math.random()}@test.com` })),
    rowMeta: Array.from({ length: 10 }, (_, i) => ({
      rowNumber: i + 1,
      isValid: true,
      errors: [],
      skipped: false,
    })),
    activeMapping,
    onImportConfirmed: () => console.log('Import confirmed'),
    onBack: () => console.log('Back'),
  },
};

export const PartialImportCta: Story = {
  args: {
    config: config as any,
    rows: sampleRows,
    rowMeta: sampleMeta,
    activeMapping,
    onImportConfirmed: () => console.log('Import confirmed'),
    onBack: () => console.log('Back'),
  },
};
