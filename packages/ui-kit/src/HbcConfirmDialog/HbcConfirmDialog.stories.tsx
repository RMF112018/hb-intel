/**
 * HbcConfirmDialog — Storybook stories
 * PH4.12 §Step 9 | Blueprint §1d
 */
import * as React from 'react';
import { FluentProvider } from '@fluentui/react-components';
import { hbcLightTheme } from '../theme/theme.js';
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
