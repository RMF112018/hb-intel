/**
 * HbcTileCatalog stories — D-SF13-T08, D-10
 *
 * Storybook variants: Default, AllPlaced, WithMandatory
 * Inline styles only — D-07
 */
import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { HbcTileCatalog } from './HbcTileCatalog.js';

const meta: Meta<typeof HbcTileCatalog> = {
  title: 'ProjectCanvas/HbcTileCatalog',
  component: HbcTileCatalog,
  parameters: {
    layout: 'centered',
  },
  decorators: [
    (Story) => (
      <div style={{ padding: 24, fontFamily: 'sans-serif', width: 600 }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof HbcTileCatalog>;

export const Default: Story = {
  args: {
    currentTiles: ['bic-my-items'],
    onAddTile: () => {},
    onClose: () => {},
  },
};

export const AllPlaced: Story = {
  args: {
    currentTiles: [
      'bic-my-items',
      'active-constraints',
      'project-health-pulse',
      'permit-status',
      'pending-approvals',
      'bd-heritage',
      'workflow-handoff-inbox',
      'document-activity',
      'estimating-pursuit',
      'notification-summary',
      'related-items',
      'ai-insight',
    ],
    onAddTile: () => {},
    onClose: () => {},
  },
};

export const WithMandatory: Story = {
  args: {
    currentTiles: [],
    onAddTile: () => {},
    onClose: () => {},
  },
};
