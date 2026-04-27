import * as React from 'react';
import { HbcButton } from '@hbc/ui-kit/homepage';
import type { FoleonReaderLayoutProps } from '../FoleonReaderLayoutRegistry.js';
import type {
  FoleonReaderAction,
  FoleonReaderViewModel,
} from '../FoleonReaderViewModel.js';
import type { FoleonViewerDisabledReason } from '../FoleonViewerTypes.js';
import { useFoleonFullWindowViewer } from '../../components/FoleonFullWindowViewerProvider.js';
import styles from './FoleonReaderLayouts.module.css';

// ---------------------------------------------------------------------------
// Leadership Message reader layout — Phase-04 Wave-01 Prompt-05
// ---------------------------------------------------------------------------
// Lane-owned executive message / letter composition. No longer delegates
// to the shared compatibility shell. Calm, premium, restrained — strong
// typography, no outer card border, edge-bleed-ready outer surface.
//
// The message card itself is the interactive launch surface for the
// shared full-window Foleon viewer (Inclusive Components / Heydon
// Pickering card-launch pattern, identical to Spotlight + Pulse: a real
// `<button>` wraps the title; a transparent `::after` pseudo-element
// overlays the entire card to capture clicks). Disabled targets carry
// `aria-disabled="true"` plus `aria-describedby` to a visible
// `role="status"` reason; the click handler suppresses activation and
// surfaces the structured refusal as a DOM marker.
//
// `iframeSurface` and `viewModel.mobileGate` are intentionally ignored —
// Leadership now opens the Foleon document in the shared full-window
// viewer; no inline iframe path remains for this lane.
//
// FoleonContentRecord schema does NOT carry byline / role / portrait
// fields. The layout shows honest fallbacks when these are absent and
// never invents executive identity in ready state.
// ---------------------------------------------------------------------------

export function LeadershipMessageReaderLayout(
  props: FoleonReaderLayoutProps,
): React.JSX.Element | null {
  const { viewModel } = props;
  const isPreview = viewModel.state === 'preview';
  const card = viewModel.primaryArticle;
  if (!card) return null;

  const target = card.target;
  const isDisabled = !target.canOpen;
  const articleState: 'enabled' | 'disabled' | 'preview' = isPreview
    ? 'preview'
    : isDisabled
      ? 'disabled'
      : 'enabled';
  const reasonId = `${target.id}-disabled-reason`;
  const archiveAction = pickArchiveAction(viewModel.actions);
  const message = viewModel.leadershipMessage;

  return (
    <div
      data-foleon-reader-layout="leadership-message"
      data-foleon-reader-lane="leadershipMessage"
      data-foleon-reader-state={viewModel.state}
      data-foleon-layout="leadership-message"
    >
      <article
        className={styles.executiveSurface}
        aria-labelledby={viewModel.titleElementId}
      >
        <div
          className={styles.articleCard}
          data-foleon-article-card
          data-foleon-article-lane="leadershipMessage"
          data-foleon-viewer-target-id={target.id}
          data-foleon-article-state={articleState}
        >
          <header className={styles.executiveHeader}>
            <div className={styles.executiveEyebrowRow}>
              <p className={styles.executiveEyebrow}>{viewModel.eyebrow}</p>
              <span className={styles.executiveCadence}>Executive update</span>
              {isPreview && viewModel.previewLabel ? (
                <span
                  className={styles.executivePreviewLabel}
                  aria-label="Preview content"
                >
                  {viewModel.previewLabel}
                </span>
              ) : null}
            </div>
            <h2 className={styles.executiveTitle} id={viewModel.titleElementId}>
              <CardLaunchButton
                target={target}
                reasonId={reasonId}
                isDisabled={isDisabled}
              >
                {viewModel.title}
              </CardLaunchButton>
            </h2>
            {viewModel.summary ? (
              <p className={styles.executiveBody}>{viewModel.summary}</p>
            ) : null}
          </header>

          <ExecutiveByline message={message} />

          {message?.pullQuote ? (
            <blockquote className={styles.executivePullQuote}>
              {message.pullQuote}
            </blockquote>
          ) : null}

          {message?.contextNotes && message.contextNotes.length > 0 ? (
            <ul
              className={styles.executiveContextNotes}
              aria-label="Leadership Message context"
            >
              {message.contextNotes.map((note) => (
                <li key={note.id} className={styles.executiveContextNoteItem}>
                  <span className={styles.executiveContextNoteLabel}>{note.label}</span>
                  <span className={styles.executiveContextNoteValue}>{note.value}</span>
                </li>
              ))}
            </ul>
          ) : null}

          {isDisabled ? (
            <p
              id={reasonId}
              className={styles.disabledReason}
              role="status"
              aria-live="polite"
            >
              {formatDisabledReason(target.disabledReason)}
            </p>
          ) : null}
        </div>

        {archiveAction || viewModel.archiveNote ? (
          <div className={styles.executiveFooter}>
            {archiveAction ? (
              <HbcButton variant="secondary" onClick={archiveAction.onClick}>
                {archiveAction.label}
              </HbcButton>
            ) : null}
            {viewModel.archiveNote ? (
              <span className={styles.executiveArchiveNote}>
                {viewModel.archiveNote}
              </span>
            ) : null}
          </div>
        ) : null}

        {viewModel.warnings.map((warning, i) => (
          <p key={i} className={styles.executiveWarning}>
            {warning}
          </p>
        ))}
      </article>
    </div>
  );
}

