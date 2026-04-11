/**
 * Shared governance UI primitives for HB Kudos surfaces.
 *
 * Provides tokenized visual grammar for the governance workspace so
 * consumers avoid duplicating hardcoded inline color/spacing values.
 *
 * These live in the webpart shared layer (not @hbc/ui-kit) because
 * they compose @hbc/ui-kit/homepage primitives and are specific to
 * the kudos governance domain. Promotion to ui-kit is appropriate
 * if/when other governance surfaces reuse them.
 *
 * All imports stay within the @hbc/ui-kit/homepage boundary.
 */
import * as React from 'react';
import { HbcStatusBadge, HbcKudosComposerFlyout } from '@hbc/ui-kit/homepage';

// ---------------------------------------------------------------------------
// Governance design tokens
// ---------------------------------------------------------------------------

export const KUDOS_GOV_TOKENS = {
  // Brand
  brandBlue: '#225391',
  brandOrange: '#e57e46',
  dangerRed: '#c4314b',
  warningOrange: '#c26434',

  // Text hierarchy — rgba(26, 19, 16, X)
  textPrimary: '#1a1310',
  textHeading: '#0a1b33',
  textSecondary: 'rgba(26, 19, 16, 0.72)',
  textTertiary: 'rgba(26, 19, 16, 0.62)',
  textMuted: 'rgba(26, 19, 16, 0.55)',
  textFaint: 'rgba(26, 19, 16, 0.48)',
  textCaption: 'rgba(26, 19, 16, 0.45)',
  textDisabled: 'rgba(26, 19, 16, 0.4)',

  // Blue opacity — rgba(34, 83, 145, X)
  blueSubtle04: 'rgba(34, 83, 145, 0.04)',
  blueSubtle06: 'rgba(34, 83, 145, 0.06)',
  blueSubtle08: 'rgba(34, 83, 145, 0.08)',
  blueSubtle12: 'rgba(34, 83, 145, 0.12)',
  blueSubtle14: 'rgba(34, 83, 145, 0.14)',
  blueSubtle18: 'rgba(34, 83, 145, 0.18)',
  blueSubtle20: 'rgba(34, 83, 145, 0.2)',
  blueText82: 'rgba(34, 83, 145, 0.82)',

  // Orange opacity — rgba(229, 126, 70, X)
  orangeSubtle02: 'rgba(229, 126, 70, 0.02)',
  orangeSubtle03: 'rgba(229, 126, 70, 0.03)',
  orangeSubtle06: 'rgba(229, 126, 70, 0.06)',
  orangeSubtle10: 'rgba(229, 126, 70, 0.10)',
  orangeSubtle18: 'rgba(229, 126, 70, 0.18)',
  orangeSubtle22: 'rgba(229, 126, 70, 0.22)',
  orangeSubtle25: 'rgba(229, 126, 70, 0.25)',
  orangeSubtle28: 'rgba(229, 126, 70, 0.28)',

  // Danger opacity — rgba(196, 49, 75, X)
  dangerSubtle08: 'rgba(196, 49, 75, 0.08)',
  dangerSubtle22: 'rgba(196, 49, 75, 0.22)',
  dangerSubtle55: 'rgba(196, 49, 75, 0.55)',
  dangerItalic72: 'rgba(196, 49, 75, 0.72)',
} as const;

// ---------------------------------------------------------------------------
// SectionHeading — governance metadata section label
// ---------------------------------------------------------------------------

export function KudosSectionHeading({ children }: { children: React.ReactNode }): React.JSX.Element {
  return (
    <div
      style={{
        fontSize: '0.6875rem',
        fontWeight: 800,
        letterSpacing: '0.08em',
        textTransform: 'uppercase',
        color: KUDOS_GOV_TOKENS.textMuted,
        marginBottom: 8,
      }}
    >
      {children}
    </div>
  );
}

// ---------------------------------------------------------------------------
// InfoRow — label:value governance metadata row
// ---------------------------------------------------------------------------

export function KudosInfoRow({ label, value }: { label: string; value?: string }): React.JSX.Element | null {
  if (!value?.trim()) return null;
  return (
    <div style={{ fontSize: '0.8125rem', lineHeight: 1.55, color: KUDOS_GOV_TOKENS.textSecondary, marginBottom: 6 }}>
      <span style={{ fontWeight: 700, color: KUDOS_GOV_TOKENS.textTertiary }}>{label}:</span> {value}
    </div>
  );
}

// ---------------------------------------------------------------------------
// ActionButton — governance action button with tone
// ---------------------------------------------------------------------------

export type GovernanceActionTone = 'info' | 'warning' | 'danger';

const TONE_COLORS: Record<GovernanceActionTone, string> = {
  danger: KUDOS_GOV_TOKENS.dangerRed,
  warning: KUDOS_GOV_TOKENS.warningOrange,
  info: KUDOS_GOV_TOKENS.brandBlue,
};

