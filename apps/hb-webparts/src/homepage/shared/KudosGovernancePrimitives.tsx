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
  governanceSectionHeading,
  governanceInfoRow,
  governanceInfoRowLabel,
  governanceToolbarLabel,
  governanceErrorAlert,
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
// Semantic intent aliases over KUDOS_GOV_TOKENS
// ---------------------------------------------------------------------------
//
// Intent-named wrappers around the opacity-step `KUDOS_GOV_TOKENS`
// entries. Kept for future JS consumers that want to reason about
// intent (e.g. `governanceBorderIdle`) rather than opacity-step.
// Today most surfaces consume tokens through the unified
// `kudosCSSVars()` CSS-var bridge instead.
// ---------------------------------------------------------------------------

export const KUDOS_INTENT = {
  // Brand
  brandBlue: KUDOS_GOV_TOKENS.brandBlue,
  brandOrange: KUDOS_GOV_TOKENS.brandOrange,

  // Ink hierarchy (body copy on light editorial surfaces)
  inkPrimary: KUDOS_GOV_TOKENS.textPrimary,
  inkHeading: KUDOS_GOV_TOKENS.textHeading,
  inkSecondary: KUDOS_GOV_TOKENS.textSecondary,
  inkTertiary: KUDOS_GOV_TOKENS.textTertiary,
  inkMuted: KUDOS_GOV_TOKENS.textMuted,
  inkFaint: KUDOS_GOV_TOKENS.textFaint,
  inkCaption: KUDOS_GOV_TOKENS.textCaption,
  inkDisabled: KUDOS_GOV_TOKENS.textDisabled,

  // Governance (presentation-blue ramp)
  governanceSurfaceIdle: KUDOS_GOV_TOKENS.blueSubtle04,
  governanceSurfaceFocus: KUDOS_GOV_TOKENS.blueSubtle08,
  governanceSurfaceActive: KUDOS_GOV_TOKENS.blueSubtle12,
  governanceBorderSubtle: KUDOS_GOV_TOKENS.blueSubtle14,
  governanceBorderIdle: KUDOS_GOV_TOKENS.blueSubtle18,
  governanceBorderStrong: KUDOS_GOV_TOKENS.blueSubtle20,
  governanceAccentInk: KUDOS_GOV_TOKENS.blueText82,

  // Recognition surfaces (presentation-orange ramp)
  recognitionSurfaceWhisper: KUDOS_GOV_TOKENS.orangeSubtle02,
  recognitionSurfaceIdle: KUDOS_GOV_TOKENS.orangeSubtle03,
  recognitionSurfaceHover: KUDOS_GOV_TOKENS.orangeSubtle06,
  recognitionSurfaceFocus: KUDOS_GOV_TOKENS.orangeSubtle10,
  recognitionBorderSubtle: KUDOS_GOV_TOKENS.orangeSubtle18,
  recognitionBorderStrong: KUDOS_GOV_TOKENS.orangeSubtle22,
  recognitionBorderEmphasis: KUDOS_GOV_TOKENS.orangeSubtle25,
  recognitionBorderFocus: KUDOS_GOV_TOKENS.orangeSubtle28,

  // Danger surfaces
  dangerInk: KUDOS_GOV_TOKENS.dangerRed,
  dangerSurface: KUDOS_GOV_TOKENS.dangerSubtle08,
  dangerBorder: KUDOS_GOV_TOKENS.dangerSubtle22,
  dangerAccent: KUDOS_GOV_TOKENS.dangerSubtle55,
  dangerInkItalic: KUDOS_GOV_TOKENS.dangerItalic72,

  // Warning
  warningInk: KUDOS_GOV_TOKENS.warningOrange,
} as const;

export type KudosIntentToken = keyof typeof KUDOS_INTENT;

/**
 * @deprecated Phase-23 Prompt 08 removed the unused KUDOS_SPACE scale
 * from the Kudos surface-family index. Surfaces never consumed it —
 * all spacing flows through CSS modules and the governed
 * `HBC_SPACE_*` tokens. The export is retained as an empty record for
 * one release so any unexpected external consumer gets a clear type
 * error rather than a runtime miss; it will be deleted in the next
 * pass.
 */
