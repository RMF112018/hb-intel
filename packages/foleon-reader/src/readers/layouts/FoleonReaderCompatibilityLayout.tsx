import type { ReactNode } from 'react';
import { HbcButton } from '@hbc/ui-kit/homepage';
import type { FoleonReaderLayoutKey, FoleonReaderViewModel } from '../FoleonReaderViewModel.js';
import styles from '../FoleonReaderModule.module.css';

// ---------------------------------------------------------------------------
// Foleon reader — internal compatibility layout
// ---------------------------------------------------------------------------
// This component is **internal** to the foleon-reader package. It is the
// shared visual shell each lane wrapper delegates to during Phase-04
// Wave-01 Prompt-02 — visuals stay aligned with today's rendering while
// the registry seam is established.
//
// Later prompts (03 / 04 / 05) will replace one lane layout at a time;
// they will stop delegating to this component and own their own
// composition. This file should NOT be exported from `index.ts`.
// ---------------------------------------------------------------------------

interface CompatibilityLayoutProps {
  readonly viewModel: FoleonReaderViewModel;
  readonly iframeSurface: ReactNode | null;
}

const TONE_CLASS_BY_LANE: Readonly<Record<FoleonReaderLayoutKey, string>> = {
  projectSpotlight: styles.spotlight,
  companyPulse: styles.pulse,
  leadershipMessage: styles.leadership,
};

const PREVIEW_TONE_CLASS_BY_LANE: Readonly<Record<FoleonReaderLayoutKey, string>> = {
  projectSpotlight: styles.readerPreviewSpotlight,
  companyPulse: styles.readerPreviewPulse,
  leadershipMessage: styles.readerPreviewLeadership,
};

const PREVIEW_TONE_NAME_BY_LANE: Readonly<Record<FoleonReaderLayoutKey, string>> = {
  projectSpotlight: 'blue',
  companyPulse: 'orange',
  leadershipMessage: 'navy',
};

export function FoleonReaderCompatibilityLayout(props: CompatibilityLayoutProps): React.ReactNode {
  const { viewModel, iframeSurface } = props;

  if (viewModel.state === 'preview') {
    return renderPreviewSurface(viewModel);
  }
  return renderReadySurface(viewModel, iframeSurface);
}

// ---------------------------------------------------------------------------
// Preview surface — mirrors the previous `FoleonReaderPreview` structure
// so visual output (and the existing tone / preview-route markers) is
// preserved while the new lane wrappers own the layout-key markers.
// ---------------------------------------------------------------------------

function renderPreviewSurface(viewModel: FoleonReaderViewModel): React.ReactNode {
  const previewToneClass = PREVIEW_TONE_CLASS_BY_LANE[viewModel.lane];
  const previewToneName = PREVIEW_TONE_NAME_BY_LANE[viewModel.lane];
  const featureFact = viewModel.facts.find((f) => f.id === 'feature-title');
  const cadenceChip = viewModel.chips.find((c) => c.id === 'cadence');
  const editionPendingChip = viewModel.chips.find((c) => c.id === 'edition-pending');
  const statusChip = viewModel.chips.find((c) => c.id === 'status');
  const contentComingChip = viewModel.chips.find((c) => c.id === 'content-coming-soon');

  return (
    <section
      className={`${styles.readerPreviewFallback} ${previewToneClass}`}
      aria-labelledby={viewModel.titleElementId}
      data-foleon-preview-route={viewModel.readerKey}
      data-preview-tone={previewToneName}
    >
      <header className={styles.previewBanner}>
        <div>
          {viewModel.previewLabel ? (
            <p className={styles.previewEyebrow}>{viewModel.previewLabel}</p>
          ) : null}
          <h2 className={styles.previewTitle} id={viewModel.titleElementId}>
            {viewModel.title}
          </h2>
          {viewModel.summary ? (
            <p className={styles.previewDescription}>{viewModel.summary}</p>
          ) : null}
        </div>
        <div className={styles.previewStatusRail} aria-label="Preview status">
          {contentComingChip ? (
            <span className={styles.previewStatusPill}>{contentComingChip.label}</span>
          ) : null}
          {statusChip ? (
            <span className={styles.previewStatusPill}>{statusChip.label}</span>
          ) : null}
        </div>
      </header>

      <div className={styles.previewLayout}>
        <article
          className={styles.previewFeature}
          aria-label={`${derivePreviewLaneTitle(viewModel)} feature placeholder`}
        >
          <div className={styles.previewMediaPlaceholder} aria-hidden="true" />
          <div className={styles.previewContentZone}>
            <div className={styles.previewMetaRow} aria-label="Preview metadata">
              <span className={styles.previewMetaPill}>{derivePreviewLaneTitle(viewModel)}</span>
              {cadenceChip ? (
                <span className={styles.previewMetaPill}>{cadenceChip.label}</span>
              ) : null}
              {editionPendingChip ? (
                <span className={styles.previewMetaPill}>{editionPendingChip.label}</span>
              ) : null}
            </div>
            {featureFact ? (
              <h3 className={styles.previewFeatureTitle}>{featureFact.label}</h3>
            ) : null}
            <p className={styles.previewFeatureCopy}>{derivePreviewFeatureCopy(viewModel)}</p>
            <div className={styles.previewMetadataGrid} aria-label="Preview metadata zones">
              {viewModel.governanceNotes.map((note, i) => (
                <span key={i}>{note}</span>
              ))}
            </div>
          </div>
        </article>

        <aside
          className={styles.previewSupport}
          aria-label={`${derivePreviewLaneTitle(viewModel)} supporting preview placeholders`}
        >
          {viewModel.supportItems.map((item) => (
            <div className={styles.previewSupportCard} key={item.id}>
              <div className={styles.previewSupportStripe} aria-hidden="true" />
              <h3>{item.title}</h3>
              <p>{item.body}</p>
            </div>
          ))}
        </aside>
      </div>

      <footer className={styles.previewFooterNote}>
        {viewModel.statusNotes.map((note, i) => (
          <span key={i}>{note}</span>
        ))}
      </footer>
    </section>
  );
}

