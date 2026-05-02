/**
 * Responsibility Matrix — region renderer (Phase 3 / Wave 11 / Prompt 05).
 *
 * Returns a `Fragment` of direct `<PccDashboardCard>` children. Each card's
 * inner content `<div>` carries `data-pcc-readiness-section="responsibility-matrix"`
 * and a per-lane `data-pcc-rm-lane="<lane-id>"` marker so:
 *   - the bento direct-child invariant is preserved (no `<section>` wrapper),
 *   - the existing `data-pcc-readiness-section` scoping pattern (used by the
 *     Wave 9 lifecycle and Wave 10 permit groups) keeps all four region
 *     groups locatable from the same active surface panel,
 *   - tests can scope queries to each lane independently.
 *
 * Read-only posture is structural: action affordances render as disabled
 * buttons (`disabled` + `aria-disabled="true"` + `data-pcc-rm-action-state="preview-disabled"`),
 * the "Who Owns This?" lookup is a disabled `<input>` (results come from the
 * envelope only — no fetch), and evidence references are plain text. There
 * are no `<a href>` elements, no `<form>` elements, and no `<input type="file">`
 * elements anywhere in this region group.
 */

import { Fragment, type FC } from 'react';
import { PccDashboardCard } from '../../layout/PccDashboardCard';
import { PccPreviewState } from '../../ui/PccPreviewState';
import { PccStatusPill, type PccStatusPillTone } from '../../ui/PccStatusPill';
import type {
  IPccResponsibilityMatrixViewModel,
  IPccRmExceptionGroupViewModel,
  IPccRmHandoffsViewModel,
  IPccRmGapsConflictsViewModel,
  IPccRmItemRegisterViewModel,
  IPccRmMatrixViewViewModel,
  IPccRmMyResponsibilitiesViewModel,
  IPccRmOverviewViewModel,
  IPccRmOwnerContractViewModel,
  IPccRmTemplateAdminViewModel,
  IPccRmWhoOwnsLookupResult,
} from './responsibilityMatrixViewModel.js';
import styles from './PccResponsibilityMatrixRegions.module.css';

const SECTION_MARKER = 'responsibility-matrix';

export interface PccResponsibilityMatrixRegionsProps {
  readonly viewModel: IPccResponsibilityMatrixViewModel;
}

export const PccResponsibilityMatrixRegions: FC<PccResponsibilityMatrixRegionsProps> = ({
  viewModel,
}) => {
  if (viewModel.status === 'loading') {
    return (
      <PccDashboardCard
        footprint="full"
        eyebrow="Responsibility Matrix"
        title="Loading Responsibility Matrix read-model"
      >
        <div data-pcc-readiness-section={SECTION_MARKER} data-pcc-rm-lane="overview">
          <PccPreviewState state="loading" />
        </div>
      </PccDashboardCard>
    );
  }
  if (viewModel.status === 'error') {
    return (
      <PccDashboardCard
        footprint="full"
        eyebrow="Responsibility Matrix"
        title="Responsibility Matrix read-model failed"
      >
        <div data-pcc-readiness-section={SECTION_MARKER} data-pcc-rm-lane="overview">
          <PccPreviewState state="error" />
        </div>
      </PccDashboardCard>
    );
  }
  return (
    <Fragment>
      <OverviewCard overview={viewModel.overview} />
      <MatrixViewCard matrixView={viewModel.matrixView} />
      <ItemRegisterCard itemRegister={viewModel.itemRegister} />
      <OwnerContractCard ownerContract={viewModel.ownerContract} />
      <MyResponsibilitiesCard my={viewModel.myResponsibilities} />
      <GapsConflictsCard gaps={viewModel.gapsConflicts} />
      <HandoffsCard handoffs={viewModel.handoffs} />
      <TemplateAdminCard templateAdmin={viewModel.templateAdmin} />
    </Fragment>
  );
};

export default PccResponsibilityMatrixRegions;

// ---------------------------------------------------------------------------
// Lane 1 — Overview
// ---------------------------------------------------------------------------

