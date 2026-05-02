/**
 * Permit & Inspection Control Center — region renderer.
 *
 * Phase 3 / Wave 10 / Prompt 05. Returns a `Fragment` of direct
 * `<PccDashboardCard>` children; each card carries the section marker
 * `data-pcc-readiness-section="permit-inspection-control-center"` on its
 * inner content `<div>` and a region-specific `data-pcc-permit-region`
 * marker for test scoping. No `<section>` wrapper — preserves the bento
 * direct-child invariant.
 *
 * Visual posture:
 *   - all buttons are disabled (no enabled action affordances exist);
 *   - AHJ portal URLs render as plain `<span>` text — never `<a href>`;
 *   - evidence is reference-only (no upload/sync/storage controls);
 *   - lineage details use the native `<details>`/`<summary>` element;
 *   - row counts come from the deterministic view-model snapshot.
 */

import { Fragment, type FC } from 'react';
import type {
  IAhjJurisdictionProfile,
  IFeeExposureRecord,
  IInspectionRecord,
  IPermitInspectionEvidenceLink,
  IPermitRecord,
  IReinspectionLineage,
} from '@hbc/models/pcc';
import { PccDashboardCard } from '../../layout/PccDashboardCard';
import { PccPreviewState } from '../../ui/PccPreviewState';
import type {
  IPermitInspectionControlCenterUiSnapshot,
  PccPermitInspectionControlCenterViewModel,
} from './permitInspectionControlCenterViewModel.js';
import styles from './PccPermitInspectionControlCenterRegions.module.css';

const SECTION_MARKER = 'permit-inspection-control-center';

export interface PccPermitInspectionControlCenterRegionsProps {
  readonly viewModel: PccPermitInspectionControlCenterViewModel;
}

export const PccPermitInspectionControlCenterRegions: FC<
  PccPermitInspectionControlCenterRegionsProps
> = ({ viewModel }) => {
  if (viewModel.status === 'loading') {
    return (
      <PccDashboardCard
        footprint="full"
        eyebrow="Permit & Inspection Control Center"
        title="Loading permit & inspection read-model"
      >
        <div data-pcc-readiness-section={SECTION_MARKER} data-pcc-permit-region="permit-hero">
          <PccPreviewState state="loading" />
        </div>
      </PccDashboardCard>
    );
  }
  if (viewModel.status === 'error') {
    return (
      <PccDashboardCard
        footprint="full"
        eyebrow="Permit & Inspection Control Center"
        title="Permit & inspection read-model failed"
      >
        <div data-pcc-readiness-section={SECTION_MARKER} data-pcc-permit-region="permit-hero">
          <PccPreviewState state="error" />
        </div>
      </PccDashboardCard>
    );
  }
  const snapshot = viewModel.snapshot;
  return (
    <Fragment>
      <HeroCard snapshot={snapshot} />
      <PermitsBlockingWorkCard permits={snapshot.permitsBlockingWork} />
      <InspectionsReadyCard inspections={snapshot.inspectionsReadyToRequest} />
      <FailedReinspectionQueueCard
        inspections={snapshot.failedReinspectionQueue}
        lineages={snapshot.reinspectionLineages}
      />
      <ExpiringPermitsCard permits={snapshot.expiringPermits} />
      <FeeExposureOpenCard fees={snapshot.openFeeExposure} />
      <EvidenceMissingCard links={snapshot.evidenceMissing} />
      <CloseoutExposureCard fees={snapshot.closeoutExposure} />
      <AhjLauncherPanelCard profiles={snapshot.ahjLauncherPanel} />
      <RecordDetailRegionCard permits={snapshot.recordDetailRows} />
    </Fragment>
  );
};

export default PccPermitInspectionControlCenterRegions;

// ─────────────────────────────────────────────────────────────────────
// Cards
// ─────────────────────────────────────────────────────────────────────

const HeroCard: FC<{ snapshot: IPermitInspectionControlCenterUiSnapshot }> = ({ snapshot }) => {
  const s = snapshot.summary;
  return (
    <PccDashboardCard
      footprint="full"
      eyebrow="Permit & Inspection Control Center"
      title="Permit and inspection — command surface"
    >
      <div
        data-pcc-readiness-section={SECTION_MARKER}
        data-pcc-permit-region="permit-hero"
        className={styles.hero}
      >
        <p className={styles.captionLine}>{snapshot.captionLine}</p>
        <div className={styles.heroStats}>
          <Stat label="Permits" value={s.permitCount} />
          <Stat label="Expiring" value={s.expiringCount} />
          <Stat label="Inspections" value={s.inspectionCount} />
          <Stat label="Failed inspections" value={s.failedInspectionCount} />
          <Stat label="Open reinspections" value={s.openReinspectionCount} />
          <Stat label="Open fee exposure" value={s.openFeeExposureCount} />
          <Stat label="Evidence missing" value={s.evidenceMissingCount} />
          <Stat label="AHJ launchers" value={s.ahjLauncherCount} />
        </div>
      </div>
    </PccDashboardCard>
  );
};

