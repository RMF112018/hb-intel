/**
 * HbcErrorBoundary stories — PH4.6 §Step 5
 */
import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { FluentProvider } from '@fluentui/react-components';
import { HbcErrorBoundary } from './index.js';
import { hbcFieldTheme } from '../theme/theme.js';

// Component that always throws to trigger error boundary
const BrokenComponent: React.FC = () => {
  throw new Error('This component intentionally threw an error for demonstration.');
};

const meta: Meta<typeof HbcErrorBoundary> = {
  title: 'Components/HbcErrorBoundary',
  component: HbcErrorBoundary,
};

export default meta;
type Story = StoryObj<typeof HbcErrorBoundary>;

export const Default: Story = {
  render: () => (
    <HbcErrorBoundary>
      <BrokenComponent />
    </HbcErrorBoundary>
  ),
};

export const CustomFallback: Story = {
  render: () => (
    <HbcErrorBoundary
      fallback={(error, retry) => (
        <div style={{ padding: '24px', textAlign: 'center' }}>
          <h4 style={{ color: '#FF4D4D' }}>Custom Error UI</h4>
          <p style={{ color: '#6B7280' }}>{error.message}</p>
          <button
            type="button"
            onClick={retry}
            style={{
              padding: '8px 16px',
              backgroundColor: '#F37021',
              color: '#FFF',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          >
            Retry
          </button>
        </div>
      )}
    >
      <BrokenComponent />
    </HbcErrorBoundary>
  ),
};

export const FieldMode: Story = {
  render: () => (
    <FluentProvider theme={hbcFieldTheme}>
      <div style={{ padding: '24px', backgroundColor: '#0F1419' }}>
        <HbcErrorBoundary>
          <BrokenComponent />
        </HbcErrorBoundary>
      </div>
    </FluentProvider>
  ),
};

export const A11yTest: Story = {
  name: 'A11y Test',
  render: () => (
    <div>
      <p style={{ marginBottom: '16px', fontSize: '0.875rem', color: '#605E5C' }}>
        Error boundary uses <code>data-hbc-ui=&quot;error-boundary&quot;</code>.
        The retry button is keyboard accessible.
      </p>
      <HbcErrorBoundary>
        <BrokenComponent />
      </HbcErrorBoundary>
    </div>
  ),
};
