/**
 * HbcForm stories — PH4.6 §Step 8 + PH4.11 §Step 8
 * Form wrapper + collapsible sections + sticky footer + form architecture
 */
import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { FluentProvider } from '@fluentui/react-components';
import { z } from 'zod';
import { HbcForm } from './HbcForm.js';
import { HbcFormSection } from './HbcFormSection.js';
import { HbcFormRow } from './HbcFormRow.js';
import { HbcStickyFormFooter } from './HbcStickyFormFooter.js';
import { HbcTextField } from './HbcTextField.js';
import { HbcSelect } from './HbcSelect.js';
import { HbcCheckbox } from './HbcCheckbox.js';
import { useHbcFormContext } from './HbcFormContext.js';
import { hbcFieldTheme } from '../theme/theme.js';

const meta: Meta = {
  title: 'Components/HbcForm',
};

export default meta;

export const Default: StoryObj = {
  render: () => {
    const [name, setName] = React.useState('');
    const [type, setType] = React.useState('');
    return (
      <div style={{ maxWidth: '560px' }}>
        <HbcForm onSubmit={() => alert('Submitted!')}>
          <HbcFormSection title="Project Details" description="Basic project information">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <HbcTextField label="Project Name" value={name} onChange={setName} required />
              <HbcSelect
                label="Project Type"
                value={type}
                onChange={setType}
                options={[
                  { value: 'commercial', label: 'Commercial' },
                  { value: 'residential', label: 'Residential' },
                  { value: 'infrastructure', label: 'Infrastructure' },
                ]}
              />
            </div>
          </HbcFormSection>
        </HbcForm>
      </div>
    );
  },
};

export const CollapsibleSections: StoryObj = {
  render: () => {
    const [v1, setV1] = React.useState('');
    const [v2, setV2] = React.useState('');
    const [v3, setV3] = React.useState(false);
    return (
      <div style={{ maxWidth: '560px' }}>
        <HbcForm onSubmit={() => alert('Submitted!')}>
          <HbcFormSection title="General" collapsible defaultExpanded>
            <HbcTextField label="Company Name" value={v1} onChange={setV1} />
          </HbcFormSection>
          <HbcFormSection title="Advanced Settings" description="Configure optional features" collapsible defaultExpanded={false}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <HbcTextField label="API Endpoint" value={v2} onChange={setV2} />
              <HbcCheckbox label="Enable notifications" checked={v3} onChange={setV3} />
            </div>
          </HbcFormSection>
        </HbcForm>
      </div>
    );
  },
};

export const StickyFooter: StoryObj = {
  render: () => {
    const [name, setName] = React.useState('');
    return (
      <div style={{ maxWidth: '560px', height: '400px', overflow: 'auto', border: '1px solid #D1D5DB', borderRadius: '4px' }}>
        <HbcForm
          onSubmit={() => alert('Saved!')}
          stickyFooter={
            <>
              <button type="button" style={{ padding: '8px 16px', border: '1px solid #D1D5DB', borderRadius: '4px', cursor: 'pointer', backgroundColor: 'transparent' }}>Cancel</button>
              <button type="submit" style={{ padding: '8px 16px', backgroundColor: '#F37021', color: '#FFF', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 600 }}>Save</button>
            </>
          }
        >
          <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <HbcFormSection title="Section 1">
              <HbcTextField label="Field A" value={name} onChange={setName} />
            </HbcFormSection>
            <HbcFormSection title="Section 2">
              <HbcTextField label="Field B" value="" onChange={() => {}} />
            </HbcFormSection>
            <HbcFormSection title="Section 3">
              <HbcTextField label="Field C" value="" onChange={() => {}} />
            </HbcFormSection>
            <HbcFormSection title="Section 4 (scroll down)">
              <HbcTextField label="Field D" value="" onChange={() => {}} />
            </HbcFormSection>
          </div>
        </HbcForm>
      </div>
    );
  },
};