const Stat: FC<{ label: string; value: number }> = ({ label, value }) => (
  <span className={styles.stat} data-pcc-permit-stat={label}>
    <span className={styles.statLabel}>{label}</span>
    <span className={styles.statValue}>{value}</span>
  </span>
);

const PermitsBlockingWorkCard: FC<{ permits: readonly IPermitRecord[] }> = ({ permits }) => (
  <PccDashboardCard
    footprint="wide"
    eyebrow="Permit & Inspection Control Center"
    title="Permits blocking work"
  >
    <div
      data-pcc-readiness-section={SECTION_MARKER}
      data-pcc-permit-region="permits-blocking"
      className={styles.laneList}
    >
      {permits.length === 0 ? (
        <EmptyLaneNote message="No permits currently blocking work." />
      ) : (
        permits.map((p) => (
          <div key={p.permitId} data-pcc-permit-id={p.permitId} className={styles.row}>
            <span className={styles.chip} data-pcc-permit-number>
              {p.permitNumber}
            </span>
            <StatusPill label={p.status} />
            <span className={styles.chip} data-pcc-permit-revision={String(p.revision)}>
              Revision {p.revision}
            </span>
            {p.responsibleParty ? (
              <span className={styles.chipMuted}>Owner: {p.responsibleParty}</span>
            ) : null}
            <span className={styles.rowDescription}>{p.description}</span>
          </div>
        ))
      )}
    </div>
  </PccDashboardCard>
);

const InspectionsReadyCard: FC<{ inspections: readonly IInspectionRecord[] }> = ({
  inspections,
}) => (
  <PccDashboardCard
    footprint="wide"
    eyebrow="Permit & Inspection Control Center"
    title="Inspections ready to request"
  >
    <div
      data-pcc-readiness-section={SECTION_MARKER}
      data-pcc-permit-region="inspections-ready"
      className={styles.laneList}
    >
      {inspections.length === 0 ? (
        <EmptyLaneNote message="No inspections currently ready to request." />
      ) : (
        inspections.map((i) => (
          <div key={i.inspectionId} data-pcc-inspection-id={i.inspectionId} className={styles.row}>
            <span className={styles.chip}>{i.inspectionNumber}</span>
            <StatusPill label={i.status} />
            <span className={styles.chipMuted}>{i.inspectionType}</span>
            <span className={styles.chipMuted}>Permit {i.relatedPermitId}</span>
          </div>
        ))
      )}
    </div>
  </PccDashboardCard>
);

const FailedReinspectionQueueCard: FC<{
  inspections: readonly IInspectionRecord[];
  lineages: readonly IReinspectionLineage[];
}> = ({ inspections, lineages }) => {
  const lineagesByParent = new Map<string, IReinspectionLineage[]>();
  for (const l of lineages) {
    const list = lineagesByParent.get(l.parentInspectionId) ?? [];
    list.push(l);
    lineagesByParent.set(l.parentInspectionId, list);
  }
  return (
    <PccDashboardCard
      footprint="wide"
      eyebrow="Permit & Inspection Control Center"
      title="Failed and reinspection queue"
    >
      <div
        data-pcc-readiness-section={SECTION_MARKER}
        data-pcc-permit-region="failed-reinspection-queue"
        className={styles.laneList}
      >
        {inspections.length === 0 ? (
          <EmptyLaneNote message="No failed or reinspection-queued inspections." />
        ) : (
          inspections.map((i) => {
            const lineagesForRow = lineagesByParent.get(i.inspectionId) ?? [];
            return (
              <details
                key={i.inspectionId}
                className={styles.lineageDetails}
                data-pcc-permit-lineage-id={i.inspectionId}
              >
                <summary className={styles.lineageSummary}>
                  <span className={styles.chip}>{i.inspectionNumber}</span>
                  <StatusPill label={i.status} />
                  <span className={styles.chipMuted}>{i.inspectionType}</span>
                </summary>
                <div className={styles.lineagePanel}>
                  {lineagesForRow.length === 0 ? (
                    <span className={styles.rowDescription}>
                      Inspection failed; no reinspection lineage linked yet.
                    </span>
                  ) : (
                    lineagesForRow.map((l) => (
                      <div key={l.lineageId} className={styles.lineageRow}>
                        <span className={styles.rowDescription}>{l.failedItemSummary}</span>
                        {l.correctiveActionOwner ? (
                          <span className={styles.chipMuted}>
                            Corrective owner: {l.correctiveActionOwner}
                          </span>
                        ) : null}
                        {l.correctiveActionDueDate ? (
                          <span className={styles.chipMuted}>Due: {l.correctiveActionDueDate}</span>
                        ) : null}
                        {typeof l.reInspectionFee === 'number' ? (
                          <span className={styles.chip}>
                            Reinspection fee ${l.reInspectionFee.toLocaleString('en-US')}
                          </span>
                        ) : null}
                        {l.childReinspectionId ? (
                          <span className={styles.chipMuted}>
                            Child reinspection: {l.childReinspectionId}
                          </span>
                        ) : null}
                      </div>
                    ))
                  )}
                </div>
              </details>
            );
          })
        )}
      </div>
    </PccDashboardCard>
  );
};

