/**
 * PCC Approvals / Checkpoints surface (Phase 3 / Wave 14 / Prompt 05).
 *
 * Read-only / preview-only shell for the Wave 14 approvals composite
 * read-model (`pcc/projects/{projectId}/approvals`). Renders the seven
 * read-model lanes plus deferred-posture seam cards for decision history,
 * source / evidence lineage, and HBI no-authority.
 *
 * Two render paths:
 *   - Router-supplied `readModelClient` → asynchronous fetch via
 *     `useApprovalsReadModel(...)`. Hook owns loading and error.
 *   - No client supplied → synchronous fixture envelope + adapter; the
 *     async hook is never invoked. Used by isolated previews and tests.
 *
 * Bento direct-child invariant: returns a `Fragment` of direct
 * `PccDashboardCard` children. Loading / error variants render a single
 * full-width card so the bento grid layout remains intact.
 *
 * No command execution. No backend writes. No invented decision-history
 * or evidence-link rows — those sections are deferred-posture seam cards.
 */

import { Fragment, type FC } from 'react';
import {
  PCC_MVP_SURFACES,
  SAMPLE_APPROVALS_READ_MODEL,
  type PccApprovalsReadModel,
  type PccPersona,
  type PccProjectId,
  type PccReadModelEnvelope,
} from '@hbc/models/pcc';
import { PccDashboardCard } from '../../layout/PccDashboardCard';
import { PccDisabledAffordance } from '../../ui/PccDisabledAffordance';
import { PccPreviewState, type PccPreviewStateKind } from '../../ui/PccPreviewState';
import { PccStatusPill, type PccStatusPillTone } from '../../ui/PccStatusPill';
import { pccSurfacePostureCopy } from '../../ui/pccSurfacePostureCopy';
import { PccSurfaceContextHeader } from '../shared/PccSurfaceContextHeader';
import { useApprovalsReadModel } from './useApprovalsReadModel';
import { buildPccApprovalsViewModel } from './approvalsAdapter';
import {
  type IPccApprovalsAdminVerificationViewModel,
  type IPccApprovalsDecisionHistorySeam,
  type IPccApprovalsEscalationViewModel,
  type IPccApprovalsHbiBoundary,
  type IPccApprovalsHomeViewModel,
  type IPccApprovalsLineageSeam,
  type IPccApprovalsModuleIntegrationViewModel,
  type IPccApprovalsMyApprovalsViewModel,
  type IPccApprovalsPolicyViewModel,
  type IPccApprovalsQueueViewModel,
  type IPccApprovalsReadModelClient,
  type IPccApprovalsReadyViewModel,
  type IPccApprovalsRegistryViewModel,
  type IPccApprovalsViewModel,
  type IPccApprovalsDisabledAction,
} from './approvalsViewModel';
import styles from './PccApprovalsSurface.module.css';

const SURFACE = PCC_MVP_SURFACES.approvals;
const POSTURE_LOADING = pccSurfacePostureCopy('loading');
const POSTURE_ERROR = pccSurfacePostureCopy('error');

const FIXTURE_PROJECT_ID = 'p-w14-approvals-fixture' as PccProjectId;

const FIXTURE_ENVELOPE: PccReadModelEnvelope<PccApprovalsReadModel> = {
  projectId: FIXTURE_PROJECT_ID,
  mode: 'fixture',
  sourceStatus: 'available',
  readOnly: true,
  warnings: [],
  generatedAtUtc: '2026-04-30T00:00:00.000Z',
  data: SAMPLE_APPROVALS_READ_MODEL,
};

export interface PccApprovalsSurfaceProps {
  readonly readModelClient?: IPccApprovalsReadModelClient;
  readonly projectId?: PccProjectId;
  readonly viewerPersona?: PccPersona;
}

export const PccApprovalsSurface: FC<PccApprovalsSurfaceProps> = ({
  readModelClient,
  projectId,
  viewerPersona,
}) => {
  if (readModelClient) {
    return (
      <PccApprovalsSurfaceClientPath
        readModelClient={readModelClient}
        projectId={projectId ?? FIXTURE_PROJECT_ID}
        viewerPersona={viewerPersona}
      />
    );
  }
  const vm = buildPccApprovalsViewModel(FIXTURE_ENVELOPE);
  return <PccApprovalsSurfaceLanes viewModel={vm} />;
};

