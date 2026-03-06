/**
 * HbcToast — Storybook Stories
 * Phase 4b.9 Notifications & Feedback System
 * PH4B.9-UI-Design-Plan.md §12 (4b.9.2)
 *
 * Demonstrates all four toast categories and the convenience API.
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

/** Demo component using the convenience API (toast.success, toast.error, etc.) */
const ToastDemo: React.FC<{ category: 'success' | 'error' | 'warning' | 'info' }> = ({ category }) => {
  const { toast } = useToast();
  const messages: Record<string, string> = {
    success: 'Changes saved successfully.',
    error: 'Failed to sync with Procore. Please retry.',
    warning: 'Record locked by another user.',
    info: 'Export started. Download will begin shortly.',
  };
  return (
    <div style={{ display: 'flex', gap: 8 }}>
      <HbcButton onClick={() => toast[category](messages[category])}>
        Show {category}
      </HbcButton>
    </div>
  );
};

export const Default = () => <ToastDemo category="success" />;

export const AllVariants = () => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
    <ToastDemo category="success" />
    <ToastDemo category="error" />
    <ToastDemo category="warning" />
    <ToastDemo category="info" />
  </div>
);

export const ToastStack = () => {
  const { toast } = useToast();
  return (
    <HbcButton
      onClick={() => {
        toast.success('Toast 1 — auto-dismiss 3s');
        toast.error('Toast 2 — requires dismiss');
        toast.warning('Toast 3 — auto-dismiss 5s');
        toast.info('Toast 4 — exceeds max (3), oldest hidden');
      }}
    >
      Add 4 toasts (max 3 visible)
    </HbcButton>
  );
};

/** Demonstrates dismiss-by-category using the low-level addToast API */
export const DismissCategory = () => {
  const { addToast, dismissCategory } = useToast();
  return (
    <div style={{ display: 'flex', gap: 8 }}>
      <HbcButton onClick={() => addToast({ category: 'info', message: 'Syncing project data…' })}>
        Add info toast
      </HbcButton>
      <HbcButton variant="secondary" onClick={() => dismissCategory('info')}>
        Dismiss all info
      </HbcButton>
    </div>
  );
};

/** Canonical mutation wiring pattern per 4b.9.3 */
export const MutationPattern = () => {
  const { toast } = useToast();
  return (
    <div style={{ display: 'flex', gap: 8 }}>
      <HbcButton
        variant="primary"
        onClick={() => toast.success('Risk item created.')}
      >
        Simulate onSuccess
      </HbcButton>
      <HbcButton
        variant="secondary"
        onClick={() => toast.error('Failed to create risk item.')}
      >
        Simulate onError
      </HbcButton>
    </div>
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
    <p>Error/warning toasts use role=&quot;alert&quot;; success/info use role=&quot;status&quot;.</p>
    <AllVariants />
  </div>
);
