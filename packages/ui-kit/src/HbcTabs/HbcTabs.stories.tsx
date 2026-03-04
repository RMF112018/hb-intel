/**
 * HbcTabs — Storybook Stories
 * Phase 4.10 Navigation UI System
 */
import * as React from 'react';
import { FluentProvider } from '@fluentui/react-components';
import { HbcTabs } from './index.js';
import { hbcLightTheme, hbcFieldTheme } from '../theme/index.js';
import { DrawingSheet, RFI, PunchItem } from '../icons/index.js';

export default {
  title: 'Navigation/HbcTabs',
  component: HbcTabs,
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

export const Default = () => {
  const [active, setActive] = React.useState('overview');
  return (
    <HbcTabs
      tabs={[
        { id: 'overview', label: 'Overview' },
        { id: 'details', label: 'Details' },
        { id: 'history', label: 'History' },
      ]}
      activeTabId={active}
      onTabChange={setActive}
    />
  );
};

export const WithPanels = () => {
  const [active, setActive] = React.useState('overview');
  return (
    <HbcTabs
      tabs={[
        { id: 'overview', label: 'Overview' },
        { id: 'details', label: 'Details' },
        { id: 'history', label: 'History' },
      ]}
      activeTabId={active}
      onTabChange={setActive}
      panels={[
        { tabId: 'overview', content: <div style={{ padding: 16 }}>Overview panel content</div> },
        { tabId: 'details', content: <div style={{ padding: 16 }}>Details panel content</div> },
        { tabId: 'history', content: <div style={{ padding: 16 }}>History panel content</div> },
      ]}
    />
  );
};

export const WithIcons = () => {
  const [active, setActive] = React.useState('drawings');
  return (
    <HbcTabs
      tabs={[
        { id: 'drawings', label: 'Drawings', icon: <DrawingSheet size="sm" /> },
        { id: 'rfis', label: 'RFIs', icon: <RFI size="sm" /> },
        { id: 'punch', label: 'Punch Items', icon: <PunchItem size="sm" /> },
      ]}
      activeTabId={active}
      onTabChange={setActive}
    />
  );
};

export const DisabledTab = () => {
  const [active, setActive] = React.useState('overview');
  return (
    <HbcTabs
      tabs={[
        { id: 'overview', label: 'Overview' },
        { id: 'restricted', label: 'Restricted', disabled: true },
        { id: 'history', label: 'History' },
      ]}
      activeTabId={active}
      onTabChange={setActive}
    />
  );
};

export const AllVariants = () => {
  const [active, setActive] = React.useState('tab1');
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div>
        <p style={{ fontSize: 12, fontWeight: 600, marginBottom: 4 }}>Plain tabs</p>
        <HbcTabs
          tabs={[
            { id: 'tab1', label: 'Overview' },
            { id: 'tab2', label: 'Details' },
            { id: 'tab3', label: 'History' },
          ]}
          activeTabId={active}
          onTabChange={setActive}
        />
      </div>
      <div>
        <p style={{ fontSize: 12, fontWeight: 600, marginBottom: 4 }}>With icons</p>
        <HbcTabs
          tabs={[
            { id: 'drawings', label: 'Drawings', icon: <DrawingSheet size="sm" /> },
            { id: 'rfis', label: 'RFIs', icon: <RFI size="sm" /> },
            { id: 'punch', label: 'Punch Items', icon: <PunchItem size="sm" /> },
          ]}
          activeTabId="drawings"
          onTabChange={() => {}}
        />
      </div>
      <div>
        <p style={{ fontSize: 12, fontWeight: 600, marginBottom: 4 }}>With disabled tab</p>
        <HbcTabs
          tabs={[
            { id: 'a', label: 'Active' },
            { id: 'b', label: 'Restricted', disabled: true },
            { id: 'c', label: 'History' },
          ]}
          activeTabId="a"
          onTabChange={() => {}}
        />
      </div>
    </div>
  );
};

export const FieldMode = () => {
  const [active, setActive] = React.useState('overview');
  return (
    <FluentProvider theme={hbcFieldTheme}>
      <div style={{ padding: 24, backgroundColor: '#0F1419' }}>
        <HbcTabs
          tabs={[
            { id: 'overview', label: 'Overview' },
            { id: 'details', label: 'Details' },
            { id: 'history', label: 'History' },
          ]}
          activeTabId={active}
          onTabChange={setActive}
          isFieldMode
        />
      </div>
    </FluentProvider>
  );
};

export const KeyboardNavigation = () => {
  const [active, setActive] = React.useState('tab1');
  return (
    <div>
      <p style={{ fontSize: '0.875rem', marginBottom: 8, color: '#6B7280' }}>
        Click a tab then use ArrowLeft/ArrowRight to navigate. Disabled tabs are skipped.
      </p>
      <HbcTabs
        tabs={[
          { id: 'tab1', label: 'First' },
          { id: 'tab2', label: 'Second' },
          { id: 'tab3', label: 'Disabled', disabled: true },
          { id: 'tab4', label: 'Fourth' },
        ]}
        activeTabId={active}
        onTabChange={setActive}
      />
    </div>
  );
};

export const A11yTest = () => {
  const [active, setActive] = React.useState('overview');
  return (
    <HbcTabs
      tabs={[
        { id: 'overview', label: 'Overview' },
        { id: 'details', label: 'Details' },
      ]}
      activeTabId={active}
      onTabChange={setActive}
      panels={[
        { tabId: 'overview', content: <div style={{ padding: 16 }}>Overview content for a11y testing</div> },
        { tabId: 'details', content: <div style={{ padding: 16 }}>Details content for a11y testing</div> },
      ]}
    />
  );
};
