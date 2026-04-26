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
// Company Pulse reader layout — Phase-04 Wave-01 Prompt-04B
// ---------------------------------------------------------------------------
// Lane-owned briefing / newsroom digest. The lead update card is the
// interactive launch surface for the shared full-window Foleon viewer
// (Inclusive Components card-launch pattern). Disabled targets carry
// `aria-disabled` plus `aria-describedby` and surface a visible reason.
// Inline iframe is removed for this lane — the Foleon document opens in
// the shared full-window viewer.
//
// Ready-state secondary digest stays empty (no fabricated entries); the
// "Open full archive" footer affordance directs users to previous editions.
// ---------------------------------------------------------------------------

export function CompanyPulseReaderLayout(props: FoleonReaderLayoutProps): React.JSX.Element | null {
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

  return (
    <div
      data-foleon-reader-layout="company-pulse"
      data-foleon-reader-lane="companyPulse"
      data-foleon-reader-state={viewModel.state}
      data-foleon-layout="company-pulse-briefing"
    >
      <article
        className={styles.briefingSurface}
        aria-labelledby={viewModel.titleElementId}
      >
        <header className={styles.briefingHeader}>
          <div className={styles.briefingHeaderRow}>
            <p className={styles.briefingEyebrow}>{viewModel.eyebrow}</p>
            <span className={styles.briefingCadence}>Frequent</span>
            {isPreview && viewModel.previewLabel ? (
              <span className={styles.briefingPreviewLabel} aria-label="Preview content">
                {viewModel.previewLabel}
              </span>
            ) : null}
          </div>
          <h2 className={styles.briefingTitle} id={viewModel.titleElementId}>
            {viewModel.title}
          </h2>
          {viewModel.summary ? (
            <p className={styles.briefingSummary}>{viewModel.summary}</p>
          ) : null}
        </header>

        {viewModel.categoryChips && viewModel.categoryChips.length > 0 ? (
          <ul className={styles.categoryChips} aria-label="Pulse categories">
            {viewModel.categoryChips.map((chip) => (
              <li key={chip.id} className={styles.categoryChip}>
                {chip.label}
              </li>
            ))}
          </ul>
        ) : null}

        {viewModel.briefingLead ? (
          <section
            className={`${styles.briefingLead} ${styles.articleCard}`}
            aria-label="Latest Company Pulse update"
            data-foleon-article-card
            data-foleon-article-lane="companyPulse"
            data-foleon-viewer-target-id={target.id}
            data-foleon-article-state={articleState}
          >
            <p className={styles.leadKicker}>
              <span>Latest update</span>
              {' · '}
              <span>{viewModel.freshnessValue}</span>
              {viewModel.briefingLead.dateline ? (
                <>
                  {' · '}
                  <span className={styles.leadDateline}>
                    {viewModel.briefingLead.dateline}
                  </span>
                </>
              ) : null}
            </p>
            <h3 className={styles.leadTitle}>
              <CardLaunchButton
                target={target}
                reasonId={reasonId}
                isDisabled={isDisabled}
              >
                {viewModel.briefingLead.title}
              </CardLaunchButton>
            </h3>
            <p className={styles.leadBody}>{viewModel.briefingLead.body}</p>
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
          </section>
        ) : null}

        {renderDigest(viewModel)}

        {isPreview && viewModel.pulseTimeline && viewModel.pulseTimeline.length > 0 ? (
          <ol className={styles.pulseTimeline} aria-label="Pulse timeline">
            {viewModel.pulseTimeline.map((entry) => (
              <li key={entry.id} className={styles.timelineEntry}>
                <span className={styles.timelineLabel}>{entry.label}</span>
                <span className={styles.timelineValue}>{entry.value}</span>
              </li>
            ))}
          </ol>
        ) : null}

        {archiveAction || viewModel.archiveNote ? (
          <div className={styles.briefingFooter}>
            {archiveAction ? (
              <HbcButton variant="secondary" onClick={archiveAction.onClick}>
                {archiveAction.label}
              </HbcButton>
            ) : null}
            {viewModel.archiveNote ? (
              <span className={styles.briefingArchiveNote}>{viewModel.archiveNote}</span>
            ) : null}
          </div>
        ) : null}

        {viewModel.warnings.map((warning, i) => (
          <p key={i} className={styles.briefingWarning}>
            {warning}
          </p>
        ))}
      </article>
    </div>
  );
}

function pickArchiveAction(actions: readonly FoleonReaderAction[]): FoleonReaderAction | undefined {
  return actions.find((action) => action.id === 'open-archive');
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

function renderDigest(viewModel: FoleonReaderViewModel): React.ReactNode {
  const digest = viewModel.briefingDigest;
  if (!digest) return null;

  if (digest.length === 0) {
    return (
      <div
        className={styles.digestEmpty}
        aria-label="Company Pulse digest"
        data-foleon-pulse-digest-state="empty"
      >
        <p className={styles.digestEmptyHeading}>More updates</p>
        <p className={styles.digestEmptyBody}>
          Previous Company Pulse editions are available in the archive. Use
          {' '}
          <strong>Open full archive</strong>
          {' '}
          to browse earlier updates.
        </p>
      </div>
    );
  }

  return (
    <ul
      className={styles.briefingDigest}
      aria-label="Recent Company Pulse updates"
      data-foleon-pulse-digest-state="populated"
    >
      {digest.map((item) => (
        <li key={item.id} className={styles.digestItem}>
          <p className={styles.digestCategory}>{item.category}</p>
          <h4 className={styles.digestTitle}>{item.title}</h4>
          <p className={styles.digestSummary}>{item.summary}</p>
          {item.dateline ? (
            <p className={styles.digestDateline}>{item.dateline}</p>
          ) : null}
        </li>
      ))}
    </ul>
  );
}

function formatDisabledReason(reason: FoleonViewerDisabledReason | undefined): string {
  switch (reason) {
    case 'preview-only':
      return 'Preview only — a live Company Pulse update will open here when published.';
    case 'no-embed-url':
      return 'This Company Pulse update does not carry an embeddable Foleon URL yet.';
    case 'embed-not-allowed':
      return 'This Company Pulse update disallows in-line embedding by governance policy.';
    case 'requires-external-open':
      return 'This Company Pulse update must be opened in a new tab. Use the published link if available.';
    default:
      return 'This Company Pulse update is not available in the in-line viewer.';
  }
}
