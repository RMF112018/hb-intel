import * as React from 'react';
import { HbcButton } from '@hbc/ui-kit/homepage';
import type { FoleonReaderLayoutProps } from '../FoleonReaderLayoutRegistry.js';
import type {
  FoleonReaderAction,
  FoleonReaderViewModel,
} from '../FoleonReaderViewModel.js';
import type { FoleonViewerDisabledReason, FoleonViewerTarget } from '../FoleonViewerTypes.js';
import type { LeadershipMessageCtaKind } from '../viewModels/leadershipMessageViewModel.js';
import { useFoleonFullWindowViewer } from '../../components/FoleonFullWindowViewerProvider.js';
import styles from './FoleonReaderLayouts.module.css';

// ---------------------------------------------------------------------------
// Leadership Message — Executive Briefing Feature (Prompt 02)
// ---------------------------------------------------------------------------
// Calm executive access point into Foleon-managed content. Single in-card
// launch button (`styles.cardLaunch`) with ::after covering `.articleCard`;
// non-interactive bands use `pointer-events: none` so the overlay remains
// the hit target. Full article body stays in Foleon — teaser only here.
//
// `iframeSurface` / `viewModel.mobileGate` ignored — full-window viewer only.
// ---------------------------------------------------------------------------

const FORBIDDEN_CHIP_FRAGMENTS = [
  'leadership message reader',
  'preview layout',
  'sample',
  'cadence',
  'archive group',
  'executive byline not provided',
  'not been provided',
] as const;

function sanitizeChipFragment(raw: string): string | null {
  const t = raw.trim();
  if (!t.length) return null;
  const lower = t.toLowerCase();
  for (const frag of FORBIDDEN_CHIP_FRAGMENTS) {
    if (lower.includes(frag)) return null;
  }
  return t;
}

function leadershipLaunchAriaLabel(kind: LeadershipMessageCtaKind, headline: string): string {
  const h = headline.trim().length > 0 ? headline.trim() : 'Leadership Message';
  switch (kind) {
    case 'live':
      return `Read the leadership message: ${h}`;
    case 'preview':
      return `Open leadership message preview: ${h}`;
    case 'external':
      return `Open leadership message externally: ${h}`;
    case 'blocked':
      return `Message unavailable: ${h}`;
    default:
      return `Message unavailable: ${h}`;
  }
}

