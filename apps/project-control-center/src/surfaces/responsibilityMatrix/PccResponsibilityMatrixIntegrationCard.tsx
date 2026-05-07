/**
 * Responsibility Matrix — Integration Signals card (Phase 3 / Wave 11 / Prompt 06).
 *
 * Renders five read-only sub-regions that surface RM gaps as references
 * into existing PCC seams (Priority Actions, Project Readiness, Approvals,
 * Team & Access, Document Control) without taking ownership of any of
 * those domains:
 *   - no Priority Action creation;
 *   - no readiness scoring doctrine change;
 *   - no approval execution;
 *   - no Team & Access roster mutation;
 *   - no evidence binary handling.
 *
 * The card is a 9th `PccDashboardCard` in the RM region group. It carries
 * `data-pcc-readiness-section="responsibility-matrix"` (so the bento
 * direct-child invariant test continues to apply) but does NOT carry
 * `data-pcc-rm-lane` (the eight-lane vocabulary is locked at the model
 * registry). Each sub-region carries `data-pcc-rm-integration-region`
 * for scoped queries.
 *
 * Read-only structure: no anchors, no forms, no file inputs, no enabled
 * buttons.
 */

import { Fragment, type FC } from 'react';
import { PccDashboardCard } from '../../layout/PccDashboardCard';
import { PccPreviewState } from '../../ui/PccPreviewState';
import type {
  IPccRmApprovalsReferencesViewModel,
  IPccRmDocumentControlReferencesViewModel,
  IPccRmIntegrationSignalsViewModel,
  IPccRmPriorityActionsCandidatesViewModel,
  IPccRmReadinessSignalsViewModel,
  IPccRmTeamAccessReferencesViewModel,
} from './integrationSignals.js';
import styles from './PccResponsibilityMatrixRegions.module.css';

const SECTION_MARKER = 'responsibility-matrix';

export interface PccResponsibilityMatrixIntegrationCardProps {
  readonly integration: IPccRmIntegrationSignalsViewModel;
}

export const PccResponsibilityMatrixIntegrationCard: FC<
  PccResponsibilityMatrixIntegrationCardProps
> = ({ integration }) => (
  <PccDashboardCard
    footprint="full"
    tier="tier3"
    region="reference"
    eyebrow="Responsibility Matrix"
    title="Integration signals (read-only references)"
  >
    <div className={styles.body} data-pcc-readiness-section={SECTION_MARKER}>
      <PriorityActionsCandidatesRegion vm={integration.priorityActions} />
      <ReadinessSignalsRegion vm={integration.readinessSignals} />
      <ApprovalsReferencesRegion vm={integration.approvalsReferences} />
      <TeamAccessReferencesRegion vm={integration.teamAccessReferences} />
      <DocumentControlReferencesRegion vm={integration.documentControlReferences} />
    </div>
  </PccDashboardCard>
);

export default PccResponsibilityMatrixIntegrationCard;

// ---------------------------------------------------------------------------
// Sub-region: Priority Actions candidates
// ---------------------------------------------------------------------------

interface PriorityActionsCandidatesRegionProps {
  readonly vm: IPccRmPriorityActionsCandidatesViewModel;
}

const PriorityActionsCandidatesRegion: FC<PriorityActionsCandidatesRegionProps> = ({ vm }) => (
  <div className={styles.row} data-pcc-rm-integration-region="priority-actions">
    <div className={styles.rowHeader}>
      <span className={styles.rowTitle}>Priority Actions candidates</span>
      <span className={styles.chip}>
        {vm.groups.length} candidate signal kind{vm.groups.length === 1 ? '' : 's'}
      </span>
    </div>
    <span className={styles.captionLine}>{vm.ownershipCaption}</span>
    {vm.groups.length === 0 ? (
      <PccPreviewState state="empty" description={vm.emptyCaption} />
    ) : (
      <ul className={styles.list} aria-label="Priority Actions candidate signals">
        {vm.groups.map((g) => (
          <li key={g.code} className={styles.row} data-pcc-rm-integration-priority-code={g.code}>
            <div className={styles.rowHeader}>
              <span className={styles.rowTitle}>{g.codeLabel}</span>
              <span className={styles.chip}>Severity: {g.severityLabel}</span>
              <span className={styles.chip}>
                {g.count} occurrence{g.count === 1 ? '' : 's'}
              </span>
            </div>
            <span className={styles.captionLine}>{g.captionText}</span>
            {g.relatedInstanceIds.length > 0 ? (
              <span className={styles.rowMeta}>
                Related items: {g.relatedInstanceIds.join(' · ')}
              </span>
            ) : null}
          </li>
        ))}
      </ul>
    )}
  </div>
);