interface PccApprovalsSurfaceClientPathProps {
  readonly readModelClient: IPccApprovalsReadModelClient;
  readonly projectId: PccProjectId;
  readonly viewerPersona?: PccPersona;
}

const PccApprovalsSurfaceClientPath: FC<PccApprovalsSurfaceClientPathProps> = ({
  readModelClient,
  projectId,
  viewerPersona,
}) => {
  const vm = useApprovalsReadModel(readModelClient, projectId, viewerPersona);
  return <PccApprovalsSurfaceLanes viewModel={vm} />;
};

// ---------------------------------------------------------------------------
// Lane orchestrator
// ---------------------------------------------------------------------------

interface PccApprovalsSurfaceLanesProps {
  readonly viewModel: IPccApprovalsViewModel;
}

const PccApprovalsSurfaceLanes: FC<PccApprovalsSurfaceLanesProps> = ({ viewModel }) => {
  if (viewModel.status === 'loading') {
    return (
      <PccDashboardCard
        footprint="full"
        tier="state"
        region="state"
        headingLevel={2}
        eyebrow={SURFACE.displayName}
        title="Approvals & Checkpoints"
      >
        <div
          className={styles.body}
          data-pcc-readiness-section="approvals"
          data-pcc-approvals-lane="home"
        >
          <PccSurfaceContextHeader
            surfaceId="approvals"
            projectLabel="Project 26-000-00 · Approvals and Checkpoints"
            postureLabel={POSTURE_LOADING.postureLabel}
            sourceStatusLabel={POSTURE_LOADING.sourceStatusLabel}
            sourceConfidenceLabel={POSTURE_LOADING.sourceConfidenceLabel}
            lastUpdatedLabel={POSTURE_LOADING.lastUpdatedLabel}
          />
          <PccPreviewState state="loading" />
        </div>
      </PccDashboardCard>
    );
  }
  if (viewModel.status === 'error') {
    return (
      <PccDashboardCard
        footprint="full"
        tier="state"
        region="state"
        headingLevel={2}
        eyebrow={SURFACE.displayName}
        title="Approvals & Checkpoints"
      >
        <div
          className={styles.body}
          data-pcc-readiness-section="approvals"
          data-pcc-approvals-lane="home"
        >
          <PccSurfaceContextHeader
            surfaceId="approvals"
            projectLabel="Project 26-000-00 · Approvals and Checkpoints"
            postureLabel={POSTURE_ERROR.postureLabel}
            sourceStatusLabel={POSTURE_ERROR.sourceStatusLabel}
            sourceConfidenceLabel={POSTURE_ERROR.sourceConfidenceLabel}
            lastUpdatedLabel={POSTURE_ERROR.lastUpdatedLabel}
          />
          <PccPreviewState state="error" />
        </div>
      </PccDashboardCard>
    );
  }
  return <ReadyLanes viewModel={viewModel} />;
};

// ---------------------------------------------------------------------------
// Ready render — Fragment of direct PccDashboardCard children
// ---------------------------------------------------------------------------

interface ReadyLanesProps {
  readonly viewModel: IPccApprovalsReadyViewModel;
}

const ReadyLanes: FC<ReadyLanesProps> = ({ viewModel }) => {
  const isAvailable = viewModel.cardState === 'preview';
  return (
    <Fragment>
      <QueueCard
        queue={viewModel.queue}
        cardState={viewModel.cardState}
        isAvailable={isAvailable}
        disabledActions={viewModel.disabledActions}
        home={viewModel.home}
      />
      <MyApprovalsCard
        myApprovals={viewModel.myApprovals}
        cardState={viewModel.cardState}
        isAvailable={isAvailable}
        disabledActions={viewModel.disabledActions}
      />
      <RegistryCard
        registry={viewModel.registry}
        cardState={viewModel.cardState}
        isAvailable={isAvailable}
      />
      <EscalationCard
        escalation={viewModel.escalation}
        cardState={viewModel.cardState}
        isAvailable={isAvailable}
        disabledActions={viewModel.disabledActions}
      />
      <AdminVerificationCard
        adminVerification={viewModel.adminVerification}
        cardState={viewModel.cardState}
        isAvailable={isAvailable}
        disabledActions={viewModel.disabledActions}
      />
      <PolicyCard
        policy={viewModel.policy}
        cardState={viewModel.cardState}
        isAvailable={isAvailable}
      />
      <ModuleIntegrationCard
        moduleIntegration={viewModel.moduleIntegration}
        cardState={viewModel.cardState}
        isAvailable={isAvailable}
      />
      <DecisionHistorySeamCard
        seam={viewModel.decisionHistorySeam}
        disabledActions={viewModel.disabledActions}
      />
      <LineageSeamCard seam={viewModel.lineageSeam} />
      <HbiBoundaryCard hbi={viewModel.hbiBoundary} />
    </Fragment>
  );
};

