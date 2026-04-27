import * as React from 'react';
import { HbcButton } from '@hbc/ui-kit/homepage';
import type { FoleonReaderLayoutProps } from '../FoleonReaderLayoutRegistry.js';
import type {
  FoleonReaderAction,
  FoleonReaderViewModel,
} from '../FoleonReaderViewModel.js';
import type { FoleonViewerDisabledReason, FoleonViewerTarget } from '../FoleonViewerTypes.js';
import type { LeadershipMessageCtaKind } from '../viewModels/leadershipMessageViewModel.js';
import { LEADERSHIP_EXTERNAL_TAB_HELPER_COPY } from '../viewModels/leadershipMessageViewModel.js';
import { useFoleonFullWindowViewer } from '../../components/FoleonFullWindowViewerProvider.js';
import styles from './FoleonReaderLayouts.module.css';

// ---------------------------------------------------------------------------
// Leadership Message — Executive Briefing (Prompt 02–03)
// ---------------------------------------------------------------------------
// Presentation copy is centralized in `getLeadershipPresentationState`.
// No new animations were introduced in Prompt 03 (prefers-reduced-motion
// checklist satisfied by not adding motion here).
//
// `iframeSurface` / `viewModel.mobileGate` ignored — full-window viewer only.
// ---------------------------------------------------------------------------

const PREVIEW_TEASER_FALLBACK =
  'Preview content shown for layout validation only. A live leadership message will appear here when a Foleon item is selected and published.';

const FORBIDDEN_CHIP_FRAGMENTS = [
  'leadership message reader',
  'preview layout',
  'sample',
  'cadence',
  'archive group',
  'executive byline not provided',
  'not been provided',
] as const;

const MAX_CONTEXT_CHIPS = 3;

function sanitizeChipFragment(raw: string): string | null {
  const t = raw.trim();
  if (!t.length) return null;
  const lower = t.toLowerCase();
  for (const frag of FORBIDDEN_CHIP_FRAGMENTS) {
    if (lower.includes(frag)) return null;
  }
  return t;
}

export interface LeadershipPresentationState {
  readonly eyebrow: string;
  readonly statusLabel: string;
  readonly teaserFallback?: string;
  readonly disabledReasonCopy?: string;
  readonly ctaHelperCopy?: string;
}

function employeeLeadershipDisabledCopy(
  reason: FoleonViewerDisabledReason | undefined,
  mode: LeadershipMessageCtaKind | 'preview',
): string {
  if (mode === 'external' && reason === 'requires-external-open') {
    return 'Use the published link below to open this message in Foleon.';
  }
  switch (reason) {
    case 'preview-only':
      return 'Preview only — a live leadership message will open here when it is published.';
    case 'no-embed-url':
      return 'This Foleon item is missing an approved viewer URL.';
    case 'embed-not-allowed':
      return 'This Foleon item cannot open in the embedded viewer.';
    case 'requires-external-open':
      return 'This Foleon item requires opening in a new tab.';
    default:
      return 'The current leadership message cannot be opened from HB Central right now.';
  }
}

/** Single source for eyebrow, status chip, teaser fallback, disabled copy, and CTA helper — Prompt 03. */
export function getLeadershipPresentationState(input: {
  readonly viewModelState: 'preview' | 'ready';
  readonly ctaKind: LeadershipMessageCtaKind;
  readonly disabledReason: FoleonViewerDisabledReason | undefined;
  readonly hasResolvedTeaser: boolean;
  readonly isDisabled: boolean;
}): LeadershipPresentationState {
  const { viewModelState, ctaKind, disabledReason, hasResolvedTeaser, isDisabled } = input;
  const previewPresentation = viewModelState === 'preview' || ctaKind === 'preview';

  if (previewPresentation) {
    return {
      eyebrow: 'Leadership message preview',
      statusLabel: 'Preview only',
      teaserFallback: hasResolvedTeaser ? undefined : PREVIEW_TEASER_FALLBACK,
      disabledReasonCopy: isDisabled ? employeeLeadershipDisabledCopy(disabledReason, 'preview') : undefined,
      ctaHelperCopy: undefined,
    };
  }

  const eyebrow = 'A message from leadership';

  if (ctaKind === 'live') {
    return {
      eyebrow,
      statusLabel: 'Current',
      teaserFallback: undefined,
      disabledReasonCopy: isDisabled ? employeeLeadershipDisabledCopy(disabledReason, 'live') : undefined,
      ctaHelperCopy: undefined,
    };
  }

  if (ctaKind === 'external') {
    return {
      eyebrow,
      statusLabel: 'Opens in Foleon',
      teaserFallback: undefined,
      disabledReasonCopy: isDisabled ? employeeLeadershipDisabledCopy(disabledReason, 'external') : undefined,
      ctaHelperCopy: LEADERSHIP_EXTERNAL_TAB_HELPER_COPY,
    };
  }

  return {
    eyebrow,
    statusLabel: 'Unavailable',
    teaserFallback: undefined,
    disabledReasonCopy: isDisabled ? employeeLeadershipDisabledCopy(disabledReason, 'blocked') : undefined,
    ctaHelperCopy: undefined,
  };
}

