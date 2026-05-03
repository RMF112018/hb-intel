/**
 * Constraints Log — region renderer (Phase 3 / Wave 12 / Prompt 05).
 *
 * Returns a `Fragment` of direct `<PccDashboardCard>` children. Each
 * ready-state card's inner content `<div>` carries
 * `data-pcc-readiness-section="constraints-log"` and a per-card
 * `data-pcc-cl-lane="<lane-id>"` marker so:
 *   - the bento direct-child invariant is preserved (no `<section>`
 *     wrapper),
 *   - tests can scope queries to each lane independently,
 *   - the existing `data-pcc-readiness-section` scoping pattern keeps
 *     all Project Readiness embedded region groups locatable from the
 *     same active surface panel.
 *
 * Read-only / reference-only / local selection-only posture is structural:
 *   - no `<a href>` elements, no `<form>` elements, no `<input type="file">`,
 *   - no enabled mutation buttons; the only enabled controls are the
 *     log-table row select buttons, which update local React selection
 *     state for the detail panel.
 */

import { Fragment, useMemo, useState, type FC } from 'react';
import { PccDashboardCard } from '../../layout/PccDashboardCard';
import { PccPreviewState } from '../../ui/PccPreviewState';
import type {
  IPccClBoardCardEntry,
  IPccClCommandCenterViewModel,
  IPccClConstraintExposureMatrixViewModel,
  IPccClConstraintPlotEntry,
  IPccClDetailPanelEntry,
  IPccClDetailPanelViewModel,
  IPccClExecutiveExposureSummaryViewModel,
  IPccClHuddleEntry,
  IPccClLogRow,
  IPccClLogTableViewModel,
  IPccClMakeReadyBoardViewModel,
  IPccClMatrixCell,
  IPccClRiskMatrixViewModel,
  IPccClRiskPlotEntry,
  IPccClRootCauseLessonsLearnedViewModel,
  IPccClWeeklyHuddleViewModel,
  IPccConstraintsLogViewModel,
} from './constraintsLogViewModel.js';
import styles from './PccConstraintsLogRegions.module.css';

const SECTION_MARKER = 'constraints-log';

type BandKey = IPccClBoardCardEntry['band'];

const BAND_CHIP_CLASS: Readonly<Record<BandKey, string>> = {
  low: styles.chipBandLow,
  moderate: styles.chipBandModerate,
  high: styles.chipBandHigh,
  'very-high': styles.chipBandVeryHigh,
  critical: styles.chipBandCritical,
};

const MATRIX_CELL_CLASS: Readonly<Record<BandKey, string>> = {
  low: styles.matrixCellLow,
  moderate: styles.matrixCellModerate,
  high: styles.matrixCellHigh,
  'very-high': styles.matrixCellVeryHigh,
  critical: styles.matrixCellCritical,
};

export interface PccConstraintsLogRegionsProps {
  readonly viewModel: IPccConstraintsLogViewModel;
}

export const PccConstraintsLogRegions: FC<PccConstraintsLogRegionsProps> = ({ viewModel }) => {
  if (viewModel.status === 'loading') {
    return (
      <PccDashboardCard
        footprint="full"
        eyebrow="Constraints Log"
        title="Loading Constraints Log read-model"
      >
        <div data-pcc-readiness-section={SECTION_MARKER} data-pcc-cl-lane="command-center">
          <PccPreviewState state="loading" />
        </div>
      </PccDashboardCard>
    );
  }
  if (viewModel.status === 'error') {
    return (
      <PccDashboardCard
        footprint="full"
        eyebrow="Constraints Log"
        title="Constraints Log read-model failed"
      >
        <div data-pcc-readiness-section={SECTION_MARKER} data-pcc-cl-lane="command-center">
          <PccPreviewState state="error" />
        </div>
      </PccDashboardCard>
    );
  }
  return <ReadyRegions viewModel={viewModel} />;
};

export default PccConstraintsLogRegions;

interface ReadyRegionsProps {
  readonly viewModel: Extract<IPccConstraintsLogViewModel, { status: 'ready' }>;
}

