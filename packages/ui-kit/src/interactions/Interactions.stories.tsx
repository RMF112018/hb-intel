/**
 * Interaction Pattern Library — Storybook stories
 * PH4.12 §Step 9 | Blueprint §1d
 *
 * Demonstrates all 8 interaction patterns from Phase 4.12.
 */
import * as React from 'react';
import { FluentProvider } from '@fluentui/react-components';
import { hbcLightTheme } from '../theme/theme.js';
import { CreateUpdateLayout } from '../layouts/CreateUpdateLayout.js';
import { HbcStatusBadge } from '../HbcStatusBadge/index.js';
import { HbcDataTable } from '../HbcDataTable/index.js';
import { HbcButton } from '../HbcButton/index.js';
import { HbcConfirmDialog } from '../HbcConfirmDialog/index.js';
import { useOptimisticMutation } from '../hooks/useOptimisticMutation.js';
import { useUnsavedChangesBlocker } from '../hooks/useUnsavedChangesBlocker.js';
import { useMinDisplayTime } from '../hooks/useMinDisplayTime.js';
import type { StatusVariant } from '../HbcStatusBadge/types.js';

export default {
  title: 'PH4.12 Interactions/Patterns',
  decorators: [
    (Story: React.FC) => (
      <FluentProvider theme={hbcLightTheme}>
        <div style={{ minHeight: '400px' }}>
          <Story />
        </div>
      </FluentProvider>
    ),
  ],
};

/**
 * FocusModeToggle: Demonstrates Focus Mode with Cmd/Ctrl+Shift+F shortcut.
 * Activating focus mode dims background and collapses sidebar.
 */
export const FocusModeToggle = () => (
  <div data-hbc-shell="app-shell">
    <CreateUpdateLayout
      mode="create"
      itemType="RFI"
      onCancel={() => console.log('Cancel')}
      onSubmit={() => console.log('Submit')}
    >
      <div style={{ padding: '24px' }}>
        <p>Press <kbd>Cmd/Ctrl+Shift+F</kbd> to toggle Focus Mode.</p>
        <p>When active: sidebar collapses, background dims 40%, form content elevates.</p>
        <p>Cancel or Save automatically deactivates Focus Mode.</p>
      </div>
    </CreateUpdateLayout>
  </div>
);

/**
 * OptimisticFailureRevert: Button triggers optimistic update,
 * simulated server error reverts after 1 second.
 */
export const OptimisticFailureRevert = () => {
  const [items, setItems] = React.useState(['Item A', 'Item B', 'Item C']);
  const [error, setError] = React.useState<string | null>(null);

  const { mutate, isPending } = useOptimisticMutation<void, string>({
    mutationFn: async () => {
      // Simulate server failure after 1 second
      await new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Server error: conflict')), 1000),
      );
    },
    onOptimisticUpdate: (newItem) => {
      setItems((prev) => [...prev, newItem]);
      setError(null);
    },
    onRevert: (newItem) => {
      setItems((prev) => prev.filter((i) => i !== newItem));
    },
    onShowError: (message) => setError(message),
  });

  return (
    <div style={{ padding: '24px' }}>
      <h3>Optimistic Mutation with Revert</h3>
      <ul>
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
      {error && (
        <p style={{ color: '#E53E3E', fontSize: '0.875rem' }}>Error: {error} (item reverted)</p>
      )}
      <HbcButton
        onClick={() => mutate(`Item ${String.fromCharCode(65 + items.length)}`)}
        loading={isPending}
      >
        Add Item (will fail &amp; revert)
      </HbcButton>
    </div>
  );
};

/**
 * ShimmerLoading: HbcDataTable shimmer skeleton with useMinDisplayTime.
 */
