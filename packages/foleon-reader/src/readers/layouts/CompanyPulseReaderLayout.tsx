import * as React from 'react';
import { HbcButton } from '@hbc/ui-kit/homepage';
import type { FoleonReaderLayoutProps } from '../FoleonReaderLayoutRegistry.js';
import type { FoleonReaderAction } from '../FoleonReaderViewModel.js';
import type { FoleonViewerDisabledReason } from '../FoleonViewerTypes.js';
import { useFoleonFullWindowViewer } from '../../components/FoleonFullWindowViewerProvider.js';
import styles from './FoleonReaderLayouts.module.css';

// ---------------------------------------------------------------------------
// Company Pulse edition launcher layout — CP-02
// ---------------------------------------------------------------------------
// Company Pulse is a Foleon publication access point. The dominant edition
// card is the single interactive launch surface for the shared full-window
// viewer (Inclusive Components card-launch pattern). Disabled targets carry
// `aria-disabled` + `aria-describedby` with a visible reason. Inline iframe
// is never rendered in this lane.
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
      data-foleon-layout="company-pulse-edition-launcher"
    >
      <article
        className={styles.pulseEditionSurface}
        aria-labelledby={viewModel.titleElementId}
      >
        <section
          className={`${styles.pulseEditionCard} ${styles.articleCard}`}
          aria-label="Current Company Pulse edition"
          data-foleon-article-card
          data-foleon-article-lane="companyPulse"
          data-foleon-viewer-target-id={target.id}
          data-foleon-article-state={articleState}
        >
          <MediaStage
            title={card.title}
            media={viewModel.pulseMedia}
            isPreview={isPreview}
          />
          <div className={styles.pulseEditionOverlay}>
            <div className={styles.pulseEyebrowRow}>
              <p className={styles.pulseEyebrow}>Company Pulse</p>
              <span className={styles.pulseStateChip}>
                {isPreview ? 'Preview' : (viewModel.cadenceLabel ?? 'Current edition')}
              </span>
            </div>
            {!isPreview ? (
              <p className={styles.pulseFreshness}>Updated {viewModel.freshnessValue}</p>
            ) : (
              <p className={styles.pulseFreshness}>Preview - no live edition selected</p>
            )}
            <h2 className={styles.pulseEditionTitle} id={viewModel.titleElementId}>
              <CardLaunchButton target={target} reasonId={reasonId} isDisabled={isDisabled}>
                <span>{card.title}</span>
                <span className={styles.pulseCtaPill} aria-hidden="true">
                  Open Company Pulse
                  <span className={styles.showcaseCtaArrow} aria-hidden="true">→</span>
                </span>
              </CardLaunchButton>
            </h2>
            <p className={styles.pulseEditionTeaser}>
              {card.summary && card.summary.trim().length > 0
                ? card.summary
                : 'The full Company Pulse publication opens in the governed Foleon viewer.'}
            </p>
            <CoverageLabels />
          </div>
          {isDisabled ? (
            <p
              id={reasonId}
              className={styles.pulseDisabledReason}
              role="status"
              aria-live="polite"
            >
              {formatDisabledReason(target.disabledReason)}
            </p>
          ) : null}
        </section>

        {archiveAction || viewModel.archiveNote ? (
          <div className={styles.pulseFooter}>
            {archiveAction ? (
              <HbcButton variant="secondary" onClick={archiveAction.onClick}>
                View previous editions
              </HbcButton>
            ) : null}
            {viewModel.archiveNote ? (
              <span className={styles.pulseArchiveNote}>
                {viewModel.archiveNote.replace('Lane archive filtering comes in a later workflow.', 'The archive opens previous Company Pulse editions.')}
              </span>
            ) : null}
          </div>
        ) : null}

        {viewModel.warnings.map((warning, i) => (
          <p key={i} className={styles.pulseWarning}>
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
  readonly target: NonNullable<FoleonReaderLayoutProps['viewModel']['primaryArticle']>['target'];
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
      className={styles.pulseLaunchButton}
      aria-disabled={isDisabled || undefined}
      aria-describedby={isDisabled ? reasonId : undefined}
      onClick={handleClick}
    >
      {children}
    </button>
  );
}

function CoverageLabels(): React.JSX.Element {
  return (
    <ul className={styles.pulseCoverageLabels} aria-label="Company Pulse coverage">
      <li className={styles.pulseCoverageLabel}>Company News</li>
      <li className={styles.pulseCoverageLabel}>Events</li>
      <li className={styles.pulseCoverageLabel}>Recognition</li>
      <li className={styles.pulseCoverageLabel}>Operations</li>
    </ul>
  );
}

function MediaStage(props: {
  readonly title: string;
  readonly media: FoleonReaderLayoutProps['viewModel']['pulseMedia'];
  readonly isPreview: boolean;
}): React.JSX.Element {
  const { title, media, isPreview } = props;
  const showImage = !isPreview && media?.hasRecordMedia === true && media.primaryImageUrl;
  return (
    <div className={styles.pulseMediaStage}>
      {showImage ? (
        <img
          className={styles.pulseMediaImage}
          src={media!.primaryImageUrl}
          alt={media!.accessibleLabel ?? `Company Pulse cover image for ${title}`}
          loading="lazy"
        />
      ) : (
        <div className={styles.pulseMediaPlaceholder} aria-hidden="true" />
      )}
      <div className={styles.pulseMediaScrim} aria-hidden="true" />
    </div>
  );
}

function formatDisabledReason(reason: FoleonViewerDisabledReason | undefined): string {
  switch (reason) {
    case 'preview-only':
      return 'Preview only — the current Company Pulse edition will open here when published.';
    case 'no-embed-url':
      return 'This Company Pulse edition is missing its Foleon viewer link.';
    case 'embed-not-allowed':
      return 'This Company Pulse edition cannot open in the embedded viewer.';
    case 'requires-external-open':
      return 'This Company Pulse edition must open outside HB Central.';
    default:
      return 'This Company Pulse edition is not available yet.';
  }
}
