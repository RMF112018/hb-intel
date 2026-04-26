import type { ReactNode } from 'react';
import { HbcButton } from '@hbc/ui-kit/homepage';
import type { FoleonReaderLayoutProps } from '../FoleonReaderLayoutRegistry.js';
import type { FoleonReaderViewModel } from '../FoleonReaderViewModel.js';
import styles from './FoleonReaderLayouts.module.css';

// ---------------------------------------------------------------------------
// Company Pulse reader layout — Phase-04 Wave-01 Prompt-04
// ---------------------------------------------------------------------------
// Lane-owned briefing / newsroom digest composition. No longer delegates
// to the shared compatibility shell. The outer surface is edge-bleed-ready
// by structure (zero outer `margin-inline` and zero outer `padding-inline`);
// the Prompt-01 shell-slot edge contract drives any active bleed. This
// component does NOT activate global edge-to-window behavior on its own.
//
// Identity is layout-key-driven, not tone-driven. Legacy `data-preview-tone`
// markers are intentionally NOT emitted by this layout.
//
// Ready-state secondary digest is intentionally empty: the registry
// currently carries one active record per lane. The layout surfaces an
// "Open archive" affordance plus an explanatory empty-digest state rather
// than fabricating digest entries.
// ---------------------------------------------------------------------------

export function CompanyPulseReaderLayout(props: FoleonReaderLayoutProps): React.ReactNode {
  const { viewModel, iframeSurface } = props;
  const isPreview = viewModel.state === 'preview';

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
            className={styles.briefingLead}
            aria-label="Latest Company Pulse update"
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
            <h3 className={styles.leadTitle}>{viewModel.briefingLead.title}</h3>
            <p className={styles.leadBody}>{viewModel.briefingLead.body}</p>
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

        {viewModel.actions.length > 0 || viewModel.archiveNote ? (
          <div className={styles.briefingActions}>
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
              <span className={styles.briefingArchiveNote}>{viewModel.archiveNote}</span>
            ) : null}
          </div>
        ) : null}

        {viewModel.mobileGate ? (
          <div
            className={styles.briefingMobileGate}
            aria-label="Company Pulse collapsed mobile reader"
          >
            <p className={styles.briefingMobileGateLabel}>{viewModel.mobileGate.headline}</p>
            <p className={styles.briefingMobileGateBody}>{viewModel.mobileGate.body}</p>
          </div>
        ) : null}

        {renderIframeFrame(viewModel, iframeSurface)}

        {viewModel.warnings.map((warning, i) => (
          <p key={i} className={styles.briefingWarning}>
            {warning}
          </p>
        ))}
      </article>
    </div>
  );
}

function renderDigest(viewModel: FoleonReaderViewModel): React.ReactNode {
  const digest = viewModel.briefingDigest;
  if (!digest) return null;

  if (digest.length === 0) {
    // Honest empty-digest state — the active record is the lead, and
    // previous editions live in the archive.
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

function renderIframeFrame(
  viewModel: FoleonReaderViewModel,
  iframeSurface: ReactNode | null,
): React.ReactNode {
  if (!viewModel.iframe?.visible) return null;
  if (iframeSurface === null) return null;
  return <div className={styles.briefingIframeFrame}>{iframeSurface}</div>;
}
