/**
 * HbcBreadcrumbs — Storybook Stories
 * Phase 4.10 Navigation UI System
 */
import * as React from 'react';
import { FluentProvider } from '@fluentui/react-components';
import { HbcBreadcrumbs } from './index.js';
import { hbcLightTheme, hbcFieldTheme } from '../theme/index.js';

export default {
  title: 'Navigation/HbcBreadcrumbs',
  component: HbcBreadcrumbs,
  decorators: [
    (Story: React.FC) => (
      <FluentProvider theme={hbcLightTheme}>
        <div style={{ maxWidth: 800 }}>
          <Story />
        </div>
      </FluentProvider>
    ),
  ],
};

export const Default = () => (
  <HbcBreadcrumbs
    items={[
      { label: 'Home', href: '/' },
      { label: 'RFIs', href: '/rfis' },
    ]}
    onNavigate={(href) => console.log('Navigate to', href)}
  />
);

export const ThreeLevels = () => (
  <HbcBreadcrumbs
    items={[
      { label: 'Home', href: '/' },
      { label: 'RFIs', href: '/rfis' },
      { label: 'RFI-0042' },
    ]}
    onNavigate={(href) => console.log('Navigate to', href)}
  />
);

export const TruncatedFourLevels = () => (
  <HbcBreadcrumbs
    items={[
      { label: 'Home', href: '/' },
      { label: 'Projects', href: '/projects' },
      { label: 'PRJ-A1B2C3', href: '/projects/PRJ-A1B2C3' },
      { label: 'RFI-0042' },
    ]}
    onNavigate={(href) => console.log('Navigate to', href)}
  />
);

export const FocusMode = () => (
  <HbcBreadcrumbs
    items={[
      { label: 'Home', href: '/' },
      { label: 'RFIs', href: '/rfis' },
      { label: 'RFI-0042' },
    ]}
    isFocusMode
    onNavigate={(href) => console.log('Navigate to', href)}
  />
);

export const AllVariants = () => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
    <div>
      <p style={{ fontSize: 12, fontWeight: 600, marginBottom: 4 }}>2 levels</p>
      <HbcBreadcrumbs
        items={[
          { label: 'Home', href: '/' },
          { label: 'RFIs', href: '/rfis' },
        ]}
        onNavigate={(href) => console.log('Navigate to', href)}
      />
    </div>
    <div>
      <p style={{ fontSize: 12, fontWeight: 600, marginBottom: 4 }}>3 levels</p>
      <HbcBreadcrumbs
        items={[
          { label: 'Home', href: '/' },
          { label: 'RFIs', href: '/rfis' },
          { label: 'RFI-0042' },
        ]}
        onNavigate={(href) => console.log('Navigate to', href)}
      />
    </div>
    <div>
      <p style={{ fontSize: 12, fontWeight: 600, marginBottom: 4 }}>4 levels (truncated)</p>
      <HbcBreadcrumbs
        items={[
          { label: 'Home', href: '/' },
          { label: 'Projects', href: '/projects' },
          { label: 'PRJ-A1B2C3', href: '/projects/PRJ-A1B2C3' },
          { label: 'RFI-0042' },
        ]}
        onNavigate={(href) => console.log('Navigate to', href)}
      />
    </div>
    <div>
      <p style={{ fontSize: 12, fontWeight: 600, marginBottom: 4 }}>Focus Mode</p>
      <HbcBreadcrumbs
        items={[
          { label: 'Home', href: '/' },
          { label: 'RFIs', href: '/rfis' },
          { label: 'RFI-0042' },
        ]}
        isFocusMode
        onNavigate={(href) => console.log('Navigate to', href)}
      />
    </div>
  </div>
);

export const FieldMode = () => (
  <FluentProvider theme={hbcFieldTheme}>
    <div style={{ padding: 24, backgroundColor: '#0F1419' }}>
      <HbcBreadcrumbs
        items={[
          { label: 'Home', href: '/' },
          { label: 'Submittals', href: '/submittals' },
          { label: 'SUB-0019' },
        ]}
        isFieldMode
        onNavigate={(href) => console.log('Navigate to', href)}
      />
    </div>
  </FluentProvider>
);

export const A11yTest = () => (
  <HbcBreadcrumbs
    items={[
      { label: 'Home', href: '/' },
      { label: 'Daily Logs', href: '/daily-logs' },
      { label: 'Log #127' },
    ]}
    onNavigate={(href) => console.log('Navigate to', href)}
  />
);
