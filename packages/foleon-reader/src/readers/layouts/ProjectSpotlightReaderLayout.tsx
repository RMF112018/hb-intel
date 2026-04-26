import type { ReactNode } from 'react';
import { HbcButton } from '@hbc/ui-kit/homepage';
import type { FoleonReaderLayoutProps } from '../FoleonReaderLayoutRegistry.js';
import type {
  FoleonReaderProjectFacts,
  FoleonReaderViewModel,
} from '../FoleonReaderViewModel.js';
import styles from './FoleonReaderLayouts.module.css';

// ---------------------------------------------------------------------------
// Project Spotlight reader layout — Phase-04 Wave-01 Prompt-03
// ---------------------------------------------------------------------------
// Lane-owned monthly visual project profile. No longer delegates to the
// shared compatibility shell. The outer surface is edge-bleed-ready by
// design (no `margin-inline` / outer `padding-inline`); the Prompt-01
// shell-slot edge contract drives any active bleed. This component does
// NOT activate global edge-to-window behavior on its own.
//
// Identity is layout-key-driven, not tone-driven. Legacy `data-preview-tone`
// markers are intentionally NOT emitted by this layout.
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

export function ProjectSpotlightReaderLayout(props: FoleonReaderLayoutProps): React.ReactNode {
  const { viewModel, iframeSurface } = props;
  const isPreview = viewModel.state === 'preview';

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
              {viewModel.title}
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

        {viewModel.actions.length > 0 || viewModel.archiveNote ? (
          <div className={styles.actions}>
            {viewModel.actions.map((action) => (
              <HbcButton
                key={action.id}
                variant={action.variant === 'secondary' ? 'secondary' : undefined}
                onClick={action.onClick}
              >
                {action.label}
              </HbcButton>
            ))}
            {viewModel.archiveNote ? (
              <span className={styles.archiveNote}>{viewModel.archiveNote}</span>
            ) : null}
          </div>
        ) : null}

        {viewModel.mobileGate ? (
          <div
            className={styles.mobileGate}
            aria-label="Project Spotlight collapsed mobile reader"
          >
            <p className={styles.mobileGateLabel}>{viewModel.mobileGate.headline}</p>
            <p className={styles.mobileGateBody}>{viewModel.mobileGate.body}</p>
          </div>
        ) : null}

        {renderIframeFrame(viewModel, iframeSurface)}

        {viewModel.warnings.map((warning, i) => (
          <p key={i} className={styles.warning}>
            {warning}
          </p>
        ))}
      </article>
    </div>
  );
}

function RibbonFact(props: { label: string; value: string }): React.ReactNode {
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
}): React.ReactNode {
  const { facts, isPreview } = props;
  const visibleRows = PROJECT_FACT_ROWS.flatMap((row) => {
    const raw = facts[row.id];
    if (isPreview) {
      // Preview placeholders are honest sample copy, always rendered.
      return [{ ...row, value: raw ?? 'Sample value', isPlaceholder: true }];
    }
    // Ready state: only render when the record carries a value, otherwise
    // emit "Not listed" so consumers see an honest fallback rather than a
    // hidden gap.
    if (raw && raw.trim().length > 0) {
      return [{ ...row, value: raw, isPlaceholder: false }];
    }
    return [{ ...row, value: 'Not listed', isPlaceholder: false, isAbsent: true }];
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

function renderIframeFrame(
  viewModel: FoleonReaderViewModel,
  iframeSurface: ReactNode | null,
): React.ReactNode {
  if (!viewModel.iframe?.visible) return null;
  if (iframeSurface === null) return null;
  return <div className={styles.iframeFrame}>{iframeSurface}</div>;
}
