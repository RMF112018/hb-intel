/**
 * HbcRichTextEditor — ContentEditable rich text with toolbar + voice
 * PH4.6 §Step 7 | Blueprint §1d
 * No external rich-text dependency — uses contentEditable + execCommand
 */
import * as React from 'react';
import { Field, mergeClasses } from '@fluentui/react-components';
import { makeStyles } from '@griffel/react';
import { Microphone, MicrophoneActive } from '../icons/index.js';
import {
  HBC_ACCENT_ORANGE,
  HBC_SURFACE_LIGHT,
} from '../theme/tokens.js';
import { HBC_RADIUS_MD, HBC_RADIUS_SM } from '../theme/radii.js';
import { keyframes } from '../theme/animations.js';
import { HBC_SPACE_SM } from '../theme/grid.js';
import { useVoiceDictation } from './hooks/useVoiceDictation.js';
import type { HbcRichTextEditorProps, RichTextToolbarAction } from './types.js';

const DEFAULT_TOOLBAR: RichTextToolbarAction[] = ['bold', 'italic', 'underline', 'list', 'link'];

const TOOLBAR_COMMANDS: Record<RichTextToolbarAction, { label: string; command: string; value?: string }> = {
  bold: { label: 'B', command: 'bold' },
  italic: { label: 'I', command: 'italic' },
  underline: { label: 'U', command: 'underline' },
  list: { label: 'List', command: 'insertUnorderedList' },
  link: { label: 'Link', command: 'createLink' },
};

const useStyles = makeStyles({
  toolbar: {
    display: 'flex',
    gap: '2px',
    padding: '4px',
    borderBottom: `1px solid ${HBC_SURFACE_LIGHT['border-default']}`,
    backgroundColor: HBC_SURFACE_LIGHT['surface-1'],
    borderTopLeftRadius: HBC_RADIUS_MD,
    borderTopRightRadius: HBC_RADIUS_MD,
  },
  toolbarButton: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: '28px',
    height: '28px',
    border: 'none',
    borderRadius: HBC_RADIUS_SM,
    cursor: 'pointer',
    fontSize: '0.8125rem',
    fontWeight: '600',
    backgroundColor: 'transparent',
    color: HBC_SURFACE_LIGHT['text-primary'],
    ':hover': {
      backgroundColor: HBC_SURFACE_LIGHT['surface-2'],
    },
  },
  editorWrapper: {
    border: `1px solid ${HBC_SURFACE_LIGHT['border-default']}`,
    borderRadius: HBC_RADIUS_MD,
    overflow: 'hidden',
  },
  editorFocused: {
    border: `1px solid ${HBC_SURFACE_LIGHT['border-focus']}`,
    outlineWidth: '1px',
    outlineStyle: 'solid',
    outlineColor: HBC_SURFACE_LIGHT['border-focus'],
  },
  contentEditable: {
    minHeight: '100px',
    padding: `${HBC_SPACE_SM}px 12px`,
    fontSize: '0.875rem',
    lineHeight: '1.5',
    outline: 'none',
    backgroundColor: HBC_SURFACE_LIGHT['surface-0'],
    color: HBC_SURFACE_LIGHT['text-primary'],
  },
  disabled: {
    opacity: '0.5',
    pointerEvents: 'none' as const,
  },
  micButton: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '28px',
    height: '28px',
    border: 'none',
    borderRadius: HBC_RADIUS_SM,
    cursor: 'pointer',
    backgroundColor: 'transparent',
    color: HBC_SURFACE_LIGHT['text-muted'],
    marginLeft: 'auto',
    ':hover': {
      backgroundColor: HBC_SURFACE_LIGHT['surface-2'],
    },
  },
  micActive: {
    color: HBC_ACCENT_ORANGE,
    animationName: keyframes.pulse,
    animationDuration: '1.5s',
    animationIterationCount: 'infinite',
  },
  placeholder: {
    color: HBC_SURFACE_LIGHT['text-muted'],
  },
});

export const HbcRichTextEditor: React.FC<HbcRichTextEditorProps> = ({
  label,
  value,
  onChange,
  placeholder,
  required,
  disabled,
  validationMessage,
  enableVoice = true,
  toolbar = DEFAULT_TOOLBAR,
  className,
}) => {
  const styles = useStyles();
  const editorRef = React.useRef<HTMLDivElement>(null);
  const voice = useVoiceDictation();
  const [focused, setFocused] = React.useState(false);

  // Sync value to contentEditable (only when externally changed)
  const isInternalChange = React.useRef(false);
  React.useEffect(() => {
    if (editorRef.current && !isInternalChange.current) {
      if (editorRef.current.innerHTML !== value) {
        editorRef.current.innerHTML = value;
      }
    }
    isInternalChange.current = false;
  }, [value]);

  const handleInput = React.useCallback(() => {
    if (editorRef.current) {
      isInternalChange.current = true;
      onChange(editorRef.current.innerHTML);
    }
  }, [onChange]);

  const execCommand = React.useCallback((command: string, action: RichTextToolbarAction) => {
    if (action === 'link') {
      const url = prompt('Enter URL:'); // eslint-disable-line no-restricted-globals
      if (url) {
        document.execCommand(command, false, url);
      }
    } else {
      document.execCommand(command, false);
    }
    editorRef.current?.focus();
    handleInput();
  }, [handleInput]);

  // Voice dictation: insert at cursor
  const lastTranscriptRef = React.useRef('');
  React.useEffect(() => {
    if (voice.transcript && voice.transcript !== lastTranscriptRef.current) {
      lastTranscriptRef.current = voice.transcript;
      if (editorRef.current) {
        editorRef.current.focus();
        document.execCommand('insertText', false, voice.transcript);
        handleInput();
      }
    }
  }, [voice.transcript, handleInput]);

  const showMic = enableVoice && voice.isSupported && !disabled;
  const isEmpty = !value || value === '<br>' || value === '<div><br></div>';

  return (
    <div data-hbc-ui="rich-text-editor" className={className}>
      <Field
        label={label}
        required={required}
        validationMessage={validationMessage}
        validationState={validationMessage ? 'error' : undefined}
      >
        <div
          className={mergeClasses(styles.editorWrapper, disabled && styles.disabled, focused && styles.editorFocused)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
        >
          <div className={styles.toolbar}>
            {toolbar.map((action) => {
              const cmd = TOOLBAR_COMMANDS[action];
              return (
                <button
                  key={action}
                  type="button"
                  className={styles.toolbarButton}
                  onClick={() => execCommand(cmd.command, action)}
                  title={action}
                  aria-label={action}
                >
                  {cmd.label}
                </button>
              );
            })}
            {showMic && (
              <button
                type="button"
                className={mergeClasses(
                  styles.micButton,
                  voice.isListening && styles.micActive,
                )}
                onClick={voice.isListening ? voice.stopListening : voice.startListening}
                aria-label={voice.isListening ? 'Stop dictation' : 'Start voice dictation'}
              >
                {voice.isListening ? <MicrophoneActive size="sm" /> : <Microphone size="sm" />}
              </button>
            )}
          </div>
          <div
            ref={editorRef}
            className={mergeClasses(
              styles.contentEditable,
              isEmpty && styles.placeholder,
            )}
            contentEditable={!disabled}
            onInput={handleInput}
            role="textbox"
            aria-label={label}
            aria-multiline="true"
            aria-required={required}
            data-placeholder={placeholder}
            suppressContentEditableWarning
          />
        </div>
      </Field>
    </div>
  );
};
