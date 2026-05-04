/**
 * Project Readiness Center surface (Phase 3 / Wave 8 / Prompts 05 + 06).
 *
 * Eight-region framework shell rendered as a Fragment of direct
 * `PccDashboardCard` children so each card stays a direct child of
 * `<PccBentoGrid>` (provided by `PccShell`). Exactly one card carries
 * `data-pcc-active-surface-panel="project-readiness"` (the hero).
 *
 * - When a `readModelClient` is supplied, an inline `ReadModelContent`
 *   child calls `useProjectReadinessReadModel(client, projectId)`
 *   unconditionally and renders the six regions from the resolved view
 *   model. During the initial loading microtask, the view model is
 *   undefined and the fixture snapshot is used as the visual baseline.
 * - When no client is supplied, the same six-region shell is rendered
 *   from `SAMPLE_PROJECT_READINESS_FRAMEWORK_READ_MODEL` directly via
 *   the pure adapter — no fetch, no client, no async.
 *
 * All affordances are inert: disabled buttons or display-only chips.
 * No `onClick` handlers for workflow-like actions. Read-only/no-execution
 * copy is rendered in the hero.
 */

import { Fragment, useEffect, useState, type FC } from 'react';
import {
  PCC_MVP_SURFACES,
  PERMIT_INSPECTION_CONTROL_CENTER_FIXTURE,
  SAMPLE_BUYOUT_LOG_READ_MODEL,
  SAMPLE_CONSTRAINTS_LOG_READ_MODEL,
  SAMPLE_LIFECYCLE_READINESS_READ_MODEL,
  SAMPLE_PROJECT_PROFILE,
  SAMPLE_PROJECT_READINESS_FRAMEWORK_READ_MODEL,
  SAMPLE_RESPONSIBILITY_MATRIX_READ_MODEL,
} from '@hbc/models/pcc';
import type {
  PccBuyoutLogReadModel,
  PccConstraintsLogReadModel,
  PccLifecycleReadinessReadModel,
  PccPermitInspectionControlCenterReadModel,
  PccProjectId,
  PccProjectReadinessFrameworkReadModel,
  PccReadModelEnvelope,
  PccResponsibilityMatrixReadModel,
} from '@hbc/models/pcc';
import { PccPermitInspectionControlCenterRegions } from './PccPermitInspectionControlCenterRegions';
import {
  buildPermitInspectionControlCenterViewModel,
  type IPccPermitInspectionControlCenterReadModelClient,
} from './permitInspectionControlCenterViewModel';
import { usePermitInspectionControlCenterReadModel } from './usePermitInspectionControlCenterReadModel';
import { PccResponsibilityMatrixRegions } from '../responsibilityMatrix/PccResponsibilityMatrixRegions';
import { buildPccResponsibilityMatrixViewModel } from '../responsibilityMatrix/responsibilityMatrixAdapter';
import { useResponsibilityMatrixReadModel } from '../responsibilityMatrix/useResponsibilityMatrixReadModel';
import type {
  IPccResponsibilityMatrixReadModelClient,
  IPccResponsibilityMatrixViewModel,
} from '../responsibilityMatrix/responsibilityMatrixViewModel';
import { PccConstraintsLogRegions } from '../constraintsLog/PccConstraintsLogRegions';
import { buildPccConstraintsLogViewModel } from '../constraintsLog/constraintsLogAdapter';
import { useConstraintsLogReadModel } from '../constraintsLog/useConstraintsLogReadModel';
import type {
  IPccConstraintsLogReadModelClient,
  IPccConstraintsLogViewModel,
} from '../constraintsLog/constraintsLogViewModel';
import { PccBuyoutLogRegions } from '../buyoutLog/PccBuyoutLogRegions';
import { buildPccBuyoutLogViewModel } from '../buyoutLog/buyoutLogAdapter';
import { useBuyoutLogReadModel } from '../buyoutLog/useBuyoutLogReadModel';
import type {
  IPccBuyoutLogReadModelClient,
  IPccBuyoutLogViewModel,
} from '../buyoutLog/buyoutLogViewModel';
import { PccProjectReadinessUnifiedLifecycleSection } from './PccProjectReadinessUnifiedLifecycleSection';
import { PccDashboardCard } from '../../layout/PccDashboardCard';
import { PccPreviewState } from '../../ui/PccPreviewState';
import { PccStatusPill } from '../../ui/PccStatusPill';
import { buildPccLifecycleReadinessViewModel } from './lifecycleReadinessAdapter';
import type {
  IPccLifecycleBlockersViewModel,
  IPccLifecycleEvidenceViewModel,
  IPccLifecycleFamilyDomainsViewModel,
  IPccLifecycleFutureCloseoutViewModel,
  IPccLifecycleItemDetailViewModel,
  IPccLifecycleMapViewModel,
  IPccLifecycleMyActionsViewModel,
  IPccLifecycleReadinessHeroViewModel,
  IPccLifecycleReadinessSignalsViewModel,
  IPccLifecycleReadinessViewModel,
  IPccLifecycleSourceTraceabilityViewModel,
  PccLifecycleReadinessSignalKind,
} from './lifecycleReadinessViewModel';
import type { PccCardState } from '../projectHome/shared';
import { buildPccProjectReadinessViewModel } from './projectReadinessAdapter';
import type {
  IPccProjectReadinessReadModelClient,
  IPccProjectReadinessViewModel,
  IPccReadinessBlockerItemViewModel,
  IPccReadinessDomainViewModel,
  IPccReadinessDownstreamModuleViewModel,
  IPccReadinessEvidenceViewModel,
  IPccReadinessGateViewModel,
  IPccReadinessHeroViewModel,
  IPccReadinessOwnershipAccountabilityViewModel,
  IPccReadinessPriorityActionsPreviewViewModel,
  ProjectReadinessRiskTag,
} from './projectReadinessViewModel';
import styles from './PccProjectReadinessSurface.module.css';

interface PccProjectReadinessSurfaceProps {
  readonly readModelClient?: IPccProjectReadinessReadModelClient &
    IPccPermitInspectionControlCenterReadModelClient &
    IPccResponsibilityMatrixReadModelClient &
    IPccConstraintsLogReadModelClient &
    IPccBuyoutLogReadModelClient;
}

const FIXTURE_ENVELOPE: PccReadModelEnvelope<PccProjectReadinessFrameworkReadModel> = {
  projectId: SAMPLE_PROJECT_PROFILE.projectId,
  mode: 'fixture',
  sourceStatus: 'available',
  readOnly: true,
  warnings: [],
  generatedAtUtc: '2026-04-30T00:00:00.000Z',
  data: SAMPLE_PROJECT_READINESS_FRAMEWORK_READ_MODEL,
};

const FIXTURE_VIEW_MODEL = buildPccProjectReadinessViewModel(FIXTURE_ENVELOPE);

const FIXTURE_LIFECYCLE_ENVELOPE: PccReadModelEnvelope<PccLifecycleReadinessReadModel> = {
  projectId: SAMPLE_PROJECT_PROFILE.projectId,
  mode: 'fixture',
  sourceStatus: 'available',
  readOnly: true,
  warnings: [],
  generatedAtUtc: '2026-04-30T00:00:00.000Z',
  data: SAMPLE_LIFECYCLE_READINESS_READ_MODEL,
};

const FIXTURE_LIFECYCLE_VIEW_MODEL = buildPccLifecycleReadinessViewModel(
  FIXTURE_LIFECYCLE_ENVELOPE,
);

const FIXTURE_PERMIT_INSPECTION_ENVELOPE: PccReadModelEnvelope<PccPermitInspectionControlCenterReadModel> =
  {
    projectId: SAMPLE_PROJECT_PROFILE.projectId,
    mode: 'fixture',
    sourceStatus: 'available',
    readOnly: true,
    warnings: [],
    generatedAtUtc: '2026-04-30T00:00:00.000Z',
    data: PERMIT_INSPECTION_CONTROL_CENTER_FIXTURE,
  };

const FIXTURE_PERMIT_INSPECTION_VIEW_MODEL = buildPermitInspectionControlCenterViewModel(
  FIXTURE_PERMIT_INSPECTION_ENVELOPE,
);

const FIXTURE_RESPONSIBILITY_MATRIX_ENVELOPE: PccReadModelEnvelope<PccResponsibilityMatrixReadModel> =
  {
    projectId: SAMPLE_PROJECT_PROFILE.projectId,
    mode: 'fixture',
    sourceStatus: 'available',
    readOnly: true,
    warnings: [],
    generatedAtUtc: '2026-04-30T00:00:00.000Z',
    data: SAMPLE_RESPONSIBILITY_MATRIX_READ_MODEL,
  };

