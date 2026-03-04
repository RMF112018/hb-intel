/**
 * HbcSpinner — Storybook Stories
 * Phase 4.9 Messaging & Feedback System
 */
import * as React from 'react';
import { FluentProvider } from '@fluentui/react-components';
import { HbcSpinner } from './index.js';
import { hbcLightTheme, hbcFieldTheme, HBC_STATUS_COLORS } from '../theme/index.js';

export default {
  title: 'Messaging/HbcSpinner',
  component: HbcSpinner,
  decorators: [
    (Story: React.FC) => (
      <FluentProvider theme={hbcLightTheme}>
        <Story />
      </FluentProvider>
    ),
  ],
};

export const Default = () => <HbcSpinner />;

export const AllSizes = () => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
    <div style={{ textAlign: 'center' }}>
      <HbcSpinner size="sm" />
      <p style={{ fontSize: 12, marginTop: 8 }}>sm (20px)</p>
    </div>
    <div style={{ textAlign: 'center' }}>
      <HbcSpinner size="md" />
      <p style={{ fontSize: 12, marginTop: 8 }}>md (40px)</p>
    </div>
    <div style={{ textAlign: 'center' }}>
      <HbcSpinner size="lg" />
      <p style={{ fontSize: 12, marginTop: 8 }}>lg (64px)</p>
    </div>
  </div>
);

export const CustomColor = () => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
    <HbcSpinner color={HBC_STATUS_COLORS.success} label="Syncing" />
    <HbcSpinner color={HBC_STATUS_COLORS.error} label="Error loading" />
    <HbcSpinner color={HBC_STATUS_COLORS.warning} label="Processing" />
  </div>
);

export const FieldMode = () => (
  <FluentProvider theme={hbcFieldTheme}>
    <div style={{ padding: 24, backgroundColor: '#0F1419', display: 'flex', gap: 24 }}>
      <HbcSpinner size="sm" />
      <HbcSpinner size="md" />
      <HbcSpinner size="lg" />
    </div>
  </FluentProvider>
);

export const A11yTest = () => (
  <div>
    <p style={{ marginBottom: 16 }}>
      Spinner has role=&quot;status&quot; and a visually hidden label for screen readers.
    </p>
    <HbcSpinner label="Loading project data" />
  </div>
);
