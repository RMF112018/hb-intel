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
import type { DocumentControlSourceHealthState } from '@hbc/models/pcc';
import { PccDashboardCard } from '../../layout/PccDashboardCard';
import styles from './PccDocumentsSurface.module.css';
import type {
  DocumentControlWave7LaneId,
  IPccDocumentControlLaneViewModel,
} from './documentControlViewModel';
import {
  resolveDisabledMessage,
  resolveEntryHealthMessage,
} from './sourceStateMessaging';

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
): DocumentControlSourceHealthState | undefined {
  return health.find((h) => h.sourceKey === sourceKey)?.state;
}

export const PccDocumentControlLaneCard: FC<PccDocumentControlLaneCardProps> = ({
  laneViewModel,
}) => {
  const { laneId, title, description, entries, health, warningText, degraded } = laneViewModel;
  const previewLabels = PREVIEW_ACTION_LABELS[laneId];

  return (
    <PccDashboardCard footprint="standard" eyebrow="Lane" title={title}>
      <div className={styles.headerCopy} data-pcc-doc-lane={laneId}>
        <p className={styles.laneDescription}>{description}</p>
        {degraded ? (
          <p
            className={styles.guardrail}
            data-pcc-doc-lane-degraded={laneId}
            data-pcc-doc-lane-degraded-tone={degraded.tone}
          >
            {degraded.message}
          </p>
        ) : null}
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
              const stateMessage = state ? resolveEntryHealthMessage(laneId, state) : undefined;
              const disabledMessage =
                entry.enabled === false ? resolveDisabledMessage(laneId) : undefined;
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
                  {stateMessage && state ? (
                    <span
                      data-pcc-doc-source-health-message={state}
                      data-pcc-doc-source-health-tone={stateMessage.tone}
                    >
                      · {stateMessage.label} — {stateMessage.message}
                    </span>
                  ) : null}
                  {disabledMessage ? (
                    <span data-pcc-doc-source-disabled="true">
                      · {disabledMessage.message}
                    </span>
                  ) : null}
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