function derivePreviewLaneTitle(viewModel: FoleonReaderViewModel): string {
  switch (viewModel.lane) {
    case 'projectSpotlight':
      return 'Project Spotlight';
    case 'companyPulse':
      return 'Company Pulse';
    case 'leadershipMessage':
      return 'Leadership Message';
  }
}

function derivePreviewFeatureCopy(viewModel: FoleonReaderViewModel): string {
  switch (viewModel.lane) {
    case 'projectSpotlight':
      return 'A polished project story area will introduce the active edition, project context, and editorial framing once live Foleon content is connected.';
    case 'companyPulse':
      return 'A compact publication area will summarize the active edition, latest update cadence, and operational context once live Foleon content is connected.';
    case 'leadershipMessage':
      return 'A refined leadership communication area will introduce the active executive message, key context, and publication framing once live Foleon content is connected.';
  }
}

// ---------------------------------------------------------------------------
// Ready surface — mirrors the previous in-module ready composition.
// The orchestrator passes the iframe element via `iframeSurface` so the
// layout can decide its placement within the chrome.
// ---------------------------------------------------------------------------

function renderReadySurface(
  viewModel: FoleonReaderViewModel,
  iframeSurface: ReactNode | null,
): React.ReactNode {
  const toneClass = TONE_CLASS_BY_LANE[viewModel.lane];
  const shellClass = `${styles.shell} ${toneClass}`;
  const stageOpen = viewModel.iframe?.visible === true && iframeSurface !== null;

  return (
    <section className={shellClass} aria-labelledby={viewModel.titleElementId}>
      <div className={styles.chrome}>
        <header className={styles.hero}>
          <div>
            <p className={styles.eyebrow}>{viewModel.eyebrow}</p>
            <h2 className={styles.title} id={viewModel.titleElementId}>
              {viewModel.title}
            </h2>
            {viewModel.summary ? (
              <p className={styles.summary}>{viewModel.summary}</p>
            ) : null}
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
          </div>
          <aside
            className={styles.rail}
            aria-label={`${derivePreviewLaneTitle(viewModel)} metadata`}
          >
            {viewModel.facts.map((fact) => (
              <div key={fact.id}>
                <p className={styles.railLabel}>{fact.label}</p>
                <p className={styles.railValue}>{fact.value}</p>
              </div>
            ))}
          </aside>
        </header>
        {viewModel.warnings.map((warning, i) => (
          <p key={i} className={styles.warning}>
            {warning}
          </p>
        ))}
        {viewModel.mobileGate ? (
          <div
            className={styles.mobileCard}
            aria-label={`${derivePreviewLaneTitle(viewModel)} collapsed mobile reader`}
          >
            <p className={styles.railLabel}>{viewModel.mobileGate.headline}</p>
            <p className={styles.railValue}>{viewModel.mobileGate.body}</p>
          </div>
        ) : null}
        <div className={styles.readerStage} data-open={stageOpen ? 'true' : 'false'}>
          {stageOpen ? <div className={styles.frameWrap}>{iframeSurface}</div> : null}
        </div>
      </div>
    </section>
  );
}
