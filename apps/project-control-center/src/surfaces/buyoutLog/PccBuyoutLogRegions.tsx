/**
 * Buyout Log — region renderer (Phase 3 / Wave 13 / Prompt 05).
 *
 * Returns a `Fragment` of direct `<PccDashboardCard>` children. Each
 * ready-state card's inner content `<div>` carries
 * `data-pcc-readiness-section="buyout-log"` and a per-card
 * `data-pcc-bl-region="<region-id>"` marker so:
 *   - the bento direct-child invariant is preserved (no `<section>`
 *     wrapper),
 *   - tests can scope queries to each region independently,
 *   - the existing `data-pcc-readiness-section` scoping pattern keeps
 *     all Project Readiness embedded region groups locatable from the
 *     same active surface panel.
 *
 * Read-only / reference-only / local selection-only posture is structural:
 *   - no `<a href>` elements, no `<form>` elements, no `<input type="file">`,
 *   - no enabled mutation buttons; the only enabled controls are the
 *     package-table row select buttons, which update local React selection
 *     state for the package detail panel.
 *
 * Loading and error are rendered as a single full-width
 * `PccPreviewState` card (with the command-center marker) so the surface
 * does not duplicate ten live regions during loading/error.
 */

import { Fragment, useMemo, useState, type FC } from 'react';
import { PccDashboardCard } from '../../layout/PccDashboardCard';
import { PccPreviewState } from '../../ui/PccPreviewState';
import { PccStatusPill, type PccStatusPillTone } from '../../ui/PccStatusPill';
import type {
  IPccBlAuditHistoryViewModel,
  IPccBlBudgetVsCommitmentViewModel,
  IPccBlCommandCenterViewModel,
  IPccBlComplianceSdiBondViewModel,
  IPccBlEvidenceLineageViewModel,
  IPccBlPackageDetailEntry,
  IPccBlPackageDetailViewModel,
  IPccBlPackageRow,
  IPccBlPackageTableViewModel,
  IPccBlProcoreReconciliationViewModel,
  IPccBlProcurementLeadTimeViewModel,
  IPccBlUnboughtScopeQueueViewModel,
  IPccBuyoutLogViewModel,
  PccBlStatusToneKey,
  PccBlVarianceToneKey,
} from './buyoutLogViewModel';
import styles from './PccBuyoutLogRegions.module.css';

const SECTION_MARKER = 'buyout-log';

const STATUS_TONE_TO_PILL: Readonly<Record<PccBlStatusToneKey, PccStatusPillTone>> = {
  info: 'info',
  success: 'success',
  warning: 'warning',
  danger: 'danger',
  neutral: 'neutral',
};

const VARIANCE_TONE_TO_PILL: Readonly<Record<PccBlVarianceToneKey, PccStatusPillTone>> = {
  neutral: 'neutral',
  success: 'success',
  warning: 'warning',
  danger: 'danger',
};

export interface PccBuyoutLogRegionsProps {
  readonly viewModel: IPccBuyoutLogViewModel;
}

export const PccBuyoutLogRegions: FC<PccBuyoutLogRegionsProps> = ({ viewModel }) => {
  if (viewModel.status === 'loading') {
    return (
      <PccDashboardCard footprint="full" eyebrow="Buyout Log" title="Loading Buyout Log read-model">
        <div data-pcc-readiness-section={SECTION_MARKER} data-pcc-bl-region="command-center">
          <PccPreviewState state="loading" />
        </div>
      </PccDashboardCard>
    );
  }
  if (viewModel.status === 'error') {
    return (
      <PccDashboardCard footprint="full" eyebrow="Buyout Log" title="Buyout Log read-model failed">
        <div data-pcc-readiness-section={SECTION_MARKER} data-pcc-bl-region="command-center">
          <PccPreviewState state="error" />
        </div>
      </PccDashboardCard>
    );
  }
  return <ReadyRegions viewModel={viewModel} />;
};

export default PccBuyoutLogRegions;

interface ReadyRegionsProps {
  readonly viewModel: Extract<IPccBuyoutLogViewModel, { status: 'ready' }>;
}

const ReadyRegions: FC<ReadyRegionsProps> = ({ viewModel }) => {
  const [selectedId, setSelectedId] = useState<string | undefined>(
    viewModel.packageDetail.defaultEntryId,
  );
  const selectedEntry = useMemo<IPccBlPackageDetailEntry | undefined>(() => {
    if (!selectedId) return undefined;
    return viewModel.packageDetail.entries.get(selectedId);
  }, [selectedId, viewModel.packageDetail.entries]);

  return (
    <Fragment>
      <CommandCenterCard
        commandCenter={viewModel.commandCenter}
        moduleSubtitle={viewModel.moduleIdentity.subtitle}
      />
      <PackageTableCard
        packageTable={viewModel.packageTable}
        selectedId={selectedId}
        onSelect={setSelectedId}
      />
      <BudgetVsCommitmentCard budget={viewModel.budgetVsCommitment} />
      <UnboughtScopeQueueCard queue={viewModel.unboughtScopeQueue} />
      <ProcoreReconciliationCard reconciliation={viewModel.procoreReconciliation} />
      <PackageDetailCard packageDetail={viewModel.packageDetail} selectedEntry={selectedEntry} />
      <ComplianceCard compliance={viewModel.compliance} />
      <ProcurementLeadTimeCard procurement={viewModel.procurementLeadTime} />
      <EvidenceLineageCard evidenceLineage={viewModel.evidenceLineage} />
      <AuditHistoryCard auditHistory={viewModel.auditHistory} />
    </Fragment>
  );
};

// ---------------------------------------------------------------------------
// Region 1 — Command Center
// ---------------------------------------------------------------------------

interface CommandCenterCardProps {
  readonly commandCenter: IPccBlCommandCenterViewModel;
  readonly moduleSubtitle: string;
}

