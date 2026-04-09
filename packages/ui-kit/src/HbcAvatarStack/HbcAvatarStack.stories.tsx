/**
 * HbcAvatarStack stories — visual proof for the recognition cluster primitive.
 * People & Culture migration to @hbc/ui-kit/homepage.
 */
import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { HbcAvatarStack } from './index.js';

const meta: Meta<typeof HbcAvatarStack> = {
  title: 'Homepage Primitives/HbcAvatarStack',
  component: HbcAvatarStack,
  parameters: { layout: 'padded' },
};
export default meta;

type Story = StoryObj<typeof HbcAvatarStack>;

const samplePeople = [
  { id: '1', name: 'Riley Brooks' },
  { id: '2', name: 'Morgan Chen' },
  { id: '3', name: 'Jamie Patel' },
  { id: '4', name: 'Sam Rivera' },
  { id: '5', name: 'Alex Kim' },
  { id: '6', name: 'Casey Nguyen' },
];

export const Default: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <HbcAvatarStack people={samplePeople.slice(0, 4)} size="md" />
    </div>
  ),
};

export const Sizes: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {(['xs', 'sm', 'md', 'lg', 'xl'] as const).map((size) => (
        <div key={size} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <code style={{ width: 36 }}>{size}</code>
          <HbcAvatarStack people={samplePeople.slice(0, 3)} size={size} />
        </div>
      ))}
    </div>
  ),
};

export const HeroWithRing: Story = {
  render: () => (
    <HbcAvatarStack people={samplePeople.slice(0, 1)} size="xl" ring />
  ),
};

export const HeroWithSecondary: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
      <HbcAvatarStack people={samplePeople.slice(0, 1)} size="xl" ring />
      <div style={{ marginTop: -10 }}>
        <HbcAvatarStack people={samplePeople.slice(1, 4)} size="xs" />
      </div>
    </div>
  ),
};

export const OverflowCount: Story = {
  render: () => (
    <HbcAvatarStack people={samplePeople} size="md" max={4} overflow="count" />
  ),
};

export const OverflowText: Story = {
  render: () => (
    <HbcAvatarStack people={samplePeople} size="md" max={4} overflow="inline-text" />
  ),
};