const ExpiringPermitsCard: FC<{ permits: readonly IPermitRecord[] }> = ({ permits }) => (
  <PccDashboardCard
    footprint="standard"
    eyebrow="Permit & Inspection Control Center"
    title="Expiring permits"
  >
    <div
      data-pcc-readiness-section={SECTION_MARKER}
      data-pcc-permit-region="expiring-permits"
      className={styles.laneList}
    >
      {permits.length === 0 ? (
        <EmptyLaneNote message="No expiring or expired permits." />
      ) : (
        permits.map((p) => (
          <div key={p.permitId} data-pcc-permit-id={p.permitId} className={styles.row}>
            <span className={styles.chip}>{p.permitNumber}</span>
            <StatusPill label={p.status} />
            {p.dateExpires ? (
              <span className={styles.chipMuted}>Expires: {p.dateExpires}</span>
            ) : null}
          </div>
        ))
      )}
    </div>
  </PccDashboardCard>
);

const FeeExposureOpenCard: FC<{ fees: readonly IFeeExposureRecord[] }> = ({ fees }) => (
  <PccDashboardCard
    footprint="standard"
    eyebrow="Permit & Inspection Control Center"
    title="Fees and receipts open"
  >
    <div
      data-pcc-readiness-section={SECTION_MARKER}
      data-pcc-permit-region="fee-exposure-open"
      className={styles.laneList}
    >
      {fees.length === 0 ? (
        <EmptyLaneNote message="No open fee exposure." />
      ) : (
        fees.map((f) => (
          <div key={f.feeRecordId} data-pcc-fee-id={f.feeRecordId} className={styles.row}>
            <span className={styles.chip}>{f.relatedRecordType}</span>
            <StatusPill label={f.feeStatus} />
            {typeof f.applicationValue === 'number' ? (
              <span className={styles.chipMuted}>
                Application value ${f.applicationValue.toLocaleString('en-US')}
              </span>
            ) : null}
            {typeof f.permitFee === 'number' ? (
              <span className={styles.chipMuted}>
                Permit fee ${f.permitFee.toLocaleString('en-US')}
              </span>
            ) : null}
            {typeof f.reInspectionFee === 'number' ? (
              <span className={styles.chipMuted}>
                Reinspection fee ${f.reInspectionFee.toLocaleString('en-US')}
              </span>
            ) : null}
            {f.invoiceReference ? (
              <span className={styles.chipMuted}>Invoice {f.invoiceReference}</span>
            ) : null}
          </div>
        ))
      )}
    </div>
  </PccDashboardCard>
);

const EvidenceMissingCard: FC<{ links: readonly IPermitInspectionEvidenceLink[] }> = ({
  links,
}) => (
  <PccDashboardCard
    footprint="standard"
    eyebrow="Permit & Inspection Control Center"
    title="Evidence missing"
  >
    <div
      data-pcc-readiness-section={SECTION_MARKER}
      data-pcc-permit-region="evidence-missing"
      className={styles.laneList}
    >
      {links.length === 0 ? (
        <EmptyLaneNote message="No required evidence missing." />
      ) : (
        links.map((e) => (
          <div key={e.id} data-pcc-evidence-id={e.id} className={styles.row}>
            <span className={styles.chip}>Required missing</span>
            <span className={styles.rowDescription}>{e.label}</span>
            <span className={styles.chipMuted}>Document Control owned</span>
          </div>
        ))
      )}
    </div>
  </PccDashboardCard>
);

