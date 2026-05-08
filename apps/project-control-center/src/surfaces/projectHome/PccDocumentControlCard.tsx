import { useId, type FC } from 'react';
import {
  DOCUMENT_CONTROL_ACTIONS,
  DOCUMENT_CONTROL_LANES,
  DOCUMENT_CONTROL_SOURCES,
  DOCUMENT_CONTROL_SOURCE_IDS,
  type DocumentControlLane,
  type DocumentControlSourceId,
  type IDocumentControlSource,
} from '@hbc/models/pcc';
import { PccDashboardCard } from '../../layout/PccDashboardCard';
import { PccPreviewState } from '../../ui/PccPreviewState';
import { PccStatusPill } from '../../ui/PccStatusPill';
import type { PccProjectHomeCardProps } from './shared';
import styles from './PccProjectHome.module.css';

interface PccDocumentControlCardProps extends PccProjectHomeCardProps {
  /**
   * Optional read-model data. When supplied, lane tiles are rendered by
   * filtering this list with `source.lane === lane`. When omitted, falls
   * back to the canonical `DOCUMENT_CONTROL_SOURCE_IDS` taxonomy.
   */
  readonly sources?: readonly IDocumentControlSource[];
}

function postureTone(posture: string): 'success' | 'info' | 'warning' | 'neutral' {
  switch (posture) {
    case 'mvp-required':
      return 'success';
    case 'mvp-optional':
      return 'info';
    case 'conditional':
      return 'warning';
    default:
      return 'neutral';
  }
}

function laneLabel(lane: DocumentControlLane): string {
  return lane === 'microsoft-files' ? 'Microsoft Files' : 'External Document Systems';
}

function fixtureSourcesInLane(lane: DocumentControlLane): readonly IDocumentControlSource[] {
  return DOCUMENT_CONTROL_SOURCE_IDS.filter(
    (id: DocumentControlSourceId) => DOCUMENT_CONTROL_SOURCES[id].lane === lane,
  ).map((id) => DOCUMENT_CONTROL_SOURCES[id]);
}

/**
 * Wave 2 / Prompt 06 — Project Home Document Control summary card.
 *
 * Compact two-lane summary that mirrors the dedicated Documents surface.
 * All taxonomy comes from canonical `@hbc/models/pcc` model metadata
 * (`DOCUMENT_CONTROL_LANES`, `DOCUMENT_CONTROL_ACTIONS`, the extended
 * `IDocumentControlSource` lane / capabilityPosture / sourceOfRecordLabel
 * fields). No app-local lane or action duplication.
 */
/**
 * Per-source tile. Wave 15A wave-b6 Prompt 06 — `useId()` lives here, not
 * inside the lane `.map(...)`, so the rules of hooks are preserved (hooks
 * must not be called inside iteration callbacks). The generated id is
 * shared by the visible source-boundary reason node and every disabled
 * action button's `aria-describedby` attribute, so the reason is announced
 * by assistive tech and visible on screen — not tooltip-only.
 */
const DocumentControlSourceTile: FC<{ source: IDocumentControlSource }> = ({ source }) => {
  const reasonId = useId();
  return (
    <div
      className={styles.sourceTile}
      data-pcc-document-source-id={source.id}
      data-pcc-document-posture={source.posture}
      data-pcc-document-link-behavior={source.linkBehavior}
      data-pcc-doc-lane={source.lane}
    >
      <span className={styles.sourceName}>{source.displayName}</span>
      <PccStatusPill tone={postureTone(source.posture)}>{source.posture}</PccStatusPill>
      <span className={styles.sourceMeta}>{source.sourceOfRecordLabel}</span>
      {source.lane === 'microsoft-files' ? (
        <>
          <p id={reasonId} className={styles.contextNote} data-pcc-doc-action-reason="">
            Preview only — complete document actions in Microsoft/SharePoint. PCC shows source
            posture only.
          </p>
          <ul
            className={styles.surfaceList}
            data-pcc-doc-actions=""
            style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--pcc-space-xs)' }}
          >
            {source.previewActionIds.map((actionId) => {
              const action = DOCUMENT_CONTROL_ACTIONS[actionId];
              return (
                <li key={actionId} style={{ listStyle: 'none' }}>
                  <button
                    type="button"
                    disabled
                    aria-disabled="true"
                    aria-describedby={reasonId}
                    data-pcc-doc-action={actionId}
                    data-pcc-doc-action-execution-state={action.executionState}
                    title={`${action.description} · ${action.futureCapability}`}
                    style={{
                      padding: '2px 8px',
                      fontSize: 11,
                      borderRadius: 'var(--pcc-radius-sm)',
                      border: '1px solid var(--pcc-color-border)',
                      background: 'var(--pcc-color-canvas)',
                      color: 'var(--pcc-color-text-muted)',
                      cursor: 'not-allowed',
                      opacity: 0.78,
                    }}
                  >
                    {action.label}
                  </button>
                </li>
              );
            })}
          </ul>
        </>
      ) : (
        <span data-pcc-doc-launch-cue className={styles.sourceMeta}>
          Visibility only — open source systems outside PCC.
        </span>
      )}
    </div>
  );
};

const DocumentControlBody: FC<{ sources: readonly IDocumentControlSource[] }> = ({ sources }) => (
  <div className={styles.sourceGrid} data-pcc-document-control-body="">
    {DOCUMENT_CONTROL_LANES.map((lane) => (
      <section key={lane} data-pcc-doc-lane={lane}>
        <span
          className={styles.metricLabel}
          style={{ display: 'block', marginBottom: 'var(--pcc-space-xs)' }}
        >
          {laneLabel(lane)}
        </span>
        <div className={styles.sourceGrid}>
          {sources
            .filter((source) => source.lane === lane)
            .map((source) => (
              <DocumentControlSourceTile key={source.id} source={source} />
            ))}
        </div>
      </section>
    ))}
  </div>
);

function resolveDocumentControlSources(
  sources?: readonly IDocumentControlSource[],
): readonly IDocumentControlSource[] {
  if (sources !== undefined) return sources;
  return DOCUMENT_CONTROL_LANES.flatMap((lane) => fixtureSourcesInLane(lane));
}

export const PccDocumentControlCard: FC<PccDocumentControlCardProps> = ({
  state = 'preview',
  sources,
}) => (
  <PccDashboardCard
    footprint="wide"
    tier="tier2"
    region="operational"
    eyebrow="Documents"
    title="Document Control Center"
  >
    {state === 'preview' ? (
      <DocumentControlBody sources={resolveDocumentControlSources(sources)} />
    ) : (
      <PccPreviewState state={state} />
    )}
  </PccDashboardCard>
);

export default PccDocumentControlCard;