interface OverviewCardProps {
  readonly overview: IPccRmOverviewViewModel;
}

const OverviewCard: FC<OverviewCardProps> = ({ overview }) => {
  const counts = overview.healthBadge.counts;
  return (
    <PccDashboardCard
      footprint="full"
      eyebrow="Responsibility Matrix"
      title="RACI + Owner-Contract Responsibility Control Center"
    >
      <div
        className={styles.body}
        data-pcc-readiness-section={SECTION_MARKER}
        data-pcc-rm-lane="overview"
      >
        <p className={styles.captionStrong}>{overview.readOnlyCaption}</p>
        <p className={styles.captionLine}>{overview.noExecutionCaption}</p>

        <div className={styles.snapshotRow} data-pcc-rm-overview-region="health-score">
          <span className={styles.statLabel}>Matrix health score</span>
          <PccStatusPill tone={healthBandTone(overview.healthBadge.band)}>
            {overview.healthBadge.badgeLabel}
          </PccStatusPill>
          <span className={styles.captionLine}>{overview.healthBadge.summaryCaption}</span>
        </div>

        {counts ? (
          <div className={styles.statRow} data-pcc-rm-overview-region="health-counts">
            <Stat label="Open critical exceptions" value={counts.openCriticalExceptions} />
            <Stat label="Overdue actions" value={counts.overdueActions} />
            <Stat label="Missing accountable" value={counts.missingAccountableOwners} />
            <Stat label="Missing current action" value={counts.missingCurrentActionOwners} />
            <Stat label="Pending evidence" value={counts.pendingEvidence} />
            <Stat label="Unresolved decision rights" value={counts.unresolvedDecisionRightsGaps} />
          </div>
        ) : null}

        <div className={styles.row} data-pcc-rm-overview-region="count-posture">
          <span className={styles.captionStrong}>{overview.countPosture.headlineCaption}</span>
          <span className={styles.captionLine}>{overview.countPosture.explanationCaption}</span>
        </div>

        <div className={styles.row} data-pcc-rm-overview-region="source-traceability">
          <div className={styles.rowHeader}>
            <span className={styles.rowTitle}>Source traceability</span>
            <span className={styles.chip}>{overview.sourceTraceability.sourceStatus}</span>
            <span className={styles.chip}>
              Confidence: {overview.sourceTraceability.confidenceLabel}
            </span>
            <span className={styles.chip}>{overview.sourceTraceability.lastIngestedDisplay}</span>
            <span className={styles.chip}>
              {overview.sourceTraceability.pendingHumanReviewCount} pending review
            </span>
          </div>
          <span className={styles.captionLine}>
            {overview.sourceTraceability.traceabilityCaption}
          </span>
          {overview.countPosture.sourceFiles.length > 0 ? (
            <span className={styles.rowMeta}>
              Workbook sources: {overview.countPosture.sourceFiles.join(' · ')}
            </span>
          ) : null}
        </div>

        {overview.snapshotSummary ? (
          <div className={styles.row} data-pcc-rm-overview-region="snapshot">
            <div className={styles.rowHeader}>
              <span className={styles.rowTitle}>Latest baseline snapshot</span>
              <span className={styles.chip}>{overview.snapshotSummary.readOnlyBadge}</span>
              <span className={styles.chip}>
                Generated {overview.snapshotSummary.generatedAtDisplay}
              </span>
            </div>
            <span className={styles.captionLine}>{overview.snapshotSummary.summary}</span>
          </div>
        ) : null}

        <p className={styles.captionLine}>{overview.raciVsContractPartyCaption}</p>
        <p className={styles.captionLine}>{overview.evidenceReferenceCaption}</p>

        <div className={styles.lookupBlock} data-pcc-rm-overview-region="who-owns">
          <span className={styles.captionStrong}>Who owns this?</span>
          <input
            type="text"
            className={styles.lookupInput}
            placeholder="Lookup is preview-only — results below come from this envelope"
            disabled
            aria-disabled="true"
            readOnly
            value=""
            data-pcc-rm-action="who-owns-input"
            data-pcc-rm-action-state="preview-disabled"
          />
          {overview.whoOwnsResults.length === 0 ? (
            <span className={styles.captionLine}>
              No accountable or current action owners listed in the current envelope.
            </span>
          ) : (
            <ul
              className={styles.list}
              aria-label="Who owns this — envelope results"
              data-pcc-rm-overview-region="who-owns-results"
            >
              {overview.whoOwnsResults.map((r) => (
                <WhoOwnsResultRow key={r.key} result={r} />
              ))}
            </ul>
          )}
        </div>
      </div>
    </PccDashboardCard>
  );
};