// ---------------------------------------------------------------------------
// Sub-region: Project Readiness signals
// ---------------------------------------------------------------------------

interface ReadinessSignalsRegionProps {
  readonly vm: IPccRmReadinessSignalsViewModel;
}

const ReadinessSignalsRegion: FC<ReadinessSignalsRegionProps> = ({ vm }) => (
  <div className={styles.row} data-pcc-rm-integration-region="readiness-signals">
    <div className={styles.rowHeader}>
      <span className={styles.rowTitle}>Project Readiness signals</span>
      <span className={styles.chip}>Source module: {vm.sourceModuleId}</span>
    </div>
    <span className={styles.captionLine}>{vm.ownershipCaption}</span>
    <ul className={styles.list} aria-label="Project Readiness source-lineage signals">
      {vm.entries.map((entry) => (
        <li
          key={entry.kind}
          className={styles.row}
          data-pcc-rm-integration-readiness-kind={entry.kind}
        >
          <div className={styles.rowHeader}>
            <span className={styles.rowTitle}>{entry.kindLabel}</span>
            <span className={styles.chip}>Severity: {entry.severityLabel}</span>
            <span className={styles.chip}>{entry.count} count</span>
          </div>
          <span className={styles.captionLine}>{entry.captionText}</span>
        </li>
      ))}
    </ul>
  </div>
);

// ---------------------------------------------------------------------------
// Sub-region: Approvals references
// ---------------------------------------------------------------------------

interface ApprovalsReferencesRegionProps {
  readonly vm: IPccRmApprovalsReferencesViewModel;
}

const ApprovalsReferencesRegion: FC<ApprovalsReferencesRegionProps> = ({ vm }) => (
  <div className={styles.row} data-pcc-rm-integration-region="approvals-references">
    <div className={styles.rowHeader}>
      <span className={styles.rowTitle}>Approvals references</span>
      <span className={styles.chip}>
        {vm.entries.length} reference{vm.entries.length === 1 ? '' : 's'}
      </span>
    </div>
    <span className={styles.captionLine}>{vm.ownershipCaption}</span>
    {vm.entries.length === 0 ? (
      <PccPreviewState state="empty" description={vm.emptyCaption} />
    ) : (
      <ul className={styles.list} aria-label="Approvals references">
        {vm.entries.map((entry) => (
          <li
            key={`${entry.instanceId}:${entry.stepId}`}
            className={styles.row}
            data-pcc-rm-integration-approval-step={entry.stepId}
          >
            <div className={styles.rowHeader}>
              <span className={styles.rowTitle}>{entry.sourceTask}</span>
              <span className={styles.chip}>{entry.stepTypeLabel}</span>
              <span className={styles.chip}>{entry.stepStateLabel}</span>
            </div>
            <span className={styles.rowMeta}>
              Item {entry.instanceId} · Step {entry.stepId}
            </span>
          </li>
        ))}
      </ul>
    )}
  </div>
);

// ---------------------------------------------------------------------------
// Sub-region: Team & Access references
// ---------------------------------------------------------------------------

interface TeamAccessReferencesRegionProps {
  readonly vm: IPccRmTeamAccessReferencesViewModel;
}