function pickArchiveAction(
  actions: readonly FoleonReaderAction[],
): FoleonReaderAction | undefined {
  return actions.find((action) => action.id === 'open-archive');
}

function ExecutiveByline(props: {
  readonly message: FoleonReaderViewModel['leadershipMessage'];
}): React.JSX.Element | null {
  const { message } = props;
  if (!message) return null;
  const hasByline = typeof message.byline === 'string' && message.byline.trim().length > 0;
  const hasRole = typeof message.role === 'string' && message.role.trim().length > 0;
  if (!hasByline && !hasRole) {
    return null;
  }
  return (
    <div className={styles.executiveBylineRow}>
      {hasByline ? (
        <p className={styles.executiveByline}>{message.byline}</p>
      ) : null}
      {hasRole ? (
        <p className={styles.executiveRole}>· {message.role}</p>
      ) : null}
    </div>
  );
}

interface CardLaunchButtonProps {
  readonly target: NonNullable<FoleonReaderViewModel['primaryArticle']>['target'];
  readonly reasonId: string;
  readonly isDisabled: boolean;
  readonly children: React.ReactNode;
}

function CardLaunchButton(props: CardLaunchButtonProps): React.JSX.Element {
  const { target, reasonId, isDisabled, children } = props;
  const viewer = useFoleonFullWindowViewer();

  const handleClick = React.useCallback(
    (event: React.MouseEvent<HTMLButtonElement>): void => {
      if (isDisabled) {
        event.currentTarget.setAttribute(
          'data-foleon-article-last-refusal',
          target.disabledReason ?? 'unknown',
        );
        return;
      }
      const result = viewer.openViewer(target, event.currentTarget);
      if (result.opened === false) {
        event.currentTarget.setAttribute(
          'data-foleon-article-last-refusal',
          result.reason,
        );
      } else {
        event.currentTarget.removeAttribute('data-foleon-article-last-refusal');
      }
    },
    [isDisabled, target, viewer],
  );

  return (
    <button
      type="button"
      className={styles.cardLaunch}
      aria-disabled={isDisabled || undefined}
      aria-describedby={isDisabled ? reasonId : undefined}
      onClick={handleClick}
    >
      {children}
    </button>
  );
}

function formatDisabledReason(reason: FoleonViewerDisabledReason | undefined): string {
  switch (reason) {
    case 'preview-only':
      return 'Preview only — a live Leadership Message will open here when published.';
    case 'no-embed-url':
      return 'This Leadership Message does not carry an embeddable Foleon URL yet.';
    case 'embed-not-allowed':
      return 'This Leadership Message disallows in-line embedding by governance policy.';
    case 'requires-external-open':
      return 'This Leadership Message must be opened in a new tab. Use the published link if available.';
    default:
      return 'This Leadership Message is not available in the in-line viewer.';
  }
}
