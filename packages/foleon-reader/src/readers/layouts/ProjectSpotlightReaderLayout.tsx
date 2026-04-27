import * as React from 'react';
import { HbcButton } from '@hbc/ui-kit/homepage';
import type { FoleonReaderLayoutProps } from '../FoleonReaderLayoutRegistry.js';
import type {
  FoleonReaderViewModel,
  FoleonReaderAction,
} from '../FoleonReaderViewModel.js';
import type { FoleonViewerDisabledReason } from '../FoleonViewerTypes.js';
import { useFoleonFullWindowViewer } from '../../components/FoleonFullWindowViewerProvider.js';
import styles from './FoleonReaderLayouts.module.css';

// ---------------------------------------------------------------------------
// Project Spotlight reader layout — Phase-05 PS-02 visual-first redesign
// ---------------------------------------------------------------------------
// Employee-facing monthly project showcase. The card itself is the
// interactive launch surface for the shared full-window viewer
// (Inclusive Components card-launch pattern: a `<button>` wrapping the
// title, with a transparent `::after` pseudo-element overlaying the
// card). The CTA pill rendered inside the launch button is a visual
// affordance only — there is exactly ONE interactive control inside
// the article card.
//
// Lane identity (`data-foleon-layout="project-spotlight-feature"`),
// data-attributes, and disabled-reason semantics are preserved from
// 04B/04C — only the visual treatment, copy, and rendered fields
// change. `iframeSurface` and `viewModel.mobileGate` are intentionally
// ignored here. Inline iframe is never rendered in this lane.
// ---------------------------------------------------------------------------

