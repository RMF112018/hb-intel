/**
 * HbcBottomNav stories — PH4.14.5
 * Bottom navigation bar for tablet/mobile viewports
 */
import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { FluentProvider } from '@fluentui/react-components';
import { HbcBottomNav } from './index.js';
import { hbcFieldTheme, hbcLightTheme } from '../theme/theme.js';
import { Home, BudgetLine, DailyLog, DrawingSheet, RFI, PunchItem, Settings } from '../icons/index.js';
import type { BottomNavItem } from './types.js';

const mockItems: BottomNavItem[] = [
  { id: 'home', label: 'Home', icon: <Home size="md" />, href: '/dashboard' },
  { id: 'budget', label: 'Budget', icon: <BudgetLine size="md" />, href: '/budget' },
  { id: 'daily-log', label: 'Daily Log', icon: <DailyLog size="md" />, href: '/daily-log' },
  { id: 'drawings', label: 'Drawings', icon: <DrawingSheet size="md" />, href: '/drawings' },
  { id: 'rfis', label: 'RFIs', icon: <RFI size="md" />, href: '/rfis' },
  { id: 'punch', label: 'Punch List', icon: <PunchItem size="md" />, href: '/punch-list' },
  { id: 'settings', label: 'Settings', icon: <Settings size="md" />, href: '/settings' },
];

const meta: Meta<typeof HbcBottomNav> = {
  title: 'Components/HbcBottomNav',
  component: HbcBottomNav,
  parameters: {
    viewport: { defaultViewport: 'ipad' },
  },
};

export default meta;
type Story = StoryObj<typeof HbcBottomNav>;

/** Default: 7 items → first 4 visible + "More" button with 3 overflow */
export const Default: Story = {
  render: () => (
    <div style={{ minHeight: '200px', padding: '16px' }}>
      <p>Resize viewport below 1024px to see in context. Bottom nav is fixed to viewport bottom.</p>
      <HbcBottomNav
        items={mockItems}
        activeId="home"
        onNavigate={(href) => console.log('Navigate:', href)}
      />
    </div>
  ),
};

/** Exactly 5 items — no "More" button needed (first 4 shown + 5th triggers More) */
export const FiveItems: Story = {
  render: () => (
    <div style={{ minHeight: '200px', padding: '16px' }}>
      <p>5 items: first 4 shown directly + "More" with 1 overflow item.</p>
      <HbcBottomNav
        items={mockItems.slice(0, 5)}
        activeId="budget"
        onNavigate={(href) => console.log('Navigate:', href)}
      />
    </div>
  ),
};

/** Active state highlight with accent orange */
export const ActiveState: Story = {
  render: () => {
    const [activeId, setActiveId] = React.useState('home');
    return (
      <div style={{ minHeight: '200px', padding: '16px' }}>
        <p>Tap items to see active state change. Active: <strong>{activeId}</strong></p>
        <HbcBottomNav
          items={mockItems.slice(0, 4)}
          activeId={activeId}
          onNavigate={(href) => {
            const item = mockItems.find((i) => i.href === href);
            if (item) setActiveId(item.id);
          }}
        />
      </div>
    );
  },
};

/** Field Mode (dark theme) context */
export const FieldMode: Story = {
  render: () => (
    <FluentProvider theme={hbcFieldTheme}>
      <div style={{ minHeight: '200px', padding: '16px', backgroundColor: '#0F1419', color: '#E8EAED' }}>
        <p>Field Mode context — bottom nav uses dark header background.</p>
        <HbcBottomNav
          items={mockItems}
          activeId="daily-log"
          onNavigate={(href) => console.log('Navigate:', href)}
        />
      </div>
    </FluentProvider>
  ),
};
