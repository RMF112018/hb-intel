/**
 * HbcBanner — Storybook Stories
 * Phase 4.9 Messaging & Feedback System
 */
import * as React from 'react';
import { FluentProvider } from '@fluentui/react-components';
import { HbcBanner } from './index.js';
import { hbcLightTheme, hbcFieldTheme } from '../theme/index.js';

export default {
  title: 'Messaging/HbcBanner',
  component: HbcBanner,
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
  <HbcBanner variant="info" onDismiss={() => alert('dismissed')}>
    A new sync is available. Click here to update your project data.
  </HbcBanner>
);

export const AllVariants = () => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
    <HbcBanner variant="info" onDismiss={() => {}}>
      Informational message — sync available.
    </HbcBanner>
    <HbcBanner variant="success" onDismiss={() => {}}>
      Changes saved successfully.
    </HbcBanner>
    <HbcBanner variant="warning" onDismiss={() => {}}>
      Your session will expire in 5 minutes.
    </HbcBanner>
    <HbcBanner variant="error" onDismiss={() => {}}>
      Failed to connect to Procore API. Check your credentials.
    </HbcBanner>
  </div>
);

export const Critical = () => (
  <HbcBanner variant="error">
    Critical system update required. Contact your administrator.
  </HbcBanner>
);

export const FieldMode = () => (
  <FluentProvider theme={hbcFieldTheme}>
    <div style={{ padding: 24, backgroundColor: '#0F1419' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <HbcBanner variant="info" onDismiss={() => {}}>
          Field mode — informational banner.
        </HbcBanner>
        <HbcBanner variant="error">
          Field mode — critical error banner (no dismiss).
        </HbcBanner>
      </div>
    </div>
  </FluentProvider>
);

export const A11yTest = () => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
    <HbcBanner variant="warning" onDismiss={() => {}}>
      Warning banner with role=&quot;alert&quot; and dismissible.
    </HbcBanner>
    <HbcBanner variant="info" onDismiss={() => {}}>
      Info banner with role=&quot;status&quot; and dismissible.
    </HbcBanner>
  </div>
);
