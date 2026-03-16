import * as React from 'react';
import { makeStyles, mergeClasses, shorthands } from '@griffel/react';
import {
  HBC_SURFACE_LIGHT,
  HBC_ACCENT_ORANGE,
  HBC_ACCENT_ORANGE_HOVER,
  HBC_ACCENT_ORANGE_PRESSED,
  HBC_DANGER_HOVER,
  HBC_DANGER_PRESSED,
  HBC_STATUS_COLORS,
  HBC_SPACE_SM,
  HBC_SPACE_MD,
  HBC_SPACE_LG,
  HBC_RADIUS_MD,
  HBC_RADIUS_XL,
  Z_INDEX,
  elevationLevel4,
  body as bodyTypo,
  label as labelTypo,
} from '@hbc/ui-kit/theme';

// ─── Constants ──────────────────────────────────────────────────────────────

export const DEFAULT_CONFIRMATION_PHRASE = 'I CONFIRM';
export const DECLINE_REASON_MIN_LENGTH = 10;

// ─── Styles ─────────────────────────────────────────────────────────────────

const useStyles = makeStyles({
  overlay: {
    position: 'fixed',
    top: '0',
    right: '0',
    bottom: '0',
    left: '0',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: Z_INDEX.modal,
    ...shorthands.borderWidth('0'),
    paddingTop: '0',
    paddingRight: '0',
    paddingBottom: '0',
    paddingLeft: '0',
  },
  card: {
    backgroundColor: HBC_SURFACE_LIGHT['surface-0'],
    borderRadius: HBC_RADIUS_XL,
    paddingTop: `${HBC_SPACE_LG}px`,
    paddingRight: `${HBC_SPACE_LG}px`,
    paddingBottom: `${HBC_SPACE_LG}px`,
    paddingLeft: `${HBC_SPACE_LG}px`,
    maxWidth: '480px',
    width: '100%',
    boxShadow: elevationLevel4,
  },
  title: {
    fontFamily: bodyTypo.fontFamily,
    fontSize: '1.125rem',
    fontWeight: '600',
    lineHeight: bodyTypo.lineHeight,
    color: HBC_SURFACE_LIGHT['text-primary'],
    marginTop: '0',
    marginBottom: `${HBC_SPACE_MD}px`,
  },
  prompt: {
    fontFamily: bodyTypo.fontFamily,
    fontSize: bodyTypo.fontSize,
    lineHeight: bodyTypo.lineHeight,
    color: HBC_SURFACE_LIGHT['text-primary'],
    marginBottom: `${HBC_SPACE_MD}px`,
  },
  phraseInput: {
    display: 'flex',
    flexDirection: 'column',
    rowGap: `${HBC_SPACE_SM}px`,
    marginBottom: `${HBC_SPACE_MD}px`,
  },
  input: {
    ...shorthands.border('1px', 'solid', HBC_SURFACE_LIGHT['border-default']),
    borderRadius: HBC_RADIUS_MD,
    paddingTop: `${HBC_SPACE_SM}px`,
    paddingRight: `${HBC_SPACE_SM}px`,
    paddingBottom: `${HBC_SPACE_SM}px`,
    paddingLeft: `${HBC_SPACE_SM}px`,
    fontFamily: bodyTypo.fontFamily,
    fontSize: bodyTypo.fontSize,
    ':focus': {
      ...shorthands.outline('2px', 'solid', HBC_SURFACE_LIGHT['border-focus']),
      outlineOffset: '1px',
    },
  },
  phraseHint: {
    fontFamily: labelTypo.fontFamily,
    fontSize: labelTypo.fontSize,
    fontWeight: labelTypo.fontWeight as React.CSSProperties['fontWeight'],
    color: HBC_STATUS_COLORS.error,
  },
  actions: {
    display: 'flex',
    columnGap: `${HBC_SPACE_SM}px`,
    marginTop: `${HBC_SPACE_MD}px`,
  },
  btnPrimary: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: `${HBC_SPACE_SM}px`,
    paddingBottom: `${HBC_SPACE_SM}px`,
    paddingLeft: `${HBC_SPACE_MD}px`,
    paddingRight: `${HBC_SPACE_MD}px`,
    borderRadius: HBC_RADIUS_MD,
    ...shorthands.borderWidth('0'),
    backgroundColor: HBC_ACCENT_ORANGE,
    color: '#FFFFFF',
    fontFamily: bodyTypo.fontFamily,
    fontSize: bodyTypo.fontSize,
    fontWeight: '600',
    cursor: 'pointer',
    ':hover': {
      backgroundColor: HBC_ACCENT_ORANGE_HOVER,
    },
    ':active': {
      backgroundColor: HBC_ACCENT_ORANGE_PRESSED,
    },
    ':disabled': {
      opacity: 0.5,
      cursor: 'not-allowed',
    },
  },
  btnGhost: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: `${HBC_SPACE_SM}px`,
    paddingBottom: `${HBC_SPACE_SM}px`,
    paddingLeft: `${HBC_SPACE_MD}px`,
    paddingRight: `${HBC_SPACE_MD}px`,
    borderRadius: HBC_RADIUS_MD,
    ...shorthands.borderWidth('0'),
    backgroundColor: 'transparent',
    color: HBC_SURFACE_LIGHT['text-primary'],
    fontFamily: bodyTypo.fontFamily,
    fontSize: bodyTypo.fontSize,
    fontWeight: '500',
    cursor: 'pointer',
    ':hover': {
      backgroundColor: HBC_SURFACE_LIGHT['surface-2'],
    },
  },
  btnDanger: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: `${HBC_SPACE_SM}px`,
    paddingBottom: `${HBC_SPACE_SM}px`,
    paddingLeft: `${HBC_SPACE_MD}px`,
    paddingRight: `${HBC_SPACE_MD}px`,
    borderRadius: HBC_RADIUS_MD,
    ...shorthands.borderWidth('0'),
    backgroundColor: HBC_STATUS_COLORS.error,
    color: '#FFFFFF',
    fontFamily: bodyTypo.fontFamily,
    fontSize: bodyTypo.fontSize,
    fontWeight: '600',
    cursor: 'pointer',
    ':hover': {
      backgroundColor: HBC_DANGER_HOVER,
    },
    ':active': {
      backgroundColor: HBC_DANGER_PRESSED,
    },
    ':disabled': {
      opacity: 0.5,
      cursor: 'not-allowed',
    },
  },
  declineHeading: {
    fontFamily: bodyTypo.fontFamily,
    fontSize: bodyTypo.fontSize,
    lineHeight: bodyTypo.lineHeight,
    color: HBC_SURFACE_LIGHT['text-primary'],
    marginBottom: `${HBC_SPACE_MD}px`,
  },
  declineCategories: {
    display: 'flex',
    flexDirection: 'column',
    rowGap: `${HBC_SPACE_SM}px`,
    marginBottom: `${HBC_SPACE_MD}px`,
    ...shorthands.borderWidth('0'),
    paddingTop: '0',
    paddingRight: '0',
    paddingBottom: '0',
    paddingLeft: '0',
  },
  declineRadio: {
    display: 'flex',
    alignItems: 'center',
    columnGap: `${HBC_SPACE_SM}px`,
    fontFamily: bodyTypo.fontFamily,
    fontSize: bodyTypo.fontSize,
    cursor: 'pointer',
  },
  declineFreetext: {
    display: 'flex',
    flexDirection: 'column',
    rowGap: `${HBC_SPACE_SM}px`,
    marginBottom: `${HBC_SPACE_MD}px`,
  },
  textarea: {
    ...shorthands.border('1px', 'solid', HBC_SURFACE_LIGHT['border-default']),
    borderRadius: HBC_RADIUS_MD,
    paddingTop: `${HBC_SPACE_SM}px`,
    paddingRight: `${HBC_SPACE_SM}px`,
    paddingBottom: `${HBC_SPACE_SM}px`,
    paddingLeft: `${HBC_SPACE_SM}px`,
    fontFamily: bodyTypo.fontFamily,
    fontSize: bodyTypo.fontSize,
    ':focus': {
      ...shorthands.outline('2px', 'solid', HBC_SURFACE_LIGHT['border-focus']),
      outlineOffset: '1px',
    },
  },
  charCount: {
    fontFamily: labelTypo.fontFamily,
    fontSize: labelTypo.fontSize,
    fontWeight: labelTypo.fontWeight as React.CSSProperties['fontWeight'],
    color: HBC_SURFACE_LIGHT['text-muted'],
  },
  minHint: {
    fontFamily: labelTypo.fontFamily,
    fontSize: labelTypo.fontSize,
    fontWeight: labelTypo.fontWeight as React.CSSProperties['fontWeight'],
    color: HBC_SURFACE_LIGHT['text-muted'],
  },
  srOnly: {
    position: 'absolute',
    width: '1px',
    height: '1px',
    paddingTop: '0',
    paddingRight: '0',
    paddingBottom: '0',
    paddingLeft: '0',
    marginTop: '-1px',
    marginRight: '-1px',
    marginBottom: '-1px',
    marginLeft: '-1px',
    overflow: 'hidden',
    whiteSpace: 'nowrap',
    ...shorthands.borderWidth('0'),
  },
});

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
  const styles = useStyles();
  const phrase = confirmationPhrase ?? DEFAULT_CONFIRMATION_PHRASE;
  const [inputValue, setInputValue] = React.useState('');
  const phraseMatch = inputValue.trim() === phrase;
  const canSubmit = !requireConfirmationPhrase || phraseMatch;

  return (
    <>
      <p className={styles.prompt}>{promptMessage}</p>

      {requireConfirmationPhrase && (
        <div className={styles.phraseInput}>
          <label htmlFor="ack-phrase">
            Type <strong>{phrase}</strong> to proceed
          </label>
          <input
            id="ack-phrase"
            type="text"
            className={styles.input}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            aria-invalid={inputValue.length > 0 && !phraseMatch}
            aria-describedby="ack-phrase-hint"
            autoComplete="off"
          />
          {inputValue.length > 0 && !phraseMatch && (
            <span id="ack-phrase-hint" className={styles.phraseHint} role="alert">
              Phrase does not match
            </span>
          )}
        </div>
      )}

      <div className={styles.actions}>
        <button
          onClick={onConfirm}
          disabled={!canSubmit}
          className={styles.btnPrimary}
        >
          Confirm
        </button>
        <button onClick={onCancel} className={styles.btnGhost}>
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
  const styles = useStyles();
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
      <p className={styles.declineHeading}>
        Please provide a reason for declining.
      </p>

      {/* Category radio list (D-04: declineReasons[] provided) */}
      {hasCategories && (
        <fieldset className={styles.declineCategories}>
          <legend className={styles.srOnly}>Decline reason</legend>
          {radioOptions.map((reason) => (
            <label key={reason} className={styles.declineRadio}>
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
        <div className={styles.declineFreetext}>
          <label htmlFor="decline-text">
            {hasCategories ? 'Please elaborate' : 'Reason'}
            {!hasCategories && (
              <span className={styles.minHint}>
                {' '}(minimum {DECLINE_REASON_MIN_LENGTH} characters)
              </span>
            )}
          </label>
          <textarea
            id="decline-text"
            className={styles.textarea}
            rows={4}
            value={freeText}
            onChange={(e) => setFreeText(e.target.value)}
            aria-describedby="decline-char-count"
          />
          <span id="decline-char-count" className={styles.charCount}>
            {freeText.trim().length} / {DECLINE_REASON_MIN_LENGTH} min
          </span>
        </div>
      )}

      <div className={styles.actions}>
        <button
          onClick={handleSubmit}
          disabled={!canSubmit}
          className={styles.btnDanger}
        >
          Confirm Decline
        </button>
        <button onClick={onCancel} className={styles.btnGhost}>
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
  const styles = useStyles();
  if (!isOpen) return null;

  return (
    <dialog
      open
      className={styles.overlay}
      aria-modal="true"
      aria-labelledby="ack-modal-title"
      onKeyDown={(e) => e.key === 'Escape' && onCancel()}
    >
      <div className={styles.card}>
        <h2 id="ack-modal-title" className={styles.title}>
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
