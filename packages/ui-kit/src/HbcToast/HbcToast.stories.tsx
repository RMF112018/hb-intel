/**
 * HbcToast — Storybook Stories
 * Phase 4.9 Messaging & Feedback System
 */
import * as React from 'react';
import { FluentProvider } from '@fluentui/react-components';
import { HbcToastProvider, useToast, HbcToastContainer } from './index.js';
import { hbcLightTheme, hbcFieldTheme } from '../theme/index.js';
import { HbcButton } from '../HbcButton/index.js';

export default {
  title: 'Messaging/HbcToast',
  decorators: [
    (Story: React.FC) => (
      <FluentProvider theme={hbcLightTheme}>
        <HbcToastProvider>
          <Story />
          <HbcToastContainer />
        </HbcToastProvider>
      </FluentProvider>
    ),
  ],
};

const ToastDemo: React.FC<{ category: 'success' | 'error' | 'sync-status' }> = ({ category }) => {
  const { addToast, dismissCategory } = useToast();
  const messages: Record<string, string> = {
    success: 'Changes saved successfully.',
    error: 'Failed to sync with Procore. Please retry.',
    'sync-status': 'Syncing project data…',
  };
  return (
    <div style={{ display: 'flex', gap: 8 }}>
      <HbcButton onClick={() => addToast({ category, message: messages[category] })}>
        Show {category}
      </HbcButton>
      {category === 'sync-status' && (
        <HbcButton variant="secondary" onClick={() => dismissCategory('sync-status')}>
          Dismiss sync
        </HbcButton>
      )}
    </div>
  );
};

export const Default = () => <ToastDemo category="success" />;

export const AllVariants = () => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
    <ToastDemo category="success" />
    <ToastDemo category="error" />
    <ToastDemo category="sync-status" />
  </div>
);

export const ToastStack = () => {
  const { addToast } = useToast();
  return (
    <HbcButton
      onClick={() => {
        addToast({ category: 'success', message: 'Toast 1 — auto-dismiss' });
        addToast({ category: 'error', message: 'Toast 2 — requires dismiss' });
        addToast({ category: 'sync-status', message: 'Toast 3 — syncing…' });
        addToast({ category: 'success', message: 'Toast 4 — exceeds max (3), oldest hidden' });
      }}
    >
      Add 4 toasts (max 3 visible)
    </HbcButton>
  );
};

export const FieldMode = () => (
  <FluentProvider theme={hbcFieldTheme}>
    <div style={{ padding: 24, backgroundColor: '#0F1419', minHeight: 200 }}>
      <HbcToastProvider>
        <ToastDemo category="error" />
        <HbcToastContainer />
      </HbcToastProvider>
    </div>
  </FluentProvider>
);

export const A11yTest = () => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
    <p>Error toasts use role=&quot;alert&quot;; others use role=&quot;status&quot;.</p>
    <AllVariants />
  </div>
);
