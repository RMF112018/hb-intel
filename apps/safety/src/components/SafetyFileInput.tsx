import { useId, useRef, type ChangeEvent, type ReactNode } from 'react';
import { HbcTypography } from '@hbc/ui-kit';

/**
 * SafetyFileInput — Phase-04 audit G-09 concrete remediation.
 *
 * Replaces the tactical hidden `<input type="file">` that the audit called
 * out as a governance exception on UploadPage. This primitive:
 *   - owns the hidden input internally,
 *   - exposes a real labeled button affordance as the visible trigger,
 *   - associates the purpose label via aria-labelledby and help / error /
 *     current-selection text via aria-describedby / aria-errormessage,
 *   - supports replace-file and explicit clear,
 *   - honors disabled across trigger, clear control, and underlying input,
 *   - reports selection through onFileSelected; it does NOT own readiness
 *     logic (consumer pages continue to derive submit-readiness from their
 *     own state machines).
 *
 * Implementation note on the trigger button: the Safety app's standard
 * HbcButton primitive does not forward arbitrary aria-* attributes, and the
 * audit requires programmatic label / describedby / errormessage association.
 * This primitive therefore renders a native <button> styled to match the
 * HbcButton secondary variant. The eslint rule
 * `@hb-intel/hbc/no-raw-form-elements` does not cover <button>; this is
 * intentional — consumer feature code still goes through HbcButton, but
 * this governed primitive is the sanctioned low-level wrapper.
 *
 * Keyboard: the visible trigger is a real <button>, so Enter and Space
 * activate the file picker via the browser's native button semantics.
 * The hidden <input> is tab-inert (aria-hidden + tabIndex=-1); it exists
 * only as the file-selection surface the trigger delegates to.
 */

export interface SafetyFileInputProps {
  /** Stable id root. If omitted, a generated id is used. */
  readonly id?: string;
  /** Required label describing the input's purpose (e.g. "Checklist workbook"). */
  readonly label: ReactNode;
  /** Optional help text rendered and associated via aria-describedby. */
  readonly helpText?: ReactNode;
  /** Optional error text — when present, associated via aria-errormessage and role="alert". */
  readonly errorText?: ReactNode;
  /** MIME / extension filter passed to the hidden input. */
  readonly accept?: string;
  /** Disables the trigger, clear control, and file selection. */
  readonly disabled?: boolean;
  /** Currently-selected file (controlled). */
  readonly selectedFile: File | null;
  /** Fires when the user selects or replaces a file. */
  readonly onFileSelected: (file: File | null) => void;
  /** If provided, a "Clear file" affordance is rendered when a file is selected. */
  readonly onClear?: () => void;
  /** Trigger label. Defaults to "Choose file" / "Replace file" based on state. */
  readonly buttonLabel?: string;
  /** Clear-control label. Defaults to "Clear file". */
  readonly clearLabel?: string;
}

function formatBytes(size: number): string {
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${Math.round(size / 102.4) / 10} KB`;
  return `${Math.round(size / (1024 * 104.858)) / 10} MB`;
}

export function SafetyFileInput({
  id,
  label,
  helpText,
  errorText,
  accept,
  disabled = false,
  selectedFile,
  onFileSelected,
  onClear,
  buttonLabel,
  clearLabel = 'Clear file',
}: SafetyFileInputProps): ReactNode {
  const reactId = useId();
  const rootId = id ?? `safety-file-input-${reactId}`;
  const labelId = `${rootId}-label`;
  const helpId = `${rootId}-help`;
  const errorId = `${rootId}-error`;
  const filenameId = `${rootId}-filename`;

  const inputRef = useRef<HTMLInputElement | null>(null);

  const openPicker = (): void => {
    if (disabled) return;
    const el = inputRef.current;
    if (!el) return;
    // Reset value before opening so selecting the same file again re-fires
    // the change event (browsers suppress change when value is unchanged).
    el.value = '';
    el.click();
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>): void => {
    const next = e.target.files?.[0] ?? null;
    onFileSelected(next);
  };

  const handleClear = (): void => {
    if (disabled || !onClear) return;
    const el = inputRef.current;
    if (el) el.value = '';
    onClear();
  };

  const hasFile = selectedFile !== null;
  const trigger = buttonLabel ?? (hasFile ? 'Replace file' : 'Choose file');
  const showClear = hasFile && onClear && !disabled;

  // Compose aria-describedby from visible text that actually exists.
  const describedBy = [
    helpText ? helpId : null,
    hasFile ? filenameId : null,
  ]
    .filter((x): x is string => x !== null)
    .join(' ') || undefined;

  return (
    <div
      data-safety-ui="file-input"
      className="safety-file-input"
      role="group"
      aria-labelledby={labelId}
      aria-describedby={describedBy}
      aria-errormessage={errorText ? errorId : undefined}
      aria-invalid={errorText ? true : undefined}
    >
      <span id={labelId} className="safety-file-input__label">
        <HbcTypography intent="label">{label}</HbcTypography>
      </span>

      {/* Hidden input is an internal detail of this primitive. Tab-inert by design. */}
      {/* eslint-disable @hb-intel/hbc/no-raw-form-elements, @hb-intel/hbc/no-inline-styles -- governed primitive: hidden input replaces the UploadPage tactical exception. */}
      <input
        ref={inputRef}
        id={rootId}
        type="file"
        accept={accept}
        disabled={disabled}
        onChange={handleChange}
        aria-hidden="true"
        tabIndex={-1}
        style={{ display: 'none' }}
      />
      {/* eslint-enable @hb-intel/hbc/no-raw-form-elements, @hb-intel/hbc/no-inline-styles */}

      <div className="safety-upload__drop-zone-row">
        <button
          type="button"
          className="safety-file-input__trigger"
          onClick={openPicker}
          disabled={disabled}
          aria-describedby={describedBy}
          aria-errormessage={errorText ? errorId : undefined}
          aria-invalid={errorText ? true : undefined}
        >
          {trigger}
        </button>

        <span id={filenameId} role="status" aria-live="polite" aria-atomic={true}>
          <HbcTypography intent="bodySmall">
            {hasFile
              ? `${selectedFile.name} (${formatBytes(selectedFile.size)})`
              : 'No file selected'}
          </HbcTypography>
        </span>

        {showClear && (
          <button
            type="button"
            className="safety-file-input__trigger safety-file-input__trigger--clear"
            onClick={handleClear}
            disabled={disabled}
            aria-label={`${clearLabel}: ${selectedFile.name}`}
          >
            {clearLabel}
          </button>
        )}
      </div>

      {helpText && (
        <span id={helpId} className="safety-file-input__help">
          <HbcTypography intent="bodySmall">{helpText}</HbcTypography>
        </span>
      )}

      {errorText && (
        <span id={errorId} role="alert" className="safety-file-input__error">
          <HbcTypography intent="bodySmall">{errorText}</HbcTypography>
        </span>
      )}
    </div>
  );
}
