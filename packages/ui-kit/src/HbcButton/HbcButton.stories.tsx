/**
 * HbcButton stories — PH4.6 §Step 6
 * 4 variants × 3 sizes, FieldMode, A11y (focus ring + keyboard)
 */
import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { FluentProvider } from '@fluentui/react-components';
import { HbcButton } from './index.js';
import { hbcFieldTheme } from '../theme/theme.js';
import { Create, Download } from '../icons/index.js';
import type { ButtonVariant, ButtonSize } from './types.js';

const meta: Meta<typeof HbcButton> = {
  title: 'Components/HbcButton',
  component: HbcButton,
  argTypes: {
    variant: { control: 'select', options: ['primary', 'secondary', 'ghost', 'danger'] },
    size: { control: 'select', options: ['sm', 'md', 'lg'] },
    loading: { control: 'boolean' },
    disabled: { control: 'boolean' },
    fullWidth: { control: 'boolean' },
  },
};

export default meta;
type Story = StoryObj<typeof HbcButton>;

export const Default: Story = {
  args: { variant: 'primary', children: 'Create Project' },
};

const VARIANTS: ButtonVariant[] = ['primary', 'secondary', 'ghost', 'danger'];
const SIZES: ButtonSize[] = ['sm', 'md', 'lg'];

export const AllVariants: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {VARIANTS.map((variant) => (
        <div key={variant} style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <span style={{ width: '80px', fontSize: '0.75rem', color: '#6B7280' }}>{variant}</span>
          {SIZES.map((size) => (
            <HbcButton key={`${variant}-${size}`} variant={variant} size={size}>
              {size.toUpperCase()} Button
            </HbcButton>
          ))}
          <HbcButton variant={variant} loading>Loading</HbcButton>
          <HbcButton variant={variant} disabled>Disabled</HbcButton>
          <HbcButton variant={variant} icon={<Create size="sm" />}>With Icon</HbcButton>
          <HbcButton variant={variant} icon={<Download size="sm" />} iconPosition="after">Icon After</HbcButton>
        </div>
      ))}
    </div>
  ),
};

export const FieldMode: Story = {
  render: () => (
    <FluentProvider theme={hbcFieldTheme}>
      <div style={{ padding: '24px', backgroundColor: '#0F1419' }}>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {VARIANTS.map((variant) => (
            <HbcButton key={variant} variant={variant}>
              {variant}
            </HbcButton>
          ))}
        </div>
      </div>
    </FluentProvider>
  ),
};

export const A11yTest: Story = {
  name: 'A11y Test (Focus Ring + Keyboard)',
  render: () => (
    <div>
      <p style={{ marginBottom: '16px', fontSize: '0.875rem', color: '#605E5C' }}>
        Tab through buttons to verify 2px focus ring. Press Enter/Space to activate.
        On touch devices, sizes auto-scale up one tier (V2.1 Dec 31).
      </p>
      <div style={{ display: 'flex', gap: '8px' }}>
        <HbcButton variant="primary">Tab to me</HbcButton>
        <HbcButton variant="secondary">Then me</HbcButton>
        <HbcButton variant="ghost">And me</HbcButton>
        <HbcButton variant="danger">Then me</HbcButton>
      </div>
    </div>
  ),
};
