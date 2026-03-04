/**
 * HbcTypography stories — PH4.6 §Step 3
 * All 9 intents, FieldMode, A11y
 */
import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { FluentProvider } from '@fluentui/react-components';
import { HbcTypography } from './index.js';
import { hbcFieldTheme } from '../theme/theme.js';
import type { TypographyIntent } from './types.js';

const meta: Meta<typeof HbcTypography> = {
  title: 'Components/HbcTypography',
  component: HbcTypography,
  argTypes: {
    intent: {
      control: 'select',
      options: ['display', 'heading1', 'heading2', 'heading3', 'heading4', 'body', 'bodySmall', 'label', 'code'],
    },
    truncate: { control: 'boolean' },
  },
};

export default meta;
type Story = StoryObj<typeof HbcTypography>;

export const Default: Story = {
  args: { intent: 'heading1', children: 'HB Intel Typography' },
};

const ALL_INTENTS: TypographyIntent[] = [
  'display', 'heading1', 'heading2', 'heading3', 'heading4',
  'body', 'bodySmall', 'label', 'code',
];

export const AllVariants: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      {ALL_INTENTS.map((intent) => (
        <HbcTypography key={intent} intent={intent}>
          {intent} — The quick brown fox jumps over the lazy dog
        </HbcTypography>
      ))}
    </div>
  ),
};

export const FieldMode: Story = {
  render: () => (
    <FluentProvider theme={hbcFieldTheme}>
      <div style={{ padding: '24px', backgroundColor: '#0F1419' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {ALL_INTENTS.map((intent) => (
            <HbcTypography key={intent} intent={intent} color="#E8EAED">
              {intent} — Field Mode typography
            </HbcTypography>
          ))}
        </div>
      </div>
    </FluentProvider>
  ),
};

export const A11yTest: Story = {
  name: 'A11y Test (Semantic HTML)',
  render: () => (
    <div>
      <p style={{ marginBottom: '16px', fontSize: '0.875rem', color: '#605E5C' }}>
        Each intent renders a semantic HTML element by default (h1–h5, p, span, code).
        Override with the <code>as</code> prop.
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <HbcTypography intent="display">display → &lt;h1&gt;</HbcTypography>
        <HbcTypography intent="heading1">heading1 → &lt;h2&gt;</HbcTypography>
        <HbcTypography intent="heading2">heading2 → &lt;h3&gt;</HbcTypography>
        <HbcTypography intent="heading3">heading3 → &lt;h4&gt;</HbcTypography>
        <HbcTypography intent="heading4">heading4 → &lt;h5&gt;</HbcTypography>
        <HbcTypography intent="body">body → &lt;p&gt;</HbcTypography>
        <HbcTypography intent="bodySmall">bodySmall → &lt;p&gt;</HbcTypography>
        <HbcTypography intent="label">label → &lt;span&gt;</HbcTypography>
        <HbcTypography intent="code">code → &lt;code&gt;</HbcTypography>
        <HbcTypography intent="body" as="blockquote">body as=&quot;blockquote&quot; override</HbcTypography>
      </div>
    </div>
  ),
};
