/**
 * HbcForm stories — PH4.6 §Step 8
 * Form wrapper + collapsible sections + sticky footer
 */
import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { FluentProvider } from '@fluentui/react-components';
import { HbcForm } from './HbcForm.js';
import { HbcFormSection } from './HbcFormSection.js';
import { HbcTextField } from './HbcTextField.js';
import { HbcSelect } from './HbcSelect.js';
import { HbcCheckbox } from './HbcCheckbox.js';
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