const ReadyRegions: FC<ReadyRegionsProps> = ({ viewModel }) => {
  const [selectedId, setSelectedId] = useState<string | undefined>(
    viewModel.detailPanel.defaultEntryId,
  );
  const selectedEntry = useMemo<IPccClDetailPanelEntry | undefined>(() => {
    if (!selectedId) return undefined;
    return viewModel.detailPanel.entries.get(selectedId);
  }, [selectedId, viewModel.detailPanel.entries]);

  return (
    <Fragment>
      <CommandCenterCard
        commandCenter={viewModel.commandCenter}
        moduleSubtitle={viewModel.moduleIdentity.subtitle}
      />
      <MakeReadyBoardCard board={viewModel.makeReadyBoard} />
      <RiskMatrixCard riskMatrix={viewModel.riskMatrix} />
      <ConstraintExposureMatrixCard matrix={viewModel.constraintExposureMatrix} />
      <LogTableCard
        logTable={viewModel.logTable}
        selectedId={selectedId}
        onSelect={setSelectedId}
      />
      <DetailPanelCard detailPanel={viewModel.detailPanel} selectedEntry={selectedEntry} />
      <WeeklyHuddleCard huddle={viewModel.weeklyHuddle} />
      <RootCauseLessonsLearnedCard rootCause={viewModel.rootCauseLessonsLearned} />
      <ExecutiveExposureSummaryCard summary={viewModel.executiveExposureSummary} />
    </Fragment>
  );
};

// ---------------------------------------------------------------------------
// Lane 1 — Command Center
// ---------------------------------------------------------------------------

interface CommandCenterCardProps {
  readonly commandCenter: IPccClCommandCenterViewModel;
  readonly moduleSubtitle: string;
}

const CommandCenterCard: FC<CommandCenterCardProps> = ({ commandCenter, moduleSubtitle }) => (
  <PccDashboardCard
    footprint="full"
    eyebrow="Constraints Log"
    title="Make-Ready Constraint & Risk Exposure Center"
  >
    <div
      className={styles.body}
      data-pcc-readiness-section={SECTION_MARKER}
      data-pcc-cl-lane="command-center"
    >
      <p className={styles.captionStrong}>{commandCenter.readOnlyCaption}</p>
      <p className={styles.captionLine}>{moduleSubtitle}</p>
      <p className={styles.captionLine}>{commandCenter.noExecutionCaption}</p>

      <div className={styles.statRow} data-pcc-cl-region="command-center-counts">
        <Stat label="Overdue constraints" value={commandCenter.overdueConstraintCount} />
        <Stat label="Awaiting external party" value={commandCenter.awaitingExternalPartyCount} />
        <Stat
          label="Delay-exposure review queue"
          value={commandCenter.delayExposureReviewQueueCount}
        />
        <Stat
          label="Change-exposure review queue"
          value={commandCenter.changeExposureReviewQueueCount}
        />
        <Stat
          label="Priority Actions candidates"
          value={commandCenter.priorityActionsCandidateCount}
        />
      </div>

      <div className={styles.row} data-pcc-cl-region="command-center-source-posture">
        <div className={styles.rowHeader}>
          <span className={styles.rowTitle}>Source posture</span>
          <span className={styles.chip}>{commandCenter.sourcePosture.sourceStatus}</span>
          <span className={styles.chip}>
            Confidence: {commandCenter.sourcePosture.confidenceLabel}
          </span>
          <span className={styles.chip}>{commandCenter.sourcePosture.lastIngestedDisplay}</span>
          <span className={styles.chip}>
            {commandCenter.sourcePosture.pendingHumanReviewCount} pending review
          </span>
        </div>
        <span className={styles.captionLine}>{commandCenter.sourcePosture.captionLine}</span>
        {commandCenter.latestSnapshotDisplay ? (
          <span className={styles.rowMeta}>{commandCenter.latestSnapshotDisplay}</span>
        ) : null}
      </div>
    </div>
  </PccDashboardCard>
);

// ---------------------------------------------------------------------------
// Lane 2 — Make-Ready Board
// ---------------------------------------------------------------------------

interface MakeReadyBoardCardProps {
  readonly board: IPccClMakeReadyBoardViewModel;
}