const FIXTURE_RESPONSIBILITY_MATRIX_VIEW_MODEL: IPccResponsibilityMatrixViewModel =
  buildPccResponsibilityMatrixViewModel(FIXTURE_RESPONSIBILITY_MATRIX_ENVELOPE);

const FIXTURE_CONSTRAINTS_LOG_ENVELOPE: PccReadModelEnvelope<PccConstraintsLogReadModel> = {
  projectId: SAMPLE_PROJECT_PROFILE.projectId,
  mode: 'fixture',
  sourceStatus: 'available',
  readOnly: true,
  warnings: [],
  generatedAtUtc: '2026-04-30T00:00:00.000Z',
  data: SAMPLE_CONSTRAINTS_LOG_READ_MODEL,
};

const FIXTURE_CONSTRAINTS_LOG_VIEW_MODEL: IPccConstraintsLogViewModel =
  buildPccConstraintsLogViewModel(FIXTURE_CONSTRAINTS_LOG_ENVELOPE);

const FIXTURE_BUYOUT_LOG_ENVELOPE: PccReadModelEnvelope<PccBuyoutLogReadModel> = {
  projectId: SAMPLE_PROJECT_PROFILE.projectId,
  mode: 'fixture',
  sourceStatus: 'available',
  readOnly: true,
  warnings: [],
  generatedAtUtc: '2026-04-30T00:00:00.000Z',
  data: SAMPLE_BUYOUT_LOG_READ_MODEL,
};

const FIXTURE_BUYOUT_LOG_VIEW_MODEL: IPccBuyoutLogViewModel = buildPccBuyoutLogViewModel(
  FIXTURE_BUYOUT_LOG_ENVELOPE,
);

const LIFECYCLE_SECTION_MARKER = 'lifecycle-readiness-center';

export const PccProjectReadinessSurface: FC<PccProjectReadinessSurfaceProps> = ({
  readModelClient,
}) => {
  if (readModelClient) {
    return <ReadModelContent client={readModelClient} />;
  }
  return (
    <Fragment>
      <ReadinessRegions viewModel={FIXTURE_VIEW_MODEL} />
      <LifecycleReadinessRegions viewModel={FIXTURE_LIFECYCLE_VIEW_MODEL} />
      <PccPermitInspectionControlCenterRegions viewModel={FIXTURE_PERMIT_INSPECTION_VIEW_MODEL} />
      <PccResponsibilityMatrixRegions viewModel={FIXTURE_RESPONSIBILITY_MATRIX_VIEW_MODEL} />
      <PccConstraintsLogRegions viewModel={FIXTURE_CONSTRAINTS_LOG_VIEW_MODEL} />
      <PccBuyoutLogRegions viewModel={FIXTURE_BUYOUT_LOG_VIEW_MODEL} />
    </Fragment>
  );
};

export default PccProjectReadinessSurface;

// ─────────────────────────────────────────────────────────────────────
// Read-model-driven path
// ─────────────────────────────────────────────────────────────────────

interface ReadModelContentProps {
  readonly client: IPccProjectReadinessReadModelClient &
    IPccPermitInspectionControlCenterReadModelClient &
    IPccResponsibilityMatrixReadModelClient &
    IPccConstraintsLogReadModelClient &
    IPccBuyoutLogReadModelClient;
}

const ReadModelContent: FC<ReadModelContentProps> = ({ client }) => {
  const viewModel = useProjectReadinessReadModel(client, SAMPLE_PROJECT_PROFILE.projectId);
  const lifecycleViewModel = useLifecycleReadinessReadModel(
    client,
    SAMPLE_PROJECT_PROFILE.projectId,
  );
  const permitInspectionViewModel = usePermitInspectionControlCenterReadModel(
    client,
    SAMPLE_PROJECT_PROFILE.projectId,
  );
  const responsibilityMatrixViewModel = useResponsibilityMatrixReadModel(
    client,
    SAMPLE_PROJECT_PROFILE.projectId,
  );
  const constraintsLogViewModel = useConstraintsLogReadModel(
    client,
    SAMPLE_PROJECT_PROFILE.projectId,
  );
  const buyoutLogViewModel = useBuyoutLogReadModel(client, SAMPLE_PROJECT_PROFILE.projectId);
  return (
    <Fragment>
      <ReadinessRegions viewModel={viewModel} />
      <LifecycleReadinessRegions viewModel={lifecycleViewModel} />
      <PccPermitInspectionControlCenterRegions viewModel={permitInspectionViewModel} />
      <PccResponsibilityMatrixRegions viewModel={responsibilityMatrixViewModel} />
      <PccConstraintsLogRegions viewModel={constraintsLogViewModel} />
      <PccBuyoutLogRegions viewModel={buyoutLogViewModel} />
      <PccProjectReadinessUnifiedLifecycleSection
        client={client}
        projectId={SAMPLE_PROJECT_PROFILE.projectId}
      />
    </Fragment>
  );
};

