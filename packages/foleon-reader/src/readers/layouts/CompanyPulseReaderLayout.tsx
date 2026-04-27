import * as React from 'react';
import { HbcButton } from '@hbc/ui-kit/homepage';
import type { FoleonReaderLayoutProps } from '../FoleonReaderLayoutRegistry.js';
import type { FoleonReaderAction, FoleonReaderPulseStoryCard } from '../FoleonReaderViewModel.js';
import type { FoleonViewerDisabledReason, FoleonViewerTarget } from '../FoleonViewerTypes.js';
import { useFoleonFullWindowViewer } from '../../components/FoleonFullWindowViewerProvider.js';
import styles from './FoleonReaderLayouts.module.css';

// ---------------------------------------------------------------------------
// Company Pulse editorial board layout — CP-03 / CP-04
// ---------------------------------------------------------------------------
// Company Pulse presents a featured top story and supporting article board.
// Ready state remains honest with current resolver constraints: one real
// featured story and an empty supporting board note. Preview state shows
// sample cards that demonstrate intended hierarchy without implying live
// supporting stories. Inline iframe is never rendered in this lane.
// ---------------------------------------------------------------------------

export function CompanyPulseReaderLayout(props: FoleonReaderLayoutProps): React.JSX.Element | null {
  const { viewModel } = props;
  const isPreview = viewModel.state === 'preview';
  const card = viewModel.primaryArticle;
  const board = viewModel.pulseBoard;
  const featured = board?.featuredStory;
  if (!card) return null;

  const target = featured?.target ?? card.target;
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
      data-foleon-layout="company-pulse-editorial-board"
    >
      <article className={styles.pulseBoardSurface} aria-labelledby={viewModel.titleElementId}>
        <header className={styles.pulseBoardHeader}>
          <p className={styles.pulseBoardEyebrow}>Company Pulse</p>
          <h2 className={styles.pulseBoardTitle} id={viewModel.titleElementId}>
            {isPreview ? 'Latest from Company Pulse (Preview)' : 'Latest from Company Pulse'}
          </h2>
          <p className={styles.pulseBoardSummary}>
            {isPreview
              ? 'Sample layout showing a featured story and supporting Company Pulse story board.'
              : 'Top story and supporting updates from Foleon-managed Company Pulse content.'}
          </p>
          {archiveAction ? (
            <div className={styles.pulseBoardBrowseAction}>
              <HbcButton variant="secondary" onClick={archiveAction.onClick}>
                View all Company Pulse
              </HbcButton>
            </div>
          ) : null}
        </header>

        <div className={styles.pulseEditorialGrid}>
          <section
            className={`${styles.pulseFeaturedCard} ${styles.articleCard}`}
            aria-label="Company Pulse top story"
            data-foleon-article-card
            data-foleon-article-lane="companyPulse"
            data-foleon-viewer-target-id={target.id}
            data-foleon-article-state={articleState}
          >
            <div className={styles.pulseFeaturedStack}>
              <MediaStage title={featured?.title ?? card.title} media={viewModel.pulseMedia} isPreview={isPreview} />

              <div className={styles.pulseFeaturedContent}>
                <div className={styles.pulseEyebrowRow}>
                  <p className={styles.pulseEyebrow}>Top story</p>
                  <span className={styles.pulseStateChip}>{isPreview ? 'Preview' : 'Live'}</span>
                  {isPreview ? (
                    <span className={styles.pulseSampleChip}>Sample story</span>
                  ) : null}
                </div>
                {!isPreview ? (
                  <p className={styles.pulseFreshness}>Updated {featured?.dateline ?? viewModel.freshnessValue}</p>
                ) : (
                  <p className={styles.pulseFreshness}>Preview - sample headline</p>
                )}
                <h3 className={styles.pulseFeaturedTitle}>
                  <PulseLaunchButton target={target} reasonId={reasonId} isDisabled={isDisabled} variant="featured">
                    <span className={styles.pulseFeaturedTitleClamp}>{featured?.title ?? card.title}</span>
                    <span className={styles.pulseFeaturedCta} aria-hidden="true">
                      Open story
                      <span className={styles.showcaseCtaArrow} aria-hidden="true">
                        →
                      </span>
                    </span>
                  </PulseLaunchButton>
                </h3>
                <p className={styles.pulseFeaturedSummary}>
                  {featured?.summary && featured.summary.trim().length > 0
                    ? featured.summary
                    : 'Open story to read the latest Company Pulse update in Foleon.'}
                </p>
                <CoverageLabels />
              </div>
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

          <section className={styles.pulseStoryBoard} aria-label="Supporting Company Pulse stories">
            {board && board.supportingStories.length > 0 ? (
              board.supportingStories.slice(0, 4).map((story) => (
                <PulseStoryCard key={story.id} story={story} isPreview={isPreview} />
              ))
            ) : (
              <div className={styles.pulseEmptyBoard} data-foleon-pulse-board-state="empty">
                <p className={styles.pulseEmptyBoardHeading}>Supporting story board</p>
                <p className={styles.pulseEmptyBoardBody}>
                  {board?.supportingEmptyNote ??
                    'Additional Company Pulse stories will appear here when more Foleon items are available.'}
                </p>
                <div className={styles.pulseEmptyBoardSlots} aria-hidden="true">
                  <span />
                  <span />
                  <span />
                  <span />
                </div>
              </div>
            )}
          </section>
        </div>

        {viewModel.archiveNote ? (
          <div className={styles.pulseFooter}>
            <span className={styles.pulseArchiveNote}>{viewModel.archiveNote}</span>
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

interface PulseLaunchButtonProps {
  readonly target: FoleonViewerTarget;
  readonly reasonId: string;
  readonly isDisabled: boolean;
  readonly variant: 'featured' | 'supporting';
  readonly accessibleName?: string;
  readonly children: React.ReactNode;
}

function PulseLaunchButton(props: PulseLaunchButtonProps): React.JSX.Element {
  const { target, reasonId, isDisabled, variant, accessibleName, children } = props;
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

  const buttonClass =
    variant === 'featured' ? styles.pulseLaunchButton : styles.pulseStoryCardLaunch;

  return (
    <button
      type="button"
      className={buttonClass}
      aria-label={variant === 'supporting' ? accessibleName : undefined}
      aria-disabled={isDisabled || undefined}
      aria-describedby={isDisabled ? reasonId : undefined}
      onClick={handleClick}
    >
      {children}
    </button>
  );
}

function PulseStoryCard(props: {
  readonly story: FoleonReaderPulseStoryCard;
  readonly isPreview: boolean;
}): React.JSX.Element {
  const { story, isPreview } = props;
  const t = story.target;
  const isDisabled = !t.canOpen;
  const articleState: 'enabled' | 'disabled' | 'preview' = isPreview
    ? 'preview'
    : isDisabled
      ? 'disabled'
      : 'enabled';
  const reasonId = `${t.id}-supporting-disabled`;

  return (
    <article
      className={styles.pulseStoryCard}
      data-foleon-article-card
      data-foleon-article-lane="companyPulse"
      data-foleon-viewer-target-id={t.id}
      data-foleon-article-state={articleState}
      data-foleon-pulse-story-state={story.isPreview ? 'preview-sample' : 'live'}
    >
      <PulseLaunchButton
        target={t}
        reasonId={reasonId}
        isDisabled={isDisabled}
        variant="supporting"
        accessibleName={story.title}
      >
        <div className={styles.pulseStoryMedia}>
          {story.imageUrl ? (
            <img
              className={styles.pulseStoryMediaImage}
              src={story.imageUrl}
              alt={story.imageAlt ?? ''}
              loading="lazy"
            />
          ) : (
            <div className={styles.pulseStoryMediaFallback} aria-hidden="true" />
          )}
        </div>
        <div className={styles.pulseStoryContent}>
          <p className={styles.pulseStoryCategory}>
            {story.category ?? 'Around HB'}
            {story.isSample ? ' - Sample story' : ''}
          </p>
          <span className={styles.pulseStoryTitle} aria-hidden="true">
            {story.title}
          </span>
          <span className={styles.pulseStoryCardCta} aria-hidden="true">
            Open story <span aria-hidden="true">→</span>
          </span>
          {story.summary ? (
            <p className={styles.pulseStorySummary}>{story.summary}</p>
          ) : null}
          {story.dateline ? (
            <p className={styles.pulseStoryMeta}>{story.dateline}</p>
          ) : null}
        </div>
      </PulseLaunchButton>
      {isDisabled ? (
        <p id={reasonId} className={styles.pulseStoryDisabledReason} role="status" aria-live="polite">
          {formatDisabledReason(t.disabledReason)}
        </p>
      ) : null}
    </article>
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
      return 'Preview only — this top story opens when live Company Pulse content is published.';
    case 'no-embed-url':
      return 'This Company Pulse story is missing its Foleon viewer link.';
    case 'embed-not-allowed':
      return 'This Company Pulse story cannot open in the embedded viewer.';
    case 'requires-external-open':
      return 'This Company Pulse story must open outside HB Central.';
    default:
      return 'This Company Pulse story is not available yet.';
  }
}