export const AllVariants: StoryObj = {
  render: () => {
    const [v1, setV1] = React.useState('');
    const [v2, setV2] = React.useState('');
    const [v3, setV3] = React.useState(false);
    const [sel, setSel] = React.useState('');
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 24, maxWidth: '560px' }}>
        <div>
          <p style={{ fontSize: 12, fontWeight: 600, marginBottom: 4 }}>Basic form</p>
          <HbcForm onSubmit={() => {}}>
            <HbcFormSection title="Project Details">
              <HbcTextField label="Name" value={v1} onChange={setV1} />
            </HbcFormSection>
          </HbcForm>
        </div>
        <div>
          <p style={{ fontSize: 12, fontWeight: 600, marginBottom: 4 }}>Collapsible sections</p>
          <HbcForm onSubmit={() => {}}>
            <HbcFormSection title="General" collapsible defaultExpanded>
              <HbcTextField label="Company" value={v2} onChange={setV2} />
            </HbcFormSection>
            <HbcFormSection title="Advanced" collapsible defaultExpanded={false}>
              <HbcCheckbox label="Notifications" checked={v3} onChange={setV3} />
            </HbcFormSection>
          </HbcForm>
        </div>
        <div>
          <p style={{ fontSize: 12, fontWeight: 600, marginBottom: 4 }}>Form row layout</p>
          <HbcForm onSubmit={() => {}}>
            <div style={{ padding: '16px' }}>
              <HbcFormRow>
                <HbcTextField label="First Name" value="" onChange={() => {}} />
                <HbcTextField label="Last Name" value="" onChange={() => {}} />
              </HbcFormRow>
            </div>
          </HbcForm>
        </div>
        <div>
          <p style={{ fontSize: 12, fontWeight: 600, marginBottom: 4 }}>With select + checkbox</p>
          <HbcForm onSubmit={() => {}}>
            <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <HbcSelect
                label="Role"
                value={sel}
                onChange={setSel}
                options={[
                  { value: 'pm', label: 'Project Manager' },
                  { value: 'est', label: 'Estimator' },
                ]}
              />
              <HbcCheckbox label="Accept terms" checked={v3} onChange={setV3} />
            </div>
          </HbcForm>
        </div>
      </div>
    );
  },
};

export const FieldMode: StoryObj = {
  render: () => {
    const [name, setName] = React.useState('');
    return (
      <FluentProvider theme={hbcFieldTheme}>
        <div style={{ padding: '24px', backgroundColor: '#0F1419', maxWidth: '560px' }}>
          <HbcForm onSubmit={() => {}}>
            <HbcFormSection title="Field Mode Form" description="Dark theme for outdoor use" collapsible>
              <HbcTextField label="Project Name" value={name} onChange={setName} />
            </HbcFormSection>
          </HbcForm>
        </div>
      </FluentProvider>
    );
  },
};

// ---------------------------------------------------------------------------
// PH4.11 — New stories
// ---------------------------------------------------------------------------

export const ErrorSummary: StoryObj = {
  render: () => {
    const [name, setName] = React.useState('');
    const [email, setEmail] = React.useState('');
    return (
      <div style={{ maxWidth: '560px' }}>
        <HbcForm onSubmit={() => {}} showErrorSummary>
          <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <HbcTextField
              label="Project Name"
              value={name}
              onChange={setName}
              fieldId="name"
              required
              onBlurValidate={(v) => (!v ? 'Project name is required' : undefined)}
            />
            <HbcTextField
              label="Email"
              value={email}
              onChange={setEmail}
              fieldId="email"
              required
              onBlurValidate={(v) => {
                if (!v) return 'Email is required';
                if (!v.includes('@')) return 'Must be a valid email address';
                return undefined;
              }}
            />
          </div>
        </HbcForm>
        <p style={{ marginTop: '8px', fontSize: '0.8125rem', color: '#6B7280' }}>
          Click into fields and then tab out to trigger blur validation.
          Error summary banner appears at the top with anchor links.
        </p>
      </div>
    );
  },
};

export const DirtyTracking: StoryObj = {
  render: () => {
    const [name, setName] = React.useState('');
    const [isDirty, setIsDirty] = React.useState(false);
    return (
      <div style={{ maxWidth: '560px' }}>
        <div style={{ marginBottom: '8px', padding: '8px', backgroundColor: isDirty ? '#FFF0D4' : '#CCF3E6', borderRadius: '4px', fontSize: '0.875rem' }}>
          Form is {isDirty ? 'dirty (unsaved changes)' : 'clean'}
        </div>
        <HbcForm onSubmit={() => {}} onDirtyChange={setIsDirty}>
          <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <HbcTextField
              label="Project Name"
              value={name}
              onChange={setName}
              fieldId="name"
            />
            <HbcCheckbox
              label="Active project"
              checked={false}
              onChange={() => {}}
              fieldId="active"
            />
          </div>
        </HbcForm>
      </div>
    );
  },
};

export const FormRowResponsive: StoryObj = {
  render: () => {
    const [first, setFirst] = React.useState('');
    const [last, setLast] = React.useState('');
    const [city, setCity] = React.useState('');
    const [state, setState] = React.useState('');
    const [zip, setZip] = React.useState('');
    return (
      <div style={{ maxWidth: '640px' }}>
        <HbcForm onSubmit={() => {}}>
          <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <HbcFormRow>
              <HbcTextField label="First Name" value={first} onChange={setFirst} />
              <HbcTextField label="Last Name" value={last} onChange={setLast} />
            </HbcFormRow>
            <HbcFormRow gap="12px">
              <HbcTextField label="City" value={city} onChange={setCity} />
              <HbcTextField label="State" value={state} onChange={setState} />
              <HbcTextField label="ZIP" value={zip} onChange={setZip} />
            </HbcFormRow>
          </div>
        </HbcForm>
        <p style={{ marginTop: '8px', fontSize: '0.8125rem', color: '#6B7280' }}>
          Resize the browser below 768px to see fields stack vertically.
        </p>
      </div>
    );
  },
};

