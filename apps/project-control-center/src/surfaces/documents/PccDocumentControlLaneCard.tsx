/**
 * Wave 7 / Prompt 03B — Document Control lane card.
 *
 * Presentational by contract. The adapter has already filtered out
 * unsafe entries (e.g., MPF root paths and cross-project bindings); the
 * card renders what it is given. Action chips are inert: aria-disabled,
 * disabled (when a button), and tagged with the canonical
 * `data-pcc-doc-action-execution-state="preview-disabled"` marker.
 *
 * Lane cards are the only elements that emit `data-pcc-doc-lane`.
 */

import type { FC } from 'react';
import { PccDashboardCard } from '../../layout/PccDashboardCard';
import styles from './PccDocumentsSurface.module.css';
import type {
  DocumentControlWave7LaneId,
  IPccDocumentControlLaneViewModel,
} from './documentControlViewModel';

export interface PccDocumentControlLaneCardProps {
  readonly laneViewModel: IPccDocumentControlLaneViewModel;
}

const PREVIEW_ACTION_LABELS: Readonly<Record<DocumentControlWave7LaneId, readonly string[]>> = {
  'project-record': ['Browse', 'Open binding', 'View health'],
  'my-project-files': ['Open folder', 'Submit to Project Record', 'View health'],
  'external-systems': ['Launch', 'View status'],
};

function bindingPathLabel(entry: IPccDocumentControlLaneViewModel['entries'][number]): string | undefined {
  const binding = entry.binding;
  if (binding.kind === 'sharepoint-library') return binding.rootPath;
  if (binding.kind === 'my-project-files') return binding.projectFolderPath;
  return undefined;
}

function healthState(
  health: IPccDocumentControlLaneViewModel['health'],
  sourceKey: string,
): string | undefined {
  return health.find((h) => h.sourceKey === sourceKey)?.state;
}

export const PccDocumentControlLaneCard: FC<PccDocumentControlLaneCardProps> = ({
  laneViewModel,
}) => {
  const { laneId, title, description, entries, health, warningText } = laneViewModel;
  const previewLabels = PREVIEW_ACTION_LABELS[laneId];

  return (
    <PccDashboardCard footprint="standard" eyebrow="Lane" title={title}>
      <div className={styles.headerCopy} data-pcc-doc-lane={laneId}>
        <p className={styles.laneDescription}>{description}</p>
        {warningText ? (
          <p
            className={styles.guardrail}
            data-pcc-doc-lane-warning="my-project-files"
          >
            {warningText}
          </p>
        ) : null}
        {entries.length === 0 ? (
          <p className={styles.guardrail} data-pcc-doc-lane-empty="true">
            No sources to display in this preview.
          </p>
        ) : (
          <ul className={styles.metaList}>
            {entries.map((entry) => {
              const state = healthState(health, entry.sourceKey);
              const path = bindingPathLabel(entry);
              return (
                <li
                  key={entry.sourceKey}
                  className={styles.metaRow}
                  data-pcc-document-source-id={entry.sourceKey}
                  data-pcc-doc-source-kind={entry.sourceKind}
                  {...(state ? { 'data-pcc-doc-source-health': state } : {})}
                >
                  <span className={styles.metaLabel}>{entry.displayName}</span>
                  {path ? <span data-pcc-doc-source-path={path}>{path}</span> : null}
                  {state ? <span>· {state}</span> : null}
                  {entry.enabled === false ? <span>· disabled</span> : null}
                </li>
              );
            })}
          </ul>
        )}
        {previewLabels.length > 0 ? (
          <ul className={styles.actionGrid} aria-label={`${title} preview actions`}>
            {previewLabels.map((label) => (
              <li key={label}>
                <button
                  type="button"
                  className={styles.actionChip}
                  disabled
                  aria-disabled="true"
                  data-pcc-doc-action-execution-state="preview-disabled"
                >
                  {label}
                </button>
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </PccDashboardCard>
  );
};

export default PccDocumentControlLaneCard;
