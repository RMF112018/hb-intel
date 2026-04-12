/**
 * kudosShells — semantic shell families for the HB Kudos surface.
 *
 * Phase-27 Prompt-04 closure. Splits the previously-overloaded
 * `HbcKudosComposerFlyout` shell usage into four explicitly semantic
 * shells so distinct workflows stop forcing their content through a
 * primitive whose name and layout constraints were authored for the
 * composer only.
 *
 * Shell families:
 *
 *   - `KudosReaderShell`          — long-form reading (article
 *     reader). Reading-width body, close-only footer.
 *   - `KudosFeedShell`            — list browsing (full feed).
 *     Full-width body with dense scan layout.
 *   - `KudosTaskDialogShell`      — compact operator task dialogs
 *     (reject / revise / schedule / reassign / discard). Narrow
 *     body, task-centric grammar. Phase-28 Prompt-04: the inner
 *     body no longer carries its own dialog role + aria label;
 *     the outer `HbcKudosComposerFlyout` already owns dialog
 *     semantics (dialog role + aria-modal + focus trap + scroll
 *     lock + ESC-to-close), and nesting another dialog role inside
 *     it created ambiguous accessibility semantics.
 *   - `KudosGovernanceDetailShell`— moderation detail + action-family
 *     workspace (companion detail flyout). Section landmark body
 *     with governance-grade padding.
 *
 * Each shell composes `HbcKudosComposerFlyout` for the shared
 * mechanical behaviors (focus trap, scroll lock, host-chrome offset,
 * ESC-to-close, reduced-motion choreography) because those
 * behaviors are genuinely the same across every Kudos right-side
 * sheet. The split lives at the *layout / semantic* layer — where
 * the doctrine mismatch actually was.
 *
 * The composer itself continues to use `HbcKudosComposerFlyout`
 * directly, because that shell's canonical purpose IS the composer.
 * There is no `KudosComposerShell` wrapper; a one-line wrapper
 * would add a thin alias with no material differentiation.
 */
import * as React from 'react';
import { HbcKudosComposerFlyout } from '@hbc/ui-kit/homepage';
import styles from './kudosShells.module.css';

// ---------------------------------------------------------------------------
// Shared flyout-action contract — mirrors HbcKudosComposerFlyout's own
// action props without importing its internal types. The three
// workflow shells accept the same primary/secondary/tertiary action
// shape so call-sites stay familiar.
// ---------------------------------------------------------------------------

export interface KudosShellAction {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  loading?: boolean;
}

// ---------------------------------------------------------------------------
// KudosReaderShell — long-form reading of an approved recognition
// ---------------------------------------------------------------------------

export interface KudosReaderShellProps {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  testId?: string;
  ariaLabelledBy?: string;
  children: React.ReactNode;
}

export function KudosReaderShell({
  open,
  onClose,
  title,
  subtitle,
  testId,
  ariaLabelledBy,
  children,
}: KudosReaderShellProps): React.JSX.Element {
  return (
    <HbcKudosComposerFlyout
      open={open}
      onClose={onClose}
      title={title}
      subtitle={subtitle}
      primaryAction={{ label: 'Close', onClick: onClose }}
    >
      <article
        className={styles.readerBody}
        data-hbc-testid={testId}
        aria-labelledby={ariaLabelledBy}
      >
        {children}
      </article>
    </HbcKudosComposerFlyout>
  );
}

// ---------------------------------------------------------------------------
// KudosFeedShell — list-browse surface for the full Kudos feed
// ---------------------------------------------------------------------------

export interface KudosFeedShellProps {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  testId?: string;
  ariaLabel?: string;
  children: React.ReactNode;
}

export function KudosFeedShell({
  open,
  onClose,
  title,
  subtitle,
  testId,
  ariaLabel,
  children,
}: KudosFeedShellProps): React.JSX.Element {
  return (
    <HbcKudosComposerFlyout
      open={open}
      onClose={onClose}
      title={title}
      subtitle={subtitle}
      primaryAction={{ label: 'Close', onClick: onClose }}
    >
      <section
        className={styles.feedBody}
        data-hbc-testid={testId}
        aria-label={ariaLabel}
      >
        {children}
      </section>
    </HbcKudosComposerFlyout>
  );
}

// ---------------------------------------------------------------------------
// KudosTaskDialogShell — compact operator task dialog
// ---------------------------------------------------------------------------

export interface KudosTaskDialogShellProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  primaryAction: KudosShellAction;
  /** Defaults to a Cancel action that closes the dialog. */
  secondaryAction?: KudosShellAction;
  testId?: string;
  children: React.ReactNode;
}

export function KudosTaskDialogShell({
  open,
  onClose,
  title,
  description,
  primaryAction,
  secondaryAction,
  testId,
  children,
}: KudosTaskDialogShellProps): React.JSX.Element {
  return (
    <HbcKudosComposerFlyout
      open={open}
      onClose={onClose}
      title={title}
      primaryAction={primaryAction}
      secondaryAction={secondaryAction ?? { label: 'Cancel', onClick: onClose }}
    >
      {/*
        Phase-28 Prompt-04 closure: this wrapper intentionally carries
        no nested dialog role and no duplicate aria-label. The outer
        `HbcKudosComposerFlyout` is the dialog; its title bar already
        labels this surface. Adding a nested dialog role here
        confused assistive tech ("dialog inside dialog"), so the
        inner wrapper is now a plain grouping landmark.
      */}
      <div className={styles.taskDialogBody} data-hbc-testid={testId}>
        {description ? (
          <p className={styles.taskDialogDescription}>{description}</p>
        ) : null}
        {children}
      </div>
    </HbcKudosComposerFlyout>
  );
}

export const kudosShellStyles = styles;

// ---------------------------------------------------------------------------
// KudosGovernanceDetailShell — moderation detail + action-family
// workspace. Used by the companion's detail flyout; keeps a full
// section landmark body with governance-grade padding.
// ---------------------------------------------------------------------------

export interface KudosGovernanceDetailShellProps {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  primaryAction: KudosShellAction;
  secondaryAction?: KudosShellAction;
  testId?: string;
  ariaLabel?: string;
  children: React.ReactNode;
}

export function KudosGovernanceDetailShell({
  open,
  onClose,
  title,
  subtitle,
  primaryAction,
  secondaryAction,
  testId,
  ariaLabel,
  children,
}: KudosGovernanceDetailShellProps): React.JSX.Element {
  return (
    <HbcKudosComposerFlyout
      open={open}
      onClose={onClose}
      title={title}
      subtitle={subtitle}
      primaryAction={primaryAction}
      secondaryAction={secondaryAction}
    >
      <section
        className={styles.detailBody}
        data-hbc-testid={testId}
        aria-label={ariaLabel}
      >
        {children}
      </section>
    </HbcKudosComposerFlyout>
  );
}
