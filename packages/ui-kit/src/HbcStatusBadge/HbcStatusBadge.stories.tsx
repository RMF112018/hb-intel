/**
 * HbcStatusBadge stories — PH4.6 §Step 1
 * V2.1 dual-channel: color + shape, FieldMode, A11y grayscale test
 */
import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { FluentProvider } from '@fluentui/react-components';
import { HbcStatusBadge } from './index.js';
import { hbcFieldTheme } from '../theme/theme.js';
import type { StatusVariant } from './types.js';

const meta: Meta<typeof HbcStatusBadge> = {
  title: 'Components/HbcStatusBadge',
  component: HbcStatusBadge,
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: [
        'success', 'warning', 'error', 'info', 'neutral',
        'onTrack', 'atRisk', 'critical', 'pending', 'inProgress',
        'completed', 'draft',
      ],
    },
    size: { control: 'select', options: ['small', 'medium', 'large'] },
  },
};

export default meta;
type Story = StoryObj<typeof HbcStatusBadge>;

export const Default: Story = {
  args: { variant: 'success', label: 'On Track' },
};

/**
 * PH4C.6 semantic status stories rendered through the existing variant/label API.
 * This preserves backward compatibility while validating the required eight status classes.
 */
export const Active: Story = {
  args: { variant: 'onTrack', label: 'Active' },
};

export const Pending: Story = {
  args: { variant: 'pending', label: 'Pending' },
};

export const AtRisk: Story = {
  args: { variant: 'atRisk', label: 'At Risk' },
};

export const Complete: Story = {
  args: { variant: 'completed', label: 'Complete' },
};

export const Inactive: Story = {
  args: { variant: 'neutral', label: 'Inactive' },
};

export const Warning: Story = {
  args: { variant: 'warning', label: 'Warning' },
};

export const Draft: Story = {
  args: { variant: 'draft', label: 'Draft' },
};

export const Approved: Story = {
  args: { variant: 'success', label: 'Approved' },
};

const ALL_VARIANTS: StatusVariant[] = [
  'success', 'warning', 'error', 'info', 'neutral',
  'onTrack', 'atRisk', 'critical', 'pending', 'inProgress',
  'completed', 'draft',
];

const HIGH_CONTRAST_VARIANTS: Array<{ variant: StatusVariant; label: string }> = [
  { variant: 'onTrack', label: 'Active' },
  { variant: 'pending', label: 'Pending' },
  { variant: 'atRisk', label: 'At Risk' },
  { variant: 'completed', label: 'Complete' },
  { variant: 'neutral', label: 'Inactive' },
  { variant: 'warning', label: 'Warning' },
  { variant: 'draft', label: 'Draft' },
  { variant: 'success', label: 'Approved' },
];

export const AllVariants: Story = {
  render: () => (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
      {ALL_VARIANTS.map((v) => (
        <HbcStatusBadge key={v} variant={v} label={v} />
      ))}
    </div>
  ),
};

export const FieldMode: Story = {
  render: () => (
    <FluentProvider theme={hbcFieldTheme}>
      <div style={{ padding: '24px', backgroundColor: '#0F1419' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          {ALL_VARIANTS.map((v) => (
            <HbcStatusBadge key={v} variant={v} label={v} />
          ))}
        </div>
      </div>
    </FluentProvider>
  ),
};

export const A11yTest: Story = {
  name: 'A11y Test (Grayscale)',
  render: () => (
    <div>
      <p style={{ marginBottom: '16px', fontSize: '0.875rem', color: '#605E5C' }}>
        Grayscale filter applied — icons provide shape distinction independent of color.
      </p>
      <div style={{ filter: 'grayscale(100%)', display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
        {ALL_VARIANTS.map((v) => (
          <HbcStatusBadge key={v} variant={v} label={v} />
        ))}
      </div>
    </div>
  ),
};

/**
 * High-Contrast Mode Support Story
 *
 * This story demonstrates the StatusBadge under Windows High Contrast Mode.
 * Users with visual impairments or accessibility preferences can enable
 * high-contrast mode in Windows settings, and all status badges will
 * automatically adapt using the forced-colors media query.
 *
 * To test: Windows Settings -> Ease of Access -> High Contrast ->
 * Enable "High Contrast" and view this story in the browser.
 */
export const AllStatusesHighContrast: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
      {HIGH_CONTRAST_VARIANTS.map((entry) => (
        <HbcStatusBadge key={`${entry.variant}-${entry.label}`} variant={entry.variant} label={entry.label} />
      ))}
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'All status variants rendered together. Enable Windows High Contrast mode to verify forced-colors styles are applied correctly.',
      },
    },
  },
};