export const KUDOS_SPACE = {} as const;

/**
 * @deprecated Phase-23 Prompt 08 removed the unused KUDOS_RADIUS scale.
 * Same rationale as KUDOS_SPACE.
 */
export const KUDOS_RADIUS = {} as const;

// ---------------------------------------------------------------------------
// Unified CSS-var bridge — the one seam between KUDOS_GOV_TOKENS and every
// Kudos CSS module in `apps/hb-webparts`.
// ---------------------------------------------------------------------------
//
// Phase-23 Prompt 08 token / variant / CSS architecture unification:
// prior to this pass six different surfaces each shipped their own
// bespoke inline record mapping `KUDOS_GOV_TOKENS.*` into per-surface
// custom-property prefixes (`--pks-*`, `--hbk-cmp-*`, `--hbk-gov-*`,
// `--hbk-flyout-*`, ad-hoc `--hbk-*` snippets). Same values, six names.
//
// `kudosCSSVars()` replaces all of them with one record under a single
// `--hbk-*` prefix. Every kudos surface in `apps/hb-webparts` spreads
// this at its outer root:
//
//     <section style={kudosCSSVars()} className={…}>
//
// CSS modules then reference `var(--hbk-text-muted)`, `var(--hbk-blue-18)`,
// etc. directly — no more per-module naming dialects.
//
// The `@hbc/ui-kit` composer uses its own `--hbc-kudos-*` prefix inside
// the ui-kit package boundary; that stays separate by design.
// ---------------------------------------------------------------------------

export function kudosCSSVars(): React.CSSProperties {
  return {
    // Brand
    '--hbk-brand-blue': KUDOS_GOV_TOKENS.brandBlue,
    '--hbk-brand-orange': KUDOS_GOV_TOKENS.brandOrange,

    // Ink hierarchy
    '--hbk-text-primary': KUDOS_GOV_TOKENS.textPrimary,
    '--hbk-text-heading': KUDOS_GOV_TOKENS.textHeading,
    '--hbk-text-secondary': KUDOS_GOV_TOKENS.textSecondary,
    '--hbk-text-tertiary': KUDOS_GOV_TOKENS.textTertiary,
    '--hbk-text-muted': KUDOS_GOV_TOKENS.textMuted,
    '--hbk-text-faint': KUDOS_GOV_TOKENS.textFaint,
    '--hbk-text-caption': KUDOS_GOV_TOKENS.textCaption,
    '--hbk-text-disabled': KUDOS_GOV_TOKENS.textDisabled,

    // Blue ramp (governance surfaces)
    '--hbk-blue-04': KUDOS_GOV_TOKENS.blueSubtle04,
    '--hbk-blue-06': KUDOS_GOV_TOKENS.blueSubtle06,
    '--hbk-blue-08': KUDOS_GOV_TOKENS.blueSubtle08,
    '--hbk-blue-12': KUDOS_GOV_TOKENS.blueSubtle12,
    '--hbk-blue-14': KUDOS_GOV_TOKENS.blueSubtle14,
    '--hbk-blue-18': KUDOS_GOV_TOKENS.blueSubtle18,
    '--hbk-blue-20': KUDOS_GOV_TOKENS.blueSubtle20,
    '--hbk-blue-ink': KUDOS_GOV_TOKENS.blueText82,

    // Orange ramp (recognition surfaces)
    '--hbk-orange-02': KUDOS_GOV_TOKENS.orangeSubtle02,
    '--hbk-orange-03': KUDOS_GOV_TOKENS.orangeSubtle03,
    '--hbk-orange-06': KUDOS_GOV_TOKENS.orangeSubtle06,
    '--hbk-orange-08': KUDOS_GOV_TOKENS.orangeSubtle10,
    '--hbk-orange-10': KUDOS_GOV_TOKENS.orangeSubtle10,
    '--hbk-orange-18': KUDOS_GOV_TOKENS.orangeSubtle18,
    '--hbk-orange-22': KUDOS_GOV_TOKENS.orangeSubtle22,
    '--hbk-orange-25': KUDOS_GOV_TOKENS.orangeSubtle25,
    '--hbk-orange-28': KUDOS_GOV_TOKENS.orangeSubtle28,
    // Authored surface-lane helpers — kept here so CSS never hardcodes.
    '--hbk-orange-55': `rgba(${HBC_PRESENTATION_ORANGE_RGB}, 0.55)`,
    '--hbk-orange-shadow': `rgba(${HBC_PRESENTATION_ORANGE_RGB}, 0.08)`,
    '--hbk-surface-0': '#ffffff',
    '--hbk-surface-warm': 'rgba(255, 250, 246, 0.8)',

    // Danger
    '--hbk-danger': KUDOS_GOV_TOKENS.dangerRed,
    '--hbk-danger-08': KUDOS_GOV_TOKENS.dangerSubtle08,
    '--hbk-danger-22': KUDOS_GOV_TOKENS.dangerSubtle22,
    '--hbk-danger-55': KUDOS_GOV_TOKENS.dangerSubtle55,
    '--hbk-danger-ink-italic': KUDOS_GOV_TOKENS.dangerItalic72,
  } as React.CSSProperties;
}

