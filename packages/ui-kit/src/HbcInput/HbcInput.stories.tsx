/**
 * HbcInput stories — PH4.6 §Step 7
 * TextArea, RichTextEditor, voice dictation, FieldMode
 */
import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { FluentProvider } from '@fluentui/react-components';
import { HbcTextArea } from './HbcTextArea.js';
import { HbcRichTextEditor } from './HbcRichTextEditor.js';
import { hbcFieldTheme } from '../theme/theme.js';

const meta: Meta = {
  title: 'Components/HbcInput',
};

export default meta;

export const Default: StoryObj = {
  render: () => {
    const [value, setValue] = React.useState('');
    return (
      <div style={{ maxWidth: '480px' }}>
        <HbcTextArea
          label="Description"
          value={value}
          onChange={setValue}
          placeholder="Enter a description..."
          maxLength={500}
        />
      </div>
    );
  },
};

export const RichTextEditor: StoryObj = {
  render: () => {
    const [value, setValue] = React.useState('<p>Start editing...</p>');
    return (
      <div style={{ maxWidth: '560px' }}>
        <HbcRichTextEditor
          label="Project Notes"
          value={value}
          onChange={setValue}
          placeholder="Enter rich text..."
          toolbar={['bold', 'italic', 'underline', 'list', 'link']}
        />
        <details style={{ marginTop: '12px', fontSize: '0.75rem' }}>
          <summary>Raw HTML</summary>
          <pre style={{ whiteSpace: 'pre-wrap', color: '#6B7280' }}>{value}</pre>
        </details>
      </div>
    );
  },
};

export const VoiceDictation: StoryObj = {
  name: 'Voice Dictation (Manual Test)',
  render: () => {
    const [value, setValue] = React.useState('');
    return (
      <div style={{ maxWidth: '480px' }}>
        <p style={{ fontSize: '0.875rem', color: '#605E5C', marginBottom: '16px' }}>
          Click the microphone icon to test voice dictation.
          Works in Chrome/Edge. Hidden in unsupported browsers.
        </p>
        <HbcTextArea
          label="Voice-enabled notes"
          value={value}
          onChange={setValue}
          placeholder="Click the mic icon or type..."
          enableVoice
        />
      </div>
    );
  },
};

export const AllVariants: StoryObj = {
  render: () => {
    const [text, setText] = React.useState('');
    const [rich, setRich] = React.useState('');
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 24, maxWidth: '480px' }}>
        <div>
          <p style={{ fontSize: 12, fontWeight: 600, marginBottom: 4 }}>TextArea</p>
          <HbcTextArea
            label="Description"
            value={text}
            onChange={setText}
            placeholder="Enter text..."
            maxLength={500}
          />
        </div>
        <div>
          <p style={{ fontSize: 12, fontWeight: 600, marginBottom: 4 }}>TextArea with voice</p>
          <HbcTextArea
            label="Voice-enabled"
            value=""
            onChange={() => {}}
            placeholder="Voice enabled..."
            enableVoice
          />
        </div>
        <div>
          <p style={{ fontSize: 12, fontWeight: 600, marginBottom: 4 }}>RichTextEditor</p>
          <HbcRichTextEditor
            label="Notes"
            value={rich}
            onChange={setRich}
            placeholder="Rich text..."
            toolbar={['bold', 'italic', 'underline', 'list', 'link']}
          />
        </div>
      </div>
    );
  },
};

export const A11yTest: StoryObj = {
  render: () => {
    const [value, setValue] = React.useState('');
    return (
      <div style={{ maxWidth: '480px' }}>
        <p style={{ fontSize: '0.875rem', color: '#605E5C', marginBottom: '16px' }}>
          Tab to text areas to verify focus ring. Labels are associated via htmlFor.
          Voice button is keyboard accessible.
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <HbcTextArea
            label="Accessible TextArea"
            value={value}
            onChange={setValue}
            placeholder="Tab here..."
          />
          <HbcRichTextEditor
            label="Accessible Rich Text"
            value=""
            onChange={() => {}}
            placeholder="Tab here..."
          />
        </div>
      </div>
    );
  },
};

export const FieldMode: StoryObj = {
  render: () => {
    const [textValue, setTextValue] = React.useState('');
    const [richValue, setRichValue] = React.useState('');
    return (
      <FluentProvider theme={hbcFieldTheme}>
        <div style={{ padding: '24px', backgroundColor: '#0F1419' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '480px' }}>
            <HbcTextArea
              label="Field Mode TextArea"
              value={textValue}
              onChange={setTextValue}
              placeholder="Field mode..."
            />
            <HbcRichTextEditor
              label="Field Mode Rich Text"
              value={richValue}
              onChange={setRichValue}
              placeholder="Field mode rich text..."
            />
          </div>
        </div>
      </FluentProvider>
    );
  },
};