const CommandCenterCard: FC<CommandCenterCardProps> = ({ commandCenter, moduleSubtitle }) => (
  <PccDashboardCard footprint="full" eyebrow="Buyout Log" title="Buyout Command Center">
    <div
      className={styles.body}
      data-pcc-readiness-section={SECTION_MARKER}
      data-pcc-bl-region="command-center"
    >
      <p className={styles.captionStrong}>{commandCenter.readOnlyCaption}</p>
      <p className={styles.captionLine}>{moduleSubtitle}</p>
      <p className={styles.captionLine}>{commandCenter.noExecutionCaption}</p>

      <div className={styles.statRow} data-pcc-bl-counts>
        <Stat label="Total packages" value={commandCenter.totalPackageCount} />
        <Stat label="Active packages" value={commandCenter.activePackageCount} />
        <Stat label="Blocked packages" value={commandCenter.blockedPackageCount} />
        <Stat label="Complete packages" value={commandCenter.completePackageCount} />
        <Stat label="Critical exceptions" value={commandCenter.criticalExceptionCount} />
        <Stat label="Attention exceptions" value={commandCenter.attentionExceptionCount} />
      </div>

      <div className={styles.row} data-pcc-bl-source-posture>
        <div className={styles.rowHeader}>
          <span className={styles.rowTitle}>Source posture</span>
          <PccStatusPill tone="info">{commandCenter.sourcePosture.sourceStatus}</PccStatusPill>
          <PccStatusPill tone="neutral">
            Confidence: {commandCenter.sourcePosture.confidenceLabel}
          </PccStatusPill>
          <PccStatusPill tone="neutral">
            {commandCenter.sourcePosture.lastIngestedDisplay}
          </PccStatusPill>
          <PccStatusPill tone="neutral">
            {commandCenter.sourcePosture.pendingHumanReviewCount} pending review
          </PccStatusPill>
        </div>
        <span className={styles.rowMeta}>{commandCenter.sourcePosture.captionLine}</span>
        {commandCenter.latestSnapshotDisplay ? (
          <span className={styles.rowMeta}>{commandCenter.latestSnapshotDisplay}</span>
        ) : null}
      </div>

      {commandCenter.exceptionClassificationCounts.length > 0 ? (
        <ul
          className={styles.list}
          aria-label="Exception classification counts"
          data-pcc-bl-exception-counts
        >
          {commandCenter.exceptionClassificationCounts.map((row) => (
            <li
              key={row.classification}
              className={styles.row}
              data-pcc-bl-exception-classification={row.classification}
            >
              <div className={styles.rowHeader}>
                <span className={styles.rowTitle}>{row.classificationLabel}</span>
                <PccStatusPill tone="neutral">{row.count}</PccStatusPill>
              </div>
            </li>
          ))}
        </ul>
      ) : null}

      <p className={styles.boundaryNote} data-pcc-bl-boundary="compliance-legal-accounting">
        {commandCenter.boundaryCaption}
      </p>
    </div>
  </PccDashboardCard>
);

// ---------------------------------------------------------------------------
// Region 2 — Package Table
// ---------------------------------------------------------------------------

interface PackageTableCardProps {
  readonly packageTable: IPccBlPackageTableViewModel;
  readonly selectedId: string | undefined;
  readonly onSelect: (id: string) => void;
}

const PackageTableCard: FC<PackageTableCardProps> = ({ packageTable, selectedId, onSelect }) => (
  <PccDashboardCard footprint="full" eyebrow="Buyout Log" title="Buyout Package Table">
    <div
      className={styles.body}
      data-pcc-readiness-section={SECTION_MARKER}
      data-pcc-bl-region="package-table"
    >
      <p className={styles.captionLine}>{packageTable.definitionsCaption}</p>
      <span className={styles.rowMeta} data-pcc-bl-package-table-count>
        {packageTable.totalCount} package{packageTable.totalCount === 1 ? '' : 's'}
      </span>
      {packageTable.rows.length === 0 ? (
        <PccPreviewState state="empty" description={packageTable.emptyCaption} />
      ) : (
        <ul className={styles.list} aria-label="Buyout packages">
          {packageTable.rows.map((row) => (
            <PackageRow
              key={row.id}
              row={row}
              isSelected={row.id === selectedId}
              onSelect={onSelect}
            />
          ))}
        </ul>
      )}
    </div>
  </PccDashboardCard>
);

interface PackageRowProps {
  readonly row: IPccBlPackageRow;
  readonly isSelected: boolean;
  readonly onSelect: (id: string) => void;
}

const PackageRow: FC<PackageRowProps> = ({ row, isSelected, onSelect }) => (
  <li
    className={`${styles.row} ${isSelected ? styles.rowSelected : ''}`}
    data-pcc-bl-package-row={row.id}
    data-pcc-bl-package-selected={isSelected ? 'true' : 'false'}
  >
    <button
      type="button"
      className={styles.rowSelect}
      onClick={() => onSelect(row.id)}
      aria-pressed={isSelected}
      data-pcc-bl-package-select={row.id}
    >
      <div className={styles.rowHeader}>
        <span className={styles.rowTitle}>
          {row.packageCode} · {row.packageTitle}
        </span>
        <PccStatusPill tone={STATUS_TONE_TO_PILL[row.statusToneKey]}>
          {row.statusLabel}
        </PccStatusPill>
        <PccStatusPill tone="neutral">CSI {row.csiDivision}</PccStatusPill>
        <PccStatusPill tone="neutral">Cost {row.costCode}</PccStatusPill>
        {row.hasComplianceHold ? (
          <PccStatusPill tone="warning">Compliance hold</PccStatusPill>
        ) : null}
        {row.hasReconciliationIssue ? (
          <PccStatusPill tone="warning">Reconciliation flag</PccStatusPill>
        ) : null}
      </div>
      <span className={styles.rowMeta}>
        Vendor: {row.vendorDisplay} · BIC: {row.ballInCourtDisplay}
        {row.leadTimeDaysDisplay ? ` · Lead ${row.leadTimeDaysDisplay}` : ''}
      </span>
      <span className={styles.rowMeta}>
        {row.awardAmountDisplay ? `Award ${row.awardAmountDisplay}` : 'Award —'}
        {row.currentBudgetDisplay ? ` · Budget ${row.currentBudgetDisplay}` : ''}
        {row.procoreCommitmentDisplay
          ? ` · Procore commitment ${row.procoreCommitmentDisplay}`
          : ''}
      </span>
      <span
        className={styles.rowMeta}
        data-pcc-bl-package-source-system={row.sourceLineageDisplay.sourceSystem}
      >
        Source: {row.sourceLineageDisplay.sourceSystemLabel} ·{' '}
        {row.sourceLineageDisplay.creationSourceLabel}
        {row.sourceLineageDisplay.sourceObjectId
          ? ` · ${row.sourceLineageDisplay.sourceObjectId}`
          : ''}
        {row.sourceLineageDisplay.workbookSummary
          ? ` · ${row.sourceLineageDisplay.workbookSummary}`
          : ''}
      </span>
      <span className={styles.rowMeta}>Evidence references: {row.evidenceLinkCount}</span>
    </button>
  </li>
);

