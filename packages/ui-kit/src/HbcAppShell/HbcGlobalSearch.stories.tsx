/**
 * HbcGlobalSearch Stories — PH4B.2 §Step 5 (F-013)
 * CSF3 format | DESIGN_SYSTEM.md convention
 */
import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { FluentProvider } from '@fluentui/react-components';
import { HbcGlobalSearch } from './HbcGlobalSearch.js';
import { hbcFieldTheme } from '../theme/theme.js';

const meta: Meta<typeof HbcGlobalSearch> = {
  title: 'Shell/HbcGlobalSearch',
  component: HbcGlobalSearch,
  parameters: { layout: 'centered' },
  decorators: [
    (Story) => (
      <div style={{ backgroundColor: '#1B2A3D', padding: '16px', borderRadius: '4px' }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof HbcGlobalSearch>;

export const Default: Story = {
  args: {
    onSearchOpen: () => console.log('Search opened'),
  },
};

export const Typing: Story = {
  name: 'Search Trigger (click to open)',
  args: {
    onSearchOpen: () => console.log('Command palette opened'),
  },
};

export const AllVariants: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div>
        <p style={{ fontSize: '0.75rem', color: '#9CA3AF', marginBottom: '4px' }}>Default</p>
        <HbcGlobalSearch onSearchOpen={() => console.log('Open')} />
      </div>
    </div>
  ),
};

export const FieldMode: Story = {
  render: () => (
    <FluentProvider theme={hbcFieldTheme}>
      <div style={{ backgroundColor: '#0F1419', padding: '16px', borderRadius: '4px' }}>
        <HbcGlobalSearch onSearchOpen={() => console.log('Search')} />
      </div>
    </FluentProvider>
  ),
};

export const A11yTest: Story = {
  name: 'A11y Test (Keyboard Shortcut)',
  render: () => (
    <div>
      <p style={{ marginBottom: '16px', fontSize: '0.875rem', color: '#605E5C' }}>
        Verify <code>aria-label</code> mentions Cmd/Ctrl+K shortcut.
        Press Cmd+K (Mac) or Ctrl+K (Win) to trigger search.
        Tab to the search bar and press Enter/Space to activate.
      </p>
      <div style={{ backgroundColor: '#1B2A3D', padding: '16px', borderRadius: '4px' }}>
        <HbcGlobalSearch onSearchOpen={() => console.log('Search opened via shortcut')} />
      </div>
    </div>
  ),
};