// ---------------------------------------------------------------------------
// SectionHeading — governance metadata section label
// ---------------------------------------------------------------------------

// governanceVars() was merged into kudosCSSVars() by Phase-23 Prompt 08.
// Consumers in this file now spread kudosCSSVars() directly; the dynamic
// per-button tone color is composed alongside via the `--hbk-tone` slot.

export function KudosSectionHeading({ children }: { children: React.ReactNode }): React.JSX.Element {
  return (
    <div className={governanceSectionHeading()} style={kudosCSSVars()}>
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
    <div className={governanceInfoRow()} style={kudosCSSVars()}>
      <span className={governanceInfoRowLabel()}>{label}:</span> {value}
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
        ...kudosCSSVars(),
        '--hbk-tone': toneColor,
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
      style={kudosCSSVars()}
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
      style={kudosCSSVars()}
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
    <span className={governanceToolbarLabel()} style={kudosCSSVars()}>
      {children}
    </span>
  );
}

// ---------------------------------------------------------------------------
// ErrorAlert — governance error message
// ---------------------------------------------------------------------------

export function KudosGovernanceErrorAlert({ message }: { message: string }): React.JSX.Element {
  return (
    <div role="alert" className={governanceErrorAlert()} style={kudosCSSVars()}>
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
      <div className={governanceStyles.dialogBody} style={kudosCSSVars()}>
        {description ? (
          <p className={governanceStyles.dialogDescription}>{description}</p>
        ) : null}
        {choices ? (
          <select
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            className={governanceStyles.dialogInput}
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
            className={governanceStyles.dialogInput}
          />
        )}
      </div>
    </HbcKudosComposerFlyout>
  );
}

// ---------------------------------------------------------------------------
// DateTimeDialog — task-specific scheduling / expiry picker
//
// Replaces raw ISO free-text entry for schedule / feature-expiry
// actions. Uses the native `datetime-local` input so operators pick
// a moment in their own timezone; serializes to an ISO UTC string
// on confirm so the typed governance patch contract is preserved.
// ---------------------------------------------------------------------------

export interface KudosGovernanceDateTimeDialogProps {
  open: boolean;
  onClose: () => void;
  /** Called with a full ISO-UTC string (e.g. "2026-05-01T14:00:00.000Z"). */
  onConfirm: (isoUtc: string) => void;
  title: string;
  description?: string;
  fieldLabel?: string;
  hint?: string;
  /** Pre-fill the picker with an existing ISO value. */
  defaultIso?: string;
  confirmLabel?: string;
  /** When true, confirming with an empty picker clears the value. */
  allowEmpty?: boolean;
}