// ---------------------------------------------------------------------------
// Region 3 — Budget vs Commitment Matrix
// ---------------------------------------------------------------------------

interface BudgetVsCommitmentCardProps {
  readonly budget: IPccBlBudgetVsCommitmentViewModel;
}

const BudgetVsCommitmentCard: FC<BudgetVsCommitmentCardProps> = ({ budget }) => (
  <PccDashboardCard footprint="wide" eyebrow="Buyout Log" title="Budget vs Commitment Matrix">
    <div
      className={styles.body}
      data-pcc-readiness-section={SECTION_MARKER}
      data-pcc-bl-region="budget-vs-commitment"
    >
      <p className={styles.captionLine}>{budget.definitionsCaption}</p>
      {budget.rows.length === 0 ? (
        <PccPreviewState state="empty" description={budget.emptyCaption} />
      ) : (
        <Fragment>
          <div className={styles.statRow} data-pcc-bl-budget-totals>
            {budget.totalAwardAmountDisplay ? (
              <Stat label="Total award" value={budget.totalAwardAmountDisplay} />
            ) : null}
            {budget.totalCurrentBudgetDisplay ? (
              <Stat label="Total budget" value={budget.totalCurrentBudgetDisplay} />
            ) : null}
            {budget.totalProcoreCommitmentDisplay ? (
              <Stat
                label="Total Procore commitment (imported)"
                value={budget.totalProcoreCommitmentDisplay}
              />
            ) : null}
          </div>
          <ul className={styles.list} aria-label="Budget and commitment rows">
            {budget.rows.map((row) => (
              <li key={row.id} className={styles.row} data-pcc-bl-budget-row={row.id}>
                <div className={styles.rowHeader}>
                  <span className={styles.rowTitle}>
                    {row.packageCode} · {row.packageTitle}
                  </span>
                  {row.varianceDisplay ? (
                    <PccStatusPill tone={VARIANCE_TONE_TO_PILL[row.varianceToneKey]}>
                      Variance {row.varianceDisplay}
                    </PccStatusPill>
                  ) : null}
                  <PccStatusPill tone="neutral">{row.mappingStatusLabel}</PccStatusPill>
                  <PccStatusPill tone="neutral">{row.reconciliationStateLabel}</PccStatusPill>
                </div>
                <div className={styles.detailGrid}>
                  <DetailField label="Original budget" value={row.originalBudgetDisplay ?? '—'} />
                  <DetailField label="Current budget" value={row.currentBudgetDisplay ?? '—'} />
                  <DetailField label="Award amount" value={row.awardAmountDisplay ?? '—'} />
                  <DetailField
                    label="Procore commitment"
                    value={row.procoreCommitmentDisplay ?? '—'}
                  />
                  <DetailField label="Sage committed" value={row.sageCommittedDisplay ?? '—'} />
                </div>
              </li>
            ))}
          </ul>
        </Fragment>
      )}
    </div>
  </PccDashboardCard>
);

// ---------------------------------------------------------------------------
// Region 4 — Unbought Scope Queue
// ---------------------------------------------------------------------------

interface UnboughtScopeQueueCardProps {
  readonly queue: IPccBlUnboughtScopeQueueViewModel;
}