interface WhoOwnsResultRowProps {
  readonly result: IPccRmWhoOwnsLookupResult;
}

const WhoOwnsResultRow: FC<WhoOwnsResultRowProps> = ({ result }) => (
  <li className={styles.row} data-pcc-rm-who-owns-instance={result.instanceId}>
    <div className={styles.rowHeader}>
      <span className={styles.rowTitle}>{result.sourceTask}</span>
      <span className={styles.chip}>{result.roleLabel}</span>
      <span className={styles.chip}>{accountabilityKindLabel(result.accountabilityKind)}</span>
      {result.personIsActive === false ? (
        <span className={styles.chipReviewRequired}>Person inactive</span>
      ) : null}
    </div>
    {result.personDisplayName ? (
      <span className={styles.rowMeta}>Person: {result.personDisplayName}</span>
    ) : (
      <span className={styles.rowMeta}>Role unstaffed; person not assigned in this envelope.</span>
    )}
  </li>
);

// ---------------------------------------------------------------------------
// Lane 2 — Matrix View
// ---------------------------------------------------------------------------

interface MatrixViewCardProps {
  readonly matrixView: IPccRmMatrixViewViewModel;
}

const MatrixViewCard: FC<MatrixViewCardProps> = ({ matrixView }) => (
  <PccDashboardCard
    footprint="full"
    eyebrow="Responsibility Matrix"
    title="Matrix view (role / person)"
  >
    <div
      className={styles.body}
      data-pcc-readiness-section={SECTION_MARKER}
      data-pcc-rm-lane="matrix"
    >
      <div
        className={styles.toggleRow}
        role="group"
        aria-label="Matrix display mode"
        data-pcc-rm-matrix-region="role-person-toggle"
      >
        <button
          type="button"
          className={`${styles.toggleButton} ${styles.toggleButtonActive}`}
          disabled
          aria-disabled="true"
          aria-pressed="true"
          data-pcc-rm-action="matrix-toggle-role"
          data-pcc-rm-action-state="preview-disabled"
        >
          {matrixView.toggleLabelRoleMode}
        </button>
        <button
          type="button"
          className={styles.toggleButton}
          disabled
          aria-disabled="true"
          aria-pressed="false"
          data-pcc-rm-action="matrix-toggle-person"
          data-pcc-rm-action-state="preview-disabled"
        >
          {matrixView.toggleLabelPersonMode}
        </button>
      </div>
      {matrixView.rows.length === 0 ? (
        <PccPreviewState state="empty" description={matrixView.emptyCaption} />
      ) : (
        <ul className={styles.list} aria-label="Responsibility matrix rows">
          {matrixView.rows.map((row) => (
            <li key={row.instanceId} className={styles.row} data-pcc-rm-matrix-row={row.instanceId}>
              <div className={styles.rowHeader}>
                <span className={styles.rowTitle}>{row.sourceTask}</span>
                <span className={styles.chip}>{row.classificationLabel}</span>
                <span className={styles.chip}>Criticality: {row.criticalityLabel}</span>
                <span className={styles.chip}>{row.domainLabel}</span>
                {row.hasOpenException ? (
                  <span className={styles.chipReviewRequired}>Open exception</span>
                ) : null}
              </div>
              <span className={styles.rowMeta}>
                Accountable: {row.accountableOwnerDisplay} · Current action:{' '}
                {row.currentActionOwnerDisplay}
              </span>
              <span className={styles.rowMeta}>{row.ballInCourtCaption}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  </PccDashboardCard>
);

// ---------------------------------------------------------------------------
// Lane 3 — Item Register (with inline detail region)
// ---------------------------------------------------------------------------

interface ItemRegisterCardProps {
  readonly itemRegister: IPccRmItemRegisterViewModel;
}

const ItemRegisterCard: FC<ItemRegisterCardProps> = ({ itemRegister }) => (
  <PccDashboardCard footprint="wide" eyebrow="Responsibility Matrix" title="Item register">
    <div
      className={styles.body}
      data-pcc-readiness-section={SECTION_MARKER}
      data-pcc-rm-lane="register"
    >
      {itemRegister.rows.length === 0 ? (
        <PccPreviewState state="empty" description={itemRegister.emptyCaption} />
      ) : (
        <ul className={styles.list} aria-label="Responsibility register rows">
          {itemRegister.rows.map((row) => (
            <li
              key={row.instanceId}
              className={styles.row}
              data-pcc-rm-register-row={row.instanceId}
              data-pcc-rm-register-overdue={row.isOverdue ? 'true' : 'false'}
            >
              <div className={styles.rowHeader}>
                <span className={styles.rowTitle}>{row.sourceTask}</span>
                <span className={styles.chip}>{row.classificationLabel}</span>
                <span className={styles.chip}>Criticality: {row.criticalityLabel}</span>
                <span className={styles.chip}>{row.domainLabel}</span>
                <span className={styles.chip}>{row.lifecycleStateLabel}</span>
                {row.isOverdue ? <span className={styles.chipOverdue}>Overdue</span> : null}
              </div>
              <span className={styles.rowMeta}>
                Current action owner: {row.currentActionOwnerDisplay}
                {row.dueDateDisplay ? ` · Due ${row.dueDateDisplay}` : ''}
              </span>
              <span className={styles.rowMeta}>Evidence: {row.evidenceStatusSummary}</span>
              <details className={styles.detail} data-pcc-rm-register-detail={row.instanceId}>
                <summary className={styles.detailSummary}>Item detail</summary>
                <span className={styles.rowMeta}>
                  Template {row.templateItemId} v{row.templateVersion}
                </span>
                {row.exceptionCodes.length > 0 ? (
                  <span className={styles.rowMeta}>
                    Exception codes: {row.exceptionCodes.join(' · ')}
                  </span>
                ) : (
                  <span className={styles.rowMeta}>No open exceptions on this item.</span>
                )}
              </details>
            </li>
          ))}
        </ul>
      )}
    </div>
  </PccDashboardCard>
);

// ---------------------------------------------------------------------------
// Lane 4 — Owner-Contract Mapping
// ---------------------------------------------------------------------------

interface OwnerContractCardProps {
  readonly ownerContract: IPccRmOwnerContractViewModel;
}

const OwnerContractCard: FC<OwnerContractCardProps> = ({ ownerContract }) => (
  <PccDashboardCard footprint="wide" eyebrow="Responsibility Matrix" title="Owner-contract mapping">
    <div
      className={styles.body}
      data-pcc-readiness-section={SECTION_MARKER}
      data-pcc-rm-lane="owner-contract-mapping"
    >
      <p className={styles.captionStrong} data-pcc-rm-oc-region="placeholder-caption">
        {ownerContract.placeholderCaption}
      </p>
      <p className={styles.captionLine}>{ownerContract.placeholderDetailCaption}</p>
      <p className={styles.captionLine} data-pcc-rm-oc-region="raci-vs-contract-party">
        {ownerContract.raciVsContractPartyCaption}
      </p>
      <div className={styles.statRow}>
        <Stat
          label="Active default obligations"
          value={ownerContract.activeDefaultObligationsCount}
        />
      </div>
      {ownerContract.templateRows.length === 0 ? (
        <PccPreviewState
          state="empty"
          description="No owner-contract templates available in the current envelope."
        />
      ) : (
        <ul
          className={styles.list}
          aria-label="Owner-contract template mappings"
          data-pcc-rm-oc-region="template-rows"
        >
          {ownerContract.templateRows.map((row) => (
            <li
              key={row.templateItemId}
              className={styles.row}
              data-pcc-rm-oc-template={row.templateItemId}
            >
              <div className={styles.rowHeader}>
                <span className={styles.rowTitle}>{row.sourceTask}</span>
                <span className={styles.chip}>Contract party: {row.contractPartyLabel}</span>
                {row.requiresUserReview ? (
                  <span className={styles.chipReviewRequired}>Requires review</span>
                ) : null}
              </div>
              {row.mappingNotes ? <span className={styles.rowMeta}>{row.mappingNotes}</span> : null}
              {row.obligationSummary ? (
                <span className={styles.rowMeta}>Obligation: {row.obligationSummary}</span>
              ) : null}
              {row.contractDocumentRef ? (
                <span className={styles.rowMeta}>
                  Contract document ref: {row.contractDocumentRef}
                  {row.articleSection ? ` · ${row.articleSection}` : ''}
                </span>
              ) : null}
            </li>
          ))}
        </ul>
      )}
      {ownerContract.instanceRows.length > 0 ? (
        <ul
          className={styles.list}
          aria-label="Owner-contract project instance ambiguity"
          data-pcc-rm-oc-region="instance-rows"
        >
          {ownerContract.instanceRows.map((row) => (
            <li
              key={row.instanceId}
              className={styles.row}
              data-pcc-rm-oc-instance={row.instanceId}
            >
              <div className={styles.rowHeader}>
                <span className={styles.rowTitle}>{row.sourceTask}</span>
                <span className={styles.chipReviewRequired}>Owner-contract ambiguity</span>
              </div>
              <span className={styles.rowMeta}>{row.sharedExceptionReason}</span>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  </PccDashboardCard>
);

// ---------------------------------------------------------------------------
// Lane 5 — My Responsibilities
// ---------------------------------------------------------------------------

interface MyResponsibilitiesCardProps {
  readonly my: IPccRmMyResponsibilitiesViewModel;
}

const MyResponsibilitiesCard: FC<MyResponsibilitiesCardProps> = ({ my }) => (
  <PccDashboardCard footprint="wide" eyebrow="Responsibility Matrix" title="My responsibilities">
    <div
      className={styles.body}
      data-pcc-readiness-section={SECTION_MARKER}
      data-pcc-rm-lane="my-responsibilities"
    >
      <p className={styles.captionLine}>{my.viewerPersonaCaption}</p>
      {my.rows.length === 0 ? (
        <PccPreviewState state="empty" description={my.emptyCaption} />
      ) : (
        <ul className={styles.list} aria-label="My responsibility rows">
          {my.rows.map((row) => (
            <li
              key={`${row.instanceId}:${row.accountabilityKind}`}
              className={styles.row}
              data-pcc-rm-my-row={row.instanceId}
              data-pcc-rm-my-kind={row.accountabilityKind}
            >
              <div className={styles.rowHeader}>
                <span className={styles.rowTitle}>{row.sourceTask}</span>
                <span className={styles.chip}>
                  {row.accountabilityKind === 'accountable' ? 'Accountable' : 'Current action'}
                </span>
                {row.isOverdue ? <span className={styles.chipOverdue}>Overdue</span> : null}
                {row.dueDateDisplay ? (
                  <span className={styles.chip}>Due {row.dueDateDisplay}</span>
                ) : null}
              </div>
              {row.pendingHandoffSummary ? (
                <span className={styles.rowMeta}>{row.pendingHandoffSummary}</span>
              ) : null}
              {row.pendingWorkflowStepSummary ? (
                <span className={styles.rowMeta}>{row.pendingWorkflowStepSummary}</span>
              ) : null}
            </li>
          ))}
        </ul>
      )}
    </div>
  </PccDashboardCard>
);

// ---------------------------------------------------------------------------
// Lane 6 — Gaps & Conflicts
// ---------------------------------------------------------------------------

interface GapsConflictsCardProps {
  readonly gaps: IPccRmGapsConflictsViewModel;
}

const GapsConflictsCard: FC<GapsConflictsCardProps> = ({ gaps }) => (
  <PccDashboardCard footprint="wide" eyebrow="Responsibility Matrix" title="Gaps and conflicts">
    <div
      className={styles.body}
      data-pcc-readiness-section={SECTION_MARKER}
      data-pcc-rm-lane="gaps-and-conflicts"
    >
      <p className={styles.captionLine}>{gaps.unresolvedDecisionRightsGapsCaption}</p>
      {gaps.groups.length === 0 ? (
        <PccPreviewState state="empty" description={gaps.emptyCaption} />
      ) : (
        <ul className={styles.list} aria-label="Exception groups">
          {gaps.groups.map((group) => (
            <ExceptionGroupRow key={group.code} group={group} />
          ))}
        </ul>
      )}
    </div>
  </PccDashboardCard>
);

interface ExceptionGroupRowProps {
  readonly group: IPccRmExceptionGroupViewModel;
}

const ExceptionGroupRow: FC<ExceptionGroupRowProps> = ({ group }) => (
  <li className={styles.row} data-pcc-rm-exception-code={group.code}>
    <div className={styles.rowHeader}>
      <span className={styles.rowTitle}>{group.codeLabel}</span>
      <PccStatusPill tone={severityTone(group.severityHighest)}>
        Severity: {group.severityHighest}
      </PccStatusPill>
      <span className={styles.chip}>
        {group.count} occurrence{group.count === 1 ? '' : 's'}
      </span>
    </div>
    <ul className={styles.list} aria-label={`${group.codeLabel} entries`}>
      {group.entries.map((entry, idx) => (
        <li
          key={`${group.code}-${idx}`}
          className={styles.row}
          data-pcc-rm-exception-entry={entry.relatedItemId ?? `${group.code}-${idx}`}
        >
          <span className={styles.rowMeta}>{entry.summary}</span>
          {entry.relatedItemId ? (
            <span className={styles.rowMeta}>Related item: {entry.relatedItemId}</span>
          ) : null}
        </li>
      ))}
    </ul>
  </li>
);

// ---------------------------------------------------------------------------
// Lane 7 — Handoffs
// ---------------------------------------------------------------------------

interface HandoffsCardProps {
  readonly handoffs: IPccRmHandoffsViewModel;
}

const HandoffsCard: FC<HandoffsCardProps> = ({ handoffs }) => (
  <PccDashboardCard footprint="wide" eyebrow="Responsibility Matrix" title="Handoffs">
    <div
      className={styles.body}
      data-pcc-readiness-section={SECTION_MARKER}
      data-pcc-rm-lane="handoffs"
    >
      {handoffs.rows.length === 0 ? (
        <PccPreviewState state="empty" description={handoffs.emptyCaption} />
      ) : (
        <ul className={styles.list} aria-label="Pending handoffs">
          {handoffs.rows.map((row) => (
            <li
              key={row.handoffId}
              className={styles.row}
              data-pcc-rm-handoff={row.handoffId}
              data-pcc-rm-handoff-accepted={row.accepted ? 'true' : 'false'}
            >
              <div className={styles.rowHeader}>
                <span className={styles.rowTitle}>
                  {row.fromDisplay} → {row.toDisplay}
                </span>
                <span className={styles.chip}>{row.statusLabel}</span>
                <span className={styles.chip}>{row.lifecycleStateLabel}</span>
                <span className={styles.chip}>Requested {row.requestedAtDisplay}</span>
              </div>
              <span className={styles.rowMeta}>Item: {row.sourceTask}</span>
              {row.reason ? <span className={styles.rowMeta}>Reason: {row.reason}</span> : null}
            </li>
          ))}
        </ul>
      )}
      <div className={styles.actionRow}>
        <button
          type="button"
          className={styles.disabledAction}
          disabled
          aria-disabled="true"
          data-pcc-rm-action="handoff-accept"
          data-pcc-rm-action-state="preview-disabled"
        >
          Accept handoff (preview only)
        </button>
        <button
          type="button"
          className={styles.disabledAction}
          disabled
          aria-disabled="true"
          data-pcc-rm-action="handoff-decline"
          data-pcc-rm-action-state="preview-disabled"
        >
          Request reassignment (preview only)
        </button>
      </div>
    </div>
  </PccDashboardCard>
);

// ---------------------------------------------------------------------------
// Lane 8 — Template / Source Mapping Admin
// ---------------------------------------------------------------------------

interface TemplateAdminCardProps {
  readonly templateAdmin: IPccRmTemplateAdminViewModel;
}

const TemplateAdminCard: FC<TemplateAdminCardProps> = ({ templateAdmin }) => (
  <PccDashboardCard
    footprint="wide"
    eyebrow="Responsibility Matrix"
    title="Template and source-mapping admin"
  >
    <div
      className={styles.body}
      data-pcc-readiness-section={SECTION_MARKER}
      data-pcc-rm-lane="template-and-admin"
    >
      <p className={styles.captionLine}>{templateAdmin.governanceCaption}</p>
      <p className={styles.captionLine}>{templateAdmin.nonExplicitMarkPolicyCaption}</p>
      {templateAdmin.templates.length === 0 ? (
        <PccPreviewState
          state="empty"
          description="No templates available in the current envelope."
        />
      ) : (
        <ul
          className={styles.list}
          aria-label="Template library"
          data-pcc-rm-admin-region="templates"
        >
          {templateAdmin.templates.map((row) => (
            <li
              key={row.templateItemId}
              className={styles.row}
              data-pcc-rm-template={row.templateItemId}
            >
              <div className={styles.rowHeader}>
                <span className={styles.rowTitle}>{row.templateItemId}</span>
                <span className={styles.chip}>v{row.templateVersion}</span>
                <span className={styles.chip}>{row.statusLabel}</span>
                <span className={styles.chip}>{row.classificationLabel}</span>
                <span className={styles.chip}>{row.domainLabel}</span>
                <span className={styles.chip}>Criticality: {row.criticalityLabel}</span>
                {row.requiresUserReview ? (
                  <span className={styles.chipReviewRequired}>Requires review</span>
                ) : null}
              </div>
              <span className={styles.rowMeta}>
                {row.sourceFile} · {row.sourceSheet} · Marks: {row.sourceMarksDisplay}
              </span>
              {row.effectiveDateDisplay ? (
                <span className={styles.rowMeta}>Effective {row.effectiveDateDisplay}</span>
              ) : null}
              {row.mappingNotes ? <span className={styles.rowMeta}>{row.mappingNotes}</span> : null}
            </li>
          ))}
        </ul>
      )}
      {templateAdmin.auditEvents.length > 0 ? (
        <ul
          className={styles.list}
          aria-label="Audit events"
          data-pcc-rm-admin-region="audit-events"
        >
          {templateAdmin.auditEvents.map((event) => (
            <li key={event.eventId} className={styles.row} data-pcc-rm-audit-event={event.eventId}>
              <div className={styles.rowHeader}>
                <span className={styles.rowTitle}>{event.eventTypeLabel}</span>
                <span className={styles.chip}>{event.occurredAtDisplay}</span>
                <span className={styles.chip}>{event.entityRef}</span>
                {event.actorDisplay ? (
                  <span className={styles.chip}>By {event.actorDisplay}</span>
                ) : null}
              </div>
              <span className={styles.rowMeta}>{event.summary}</span>
            </li>
          ))}
        </ul>
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

function healthBandTone(band: string | undefined): PccStatusPillTone {
  switch (band) {
    case 'healthy':
      return 'info';
    case 'at-risk':
      return 'warning';
    case 'blocked':
      return 'danger';
    default:
      return 'neutral';
  }
}

function severityTone(severity: string): PccStatusPillTone {
  switch (severity) {
    case 'critical':
      return 'danger';
    case 'high':
      return 'warning';
    case 'medium':
      return 'warning';
    case 'low':
    default:
      return 'neutral';
  }
}

function accountabilityKindLabel(kind: 'accountable' | 'current-action' | 'owner-role'): string {
  if (kind === 'accountable') return 'Accountable';
  if (kind === 'current-action') return 'Current action';
  return 'Owner role';
}
