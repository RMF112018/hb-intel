/**
 * HbcKudosComposer stories — visual proof for the kudos submission
 * flyout, form, and preview presentation primitives.
 */
import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import {
  HbcKudosComposerFlyout,
  HbcKudosComposerForm,
  HbcKudosComposerPreview,
  type KudosComposerDraft,
  type KudosComposerValidationErrors,
} from './index.js';

const meta: Meta = {
  title: 'Homepage Surfaces/HbcKudosComposer',
  parameters: { layout: 'fullscreen' },
};
export default meta;

type Story = StoryObj;

const emptyDraft: KudosComposerDraft = {
  recipientNames: '',
  headline: '',
  excerpt: '',
  details: '',
};

const filledDraft: KudosComposerDraft = {
  recipientNames: 'Riley Brooks, Morgan Chen, Jamie Patel',
  headline: 'Outstanding Safety Leadership on the Riverside Project',
  excerpt:
    'Riley led the entire crew through a complex pour with zero incidents and stayed late three nights in a row to keep the schedule on track. The whole site felt the difference.',
  details: '',
};

function FlyoutFooter({
  onCancel,
  onSubmit,
  submitting,
}: {
  onCancel: () => void;
  onSubmit: () => void;
  submitting?: boolean;
}): React.JSX.Element {
  return (
    <>
      <button
        type="button"
        onClick={onCancel}
        style={{
          padding: '9px 20px',
          fontSize: '0.8125rem',
          fontWeight: 700,
          borderRadius: 8,
          border: '1.5px solid rgba(229, 126, 70, 0.2)',
          background: '#ffffff',
          color: '#1a1a1a',
          cursor: 'pointer',
          fontFamily: "'Segoe UI', sans-serif",
        }}
      >
        Cancel
      </button>
      <button
        type="button"
        onClick={onSubmit}
        disabled={submitting}
        style={{
          padding: '9px 20px',
          fontSize: '0.8125rem',
          fontWeight: 700,
          borderRadius: 8,
          border: 'none',
          background: submitting ? 'rgba(229, 126, 70, 0.5)' : '#e57e46',
          color: '#ffffff',
          cursor: submitting ? 'not-allowed' : 'pointer',
          fontFamily: "'Segoe UI', sans-serif",
        }}
      >
        {submitting ? 'Sending…' : 'Send Kudos'}
      </button>
    </>
  );
}

export const FlyoutEditing: Story = {
  render: () => {
    const [open, setOpen] = React.useState(true);
    const [draft, setDraft] = React.useState<KudosComposerDraft>(filledDraft);
    return (
      <div style={{ minHeight: '100vh', background: '#f5f5f5' }}>
        <button type="button" onClick={() => setOpen(true)}>
          Open
        </button>
        <HbcKudosComposerFlyout
          open={open}
          onClose={() => setOpen(false)}
          title="Give Kudos"
          footer={
            <FlyoutFooter onCancel={() => setOpen(false)} onSubmit={() => undefined} />
          }
        >
          <HbcKudosComposerForm
            draft={draft}
            onDraftChange={(p) => setDraft((d) => ({ ...d, ...p }))}
          />
          <div style={{ marginTop: 24 }}>
            <HbcKudosComposerPreview draft={draft} submitterName="Casey Nguyen" />
          </div>
        </HbcKudosComposerFlyout>
      </div>
    );
  },
};

export const FormWithErrors: Story = {
  render: () => {
    const errors: KudosComposerValidationErrors = {
      recipientNames: 'At least one recipient is required',
      headline: 'A headline is required',
    };
    return (
      <div style={{ maxWidth: 480, padding: 24 }}>
        <HbcKudosComposerForm
          draft={emptyDraft}
          onDraftChange={() => undefined}
          errors={errors}
        />
      </div>
    );
  },
};

export const PreviewEmpty: Story = {
  render: () => (
    <div style={{ maxWidth: 480, padding: 24 }}>
      <HbcKudosComposerPreview draft={emptyDraft} submitterName="" />
    </div>
  ),
};

export const PreviewFilled: Story = {
  render: () => (
    <div style={{ maxWidth: 480, padding: 24 }}>
      <HbcKudosComposerPreview draft={filledDraft} submitterName="Casey Nguyen" />
    </div>
  ),
};
