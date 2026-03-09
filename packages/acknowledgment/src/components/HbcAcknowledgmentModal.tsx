import * as React from 'react';

// ─── Constants ──────────────────────────────────────────────────────────────

export const DEFAULT_CONFIRMATION_PHRASE = 'I CONFIRM';
export const DECLINE_REASON_MIN_LENGTH = 10;

// ─── Props ──────────────────────────────────────────────────────────────────

export interface HbcAcknowledgmentModalProps {
  isOpen: boolean;
  intent: 'acknowledge' | 'decline';
  promptMessage: string;
  requireConfirmationPhrase?: boolean;
  /** Defaults to "I CONFIRM" (D-03). */
  confirmationPhrase?: string;
  allowDecline?: boolean;
  /** Optional predefined decline categories (D-04). */
  declineReasons?: string[];
  onConfirm: () => void;
  onDecline: (reason: string, category?: string) => void;
  onCancel: () => void;
}

interface AcknowledgeContentProps {
  promptMessage: string;
  requireConfirmationPhrase?: boolean;
  confirmationPhrase?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

interface DeclineContentProps {
  declineReasons?: string[];
  onDecline: (reason: string, category?: string) => void;
  onCancel: () => void;
}

// ─── Acknowledge Path (D-03) ────────────────────────────────────────────────

function AcknowledgeContent({
  promptMessage,
  requireConfirmationPhrase,
  confirmationPhrase,
  onConfirm,
  onCancel,
}: AcknowledgeContentProps) {
  const phrase = confirmationPhrase ?? DEFAULT_CONFIRMATION_PHRASE;
  const [inputValue, setInputValue] = React.useState('');
  const phraseMatch = inputValue.trim() === phrase;
  const canSubmit = !requireConfirmationPhrase || phraseMatch;

  return (
    <>
      <p className="hbc-modal__prompt">{promptMessage}</p>

      {requireConfirmationPhrase && (
        <div className="hbc-modal__phrase-input">
          <label htmlFor="ack-phrase">
            Type <strong>{phrase}</strong> to proceed
          </label>
          <input
            id="ack-phrase"
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            aria-invalid={inputValue.length > 0 && !phraseMatch}
            aria-describedby="ack-phrase-hint"
            autoComplete="off"
          />
          {inputValue.length > 0 && !phraseMatch && (
            <span id="ack-phrase-hint" className="hbc-modal__phrase-hint" role="alert">
              Phrase does not match
            </span>
          )}
        </div>
      )}

      <div className="hbc-modal__actions">
        <button
          onClick={onConfirm}
          disabled={!canSubmit}
          className="hbc-btn hbc-btn--primary"
        >
          Confirm
        </button>
        <button onClick={onCancel} className="hbc-btn hbc-btn--ghost">
          Cancel
        </button>
      </div>
    </>
  );
}

// ─── Decline Path (D-04) ────────────────────────────────────────────────────

function DeclineContent({
  declineReasons,
  onDecline,
  onCancel,
}: DeclineContentProps) {
  const [selectedCategory, setSelectedCategory] = React.useState<string>('');
  const [freeText, setFreeText] = React.useState('');

  const hasCategories = declineReasons && declineReasons.length > 0;
  const isOther = selectedCategory === 'Other' || !hasCategories;

  // When categories provided: require a selection; free-text required only for "Other"
  // When no categories: free-text required (min 10 chars) — D-04
  const canSubmit = hasCategories
    ? selectedCategory !== '' &&
      (!isOther || freeText.trim().length >= DECLINE_REASON_MIN_LENGTH)
    : freeText.trim().length >= DECLINE_REASON_MIN_LENGTH;

  const handleSubmit = () => {
    const category = hasCategories ? selectedCategory : undefined;
    const reason = freeText.trim() || selectedCategory;
    onDecline(reason, category);
  };

  // Build radio list: append "Other" only if not already in the list
  const radioOptions = hasCategories
    ? declineReasons!.includes('Other')
      ? declineReasons!
      : [...declineReasons!, 'Other']
    : [];

  return (
    <>
      <p className="hbc-modal__decline-heading">
        Please provide a reason for declining.
      </p>

      {/* Category radio list (D-04: declineReasons[] provided) */}
      {hasCategories && (
        <fieldset className="hbc-modal__decline-categories">
          <legend className="sr-only">Decline reason</legend>
          {radioOptions.map((reason) => (
            <label key={reason} className="hbc-modal__decline-radio">
              <input
                type="radio"
                name="decline-reason"
                value={reason}
                checked={selectedCategory === reason}
                onChange={() => setSelectedCategory(reason)}
              />
              {reason}
            </label>
          ))}
        </fieldset>
      )}

      {/* Free-text: always shown when no categories; shown for "Other" */}
      {(!hasCategories || isOther) && (
        <div className="hbc-modal__decline-freetext">
          <label htmlFor="decline-text">
            {hasCategories ? 'Please elaborate' : 'Reason'}
            {!hasCategories && (
              <span className="hbc-modal__min-hint">
                {' '}(minimum {DECLINE_REASON_MIN_LENGTH} characters)
              </span>
            )}
          </label>
          <textarea
            id="decline-text"
            rows={4}
            value={freeText}
            onChange={(e) => setFreeText(e.target.value)}
            aria-describedby="decline-char-count"
          />
          <span id="decline-char-count" className="hbc-modal__char-count">
            {freeText.trim().length} / {DECLINE_REASON_MIN_LENGTH} min
          </span>
        </div>
      )}

      <div className="hbc-modal__actions">
        <button
          onClick={handleSubmit}
          disabled={!canSubmit}
          className="hbc-btn hbc-btn--danger"
        >
          Confirm Decline
        </button>
        <button onClick={onCancel} className="hbc-btn hbc-btn--ghost">
          Cancel
        </button>
      </div>
    </>
  );
}

// ─── Modal Shell ────────────────────────────────────────────────────────────

export function HbcAcknowledgmentModal({
  isOpen,
  intent,
  promptMessage,
  requireConfirmationPhrase,
  confirmationPhrase,
  declineReasons,
  onConfirm,
  onDecline,
  onCancel,
}: HbcAcknowledgmentModalProps) {
  if (!isOpen) return null;

  return (
    <dialog
      open
      className="hbc-modal"
      aria-modal="true"
      aria-labelledby="ack-modal-title"
      onKeyDown={(e) => e.key === 'Escape' && onCancel()}
    >
      <div className="hbc-modal__content">
        <h2 id="ack-modal-title" className="hbc-modal__title">
          {intent === 'acknowledge' ? 'Confirm Acknowledgment' : 'Decline Sign-Off'}
        </h2>

        {intent === 'acknowledge' ? (
          <AcknowledgeContent
            promptMessage={promptMessage}
            requireConfirmationPhrase={requireConfirmationPhrase}
            confirmationPhrase={confirmationPhrase}
            onConfirm={onConfirm}
            onCancel={onCancel}
          />
        ) : (
          <DeclineContent
            declineReasons={declineReasons}
            onDecline={onDecline}
            onCancel={onCancel}
          />
        )}
      </div>
    </dialog>
  );
}
