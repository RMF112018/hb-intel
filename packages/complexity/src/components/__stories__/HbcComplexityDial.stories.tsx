import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { HbcComplexityDial } from '../HbcComplexityDial';
import { ComplexityTestProvider } from '../../../testing/ComplexityTestProvider';

const meta: Meta<typeof HbcComplexityDial> = {
  title: 'Complexity/HbcComplexityDial',
  component: HbcComplexityDial,
};

export default meta;
type Story = StoryObj<typeof HbcComplexityDial>;

export const Header_Essential: Story = {
  render: () => (
    <ComplexityTestProvider tier="essential">
      <HbcComplexityDial variant="header" />
    </ComplexityTestProvider>
  ),
};

export const Header_Standard: Story = {
  render: () => (
    <ComplexityTestProvider tier="standard">
      <HbcComplexityDial variant="header" />
    </ComplexityTestProvider>
  ),
};

export const Header_Expert: Story = {
  render: () => (
    <ComplexityTestProvider tier="expert">
      <HbcComplexityDial variant="header" />
    </ComplexityTestProvider>
  ),
};

export const Header_Locked: Story = {
  render: () => (
    <ComplexityTestProvider tier="essential" isLocked lockedBy="onboarding">
      <HbcComplexityDial variant="header" />
    </ComplexityTestProvider>
  ),
};

export const Settings_Standard: Story = {
  render: () => (
    <ComplexityTestProvider tier="standard">
      <HbcComplexityDial variant="settings" showCoachingToggle />
    </ComplexityTestProvider>
  ),
};

export const Settings_Locked_Admin: Story = {
  render: () => (
    <ComplexityTestProvider
      tier="standard"
      isLocked
      lockedBy="admin"
      lockedUntil="2026-12-31T23:59:59Z"
    >
      <HbcComplexityDial variant="settings" showCoachingToggle />
    </ComplexityTestProvider>
  ),
};