function useProjectReadinessReadModel(
  client: IPccProjectReadinessReadModelClient,
  projectId: PccProjectId,
): IPccProjectReadinessViewModel {
  const [vm, setVm] = useState<IPccProjectReadinessViewModel>({ status: 'loading' });
  useEffect(() => {
    let cancelled = false;
    setVm({ status: 'loading' });
    void (async () => {
      try {
        const env = await client.getProjectReadiness(projectId);
        if (cancelled) return;
        setVm(buildPccProjectReadinessViewModel(env));
      } catch {
        if (cancelled) return;
        setVm({ status: 'error' });
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [client, projectId]);
  return vm;
}

function useLifecycleReadinessReadModel(
  client: IPccProjectReadinessReadModelClient,
  projectId: PccProjectId,
): IPccLifecycleReadinessViewModel {
  const [vm, setVm] = useState<IPccLifecycleReadinessViewModel>({ status: 'loading' });
  useEffect(() => {
    let cancelled = false;
    setVm({ status: 'loading' });
    void (async () => {
      try {
        const env = await client.getLifecycleReadiness(projectId);
        if (cancelled) return;
        setVm(buildPccLifecycleReadinessViewModel(env));
      } catch {
        if (cancelled) return;
        setVm({ status: 'error' });
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [client, projectId]);
  return vm;
}

// ─────────────────────────────────────────────────────────────────────
// Region renderer (Fragment of PccDashboardCard children)
// ─────────────────────────────────────────────────────────────────────

interface ReadinessRegionsProps {
  readonly viewModel: IPccProjectReadinessViewModel;
}

const ReadinessRegions: FC<ReadinessRegionsProps> = ({ viewModel }) => {
  if (viewModel.status === 'loading') {
    return (
      <Fragment>
        <PccDashboardCard
          footprint="full"
          eyebrow="Project Readiness Center"
          title="Read-only readiness framework preview"
          dataActiveSurfacePanel="project-readiness"
        >
          <div data-pcc-readiness-region="hero" className={styles.heroBody}>
            <PccPreviewState
              state="loading"
              title="Read-only readiness framework preview"
              description="No workflow execution is enabled in Wave 8."
            />
          </div>
        </PccDashboardCard>
        <FixtureScaffoldRegions viewModel={FIXTURE_VIEW_MODEL} />
      </Fragment>
    );
  }
  if (viewModel.status === 'error') {
    return (
      <Fragment>
        <PccDashboardCard
          footprint="full"
          eyebrow="Project Readiness Center"
          title="Read-only readiness framework preview"
          dataActiveSurfacePanel="project-readiness"
        >
          <div data-pcc-readiness-region="hero" className={styles.heroBody}>
            <PccPreviewState
              state="error"
              title="Read-only readiness framework preview"
              description="No workflow execution is enabled in Wave 8."
            />
          </div>
        </PccDashboardCard>
        <FixtureScaffoldRegions viewModel={FIXTURE_VIEW_MODEL} />
      </Fragment>
    );
  }
  return (
    <Fragment>
      <HeroCard hero={viewModel.hero} />
      <LifecycleGateMapCard gates={viewModel.lifecycleGates} />
      <DomainGridCard domains={viewModel.domains} />
      <BlockersCard blockers={viewModel.blockers} />
      <OwnershipAccountabilityCard ownership={viewModel.ownershipAccountability} />
      <PriorityActionsPreviewCard preview={viewModel.priorityActionsPreview} />
      <EvidenceSourceHealthCard evidence={viewModel.evidence} />
      <DownstreamModulesCard modules={viewModel.downstreamModules} />
    </Fragment>
  );
};

// While loading or in error, still render the seven non-hero regions
// from the fixture snapshot so the bento grid stays populated and tests
// can locate the structural region markers.
const FixtureScaffoldRegions: FC<ReadinessRegionsProps> = ({ viewModel }) => {
  if (viewModel.status !== 'preview') return null;
  return (
    <Fragment>
      <LifecycleGateMapCard gates={viewModel.lifecycleGates} />
      <DomainGridCard domains={viewModel.domains} />
      <BlockersCard blockers={viewModel.blockers} />
      <OwnershipAccountabilityCard ownership={viewModel.ownershipAccountability} />
      <PriorityActionsPreviewCard preview={viewModel.priorityActionsPreview} />
      <EvidenceSourceHealthCard evidence={viewModel.evidence} />
      <DownstreamModulesCard modules={viewModel.downstreamModules} />
    </Fragment>
  );
};

// ─────────────────────────────────────────────────────────────────────
// Region cards
// ─────────────────────────────────────────────────────────────────────

interface HeroCardProps {
  readonly hero: IPccReadinessHeroViewModel;
}

const HeroCard: FC<HeroCardProps> = ({ hero }) => (
  <PccDashboardCard
    footprint="full"
    eyebrow={PCC_MVP_SURFACES['project-readiness'].displayName}
    title="Read-only readiness framework preview"
    dataActiveSurfacePanel="project-readiness"
  >
    <div data-pcc-readiness-region="hero" className={styles.heroBody}>
      <p className={styles.heroLead}>{hero.readOnlyBadgeText}</p>
      <p className={styles.heroCaption}>{hero.noExecutionCaption}</p>
      <p className={styles.heroCaption}>{PCC_MVP_SURFACES['project-readiness'].description}</p>
      <div className={styles.heroStats}>
        <span className={styles.heroStat} data-pcc-readiness-stat="active-gate">
          <span className={styles.heroStatLabel}>Active gate</span>
          <span className={styles.heroStatValue}>{hero.activeLifecycleGateLabel}</span>
        </span>
        <span className={styles.heroStat} data-pcc-readiness-stat="overall-posture">
          <span className={styles.heroStatLabel}>Overall posture</span>
          <PccStatusPill tone={postureToTone(hero.overallPosture)}>
            {posturelabel(hero.overallPosture)}
          </PccStatusPill>
        </span>
        <span className={styles.heroStat} data-pcc-readiness-stat="blocker-count">
          <span className={styles.heroStatLabel}>Blockers</span>
          <span className={styles.heroStatValue}>{hero.blockerCount}</span>
        </span>
        <span className={styles.heroStat} data-pcc-readiness-stat="evidence-confidence">
          <span className={styles.heroStatLabel}>Evidence confidence</span>
          <span className={styles.heroStatValue}>{capitalize(hero.evidenceConfidence)}</span>
        </span>
      </div>
      <div className={styles.heroBadgeRow}>
        {hero.sourceHealthBadges.map((b) => (
          <span
            key={b.sourceModuleId}
            className={styles.inertChip}
            data-pcc-readiness-source-health-badge={b.sourceModuleId}
            aria-label={`${b.sourceModuleLabel} source health: ${b.sourceHealthStatus}`}
          >
            {b.sourceModuleLabel} · {b.sourceHealthStatus}
          </span>
        ))}
      </div>
    </div>
  </PccDashboardCard>
);

interface LifecycleGateMapCardProps {
  readonly gates: readonly IPccReadinessGateViewModel[];
}

const LifecycleGateMapCard: FC<LifecycleGateMapCardProps> = ({ gates }) => (
  <PccDashboardCard footprint="full" eyebrow="Lifecycle gates" title="Project lifecycle map">
    <ol
      data-pcc-readiness-region="lifecycle-gates"
      className={styles.gateMapList}
      aria-label="Project lifecycle gates"
    >
      {gates.map((g) => (
        <li
          key={g.lifecycleGate}
          className={styles.gateMapItem}
          data-pcc-readiness-gate-id={g.lifecycleGate}
          data-pcc-readiness-gate-active={g.isActive ? 'true' : 'false'}
        >
          <span className={styles.gateLabel}>{g.label}</span>
          <PccStatusPill tone={postureToTone(g.posture)}>{posturelabel(g.posture)}</PccStatusPill>
          <span className={styles.gateMeta}>
            {g.itemCount} item{g.itemCount === 1 ? '' : 's'} · {g.openBlockerCount} blocker
            {g.openBlockerCount === 1 ? '' : 's'} · {g.pendingEvidenceCount} pending evidence
          </span>
        </li>
      ))}
    </ol>
  </PccDashboardCard>
);

interface DomainGridCardProps {
  readonly domains: readonly IPccReadinessDomainViewModel[];
}

const DomainGridCard: FC<DomainGridCardProps> = ({ domains }) => (
  <PccDashboardCard footprint="full" eyebrow="Readiness domains" title="Domain posture">
    <div
      data-pcc-readiness-region="domains"
      className={styles.domainGrid}
      aria-label="Readiness domain posture"
    >
      {domains.map((d) => (
        <section
          key={d.domain}
          className={styles.domainCard}
          data-pcc-readiness-domain-id={d.domain}
        >
          <span className={styles.domainLabel}>{d.label}</span>
          <PccStatusPill tone={postureToTone(d.posture)}>{posturelabel(d.posture)}</PccStatusPill>
          <span className={styles.domainMeta}>
            {d.itemCount} item{d.itemCount === 1 ? '' : 's'}
          </span>
          <span className={styles.domainMeta}>
            {d.openBlockerCount} blocker{d.openBlockerCount === 1 ? '' : 's'}
          </span>
          <span className={styles.domainMeta}>{d.pendingEvidenceCount} pending evidence</span>
          <span className={styles.domainMeta}>Confidence: {capitalize(d.confidence)}</span>
        </section>
      ))}
    </div>
  </PccDashboardCard>
);

interface BlockersCardProps {
  readonly blockers: readonly IPccReadinessBlockerItemViewModel[];
}

const BlockersCard: FC<BlockersCardProps> = ({ blockers }) => (
  <PccDashboardCard footprint="wide" eyebrow="Blockers" title="Blockers and exceptions">
    <div data-pcc-readiness-region="blockers" className={styles.blockerList}>
      {blockers.length === 0 ? (
        <PccPreviewState
          state="empty"
          title="No active blockers"
          description="No items are currently blocked or at risk in the framework preview."
        />
      ) : (
        <ul className={styles.blockerListInner} aria-label="Blockers and exceptions">
          {blockers.map((b) => (
            <li key={b.id} className={styles.blockerItem} data-pcc-readiness-blocker-id={b.id}>
              <span className={styles.blockerTitle}>{b.title}</span>
              <span className={styles.blockerMeta}>
                {b.domainLabel} · {b.lifecycleGateLabel}
              </span>
              <span className={styles.blockerMeta}>
                Owner: {b.ownerPersona}
                {b.dueDateUtc ? ` · Due ${b.dueDateUtc.slice(0, 10)}` : ''}
              </span>
              <span className={styles.blockerMeta}>
                Source: {b.sourceModuleLabel} · Severity: {b.severity}
              </span>
              <PccStatusPill tone={postureToTone(b.posture)}>
                {posturelabel(b.posture)}
              </PccStatusPill>
              <span
                className={`${styles.riskTag} ${riskTagClass(b.riskTag)}`}
                data-pcc-readiness-risk-tag={b.riskTag}
                aria-label={`Risk tag: ${b.riskTag}`}
              >
                {riskTagLabel(b.riskTag)}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  </PccDashboardCard>
);

interface OwnershipAccountabilityCardProps {
  readonly ownership: IPccReadinessOwnershipAccountabilityViewModel;
}

const OwnershipAccountabilityCard: FC<OwnershipAccountabilityCardProps> = ({ ownership }) => (
  <PccDashboardCard footprint="wide" eyebrow="Ownership" title="Ownership and accountability">
    <div
      data-pcc-readiness-region="ownership-accountability"
      className={styles.ownershipList}
      aria-label="Ownership and accountability"
    >
      <p className={styles.ownershipSummary}>{ownership.summaryCaption}</p>
      {ownership.entries.length === 0 ? (
        <PccPreviewState
          state="empty"
          title="Ownership data unavailable"
          description="Assignments will appear once the readiness source is available."
        />
      ) : (
        <ul className={styles.ownershipListInner} aria-label="Owner entries">
          {ownership.entries.map((entry) => {
            const hasUnassigned = entry.unassignedItemIds.length > 0;
            return (
              <li
                key={entry.ownerPersona}
                className={styles.ownershipItem}
                data-pcc-readiness-ownership-persona={entry.ownerPersona}
                data-pcc-readiness-ownership-unassigned={hasUnassigned ? 'true' : 'false'}
              >
                <span className={styles.ownershipPersona}>{entry.ownerPersona}</span>
                <span className={styles.ownershipMeta}>
                  {entry.assignedItemIds.length} item
                  {entry.assignedItemIds.length === 1 ? '' : 's'}
                  {entry.openBlockerCount > 0
                    ? ` · ${entry.openBlockerCount} open blocker${
                        entry.openBlockerCount === 1 ? '' : 's'
                      }`
                    : ''}
                  {entry.nextDueDateUtc ? ` · Next due ${entry.nextDueDateUtc.slice(0, 10)}` : ''}
                </span>
                {hasUnassigned ? (
                  <span
                    className={styles.ownershipUnassigned}
                    data-pcc-readiness-ownership-unassigned-count={entry.unassignedItemIds.length}
                  >
                    {entry.unassignedItemIds.length} item
                    {entry.unassignedItemIds.length === 1 ? '' : 's'} unassigned
                  </span>
                ) : (
                  <span className={styles.ownershipMeta}>All items assigned</span>
                )}
                {entry.escalationPersonas.length > 0 ? (
                  <span className={styles.ownershipEscalationRow}>
                    <span className={styles.ownershipMeta}>Escalation:</span>
                    {entry.escalationPersonas.map((persona) => (
                      <span
                        key={persona}
                        className={styles.inertChip}
                        data-pcc-readiness-ownership-escalation={persona}
                      >
                        {persona}
                      </span>
                    ))}
                  </span>
                ) : null}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  </PccDashboardCard>
);

interface PriorityActionsPreviewCardProps {
  readonly preview: IPccReadinessPriorityActionsPreviewViewModel;
}

const PriorityActionsPreviewCard: FC<PriorityActionsPreviewCardProps> = ({ preview }) => (
  <PccDashboardCard
    footprint="wide"
    eyebrow="Priority Actions preview"
    title="Eligible for Priority Actions"
  >
    <div
      data-pcc-readiness-region="priority-actions-preview"
      className={styles.priorityActionsList}
      aria-label="Priority Actions eligibility preview"
    >
      <p className={styles.priorityActionsCaption}>{preview.previewCaption}</p>
      {preview.items.length === 0 ? (
        <PccPreviewState
          state="empty"
          title="No Priority Actions eligibility flagged"
          description={preview.inertActionLabel}
        />
      ) : (
        <ul
          className={styles.priorityActionsListInner}
          aria-label="Priority Actions eligible items"
        >
          {preview.items.map((item) => (
            <li
              key={item.relatedPriorityActionId}
              className={styles.priorityActionItem}
              data-pcc-readiness-priority-action-id={item.relatedPriorityActionId}
            >
              <span className={styles.priorityActionTitle}>{item.itemTitle}</span>
              <span className={styles.priorityActionMeta}>{item.domainLabel}</span>
              <span className={styles.priorityActionMeta}>{item.eligibilityCaption}</span>
              <span className={styles.inertChip} aria-disabled="true">
                Preview only
              </span>
            </li>
          ))}
        </ul>
      )}
      <p className={styles.priorityActionsFooter}>{preview.inertActionLabel}</p>
    </div>
  </PccDashboardCard>
);

interface EvidenceSourceHealthCardProps {
  readonly evidence: IPccReadinessEvidenceViewModel;
}

const EvidenceSourceHealthCard: FC<EvidenceSourceHealthCardProps> = ({ evidence }) => (
  <PccDashboardCard
    footprint="wide"
    eyebrow="Evidence and source health"
    title="Evidence and source-health posture"
  >
    <div data-pcc-readiness-region="evidence-source-health" className={styles.evidenceGrid}>
      {evidence.evidenceBuckets.length === 0 ? (
        <PccPreviewState
          state="empty"
          title="No evidence summary available"
          description={evidence.documentControlReferenceCaption}
        />
      ) : (
        <Fragment>
          <ul className={styles.evidenceList} aria-label="Evidence state buckets">
            {evidence.evidenceBuckets.map((bucket) => (
              <li
                key={bucket.evidenceState}
                className={styles.evidenceItem}
                data-pcc-readiness-evidence-state={bucket.evidenceState}
              >
                <span className={styles.evidenceLabel}>{capitalize(bucket.evidenceState)}</span>
                <span className={styles.evidenceCount}>
                  {bucket.itemCount} item{bucket.itemCount === 1 ? '' : 's'}
                </span>
                {bucket.documentControlSourceIds.length > 0 ? (
                  <span className={styles.evidenceMeta}>
                    {bucket.documentControlSourceIds.length} document control reference
                    {bucket.documentControlSourceIds.length === 1 ? '' : 's'}
                  </span>
                ) : null}
              </li>
            ))}
          </ul>
          <ul className={styles.sourceHealthList} aria-label="Source-health entries">
            {evidence.sourceHealthEntries.map((entry) => (
              <li
                key={entry.sourceModuleId}
                className={styles.sourceHealthItem}
                data-pcc-readiness-source-health={entry.sourceModuleId}
              >
                <span className={styles.sourceHealthLabel}>{entry.sourceModuleLabel}</span>
                <PccStatusPill tone={sourceHealthTone(entry.sourceHealthStatus)}>
                  {entry.sourceHealthStatus}
                </PccStatusPill>
                <span className={styles.sourceHealthMeta}>
                  {entry.itemCount} item{entry.itemCount === 1 ? '' : 's'} · {entry.warningCount}{' '}
                  warning{entry.warningCount === 1 ? '' : 's'}
                </span>
              </li>
            ))}
          </ul>
          <p className={styles.evidenceCaption}>{evidence.documentControlReferenceCaption}</p>
        </Fragment>
      )}
    </div>
  </PccDashboardCard>
);

interface DownstreamModulesCardProps {
  readonly modules: readonly IPccReadinessDownstreamModuleViewModel[];
}

const DownstreamModulesCard: FC<DownstreamModulesCardProps> = ({ modules }) => (
  <PccDashboardCard
    footprint="full"
    eyebrow="Downstream modules"
    title="Downstream module readiness"
  >
    <ul
      data-pcc-readiness-region="downstream-modules"
      className={styles.downstreamList}
      aria-label="Downstream module readiness"
    >
      {modules.map((m) => (
        <li
          key={m.sourceModuleId}
          className={styles.downstreamItem}
          data-pcc-readiness-downstream-source={m.sourceModuleId}
          data-pcc-readiness-downstream-wave={m.waveLabel}
          data-pcc-readiness-downstream-status={m.waveStatus}
        >
          <span className={styles.downstreamLabel}>{m.sourceModuleLabel}</span>
          <span className={styles.inertChip}>{m.waveLabel}</span>
          <span className={styles.downstreamCaption}>{m.statusCaption}</span>
        </li>
      ))}
    </ul>
  </PccDashboardCard>
);

// ─────────────────────────────────────────────────────────────────────
// Helpers (presentation-only)
// ─────────────────────────────────────────────────────────────────────

function postureToTone(
  posture: IPccReadinessHeroViewModel['overallPosture'],
): 'info' | 'neutral' | 'warning' | 'danger' {
  switch (posture) {
    case 'ready':
      return 'info';
    case 'at-risk':
      return 'warning';
    case 'blocked':
      return 'danger';
    case 'not-started':
    case 'not-applicable':
    case 'unknown':
    default:
      return 'neutral';
  }
}

function posturelabel(posture: string): string {
  return capitalize(posture.replace(/-/g, ' '));
}

function capitalize(value: string): string {
  if (!value) return value;
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function sourceHealthTone(status: string): 'info' | 'neutral' | 'warning' | 'danger' {
  switch (status) {
    case 'available':
      return 'info';
    case 'stale':
    case 'missing-config':
      return 'warning';
    case 'backend-unavailable':
    case 'source-unavailable':
    case 'unauthorized':
    case 'forbidden':
      return 'danger';
    default:
      return 'neutral';
  }
}

function riskTagClass(tag: ProjectReadinessRiskTag): string {
  switch (tag) {
    case 'critical-blocker':
      return styles.riskTagCritical;
    case 'open-blocker':
      return styles.riskTagOpen;
    case 'at-risk-warning':
      return styles.riskTagWarning;
    case 'monitor':
    default:
      return styles.riskTagMonitor;
  }
}

function riskTagLabel(tag: ProjectReadinessRiskTag): string {
  switch (tag) {
    case 'critical-blocker':
      return 'Critical blocker';
    case 'open-blocker':
      return 'Open blocker';
    case 'at-risk-warning':
      return 'At-risk warning';
    case 'monitor':
    default:
      return 'Monitor';
  }
}

// ─────────────────────────────────────────────────────────────────────
// Wave 9 — Project Lifecycle Readiness Center regions
// (Direct Fragment children. Each card carries the section marker
//  `data-pcc-readiness-section="lifecycle-readiness-center"` so tests
//  can scope queries to the lifecycle group without wrapping the cards
//  in an element that breaks bento direct-child layout.)
// ─────────────────────────────────────────────────────────────────────

interface LifecycleReadinessRegionsProps {
  readonly viewModel: IPccLifecycleReadinessViewModel;
}

const LifecycleReadinessRegions: FC<LifecycleReadinessRegionsProps> = ({ viewModel }) => {
  if (viewModel.status === 'loading') {
    return (
      <PccDashboardCard
        footprint="full"
        eyebrow="Project Lifecycle Readiness Center"
        title="Read-only lifecycle readiness preview"
      >
        <div
          data-pcc-readiness-region="lifecycle-hero"
          data-pcc-readiness-section={LIFECYCLE_SECTION_MARKER}
          className={styles.heroBody}
        >
          <PccPreviewState
            state="loading"
            title="Read-only lifecycle readiness preview"
            description="No workflow execution is enabled in Wave 9."
          />
        </div>
      </PccDashboardCard>
    );
  }
  if (viewModel.status === 'error') {
    return (
      <PccDashboardCard
        footprint="full"
        eyebrow="Project Lifecycle Readiness Center"
        title="Read-only lifecycle readiness preview"
      >
        <div
          data-pcc-readiness-region="lifecycle-hero"
          data-pcc-readiness-section={LIFECYCLE_SECTION_MARKER}
          className={styles.heroBody}
        >
          <PccPreviewState
            state="error"
            title="Read-only lifecycle readiness preview"
            description="No workflow execution is enabled in Wave 9."
          />
        </div>
      </PccDashboardCard>
    );
  }
  return (
    <Fragment>
      <LifecycleHeroCard hero={viewModel.hero} />
      <LifecycleMapCard map={viewModel.lifecycleMap} />
      <LifecycleFamilyDomainsCard familyDomains={viewModel.familyDomains} />
      <LifecycleMyActionsCard myActions={viewModel.myActions} />
      <LifecycleBlockersCard blockers={viewModel.blockers} />
      <LifecycleEvidenceCard evidence={viewModel.evidence} />
      <LifecycleFutureCloseoutCard futureCloseout={viewModel.futureCloseout} />
      <LifecycleSourceTraceabilityCard sourceTraceability={viewModel.sourceTraceability} />
      <LifecycleReadinessSignalsCard signals={viewModel.signals} />
    </Fragment>
  );
};

interface LifecycleHeroCardProps {
  readonly hero: IPccLifecycleReadinessHeroViewModel;
}

const LifecycleHeroCard: FC<LifecycleHeroCardProps> = ({ hero }) => (
  <PccDashboardCard
    footprint="full"
    eyebrow="Project Lifecycle Readiness Center"
    title="Lifecycle readiness — command surface"
  >
    <div
      data-pcc-readiness-region="lifecycle-hero"
      data-pcc-readiness-section={LIFECYCLE_SECTION_MARKER}
      className={styles.heroBody}
    >
      <p className={styles.heroLead}>{hero.readOnlyBadgeText}</p>
      <p className={styles.heroCaption}>{hero.noExecutionCaption}</p>
      <div className={styles.heroStats}>
        <span className={styles.heroStat} data-pcc-lifecycle-stat="headline-posture">
          <span className={styles.heroStatLabel}>Headline posture</span>
          <PccStatusPill tone={postureToTone(hero.headlinePosture)}>
            {posturelabel(hero.headlinePosture)}
          </PccStatusPill>
        </span>
        <span className={styles.heroStat} data-pcc-lifecycle-stat="active-gate">
          <span className={styles.heroStatLabel}>Active gate</span>
          <span className={styles.heroStatValue}>{hero.activeGateLabel}</span>
        </span>
        <span className={styles.heroStat} data-pcc-lifecycle-stat="open-blockers">
          <span className={styles.heroStatLabel}>Open blockers</span>
          <span className={styles.heroStatValue}>{hero.totalOpenBlockers}</span>
        </span>
        <span className={styles.heroStat} data-pcc-lifecycle-stat="pending-evidence">
          <span className={styles.heroStatLabel}>Pending evidence</span>
          <span className={styles.heroStatValue}>{hero.totalPendingEvidence}</span>
        </span>
        <span className={styles.heroStat} data-pcc-lifecycle-stat="library-total">
          <span className={styles.heroStatLabel}>Library scope</span>
          <span className={styles.heroStatValue}>
            {hero.libraryTotal} item{hero.libraryTotal === 1 ? '' : 's'}
          </span>
        </span>
        <span className={styles.heroStat} data-pcc-lifecycle-stat="project-items">
          <span className={styles.heroStatLabel}>Project items</span>
          <span className={styles.heroStatValue}>{hero.totalProjectItems}</span>
        </span>
      </div>
    </div>
  </PccDashboardCard>
);

interface LifecycleMapCardProps {
  readonly map: IPccLifecycleMapViewModel;
}

const LifecycleMapCard: FC<LifecycleMapCardProps> = ({ map }) => (
  <PccDashboardCard
    footprint="full"
    eyebrow="Lifecycle map"
    title="Phases — startup → mobilization → safety → controls → pre-CO → turnover → closeout → warranty"
  >
    <ol
      data-pcc-readiness-region="lifecycle-map"
      data-pcc-readiness-section={LIFECYCLE_SECTION_MARKER}
      className={styles.gateMapList}
      aria-label="Project lifecycle map phases"
    >
      {map.phases.map((p) => (
        <li
          key={p.phaseId}
          className={styles.gateMapItem}
          data-pcc-lifecycle-phase-id={p.phaseId}
          data-pcc-lifecycle-phase-in-snapshot={p.isInSnapshot ? 'true' : 'false'}
        >
          <span className={styles.gateLabel}>{p.phaseLabel}</span>
          <PccStatusPill tone={postureToTone(p.posture)}>{posturelabel(p.posture)}</PccStatusPill>
          <span className={styles.gateMeta}>
            {p.openBlockerCount} blocker{p.openBlockerCount === 1 ? '' : 's'} ·{' '}
            {p.pendingEvidenceCount} pending evidence · {p.criticalCount} critical
          </span>
        </li>
      ))}
    </ol>
    <p className={styles.heroCaption}>{map.summaryCaption}</p>
  </PccDashboardCard>
);

interface LifecycleFamilyDomainsCardProps {
  readonly familyDomains: IPccLifecycleFamilyDomainsViewModel;
}

const LifecycleFamilyDomainsCard: FC<LifecycleFamilyDomainsCardProps> = ({ familyDomains }) => (
  <PccDashboardCard
    footprint="full"
    eyebrow="Families and domains"
    title="Startup, safety, closeout — and contributing domains"
  >
    <div
      data-pcc-readiness-region="lifecycle-family-domains"
      data-pcc-readiness-section={LIFECYCLE_SECTION_MARKER}
      className={styles.heroBody}
    >
      <ul className={styles.domainGrid} aria-label="Lifecycle readiness families">
        {familyDomains.families.map((f) => (
          <li key={f.family} className={styles.domainCard} data-pcc-lifecycle-family={f.family}>
            <span className={styles.domainLabel}>{f.familyLabel}</span>
            <PccStatusPill tone={postureToTone(f.headlinePosture)}>
              {posturelabel(f.headlinePosture)}
            </PccStatusPill>
            <span className={styles.domainMeta}>
              {f.libraryCount} library item{f.libraryCount === 1 ? '' : 's'}
            </span>
            <span className={styles.domainMeta}>
              {f.instanceCount} project instance{f.instanceCount === 1 ? '' : 's'}
            </span>
          </li>
        ))}
      </ul>
      {familyDomains.domains.length === 0 ? (
        <PccPreviewState
          state="empty"
          title="Domain rollups unavailable"
          description="Domain summaries appear once the readiness source is available."
        />
      ) : (
        <ul className={styles.domainGrid} aria-label="Lifecycle readiness contributing domains">
          {familyDomains.domains.map((d) => (
            <li
              key={d.domainId}
              className={styles.domainCard}
              data-pcc-lifecycle-domain-id={d.domainId}
            >
              <span className={styles.domainLabel}>{d.domainLabel}</span>
              <PccStatusPill tone={postureToTone(d.posture)}>
                {posturelabel(d.posture)}
              </PccStatusPill>
              <span className={styles.domainMeta}>
                {d.openBlockerCount} blocker{d.openBlockerCount === 1 ? '' : 's'}
              </span>
              <span className={styles.domainMeta}>{d.pendingEvidenceCount} pending evidence</span>
              <span className={styles.domainMeta}>Confidence: {capitalize(d.confidence)}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  </PccDashboardCard>
);

// Inline progressive-disclosure detail panel rendered inside <details>.
// Every visible field maps 1:1 to a record-backed source field on the
// lifecycle read model. Optional fields render `Not listed` text honestly
// (no invented data, no hyperlinks). All evidence and external-reference
// URLs render as TEXT only (never as <a href>).
interface LifecycleItemDetailPanelProps {
  readonly detail: IPccLifecycleItemDetailViewModel;
}

const NOT_LISTED = 'Not listed';

function fmtDate(value: string | undefined): string {
  if (!value) return NOT_LISTED;
  return value.slice(0, 10);
}

function fmtPersona(value: string | undefined): string {
  return value ?? NOT_LISTED;
}

const LifecycleItemDetailPanel: FC<LifecycleItemDetailPanelProps> = ({ detail }) => (
  <div className={styles.lifecycleItemDetailPanel}>
    <p
      className={styles.lifecycleItemDetailExactText}
      data-pcc-lifecycle-item-detail-field="exact-item-text"
    >
      “{detail.exactItemText}”
    </p>
    {detail.isCloseoutFromDayOne ? (
      <span
        className={styles.inertChip}
        data-pcc-lifecycle-closeout-from-day-one="true"
        aria-disabled="true"
      >
        Closeout-from-day-one
      </span>
    ) : null}
    {detail.isFutureCloseoutExposure ? (
      <span
        className={styles.inertChip}
        data-pcc-lifecycle-future-closeout-exposure="true"
        aria-disabled="true"
      >
        Future closeout exposure
      </span>
    ) : null}
    {detail.isSafetyFailedState ? (
      <div
        className={styles.lifecycleItemSafetyFailedPanel}
        data-pcc-lifecycle-safety-failed-state="true"
      >
        <span className={styles.priorityActionMeta}>
          Safety item state: {detail.status ?? NOT_LISTED}
          {detail.exceptionCode ? ` · Exception: ${detail.exceptionCode}` : ''}
        </span>
        <span className={styles.priorityActionMeta}>{detail.blockedReason ?? NOT_LISTED}</span>
      </div>
    ) : null}
    <dl className={styles.lifecycleItemDetailDl} aria-label="Item detail fields">
      <dt>Title</dt>
      <dd data-pcc-lifecycle-item-detail-field="normalized-title">{detail.normalizedTitle}</dd>

      <dt>Family</dt>
      <dd data-pcc-lifecycle-item-detail-field="family">{detail.familyLabel}</dd>

      <dt>Phase</dt>
      <dd data-pcc-lifecycle-item-detail-field="phase">{detail.phaseLabel}</dd>

      <dt>Domain</dt>
      <dd data-pcc-lifecycle-item-detail-field="domain">{detail.domainLabel}</dd>

      <dt>Item type</dt>
      <dd data-pcc-lifecycle-item-detail-field="item-type">{detail.itemType}</dd>

      <dt>Criticality</dt>
      <dd data-pcc-lifecycle-item-detail-field="criticality">{capitalize(detail.criticality)}</dd>

      <dt>Risk tags</dt>
      <dd data-pcc-lifecycle-item-detail-field="risk-tags">
        {detail.riskTags.length === 0 ? NOT_LISTED : detail.riskTags.join(', ')}
      </dd>

      <dt>Source family</dt>
      <dd data-pcc-lifecycle-item-detail-field="source-family">{detail.sourceFamily}</dd>

      <dt>Source file</dt>
      <dd data-pcc-lifecycle-item-detail-field="source-file">{detail.sourceFile}</dd>

      <dt>Source page</dt>
      <dd data-pcc-lifecycle-item-detail-field="source-page">
        {detail.sourcePage > 0 ? detail.sourcePage : NOT_LISTED}
      </dd>

      <dt>Source section</dt>
      <dd data-pcc-lifecycle-item-detail-field="source-section">{detail.sourceSection}</dd>

      <dt>Source item key</dt>
      <dd data-pcc-lifecycle-item-detail-field="source-item-key">{detail.sourceItemKey}</dd>

      <dt>Source traceability requirement</dt>
      <dd data-pcc-lifecycle-item-detail-field="source-traceability-requirement">
        {detail.sourceTraceabilityRequirement}
      </dd>

      {detail.sourceDetails ? (
        <Fragment>
          <dt>Source details</dt>
          <dd data-pcc-lifecycle-item-detail-field="source-details">{detail.sourceDetails}</dd>
        </Fragment>
      ) : null}

      {detail.responseOptions ? (
        <Fragment>
          <dt>Response options</dt>
          <dd data-pcc-lifecycle-item-detail-field="response-options">{detail.responseOptions}</dd>
        </Fragment>
      ) : null}

      <dt>Owner persona</dt>
      <dd data-pcc-lifecycle-item-detail-field="owner-persona">
        {fmtPersona(detail.ownerPersona ?? detail.defaultOwnerPersona)}
      </dd>

      <dt>Reviewer persona</dt>
      <dd data-pcc-lifecycle-item-detail-field="reviewer-persona">
        {fmtPersona(detail.reviewerPersona ?? detail.defaultReviewerPersona)}
      </dd>

      <dt>Ownership classification</dt>
      <dd data-pcc-lifecycle-item-detail-field="ownership-classification">
        {detail.ownershipClassification}
      </dd>

      <dt>Status</dt>
      <dd data-pcc-lifecycle-item-detail-field="status">
        {detail.status ? posturelabel(detail.status) : NOT_LISTED}
      </dd>

      <dt>Posture</dt>
      <dd data-pcc-lifecycle-item-detail-field="posture">
        {detail.posture ? posturelabel(detail.posture) : NOT_LISTED}
      </dd>

      <dt>Severity</dt>
      <dd data-pcc-lifecycle-item-detail-field="severity">
        {detail.severity ? capitalize(detail.severity) : NOT_LISTED}
      </dd>

      <dt>Blocker state</dt>
      <dd data-pcc-lifecycle-item-detail-field="blocker-state">
        {detail.blockerState ? capitalize(detail.blockerState) : NOT_LISTED}
      </dd>

      <dt>Confidence</dt>
      <dd data-pcc-lifecycle-item-detail-field="confidence">
        {detail.confidence ? capitalize(detail.confidence) : NOT_LISTED}
      </dd>

      <dt>Due date</dt>
      <dd data-pcc-lifecycle-item-detail-field="due-date">{fmtDate(detail.dueDateUtc)}</dd>

      <dt>Completed</dt>
      <dd data-pcc-lifecycle-item-detail-field="completed">{fmtDate(detail.completedAtUtc)}</dd>

      <dt>Last updated</dt>
      <dd data-pcc-lifecycle-item-detail-field="last-updated">
        {fmtDate(detail.lastUpdatedAtUtc)}
      </dd>

      <dt>Default gate impact</dt>
      <dd data-pcc-lifecycle-item-detail-field="default-gate-impact">
        {detail.defaultGateImpact.length === 0 ? NOT_LISTED : detail.defaultGateImpact.join(', ')}
      </dd>

      <dt>Exception code</dt>
      <dd data-pcc-lifecycle-item-detail-field="exception-code">
        {detail.exceptionCode ?? NOT_LISTED}
      </dd>

      <dt>Blocked reason</dt>
      <dd data-pcc-lifecycle-item-detail-field="blocked-reason">
        {detail.blockedReason ?? NOT_LISTED}
      </dd>

      <dt>Deferred reason</dt>
      <dd data-pcc-lifecycle-item-detail-field="deferred-reason">
        {detail.deferredReason ?? NOT_LISTED}
      </dd>

      <dt>Not-applicable reason</dt>
      <dd data-pcc-lifecycle-item-detail-field="not-applicable-reason">
        {detail.notApplicableReason ?? NOT_LISTED}
      </dd>

      <dt>Evidence policy</dt>
      <dd data-pcc-lifecycle-item-detail-field="evidence-policy">{detail.evidencePolicy}</dd>

      <dt>Evidence state</dt>
      <dd data-pcc-lifecycle-item-detail-field="evidence-state">
        {detail.evidenceState ? capitalize(detail.evidenceState) : NOT_LISTED}
      </dd>

      <dt>Evidence reference</dt>
      <dd data-pcc-lifecycle-item-detail-field="evidence-reference">
        {detail.evidenceReferenceLabel ?? NOT_LISTED}
      </dd>

      <dt>Document control source</dt>
      <dd data-pcc-lifecycle-item-detail-field="evidence-document-control-source">
        {detail.evidenceDocumentControlSourceId ?? NOT_LISTED}
      </dd>

      <dt>Evidence external reference</dt>
      <dd data-pcc-lifecycle-item-detail-field="evidence-external-reference">
        {detail.evidenceExternalReferenceLabel ?? NOT_LISTED}
        {detail.evidenceExternalReferenceUrlText
          ? ` (${detail.evidenceExternalReferenceUrlText})`
          : ''}
      </dd>

      <dt>External references</dt>
      <dd data-pcc-lifecycle-item-detail-field="external-references">
        {detail.externalReferences.length === 0 ? (
          NOT_LISTED
        ) : (
          <ul className={styles.lifecycleItemDetailRefList}>
            {detail.externalReferences.map((ref, idx) => (
              <li
                key={`${ref.system}-${idx}`}
                data-pcc-lifecycle-item-detail-external-system={ref.system}
              >
                {ref.system} · {ref.referenceLabel}
                {ref.referenceUrlText ? ` (${ref.referenceUrlText})` : ''}
              </li>
            ))}
          </ul>
        )}
      </dd>

      <dt>Recurrence</dt>
      <dd data-pcc-lifecycle-item-detail-field="recurrence">
        {detail.recurrenceCadence
          ? `${detail.recurrenceCadence}${
              detail.recurrenceTriggerEvent ? ` · ${detail.recurrenceTriggerEvent}` : ''
            }`
          : NOT_LISTED}
      </dd>

      <dt>Approval checkpoint</dt>
      <dd data-pcc-lifecycle-item-detail-field="approval-checkpoint">
        {detail.approvalCheckpointReference ?? NOT_LISTED}
      </dd>

      <dt>Related Priority Action</dt>
      <dd data-pcc-lifecycle-item-detail-field="related-priority-action">
        {detail.relatedPriorityActionId ?? NOT_LISTED}
      </dd>

      <dt>Readiness signals</dt>
      <dd data-pcc-lifecycle-item-detail-field="signals">
        {detail.signals.length === 0 ? (
          NOT_LISTED
        ) : (
          <span className={styles.lifecycleSignalChipRow}>
            {detail.signals.map((kind) => (
              <span
                key={kind}
                className={styles.lifecycleSignalChip}
                data-pcc-lifecycle-item-signal-kind={kind}
                aria-disabled="true"
              >
                {LIFECYCLE_SIGNAL_LABEL_LOOKUP[kind]}
              </span>
            ))}
          </span>
        )}
      </dd>
    </dl>
  </div>
);

// Renders a degraded preview for list-bearing regions when the envelope's
// cardState is not `preview`. Returns null when no degradation is needed.
function lifecycleDegradedPreview(cardState: PccCardState, region: string): JSX.Element | null {
  if (cardState === 'preview') return null;
  const description =
    cardState === 'unavailable-fixture'
      ? 'Source fixture is unavailable; live data is operator-pending.'
      : cardState === 'missing-config'
        ? 'Source configuration is incomplete for this preview.'
        : cardState === 'unauthorized-persona'
          ? 'This preview is not visible to your role.'
          : cardState === 'error'
            ? 'Source could not be reached for this preview.'
            : 'Preview content is not available right now.';
  return (
    <div data-pcc-lifecycle-degraded-region={region}>
      <PccPreviewState
        state={cardState}
        title="Source preview unavailable"
        description={description}
      />
    </div>
  );
}

interface LifecycleMyActionsCardProps {
  readonly myActions: IPccLifecycleMyActionsViewModel;
}

const LifecycleMyActionsCard: FC<LifecycleMyActionsCardProps> = ({ myActions }) => {
  const degraded = lifecycleDegradedPreview(myActions.cardState, 'lifecycle-my-actions');
  return (
    <PccDashboardCard footprint="wide" eyebrow="My readiness actions" title="Active assignments">
      <div
        data-pcc-readiness-region="lifecycle-my-actions"
        data-pcc-readiness-section={LIFECYCLE_SECTION_MARKER}
        className={styles.priorityActionsList}
        aria-label="My readiness actions"
      >
        <p className={styles.priorityActionsCaption}>{myActions.captionText}</p>
        {degraded ??
          (myActions.items.length === 0 ? (
            <PccPreviewState
              state="empty"
              title="No active readiness actions"
              description={myActions.inertActionLabel}
            />
          ) : (
            <ul className={styles.priorityActionsListInner} aria-label="Active readiness items">
              {myActions.items.map((item) => (
                <li
                  key={item.projectItemId}
                  className={styles.priorityActionItem}
                  data-pcc-lifecycle-item-id={item.projectItemId}
                  data-pcc-lifecycle-family={item.family}
                >
                  <span className={styles.priorityActionTitle}>{item.title}</span>
                  <span className={styles.priorityActionMeta}>
                    {item.familyLabel} · {item.phaseLabel}
                  </span>
                  <span className={styles.priorityActionMeta}>
                    Status: {posturelabel(item.status)} · Criticality:{' '}
                    {capitalize(item.criticality)}
                  </span>
                  <span className={styles.priorityActionMeta}>
                    Owner: {item.ownerPersona}
                    {item.dueDateUtc ? ` · Due ${item.dueDateUtc.slice(0, 10)}` : ''}
                  </span>
                  <span className={styles.inertChip} aria-disabled="true">
                    Preview only
                  </span>
                  <details className={styles.lifecycleItemDetails}>
                    <summary
                      className={styles.lifecycleItemSummary}
                      data-pcc-lifecycle-item-detail-toggle={item.projectItemId}
                    >
                      View item detail
                    </summary>
                    <LifecycleItemDetailPanel detail={item.detail} />
                  </details>
                </li>
              ))}
            </ul>
          ))}
        <p className={styles.priorityActionsFooter}>{myActions.inertActionLabel}</p>
      </div>
    </PccDashboardCard>
  );
};

interface LifecycleBlockersCardProps {
  readonly blockers: IPccLifecycleBlockersViewModel;
}

const LifecycleBlockersCard: FC<LifecycleBlockersCardProps> = ({ blockers }) => {
  const degraded = lifecycleDegradedPreview(blockers.cardState, 'lifecycle-blockers-exceptions');
  return (
    <PccDashboardCard
      footprint="wide"
      eyebrow="Blockers and exceptions"
      title="Blocked, escalated, and at-risk items"
    >
      <div
        data-pcc-readiness-region="lifecycle-blockers-exceptions"
        data-pcc-readiness-section={LIFECYCLE_SECTION_MARKER}
        className={styles.blockerList}
      >
        <p className={styles.heroCaption}>{blockers.summaryCaption}</p>
        {degraded ?? (
          <Fragment>
            <ul className={styles.evidenceList} aria-label="Blocker state buckets">
              {blockers.buckets.map((b) => (
                <li
                  key={b.blockerState}
                  className={styles.evidenceItem}
                  data-pcc-lifecycle-blocker-state={b.blockerState}
                >
                  <span className={styles.evidenceLabel}>{capitalize(b.blockerState)}</span>
                  <span className={styles.evidenceCount}>
                    {b.itemCount} item{b.itemCount === 1 ? '' : 's'}
                  </span>
                  <span className={styles.evidenceMeta}>
                    Critical {b.severityCounts.critical} · High {b.severityCounts.high} · Medium{' '}
                    {b.severityCounts.medium} · Low {b.severityCounts.low}
                  </span>
                </li>
              ))}
            </ul>
            {blockers.items.length > 0 ? (
              <ul className={styles.blockerListInner} aria-label="Blocked items">
                {blockers.items.map((item) => (
                  <li
                    key={item.projectItemId}
                    className={styles.blockerItem}
                    data-pcc-lifecycle-blocker-item-id={item.projectItemId}
                    data-pcc-lifecycle-family={item.family}
                  >
                    <span className={styles.blockerTitle}>{item.title}</span>
                    <span className={styles.blockerMeta}>
                      {item.familyLabel} · Severity: {capitalize(item.severity)}
                    </span>
                    <span className={styles.blockerMeta}>
                      State: {capitalize(item.blockerState)} · Status: {posturelabel(item.status)}
                      {item.exceptionCode ? ` · Exception: ${item.exceptionCode}` : ''}
                    </span>
                    <details className={styles.lifecycleItemDetails}>
                      <summary
                        className={styles.lifecycleItemSummary}
                        data-pcc-lifecycle-item-detail-toggle={item.projectItemId}
                      >
                        View item detail
                      </summary>
                      <LifecycleItemDetailPanel detail={item.detail} />
                    </details>
                  </li>
                ))}
              </ul>
            ) : null}
          </Fragment>
        )}
      </div>
    </PccDashboardCard>
  );
};

interface LifecycleEvidenceCardProps {
  readonly evidence: IPccLifecycleEvidenceViewModel;
}

const LifecycleEvidenceCard: FC<LifecycleEvidenceCardProps> = ({ evidence }) => {
  const degraded = lifecycleDegradedPreview(evidence.cardState, 'lifecycle-evidence-readiness');
  return (
    <PccDashboardCard footprint="wide" eyebrow="Evidence readiness" title="Evidence-state buckets">
      <div
        data-pcc-readiness-region="lifecycle-evidence-readiness"
        data-pcc-readiness-section={LIFECYCLE_SECTION_MARKER}
        className={styles.evidenceGrid}
      >
        {degraded ??
          (evidence.buckets.length === 0 ? (
            <PccPreviewState
              state="empty"
              title="No evidence summary available"
              description={evidence.documentControlReferenceCaption}
            />
          ) : (
            <ul className={styles.evidenceList} aria-label="Evidence-state buckets">
              {evidence.buckets.map((bucket) => (
                <li
                  key={bucket.evidenceState}
                  className={styles.evidenceItem}
                  data-pcc-lifecycle-evidence-state={bucket.evidenceState}
                >
                  <span className={styles.evidenceLabel}>{capitalize(bucket.evidenceState)}</span>
                  <span className={styles.evidenceCount}>
                    {bucket.itemCount} item{bucket.itemCount === 1 ? '' : 's'}
                  </span>
                  {bucket.documentControlSourceCount > 0 ? (
                    <span className={styles.evidenceMeta}>
                      {bucket.documentControlSourceCount} document control reference
                      {bucket.documentControlSourceCount === 1 ? '' : 's'}
                    </span>
                  ) : null}
                </li>
              ))}
            </ul>
          ))}
        <p className={styles.evidenceCaption}>{evidence.documentControlReferenceCaption}</p>
      </div>
    </PccDashboardCard>
  );
};

interface LifecycleFutureCloseoutCardProps {
  readonly futureCloseout: IPccLifecycleFutureCloseoutViewModel;
}

const LifecycleFutureCloseoutCard: FC<LifecycleFutureCloseoutCardProps> = ({ futureCloseout }) => {
  const degraded = lifecycleDegradedPreview(futureCloseout.cardState, 'lifecycle-future-closeout');
  return (
    <PccDashboardCard
      footprint="standard"
      eyebrow="Future closeout exposure"
      title="Early closeout-risk surface"
    >
      <div
        data-pcc-readiness-region="lifecycle-future-closeout"
        data-pcc-readiness-section={LIFECYCLE_SECTION_MARKER}
        className={styles.blockerList}
      >
        <p className={styles.heroCaption}>{futureCloseout.captionText}</p>
        {degraded ??
          (futureCloseout.items.length === 0 ? (
            <PccPreviewState
              state="empty"
              title="No future closeout exposure flagged"
              description="Closeout-risk items will appear once the lifecycle source surfaces them."
            />
          ) : (
            <ul className={styles.blockerListInner} aria-label="Future closeout exposure items">
              {futureCloseout.items.map((item) => (
                <li
                  key={item.templateItemId}
                  className={styles.blockerItem}
                  data-pcc-lifecycle-future-closeout-item-id={item.templateItemId}
                  data-pcc-lifecycle-family={item.family}
                >
                  <span className={styles.blockerTitle}>{item.title}</span>
                  <span className={styles.blockerMeta}>
                    {item.phaseLabel} · Criticality: {capitalize(item.criticality)}
                  </span>
                  <span className={styles.blockerMeta}>
                    {item.hasProjectInstance
                      ? `Project status: ${
                          item.projectStatus ? posturelabel(item.projectStatus) : '—'
                        }`
                      : 'No project instance yet'}
                  </span>
                  <details className={styles.lifecycleItemDetails}>
                    <summary
                      className={styles.lifecycleItemSummary}
                      data-pcc-lifecycle-item-detail-toggle={item.templateItemId}
                    >
                      View item detail
                    </summary>
                    <LifecycleItemDetailPanel detail={item.detail} />
                  </details>
                </li>
              ))}
            </ul>
          ))}
      </div>
    </PccDashboardCard>
  );
};

interface LifecycleSourceTraceabilityCardProps {
  readonly sourceTraceability: IPccLifecycleSourceTraceabilityViewModel;
}

const LifecycleSourceTraceabilityCard: FC<LifecycleSourceTraceabilityCardProps> = ({
  sourceTraceability,
}) => (
  <PccDashboardCard
    footprint="standard"
    eyebrow="Source traceability"
    title="Library scope and source documents"
  >
    <div
      data-pcc-readiness-region="lifecycle-source-traceability"
      data-pcc-readiness-section={LIFECYCLE_SECTION_MARKER}
      className={styles.heroBody}
    >
      <p
        className={styles.heroLead}
        data-pcc-lifecycle-library-total={sourceTraceability.libraryTotal}
      >
        {sourceTraceability.libraryTotal} canonical lifecycle items tracked
      </p>
      <ul className={styles.evidenceList} aria-label="Library family totals">
        {sourceTraceability.familyTotals.map((f) => (
          <li
            key={f.family}
            className={styles.evidenceItem}
            data-pcc-lifecycle-source-family={f.family}
          >
            <span className={styles.evidenceLabel}>{f.familyLabel}</span>
            <span className={styles.evidenceCount}>{f.count}</span>
          </li>
        ))}
      </ul>
      <ul className={styles.blockerListInner} aria-label="Source documents">
        {sourceTraceability.sourceDocuments.map((doc) => (
          <li
            key={doc.sourceFile}
            className={styles.blockerItem}
            data-pcc-lifecycle-source-document={doc.sourceFile}
            data-pcc-lifecycle-source-family={doc.family}
          >
            <span className={styles.blockerTitle}>{doc.sourceFile}</span>
            <span className={styles.blockerMeta}>
              {doc.familyLabel} · {doc.libraryCount} item
              {doc.libraryCount === 1 ? '' : 's'}
            </span>
          </li>
        ))}
      </ul>
      <p className={styles.heroCaption}>{sourceTraceability.auditCaption}</p>
    </div>
  </PccDashboardCard>
);

// Surface-local label lookup for the 7 canonical readiness-signal kinds.
// Mirrors the adapter's module-local `SIGNAL_LABELS`. Tests assert the
// surface render output, not this map (per the test-adapter-output rule).
const LIFECYCLE_SIGNAL_LABEL_LOOKUP: Readonly<Record<PccLifecycleReadinessSignalKind, string>> = {
  blocked: 'Blocked',
  overdue: 'Overdue',
  'missing-evidence': 'Missing evidence',
  'failed-safety': 'Failed safety',
  'gate-blocking': 'Gate-blocking',
  'awaiting-approval': 'Awaiting approval',
  'external-reference-issue': 'External setup or reference issue',
};

interface LifecycleReadinessSignalsCardProps {
  readonly signals: IPccLifecycleReadinessSignalsViewModel;
}

const LifecycleReadinessSignalsCard: FC<LifecycleReadinessSignalsCardProps> = ({ signals }) => {
  const degraded = lifecycleDegradedPreview(signals.cardState, 'lifecycle-readiness-signals');
  return (
    <PccDashboardCard
      footprint="full"
      eyebrow="Readiness signals"
      title="Posture for future Priority Actions and Approvals integration"
    >
      <div
        data-pcc-readiness-region="lifecycle-readiness-signals"
        data-pcc-readiness-section={LIFECYCLE_SECTION_MARKER}
        className={styles.heroBody}
      >
        <p className={styles.heroCaption}>{signals.handoffCaption}</p>
        <p className={styles.heroCaption}>{signals.noExecutionCaption}</p>
        {degraded ?? (
          <Fragment>
            <ul className={styles.evidenceList} aria-label="Readiness signal buckets">
              {signals.buckets.map((b) => (
                <li
                  key={b.kind}
                  className={styles.evidenceItem}
                  data-pcc-lifecycle-signal-kind={b.kind}
                >
                  <span className={styles.evidenceLabel}>{b.label}</span>
                  <span className={styles.evidenceCount}>{b.itemCount}</span>
                </li>
              ))}
            </ul>

            {signals.approvalPosture.length > 0 ? (
              <ul className={styles.blockerListInner} aria-label="Approval checkpoint posture">
                {signals.approvalPosture.map((a) => (
                  <li
                    key={a.projectItemId}
                    className={styles.blockerItem}
                    data-pcc-lifecycle-approval-posture-item-id={a.projectItemId}
                    data-pcc-lifecycle-approval-checkpoint={a.approvalCheckpointReference}
                  >
                    <span className={styles.blockerTitle}>{a.title}</span>
                    <span className={styles.blockerMeta}>
                      Checkpoint: {a.approvalCheckpointReference} · Status: {posturelabel(a.status)}{' '}
                      · {a.family}
                    </span>
                    <span className={styles.inertChip} aria-disabled="true">
                      Display only
                    </span>
                  </li>
                ))}
              </ul>
            ) : null}

            {signals.priorityActionPromotions.length > 0 ? (
              <ul className={styles.blockerListInner} aria-label="Priority Actions promotions">
                {signals.priorityActionPromotions.map((p) => (
                  <li
                    key={p.projectItemId}
                    className={styles.blockerItem}
                    data-pcc-lifecycle-priority-action-promotion-id={p.relatedPriorityActionId}
                    data-pcc-lifecycle-priority-action-item-id={p.projectItemId}
                  >
                    <span className={styles.blockerTitle}>{p.title}</span>
                    <span className={styles.blockerMeta}>
                      Priority Action: {p.relatedPriorityActionId} · {p.family}
                    </span>
                    <span className={styles.inertChip} aria-disabled="true">
                      Display only
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
};