export const StickyFormFooterComponent: StoryObj = {
  render: () => {
    const [name, setName] = React.useState('');
    const [loading, setLoading] = React.useState(false);
    return (
      <div style={{ maxWidth: '560px', height: '400px', overflow: 'auto', border: '1px solid #D1D5DB', borderRadius: '4px' }}>
        <HbcForm
          onSubmit={() => { setLoading(true); setTimeout(() => setLoading(false), 2000); }}
          stickyFooter={
            <HbcStickyFormFooter
              onCancel={() => alert('Cancelled')}
              primaryLoading={loading}
              primaryDisabled={!name}
            />
          }
        >
          <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <HbcFormSection title="Section 1">
              <HbcTextField label="Project Name" value={name} onChange={setName} fieldId="name" required />
            </HbcFormSection>
            <HbcFormSection title="Section 2">
              <HbcTextField label="Field B" value="" onChange={() => {}} />
            </HbcFormSection>
            <HbcFormSection title="Section 3">
              <HbcTextField label="Field C" value="" onChange={() => {}} />
            </HbcFormSection>
            <HbcFormSection title="Section 4 (scroll down)">
              <HbcTextField label="Field D" value="" onChange={() => {}} />
            </HbcFormSection>
          </div>
        </HbcForm>
      </div>
    );
  },
};

export const InlineValidation: StoryObj = {
  render: () => {
    const [name, setName] = React.useState('');
    const [type, setType] = React.useState('');
    return (
      <div style={{ maxWidth: '560px' }}>
        <HbcForm onSubmit={() => {}}>
          <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <HbcTextField
              label="Project Name"
              value={name}
              onChange={setName}
              fieldId="name"
              required
              onBlurValidate={(v) => {
                if (!v) return 'Project name is required';
                if (v.length < 3) return 'Must be at least 3 characters';
                return undefined;
              }}
            />
            <HbcSelect
              label="Project Type"
              value={type}
              onChange={setType}
              fieldId="type"
              required
              options={[
                { value: '', label: '— Select —', disabled: true },
                { value: 'commercial', label: 'Commercial' },
                { value: 'residential', label: 'Residential' },
              ]}
              onChangeValidate={(v) => (!v ? 'Please select a type' : undefined)}
            />
          </div>
        </HbcForm>
        <p style={{ marginTop: '8px', fontSize: '0.8125rem', color: '#6B7280' }}>
          Text field validates on blur. Select validates on change.
        </p>
      </div>
    );
  },
};

export const VoiceDictation: StoryObj = {
  render: () => {
    return (
      <div style={{ maxWidth: '560px', padding: '16px' }}>
        <p style={{ marginBottom: '12px', fontSize: '0.875rem', color: '#6B7280' }}>
          Voice dictation is available on HbcTextArea and HbcRichTextEditor
          (separate components from HbcInput). The microphone icon appears
          when <code>enableVoice</code> is set. See HbcInput stories for live demos.
        </p>
      </div>
    );
  },
};

export const TouchTargets: StoryObj = {
  render: () => {
    const [name, setName] = React.useState('');
    const [type, setType] = React.useState('');
    return (
      <div style={{ maxWidth: '560px' }}>
        <HbcForm onSubmit={() => {}}>
          <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <HbcTextField label="Name" value={name} onChange={setName} fieldId="name" />
            <HbcSelect
              label="Type"
              value={type}
              onChange={setType}
              fieldId="type"
              options={[
                { value: 'a', label: 'Option A' },
                { value: 'b', label: 'Option B' },
              ]}
            />
            <HbcCheckbox label="Accept terms" checked={false} onChange={() => {}} fieldId="terms" />
          </div>
        </HbcForm>
        <p style={{ marginTop: '8px', fontSize: '0.8125rem', color: '#6B7280' }}>
          On touch devices (pointer: coarse + width &lt; 1024), inputs get 56px min-height.
          Use Chrome DevTools device toolbar to test.
        </p>
      </div>
    );
  },
};