const UnboughtScopeQueueCard: FC<UnboughtScopeQueueCardProps> = ({ queue }) => (
  <PccDashboardCard footprint="wide" eyebrow="Buyout Log" title="Unbought Scope Queue">
    <div
      className={styles.body}
      data-pcc-readiness-section={SECTION_MARKER}
      data-pcc-bl-region="unbought-scope"
    >
      <p className={styles.captionLine}>{queue.definitionsCaption}</p>
      <div className={styles.statRow} data-pcc-bl-unbought-counts>
        <Stat label="Partially covered" value={queue.partialCount} />
        <Stat label="Uncovered" value={queue.uncoveredCount} />
      </div>
      {queue.rows.length === 0 ? (
        <PccPreviewState state="empty" description={queue.emptyCaption} />
      ) : (
        <ul className={styles.list} aria-label="Unbought scope lines">
          {queue.rows.map((row) => (
            <li key={row.id} className={styles.row} data-pcc-bl-unbought-row={row.id}>
              <div className={styles.rowHeader}>
                <span className={styles.rowTitle}>
                  {row.packageCode} · {row.packageTitle}
                </span>
                <PccStatusPill tone={row.scopeStatus === 'uncovered' ? 'danger' : 'warning'}>
                  {row.scopeStatusLabel}
                </PccStatusPill>
                <PccStatusPill tone="neutral">CSI {row.csiDivision}</PccStatusPill>
                <PccStatusPill tone="neutral">Cost {row.costCode}</PccStatusPill>
              </div>
              <span className={styles.rowMeta}>{row.description}</span>
              {row.quantityDisplay ? (
                <span className={styles.rowMeta}>Quantity: {row.quantityDisplay}</span>
              ) : null}
              <span
                className={styles.rowMeta}
                data-pcc-bl-unbought-source-system={row.sourceLineageDisplay.sourceSystem}
              >
                Source: {row.sourceLineageDisplay.sourceSystemLabel} ·{' '}
                {row.sourceLineageDisplay.creationSourceLabel}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  </PccDashboardCard>
);

// ---------------------------------------------------------------------------
// Region 5 — Procore Reconciliation View
// ---------------------------------------------------------------------------

interface ProcoreReconciliationCardProps {
  readonly reconciliation: IPccBlProcoreReconciliationViewModel;
}

const ProcoreReconciliationCard: FC<ProcoreReconciliationCardProps> = ({ reconciliation }) => (
  <PccDashboardCard footprint="wide" eyebrow="Buyout Log" title="Procore Reconciliation View">
    <div
      className={styles.body}
      data-pcc-readiness-section={SECTION_MARKER}
      data-pcc-bl-region="procore-reconciliation"
    >
      <p className={styles.boundaryNote} data-pcc-bl-boundary="reconciliation-no-runtime">
        {reconciliation.boundaryCaption}
      </p>
      <div className={styles.statRow} data-pcc-bl-reconciliation-counts>
        <Stat label="Open issues" value={reconciliation.openIssueCount} />
        <Stat label="Resolved issues" value={reconciliation.resolvedIssueCount} />
      </div>
      {reconciliation.issues.length === 0 && reconciliation.commitmentLinks.length === 0 ? (
        <PccPreviewState state="empty" description={reconciliation.emptyCaption} />
      ) : (
        <Fragment>
          {reconciliation.issues.length > 0 ? (
            <ul
              className={styles.list}
              aria-label="Reconciliation issues"
              data-pcc-bl-reconciliation-issues
            >
              {reconciliation.issues.map((issue) => (
                <li
                  key={issue.id}
                  className={styles.row}
                  data-pcc-bl-reconciliation-issue={issue.id}
                  data-pcc-bl-reconciliation-issue-kind={issue.kind}
                >
                  <div className={styles.rowHeader}>
                    <span className={styles.rowTitle}>
                      {issue.packageCode} · {issue.packageTitle}
                    </span>
                    <PccStatusPill tone={issue.resolvedAtDisplay ? 'success' : 'warning'}>
                      {issue.kindLabel}
                    </PccStatusPill>
                    <PccStatusPill tone="neutral">Opened {issue.openedAtDisplay}</PccStatusPill>
                    {issue.resolvedAtDisplay ? (
                      <PccStatusPill tone="success">
                        Resolved {issue.resolvedAtDisplay}
                      </PccStatusPill>
                    ) : null}
                  </div>
                  <span className={styles.rowMeta}>{issue.detail}</span>
                  {issue.resolutionRationale ? (
                    <span className={styles.rowMeta}>Rationale: {issue.resolutionRationale}</span>
                  ) : null}
                </li>
              ))}
            </ul>
          ) : null}
          {reconciliation.commitmentLinks.length > 0 ? (
            <ul
              className={styles.list}
              aria-label="Procore commitment links"
              data-pcc-bl-reconciliation-commitments
            >
              {reconciliation.commitmentLinks.map((link) => (
                <li
                  key={link.id}
                  className={styles.row}
                  data-pcc-bl-reconciliation-commitment={link.id}
                >
                  <div className={styles.rowHeader}>
                    <span className={styles.rowTitle}>
                      {link.packageCode} · {link.packageTitle}
                    </span>
                    <PccStatusPill tone="neutral">{link.reconciliationStatusLabel}</PccStatusPill>
                    {link.procoreCommitmentNumber ? (
                      <PccStatusPill tone="neutral">
                        Commitment {link.procoreCommitmentNumber}
                      </PccStatusPill>
                    ) : null}
                  </div>
                  <span className={styles.rowMeta}>
                    {link.currentCommitmentDisplay
                      ? `Current ${link.currentCommitmentDisplay}`
                      : 'Current —'}
                    {link.originalCommitmentDisplay
                      ? ` · Original ${link.originalCommitmentDisplay}`
                      : ''}
                    {link.procoreCompanyId ? ` · Company ${link.procoreCompanyId}` : ''}
                  </span>
                </li>
              ))}
            </ul>
          ) : null}
        </Fragment>
      )}
    </div>
  </PccDashboardCard>
);

// ---------------------------------------------------------------------------
// Region 6 — Package Detail Panel
// ---------------------------------------------------------------------------

interface PackageDetailCardProps {
  readonly packageDetail: IPccBlPackageDetailViewModel;
  readonly selectedEntry: IPccBlPackageDetailEntry | undefined;
}

const PackageDetailCard: FC<PackageDetailCardProps> = ({ packageDetail, selectedEntry }) => (
  <PccDashboardCard footprint="wide" eyebrow="Buyout Log" title="Buyout Package Detail">
    <div
      className={styles.body}
      data-pcc-readiness-section={SECTION_MARKER}
      data-pcc-bl-region="package-detail"
    >
      {selectedEntry ? (
        <PackageDetailEntry entry={selectedEntry} />
      ) : packageDetail.entries.size === 0 ? (
        <PccPreviewState state="empty" description={packageDetail.emptyCaption} />
      ) : (
        <p className={styles.captionLine}>
          Select a package in the Buyout Package Table to view its details here.
        </p>
      )}
    </div>
  </PccDashboardCard>
);

interface PackageDetailEntryProps {
  readonly entry: IPccBlPackageDetailEntry;
}

const PackageDetailEntry: FC<PackageDetailEntryProps> = ({ entry }) => (
  <div data-pcc-bl-detail-entry={entry.id}>
    <div className={styles.rowHeader}>
      <span className={styles.rowTitle}>
        {entry.packageCode} · {entry.packageTitle}
      </span>
      <PccStatusPill tone={STATUS_TONE_TO_PILL[entry.statusToneKey]}>
        {entry.statusLabel}
      </PccStatusPill>
      <PccStatusPill tone="neutral">CSI {entry.csiDivision}</PccStatusPill>
      <PccStatusPill tone="neutral">Cost {entry.costCode}</PccStatusPill>
    </div>
    <p className={styles.rowMeta}>{entry.scopeDescription}</p>
    <div className={styles.detailGrid}>
      <DetailField label="Vendor" value={entry.vendorDisplay} />
      <DetailField label="Ball-in-court" value={entry.ballInCourtDisplay} />
      {entry.awardAmountDisplay ? (
        <DetailField label="Award amount" value={entry.awardAmountDisplay} />
      ) : null}
      {entry.originalBudgetDisplay ? (
        <DetailField label="Original budget" value={entry.originalBudgetDisplay} />
      ) : null}
      {entry.currentBudgetDisplay ? (
        <DetailField label="Current budget" value={entry.currentBudgetDisplay} />
      ) : null}
      {entry.procoreCommitmentDisplay ? (
        <DetailField label="Procore commitment (imported)" value={entry.procoreCommitmentDisplay} />
      ) : null}
      {entry.sageCommittedDisplay ? (
        <DetailField label="Sage committed cost (imported)" value={entry.sageCommittedDisplay} />
      ) : null}
      {entry.leadTimeDaysDisplay ? (
        <DetailField label="Lead time" value={entry.leadTimeDaysDisplay} />
      ) : null}
      {entry.loiSendTargetDateDisplay ? (
        <DetailField label="LOI target" value={entry.loiSendTargetDateDisplay} />
      ) : null}
      {entry.loiExecutedDateDisplay ? (
        <DetailField label="LOI executed" value={entry.loiExecutedDateDisplay} />
      ) : null}
      <DetailField label="SDI" value={entry.sdiEnrollmentLabel} />
      <DetailField label="Bond" value={entry.bondRequirementLabel} />
      {entry.deferredUntilDisplay ? (
        <DetailField label="Deferred until" value={entry.deferredUntilDisplay} />
      ) : null}
    </div>
    {entry.leadTimeNotes ? (
      <p className={styles.rowMeta} data-pcc-bl-detail-region="lead-time-notes">
        Lead-time notes: {entry.leadTimeNotes}
      </p>
    ) : null}
    {entry.blockReason ? (
      <p className={styles.rowMeta} data-pcc-bl-detail-region="block-reason">
        Block reason: {entry.blockReason}
      </p>
    ) : null}
    {entry.comments ? (
      <p className={styles.rowMeta} data-pcc-bl-detail-region="comments">
        Comments: {entry.comments}
      </p>
    ) : null}

    <p
      className={styles.rowMeta}
      data-pcc-bl-detail-region="source-lineage"
      data-pcc-bl-detail-source-system={entry.sourceLineageDisplay.sourceSystem}
    >
      Source lineage: {entry.sourceLineageDisplay.sourceSystemLabel} ·{' '}
      {entry.sourceLineageDisplay.creationSourceLabel}
      {entry.sourceLineageDisplay.sourceObjectId
        ? ` · ${entry.sourceLineageDisplay.sourceObjectId}`
        : ''}
      {entry.sourceLineageDisplay.workbookSummary
        ? ` · ${entry.sourceLineageDisplay.workbookSummary}`
        : ''}
      {entry.sourceLineageDisplay.importedAtDisplay
        ? ` · imported ${entry.sourceLineageDisplay.importedAtDisplay}`
        : ''}
    </p>

    {entry.scopeLines.length > 0 ? (
      <ul className={styles.list} aria-label="Scope lines" data-pcc-bl-detail-region="scope-lines">
        {entry.scopeLines.map((s) => (
          <li key={s.id} className={styles.row} data-pcc-bl-detail-scope-line={s.id}>
            <div className={styles.rowHeader}>
              <span className={styles.rowTitle}>{s.description}</span>
              <PccStatusPill tone="neutral">{s.scopeStatusLabel}</PccStatusPill>
              <PccStatusPill tone="neutral">CSI {s.csiDivision}</PccStatusPill>
              <PccStatusPill tone="neutral">Cost {s.costCode}</PccStatusPill>
            </div>
            {s.quantityDisplay ? (
              <span className={styles.rowMeta}>Quantity: {s.quantityDisplay}</span>
            ) : null}
          </li>
        ))}
      </ul>
    ) : null}

    {entry.budgetAllocations.length > 0 ? (
      <ul
        className={styles.list}
        aria-label="Budget allocations"
        data-pcc-bl-detail-region="budget-allocations"
      >
        {entry.budgetAllocations.map((a) => (
          <li key={a.id} className={styles.row} data-pcc-bl-detail-budget-allocation={a.id}>
            <div className={styles.rowHeader}>
              <span className={styles.rowTitle}>
                {a.budgetCode} · {a.allocationAmountDisplay}
              </span>
              <PccStatusPill tone="neutral">{a.allocationPercentDisplay}</PccStatusPill>
              <PccStatusPill tone="neutral">{a.mappingStatusLabel}</PccStatusPill>
              <PccStatusPill tone="neutral">{a.mappingConfidenceLabel}</PccStatusPill>
            </div>
            <span className={styles.rowMeta}>
              Cost {a.costCode} · {a.costType} · {a.sourceSystemLabel}
            </span>
          </li>
        ))}
      </ul>
    ) : null}

    {entry.commitmentLinks.length > 0 ? (
      <ul
        className={styles.list}
        aria-label="Procore commitment links"
        data-pcc-bl-detail-region="commitment-links"
      >
        {entry.commitmentLinks.map((c) => (
          <li key={c.id} className={styles.row} data-pcc-bl-detail-commitment={c.id}>
            <div className={styles.rowHeader}>
              <span className={styles.rowTitle}>
                {c.procoreCommitmentNumber ?? 'Commitment (number not recorded)'}
              </span>
              <PccStatusPill tone="neutral">{c.reconciliationStatusLabel}</PccStatusPill>
            </div>
            <span className={styles.rowMeta}>
              {c.currentCommitmentDisplay ? `Current ${c.currentCommitmentDisplay}` : 'Current —'}
              {c.originalCommitmentDisplay ? ` · Original ${c.originalCommitmentDisplay}` : ''}
            </span>
          </li>
        ))}
      </ul>
    ) : null}

    {entry.evidenceLinks.length > 0 ? (
      <ul
        className={styles.list}
        aria-label="Evidence references"
        data-pcc-bl-detail-region="evidence-links"
      >
        {entry.evidenceLinks.map((e) => (
          <li key={e.id} className={styles.row} data-pcc-bl-detail-evidence={e.id}>
            <div className={styles.rowHeader}>
              <span className={styles.rowTitle}>{e.label}</span>
              <PccStatusPill tone="neutral">{e.classificationLabel}</PccStatusPill>
            </div>
            <span className={styles.rowMeta}>
              SharePoint reference: {e.sharepointReferenceId} · Added {e.addedAtDisplay}
            </span>
          </li>
        ))}
      </ul>
    ) : null}

    {entry.priorityActionCandidates.length > 0 ? (
      <ul
        className={styles.list}
        aria-label="Priority Actions candidates"
        data-pcc-bl-detail-region="priority-action-candidates"
      >
        {entry.priorityActionCandidates.map((c) => (
          <li key={c.id} className={styles.row} data-pcc-bl-detail-priority-action={c.id}>
            <div className={styles.rowHeader}>
              <span className={styles.rowTitle}>{c.reasonCodeLabel}</span>
              <PccStatusPill tone={STATUS_TONE_TO_PILL[c.severityToneKey]}>
                {c.severityLabel}
              </PccStatusPill>
              <PccStatusPill tone="neutral">{c.classificationLabel}</PccStatusPill>
              <PccStatusPill tone="neutral">{c.generatedAtDisplay}</PccStatusPill>
            </div>
          </li>
        ))}
      </ul>
    ) : null}

    {entry.auditTrail.length > 0 ? (
      <ul className={styles.list} aria-label="Audit trail" data-pcc-bl-detail-region="audit-trail">
        {entry.auditTrail.map((event) => (
          <li key={event.eventId} className={styles.row} data-pcc-bl-detail-audit={event.eventId}>
            <div className={styles.rowHeader}>
              <span className={styles.rowTitle}>{event.eventTypeLabel}</span>
              <PccStatusPill tone="neutral">{event.occurredAtDisplay}</PccStatusPill>
            </div>
            <span className={styles.rowMeta}>{event.summary}</span>
          </li>
        ))}
      </ul>
    ) : null}

    <div
      className={styles.row}
      data-pcc-bl-detail-region="hbi-eligibility"
      data-pcc-bl-detail-hbi-eligible={entry.hbiEligibilityNotice.eligible ? 'true' : 'false'}
    >
      <div className={styles.rowHeader}>
        <span className={styles.rowTitle}>HBI grounded answer eligibility</span>
        <PccStatusPill tone={entry.hbiEligibilityNotice.eligible ? 'info' : 'neutral'}>
          {entry.hbiEligibilityNotice.eligible ? 'Future-eligible' : 'Future-ineligible'}
        </PccStatusPill>
      </div>
      <span className={styles.rowMeta}>{entry.hbiEligibilityNotice.headlineCaption}</span>
      <span className={styles.rowMeta}>{entry.hbiEligibilityNotice.citationCaption}</span>
      {entry.hbiEligibilityNotice.refusalReasonLabels.length > 0 ? (
        <span className={styles.rowMeta}>
          Refusal reasons: {entry.hbiEligibilityNotice.refusalReasonLabels.join(' · ')}
        </span>
      ) : null}
    </div>

    <p className={styles.boundaryNote} data-pcc-bl-boundary="legal-claim-accounting">
      {entry.boundaryCaption}
    </p>
  </div>
);

// ---------------------------------------------------------------------------
// Region 7 — Compliance / SDI / Bond
// ---------------------------------------------------------------------------

interface ComplianceCardProps {
  readonly compliance: IPccBlComplianceSdiBondViewModel;
}

const ComplianceCard: FC<ComplianceCardProps> = ({ compliance }) => (
  <PccDashboardCard footprint="wide" eyebrow="Buyout Log" title="Compliance / SDI / Bond">
    <div
      className={styles.body}
      data-pcc-readiness-section={SECTION_MARKER}
      data-pcc-bl-region="compliance-sdi-bond"
    >
      <p className={styles.boundaryNote} data-pcc-bl-boundary="compliance-no-determination">
        {compliance.boundaryCaption}
      </p>
      <div className={styles.statRow} data-pcc-bl-compliance-counts>
        <Stat label="Total requirements" value={compliance.totalCount} />
        <Stat label="Non-compliant or expired" value={compliance.nonCompliantCount} />
        <Stat label="Waived" value={compliance.waivedCount} />
      </div>
      {compliance.groups.length === 0 ? (
        <PccPreviewState state="empty" description={compliance.emptyCaption} />
      ) : (
        compliance.groups.map((group) => (
          <div
            key={group.requirementType}
            className={styles.group}
            data-pcc-bl-compliance-group={group.requirementType}
          >
            <div className={styles.groupHeader}>
              <span>{group.requirementTypeLabel}</span>
              <PccStatusPill tone="neutral">{group.rows.length}</PccStatusPill>
            </div>
            <ul className={styles.list} aria-label={`${group.requirementTypeLabel} requirements`}>
              {group.rows.map((row) => (
                <li
                  key={row.id}
                  className={styles.row}
                  data-pcc-bl-compliance-row={row.id}
                  data-pcc-bl-compliance-status={row.status}
                >
                  <div className={styles.rowHeader}>
                    <span className={styles.rowTitle}>
                      {row.packageCode} · {row.packageTitle}
                    </span>
                    <PccStatusPill tone={STATUS_TONE_TO_PILL[row.statusToneKey]}>
                      {row.statusLabel}
                    </PccStatusPill>
                    {row.required ? <PccStatusPill tone="neutral">Required</PccStatusPill> : null}
                    {row.waiverRequired ? (
                      <PccStatusPill tone="warning">Waiver required</PccStatusPill>
                    ) : null}
                    {row.evidenceLinkCount > 0 ? (
                      <PccStatusPill tone="neutral">
                        Evidence refs: {row.evidenceLinkCount}
                      </PccStatusPill>
                    ) : null}
                  </div>
                  <span className={styles.rowMeta}>
                    {row.dueDateDisplay ? `Due ${row.dueDateDisplay}` : 'Due —'}
                    {row.receivedDateDisplay ? ` · Received ${row.receivedDateDisplay}` : ''}
                    {row.expirationDateDisplay ? ` · Expires ${row.expirationDateDisplay}` : ''}
                  </span>
                  {row.waiverReason ? (
                    <span className={styles.rowMeta}>Waiver reason: {row.waiverReason}</span>
                  ) : null}
                </li>
              ))}
            </ul>
          </div>
        ))
      )}
    </div>
  </PccDashboardCard>
);

// ---------------------------------------------------------------------------
// Region 8 — Procurement / Submittal / Lead-Time
// ---------------------------------------------------------------------------

interface ProcurementLeadTimeCardProps {
  readonly procurement: IPccBlProcurementLeadTimeViewModel;
}

const ProcurementLeadTimeCard: FC<ProcurementLeadTimeCardProps> = ({ procurement }) => (
  <PccDashboardCard
    footprint="wide"
    eyebrow="Buyout Log"
    title="Procurement / Submittal / Lead-Time"
  >
    <div
      className={styles.body}
      data-pcc-readiness-section={SECTION_MARKER}
      data-pcc-bl-region="procurement-leadtime"
    >
      <div className={styles.statRow} data-pcc-bl-procurement-counts>
        <Stat label="Total milestones" value={procurement.totalCount} />
        <Stat label="At risk" value={procurement.atRiskCount} />
        <Stat label="Overdue" value={procurement.overdueCount} />
      </div>
      {procurement.groups.length === 0 ? (
        <PccPreviewState state="empty" description={procurement.emptyCaption} />
      ) : (
        procurement.groups.map((group) => (
          <div
            key={group.milestoneType}
            className={styles.group}
            data-pcc-bl-procurement-group={group.milestoneType}
          >
            <div className={styles.groupHeader}>
              <span>{group.milestoneTypeLabel}</span>
              <PccStatusPill tone="neutral">{group.rows.length}</PccStatusPill>
            </div>
            <ul className={styles.list} aria-label={`${group.milestoneTypeLabel} milestones`}>
              {group.rows.map((row) => (
                <li
                  key={row.id}
                  className={styles.row}
                  data-pcc-bl-procurement-row={row.id}
                  data-pcc-bl-procurement-status={row.status}
                >
                  <div className={styles.rowHeader}>
                    <span className={styles.rowTitle}>
                      {row.packageCode} · {row.packageTitle}
                    </span>
                    <PccStatusPill tone={STATUS_TONE_TO_PILL[row.statusToneKey]}>
                      {row.statusLabel}
                    </PccStatusPill>
                    <PccStatusPill tone={STATUS_TONE_TO_PILL[row.riskToneKey]}>
                      Risk: {row.riskLevelLabel}
                    </PccStatusPill>
                  </div>
                  <span className={styles.rowMeta}>
                    {row.requiredDateDisplay ? `Required ${row.requiredDateDisplay}` : 'Required —'}
                    {row.forecastDateDisplay ? ` · Forecast ${row.forecastDateDisplay}` : ''}
                    {row.actualDateDisplay ? ` · Actual ${row.actualDateDisplay}` : ''}
                  </span>
                  {row.notes ? <span className={styles.rowMeta}>Notes: {row.notes}</span> : null}
                </li>
              ))}
            </ul>
          </div>
        ))
      )}
    </div>
  </PccDashboardCard>
);

// ---------------------------------------------------------------------------
// Region 9 — Evidence / Source Lineage
// ---------------------------------------------------------------------------

interface EvidenceLineageCardProps {
  readonly evidenceLineage: IPccBlEvidenceLineageViewModel;
}

const EvidenceLineageCard: FC<EvidenceLineageCardProps> = ({ evidenceLineage }) => (
  <PccDashboardCard footprint="wide" eyebrow="Buyout Log" title="Evidence and Source Lineage">
    <div
      className={styles.body}
      data-pcc-readiness-section={SECTION_MARKER}
      data-pcc-bl-region="evidence-lineage"
    >
      <p className={styles.boundaryNote} data-pcc-bl-boundary="evidence-reference-only">
        {evidenceLineage.boundaryCaption}
      </p>

      <div className={styles.row} data-pcc-bl-hbi-eligibility-summary>
        <div className={styles.rowHeader}>
          <span className={styles.rowTitle}>HBI grounded answer eligibility</span>
          <PccStatusPill tone="info">
            {evidenceLineage.hbiEligibilitySummary.eligibleCount} future-eligible
          </PccStatusPill>
          <PccStatusPill tone="neutral">
            {evidenceLineage.hbiEligibilitySummary.ineligibleCount} future-ineligible
          </PccStatusPill>
        </div>
        <span className={styles.rowMeta}>
          {evidenceLineage.hbiEligibilitySummary.headlineCaption}
        </span>
        <span className={styles.rowMeta}>
          {evidenceLineage.hbiEligibilitySummary.futureGatedCaption}
        </span>
      </div>

      {evidenceLineage.evidenceClassificationCounts.length > 0 ? (
        <ul
          className={styles.list}
          aria-label="Evidence classification counts"
          data-pcc-bl-evidence-classification-counts
        >
          {evidenceLineage.evidenceClassificationCounts.map((row) => (
            <li
              key={row.classification}
              className={styles.row}
              data-pcc-bl-evidence-classification={row.classification}
            >
              <div className={styles.rowHeader}>
                <span className={styles.rowTitle}>{row.classificationLabel}</span>
                <PccStatusPill tone="neutral">{row.count}</PccStatusPill>
              </div>
            </li>
          ))}
        </ul>
      ) : null}

      {evidenceLineage.packageLineageRows.length === 0 ? (
        <PccPreviewState state="empty" description={evidenceLineage.emptyCaption} />
      ) : (
        <ul
          className={styles.list}
          aria-label="Package source lineage"
          data-pcc-bl-evidence-package-lineage
        >
          {evidenceLineage.packageLineageRows.map((row) => (
            <li
              key={row.id}
              className={styles.row}
              data-pcc-bl-package-lineage={row.id}
              data-pcc-bl-package-lineage-source-system={row.sourceLineageDisplay.sourceSystem}
            >
              <div className={styles.rowHeader}>
                <span className={styles.rowTitle}>
                  {row.packageCode} · {row.packageTitle}
                </span>
                <PccStatusPill tone="neutral">
                  {row.sourceLineageDisplay.sourceSystemLabel}
                </PccStatusPill>
                <PccStatusPill tone="neutral">
                  {row.sourceLineageDisplay.creationSourceLabel}
                </PccStatusPill>
                <PccStatusPill tone="neutral">Evidence refs: {row.evidenceLinkCount}</PccStatusPill>
              </div>
              {row.sourceLineageDisplay.sourceObjectId ? (
                <span className={styles.rowMeta}>
                  Source object: {row.sourceLineageDisplay.sourceObjectId}
                </span>
              ) : null}
              {row.sourceLineageDisplay.workbookSummary ? (
                <span className={styles.rowMeta}>
                  Workbook: {row.sourceLineageDisplay.workbookSummary}
                </span>
              ) : null}
              {row.sourceLineageDisplay.importedAtDisplay ? (
                <span className={styles.rowMeta}>
                  Imported {row.sourceLineageDisplay.importedAtDisplay}
                </span>
              ) : null}
            </li>
          ))}
        </ul>
      )}

      {evidenceLineage.evidenceRows.length > 0 ? (
        <ul className={styles.list} aria-label="Evidence references" data-pcc-bl-evidence-rows>
          {evidenceLineage.evidenceRows.map((row) => (
            <li key={row.id} className={styles.row} data-pcc-bl-evidence-row={row.id}>
              <div className={styles.rowHeader}>
                <span className={styles.rowTitle}>{row.label}</span>
                <PccStatusPill tone="neutral">{row.classificationLabel}</PccStatusPill>
                <PccStatusPill tone="neutral">{row.packageCode}</PccStatusPill>
              </div>
              <span className={styles.rowMeta}>
                SharePoint reference: {row.sharepointReferenceId} · Added {row.addedAtDisplay}
              </span>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  </PccDashboardCard>
);

// ---------------------------------------------------------------------------
// Region 10 — Audit History
// ---------------------------------------------------------------------------

interface AuditHistoryCardProps {
  readonly auditHistory: IPccBlAuditHistoryViewModel;
}

const AuditHistoryCard: FC<AuditHistoryCardProps> = ({ auditHistory }) => (
  <PccDashboardCard footprint="wide" eyebrow="Buyout Log" title="Audit History">
    <div
      className={styles.body}
      data-pcc-readiness-section={SECTION_MARKER}
      data-pcc-bl-region="audit-history"
    >
      {auditHistory.auditEvents.length === 0 &&
      auditHistory.projectMemoryContributions.length === 0 &&
      auditHistory.traceabilityEdges.length === 0 ? (
        <PccPreviewState state="empty" description={auditHistory.emptyCaption} />
      ) : (
        <Fragment>
          {auditHistory.auditEvents.length > 0 ? (
            <ul className={styles.list} aria-label="Audit events" data-pcc-bl-audit-events>
              {auditHistory.auditEvents.map((event) => (
                <li
                  key={event.eventId}
                  className={styles.row}
                  data-pcc-bl-audit-event={event.eventId}
                >
                  <div className={styles.rowHeader}>
                    <span className={styles.rowTitle}>{event.eventTypeLabel}</span>
                    <PccStatusPill tone="neutral">{event.occurredAtDisplay}</PccStatusPill>
                    <PccStatusPill tone="neutral">{event.entityRef}</PccStatusPill>
                  </div>
                  <span className={styles.rowMeta}>{event.summary}</span>
                </li>
              ))}
            </ul>
          ) : null}

          {auditHistory.projectMemoryContributions.length > 0 ? (
            <Fragment>
              <span className={styles.captionLine}>{auditHistory.projectMemoryCaption}</span>
              <ul
                className={styles.list}
                aria-label="Project memory contributions"
                data-pcc-bl-project-memory
              >
                {auditHistory.projectMemoryContributions.map((row) => (
                  <li
                    key={row.id}
                    className={styles.row}
                    data-pcc-bl-project-memory-row={row.id}
                    data-pcc-bl-project-memory-kind={row.kind}
                  >
                    <div className={styles.rowHeader}>
                      <span className={styles.rowTitle}>{row.kindLabel}</span>
                      {row.packageCode ? (
                        <PccStatusPill tone="neutral">{row.packageCode}</PccStatusPill>
                      ) : null}
                      <PccStatusPill tone="neutral">{row.recordedAtDisplay}</PccStatusPill>
                    </div>
                    <span className={styles.rowMeta}>{row.narrative}</span>
                  </li>
                ))}
              </ul>
            </Fragment>
          ) : null}

          {auditHistory.traceabilityEdges.length > 0 ? (
            <Fragment>
              <span className={styles.captionLine}>{auditHistory.traceabilityCaption}</span>
              <ul className={styles.list} aria-label="Traceability edges" data-pcc-bl-traceability>
                {auditHistory.traceabilityEdges.map((row) => (
                  <li
                    key={row.id}
                    className={styles.row}
                    data-pcc-bl-traceability-edge={row.id}
                    data-pcc-bl-traceability-edge-kind={row.edgeKind}
                  >
                    <div className={styles.rowHeader}>
                      <span className={styles.rowTitle}>{row.edgeKindLabel}</span>
                      {row.packageCode ? (
                        <PccStatusPill tone="neutral">{row.packageCode}</PccStatusPill>
                      ) : null}
                    </div>
                    <span className={styles.rowMeta}>
                      {row.fromRef} → {row.toRef}
                    </span>
                  </li>
                ))}
              </ul>
            </Fragment>
          ) : null}
        </Fragment>
      )}
    </div>
  </PccDashboardCard>
);

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

interface StatProps {
  readonly label: string;
  readonly value: number | string;
}

const Stat: FC<StatProps> = ({ label, value }) => (
  <span className={styles.stat}>
    <span className={styles.statLabel}>{label}</span>
    <span className={styles.statValue}>{value}</span>
  </span>
);

interface DetailFieldProps {
  readonly label: string;
  readonly value: string;
}

const DetailField: FC<DetailFieldProps> = ({ label, value }) => (
  <span className={styles.detailField}>
    <span className={styles.detailFieldLabel}>{label}</span>
    <span className={styles.detailFieldValue}>{value}</span>
  </span>
);