const TeamAccessReferencesRegion: FC<TeamAccessReferencesRegionProps> = ({ vm }) => {
  const isEmpty = vm.roleEntries.length === 0 && vm.personEntries.length === 0;
  return (
    <div className={styles.row} data-pcc-rm-integration-region="team-access-references">
      <div className={styles.rowHeader}>
        <span className={styles.rowTitle}>Team &amp; Access references</span>
        <span className={styles.chip}>
          {vm.roleEntries.length} role{vm.roleEntries.length === 1 ? '' : 's'}
        </span>
        <span className={styles.chip}>
          {vm.personEntries.length} person{vm.personEntries.length === 1 ? '' : 's'}
        </span>
      </div>
      <span className={styles.captionLine}>{vm.ownershipCaption}</span>
      {isEmpty ? (
        <PccPreviewState state="empty" description={vm.emptyCaption} />
      ) : (
        <Fragment>
          {vm.roleEntries.length > 0 ? (
            <ul className={styles.list} aria-label="Team & Access role references">
              {vm.roleEntries.map((entry) => (
                <li
                  key={entry.roleCode}
                  className={styles.row}
                  data-pcc-rm-integration-role={entry.roleCode}
                >
                  <div className={styles.rowHeader}>
                    <span className={styles.rowTitle}>{entry.roleLabel}</span>
                    <span className={styles.chip}>Code: {entry.roleCode}</span>
                    {entry.required ? <span className={styles.chip}>Required</span> : null}
                    <span className={styles.chip}>
                      {entry.instanceCount} instance{entry.instanceCount === 1 ? '' : 's'}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          ) : null}
          {vm.personEntries.length > 0 ? (
            <ul className={styles.list} aria-label="Team & Access person references">
              {vm.personEntries.map((entry) => (
                <li
                  key={entry.personId}
                  className={styles.row}
                  data-pcc-rm-integration-person={entry.personId}
                  data-pcc-rm-integration-person-active={entry.isActive ? 'true' : 'false'}
                >
                  <div className={styles.rowHeader}>
                    <span className={styles.rowTitle}>{entry.displayName}</span>
                    <span className={styles.chip}>Person id: {entry.personId}</span>
                    {entry.isActive ? (
                      <span className={styles.chip}>Active</span>
                    ) : (
                      <span className={styles.chipReviewRequired}>Inactive</span>
                    )}
                    <span className={styles.chip}>
                      {entry.instanceCount} instance{entry.instanceCount === 1 ? '' : 's'}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          ) : null}
        </Fragment>
      )}
    </div>
  );
};

// ---------------------------------------------------------------------------
// Sub-region: Document Control references
// ---------------------------------------------------------------------------

interface DocumentControlReferencesRegionProps {
  readonly vm: IPccRmDocumentControlReferencesViewModel;
}

const DocumentControlReferencesRegion: FC<DocumentControlReferencesRegionProps> = ({ vm }) => (
  <div className={styles.row} data-pcc-rm-integration-region="document-control-references">
    <div className={styles.rowHeader}>
      <span className={styles.rowTitle}>Document Control references</span>
      <span className={styles.chip}>
        {vm.entries.length} status group{vm.entries.length === 1 ? '' : 's'}
      </span>
    </div>
    <span className={styles.captionLine}>{vm.ownershipCaption}</span>
    {vm.entries.length === 0 ? (
      <PccPreviewState state="empty" description={vm.emptyCaption} />
    ) : (
      <ul className={styles.list} aria-label="Document Control references">
        {vm.entries.map((entry) => (
          <li
            key={entry.status}
            className={styles.row}
            data-pcc-rm-integration-evidence-status={entry.status}
          >
            <div className={styles.rowHeader}>
              <span className={styles.rowTitle}>{entry.statusLabel}</span>
              <span className={styles.chip}>
                {entry.count} reference{entry.count === 1 ? '' : 's'}
              </span>
            </div>
            <span className={styles.rowMeta}>
              Document Control source ids: {entry.documentControlSourceIds.join(' · ')}
            </span>
          </li>
        ))}
      </ul>
    )}
  </div>
);