export function ProjectSpotlightReaderLayout(props: FoleonReaderLayoutProps): React.JSX.Element | null {
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
  const media = viewModel.projectMedia;
  const cadence = viewModel.cadenceLabel ?? 'Monthly feature';
  const ctaLabel = viewModel.ctaLabel ?? 'View project spotlight';

  return (
    <div
      data-foleon-reader-layout="project-spotlight"
      data-foleon-reader-lane="projectSpotlight"
      data-foleon-reader-state={viewModel.state}
      data-foleon-layout="project-spotlight-feature"
    >
      <article
        className={styles.showcaseSurface}
        aria-labelledby={viewModel.titleElementId}
      >
        <div
          className={styles.showcaseCard}
          data-foleon-article-card
          data-foleon-article-lane="projectSpotlight"
          data-foleon-viewer-target-id={target.id}
          data-foleon-article-state={articleState}
        >
          <MediaStage media={media} title={card.title} isPreview={isPreview} />

          <div className={styles.showcaseOverlay}>
            <div className={styles.showcaseEyebrowRow}>
              <p className={styles.showcaseEyebrow}>{viewModel.eyebrow}</p>
              <span className={styles.showcaseCadence}>{cadence}</span>
              {isPreview && viewModel.previewLabel ? (
                <span className={styles.showcasePreviewChip} aria-label="Preview content">
                  {viewModel.previewLabel}
                </span>
              ) : null}
            </div>

            {viewModel.projectLabel ? (
              <p className={styles.showcaseProjectKicker}>Project · {viewModel.projectLabel}</p>
            ) : null}

            <h2 className={styles.showcaseTitle} id={viewModel.titleElementId}>
              <CardLaunchButton
                target={target}
                reasonId={reasonId}
                isDisabled={isDisabled}
                ctaLabel={ctaLabel}
              >
                <span className={styles.showcaseTitleText}>{card.title}</span>
              </CardLaunchButton>
            </h2>

            {viewModel.summary ? (
              <p className={styles.showcaseTeaser}>{viewModel.summary}</p>
            ) : null}

            <FactRow viewModel={viewModel} />
          </div>

          {isDisabled ? (
            <p
              id={reasonId}
              className={styles.showcaseDisabledReason}
              role="status"
              aria-live="polite"
            >
              {formatDisabledReason(target.disabledReason)}
            </p>
          ) : null}
        </div>

        {archiveAction || viewModel.archiveNote ? (
          <div className={styles.showcaseFooter}>
            {archiveAction ? (
              <HbcButton variant="secondary" onClick={archiveAction.onClick}>
                {archiveAction.label}
              </HbcButton>
            ) : null}
            {viewModel.archiveNote ? (
              <span className={styles.showcaseArchiveNote}>{viewModel.archiveNote}</span>
            ) : null}
          </div>
        ) : null}

        {viewModel.warnings.map((warning, i) => (
          <p key={i} className={styles.showcaseWarning}>
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
  readonly ctaLabel: string;
  readonly children: React.ReactNode;
}

function CardLaunchButton(props: CardLaunchButtonProps): React.JSX.Element {
  const { target, reasonId, isDisabled, ctaLabel, children } = props;
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
      className={styles.showcaseCardLaunch}
      aria-disabled={isDisabled || undefined}
      aria-describedby={isDisabled ? reasonId : undefined}
      onClick={handleClick}
    >
      {children}
      <span className={styles.showcaseCtaPill} aria-hidden="true">
        {ctaLabel}
        <span className={styles.showcaseCtaArrow} aria-hidden="true">→</span>
      </span>
    </button>
  );
}

function MediaStage(props: {
  readonly media: FoleonReaderViewModel['projectMedia'];
  readonly title: string;
  readonly isPreview: boolean;
}): React.JSX.Element {
  const { media, isPreview } = props;
  const showImage = !isPreview && media?.hasRecordMedia === true && media.primaryImageUrl;
  return (
    <div className={styles.showcaseMediaStage}>
      {showImage ? (
        <img
          className={styles.showcaseMediaImage}
          src={media!.primaryImageUrl}
          alt={media!.accessibleLabel ?? ''}
          loading="lazy"
        />
      ) : (
        <div className={styles.showcaseMediaPlaceholder} aria-hidden="true" />
      )}
      <div className={styles.showcaseMediaScrim} aria-hidden="true" />
    </div>
  );
}

function FactRow(props: { viewModel: FoleonReaderViewModel }): React.JSX.Element | null {
  const { viewModel } = props;
  const facts: { id: string; label: string; value: string }[] = [];
  // Each chip is governed by its own source field. No coupling between chips.
  const region = viewModel.projectFacts?.location;
  const market = viewModel.projectFacts?.market;
  const featured =
    viewModel.freshnessValue && viewModel.freshnessValue !== viewModel.cadenceLabel
      ? viewModel.freshnessValue
      : undefined;
  if (region && region.trim().length > 0) {
    facts.push({ id: 'location', label: 'Location', value: region });
  }
  if (market && market.trim().length > 0) {
    facts.push({ id: 'market', label: 'Market', value: market });
  }
  if (featured && featured !== 'This month') {
    facts.push({ id: 'featured', label: 'Featured', value: featured });
  }
  if (facts.length === 0) return null;
  return (
    <ul className={styles.showcaseFactRow} aria-label="Project Spotlight facts">
      {facts.map((fact) => (
        <li key={fact.id} className={styles.showcaseFactChip}>
          <span className={styles.showcaseFactLabel}>{fact.label}</span>
          <span className={styles.showcaseFactValue}>{fact.value}</span>
        </li>
      ))}
    </ul>
  );
}

function formatDisabledReason(reason: FoleonViewerDisabledReason | undefined): string {
  switch (reason) {
    case 'preview-only':
      return "Preview shown. The full spotlight will open when this month's feature is published.";
    case 'no-embed-url':
      return 'This spotlight is missing its Foleon viewer link.';
    case 'embed-not-allowed':
      return 'This spotlight cannot open in the embedded viewer.';
    case 'requires-external-open':
      return 'This spotlight must open outside the homepage.';
    default:
      return 'This spotlight is not available in the viewer yet.';
  }
}