export function KudosActionButton({
  label,
  onClick,
  disabled,
  tone,
}: {
  label: string;
  onClick: () => void;
  disabled: boolean;
  tone: GovernanceActionTone;
}): React.JSX.Element {
  const toneColor = TONE_COLORS[tone];
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      style={{
        padding: '7px 13px',
        borderRadius: 8,
        border: `1.5px solid ${toneColor}`,
        background: disabled ? 'rgba(128, 128, 128, 0.08)' : '#ffffff',
        color: disabled ? KUDOS_GOV_TOKENS.textDisabled : toneColor,
        fontSize: '0.6875rem',
        fontWeight: 800,
        letterSpacing: '0.02em',
        cursor: disabled ? 'not-allowed' : 'pointer',
        fontFamily: 'inherit',
      }}
    >
      {label}
    </button>
  );
}

// ---------------------------------------------------------------------------
// TabButton — governance queue filter button
//
// Semantics: these are filter buttons, not WAI-ARIA tabs. The content
// is filtered in-place (no distinct tabpanel per filter), so we use
// aria-pressed to convey the active state instead of fake tab semantics.
// ---------------------------------------------------------------------------

export function KudosGovernanceTabButton({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}): React.JSX.Element {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      style={{
        padding: '8px 14px',
        borderRadius: 999,
        border: '1.5px solid',
        borderColor: active ? KUDOS_GOV_TOKENS.brandBlue : KUDOS_GOV_TOKENS.blueSubtle18,
        background: active ? KUDOS_GOV_TOKENS.brandBlue : '#ffffff',
        color: active ? '#ffffff' : 'rgba(26, 19, 16, 0.68)',
        fontSize: '0.75rem',
        fontWeight: 800,
        letterSpacing: '0.02em',
        cursor: 'pointer',
        fontFamily: 'inherit',
      }}
    >
      {label}
    </button>
  );
}

// ---------------------------------------------------------------------------
// ToggleChip — governance filter toggle
// ---------------------------------------------------------------------------

export function KudosGovernanceToggleChip({
  label,
  active,
  onToggle,
}: {
  label: string;
  active: boolean;
  onToggle: () => void;
}): React.JSX.Element {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-pressed={active}
      style={{
        padding: '5px 12px',
        fontSize: '0.6875rem',
        fontWeight: 800,
        letterSpacing: '0.04em',
        textTransform: 'uppercase',
        borderRadius: 999,
        border: '1.5px solid',
        borderColor: active ? KUDOS_GOV_TOKENS.brandBlue : KUDOS_GOV_TOKENS.blueSubtle20,
        background: active ? KUDOS_GOV_TOKENS.blueSubtle12 : '#ffffff',
        color: active ? KUDOS_GOV_TOKENS.brandBlue : KUDOS_GOV_TOKENS.textMuted,
        cursor: 'pointer',
        fontFamily: 'inherit',
      }}
    >
      {label}
    </button>
  );
}

// ---------------------------------------------------------------------------
// ToolbarLabel — inline uppercase field label
// ---------------------------------------------------------------------------

export function KudosGovernanceToolbarLabel({ children }: { children: React.ReactNode }): React.JSX.Element {
  return (
    <span
      style={{
        fontSize: '0.6875rem',
        fontWeight: 800,
        letterSpacing: '0.08em',
        textTransform: 'uppercase',
        color: KUDOS_GOV_TOKENS.textMuted,
      }}
    >
      {children}
    </span>
  );
}

// ---------------------------------------------------------------------------
// ErrorAlert — governance error message
// ---------------------------------------------------------------------------

export function KudosGovernanceErrorAlert({ message }: { message: string }): React.JSX.Element {
  return (
    <div
      role="alert"
      style={{
        padding: '10px 12px',
        borderRadius: 8,
        background: KUDOS_GOV_TOKENS.dangerSubtle08,
        border: `1px solid ${KUDOS_GOV_TOKENS.dangerSubtle22}`,
        color: KUDOS_GOV_TOKENS.dangerRed,
        fontSize: '0.8125rem',
        fontWeight: 600,
      }}
    >
      {message}
    </div>
  );
}

// ---------------------------------------------------------------------------
// InputDialog — governance action input dialog (replaces window.prompt)
// ---------------------------------------------------------------------------

export interface KudosGovernanceInputDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (value: string) => void;
  title: string;
  description?: string;
  placeholder?: string;
  defaultValue?: string;
  confirmLabel?: string;
  /** Render a <select> instead of a text input. */
  choices?: readonly { value: string; label: string }[];
  /** When true, empty input is accepted (e.g. optional expiry). */
  allowEmpty?: boolean;
}