// ---------------------------------------------------------------------------
// Shared helpers
// ---------------------------------------------------------------------------

function stateToTone(state: string): PccStatusPillTone {
  switch (state) {
    case 'approved':
    case 'execution-pending':
      return 'success';
    case 'rejected-returned':
    case 'cancelled':
    case 'expired':
      return 'danger';
    case 'escalated':
    case 'overridden':
      return 'warning';
    case 'waived':
    case 'deferred':
    case 'manually-closed':
    case 'superseded':
    case 'archived':
      return 'neutral';
    case 'requested':
    case 'pending-review':
    case 'in-review':
    case 'revision-requested':
    case 'draft':
    default:
      return 'info';
  }
}

function priorityToTone(label: string): PccStatusPillTone {
  switch (label) {
    case 'Urgent':
      return 'danger';
    case 'High':
      return 'warning';
    case 'Low':
      return 'neutral';
    case 'Normal':
    default:
      return 'info';
  }
}

interface DegradedNoticeProps {
  readonly cardState: PccPreviewStateKind;
}

const DegradedNotice: FC<DegradedNoticeProps> = ({ cardState }) => (
  <PccPreviewState state={cardState} />
);

interface DisabledActionsRowProps {
  readonly actions: readonly IPccApprovalsDisabledAction[];
}

const DisabledActionsRow: FC<DisabledActionsRowProps> = ({ actions }) => (
  <ul className={styles.actionRow} data-pcc-approvals-action-list="">
    {actions.map((action) => (
      <li
        key={action.key}
        className={styles.actionRowItem}
        data-pcc-approvals-action-key={action.key}
        data-pcc-approvals-action-reason={action.key}
      >
        <PccDisabledAffordance label={action.label} reason={action.reason} />
      </li>
    ))}
  </ul>
);

// ---------------------------------------------------------------------------
// Lane cards
// ---------------------------------------------------------------------------

// Wave 15A wave-b9 Prompt 4B-05 — `HomeCard` was removed because the
// shell hero already carries selected-tab identity, posture, and
// governance microcopy after Prompts 4B-01 / 4B-02 / 4B-03. Its
// metric pills (`Total / Pending or active / Terminal / Escalated`)
// were ABSORBED into `QueueCard` body via the `home` prop, gated on
// `isAvailable === true`. The per-state and per-mode subsections that
// HomeCard rendered (`home.stateCounts` / `home.modeCounts`) were
// intentionally not absorbed into QueueCard at this pass — they were
// secondary detail below operational density and were dominated by the
// queue list itself which already orders rows by state and priority.
// The source data (`home.stateCounts`, `home.modeCounts`) stays
// populated in `IPccApprovalsHomeViewModel` and the adapter so a future
// dedicated `Approval activity` summary card can reintroduce them
// without an adapter change. (`approvalsAdapter.test.ts` continues to
// assert the home-VM shape green and unchanged.)

interface QueueCardProps {
  readonly queue: IPccApprovalsQueueViewModel;
  readonly cardState: PccPreviewStateKind;
  readonly isAvailable: boolean;
  readonly disabledActions: readonly IPccApprovalsDisabledAction[];
  /**
   * Wave 15A wave-b9 Prompt 4B-05 — Approvals home metric pills (Total /
   * Pending or active / Terminal / Escalated) absorbed into Approval queue
   * after the duplicate `Approvals home` first card was removed. Rendered
   * as a compact summary row at the top of the queue body, gated on
   * `isAvailable === true` so degraded source-unavailable / loading /
   * error branches still show the canonical `DegradedNotice`.
   */
  readonly home: IPccApprovalsHomeViewModel;
}

