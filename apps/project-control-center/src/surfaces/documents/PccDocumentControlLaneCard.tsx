/**
 * Document Control lane card.
 *
 * Presentational by contract. The adapter has already filtered out
 * unsafe entries (e.g., MPF root paths and cross-project bindings); the
 * card renders what it is given. Action chips are inert (aria-disabled
 * with a paired reason caption) and tagged with a stable instrumentation
 * marker for tests.
 *
 * Lane cards are the only elements that emit `data-pcc-doc-lane`.
 */

import { Fragment, type FC } from 'react';
import type { DocumentControlSourceHealthState } from '@hbc/models/pcc';
import { PccDashboardCard } from '../../layout/PccDashboardCard';
import styles from './PccDocumentsSurface.module.css';
import type {
  DocumentControlWave7LaneId,
  IPccDocumentControlLaneViewModel,
} from './documentControlViewModel';
import { resolveDisabledMessage, resolveEntryHealthMessage } from './sourceStateMessaging';

export type DocumentControlLaneTier = 'source-of-record' | 'working-files' | 'external-launch';

export interface PccDocumentControlLaneCardProps {
  readonly laneViewModel: IPccDocumentControlLaneViewModel;
}

const LANE_ACTION_LABELS: Readonly<Record<DocumentControlWave7LaneId, readonly string[]>> = {
  'project-record': ['Browse', 'Open binding', 'View health'],
  'my-project-files': ['Open folder', 'Submit to Project Record', 'View health'],
  'external-systems': ['Launch', 'View status'],
};

const LANE_ACTION_REASONS: Readonly<Record<DocumentControlWave7LaneId, string>> = {
  'project-record': 'Document actions are managed in SharePoint.',
  'my-project-files': 'File actions are managed in OneDrive.',
  'external-systems': 'Launch links open the source system in a new tab.',
};

const LANE_TIER: Readonly<Record<DocumentControlWave7LaneId, DocumentControlLaneTier>> = {
  'project-record': 'source-of-record',
  'my-project-files': 'working-files',
  'external-systems': 'external-launch',
};

const LANE_EYEBROW: Readonly<Record<DocumentControlWave7LaneId, string>> = {
  'project-record': 'Source of record',
  'my-project-files': 'Working files',
  'external-systems': 'External launches',
};

const LANE_HIERARCHY: Readonly<
  Record<DocumentControlWave7LaneId, 'primary' | 'standard' | 'supporting'>
> = {
  'project-record': 'primary',
  'my-project-files': 'standard',
  'external-systems': 'supporting',
};

function bindingPathLabel(
  entry: IPccDocumentControlLaneViewModel['entries'][number],
): string | undefined {
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
  const actionLabels = LANE_ACTION_LABELS[laneId];
  const actionReason = LANE_ACTION_REASONS[laneId];
  const tier = LANE_TIER[laneId];
  const eyebrow = LANE_EYEBROW[laneId];
  const hierarchy = LANE_HIERARCHY[laneId];

  return (
    <PccDashboardCard footprint="standard" hierarchy={hierarchy} eyebrow={eyebrow} title={title}>
      <div
        className={styles.headerCopy}
        data-pcc-doc-lane={laneId}
        data-pcc-document-lane-tier={tier}
      >
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
          <p className={styles.guardrail} data-pcc-doc-lane-warning="my-project-files">
            {warningText}
          </p>
        ) : null}
        {entries.length === 0 ? (
          <p className={styles.guardrail} data-pcc-doc-lane-empty="true">
            No sources to display.
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
                    <span data-pcc-doc-source-disabled="true">· {disabledMessage.message}</span>
                  ) : null}
                </li>
              );
            })}
          </ul>
        )}
        {actionLabels.length > 0 ? (
          <Fragment>
            <ul className={styles.actionGrid} aria-label={`${title} actions`}>
              {actionLabels.map((label, index) => {
                const reasonId = `pcc-doc-lane-${laneId}-action-reason-${index}`;
                return (
                  <li key={label}>
                    <button
                      type="button"
                      className={styles.actionChip}
                      disabled
                      aria-disabled="true"
                      aria-describedby={reasonId}
                      data-pcc-doc-action-execution-state="preview-disabled"
                    >
                      {label}
                    </button>
                    <span id={reasonId} hidden>
                      {actionReason}
                    </span>
                  </li>
                );
              })}
            </ul>
            <p className={styles.actionReason} data-pcc-doc-lane-action-reason={laneId}>
              {actionReason}
            </p>
          </Fragment>
        ) : null}
      </div>
    </PccDashboardCard>
  );
};

export default PccDocumentControlLaneCard;