export function KudosGovernanceInputDialog({
  open,
  onClose,
  onConfirm,
  title,
  description,
  placeholder,
  defaultValue,
  confirmLabel,
  choices,
  allowEmpty,
}: KudosGovernanceInputDialogProps): React.JSX.Element {
  const [draft, setDraft] = React.useState(defaultValue ?? (choices?.[0]?.value ?? ''));

  // Reset draft when dialog opens with a new default.
  React.useEffect(() => {
    if (open) {
      setDraft(defaultValue ?? (choices?.[0]?.value ?? ''));
    }
  }, [open, defaultValue, choices]);

  const handleConfirm = (): void => {
    if (!allowEmpty && !draft.trim()) return;
    onConfirm(draft);
    onClose();
  };

  return (
    <HbcKudosComposerFlyout
      open={open}
      onClose={onClose}
      title={title}
      primaryAction={{
        label: confirmLabel ?? 'Confirm',
        onClick: handleConfirm,
      }}
      secondaryAction={{ label: 'Cancel', onClick: onClose }}
    >
      {/* Scoped focus-visible styles for dialog inputs — inline styles
          cannot express pseudo-classes so keyboard focus is handled here. */}
      {/* eslint-disable-next-line react/no-unknown-property */}
      <style>{`
        [data-hbc-gov-dialog] input:focus-visible,
        [data-hbc-gov-dialog] select:focus-visible {
          outline: 2px solid ${KUDOS_GOV_TOKENS.brandBlue};
          outline-offset: 1px;
          border-color: ${KUDOS_GOV_TOKENS.brandOrange};
        }
      `}</style>
      <div data-hbc-gov-dialog="" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {description ? (
          <p style={{ margin: 0, fontSize: '0.8125rem', lineHeight: 1.55, color: KUDOS_GOV_TOKENS.textSecondary }}>
            {description}
          </p>
        ) : null}
        {choices ? (
          <select
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            style={{
              padding: '8px 10px',
              fontSize: '0.875rem',
              borderRadius: 8,
              border: `1px solid ${KUDOS_GOV_TOKENS.orangeSubtle28}`,
              fontFamily: 'inherit',
              outline: 'none',
            }}
          >
            {choices.map((c) => (
              <option key={c.value} value={c.value}>{c.label}</option>
            ))}
          </select>
        ) : (
          <input
            type="text"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') handleConfirm(); }}
            placeholder={placeholder}
            autoFocus
            style={{
              padding: '8px 10px',
              fontSize: '0.875rem',
              borderRadius: 8,
              border: `1px solid ${KUDOS_GOV_TOKENS.orangeSubtle28}`,
              fontFamily: 'inherit',
              outline: 'none',
            }}
          />
        )}
      </div>
    </HbcKudosComposerFlyout>
  );
}

// ---------------------------------------------------------------------------
// AuditTimelineBlock — shared audit timeline rendering
// ---------------------------------------------------------------------------

export interface AuditTimelineEvent {
  id: number;
  eventType: string;
  actorDisplayName?: string;
  eventAt: string;
  publicNote?: string;
  internalNote?: string;
}

export function KudosAuditTimelineBlock({
  events,
  showInternalNotes,
  loading,
  fallbackText,
  mapLabel,
  mapTone,
}: {
  events: readonly AuditTimelineEvent[];
  showInternalNotes: boolean;
  loading?: boolean;
  fallbackText?: string;
  mapLabel: (eventType: string) => string;
  mapTone: (eventType: string) => string;
}): React.JSX.Element {
  function chipVariant(tone: string): 'success' | 'warning' | 'critical' | 'info' {
    if (tone === 'success') return 'success';
    if (tone === 'warning') return 'warning';
    if (tone === 'danger') return 'critical';
    return 'info';
  }

  if (loading) {
    return <div style={{ fontSize: '0.75rem', color: KUDOS_GOV_TOKENS.textMuted }}>Loading timeline…</div>;
  }

  if (events.length === 0) {
    return (
      <div style={{ fontSize: '0.75rem', color: KUDOS_GOV_TOKENS.textMuted }}>
        {fallbackText ?? 'No timeline events.'}
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      {events.map((evt) => (
        <div
          key={evt.id}
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: 10,
            fontSize: '0.75rem',
            lineHeight: 1.5,
            paddingBottom: 6,
            borderBottom: `1px solid ${KUDOS_GOV_TOKENS.orangeSubtle10}`,
          }}
        >
          <HbcStatusBadge
            variant={chipVariant(mapTone(evt.eventType))}
            size="small"
            label={mapLabel(evt.eventType)}
          />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ color: KUDOS_GOV_TOKENS.textTertiary, fontWeight: 600 }}>
              {evt.actorDisplayName ?? 'System'} · {new Date(evt.eventAt).toLocaleString()}
            </div>
            {evt.publicNote ? (
              <div style={{ color: KUDOS_GOV_TOKENS.textFaint, marginTop: 2 }}>{evt.publicNote}</div>
            ) : null}
            {showInternalNotes && evt.internalNote ? (
              <div style={{ color: KUDOS_GOV_TOKENS.dangerItalic72, marginTop: 2, fontStyle: 'italic' }}>
                Internal: {evt.internalNote}
              </div>
            ) : null}
          </div>
        </div>
      ))}
    </div>
  );
}
