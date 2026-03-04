/**
 * HbcCommandPalette stories — PH4.6 §Step 11
 * Cmd+K activation, results, offline mode, FieldMode
 */
import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { FluentProvider } from '@fluentui/react-components';
import { HbcCommandPalette } from './index.js';
import { hbcFieldTheme } from '../theme/theme.js';
import { Home, DrawingSheet, RFI, Create, BudgetLine } from '../icons/index.js';
import type { CommandPaletteResult } from './types.js';

const NAV_ITEMS: CommandPaletteResult[] = [
  { id: 'n1', label: 'Dashboard', description: 'Project overview', category: 'navigation', icon: <Home size="sm" />, onSelect: () => console.log('nav: dashboard') },
  { id: 'n2', label: 'Drawings', description: 'Drawing management', category: 'navigation', icon: <DrawingSheet size="sm" />, onSelect: () => console.log('nav: drawings') },
  { id: 'n3', label: 'RFIs', description: 'Request for Information', category: 'navigation', icon: <RFI size="sm" />, onSelect: () => console.log('nav: rfis') },
  { id: 'n4', label: 'Buyout Schedule', description: 'Procurement tracking', category: 'navigation', icon: <BudgetLine size="sm" />, onSelect: () => console.log('nav: buyout') },
];

const ACTION_ITEMS: CommandPaletteResult[] = [
  { id: 'a1', label: 'Create new RFI', category: 'actions', icon: <Create size="sm" />, onSelect: () => console.log('action: new rfi') },
  { id: 'a2', label: 'New Submittal', category: 'actions', icon: <Create size="sm" />, onSelect: () => console.log('action: new submittal') },
  { id: 'a3', label: 'Add Daily Log entry', category: 'actions', icon: <Create size="sm" />, onSelect: () => console.log('action: daily log') },
];

const meta: Meta<typeof HbcCommandPalette> = {
  title: 'Components/HbcCommandPalette',
  component: HbcCommandPalette,
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;
type Story = StoryObj<typeof HbcCommandPalette>;

export const Default: Story = {
  render: () => (
    <div style={{ padding: '24px' }}>
      <p style={{ fontSize: '0.875rem', color: '#605E5C', marginBottom: '16px' }}>
        Press <kbd style={{ padding: '2px 6px', backgroundColor: '#F0F2F5', borderRadius: '3px', fontSize: '0.8125rem' }}>Cmd+K</kbd> (Mac) or <kbd style={{ padding: '2px 6px', backgroundColor: '#F0F2F5', borderRadius: '3px', fontSize: '0.8125rem' }}>Ctrl+K</kbd> (Win) to open.
      </p>
      <HbcCommandPalette
        navigationItems={NAV_ITEMS}
        actionItems={ACTION_ITEMS}
        onAiQuery={async (q) => `AI response for: "${q}" — This is a simulated response demonstrating the AI integration.`}
      />
    </div>
  ),
};

export const WithResults: Story = {
  name: 'With Results (Pre-opened)',
  render: () => (
    <div style={{ padding: '24px' }}>
      <p style={{ fontSize: '0.875rem', color: '#605E5C', marginBottom: '16px' }}>
        Press Cmd+K to open. Type to filter results. ArrowUp/Down to navigate, Enter to select.
      </p>
      <HbcCommandPalette
        navigationItems={NAV_ITEMS}
        actionItems={ACTION_ITEMS}
        onAiQuery={async (q) => `AI: Regarding "${q}", the project is currently on track with 85% of submittals approved.`}
        onSelect={(r) => console.log('Selected:', r.label)}
      />
    </div>
  ),
};

export const OfflineMode: Story = {
  name: 'Offline Mode',
  render: () => (
    <div style={{ padding: '24px' }}>
      <p style={{ fontSize: '0.875rem', color: '#605E5C', marginBottom: '16px' }}>
        In offline mode, Navigation + Recent + Actions work via cache. AI section is hidden with a note.
        Toggle your browser&apos;s network to test.
      </p>
      <HbcCommandPalette
        navigationItems={NAV_ITEMS}
        actionItems={ACTION_ITEMS}
        onAiQuery={async (q) => `AI response for: ${q}`}
      />
    </div>
  ),
};

export const FieldMode: Story = {
  render: () => (
    <FluentProvider theme={hbcFieldTheme}>
      <div style={{ padding: '24px', backgroundColor: '#0F1419', minHeight: '400px' }}>
        <p style={{ fontSize: '0.875rem', color: '#8B95A5', marginBottom: '16px' }}>
          Field Mode — Press Cmd+K to open command palette.
        </p>
        <HbcCommandPalette
          navigationItems={NAV_ITEMS}
          actionItems={ACTION_ITEMS}
        />
      </div>
    </FluentProvider>
  ),
};
