/**
 * HbcConfirmDialog — Storybook stories
 * PH4.12 §Step 9 | Blueprint §1d
 */
import * as React from 'react';
import { FluentProvider } from '@fluentui/react-components';
import { hbcLightTheme, hbcFieldTheme } from '../theme/theme.js';
import { HbcConfirmDialog } from './index.js';

export default {
  title: 'PH4.12 Interactions/HbcConfirmDialog',
  component: HbcConfirmDialog,
  decorators: [
    (Story: React.FC) => (
      <FluentProvider theme={hbcLightTheme}>
        <Story />
      </FluentProvider>
    ),
  ],
};

/** Default: delete confirmation with danger button */
export const Default = () => {
  const [open, setOpen] = React.useState(true);
  return (
    <>
      <button onClick={() => setOpen(true)}>Open Confirm Dialog</button>
      <HbcConfirmDialog
        open={open}
        onClose={() => setOpen(false)}
        onConfirm={() => {
          alert('Deleted!');
          setOpen(false);
        }}
        title="Delete Commitment"
        description="This will permanently delete the commitment and all associated data. This action cannot be undone."
      />
    </>
  );
};

/** Warning variant for non-destructive confirmations */
export const WarningVariant = () => {
  const [open, setOpen] = React.useState(true);
  return (
    <>
      <button onClick={() => setOpen(true)}>Open Warning Dialog</button>
      <HbcConfirmDialog
        open={open}
        onClose={() => setOpen(false)}
        onConfirm={() => setOpen(false)}
        title="Reset Filters"
        description="This will reset all filters to their default values."
        confirmLabel="Reset"
        variant="warning"
      />
    </>
  );
};

export const AllVariants = () => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
    <div>
      <p style={{ fontSize: 12, fontWeight: 600, marginBottom: 4 }}>Danger (default)</p>
      <HbcConfirmDialog
        open
        onClose={() => {}}
        onConfirm={() => {}}
        title="Delete Commitment"
        description="This will permanently delete the commitment."
      />
    </div>
    <div>
      <p style={{ fontSize: 12, fontWeight: 600, marginBottom: 4 }}>Warning variant</p>
      <HbcConfirmDialog
        open
        onClose={() => {}}
        onConfirm={() => {}}
        title="Reset Filters"
        description="This will reset all filters to defaults."
        confirmLabel="Reset"
        variant="warning"
      />
    </div>
  </div>
);

export const FieldMode = () => (
  <FluentProvider theme={hbcFieldTheme}>
    <div style={{ padding: 24, backgroundColor: '#0F1419' }}>
      <HbcConfirmDialog
        open
        onClose={() => {}}
        onConfirm={() => {}}
        title="Delete Item"
        description="This action cannot be undone."
      />
    </div>
  </FluentProvider>
);

export const A11yTest = () => (
  <div>
    <p style={{ fontSize: '0.875rem', color: '#605E5C', marginBottom: '16px' }}>
      Dialog uses role=&quot;alertdialog&quot; with focus trap. Escape closes.
      Confirm button has focus by default. Tab cycles through Cancel and Confirm.
    </p>
    <HbcConfirmDialog
      open
      onClose={() => {}}
      onConfirm={() => {}}
      title="Confirm Action"
      description="Verify keyboard navigation and focus management."
    />
  </div>
);

/** Loading state on confirm button */
export const Loading = () => {
  const [open, setOpen] = React.useState(true);
  const [loading, setLoading] = React.useState(false);
  return (
    <>
      <button onClick={() => setOpen(true)}>Open Loading Dialog</button>
      <HbcConfirmDialog
        open={open}
        onClose={() => setOpen(false)}
        onConfirm={() => {
          setLoading(true);
          setTimeout(() => {
            setLoading(false);
            setOpen(false);
          }, 2000);
        }}
        title="Delete Project"
        description="Deleting this project will remove all associated data."
        loading={loading}
      />
    </>
  );
};
