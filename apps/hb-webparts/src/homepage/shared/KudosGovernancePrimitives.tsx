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
import {
  HbcStatusBadge,
  HbcKudosComposerFlyout,
  HBC_PRESENTATION_BLUE,
  HBC_PRESENTATION_BLUE_RGB,
  HBC_PRESENTATION_ORANGE,
  HBC_PRESENTATION_ORANGE_RGB,
} from '@hbc/ui-kit/homepage';
import {
  governanceActionButton,
  governanceTabButton,
  governanceToggleChip,
} from '../../webparts/hbKudos/kudosVariants.js';
import governanceStyles from './governance.module.css';

// ---------------------------------------------------------------------------
// Governance design tokens — theme-derived alias layer
// ---------------------------------------------------------------------------
//
// Phase-18 Wave 1 token discipline: this registry is a thin, disciplined
// alias layer over the shared presentation-lane theme semantics exported
// by `@hbc/ui-kit/homepage`. Values are DERIVED from the shared tokens
// (HBC_PRESENTATION_BLUE / HBC_PRESENTATION_ORANGE and their rgb triplets)
// rather than authored as a standalone palette, so the Kudos public and
// companion surfaces cannot drift from the governed presentation-lane
// brand without touching the shared source.
//
// - Brand values route through HBC_PRESENTATION_* so hex and rgba stay
//   in lockstep with the shared tokens.
// - Opacity scales (blueSubtle*, orangeSubtle*, dangerSubtle*) use RGB
//   triplets composed into `rgba()` via a small `alpha()` helper instead
//   of repeating literal hex/rgba strings across files.
// - Text hierarchy is expressed as alphas over one ink base (#1a1310) to
//   collapse the prior raw `rgba(26, 19, 16, X)` sprawl into a single
//   intent-named scale.
// - The `dangerRed` / `warningOrange` values are presentation-lane
//   variants that don't have 1:1 equivalents in the shared tokens today;
//   they are kept local and clearly marked so future promotion to
//   shared theme semantics is a visible swap, not a rename.
//
// Surface files should continue to consume `KUDOS_GOV_TOKENS.*` rather
// than raw hex/rgba so this alias layer remains the single place that
// translates shared theme semantics into Kudos surface grammar.
// ---------------------------------------------------------------------------

const alpha = (rgbTriplet: string, opacity: number): string =>
  `rgba(${rgbTriplet}, ${opacity})`;

const BLUE_RGB = HBC_PRESENTATION_BLUE_RGB;
const ORANGE_RGB = HBC_PRESENTATION_ORANGE_RGB;

// Presentation-lane danger / warning accents. Kept local because the
// shared theme semantics do not yet expose a presentation-lane danger
// ramp (the productive-lane `HBC_STATUS_COLORS.error` is the brighter
// `#FF4D4D`, which reads as app-shell status, not editorial danger).
const DANGER_RED = '#c4314b';
const DANGER_RGB = '196, 49, 75';
const WARNING_ORANGE = '#c26434';

// Ink base for body copy on light editorial surfaces — one value,
// many alphas, so text hierarchy collapses to a single semantic scale.
const INK_RGB = '26, 19, 16';
const INK_BASE = '#1a1310';
const INK_HEADING = '#0a1b33';

export const KUDOS_GOV_TOKENS = {
  // Brand — derived from shared presentation-lane theme semantics
  brandBlue: HBC_PRESENTATION_BLUE,
  brandOrange: HBC_PRESENTATION_ORANGE,
  dangerRed: DANGER_RED,
  warningOrange: WARNING_ORANGE,

  // Text hierarchy — alphas over the editorial ink base
  textPrimary: INK_BASE,
  textHeading: INK_HEADING,
  textSecondary: alpha(INK_RGB, 0.72),
  textTertiary: alpha(INK_RGB, 0.62),
  textMuted: alpha(INK_RGB, 0.55),
  textFaint: alpha(INK_RGB, 0.48),
  textCaption: alpha(INK_RGB, 0.45),
  textDisabled: alpha(INK_RGB, 0.4),

  // Presentation-blue opacity ramp — derived from HBC_PRESENTATION_BLUE_RGB
  blueSubtle04: alpha(BLUE_RGB, 0.04),
  blueSubtle06: alpha(BLUE_RGB, 0.06),
  blueSubtle08: alpha(BLUE_RGB, 0.08),
  blueSubtle12: alpha(BLUE_RGB, 0.12),
  blueSubtle14: alpha(BLUE_RGB, 0.14),
  blueSubtle18: alpha(BLUE_RGB, 0.18),
  blueSubtle20: alpha(BLUE_RGB, 0.2),
  blueText82: alpha(BLUE_RGB, 0.82),

  // Presentation-orange opacity ramp — derived from HBC_PRESENTATION_ORANGE_RGB
  orangeSubtle02: alpha(ORANGE_RGB, 0.02),
  orangeSubtle03: alpha(ORANGE_RGB, 0.03),
  orangeSubtle06: alpha(ORANGE_RGB, 0.06),
  orangeSubtle10: alpha(ORANGE_RGB, 0.1),
  orangeSubtle18: alpha(ORANGE_RGB, 0.18),
  orangeSubtle22: alpha(ORANGE_RGB, 0.22),
  orangeSubtle25: alpha(ORANGE_RGB, 0.25),
  orangeSubtle28: alpha(ORANGE_RGB, 0.28),

  // Danger opacity ramp — presentation-lane local until shared semantics expose one
  dangerSubtle08: alpha(DANGER_RGB, 0.08),
  dangerSubtle22: alpha(DANGER_RGB, 0.22),
  dangerSubtle55: alpha(DANGER_RGB, 0.55),
  dangerItalic72: alpha(DANGER_RGB, 0.72),
} as const;