export const A11yTest: StoryObj = {
  render: () => {
    const [name, setName] = React.useState('');
    const [email, setEmail] = React.useState('');
    const [type, setType] = React.useState('');
    const [agree, setAgree] = React.useState(false);
    return (
      <div style={{ maxWidth: '560px' }}>
        <HbcForm onSubmit={() => {}} showErrorSummary>
          <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <HbcFormRow>
              <HbcTextField
                label="Name"
                value={name}
                onChange={setName}
                fieldId="a11y-name"
                required
                onBlurValidate={(v) => (!v ? 'Name is required' : undefined)}
              />
              <HbcTextField
                label="Email"
                value={email}
                onChange={setEmail}
                fieldId="a11y-email"
                required
                type="email"
                onBlurValidate={(v) => {
                  if (!v) return 'Email is required';
                  if (!v.includes('@')) return 'Invalid email';
                  return undefined;
                }}
              />
            </HbcFormRow>
            <HbcSelect
              label="Role"
              value={type}
              onChange={setType}
              fieldId="a11y-role"
              required
              options={[
                { value: 'pm', label: 'Project Manager' },
                { value: 'est', label: 'Estimator' },
                { value: 'exec', label: 'Executive' },
              ]}
              onChangeValidate={(v) => (!v ? 'Role is required' : undefined)}
            />
            <HbcCheckbox
              label="I agree to the terms"
              checked={agree}
              onChange={setAgree}
              fieldId="a11y-agree"
            />
          </div>
        </HbcForm>
        <p style={{ marginTop: '8px', fontSize: '0.8125rem', color: '#6B7280' }}>
          Full accessibility test: Tab through fields, trigger validation,
          verify error summary links scroll+focus, check ARIA states.
        </p>
      </div>
    );
  },
};

export const SchemaValidationWithDraft: StoryObj = {
  render: () => {
    const schema = z.object({
      projectName: z.string().min(3, 'Project name must be at least 3 characters'),
      contactEmail: z.string().email('Contact email must be a valid email address'),
      projectType: z.string().min(1, 'Project type is required'),
      acceptTerms: z.boolean().refine((value) => value, 'You must accept terms'),
    });

    const [draft, setDraft] = React.useState<Record<string, unknown> | undefined>();
    const [result, setResult] = React.useState<string>('No submit yet');

    // Story-safe draft helper that mirrors useFormDraft ergonomics without
    // introducing ui-kit -> query-hooks coupling.
    const restoreDraftValues = React.useCallback(
      (fallback: Record<string, unknown>): Record<string, unknown> => ({
        ...fallback,
        ...(draft ?? {}),
      }),
      [draft],
    );

    const defaultValues = React.useMemo(
      () =>
        restoreDraftValues({
          projectName: '',
          contactEmail: '',
          projectType: '',
          acceptTerms: false,
        }),
      [restoreDraftValues],
    );

    const DraftActions: React.FC = () => {
      const form = useHbcFormContext();

      return (
        <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
          <button
            type="button"
            onClick={() => {
              setDraft(form.getValues());
              setResult('Draft saved from centralized form context');
            }}
          >
            Save Draft
          </button>
          <button
            type="button"
            onClick={() => {
              if (!draft) {
                setResult('No draft to restore');
                return;
              }
              form.reset(draft);
              setResult('Draft restored via context reset()');
            }}
          >
            Restore Draft
          </button>
          <button
            type="button"
            onClick={() => {
              setDraft(undefined);
              setResult('Draft cleared');
            }}
          >
            Clear Draft
          </button>
        </div>
      );
    };

    return (
      <div style={{ maxWidth: '640px' }}>
        <HbcForm
          schema={schema}
          defaultValues={defaultValues}
          showErrorSummary
          onValidSubmit={(values) => {
            setResult(`Submitted: ${JSON.stringify(values)}`);
            setDraft(undefined);
          }}
        >
          <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <DraftActions />
            <HbcTextField
              name="projectName"
              fieldId="projectName"
              label="Project Name"
              required
            />
            <HbcTextField
              name="contactEmail"
              fieldId="contactEmail"
              label="Contact Email"
              required
              type="email"
            />
            <HbcSelect
              name="projectType"
              fieldId="projectType"
              label="Project Type"
              required
              options={[
                { value: 'commercial', label: 'Commercial' },
                { value: 'residential', label: 'Residential' },
                { value: 'infrastructure', label: 'Infrastructure' },
              ]}
            />
            <HbcCheckbox
              name="acceptTerms"
              fieldId="acceptTerms"
              label="I accept terms and conditions"
            />
            <HbcStickyFormFooter
              onCancel={() => setResult('Canceled')}
              primaryLabel="Submit"
            />
          </div>
        </HbcForm>
        <p style={{ marginTop: '8px', fontSize: '0.8125rem', color: '#6B7280' }}>
          {result}
        </p>
      </div>
    );
  },
};
