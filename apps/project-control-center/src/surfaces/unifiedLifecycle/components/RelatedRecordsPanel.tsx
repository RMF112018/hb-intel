/**
 * Unified Lifecycle preview seam — RelatedRecordsPanel.
 *
 * Reusable, presentational, fixture-safe traceability panel: renders
 * related-record clusters and traceability edges from the project
 * traceability view model. Card BODY content only.
 *
 * Pure: no client, no hooks, no fetch, no router. Cluster grouping is
 * always-on (no expand/collapse) so the component holds no local state.
 */

import { type FC } from 'react';
import { PccPreviewState } from '../../../ui/PccPreviewState';
import { PccStatusPill, type PccStatusPillTone } from '../../../ui/PccStatusPill';
import type {
  IPccLifecycleEventVm,
  IPccMemoryRecordVm,
  IPccProjectTraceabilityViewModel,
  IPccRelatedRecordClusterVm,
  IPccTraceabilityEdgeVm,
} from '../unifiedLifecycleViewModel.js';
import styles from './RelatedRecordsPanel.module.css';

function confidenceTone(confidence: string): PccStatusPillTone {
  if (confidence === 'high' || confidence === 'verified') return 'success';
  if (confidence === 'low' || confidence === 'speculative') return 'warning';
  return 'info';
}

export interface IRelatedRecordsPanelProps {
  readonly viewModel: IPccProjectTraceabilityViewModel;
}

export const RelatedRecordsPanel: FC<IRelatedRecordsPanelProps> = ({ viewModel }) => {
  if (viewModel.sourceStatus !== 'available') {
    return (
      <div data-pcc-related-records="" className={styles.root}>
        <PccPreviewState state={viewModel.cardState} />
      </div>
    );
  }

  const visibleEvents = viewModel.relatedLifecycleEvents.filter((e) => !e.redaction.withheld);
  const visibleMemory = viewModel.relatedMemoryRecords.filter((m) => !m.redaction.withheld);

  if (
    viewModel.clusters.length === 0 &&
    viewModel.edges.length === 0 &&
    visibleEvents.length === 0 &&
    visibleMemory.length === 0
  ) {
    return (
      <div data-pcc-related-records="" className={styles.root}>
        <PccPreviewState state="empty" />
      </div>
    );
  }

  const edgesById = new Map<string, IPccTraceabilityEdgeVm>();
  for (const edge of viewModel.edges) {
    edgesById.set(edge.edgeId, edge);
  }

  return (
    <div data-pcc-related-records="" className={styles.root}>
      {viewModel.clusters.length > 0 ? (
        <ul className={styles.clusters}>
          {viewModel.clusters.map((cluster) => (
            <ClusterRow
              key={cluster.clusterId}
              cluster={cluster}
              edgesById={edgesById}
            />
          ))}
        </ul>
      ) : null}

      {visibleEvents.length > 0 ? (
        <section
          className={styles.section}
          data-pcc-related-records-events=""
          aria-label="Related lifecycle events"
        >
          <p className={styles.sectionTitle}>Related lifecycle events</p>
          <ul className={styles.compactList}>
            {visibleEvents.map((event) => (
              <RelatedEventRow key={event.eventId} event={event} />
            ))}
          </ul>
        </section>
      ) : null}

      {visibleMemory.length > 0 ? (
        <section
          className={styles.section}
          data-pcc-related-records-memory=""
          aria-label="Related memory records"
        >
          <p className={styles.sectionTitle}>Related memory records</p>
          <ul className={styles.compactList}>
            {visibleMemory.map((record) => (
              <RelatedMemoryRow key={record.memoryId} record={record} />
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
};

interface IClusterRowProps {
  readonly cluster: IPccRelatedRecordClusterVm;
  readonly edgesById: ReadonlyMap<string, IPccTraceabilityEdgeVm>;
}

const ClusterRow: FC<IClusterRowProps> = ({ cluster, edgesById }) => (
  <li className={styles.cluster} data-pcc-related-records-cluster-id={cluster.clusterId}>
    <div className={styles.clusterHeader}>
      <PccStatusPill tone="info">{cluster.rootRecordType}</PccStatusPill>
      <span className={styles.clusterRoot}>{cluster.rootRecordId}</span>
      <PccStatusPill tone="neutral">
        {cluster.relatedRecordIds.length} related
      </PccStatusPill>
    </div>
    <ul className={styles.edgeRow}>
      {cluster.edgeIds.map((edgeId) => {
        const edge = edgesById.get(edgeId);
        if (!edge) return null;
        return (
          <li
            key={edge.edgeId}
            className={styles.edgeChip}
            data-pcc-trace-edge-id={edge.edgeId}
          >
            <PccStatusPill tone={confidenceTone(edge.confidence)}>
              {edge.confidence}
            </PccStatusPill>
            <span className={styles.edgeMeta}>
              {edge.edgeType} · {edge.direction}
            </span>
            <PccStatusPill tone="info">{edge.sourceLineage.sourceSystem}</PccStatusPill>
          </li>
        );
      })}
    </ul>
  </li>
);

const RelatedEventRow: FC<{ event: IPccLifecycleEventVm }> = ({ event }) => {
  const masked = event.redaction.redacted && !event.redaction.withheld;
  return (
    <li className={styles.compactRow} data-pcc-related-event-id={event.eventId}>
      <span className={styles.compactStage}>{event.lifecycleStage}</span>
      <span className={styles.compactSummary}>
        {masked ? 'Restricted lifecycle entry — summary withheld.' : event.summary}
      </span>
      {masked ? <PccStatusPill tone="warning">Restricted</PccStatusPill> : null}
    </li>
  );
};

const RelatedMemoryRow: FC<{ record: IPccMemoryRecordVm }> = ({ record }) => {
  const masked = record.redaction.redacted && !record.redaction.withheld;
  return (
    <li className={styles.compactRow} data-pcc-related-memory-id={record.memoryId}>
      <span className={styles.compactStage}>{record.recordType}</span>
      <span className={styles.compactSummary}>{record.summary}</span>
      {masked ? <PccStatusPill tone="warning">Restricted</PccStatusPill> : null}
    </li>
  );
};

export default RelatedRecordsPanel;
