/**
 * AdminAlertBadge stories — severity × count matrix
 * SF17-T08 — Testing Strategy
 */
import type { Meta, StoryObj } from '@storybook/react';
import { AdminAlertBadge } from './AdminAlertBadge.js';
import type { IAdminAlertBadge } from '../types/IAdminAlertBadge.js';
import { fn } from '@storybook/test';

const meta: Meta<typeof AdminAlertBadge> = {
  title: 'Admin Intelligence/AdminAlertBadge',
  component: AdminAlertBadge,
  args: {
    onOpenDashboard: fn(),
  },
};

export default meta;

type Story = StoryObj<typeof AdminAlertBadge>;

function makeBadge(overrides: Partial<IAdminAlertBadge> = {}): IAdminAlertBadge {
  const badge = {
    criticalCount: 0,
    highCount: 0,
    mediumCount: 0,
    lowCount: 0,
    totalCount: 0,
    ...overrides,
  };
  return {
    ...badge,
    totalCount: badge.criticalCount + badge.highCount + badge.mediumCount + badge.lowCount,
  };
}

/** Zero alerts — component returns null */
export const Empty: Story = {
  args: { badge: makeBadge() },
};

/** Single critical alert */
export const CriticalSingle: Story = {
  args: { badge: makeBadge({ criticalCount: 1 }) },
};

/** Many critical alerts */
export const CriticalMany: Story = {
  args: { badge: makeBadge({ criticalCount: 5 }) },
};

/** Single high alert */
export const HighSingle: Story = {
  args: { badge: makeBadge({ highCount: 1 }) },
};

/** Many high alerts */
export const HighMany: Story = {
  args: { badge: makeBadge({ highCount: 3 }) },
};

/** Single medium alert */
export const MediumSingle: Story = {
  args: { badge: makeBadge({ mediumCount: 1 }) },
};

/** Many medium alerts */
export const MediumMany: Story = {
  args: { badge: makeBadge({ mediumCount: 4 }) },
};

/** Single low alert */
export const LowSingle: Story = {
  args: { badge: makeBadge({ lowCount: 1 }) },
};

/** Many low alerts */
export const LowMany: Story = {
  args: { badge: makeBadge({ lowCount: 7 }) },
};

/** Mixed severity — critical + high → error variant */
export const MixedCriticalHigh: Story = {
  args: { badge: makeBadge({ criticalCount: 2, highCount: 3 }) },
};

/** Mixed severity — medium + low → warning variant */
export const MixedMediumLow: Story = {
  args: { badge: makeBadge({ mediumCount: 2, lowCount: 1 }) },
};

// TODO: Playwright e2e — click badge opens dashboard, verify a11y announcements