export const ShimmerLoading = () => {
  const [isLoading, setIsLoading] = React.useState(true);
  const showLoading = useMinDisplayTime(isLoading, 300);

  return (
    <div style={{ padding: '24px' }}>
      <h3>Shimmer Loading with Min Display Time</h3>
      <HbcButton
        onClick={() => {
          setIsLoading(true);
          setTimeout(() => setIsLoading(false), 100);
        }}
        variant="secondary"
      >
        Quick Load (100ms → shown 300ms min)
      </HbcButton>
      <div style={{ marginTop: '16px' }}>
        <HbcDataTable
          columns={[
            { accessorKey: 'name', header: 'Name' },
            { accessorKey: 'status', header: 'Status' },
            { accessorKey: 'amount', header: 'Amount' },
          ]}
          data={[
            { name: 'Electrical', status: 'In Progress', amount: '$45,000' },
            { name: 'Plumbing', status: 'Completed', amount: '$32,000' },
            { name: 'HVAC', status: 'Pending', amount: '$67,000' },
          ]}
          isLoading={showLoading}
        />
      </div>
    </div>
  );
};

/**
 * UnsavedChangesBlocker: Form with dirty tracking + confirmation modal.
 */
export const UnsavedChangesBlocker = () => {
  const [value, setValue] = React.useState('');
  const isDirty = value.length > 0;
  const { showPrompt, setShowPrompt, confirmNavigation, cancelNavigation } =
    useUnsavedChangesBlocker({ isDirty });

  return (
    <div style={{ padding: '24px' }}>
      <h3>Unsaved Changes Blocker</h3>
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Type something to make form dirty..."
        style={{ width: '300px', padding: '8px', marginBottom: '16px', display: 'block' }}
      />
      <p style={{ fontSize: '0.875rem', color: '#666' }}>
        Dirty: {isDirty ? 'Yes' : 'No'}
        {isDirty && ' — try closing the browser tab or clicking "Navigate Away"'}
      </p>
      <HbcButton
        variant="secondary"
        onClick={() => isDirty && setShowPrompt(true)}
        disabled={!isDirty}
      >
        Navigate Away
      </HbcButton>
      <HbcConfirmDialog
        open={showPrompt}
        onClose={cancelNavigation}
        onConfirm={confirmNavigation}
        title="Leave without saving?"
        description="You have unsaved changes that will be lost."
        confirmLabel="Leave without Saving"
        cancelLabel="Stay & Save"
        variant="danger"
      />
    </div>
  );
};

/**
 * RealTimeBadgePulse: HbcStatusBadge cycling through variants with pulse animation.
 */
export const RealTimeBadgePulse = () => {
  const variants: StatusVariant[] = ['pending', 'inProgress', 'atRisk', 'completed'];
  const labels = ['Pending', 'In Progress', 'At Risk', 'Completed'];
  const [index, setIndex] = React.useState(0);

  React.useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % variants.length);
    }, 2000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div style={{ padding: '24px' }}>
      <h3>Real-Time Badge Pulse Animation</h3>
      <p style={{ fontSize: '0.875rem', color: '#666', marginBottom: '16px' }}>
        Badge cycles every 2 seconds with crossfade + pulse animation on variant change.
      </p>
      <HbcStatusBadge
        variant={variants[index]}
        label={labels[index]}
        animate
      />
    </div>
  );
};

/**
 * ReducedMotion: Information about testing with prefers-reduced-motion.
 */
export const ReducedMotion = () => (
  <div style={{ padding: '24px' }}>
    <h3>Reduced Motion Testing</h3>
    <p style={{ fontSize: '0.875rem', lineHeight: '1.6' }}>
      All PH4.12 animations respect <code>prefers-reduced-motion: reduce</code>.
    </p>
    <p style={{ fontSize: '0.875rem', lineHeight: '1.6' }}>
      To test in Chrome DevTools:
    </p>
    <ol style={{ fontSize: '0.875rem', lineHeight: '1.8' }}>
      <li>Open DevTools → Rendering panel</li>
      <li>Check &quot;Emulate CSS media feature prefers-reduced-motion&quot;</li>
      <li>Select &quot;reduce&quot;</li>
      <li>Badge pulse becomes opacity-only crossfade (no scale transforms)</li>
      <li>Focus Mode dim transition uses instant change</li>
    </ol>
    <div style={{ marginTop: '16px' }}>
      <HbcStatusBadge variant="inProgress" label="Animated" animate />
    </div>
  </div>
);
