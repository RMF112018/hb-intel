/**
 * HbcFavoriteTools Stories — PH4B.2 §Step 5 (F-013)
 * CSF3 format | DESIGN_SYSTEM.md convention
 */
import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { FluentProvider } from '@fluentui/react-components';
import { HbcFavoriteTools } from './HbcFavoriteTools.js';
import { hbcFieldTheme } from '../theme/theme.js';
import { BudgetLine, DrawingSheet, RFI, Submittal } from '../icons/index.js';
import type { SidebarNavItem } from './types.js';

const mockFavorites: SidebarNavItem[] = [
  { id: 'budget', label: 'Budget', icon: <BudgetLine size="sm" color="#FFFFFF" />, href: '/budget', isFavorite: true },
  { id: 'drawings', label: 'Drawings', icon: <DrawingSheet size="sm" color="#FFFFFF" />, href: '/drawings', isFavorite: true },
  { id: 'rfis', label: 'RFIs', icon: <RFI size="sm" color="#FFFFFF" />, href: '/rfis', isFavorite: true },
  { id: 'submittals', label: 'Submittals', icon: <Submittal size="sm" color="#FFFFFF" />, href: '/submittals', isFavorite: true },
];

const meta: Meta<typeof HbcFavoriteTools> = {
  title: 'Shell/HbcFavoriteTools',
  component: HbcFavoriteTools,
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
type Story = StoryObj<typeof HbcFavoriteTools>;

export const Default: Story = {
  args: {
    items: mockFavorites,
  },
};

export const Empty: Story = {
  name: 'No Favorites (hidden)',
  args: {
    items: [],
  },
};

export const AllVariants: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div>
        <p style={{ fontSize: '0.75rem', color: '#9CA3AF', marginBottom: '8px' }}>With 4 favorites</p>
        <HbcFavoriteTools items={mockFavorites} />
      </div>
      <div>
        <p style={{ fontSize: '0.75rem', color: '#9CA3AF', marginBottom: '8px' }}>
          Empty (renders null)
        </p>
        <HbcFavoriteTools items={[]} />
        <p style={{ fontSize: '0.625rem', color: '#6B7280' }}>Nothing rendered above</p>
      </div>
      <div>
        <p style={{ fontSize: '0.75rem', color: '#9CA3AF', marginBottom: '8px' }}>
          Mixed (only isFavorite=true shown)
        </p>
        <HbcFavoriteTools
          items={[
            ...mockFavorites,
            { id: 'notfav', label: 'Not Fav', icon: <span>X</span>, href: '/nf', isFavorite: false },
          ]}
        />
      </div>
    </div>
  ),
};

export const FieldMode: Story = {
  render: () => (
    <FluentProvider theme={hbcFieldTheme}>
      <div style={{ backgroundColor: '#0F1419', padding: '16px', borderRadius: '4px' }}>
        <HbcFavoriteTools items={mockFavorites} />
      </div>
    </FluentProvider>
  ),
};

export const A11yTest: Story = {
  name: 'A11y Test (Toolbar + Labels)',
  render: () => (
    <div>
      <p style={{ marginBottom: '16px', fontSize: '0.875rem', color: '#605E5C' }}>
        Verify <code>role="toolbar"</code> with <code>aria-label="Favorite tools"</code>.
        Each button has <code>aria-label</code> and <code>title</code> for the tool name.
        Tab through to verify focus order.
      </p>
      <div style={{ backgroundColor: '#1B2A3D', padding: '16px', borderRadius: '4px' }}>
        <HbcFavoriteTools items={mockFavorites} />
      </div>
    </div>
  ),
};