/**
 * Convert an ISO-UTC string to the `yyyy-MM-ddTHH:mm` shape the
 * `datetime-local` input expects, interpreted in the operator's
 * local timezone.
 */
function isoToLocalInputValue(iso: string | undefined): string {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  const pad = (n: number): string => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function KudosGovernanceDateTimeDialog({
  open,
  onClose,
  onConfirm,
  title,
  description,
  fieldLabel,
  hint,
  defaultIso,
  confirmLabel,
  allowEmpty,
}: KudosGovernanceDateTimeDialogProps): React.JSX.Element {
  const [draft, setDraft] = React.useState(() => isoToLocalInputValue(defaultIso));

  React.useEffect(() => {
    if (open) setDraft(isoToLocalInputValue(defaultIso));
  }, [open, defaultIso]);

  const handleConfirm = (): void => {
    if (!draft.trim()) {
      if (allowEmpty) {
        onConfirm('');
        onClose();
      }
      return;
    }
    // `datetime-local` values have no timezone suffix — treat them
    // as wall time in the operator's locale and convert to ISO UTC.
    const local = new Date(draft);
    if (Number.isNaN(local.getTime())) return;
    onConfirm(local.toISOString());
    onClose();
  };

  return (
    <HbcKudosComposerFlyout
      open={open}
      onClose={onClose}
      title={title}
      primaryAction={{ label: confirmLabel ?? 'Confirm', onClick: handleConfirm }}
      secondaryAction={{ label: 'Cancel', onClick: onClose }}
    >
      <div className={governanceStyles.dialogBody} style={kudosCSSVars()}>
        {description ? (
          <p className={governanceStyles.dialogDescription}>{description}</p>
        ) : null}
        <label className={governanceStyles.dialogFieldLabel}>
          {fieldLabel ?? 'Date and time'}
        </label>
        <input
          type="datetime-local"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') handleConfirm(); }}
          autoFocus
          className={governanceStyles.dialogInput}
        />
        {hint ? <p className={governanceStyles.dialogHint}>{hint}</p> : null}
      </div>
    </HbcKudosComposerFlyout>
  );
}

// ---------------------------------------------------------------------------
// AssignmentDialog — email-resolving reassignment picker
//
// Replaces raw SharePoint user-id entry with a human-usable email
// lookup. Resolves the email against `/_api/web/siteusers/getByEmail`
// on the canonical list-host site and calls `onConfirm(userId)` with
// the resolved numeric id, preserving the typed `reassign` patch
// contract. Failures are surfaced inline — no silent fallbacks.
// ---------------------------------------------------------------------------

export interface KudosGovernanceAssignmentDialogProps {
  open: boolean;
  onClose: () => void;
  /** Called with the resolved SharePoint user id + display context. */
  onConfirm: (resolved: { userId: number; email: string; displayName?: string }) => void;
  title: string;
  description?: string;
  /** Canonical list-host URL used for the REST lookup. */
  listHostUrl: string;
  confirmLabel?: string;
}

interface ResolvedAssignee {
  userId: number;
  email: string;
  displayName?: string;
}

export function KudosGovernanceAssignmentDialog({
  open,
  onClose,
  onConfirm,
  title,
  description,
  listHostUrl,
  confirmLabel,
}: KudosGovernanceAssignmentDialogProps): React.JSX.Element {
  const [email, setEmail] = React.useState('');
  const [resolved, setResolved] = React.useState<ResolvedAssignee | undefined>();
  const [resolving, setResolving] = React.useState(false);
  const [errorText, setErrorText] = React.useState<string | undefined>();

  React.useEffect(() => {
    if (open) {
      setEmail('');
      setResolved(undefined);
      setResolving(false);
      setErrorText(undefined);
    }
  }, [open]);

  const resolveEmail = React.useCallback(async (): Promise<void> => {
    const trimmed = email.trim();
    if (!trimmed) {
      setErrorText('Enter an email address to resolve.');
      return;
    }
    setResolving(true);
    setErrorText(undefined);
    setResolved(undefined);
    try {
      const res = await fetch(
        `${listHostUrl}/_api/web/siteusers/getByEmail('${encodeURIComponent(trimmed)}')`,
        { headers: { Accept: 'application/json;odata=nometadata' } },
      );
      if (!res.ok) {
        setErrorText(
          res.status === 404
            ? 'No SharePoint user matches that email on the list-host site.'
            : `Lookup failed: HTTP ${res.status}`,
        );
        return;
      }
      const body = (await res.json()) as { Id?: number; Title?: string; Email?: string };
      if (typeof body.Id !== 'number' || body.Id <= 0) {
        setErrorText('Resolved user did not carry a valid SharePoint id.');
        return;
      }
      setResolved({ userId: body.Id, email: body.Email ?? trimmed, displayName: body.Title });
    } catch (err) {
      setErrorText(err instanceof Error ? err.message : 'Lookup failed.');
    } finally {
      setResolving(false);
    }
  }, [email, listHostUrl]);

  const handleConfirm = (): void => {
    if (!resolved) return;
    onConfirm(resolved);
    onClose();
  };

  return (
    <HbcKudosComposerFlyout
      open={open}
      onClose={onClose}
      title={title}
      primaryAction={{
        label: confirmLabel ?? 'Reassign',
        onClick: handleConfirm,
        disabled: !resolved,
      }}
      secondaryAction={{ label: 'Cancel', onClick: onClose }}
    >
      <div className={governanceStyles.dialogBody} style={kudosCSSVars()}>
        {description ? (
          <p className={governanceStyles.dialogDescription}>{description}</p>
        ) : null}
        <label className={governanceStyles.dialogFieldLabel}>Assignee email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => { setEmail(e.target.value); setResolved(undefined); setErrorText(undefined); }}
          onKeyDown={(e) => { if (e.key === 'Enter') void resolveEmail(); }}
          placeholder="name@hedrickbrothers.com"
          autoFocus
          className={governanceStyles.dialogInput}
        />
        <KudosActionButton
          label={resolving ? 'Resolving…' : resolved ? 'Resolved — look up again' : 'Resolve user'}
          tone="info"
          disabled={resolving || !email.trim()}
          onClick={() => void resolveEmail()}
          testId="hb-kudos-assignment-dialog-resolve"
        />
        {errorText ? (
          <p className={governanceStyles.dialogErrorText}>{errorText}</p>
        ) : null}
        {resolved ? (
          <div className={governanceStyles.dialogResolved}>
            Will reassign to{' '}
            <span className={governanceStyles.dialogResolvedEmphasis}>
              {resolved.displayName ?? resolved.email}
            </span>
            {resolved.displayName ? ` (${resolved.email})` : ''} · SharePoint id{' '}
            <span className={governanceStyles.dialogResolvedEmphasis}>{resolved.userId}</span>
          </div>
        ) : null}
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
    return (
      <div className={governanceStyles.timelineStatus} style={kudosCSSVars()}>
        Loading timeline…
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <div className={governanceStyles.timelineStatus} style={kudosCSSVars()}>
        {fallbackText ?? 'No timeline events.'}
      </div>
    );
  }

  return (
    <div className={governanceStyles.timelineList} style={kudosCSSVars()}>
      {events.map((evt) => (
        <div key={evt.id} className={governanceStyles.timelineEvent}>
          <HbcStatusBadge
            variant={chipVariant(mapTone(evt.eventType))}
            size="small"
            label={mapLabel(evt.eventType)}
          />
          <div className={governanceStyles.timelineEventBody}>
            <div className={governanceStyles.timelineEventActor}>
              {evt.actorDisplayName ?? 'System'} · {new Date(evt.eventAt).toLocaleString()}
            </div>
            {evt.publicNote ? (
              <div className={governanceStyles.timelineEventPublic}>{evt.publicNote}</div>
            ) : null}
            {showInternalNotes && evt.internalNote ? (
              <div className={governanceStyles.timelineEventInternal}>
                Internal: {evt.internalNote}
              </div>
            ) : null}
          </div>
        </div>
      ))}
    </div>
  );
}
