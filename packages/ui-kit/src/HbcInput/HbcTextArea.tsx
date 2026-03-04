/**
 * HbcTextArea — Multi-line input with optional voice dictation
 * PH4.6 §Step 7 | Blueprint §1d
 */
import * as React from 'react';
import { Field, Textarea, mergeClasses } from '@fluentui/react-components';
import { makeStyles } from '@griffel/react';
import { Microphone, MicrophoneActive } from '../icons/index.js';
import { HBC_ACCENT_ORANGE, HBC_SURFACE_LIGHT } from '../theme/tokens.js';
import { keyframes } from '../theme/animations.js';
import { useVoiceDictation } from './hooks/useVoiceDictation.js';
import type { HbcTextAreaProps } from './types.js';

const useStyles = makeStyles({
  wrapper: {
    position: 'relative',
  },
  micButton: {
    position: 'absolute',
    right: '8px',
    bottom: '8px',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '32px',
    height: '32px',
    border: 'none',
    borderRadius: '50%',
    cursor: 'pointer',
    backgroundColor: 'transparent',
    color: HBC_SURFACE_LIGHT['text-muted'],
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
  charCount: {
    fontSize: '0.75rem',
    color: HBC_SURFACE_LIGHT['text-muted'],
    textAlign: 'right' as const,
    marginTop: '4px',
  },
});

export const HbcTextArea: React.FC<HbcTextAreaProps> = ({
  label,
  value,
  onChange,
  placeholder,
  required,
  disabled,
  validationMessage,
  rows = 4,
  maxLength,
  className,
  enableVoice = true,
}) => {
  const styles = useStyles();
  const voice = useVoiceDictation();

  // When voice transcript updates, append to value
  const lastTranscriptRef = React.useRef('');
  React.useEffect(() => {
    if (voice.transcript && voice.transcript !== lastTranscriptRef.current) {
      lastTranscriptRef.current = voice.transcript;
      const separator = value && !value.endsWith(' ') ? ' ' : '';
      onChange(value + separator + voice.transcript);
    }
  }, [voice.transcript, value, onChange]);

  const showMic = enableVoice && voice.isSupported && !disabled;

  return (
    <div data-hbc-ui="text-area" className={className}>
      <Field
        label={label}
        required={required}
        validationMessage={validationMessage}
        validationState={validationMessage ? 'error' : undefined}
      >
        <div className={styles.wrapper}>
          <Textarea
            value={value}
            onChange={(_e, data) => onChange(data.value)}
            placeholder={placeholder}
            disabled={disabled}
            rows={rows}
            maxLength={maxLength}
            style={{ paddingRight: showMic ? '44px' : undefined }}
          />
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
              {voice.isListening ? (
                <MicrophoneActive size="sm" />
              ) : (
                <Microphone size="sm" />
              )}
            </button>
          )}
        </div>
      </Field>
      {maxLength && (
        <div className={styles.charCount}>
          {value.length}/{maxLength}
        </div>
      )}
    </div>
  );
};
