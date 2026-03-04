/**
 * HbcInput types — PH4.6 §Step 7
 * TextArea, RichTextEditor, voice dictation interfaces
 */

export interface HbcTextAreaProps {
  /** Field label */
  label: string;
  /** Controlled value */
  value: string;
  /** Change handler */
  onChange: (value: string) => void;
  /** Placeholder text */
  placeholder?: string;
  /** Required field */
  required?: boolean;
  /** Disabled state */
  disabled?: boolean;
  /** Validation error message */
  validationMessage?: string;
  /** Number of visible rows (default 4) */
  rows?: number;
  /** Character limit */
  maxLength?: number;
  /** Additional CSS class */
  className?: string;
  /** Enable voice dictation button (default true) */
  enableVoice?: boolean;
}

export type RichTextToolbarAction = 'bold' | 'italic' | 'underline' | 'list' | 'link';

export interface HbcRichTextEditorProps {
  /** Field label */
  label: string;
  /** Controlled HTML string value */
  value: string;
  /** Change handler (returns HTML string) */
  onChange: (value: string) => void;
  /** Placeholder text */
  placeholder?: string;
  /** Required field */
  required?: boolean;
  /** Disabled state */
  disabled?: boolean;
  /** Validation error message */
  validationMessage?: string;
  /** Enable voice dictation (default true) */
  enableVoice?: boolean;
  /** Toolbar actions subset */
  toolbar?: RichTextToolbarAction[];
  /** Additional CSS class */
  className?: string;
}

export interface UseVoiceDictationReturn {
  /** Web Speech API is available in this browser */
  isSupported: boolean;
  /** Currently listening */
  isListening: boolean;
  /** Start speech recognition */
  startListening: () => void;
  /** Stop speech recognition */
  stopListening: () => void;
  /** Current transcript text */
  transcript: string;
  /** Error message if recognition fails */
  error: string | null;
}
