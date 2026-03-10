import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import { HbcSeedMapper } from '../HbcSeedMapper';

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

const meta: Meta<typeof HbcSeedMapper> = {
  title: 'Data Seeding/HbcSeedMapper',
  component: HbcSeedMapper,
  parameters: {
    layout: 'centered',
  },
};

export default meta;
type Story = StoryObj<typeof HbcSeedMapper>;

export const AutoMapped: Story = {
  args: {
    config: config as any,
    detectedHeaders: ['Company Name', 'Contact Email', 'Amount'],
    autoMapping: { 'Company Name': 'name', 'Contact Email': 'email' } as any,
    onMappingConfirmed: () => console.log('Mapping confirmed'),
  },
};

export const RequiredUnmapped: Story = {
  args: {
    config: config as any,
    detectedHeaders: ['Col A', 'Col B', 'Col C'],
    autoMapping: {} as any,
    onMappingConfirmed: () => console.log('Mapping confirmed'),
  },
};

export const AllMapped: Story = {
  args: {
    config: config as any,
    detectedHeaders: ['Name', 'Email Address', 'Numeric Value'],
    autoMapping: { Name: 'name', 'Email Address': 'email', 'Numeric Value': 'value' } as any,
    onMappingConfirmed: () => console.log('Mapping confirmed'),
  },
};
