/**
 * KudosComposerForm — Premium form body for Kudos submission.
 *
 * Warm, branded input fields with inline validation, matching the
 * People & Culture visual register. Recipient input, headline,
 * and message are required fields.
 */
import * as React from 'react';
import type { KudosComposerDraft, KudosComposerValidationErrors } from '../../homepage/data/useKudosComposer.js';

/* ── Brand palette ─────────────────────────────────────────────── */

const HB = {
  orange: '#E57E46',
  orangeRgb: '229, 126, 70',
  blueRgb: '34, 83, 145',
} as const;

const P = {
  text1: '#1a1a1a',
  text2: 'rgba(26,26,26,0.68)',
  text3: 'rgba(26,26,26,0.48)',
  errorRed: '#c4314b',
} as const;

/* ── Shared input styles ───────────────────────────────────────── */

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: '0.75rem',
  fontWeight: 700,
  letterSpacing: '0.04em',
  textTransform: 'uppercase',
  color: P.text3,
  marginBottom: 6,
};

function inputStyle(hasError: boolean): React.CSSProperties {
  return {
    width: '100%',
    padding: '10px 12px',
    fontSize: '0.875rem',
    fontFamily: "'Segoe UI', -apple-system, BlinkMacSystemFont, sans-serif",
    color: P.text1,
    background: '#ffffff',
    border: `1.5px solid ${hasError ? P.errorRed : `rgba(${HB.orangeRgb}, 0.2)`}`,
    borderRadius: 10,
    outline: 'none',
    transition: 'border-color 150ms ease, box-shadow 150ms ease',
    boxSizing: 'border-box' as const,
  };
}

const errorStyle: React.CSSProperties = {
  fontSize: '0.75rem',
  color: P.errorRed,
  marginTop: 4,
  lineHeight: 1.3,
};

const hintStyle: React.CSSProperties = {
  fontSize: '0.6875rem',
  color: P.text3,
  marginTop: 4,
  lineHeight: 1.3,
};

/* ── Props ─────────────────────────────────────────────────────── */

export interface KudosComposerFormProps {
  draft: KudosComposerDraft;
  onDraftChange: (patch: Partial<KudosComposerDraft>) => void;
  validationErrors: KudosComposerValidationErrors;
  disabled?: boolean;
}

/* ── Component ─────────────────────────────────────────────────── */

export function KudosComposerForm({ draft, onDraftChange, validationErrors, disabled = false }: KudosComposerFormProps): React.JSX.Element {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Intro */}
      <div style={{
        padding: '14px 16px',
        borderRadius: 12,
        background: `linear-gradient(135deg, rgba(${HB.orangeRgb}, 0.06) 0%, rgba(${HB.blueRgb}, 0.03) 100%)`,
        border: `1px solid rgba(${HB.orangeRgb}, 0.08)`,
      }}>
        <p style={{ margin: 0, fontSize: '0.8125rem', color: P.text2, lineHeight: 1.6 }}>
          Recognize a teammate for great work, a team win, or everyday excellence. Your kudos will be reviewed before appearing on the homepage.
        </p>
      </div>

      {/* Recipients */}
      <div>
        <label style={labelStyle} htmlFor="kudos-recipients">
          Recipients <span style={{ color: HB.orange }}>*</span>
        </label>
        <input
          id="kudos-recipients"
          type="text"
          placeholder="e.g. Riley Brooks, Morgan Chen"
          value={draft.recipientNames}
          onChange={(e) => onDraftChange({ recipientNames: e.target.value })}
          disabled={disabled}
          style={inputStyle(Boolean(validationErrors.recipientNames))}
          onFocus={(e) => {
            e.currentTarget.style.borderColor = HB.orange;
            e.currentTarget.style.boxShadow = `0 0 0 3px rgba(${HB.orangeRgb}, 0.12)`;
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = validationErrors.recipientNames ? P.errorRed : `rgba(${HB.orangeRgb}, 0.2)`;
            e.currentTarget.style.boxShadow = 'none';
          }}
        />
        {validationErrors.recipientNames && <div style={errorStyle}>{validationErrors.recipientNames}</div>}
        <div style={hintStyle}>Separate multiple names with commas</div>
      </div>

      {/* Headline */}
      <div>
        <label style={labelStyle} htmlFor="kudos-headline">
          Headline <span style={{ color: HB.orange }}>*</span>
        </label>
        <input
          id="kudos-headline"
          type="text"
          placeholder="e.g. Outstanding Safety Leadership"
          value={draft.headline}
          onChange={(e) => onDraftChange({ headline: e.target.value })}
          disabled={disabled}
          maxLength={120}
          style={inputStyle(Boolean(validationErrors.headline))}
          onFocus={(e) => {
            e.currentTarget.style.borderColor = HB.orange;
            e.currentTarget.style.boxShadow = `0 0 0 3px rgba(${HB.orangeRgb}, 0.12)`;
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = validationErrors.headline ? P.errorRed : `rgba(${HB.orangeRgb}, 0.2)`;
            e.currentTarget.style.boxShadow = 'none';
          }}
        />
        {validationErrors.headline && <div style={errorStyle}>{validationErrors.headline}</div>}
        <div style={hintStyle}>{draft.headline.length}/120 characters</div>
      </div>

      {/* Message */}
      <div>
        <label style={labelStyle} htmlFor="kudos-message">
          Message <span style={{ color: HB.orange }}>*</span>
        </label>
        <textarea
          id="kudos-message"
          placeholder="What did they do that deserves recognition?"
          value={draft.excerpt}
          onChange={(e) => onDraftChange({ excerpt: e.target.value })}
          disabled={disabled}
          rows={4}
          style={{
            ...inputStyle(Boolean(validationErrors.excerpt)),
            resize: 'vertical' as const,
            minHeight: 100,
          }}
          onFocus={(e) => {
            e.currentTarget.style.borderColor = HB.orange;
            e.currentTarget.style.boxShadow = `0 0 0 3px rgba(${HB.orangeRgb}, 0.12)`;
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = validationErrors.excerpt ? P.errorRed : `rgba(${HB.orangeRgb}, 0.2)`;
            e.currentTarget.style.boxShadow = 'none';
          }}
        />
        {validationErrors.excerpt && <div style={errorStyle}>{validationErrors.excerpt}</div>}
      </div>

      {/* Details (optional) */}
      <div>
        <label style={labelStyle} htmlFor="kudos-details">
          Additional details <span style={{ color: P.text3, fontWeight: 400, textTransform: 'none' }}>(optional)</span>
        </label>
        <textarea
          id="kudos-details"
          placeholder="Any extra context or background"
          value={draft.details}
          onChange={(e) => onDraftChange({ details: e.target.value })}
          disabled={disabled}
          rows={2}
          style={{
            ...inputStyle(false),
            resize: 'vertical' as const,
            minHeight: 60,
          }}
          onFocus={(e) => {
            e.currentTarget.style.borderColor = HB.orange;
            e.currentTarget.style.boxShadow = `0 0 0 3px rgba(${HB.orangeRgb}, 0.12)`;
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = `rgba(${HB.orangeRgb}, 0.2)`;
            e.currentTarget.style.boxShadow = 'none';
          }}
        />
      </div>
    </div>
  );
}
