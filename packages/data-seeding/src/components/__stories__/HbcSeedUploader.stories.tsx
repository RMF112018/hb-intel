import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import { HbcSeedUploader } from '../HbcSeedUploader';
import { createMockSeedConfig } from '../../testing/../../../testing/createMockSeedConfig';

// NOTE: Use direct relative import since Storybook doesn't use vitest aliases

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

const meta: Meta<typeof HbcSeedUploader> = {
  title: 'Data Seeding/HbcSeedUploader',
  component: HbcSeedUploader,
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    disabled: { control: 'boolean' },
  },
};

export default meta;
type Story = StoryObj<typeof HbcSeedUploader>;

export const Default: Story = {
  args: {
    config: config as any,
    onFileLoaded: () => console.log('File loaded'),
    disabled: false,
  },
};

export const Disabled: Story = {
  args: {
    ...Default.args,
    disabled: true,
  },
};
