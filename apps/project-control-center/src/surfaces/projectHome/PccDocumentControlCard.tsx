import type { FC } from 'react';
import {
  DOCUMENT_CONTROL_ACTIONS,
  DOCUMENT_CONTROL_LANES,
  DOCUMENT_CONTROL_SOURCES,
  DOCUMENT_CONTROL_SOURCE_IDS,
  type DocumentControlLane,
  type DocumentControlSourceId,
} from '@hbc/models/pcc';
import { PccDashboardCard } from '../../layout/PccDashboardCard';
import { PccPreviewState } from '../../ui/PccPreviewState';
import { PccStatusPill } from '../../ui/PccStatusPill';
import type { PccProjectHomeCardProps } from './shared';
import styles from './PccProjectHome.module.css';

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

function sourceIdsInLane(lane: DocumentControlLane): readonly DocumentControlSourceId[] {
  return DOCUMENT_CONTROL_SOURCE_IDS.filter((id) => DOCUMENT_CONTROL_SOURCES[id].lane === lane);
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
const DocumentControlBody: FC = () => (
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
          {sourceIdsInLane(lane).map((id) => {
            const source = DOCUMENT_CONTROL_SOURCES[id];
            return (
              <div
                key={id}
                className={styles.sourceTile}
                data-pcc-document-source-id={id}
                data-pcc-document-posture={source.posture}
                data-pcc-document-link-behavior={source.linkBehavior}
                data-pcc-doc-lane={source.lane}
              >
                <span className={styles.sourceName}>{source.displayName}</span>
                <PccStatusPill tone={postureTone(source.posture)}>
                  {source.posture}
                </PccStatusPill>
                <span className={styles.sourceMeta}>{source.sourceOfRecordLabel}</span>
                {source.lane === 'microsoft-files' ? (
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
                ) : (
                  <span data-pcc-doc-launch-cue className={styles.sourceMeta}>
                    Launch / visibility only
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </section>
    ))}
  </div>
);

export const PccDocumentControlCard: FC<PccProjectHomeCardProps> = ({ state = 'preview' }) => (
  <PccDashboardCard
    footprint="wide"
    eyebrow="Documents"
    title="Document Control Center"
  >
    {state === 'preview' ? <DocumentControlBody /> : <PccPreviewState state={state} />}
  </PccDashboardCard>
);

export default PccDocumentControlCard;