function leadershipLaunchAriaLabel(kind: LeadershipMessageCtaKind, headline: string): string {
  const h = headline.trim().length > 0 ? headline.trim() : 'Leadership Message';
  switch (kind) {
    case 'live':
      return `Read the leadership message: ${h}`;
    case 'preview':
      return `Open leadership message preview: ${h}`;
    case 'external':
      return `Open in Foleon: ${h}`;
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

  const resolvedTeaserContent =
    message?.teaser !== undefined && message.teaser.trim().length > 0
      ? message.teaser.trim()
      : viewModel.summary?.trim() ?? undefined;
  const hasResolvedTeaser = resolvedTeaserContent !== undefined;

  const ctaKind: LeadershipMessageCtaKind = message?.cta.kind ?? (isPreview ? 'preview' : 'blocked');

  const presentation = getLeadershipPresentationState({
    viewModelState: viewModel.state,
    ctaKind,
    disabledReason: target.disabledReason,
    hasResolvedTeaser,
    isDisabled,
  });

  const teaser = resolvedTeaserContent ?? presentation.teaserFallback;

  const primaryLabel =
    message?.cta.primaryLabel ??
    (isPreview ? 'Open preview' : isDisabled ? 'Message unavailable' : 'Read the leadership message');
  const launchAriaLabel = leadershipLaunchAriaLabel(ctaKind, headline);

  const externalPublishedUrl =
    message?.cta.kind === 'external' ? publishedUrlFromTarget(target) : undefined;

  const showFooterBand =
    archiveAction ||
    viewModel.archiveNote ||
    externalPublishedUrl ||
    message?.cta.kind === 'external';

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
                <p className={styles.executiveEyebrow}>{presentation.eyebrow}</p>
                <span className={styles.executiveCadence}>{presentation.statusLabel}</span>
                {isPreview && viewModel.previewLabel ? (
                  <span
                    className={styles.executivePreviewLabel}
                    aria-label="Preview content"
                  >
                    {viewModel.previewLabel}
                  </span>
                ) : null}
              </div>
              <div className={styles.executiveTitleMeasure}>
                <h2 className={styles.executiveTitle} id={viewModel.titleElementId}>
                  {headline}
                </h2>
              </div>
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

            {isDisabled && presentation.disabledReasonCopy ? (
              <p
                id={reasonId}
                className={styles.briefingDisabledReason}
                role="status"
                aria-live="polite"
              >
                {presentation.disabledReasonCopy}
              </p>
            ) : null}
          </div>
        </div>

        {showFooterBand ? (
          <div className={styles.executiveFooter}>
            {archiveAction ? (
              <HbcButton variant="secondary" onClick={archiveAction.onClick}>
                {archiveAction.label}
              </HbcButton>
            ) : null}
            {message?.cta.kind === 'external' && presentation.ctaHelperCopy ? (
              <span className={styles.briefingExternalHint}>{presentation.ctaHelperCopy}</span>
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
  let count = 0;
  for (const note of notes) {
    if (count >= MAX_CONTEXT_CHIPS) break;
    const lab = sanitizeChipFragment(note.label);
    const val = sanitizeChipFragment(note.value);
    if (!lab && !val) continue;
    chips.push(
      <li key={note.id} className={styles.briefingChip}>
        {lab ? <span className={styles.briefingChipLabel}>{lab}</span> : null}
        {val ? <span className={styles.briefingChipValue}>{val}</span> : null}
      </li>,
    );
    count += 1;
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
