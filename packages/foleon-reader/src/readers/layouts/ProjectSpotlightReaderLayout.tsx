import * as React from 'react';
import { HbcButton } from '@hbc/ui-kit/homepage';
import type { FoleonReaderLayoutProps } from '../FoleonReaderLayoutRegistry.js';
import type {
  FoleonReaderProjectFacts,
  FoleonReaderViewModel,
  FoleonReaderAction,
} from '../FoleonReaderViewModel.js';
import type { FoleonViewerDisabledReason } from '../FoleonViewerTypes.js';
import { useFoleonFullWindowViewer } from '../../components/FoleonFullWindowViewerProvider.js';
import styles from './FoleonReaderLayouts.module.css';

// ---------------------------------------------------------------------------
// Project Spotlight reader layout — Phase-04 Wave-01 Prompt-04B
// ---------------------------------------------------------------------------
// Lane-owned monthly visual project profile. The article card itself is
// the interactive launch surface for the shared full-window viewer
// (Inclusive Components card-launch pattern: a `<button>` wrapping the
// title, with a transparent `::after` pseudo-element overlaying the card).
// Disabled targets carry `aria-disabled="true"` plus `aria-describedby`
// pointing to a visible disabled-reason; the click handler suppresses
// activation. Inline iframe is removed for this lane — the Foleon
// document opens in the shared full-window viewer instead.
//
// `iframeSurface` and `viewModel.mobileGate` are intentionally ignored
// here. Leadership Message (still on the compatibility shell) continues
// to consume them.
// ---------------------------------------------------------------------------

interface ProjectFactRow {
  readonly id: keyof Omit<FoleonReaderProjectFacts, 'arePlaceholders'>;
  readonly label: string;
}

const PROJECT_FACT_ROWS: readonly ProjectFactRow[] = [
  { id: 'client', label: 'Client' },
  { id: 'location', label: 'Location' },
  { id: 'market', label: 'Market' },
  { id: 'team', label: 'Team' },
  { id: 'milestone', label: 'Milestone' },
];