const CloseoutExposureCard: FC<{ fees: readonly IFeeExposureRecord[] }> = ({ fees }) => (
  <PccDashboardCard
    footprint="standard"
    eyebrow="Permit & Inspection Control Center"
    title="Closeout, TCO, and CO exposure"
  >
    <div
      data-pcc-readiness-section={SECTION_MARKER}
      data-pcc-permit-region="closeout-exposure"
      className={styles.laneList}
    >
      {fees.length === 0 ? (
        <EmptyLaneNote message="No outstanding fees blocking closeout, TCO, or CO." />
      ) : (
        fees.map((f) => (
          <div key={f.feeRecordId} className={styles.row}>
            <span className={styles.chip}>{f.relatedRecordType}</span>
            <StatusPill label={f.feeStatus} />
            <span className={styles.rowDescription}>
              {f.notes ?? 'Outstanding fee may delay closeout, TCO, or CO.'}
            </span>
          </div>
        ))
      )}
    </div>
  </PccDashboardCard>
);

const AhjLauncherPanelCard: FC<{ profiles: readonly IAhjJurisdictionProfile[] }> = ({
  profiles,
}) => (
  <PccDashboardCard
    footprint="wide"
    eyebrow="Permit & Inspection Control Center"
    title="AHJ launcher panel"
  >
    <div
      data-pcc-readiness-section={SECTION_MARKER}
      data-pcc-permit-region="ahj-launcher-panel"
      className={styles.laneList}
    >
      {profiles.length === 0 ? (
        <EmptyLaneNote message="No AHJ launcher profiles." />
      ) : (
        profiles.map((a) => (
          <div
            key={a.ahjId}
            data-pcc-ahj-id={a.ahjId}
            data-pcc-ahj-launcher-only={String(a.launcherOnly)}
            className={styles.row}
          >
            <span className={styles.chip}>{a.ahjDisplayName}</span>
            <span className={styles.chipMuted}>{a.jurisdictionType}</span>
            <span className={styles.chip}>Launcher only</span>
            {a.portalUrl ? (
              <span className={styles.chipMuted} data-pcc-ahj-portal-url={a.portalUrl}>
                Portal: {a.portalUrl}
              </span>
            ) : null}
            {a.cutoffNotes ? <span className={styles.rowDescription}>{a.cutoffNotes}</span> : null}
          </div>
        ))
      )}
    </div>
  </PccDashboardCard>
);

const RecordDetailRegionCard: FC<{ permits: readonly IPermitRecord[] }> = ({ permits }) => (
  <PccDashboardCard
    footprint="full"
    eyebrow="Permit & Inspection Control Center"
    title="Permit record detail"
  >
    <div
      data-pcc-readiness-section={SECTION_MARKER}
      data-pcc-permit-region="record-detail"
      className={styles.detailList}
    >
      {permits.length === 0 ? (
        <EmptyLaneNote message="No permit records to display." />
      ) : (
        permits.map((p) => (
          <details
            key={p.permitId}
            className={styles.lineageDetails}
            data-pcc-permit-detail-id={p.permitId}
          >
            <summary className={styles.lineageSummary}>
              <span className={styles.chip}>{p.permitNumber}</span>
              <StatusPill label={p.status} />
              <span className={styles.chipMuted}>{p.permitType}</span>
            </summary>
            <div className={styles.lineagePanel}>
              <div className={styles.row}>
                <span className={styles.chip}>Revision {p.revision}</span>
                {typeof p.applicationValue === 'number' ? (
                  <span className={styles.chip}>
                    Application value ${p.applicationValue.toLocaleString('en-US')}
                  </span>
                ) : null}
                {typeof p.permitFee === 'number' ? (
                  <span className={styles.chip}>
                    Permit fee ${p.permitFee.toLocaleString('en-US')}
                  </span>
                ) : null}
              </div>
              <div className={styles.row}>
                <span className={styles.chipMuted}>Location: {p.location}</span>
                {p.responsibleParty ? (
                  <span className={styles.chipMuted}>Owner: {p.responsibleParty}</span>
                ) : null}
              </div>
              <div className={styles.row}>
                <span className={styles.chipMuted} data-pcc-permit-source-traceability="">
                  Source: {p.sourceLineage.workbookFile} / {p.sourceLineage.sheet} /{' '}
                  {p.sourceLineage.range}
                </span>
              </div>
              {p.evidenceLinks.length > 0 ? (
                <div className={styles.row}>
                  {p.evidenceLinks.map((e) => (
                    <span
                      key={e.id}
                      className={styles.chipMuted}
                      data-pcc-permit-evidence-state={e.status}
                    >
                      {e.label} · {e.status} · Document Control owned
                    </span>
                  ))}
                </div>
              ) : null}
            </div>
          </details>
        ))
      )}
    </div>
  </PccDashboardCard>
);

// ─────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────

const StatusPill: FC<{ label: string }> = ({ label }) => (
  <span className={styles.statusPill} data-pcc-permit-status-pill={label}>
    {label}
  </span>
);

const EmptyLaneNote: FC<{ message: string }> = ({ message }) => (
  <span className={styles.emptyNote}>{message}</span>
);
