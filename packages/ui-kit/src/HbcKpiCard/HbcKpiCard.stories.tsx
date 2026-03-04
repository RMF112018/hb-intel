/**
 * HbcKpiCard — Storybook stories
 * PH4.7 §7.3 | Blueprint §1d
 */
import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { HbcKpiCard } from './index.js';

const meta: Meta<typeof HbcKpiCard> = {
  title: 'Components/HbcKpiCard',
  component: HbcKpiCard,
  parameters: { layout: 'padded' },
};

export default meta;
type Story = StoryObj<typeof HbcKpiCard>;

export const Default: Story = {
  args: {
    label: 'Total RFIs',
    value: 142,
    color: '#004B87',
  },
};

export const AllTrends: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
      <HbcKpiCard
        label="Revenue"
        value="$2.4M"
        trend={{ direction: 'up', label: '+12% MoM' }}
        color="#00C896"
      />
      <HbcKpiCard
        label="Overdue Items"
        value={23}
        trend={{ direction: 'down', label: '-5 this week' }}
        color="#FF4D4D"
      />
      <HbcKpiCard
        label="In Progress"
        value={67}
        trend={{ direction: 'flat', label: 'No change' }}
        color="#FFB020"
      />
    </div>
  ),
};

export const ActiveState: Story = {
  render: () => {
    const [activeId, setActiveId] = React.useState<string | null>(null);
    const cards = [
      { id: 'open', label: 'Open', value: 42, color: '#3B9FFF' },
      { id: 'closed', label: 'Closed', value: 98, color: '#00C896' },
      { id: 'draft', label: 'Draft', value: 15, color: '#8B95A5' },
    ];
    return (
      <div style={{ display: 'flex', gap: 16 }}>
        {cards.map((c) => (
          <HbcKpiCard
            key={c.id}
            label={c.label}
            value={c.value}
            color={c.color}
            isActive={activeId === c.id}
            onClick={() => setActiveId(activeId === c.id ? null : c.id)}
          />
        ))}
      </div>
    );
  },
};

export const AllVariants: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div>
        <p style={{ fontSize: 12, fontWeight: 600, marginBottom: 8 }}>Trend directions</p>
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
          <HbcKpiCard label="Revenue" value="$2.4M" trend={{ direction: 'up', label: '+12%' }} color="#00C896" />
          <HbcKpiCard label="Overdue" value={23} trend={{ direction: 'down', label: '-5' }} color="#FF4D4D" />
          <HbcKpiCard label="In Progress" value={67} trend={{ direction: 'flat', label: 'No change' }} color="#FFB020" />
        </div>
      </div>
      <div>
        <p style={{ fontSize: 12, fontWeight: 600, marginBottom: 8 }}>Active/clickable state</p>
        <div style={{ display: 'flex', gap: 16 }}>
          <HbcKpiCard label="Open" value={42} color="#3B9FFF" isActive onClick={() => {}} />
          <HbcKpiCard label="Closed" value={98} color="#00C896" onClick={() => {}} />
          <HbcKpiCard label="Draft" value={15} color="#8B95A5" onClick={() => {}} />
        </div>
      </div>
      <div>
        <p style={{ fontSize: 12, fontWeight: 600, marginBottom: 8 }}>Plain (no trend)</p>
        <HbcKpiCard label="Total RFIs" value={142} color="#004B87" />
      </div>
    </div>
  ),
};

export const A11yTest: Story = {
  render: () => (
    <div>
      <p style={{ fontSize: '0.875rem', color: '#605E5C', marginBottom: '12px' }}>
        Clickable cards are keyboard focusable. Tab to navigate, Enter/Space to activate.
        Trend indicators have aria-label for screen readers.
      </p>
      <div style={{ display: 'flex', gap: 16 }}>
        <HbcKpiCard label="Open" value={42} color="#3B9FFF" onClick={() => {}} />
        <HbcKpiCard label="Closed" value={98} color="#00C896" trend={{ direction: 'up', label: '+5%' }} />
      </div>
    </div>
  ),
};

export const FieldMode: Story = {
  parameters: { backgrounds: { default: 'dark' } },
  args: {
    label: 'Buyout Progress',
    value: '78%',
    trend: { direction: 'up', label: '+3% this week' },
    color: '#F37021',
  },
};