const QueueCard: FC<QueueCardProps> = ({
  queue,
  cardState,
  isAvailable,
  disabledActions,
  home,
}) => (
  <PccDashboardCard
    footprint="wide"
    tier="tier2"
    region="operational"
    eyebrow="Queue"
    title="Approval queue"
  >
    <div
      className={styles.body}
      data-pcc-readiness-section="approvals"
      data-pcc-approvals-lane="queue"
    >
      {!isAvailable ? (
        <DegradedNotice cardState={cardState} />
      ) : (
        <Fragment>
          {/* Wave 15A wave-b9 Prompt 4B-05 — absorbed Approvals home
              metric pills. Compact summary above the queue list; uses the
              same metricRow / PccStatusPill primitives the prior HomeCard
              used so the visual posture is preserved. */}
          <div className={styles.metricRow} data-pcc-approvals-queue-metrics="">
            <PccStatusPill tone="info">
              <span data-pcc-approvals-queue-metric="total">Total: {home.totalRequests}</span>
            </PccStatusPill>
            <PccStatusPill tone="warning">
              <span data-pcc-approvals-queue-metric="pending">
                Pending or active: {home.pendingActiveCount}
              </span>
            </PccStatusPill>
            <PccStatusPill tone="neutral">
              <span data-pcc-approvals-queue-metric="terminal">Terminal: {home.terminalCount}</span>
            </PccStatusPill>
            <PccStatusPill tone="warning">
              <span data-pcc-approvals-queue-metric="escalated">
                Escalated: {home.escalatedCount}
              </span>
            </PccStatusPill>
          </div>
          {queue.rows.length === 0 ? (
            <PccPreviewState state="empty" />
          ) : (
            <ul className={styles.rowList} data-pcc-approvals-row-list="queue">
              {queue.rows.map((row) => (
                <li
                  key={row.approvalRequestId}
                  className={styles.row}
                  data-pcc-approvals-row={row.approvalRequestId}
                >
                  <div className={styles.rowTitle}>{row.title}</div>
                  <div className={styles.rowMeta}>
                    <PccStatusPill tone={stateToTone(row.state)}>{row.state}</PccStatusPill>
                    <PccStatusPill tone={priorityToTone(row.priorityLabel)}>
                      {row.priorityLabel}
                    </PccStatusPill>
                    <span className={styles.rowMetaItem}>{row.assignedRoleLabel}</span>
                    <span className={styles.rowMetaItem}>{row.createdAtDisplay}</span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Fragment>
      )}
      <DisabledActionsRow
        actions={disabledActions.filter((a) =>
          ['approve', 'reject', 'waive', 'override', 'defer'].includes(a.key),
        )}
      />
    </div>
  </PccDashboardCard>
);

interface MyApprovalsCardProps {
  readonly myApprovals: IPccApprovalsMyApprovalsViewModel;
  readonly cardState: PccPreviewStateKind;
  readonly isAvailable: boolean;
  readonly disabledActions: readonly IPccApprovalsDisabledAction[];
}

const MyApprovalsCard: FC<MyApprovalsCardProps> = ({
  myApprovals,
  cardState,
  isAvailable,
  disabledActions,
}) => (
  <PccDashboardCard
    footprint="wide"
    tier="tier2"
    region="operational"
    eyebrow="Mine"
    title="My approvals"
  >
    <div
      className={styles.body}
      data-pcc-readiness-section="approvals"
      data-pcc-approvals-lane="my-approvals"
    >
      {!isAvailable ? (
        <DegradedNotice cardState={cardState} />
      ) : (
        <Fragment>
          <p className={styles.captionLine}>
            Viewer role: <strong>{myApprovals.viewerRoleLabel}</strong>
          </p>
          {myApprovals.rows.length === 0 ? (
            <PccPreviewState state="empty" />
          ) : (
            <ul className={styles.rowList} data-pcc-approvals-row-list="my-approvals">
              {myApprovals.rows.map((row) => (
                <li
                  key={row.approvalRequestId}
                  className={styles.row}
                  data-pcc-approvals-row={row.approvalRequestId}
                >
                  <div className={styles.rowTitle}>{row.title}</div>
                  <div className={styles.rowMeta}>
                    <PccStatusPill tone={stateToTone(row.state)}>{row.state}</PccStatusPill>
                    <PccStatusPill tone={priorityToTone(row.priorityLabel)}>
                      {row.priorityLabel}
                    </PccStatusPill>
                    <span className={styles.rowMetaItem}>{row.createdAtDisplay}</span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Fragment>
      )}
      <DisabledActionsRow
        actions={disabledActions.filter((a) => a.key === 'approve' || a.key === 'open-detail')}
      />
    </div>
  </PccDashboardCard>
);

interface RegistryCardProps {
  readonly registry: IPccApprovalsRegistryViewModel;
  readonly cardState: PccPreviewStateKind;
  readonly isAvailable: boolean;
}

const RegistryCard: FC<RegistryCardProps> = ({ registry, cardState, isAvailable }) => (
  <PccDashboardCard
    footprint="wide"
    tier="tier2"
    region="detail"
    eyebrow="Registry"
    title="Checkpoint registry"
  >
    <div
      className={styles.body}
      data-pcc-readiness-section="approvals"
      data-pcc-approvals-lane="registry"
    >
      {!isAvailable ? (
        <DegradedNotice cardState={cardState} />
      ) : (
        <Fragment>
          <div className={styles.metricRow}>
            <PccStatusPill tone="info">Definitions: {registry.definitionCount}</PccStatusPill>
            <PccStatusPill tone="info">Instances: {registry.instanceCount}</PccStatusPill>
          </div>
          <div className={styles.subSection}>
            <h4 className={styles.subSectionTitle}>Definitions</h4>
            {registry.definitionRows.length === 0 ? (
              <PccPreviewState state="empty" />
            ) : (
              <ul className={styles.rowList} data-pcc-approvals-row-list="registry-definitions">
                {registry.definitionRows.map((row) => (
                  <li
                    key={row.definitionId}
                    className={styles.row}
                    data-pcc-approvals-registry-definition-row={row.definitionId}
                  >
                    <div className={styles.rowTitle}>{row.kind}</div>
                    <div className={styles.rowMeta}>
                      <span className={styles.rowMetaItem}>Source: {row.sourceModule}</span>
                      <span className={styles.rowMetaItem}>Owner: {row.ownerRole}</span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div className={styles.subSection}>
            <h4 className={styles.subSectionTitle}>Instances</h4>
            {registry.instanceRows.length === 0 ? (
              <PccPreviewState state="empty" />
            ) : (
              <ul className={styles.rowList} data-pcc-approvals-row-list="registry-instances">
                {registry.instanceRows.map((row) => (
                  <li
                    key={row.instanceId}
                    className={styles.row}
                    data-pcc-approvals-registry-instance-row={row.instanceId}
                  >
                    <div className={styles.rowMeta}>
                      <PccStatusPill tone={stateToTone(row.state)}>{row.state}</PccStatusPill>
                      <span className={styles.rowMetaItem}>Source: {row.sourceModule}</span>
                      <span className={styles.rowMetaItem}>{row.createdAtDisplay}</span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </Fragment>
      )}
    </div>
  </PccDashboardCard>
);

interface EscalationCardProps {
  readonly escalation: IPccApprovalsEscalationViewModel;
  readonly cardState: PccPreviewStateKind;
  readonly isAvailable: boolean;
  readonly disabledActions: readonly IPccApprovalsDisabledAction[];
}

const EscalationCard: FC<EscalationCardProps> = ({
  escalation,
  cardState,
  isAvailable,
  disabledActions,
}) => (
  <PccDashboardCard
    footprint="wide"
    tier="tier2"
    region="operational"
    eyebrow="Escalation"
    title="Escalation queue"
  >
    <div
      className={styles.body}
      data-pcc-readiness-section="approvals"
      data-pcc-approvals-lane="escalation"
    >
      {!isAvailable ? (
        <DegradedNotice cardState={cardState} />
      ) : escalation.rows.length === 0 ? (
        <PccPreviewState state="empty" />
      ) : (
        <ul className={styles.rowList} data-pcc-approvals-row-list="escalation">
          {escalation.rows.map((row) => (
            <li
              key={row.approvalRequestId}
              className={styles.row}
              data-pcc-approvals-row={row.approvalRequestId}
            >
              <div className={styles.rowTitle}>{row.title}</div>
              <div className={styles.rowMeta}>
                <PccStatusPill tone={stateToTone(row.state)}>{row.state}</PccStatusPill>
                <span className={styles.rowMetaItem}>Reason: {row.escalationReason}</span>
                <span className={styles.rowMetaItem}>Target: {row.escalationTargetRoleLabel}</span>
                <span className={styles.rowMetaItem}>{row.createdAtDisplay}</span>
              </div>
            </li>
          ))}
        </ul>
      )}
      <DisabledActionsRow actions={disabledActions.filter((a) => a.key === 'escalate')} />
    </div>
  </PccDashboardCard>
);

interface AdminVerificationCardProps {
  readonly adminVerification: IPccApprovalsAdminVerificationViewModel;
  readonly cardState: PccPreviewStateKind;
  readonly isAvailable: boolean;
  readonly disabledActions: readonly IPccApprovalsDisabledAction[];
}

const AdminVerificationCard: FC<AdminVerificationCardProps> = ({
  adminVerification,
  cardState,
  isAvailable,
  disabledActions,
}) => (
  <PccDashboardCard
    footprint="wide"
    tier="tier2"
    region="operational"
    eyebrow="Admin verify"
    title="Admin verification queue"
  >
    <div
      className={styles.body}
      data-pcc-readiness-section="approvals"
      data-pcc-approvals-lane="admin-verification"
    >
      {!isAvailable ? (
        <DegradedNotice cardState={cardState} />
      ) : adminVerification.rows.length === 0 ? (
        <PccPreviewState state="empty" />
      ) : (
        <ul className={styles.rowList} data-pcc-approvals-row-list="admin-verification">
          {adminVerification.rows.map((row) => (
            <li
              key={row.approvalRequestId}
              className={styles.row}
              data-pcc-approvals-row={row.approvalRequestId}
            >
              <div className={styles.rowTitle}>{row.title}</div>
              <div className={styles.rowMeta}>
                <PccStatusPill tone={stateToTone(row.state)}>{row.state}</PccStatusPill>
                <span className={styles.rowMetaItem}>Kind: {row.verificationKind}</span>
                <span className={styles.rowMetaItem}>{row.createdAtDisplay}</span>
              </div>
            </li>
          ))}
        </ul>
      )}
      <DisabledActionsRow
        actions={disabledActions.filter(
          (a) => a.key === 'manual-close' || a.key === 'cancel' || a.key === 'supersede',
        )}
      />
    </div>
  </PccDashboardCard>
);

interface PolicyCardProps {
  readonly policy: IPccApprovalsPolicyViewModel;
  readonly cardState: PccPreviewStateKind;
  readonly isAvailable: boolean;
}

const PolicyCard: FC<PolicyCardProps> = ({ policy, cardState, isAvailable }) => (
  <PccDashboardCard
    footprint="standard"
    tier="tier3"
    region="reference"
    eyebrow="Policy"
    title="Approval policy summary"
  >
    <div
      className={styles.body}
      data-pcc-readiness-section="approvals"
      data-pcc-approvals-lane="policy"
    >
      {!isAvailable ? (
        <DegradedNotice cardState={cardState} />
      ) : (
        <Fragment>
          <div className={styles.metricRow}>
            <PccStatusPill tone="info">Policies: {policy.policyCount}</PccStatusPill>
            <PccStatusPill tone="info">Versions: {policy.versionCount}</PccStatusPill>
          </div>
          {policy.rows.length === 0 ? (
            <PccPreviewState state="empty" />
          ) : (
            <ul className={styles.rowList} data-pcc-approvals-row-list="policy">
              {policy.rows.map((row) => (
                <li
                  key={row.policyId}
                  className={styles.row}
                  data-pcc-approvals-policy-row={row.policyId}
                >
                  <div className={styles.rowTitle}>{row.displayName}</div>
                  <div className={styles.rowMeta}>
                    <span className={styles.rowMetaItem}>Versions: {row.versionCount}</span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Fragment>
      )}
    </div>
  </PccDashboardCard>
);

interface ModuleIntegrationCardProps {
  readonly moduleIntegration: IPccApprovalsModuleIntegrationViewModel;
  readonly cardState: PccPreviewStateKind;
  readonly isAvailable: boolean;
}

const ModuleIntegrationCard: FC<ModuleIntegrationCardProps> = ({
  moduleIntegration,
  cardState,
  isAvailable,
}) => (
  <PccDashboardCard
    footprint="standard"
    tier="tier3"
    region="reference"
    eyebrow="Modules"
    title="Source-module integration"
  >
    <div
      className={styles.body}
      data-pcc-readiness-section="approvals"
      data-pcc-approvals-lane="module-integration"
    >
      {!isAvailable ? (
        <DegradedNotice cardState={cardState} />
      ) : (
        <ul className={styles.rowList} data-pcc-approvals-row-list="module-integration">
          {moduleIntegration.rows.map((row) => (
            <li
              key={row.sourceModule}
              className={styles.row}
              data-pcc-approvals-module-row={row.sourceModule}
            >
              <div className={styles.rowTitle}>{row.sourceModule}</div>
              <div className={styles.rowMeta}>
                <PccStatusPill tone={row.count > 0 ? 'info' : 'neutral'}>
                  Checkpoints: {row.count}
                </PccStatusPill>
              </div>
              <p
                className={styles.captionLine}
                data-pcc-approvals-module-ownership-posture={row.sourceModule}
              >
                {row.ownershipPosture}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  </PccDashboardCard>
);

interface DecisionHistorySeamCardProps {
  readonly seam: IPccApprovalsDecisionHistorySeam;
  readonly disabledActions: readonly IPccApprovalsDisabledAction[];
}

const DecisionHistorySeamCard: FC<DecisionHistorySeamCardProps> = ({ seam, disabledActions }) => (
  <PccDashboardCard
    footprint="standard"
    tier="tier3"
    region="deferred"
    eyebrow="Deferred"
    title={seam.title}
  >
    <div
      className={styles.body}
      data-pcc-readiness-section="approvals"
      data-pcc-approvals-lane="decision-history"
      data-pcc-approvals-seam-posture="deferred"
    >
      <PccPreviewState
        state="not-yet-implemented-operation"
        title={seam.title}
        description={seam.description}
      />
      <p className={styles.captionLine}>{seam.deferredReason}</p>
      <DisabledActionsRow actions={disabledActions.filter((a) => a.key === 'open-detail')} />
    </div>
  </PccDashboardCard>
);

interface LineageSeamCardProps {
  readonly seam: IPccApprovalsLineageSeam;
}

const LineageSeamCard: FC<LineageSeamCardProps> = ({ seam }) => (
  <PccDashboardCard
    footprint="standard"
    tier="tier3"
    region="deferred"
    eyebrow="Deferred"
    title={seam.title}
  >
    <div
      className={styles.body}
      data-pcc-readiness-section="approvals"
      data-pcc-approvals-lane="lineage"
      data-pcc-approvals-seam-posture="deferred"
    >
      <PccPreviewState
        state="not-yet-implemented-operation"
        title={seam.title}
        description={seam.description}
      />
      <p className={styles.captionLine}>{seam.deferredReason}</p>
      <div className={styles.metricRow}>
        <PccStatusPill tone="info">
          Registry definitions: {seam.registryDefinitionCount}
        </PccStatusPill>
        <PccStatusPill tone="info">Registry instances: {seam.registryInstanceCount}</PccStatusPill>
      </div>
      <ul className={styles.rowList} data-pcc-approvals-row-list="lineage-source-modules">
        {seam.sourceModuleSummaryRows.map((row) => (
          <li
            key={row.sourceModule}
            className={styles.row}
            data-pcc-approvals-lineage-module-row={row.sourceModule}
          >
            <div className={styles.rowMeta}>
              <span className={styles.rowMetaItem}>{row.sourceModule}</span>
              <PccStatusPill tone={row.count > 0 ? 'info' : 'neutral'}>{row.count}</PccStatusPill>
            </div>
          </li>
        ))}
      </ul>
    </div>
  </PccDashboardCard>
);

interface HbiBoundaryCardProps {
  readonly hbi: IPccApprovalsHbiBoundary;
}

const HbiBoundaryCard: FC<HbiBoundaryCardProps> = ({ hbi }) => (
  <PccDashboardCard
    footprint="standard"
    tier="tier3"
    region="reference"
    eyebrow="HBI"
    title={hbi.title}
  >
    <div
      className={styles.body}
      data-pcc-readiness-section="approvals"
      data-pcc-approvals-lane="hbi-boundary"
    >
      <p className={styles.captionLine} data-pcc-approvals-hbi-summary="">
        {hbi.summary}
      </p>
      <div className={styles.subSection}>
        <h4 className={styles.subSectionTitle}>HBI may</h4>
        <ul className={styles.bulletList} data-pcc-approvals-hbi-may="">
          {hbi.may.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </div>
      <div className={styles.subSection}>
        <h4 className={styles.subSectionTitle}>HBI may not</h4>
        <ul className={styles.bulletList} data-pcc-approvals-hbi-may-not="">
          {hbi.mayNot.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </div>
    </div>
  </PccDashboardCard>
);

export default PccApprovalsSurface;
