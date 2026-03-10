import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import { HbcSeedProgress } from '../HbcSeedProgress';

const completeResult = {
  totalRows: 50,
  successCount: 50,
  errorCount: 0,
  skippedCount: 0,
  errors: [],
  importedAt: '2026-01-15T10:00:00Z',
  importedBy: 'user-001',
  sourceDocumentId: 'doc-001',
  sourceDocumentUrl: 'https://sp.example.com/doc',
};

const partialResult = {
  totalRows: 50,
  successCount: 45,
  errorCount: 5,
  skippedCount: 0,
  errors: Array.from({ length: 5 }, (_, i) => ({
    row: i * 10 + 3,
    column: 'Email',
    value: `bad-${i}`,
    error: 'Invalid email format',
  })),
  importedAt: '2026-01-15T10:00:00Z',
  importedBy: 'user-001',
  sourceDocumentId: 'doc-001',
  sourceDocumentUrl: 'https://sp.example.com/doc',
};

const meta: Meta<typeof HbcSeedProgress> = {
  title: 'Data Seeding/HbcSeedProgress',
  component: HbcSeedProgress,
  parameters: {
    layout: 'centered',
  },
};

export default meta;
type Story = StoryObj<typeof HbcSeedProgress>;

export const Importing: Story = {
  args: {
    totalRows: 100,
    importedRows: 45,
    errorRows: 3,
    status: 'importing',
    result: null,
    onReset: () => console.log('Reset'),
  },
};

export const Complete: Story = {
  args: {
    totalRows: 50,
    importedRows: 50,
    errorRows: 0,
    status: 'complete',
    result: completeResult,
    onReset: () => console.log('Reset'),
  },
};

export const Partial: Story = {
  args: {
    totalRows: 50,
    importedRows: 45,
    errorRows: 5,
    status: 'partial',
    result: partialResult,
    onRetryErrors: () => console.log('Retry'),
    onReset: () => console.log('Reset'),
  },
};

export const Failed: Story = {
  args: {
    totalRows: 50,
    importedRows: 0,
    errorRows: 50,
    status: 'failed',
    result: { ...completeResult, successCount: 0, errorCount: 50 },
    onReset: () => console.log('Reset'),
  },
};