const MakeReadyBoardCard: FC<MakeReadyBoardCardProps> = ({ board }) => (
  <PccDashboardCard footprint="full" eyebrow="Constraints Log" title="Make-Ready Board">
    <div
      className={styles.body}
      data-pcc-readiness-section={SECTION_MARKER}
      data-pcc-cl-lane="make-ready-board"
    >
      <p className={styles.captionLine}>{board.definitionsCaption}</p>
      {board.totalConstraints === 0 ? (
        <PccPreviewState state="empty" description={board.emptyCaption} />
      ) : (
        <div className={styles.boardColumns}>
          {board.columns.map((col) => (
            <div
              key={col.state}
              className={styles.boardColumn}
              data-pcc-cl-board-column={col.state}
            >
              <div className={styles.boardColumnHeader}>
                <span>{col.stateLabel}</span>
                <span className={styles.chip}>{col.entries.length}</span>
              </div>
              <ul className={styles.list} aria-label={`${col.stateLabel} constraints`}>
                {col.entries.map((entry) => (
                  <li key={entry.id} className={styles.row} data-pcc-cl-board-card={entry.id}>
                    <div className={styles.rowHeader}>
                      <span className={styles.rowTitle}>
                        #{entry.itemNumber} · {entry.title}
                      </span>
                      <BandChip band={entry.band} label={entry.bandLabel} />
                    </div>
                    <span className={styles.rowMeta}>
                      Responsible: {entry.responsiblePartyDisplay} · Ball-in-court:{' '}
                      {entry.ballInCourtDisplay}
                    </span>
                    {entry.dueDateDisplay ? (
                      <span className={styles.rowMeta}>Due {entry.dueDateDisplay}</span>
                    ) : null}
                    <span className={styles.rowMeta}>{entry.seedCategoryLabel}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  </PccDashboardCard>
);

// ---------------------------------------------------------------------------
// Lane 3 — Risk Matrix
// ---------------------------------------------------------------------------

interface RiskMatrixCardProps {
  readonly riskMatrix: IPccClRiskMatrixViewModel;
}

const RiskMatrixCard: FC<RiskMatrixCardProps> = ({ riskMatrix }) => (
  <PccDashboardCard footprint="wide" eyebrow="Constraints Log" title="Risk Matrix">
    <div
      className={styles.body}
      data-pcc-readiness-section={SECTION_MARKER}
      data-pcc-cl-lane="risk-matrix"
    >
      <p className={styles.captionLine}>{riskMatrix.axisCaption}</p>
      <MatrixGrid
        cells={riskMatrix.cells}
        rowAxisLabel="Likelihood"
        rowLabels={riskMatrix.likelihoodLabels}
        columnLabels={riskMatrix.impactLabels}
        markerKey="risk-matrix-cell"
      />
      {riskMatrix.entries.length === 0 ? (
        <PccPreviewState state="empty" description={riskMatrix.emptyCaption} />
      ) : (
        <ul className={styles.list} aria-label="Risk plot entries">
          {riskMatrix.entries.map((r) => (
            <RiskPlotRow key={r.id} entry={r} />
          ))}
        </ul>
      )}
    </div>
  </PccDashboardCard>
);

interface RiskPlotRowProps {
  readonly entry: IPccClRiskPlotEntry;
}

const RiskPlotRow: FC<RiskPlotRowProps> = ({ entry }) => (
  <li className={styles.row} data-pcc-cl-risk-plot={entry.id}>
    <div className={styles.rowHeader}>
      <span className={styles.rowTitle}>
        #{entry.itemNumber} · {entry.title}
      </span>
      <BandChip band={entry.band} label={entry.bandLabel} />
      {entry.appliedOverrideCodes.length > 0 ? (
        <span className={styles.chip}>Override: {entry.appliedOverrideCodes.join(' · ')}</span>
      ) : null}
    </div>
    <span className={styles.rowMeta}>
      Likelihood {entry.likelihood} · Governing impact {entry.governingImpact} · Score {entry.score}
    </span>
    {entry.residualScore !== undefined && entry.residualBand ? (
      <span className={styles.rowMeta} data-pcc-cl-risk-residual={entry.id}>
        Residual score {entry.residualScore} · Residual band {entry.residualBand}
      </span>
    ) : null}
  </li>
);

// ---------------------------------------------------------------------------
// Lane 4 — Constraint Exposure Matrix
// ---------------------------------------------------------------------------

interface ConstraintExposureMatrixCardProps {
  readonly matrix: IPccClConstraintExposureMatrixViewModel;
}

const ConstraintExposureMatrixCard: FC<ConstraintExposureMatrixCardProps> = ({ matrix }) => (
  <PccDashboardCard footprint="wide" eyebrow="Constraints Log" title="Constraint Exposure Matrix">
    <div
      className={styles.body}
      data-pcc-readiness-section={SECTION_MARKER}
      data-pcc-cl-lane="constraint-exposure-matrix"
    >
      <p className={styles.captionLine}>{matrix.axisCaption}</p>
      <MatrixGrid
        cells={matrix.cells}
        rowAxisLabel="Urgency"
        rowLabels={matrix.urgencyLabels}
        columnLabels={matrix.impactLabels}
        markerKey="constraint-matrix-cell"
      />
      {matrix.entries.length === 0 ? (
        <PccPreviewState state="empty" description={matrix.emptyCaption} />
      ) : (
        <ul className={styles.list} aria-label="Constraint exposure plot entries">
          {matrix.entries.map((c) => (
            <ConstraintPlotRow key={c.id} entry={c} />
          ))}
        </ul>
      )}
    </div>
  </PccDashboardCard>
);

interface ConstraintPlotRowProps {
  readonly entry: IPccClConstraintPlotEntry;
}

const ConstraintPlotRow: FC<ConstraintPlotRowProps> = ({ entry }) => (
  <li className={styles.row} data-pcc-cl-constraint-plot={entry.id}>
    <div className={styles.rowHeader}>
      <span className={styles.rowTitle}>
        #{entry.itemNumber} · {entry.title}
      </span>
      <BandChip band={entry.band} label={entry.bandLabel} />
      <span className={styles.chip}>{entry.stateLabel}</span>
      {entry.appliedOverrideCodes.length > 0 ? (
        <span className={styles.chip}>Override: {entry.appliedOverrideCodes.join(' · ')}</span>
      ) : null}
    </div>
    <span className={styles.rowMeta}>
      Urgency {entry.urgency} · Governing impact {entry.governingImpact} · Score {entry.score}
    </span>
  </li>
);

// ---------------------------------------------------------------------------
// Lane 5 — Log Table
// ---------------------------------------------------------------------------

interface LogTableCardProps {
  readonly logTable: IPccClLogTableViewModel;
  readonly selectedId: string | undefined;
  readonly onSelect: (id: string) => void;
}

const LogTableCard: FC<LogTableCardProps> = ({ logTable, selectedId, onSelect }) => (
  <PccDashboardCard footprint="wide" eyebrow="Constraints Log" title="Log Table">
    <div
      className={styles.body}
      data-pcc-readiness-section={SECTION_MARKER}
      data-pcc-cl-lane="log-table"
    >
      <p className={styles.captionLine}>{logTable.definitionsCaption}</p>
      <span className={styles.rowMeta} data-pcc-cl-region="log-table-count">
        {logTable.totalCount} record{logTable.totalCount === 1 ? '' : 's'}
      </span>
      {logTable.rows.length === 0 ? (
        <PccPreviewState state="empty" description={logTable.emptyCaption} />
      ) : (
        <ul className={styles.list} aria-label="Constraints Log records">
          {logTable.rows.map((row) => (
            <LogTableRow
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

interface LogTableRowProps {
  readonly row: IPccClLogRow;
  readonly isSelected: boolean;
  readonly onSelect: (id: string) => void;
}

const LogTableRow: FC<LogTableRowProps> = ({ row, isSelected, onSelect }) => (
  <li
    className={`${styles.row} ${isSelected ? styles.rowSelected : ''}`}
    data-pcc-cl-log-row={row.id}
    data-pcc-cl-log-selected={isSelected ? 'true' : 'false'}
  >
    <button
      type="button"
      className={styles.rowSelect}
      onClick={() => onSelect(row.id)}
      aria-pressed={isSelected}
      data-pcc-cl-log-select={row.id}
    >
      <div className={styles.rowHeader}>
        <span className={styles.rowTitle}>
          #{row.itemNumber} · {row.title}
        </span>
        <BandChip band={row.band} label={row.bandLabel} />
        <span className={styles.chip}>{row.itemTypeLabel}</span>
        <span className={styles.chip}>{row.stateLabel}</span>
        {row.hasOverrides ? <span className={styles.chip}>Override applied</span> : null}
        {row.hasResidualReduction ? <span className={styles.chip}>Residual reduced</span> : null}
      </div>
      <span className={styles.rowMeta}>
        Score {row.score} · Responsible: {row.responsiblePartyDisplay} · Ball-in-court:{' '}
        {row.ballInCourtDisplay}
        {row.dueDateDisplay ? ` · Due ${row.dueDateDisplay}` : ''}
        {row.daysAgingFromIdentified !== undefined
          ? ` · Aging ${row.daysAgingFromIdentified}d`
          : ''}
      </span>
      <span className={styles.rowMeta}>{row.seedCategoryLabel}</span>
    </button>
  </li>
);

// ---------------------------------------------------------------------------
// Lane 6 — Detail Panel
// ---------------------------------------------------------------------------

interface DetailPanelCardProps {
  readonly detailPanel: IPccClDetailPanelViewModel;
  readonly selectedEntry: IPccClDetailPanelEntry | undefined;
}

const DetailPanelCard: FC<DetailPanelCardProps> = ({ detailPanel, selectedEntry }) => (
  <PccDashboardCard footprint="wide" eyebrow="Constraints Log" title="Detail Panel">
    <div
      className={styles.body}
      data-pcc-readiness-section={SECTION_MARKER}
      data-pcc-cl-lane="detail-panel"
    >
      {selectedEntry ? (
        <DetailEntry entry={selectedEntry} />
      ) : detailPanel.entries.size === 0 ? (
        <PccPreviewState state="empty" description={detailPanel.emptyCaption} />
      ) : (
        <p className={styles.captionLine}>
          Select a record in the Log Table to view its details here.
        </p>
      )}
    </div>
  </PccDashboardCard>
);

interface DetailEntryProps {
  readonly entry: IPccClDetailPanelEntry;
}

const DetailEntry: FC<DetailEntryProps> = ({ entry }) => (
  <div data-pcc-cl-detail-entry={entry.id}>
    <div className={styles.rowHeader}>
      <span className={styles.rowTitle}>
        #{entry.itemNumber} · {entry.title}
      </span>
      <BandChip band={entry.band} label={entry.bandLabel} />
      <span className={styles.chip}>{entry.itemTypeLabel}</span>
      <span className={styles.chip}>{entry.stateLabel}</span>
    </div>
    <p className={styles.rowMeta}>{entry.description}</p>
    <div className={styles.detailGrid}>
      <DetailField
        label={entry.likelihoodOrUrgencyLabel}
        value={String(entry.likelihoodOrUrgency)}
      />
      <DetailField label="Governing impact" value={String(entry.governingImpact)} />
      <DetailField label="Score" value={String(entry.score)} />
      <DetailField label="Seed category" value={entry.seedCategoryLabel} />
      <DetailField label="Responsible party" value={entry.responsiblePartyDisplay} />
      <DetailField label="Ball-in-court" value={entry.ballInCourtDisplay} />
      {entry.dateIdentifiedDisplay ? (
        <DetailField label="Date identified" value={entry.dateIdentifiedDisplay} />
      ) : null}
      {entry.needByDateDisplay ? (
        <DetailField label="Need-by date" value={entry.needByDateDisplay} />
      ) : null}
      {entry.promisedDateDisplay ? (
        <DetailField label="Promised date" value={entry.promisedDateDisplay} />
      ) : null}
      {entry.dueDateDisplay ? <DetailField label="Due date" value={entry.dueDateDisplay} /> : null}
      {entry.daysAgingFromIdentified !== undefined ? (
        <DetailField
          label="Days aging from identified"
          value={String(entry.daysAgingFromIdentified)}
        />
      ) : null}
      {entry.residualScore !== undefined && entry.residualBandLabel ? (
        <DetailField
          label="Residual score"
          value={`${entry.residualScore} (${entry.residualBandLabel})`}
        />
      ) : null}
      {entry.externalPartyReference ? (
        <DetailField label="External party reference" value={entry.externalPartyReference} />
      ) : null}
      {entry.convertedToConstraintId ? (
        <DetailField label="Converted to constraint" value={entry.convertedToConstraintId} />
      ) : null}
    </div>
    {entry.mitigationPlanSummary ? (
      <p className={styles.rowMeta} data-pcc-cl-detail-region="mitigation">
        Mitigation plan: {entry.mitigationPlanSummary}
      </p>
    ) : null}
    {entry.mitigationRationale ? (
      <p className={styles.rowMeta} data-pcc-cl-detail-region="mitigation-rationale">
        Mitigation rationale: {entry.mitigationRationale}
      </p>
    ) : null}
    {entry.appliedOverrideCodes.length > 0 ? (
      <p className={styles.rowMeta} data-pcc-cl-detail-region="overrides">
        Applied overrides: {entry.appliedOverrideCodes.join(' · ')}
        {entry.overrideRationale ? ` — ${entry.overrideRationale}` : ''}
      </p>
    ) : null}
    <p className={styles.rowMeta} data-pcc-cl-detail-region="source-lineage">
      Source lineage: {entry.sourceLineageDisplay}
    </p>
    {entry.referenceSeams.length > 0 ? (
      <ul
        className={styles.list}
        aria-label="Reference seams"
        data-pcc-cl-detail-region="reference-seams"
      >
        {entry.referenceSeams.map((seam, idx) => (
          <li
            key={`${seam.label}:${idx}`}
            className={styles.row}
            data-pcc-cl-detail-seam={seam.reference}
          >
            <span className={styles.rowMeta}>
              {seam.label}: {seam.reference}
            </span>
          </li>
        ))}
      </ul>
    ) : null}
    {entry.auditTrail.length > 0 ? (
      <ul className={styles.list} aria-label="Audit trail" data-pcc-cl-detail-region="audit-trail">
        {entry.auditTrail.map((event) => (
          <li key={event.eventId} className={styles.row} data-pcc-cl-detail-audit={event.eventId}>
            <div className={styles.rowHeader}>
              <span className={styles.rowTitle}>{event.eventType}</span>
              <span className={styles.chip}>{event.occurredAtDisplay}</span>
            </div>
            <span className={styles.rowMeta}>{event.summary}</span>
          </li>
        ))}
      </ul>
    ) : null}
    <p className={styles.boundaryNote} data-pcc-cl-boundary="legal-claim-delay">
      {entry.boundaryCaption}
    </p>
  </div>
);

// ---------------------------------------------------------------------------
// Lane 7 — Weekly Huddle
// ---------------------------------------------------------------------------

interface WeeklyHuddleCardProps {
  readonly huddle: IPccClWeeklyHuddleViewModel;
}

const WeeklyHuddleCard: FC<WeeklyHuddleCardProps> = ({ huddle }) => (
  <PccDashboardCard footprint="wide" eyebrow="Constraints Log" title="Weekly Huddle">
    <div
      className={styles.body}
      data-pcc-readiness-section={SECTION_MARKER}
      data-pcc-cl-lane="weekly-huddle"
    >
      <p className={styles.captionLine}>{huddle.cadenceCaption}</p>
      <span className={styles.rowMeta} data-pcc-cl-region="huddle-priority-actions-count">
        {huddle.priorityActionsCandidateCount} Priority Actions candidate
        {huddle.priorityActionsCandidateCount === 1 ? '' : 's'} flagged.
      </span>
      {huddle.sections.every((s) => s.entries.length === 0) ? (
        <PccPreviewState state="empty" description={huddle.emptyCaption} />
      ) : (
        huddle.sections.map((section) => (
          <div
            key={section.key}
            className={styles.huddleGroup}
            data-pcc-cl-huddle-section={section.key}
          >
            <div className={styles.huddleGroupHeader}>
              <span>{section.label}</span>
              <span className={styles.chip}>{section.entries.length}</span>
            </div>
            {section.entries.length === 0 ? (
              <span className={styles.rowMeta}>None in the current envelope.</span>
            ) : (
              <ul className={styles.list} aria-label={`${section.label} entries`}>
                {section.entries.map((entry) => (
                  <HuddleEntryRow key={`${section.key}:${entry.id}`} entry={entry} />
                ))}
              </ul>
            )}
          </div>
        ))
      )}
    </div>
  </PccDashboardCard>
);

interface HuddleEntryRowProps {
  readonly entry: IPccClHuddleEntry;
}

const HuddleEntryRow: FC<HuddleEntryRowProps> = ({ entry }) => (
  <li className={styles.row} data-pcc-cl-huddle-entry={entry.id}>
    <div className={styles.rowHeader}>
      <span className={styles.rowTitle}>
        #{entry.itemNumber} · {entry.title}
      </span>
      <BandChip band={entry.band} label={entry.bandLabel} />
      <span className={styles.chip}>{entry.stateLabel}</span>
    </div>
    <span className={styles.rowMeta}>
      Responsible: {entry.responsiblePartyDisplay} · Ball-in-court: {entry.ballInCourtDisplay}
      {entry.dueDateDisplay ? ` · Due ${entry.dueDateDisplay}` : ''}
    </span>
  </li>
);

// ---------------------------------------------------------------------------
// Lane 8 — Root Cause & Lessons Learned
// ---------------------------------------------------------------------------

interface RootCauseLessonsLearnedCardProps {
  readonly rootCause: IPccClRootCauseLessonsLearnedViewModel;
}

const RootCauseLessonsLearnedCard: FC<RootCauseLessonsLearnedCardProps> = ({ rootCause }) => (
  <PccDashboardCard
    footprint="wide"
    eyebrow="Constraints Log"
    title="Root Cause and Lessons Learned"
  >
    <div
      className={styles.body}
      data-pcc-readiness-section={SECTION_MARKER}
      data-pcc-cl-lane="root-cause-lessons-learned"
    >
      <p className={styles.boundaryNote} data-pcc-cl-boundary="legal-claim-delay">
        {rootCause.boundaryCaption}
      </p>
      {rootCause.categoryTrends.length === 0 ? (
        <PccPreviewState state="empty" description={rootCause.emptyCaption} />
      ) : (
        <ul
          className={styles.list}
          aria-label="Category trend rows"
          data-pcc-cl-region="root-cause-category-trends"
        >
          {rootCause.categoryTrends.map((row) => (
            <li
              key={row.seedCategoryId}
              className={styles.row}
              data-pcc-cl-root-cause-category={row.seedCategoryId}
            >
              <div className={styles.rowHeader}>
                <span className={styles.rowTitle}>{row.seedCategoryLabel}</span>
                <BandChip band={row.highestBand} label={`Highest: ${row.highestBandLabel}`} />
                <span className={styles.chip}>
                  {row.riskCount} risk{row.riskCount === 1 ? '' : 's'}
                </span>
                <span className={styles.chip}>
                  {row.constraintCount} constraint{row.constraintCount === 1 ? '' : 's'}
                </span>
              </div>
            </li>
          ))}
        </ul>
      )}
      {rootCause.overrideUsage.length > 0 ? (
        <ul
          className={styles.list}
          aria-label="Override usage rows"
          data-pcc-cl-region="root-cause-overrides"
        >
          {rootCause.overrideUsage.map((row) => (
            <li key={row.code} className={styles.row} data-pcc-cl-root-cause-override={row.code}>
              <div className={styles.rowHeader}>
                <span className={styles.rowTitle}>{row.label}</span>
                <span className={styles.chip}>{row.count}</span>
              </div>
            </li>
          ))}
        </ul>
      ) : null}
      {rootCause.residualDeltas.length > 0 ? (
        <ul
          className={styles.list}
          aria-label="Residual delta rows"
          data-pcc-cl-region="root-cause-residual-deltas"
        >
          {rootCause.residualDeltas.map((row) => (
            <li key={row.id} className={styles.row} data-pcc-cl-root-cause-residual={row.id}>
              <div className={styles.rowHeader}>
                <span className={styles.rowTitle}>
                  #{row.itemNumber} · {row.title}
                </span>
                <span className={styles.chip}>
                  {row.initialScore} → {row.residualScore} (Δ{row.delta})
                </span>
              </div>
              <span className={styles.rowMeta}>{row.mitigationRationale}</span>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  </PccDashboardCard>
);

// ---------------------------------------------------------------------------
// Lane 9 — Executive Exposure Summary
// ---------------------------------------------------------------------------

interface ExecutiveExposureSummaryCardProps {
  readonly summary: IPccClExecutiveExposureSummaryViewModel;
}

const ExecutiveExposureSummaryCard: FC<ExecutiveExposureSummaryCardProps> = ({ summary }) => (
  <PccDashboardCard footprint="wide" eyebrow="Constraints Log" title="Executive Exposure Summary">
    <div
      className={styles.body}
      data-pcc-readiness-section={SECTION_MARKER}
      data-pcc-cl-lane="executive-exposure-summary"
    >
      <p className={styles.captionLine}>{summary.headlineCaption}</p>
      <p className={styles.boundaryNote} data-pcc-cl-boundary="legal-claim-delay">
        {summary.boundaryCaption}
      </p>
      <div className={styles.statRow} data-pcc-cl-region="executive-headline-counts">
        <Stat label="Critical (risks + constraints)" value={summary.totalCriticalCount} />
        <Stat label="Very high (risks + constraints)" value={summary.totalVeryHighCount} />
      </div>
      <ul
        className={styles.list}
        aria-label="Exposure band distribution"
        data-pcc-cl-region="executive-band-distribution"
      >
        {summary.bandRows.map((row) => (
          <li key={row.band} className={styles.row} data-pcc-cl-exec-band={row.band}>
            <div className={styles.rowHeader}>
              <span className={styles.rowTitle}>{row.bandLabel}</span>
              <span className={styles.chip}>{row.totalCount} total</span>
              <span className={styles.chip}>{row.riskCount} risks</span>
              <span className={styles.chip}>{row.constraintCount} constraints</span>
            </div>
          </li>
        ))}
      </ul>
      <span className={styles.rowMeta}>Confidence: {summary.confidenceLabel}</span>
      {summary.snapshotDisplay ? (
        <span className={styles.rowMeta} data-pcc-cl-region="executive-snapshot">
          {summary.snapshotDisplay}
        </span>
      ) : null}
    </div>
  </PccDashboardCard>
);

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

interface StatProps {
  readonly label: string;
  readonly value: number;
}

const Stat: FC<StatProps> = ({ label, value }) => (
  <span className={styles.stat}>
    <span className={styles.statLabel}>{label}</span>
    <span className={styles.statValue}>{value}</span>
  </span>
);

interface BandChipProps {
  readonly band: BandKey;
  readonly label: string;
}

const BandChip: FC<BandChipProps> = ({ band, label }) => (
  <span className={`${styles.chip} ${BAND_CHIP_CLASS[band]}`} data-pcc-cl-band={band}>
    {label}
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

interface MatrixGridProps {
  readonly cells: readonly (readonly IPccClMatrixCell[])[];
  readonly rowAxisLabel: string;
  readonly rowLabels: readonly string[];
  readonly columnLabels: readonly string[];
  readonly markerKey: string;
}

const MatrixGrid: FC<MatrixGridProps> = ({
  cells,
  rowAxisLabel,
  rowLabels,
  columnLabels,
  markerKey,
}) => (
  <div className={styles.matrix} role="grid" aria-label={`${rowAxisLabel} matrix`}>
    <span className={styles.matrixHeaderCell} aria-hidden="true">
      &nbsp;
    </span>
    {Array.from({ length: 5 }).map((_, idx) => (
      <span key={`col-${idx}`} className={styles.matrixHeaderCell} role="columnheader">
        {columnLabels[idx] ?? String(idx + 1)}
      </span>
    ))}
    {cells.map((row, rowIdx) => (
      <Fragment key={`row-${rowIdx}`}>
        <span className={styles.matrixRowLabel} role="rowheader">
          {rowLabels[rowIdx] ?? String(rowIdx + 1)}
        </span>
        {row.map((cell) => (
          <span
            key={`${markerKey}-${cell.likelihood}-${cell.impact}`}
            className={`${styles.matrixCell} ${MATRIX_CELL_CLASS[cell.band]}`}
            role="gridcell"
            data-pcc-cl-matrix-cell={`${markerKey}:${cell.likelihood}:${cell.impact}`}
            data-pcc-cl-matrix-band={cell.band}
            aria-label={`${rowAxisLabel} ${cell.likelihood}, impact ${cell.impact}, band ${cell.band}, count ${cell.count}`}
          >
            {cell.count}
          </span>
        ))}
      </Fragment>
    ))}
  </div>
);