export function ProjectSpotlightReaderLayout(props: FoleonReaderLayoutProps): React.JSX.Element | null {
  const { viewModel } = props;
  const isPreview = viewModel.state === 'preview';
  const card = viewModel.primaryArticle;

  // Defensive: every governed lane carries `primaryArticle` after Prompt
  // 04A. If somehow absent, render nothing rather than fabricating a
  // viewer target.
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
      data-foleon-reader-layout="project-spotlight"
      data-foleon-reader-lane="projectSpotlight"
      data-foleon-reader-state={viewModel.state}
      data-foleon-layout="project-spotlight-feature"
    >
      <article
        className={styles.featureSurface}
        aria-labelledby={viewModel.titleElementId}
      >
        <div
          className={styles.articleCard}
          data-foleon-article-card
          data-foleon-article-lane="projectSpotlight"
          data-foleon-viewer-target-id={target.id}
          data-foleon-article-state={articleState}
        >
          <CardLaunchScrim target={target} reasonId={reasonId} title={card.title} />

          <header className={styles.mediaBanner}>
            <div className={styles.mediaInner}>
              <div className={styles.eyebrowRow}>
                <p className={styles.eyebrow}>{viewModel.eyebrow}</p>
                <span className={styles.cadenceMarker}>Monthly</span>
                {isPreview && viewModel.previewLabel ? (
                  <span className={styles.previewLabel} aria-label="Preview content">
                    {viewModel.previewLabel}
                  </span>
                ) : null}
              </div>
              <h2 className={styles.title} id={viewModel.titleElementId}>
                <CardLaunchButton
                  target={target}
                  reasonId={reasonId}
                  isDisabled={isDisabled}
                >
                  {card.title}
                </CardLaunchButton>
              </h2>
              {viewModel.summary ? (
                <p className={styles.summary}>{viewModel.summary}</p>
              ) : null}
            </div>
          </header>

          <ul
            className={styles.ribbon}
            aria-label="Project Spotlight metadata"
          >
            <RibbonFact label={viewModel.freshnessLabel} value={viewModel.freshnessValue} />
            <RibbonFact label="Audience" value={viewModel.audience} />
            <RibbonFact label="Archive group" value={viewModel.archiveGroup} />
            <RibbonFact label="Cadence" value="Monthly" />
          </ul>

          {viewModel.featureCallout ? (
            <section
              className={styles.callout}
              aria-label="Why this project matters"
            >
              <h3 className={styles.calloutHeading}>
                {viewModel.featureCallout.heading}
              </h3>
              <p className={styles.calloutBody}>{viewModel.featureCallout.body}</p>
            </section>
          ) : null}

          {viewModel.projectFacts ? (
            <ProjectFactsBlock facts={viewModel.projectFacts} isPreview={isPreview} />
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
          <div className={styles.articleFooter}>
            {archiveAction ? (
              <HbcButton variant="secondary" onClick={archiveAction.onClick}>
                {archiveAction.label}
              </HbcButton>
            ) : null}
            {viewModel.archiveNote ? (
              <span className={styles.archiveNote}>{viewModel.archiveNote}</span>
            ) : null}
          </div>
        ) : null}

        {viewModel.warnings.map((warning, i) => (
          <p key={i} className={styles.warning}>
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
  readonly target: FoleonReaderViewModel['primaryArticle'] extends infer T
    ? T extends { readonly target: infer U }
      ? U
      : never
    : never;
  readonly reasonId: string;
  readonly isDisabled: boolean;
  readonly children: React.ReactNode;
}

function CardLaunchButton(props: CardLaunchButtonProps): React.JSX.Element {
  const { target, reasonId, isDisabled, children } = props;
  const viewer = useFoleonFullWindowViewer();
  const lastRefusalRef = React.useRef<HTMLButtonElement>(null);

  const handleClick = React.useCallback(
    (event: React.MouseEvent<HTMLButtonElement>): void => {
      if (isDisabled) {
        // Suppress activation. Surface the structured refusal as a DOM
        // marker for diagnostics — disabled card was clicked, but no
        // viewer was opened. Telemetry callers can observe this via
        // existing data-foleon-article-state="disabled" + the button
        // attribute below.
        event.currentTarget.setAttribute(
          'data-foleon-article-last-refusal',
          target.disabledReason ?? 'unknown',
        );
        return;
      }
      const result = viewer.openViewer(target, event.currentTarget);
      if (result.opened === false) {
        // Defensive: pre-check should have prevented this. Surface the
        // structured refusal so the failure is observable instead of
        // silent.
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
      ref={lastRefusalRef}
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

function CardLaunchScrim(props: {
  readonly target: NonNullable<FoleonReaderViewModel['primaryArticle']>['target'];
  readonly reasonId: string;
  readonly title: string;
}): React.JSX.Element | null {
  // Reserved for future overlay decoration (e.g. hover affordance).
  // No render in 04B — the card-launch pseudo-element handles hit-testing.
  void props;
  return null;
}

function RibbonFact(props: { label: string; value: string }): React.JSX.Element {
  return (
    <li className={styles.ribbonItem}>
      <span className={styles.ribbonLabel}>{props.label}</span>
      <span className={styles.ribbonValue}>{props.value}</span>
    </li>
  );
}

function ProjectFactsBlock(props: {
  facts: FoleonReaderProjectFacts;
  isPreview: boolean;
}): React.JSX.Element {
  const { facts, isPreview } = props;
  const visibleRows = PROJECT_FACT_ROWS.flatMap((row) => {
    const raw = facts[row.id];
    if (isPreview) {
      return [{ ...row, value: raw ?? 'Sample value', isPlaceholder: true }];
    }
    if (raw && raw.trim().length > 0) {
      return [{ ...row, value: raw, isPlaceholder: false }];
    }
    return [{ ...row, value: 'Not listed', isPlaceholder: false }];
  });

  return (
    <dl className={styles.projectFacts} aria-label="Project facts">
      {visibleRows.map((row) => (
        <div key={row.id} className={styles.projectFactItem}>
          <dt className={styles.projectFactLabel}>{row.label}</dt>
          <dd
            className={
              row.isPlaceholder ? styles.projectFactValuePlaceholder : styles.projectFactValue
            }
          >
            {row.value}
          </dd>
        </div>
      ))}
    </dl>
  );
}

function formatDisabledReason(reason: FoleonViewerDisabledReason | undefined): string {
  switch (reason) {
    case 'preview-only':
      return 'Preview only — a live Project Spotlight edition will open here when published.';
    case 'no-embed-url':
      return 'This Project Spotlight record does not carry an embeddable Foleon URL yet.';
    case 'embed-not-allowed':
      return 'This Project Spotlight record disallows in-line embedding by governance policy.';
    case 'requires-external-open':
      return 'This Project Spotlight record must be opened in a new tab. Use the published link if available.';
    default:
      return 'This Project Spotlight document is not available in the in-line viewer.';
  }
}