// ---------------------------------------------------------------------------
// Kudos surface grammar — spacing + radius aliases
// ---------------------------------------------------------------------------
//
// A light-weight local alias so Kudos public and companion surfaces
// stop repeating the same magic pixel values. Kept intentionally small:
// just enough to cover the recurring surface grammar (card padding,
// row gutters, pill radii) without becoming an over-engineered spacing
// framework.
// ---------------------------------------------------------------------------

export const KUDOS_SPACE = {
  xs: 4,
  sm: 6,
  md: 8,
  lg: 12,
  xl: 14,
  xxl: 16,
} as const;

export const KUDOS_RADIUS = {
  sm: 8,
  md: 10,
  lg: 12,
  xl: 14,
  xxl: 18,
  pill: 999,
} as const;

// ---------------------------------------------------------------------------
// SectionHeading — governance metadata section label
// ---------------------------------------------------------------------------

function governanceVars(): React.CSSProperties {
  return {
    '--hbk-gov-blue': KUDOS_GOV_TOKENS.brandBlue,
    '--hbk-gov-blue-12': KUDOS_GOV_TOKENS.blueSubtle12,
    '--hbk-gov-blue-18': KUDOS_GOV_TOKENS.blueSubtle18,
    '--hbk-gov-blue-20': KUDOS_GOV_TOKENS.blueSubtle20,
    '--hbk-gov-danger': KUDOS_GOV_TOKENS.dangerRed,
    '--hbk-gov-danger-08': KUDOS_GOV_TOKENS.dangerSubtle08,
    '--hbk-gov-danger-22': KUDOS_GOV_TOKENS.dangerSubtle22,
    '--hbk-gov-text-muted': KUDOS_GOV_TOKENS.textMuted,
    '--hbk-gov-text-secondary': KUDOS_GOV_TOKENS.textSecondary,
    '--hbk-gov-text-tertiary': KUDOS_GOV_TOKENS.textTertiary,
    '--hbk-gov-text-disabled': KUDOS_GOV_TOKENS.textDisabled,
  } as React.CSSProperties;
}

export function KudosSectionHeading({ children }: { children: React.ReactNode }): React.JSX.Element {
  return (
    <div className={governanceStyles.sectionHeading} style={governanceVars()}>
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
    <div className={governanceStyles.infoRow} style={governanceVars()}>
      <span className={governanceStyles.infoRowLabel}>{label}:</span> {value}
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
  testId,
}: {
  label: string;
  onClick: () => void;
  disabled: boolean;
  tone: GovernanceActionTone;
  testId?: string;
}): React.JSX.Element {
  const toneColor = TONE_COLORS[tone];
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      data-hbc-testid={testId}
      className={governanceActionButton()}
      style={{
        ...governanceVars(),
        '--hbk-gov-tone': toneColor,
      } as React.CSSProperties}
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
  testId,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
  testId?: string;
}): React.JSX.Element {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      data-hbc-testid={testId}
      className={governanceTabButton({ active })}
      style={governanceVars()}
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
  testId,
}: {
  label: string;
  active: boolean;
  onToggle: () => void;
  testId?: string;
}): React.JSX.Element {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-pressed={active}
      data-hbc-testid={testId}
      className={governanceToggleChip({ active })}
      style={governanceVars()}
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
    <span className={governanceStyles.toolbarLabel} style={governanceVars()}>
      {children}
    </span>
  );
}

// ---------------------------------------------------------------------------
// ErrorAlert — governance error message
// ---------------------------------------------------------------------------

export function KudosGovernanceErrorAlert({ message }: { message: string }): React.JSX.Element {
  return (
    <div role="alert" className={governanceStyles.errorAlert} style={governanceVars()}>
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
