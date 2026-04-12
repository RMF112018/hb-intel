/**
 * HbcKudosComposer stories — doctrine-aligned visual proof for the
 * kudos submission flyout, form, preview, success, and error
 * surfaces.
 *
 * All stories drive the composer via typed `primaryAction` /
 * `secondaryAction` props — no inline-style footer shims — so the
 * stories exercise the same API consumers use in production.
 */
import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { FluentProvider } from '@fluentui/react-components';
import { hbcFieldTheme, hbcLightTheme } from '../theme/theme.js';
import {
  HbcKudosComposerFlyout,
  HbcKudosComposerForm,
  HbcKudosComposerPreview,
  HbcKudosComposerSuccess,
  HbcKudosComposerError,
} from './index.js';
import type { KudosComposerDraft, KudosComposerValidationErrors } from './types.js';

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

const emptyErrors: KudosComposerValidationErrors = {};

function ComposerHarness({
  initialOpen = true,
  initialDraft = filledDraft,
  submitterName = 'Casey Nguyen',
  submitting = false,
  errors = emptyErrors,
}: {
  initialOpen?: boolean;
  initialDraft?: KudosComposerDraft;
  submitterName?: string;
  submitting?: boolean;
  errors?: KudosComposerValidationErrors;
}): React.JSX.Element {
  const [open, setOpen] = React.useState(initialOpen);
  const [draft, setDraft] = React.useState<KudosComposerDraft>(initialDraft);
  return (
    <HbcKudosComposerFlyout
      open={open}
      onClose={() => setOpen(false)}
      title="Give Kudos"
      subtitle="Recognize outstanding work across the team."
      primaryAction={{
        label: 'Send Kudos',
        onClick: () => undefined,
        loading: submitting,
      }}
      secondaryAction={{
        label: 'Cancel',
        onClick: () => setOpen(false),
      }}
    >
      <HbcKudosComposerForm
        draft={draft}
        onDraftChange={(p) => setDraft((d) => ({ ...d, ...p }))}
        errors={errors}
      />
      <div style={{ marginTop: 24 }}>
        <HbcKudosComposerPreview draft={draft} submitterName={submitterName} />
      </div>
    </HbcKudosComposerFlyout>
  );
}

// ---------------------------------------------------------------------------
// Required design-system exports
// ---------------------------------------------------------------------------

export const Default: Story = {
  render: () => (
    <div style={{ minHeight: '100vh', background: '#f5f5f5' }}>
      <ComposerHarness />
    </div>
  ),
};

export const AllVariants: Story = {
  render: () => (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
        gap: 24,
        padding: 24,
        background: '#f5f5f5',
        minHeight: '100vh',
      }}
    >
      <section>
        <h4 style={{ margin: '0 0 8px' }}>Empty form</h4>
        <div style={{ background: '#fff', padding: 16, borderRadius: 8 }}>
          <HbcKudosComposerForm draft={emptyDraft} onDraftChange={() => undefined} />
        </div>
      </section>

      <section>
        <h4 style={{ margin: '0 0 8px' }}>Filled form</h4>
        <div style={{ background: '#fff', padding: 16, borderRadius: 8 }}>
          <HbcKudosComposerForm draft={filledDraft} onDraftChange={() => undefined} />
        </div>
      </section>

      <section>
        <h4 style={{ margin: '0 0 8px' }}>Form with errors</h4>
        <div style={{ background: '#fff', padding: 16, borderRadius: 8 }}>
          <HbcKudosComposerForm
            draft={emptyDraft}
            onDraftChange={() => undefined}
            errors={{
              recipientNames: 'At least one recipient is required',
              headline: 'A headline is required',
              excerpt: 'Tell us why this person deserves recognition.',
            }}
          />
        </div>
      </section>

      <section>
        <h4 style={{ margin: '0 0 8px' }}>Preview — empty</h4>
        <div style={{ background: '#fff', padding: 16, borderRadius: 8 }}>
          <HbcKudosComposerPreview draft={emptyDraft} submitterName="" />
        </div>
      </section>

      <section>
        <h4 style={{ margin: '0 0 8px' }}>Preview — filled</h4>
        <div style={{ background: '#fff', padding: 16, borderRadius: 8 }}>
          <HbcKudosComposerPreview draft={filledDraft} submitterName="Casey Nguyen" />
        </div>
      </section>

      <section>
        <h4 style={{ margin: '0 0 8px' }}>Success</h4>
        <div style={{ background: '#fff', padding: 16, borderRadius: 8 }}>
          <HbcKudosComposerSuccess />
        </div>
      </section>

      <section>
        <h4 style={{ margin: '0 0 8px' }}>Error banner</h4>
        <div style={{ background: '#fff', padding: 16, borderRadius: 8 }}>
          <HbcKudosComposerError body="Something went wrong while sending. Please try again." />
        </div>
      </section>
    </div>
  ),
};

export const FieldMode: Story = {
  render: () => (
    <FluentProvider theme={hbcFieldTheme}>
      <div style={{ padding: 24, backgroundColor: '#0F1419', minHeight: '100vh' }}>
        <ComposerHarness />
      </div>
    </FluentProvider>
  ),
};

export const A11yTest: Story = {
  render: () => (
    <FluentProvider theme={hbcLightTheme}>
      <div style={{ padding: 24, background: '#f5f5f5', minHeight: '100vh' }}>
        <section style={{ maxWidth: 640, marginBottom: 16 }}>
          <h3 style={{ marginTop: 0 }}>Accessibility expectations</h3>
          <ul>
            <li>The flyout is a dialog (<code>role="dialog"</code>, <code>aria-modal="true"</code>).</li>
            <li>Focus moves into the panel after the slide-in and is trapped with Tab / Shift+Tab.</li>
            <li><kbd>Escape</kbd> closes the flyout.</li>
            <li>Required fields are marked with a visible <code>*</code>.</li>
            <li>Error messages render below each invalid field; the submission error is a live <code>role="alert"</code> banner.</li>
            <li>Recipient chip remove buttons have <code>aria-label="Remove …"</code> and surface a tooltip on hover/focus.</li>
          </ul>
        </section>
        <ComposerHarness
          errors={{
            recipientNames: 'At least one recipient is required',
            headline: 'A headline is required',
          }}
        />
      </div>
    </FluentProvider>
  ),
};

// ---------------------------------------------------------------------------
// Scene extras — retained from prior coverage
// ---------------------------------------------------------------------------

export const FlyoutEditing: Story = {
  render: () => (
    <div style={{ minHeight: '100vh', background: '#f5f5f5' }}>
      <ComposerHarness />
    </div>
  ),
};

export const FormWithErrors: Story = {
  render: () => (
    <div style={{ maxWidth: 480, padding: 24 }}>
      <HbcKudosComposerForm
        draft={emptyDraft}
        onDraftChange={() => undefined}
        errors={{
          recipientNames: 'At least one recipient is required',
          headline: 'A headline is required',
        }}
      />
    </div>
  ),
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
