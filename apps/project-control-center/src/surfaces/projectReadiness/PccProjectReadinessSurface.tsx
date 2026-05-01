/**
 * Project Readiness Center surface (Phase 3 / Wave 8 / Prompt 05).
 *
 * Six-region framework shell rendered as a Fragment of direct
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
  SAMPLE_PROJECT_PROFILE,
  SAMPLE_PROJECT_READINESS_FRAMEWORK_READ_MODEL,
} from '@hbc/models/pcc';
import type {
  PccProjectId,
  PccReadModelEnvelope,
  PccProjectReadinessFrameworkReadModel,
} from '@hbc/models/pcc';
import { PccDashboardCard } from '../../layout/PccDashboardCard';
import { PccPreviewState } from '../../ui/PccPreviewState';
import { PccStatusPill } from '../../ui/PccStatusPill';
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
} from './projectReadinessViewModel';
import styles from './PccProjectReadinessSurface.module.css';

interface PccProjectReadinessSurfaceProps {
  readonly readModelClient?: IPccProjectReadinessReadModelClient;
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

export const PccProjectReadinessSurface: FC<PccProjectReadinessSurfaceProps> = ({
  readModelClient,
}) => {
  if (readModelClient) {
    return <ReadModelContent client={readModelClient} />;
  }
  return <ReadinessRegions viewModel={FIXTURE_VIEW_MODEL} />;
};

export default PccProjectReadinessSurface;

// ─────────────────────────────────────────────────────────────────────
// Read-model-driven path
// ─────────────────────────────────────────────────────────────────────

interface ReadModelContentProps {
  readonly client: IPccProjectReadinessReadModelClient;
}

const ReadModelContent: FC<ReadModelContentProps> = ({ client }) => {
  const viewModel = useProjectReadinessReadModel(client, SAMPLE_PROJECT_PROFILE.projectId);
  return <ReadinessRegions viewModel={viewModel} />;
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
      <EvidenceSourceHealthCard evidence={viewModel.evidence} />
      <DownstreamModulesCard modules={viewModel.downstreamModules} />
    </Fragment>
  );
};

// While loading or in error, still render the five non-hero regions from
// the fixture snapshot so the bento grid stays populated and tests can
// locate the structural region markers.
const FixtureScaffoldRegions: FC<ReadinessRegionsProps> = ({ viewModel }) => {
  if (viewModel.status !== 'preview') return null;
  return (
    <Fragment>
      <LifecycleGateMapCard gates={viewModel.lifecycleGates} />
      <DomainGridCard domains={viewModel.domains} />
      <BlockersCard blockers={viewModel.blockers} />
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
      <p className={styles.heroCaption}>
        {PCC_MVP_SURFACES['project-readiness'].description}
      </p>
      <div className={styles.heroStats}>
        <span
          className={styles.heroStat}
          data-pcc-readiness-stat="active-gate"
        >
          <span className={styles.heroStatLabel}>Active gate</span>
          <span className={styles.heroStatValue}>{hero.activeLifecycleGateLabel}</span>
        </span>
        <span
          className={styles.heroStat}
          data-pcc-readiness-stat="overall-posture"
        >
          <span className={styles.heroStatLabel}>Overall posture</span>
          <PccStatusPill tone={postureToTone(hero.overallPosture)}>
            {posturelabel(hero.overallPosture)}
          </PccStatusPill>
        </span>
        <span
          className={styles.heroStat}
          data-pcc-readiness-stat="blocker-count"
        >
          <span className={styles.heroStatLabel}>Blockers</span>
          <span className={styles.heroStatValue}>{hero.blockerCount}</span>
        </span>
        <span
          className={styles.heroStat}
          data-pcc-readiness-stat="evidence-confidence"
        >
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
          <PccStatusPill tone={postureToTone(g.posture)}>
            {posturelabel(g.posture)}
          </PccStatusPill>
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
          <span className={styles.domainMeta}>
            {d.pendingEvidenceCount} pending evidence
          </span>
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
            <li
              key={b.id}
              className={styles.blockerItem}
              data-pcc-readiness-blocker-id={b.id}
            >
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
              <PccStatusPill tone={postureToTone(b.posture)}>{posturelabel(b.posture)}</PccStatusPill>
            </li>
          ))}
        </ul>
      )}
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
    <div
      data-pcc-readiness-region="evidence-source-health"
      className={styles.evidenceGrid}
    >
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
                  {entry.itemCount} item{entry.itemCount === 1 ? '' : 's'} ·{' '}
                  {entry.warningCount} warning{entry.warningCount === 1 ? '' : 's'}
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

function sourceHealthTone(
  status: string,
): 'info' | 'neutral' | 'warning' | 'danger' {
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