function publishedUrlFromTarget(target: FoleonViewerTarget): string | undefined {
  if ('url' in target && typeof target.url === 'string') {
    const u = target.url.trim();
    return u.length > 0 ? u : undefined;
  }
  return undefined;
}

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
  const headline = viewModel.title;
  const teaser =
    message?.teaser !== undefined && message.teaser.trim().length > 0
      ? message.teaser.trim()
      : viewModel.summary?.trim() ?? undefined;

  const ctaKind: LeadershipMessageCtaKind = message?.cta.kind ?? (isPreview ? 'preview' : 'blocked');
  const primaryLabel =
    message?.cta.primaryLabel ??
    (isPreview ? 'Open preview' : isDisabled ? 'Message unavailable' : 'Read the leadership message');
  const launchAriaLabel = leadershipLaunchAriaLabel(ctaKind, headline);

  const externalPublishedUrl =
    message?.cta.kind === 'external' ? publishedUrlFromTarget(target) : undefined;

  return (
    <div
      data-foleon-reader-layout="leadership-message"
      data-foleon-reader-lane="leadershipMessage"
      data-foleon-reader-state={viewModel.state}
      data-foleon-layout="leadership-message"
    >
      <article className={styles.executiveSurface} aria-labelledby={viewModel.titleElementId}>
        <div
          className={styles.articleCard}
          data-foleon-article-card
          data-foleon-article-lane="leadershipMessage"
          data-foleon-viewer-target-id={target.id}
          data-foleon-article-state={articleState}
          data-foleon-leadership-briefing="true"
        >
          <div className={styles.briefingPassiveBand}>
            <header className={styles.briefingBriefHeader}>
              <div className={styles.executiveEyebrowRow}>
                <p className={styles.executiveEyebrow}>{message?.laneLabel ?? viewModel.eyebrow}</p>
                <span className={styles.executiveCadence}>{message?.statusLabel ?? 'Executive update'}</span>
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
                {headline}
              </h2>
              {teaser ? <p className={styles.briefingTeaser}>{teaser}</p> : null}
            </header>
          </div>

          <div className={styles.briefingLaunchTrack}>
            <CardLaunchButton
              target={target}
              reasonId={reasonId}
              isDisabled={isDisabled}
              ariaLabel={launchAriaLabel}
            >
              <span className={styles.briefingLaunchLabel}>{primaryLabel}</span>
            </CardLaunchButton>
          </div>

          <div className={styles.briefingPassiveBand}>
            <ExecutiveByline message={message} />

            {message?.pullQuote ? (
              <blockquote className={styles.executivePullQuote}>{message.pullQuote}</blockquote>
            ) : null}

            <LeadershipContextChips notes={message?.contextNotes} />

            {isDisabled ? (
              <p
                id={reasonId}
                className={styles.briefingDisabledReason}
                role="status"
                aria-live="polite"
              >
                {formatDisabledReason(target.disabledReason, message?.cta.kind)}
              </p>
            ) : null}
          </div>
        </div>

        {archiveAction || viewModel.archiveNote || externalPublishedUrl || message?.cta.secondaryLabel ? (
          <div className={styles.executiveFooter}>
            {archiveAction ? (
              <HbcButton variant="secondary" onClick={archiveAction.onClick}>
                {archiveAction.label}
              </HbcButton>
            ) : null}
            {message?.cta.kind === 'external' && message.cta.secondaryLabel ? (
              <span className={styles.briefingExternalHint}>{message.cta.secondaryLabel}</span>
            ) : null}
            {externalPublishedUrl ? (
              <a
                className={styles.briefingExternalLink}
                href={externalPublishedUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                Open published message
              </a>
            ) : null}
            {viewModel.archiveNote ? (
              <span className={styles.executiveArchiveNote}>{viewModel.archiveNote}</span>
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

function LeadershipContextChips(props: {
  readonly notes?: readonly { readonly id: string; readonly label: string; readonly value: string }[];
}): React.JSX.Element | null {
  const { notes } = props;
  if (!notes || notes.length === 0) return null;
  const chips: React.ReactNode[] = [];
  for (const note of notes) {
    const lab = sanitizeChipFragment(note.label);
    const val = sanitizeChipFragment(note.value);
    if (!lab && !val) continue;
    chips.push(
      <li key={note.id} className={styles.briefingChip}>
        {lab ? <span className={styles.briefingChipLabel}>{lab}</span> : null}
        {val ? <span className={styles.briefingChipValue}>{val}</span> : null}
      </li>,
    );
  }
  if (chips.length === 0) return null;
  return (
    <ul className={styles.briefingChipList} aria-label="Leadership message details">
      {chips}
    </ul>
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
      {hasByline ? <p className={styles.executiveByline}>{message.byline}</p> : null}
      {hasRole ? <p className={styles.executiveRole}>· {message.role}</p> : null}
    </div>
  );
}

interface CardLaunchButtonProps {
  readonly target: NonNullable<FoleonReaderViewModel['primaryArticle']>['target'];
  readonly reasonId: string;
  readonly isDisabled: boolean;
  readonly ariaLabel: string;
  readonly children: React.ReactNode;
}

function CardLaunchButton(props: CardLaunchButtonProps): React.JSX.Element {
  const { target, reasonId, isDisabled, ariaLabel, children } = props;
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
      aria-label={ariaLabel}
      aria-disabled={isDisabled || undefined}
      aria-describedby={isDisabled ? reasonId : undefined}
      onClick={handleClick}
    >
      {children}
    </button>
  );
}

function formatDisabledReason(
  reason: FoleonViewerDisabledReason | undefined,
  ctaKind: LeadershipMessageCtaKind | undefined,
): string {
  if (ctaKind === 'external' && reason === 'requires-external-open') {
    return 'This message opens outside the inline viewer. Use the published link below when available.';
  }
  switch (reason) {
    case 'preview-only':
      return 'Preview only — a live Leadership Message will open here when published.';
    case 'no-embed-url':
      return 'This Leadership Message does not carry an embeddable Foleon URL yet.';
    case 'embed-not-allowed':
      return 'This Leadership Message disallows in-line embedding by governance policy.';
    case 'requires-external-open':
      return 'This Leadership Message must be opened from the published link.';
    default:
      return 'This Leadership Message is not available in the in-line viewer.';
  }
}
