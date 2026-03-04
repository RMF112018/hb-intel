/**
 * HbcCard Stories — PH4.8 §Step 3
 */
import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { HbcCard } from './index.js';

const meta: Meta<typeof HbcCard> = {
  title: 'Surfaces/HbcCard',
  component: HbcCard,
  parameters: { layout: 'padded' },
};
export default meta;

type Story = StoryObj<typeof HbcCard>;

export const Default: Story = {
  render: () => (
    <HbcCard>
      <p style={{ margin: 0 }}>Basic card with Level 1 elevation shadow.</p>
    </HbcCard>
  ),
};

export const WithHeaderFooter: Story = {
  render: () => (
    <HbcCard
      header={<strong>Card Header</strong>}
      footer={
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
          <button type="button">Cancel</button>
          <button type="button">Save</button>
        </div>
      }
    >
      <p style={{ margin: 0 }}>Card body content with header and footer sections separated by border dividers.</p>
    </HbcCard>
  ),
};

export const AllVariants: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
      <div style={{ width: '280px' }}>
        <HbcCard>
          <p style={{ margin: 0 }}>Basic card</p>
        </HbcCard>
      </div>
      <div style={{ width: '280px' }}>
        <HbcCard header={<strong>With Header</strong>}>
          <p style={{ margin: 0 }}>Card with header</p>
        </HbcCard>
      </div>
      <div style={{ width: '280px' }}>
        <HbcCard
          header={<strong>Full Card</strong>}
          footer={
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
              <button type="button">Cancel</button>
              <button type="button">Save</button>
            </div>
          }
        >
          <p style={{ margin: 0 }}>Card with header and footer</p>
        </HbcCard>
      </div>
    </div>
  ),
};

export const A11yTest: Story = {
  render: () => (
    <div>
      <p style={{ fontSize: '0.875rem', color: '#605E5C', marginBottom: '16px' }}>
        Cards use semantic HTML. Interactive elements within cards are keyboard accessible.
        Elevation provides visual hierarchy.
      </p>
      <HbcCard
        header={<strong>Accessible Card</strong>}
        footer={
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
            <button type="button">Tab to me</button>
            <button type="button">And me</button>
          </div>
        }
      >
        <p style={{ margin: 0 }}>Tab through interactive elements within the card.</p>
      </HbcCard>
    </div>
  ),
};

export const FieldMode: Story = {
  render: () => (
    <div style={{ backgroundColor: '#0F1419', padding: '32px' }}>
      <HbcCard>
        <p style={{ margin: 0, color: '#E8EAED' }}>
          Card in a dark container simulating Field Mode.
        </p>
      </HbcCard>
    </div>
  ),
};

export const ElevatedStates: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
      <div style={{ width: '280px' }}>
        <HbcCard header={<strong>Level 1 (Default)</strong>}>
          <p style={{ margin: 0 }}>Standard card shadow</p>
        </HbcCard>
      </div>
      <div style={{ width: '280px' }}>
        <HbcCard
          header={<strong>Custom Shadow</strong>}
          className=""
        >
          <p style={{ margin: 0 }}>Override via className if needed</p>
        </HbcCard>
      </div>
    </div>
  ),
};
