import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { HbcComplexityGate } from '../HbcComplexityGate';
import { ComplexityTestProvider } from '../../../testing/ComplexityTestProvider';

const meta: Meta<typeof HbcComplexityGate> = {
  title: 'Complexity/HbcComplexityGate',
  component: HbcComplexityGate,
};

export default meta;
type Story = StoryObj<typeof HbcComplexityGate>;

export const GateOpen_Standard: Story = {
  render: () => (
    <ComplexityTestProvider tier="standard">
      <HbcComplexityGate minTier="standard">
        <div style={{ padding: 16, background: '#e8f5e9' }}>
          Standard-gated content — visible at Standard tier
        </div>
      </HbcComplexityGate>
    </ComplexityTestProvider>
  ),
};

export const GateClosed_Essential: Story = {
  render: () => (
    <ComplexityTestProvider tier="essential">
      <HbcComplexityGate
        minTier="standard"
        fallback={<div style={{ padding: 16, background: '#fff3e0' }}>Fallback — upgrade to Standard to see this content</div>}
      >
        <div style={{ padding: 16, background: '#e8f5e9' }}>
          Standard-gated content — hidden at Essential tier
        </div>
      </HbcComplexityGate>
    </ComplexityTestProvider>
  ),
};

export const GateOpen_Expert: Story = {
  render: () => (
    <ComplexityTestProvider tier="expert">
      <HbcComplexityGate minTier="expert">
        <div style={{ padding: 16, background: '#e3f2fd' }}>
          Expert-gated content — visible at Expert tier
        </div>
      </HbcComplexityGate>
    </ComplexityTestProvider>
  ),
};

export const GateClosed_Coaching: Story = {
  render: () => (
    <ComplexityTestProvider tier="expert">
      <HbcComplexityGate
        maxTier="standard"
        fallback={<div style={{ padding: 16, background: '#f3e5f5' }}>Coaching prompt hidden at Expert</div>}
      >
        <div style={{ padding: 16, background: '#fff3e0' }}>
          Coaching prompt — only visible through Standard
        </div>
      </HbcComplexityGate>
    </ComplexityTestProvider>
  ),
};

export const KeepMounted_Hidden: Story = {
  render: () => (
    <ComplexityTestProvider tier="essential">
      <HbcComplexityGate minTier="standard" keepMounted>
        <div style={{ padding: 16, background: '#e8f5e9' }}>
          keepMounted content — in DOM but hidden (aria-hidden)
        </div>
      </HbcComplexityGate>
    </ComplexityTestProvider>
  ),
};

export const FadeIn_Animation: Story = {
  render: () => (
    <ComplexityTestProvider tier="standard">
      <HbcComplexityGate minTier="standard">
        <div style={{ padding: 16, background: '#e8f5e9' }}>
          Fade-in animation — CSS class visible on mount
        </div>
      </HbcComplexityGate>
    </ComplexityTestProvider>
  ),
};
