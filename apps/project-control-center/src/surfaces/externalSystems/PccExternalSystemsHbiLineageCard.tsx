/**
 * PCC External Systems — HBI Source Lineage card (Phase 3 / Wave 15 / Prompt 07).
 *
 * Display-only lineage panel. HBI no-authority is preserved by:
 *   - structure: this card has no buttons or affordances with names matching
 *     approve/reject/post/claim/submit/archive/override (the surface
 *     source-scan asserts these identifiers stay out of code, and the
 *     test suite asserts the rendered DOM has none either);
 *   - copy: an always-rendered boundary disclaimer ("HBI is not an
 *     authority…") provided by the adapter as `boundaryCopy`;
 *   - data: unauthorized rows render only the redacted caption — the
 *     adapter discriminated union forbids carrying source details on
 *     the unauthorized branch, so there is nothing to leak.
 *
 * Citation-ready, refusal, unauthorized, loading, unavailable, and
 * insufficient-evidence are rendered as lineage states only — never as
 * actionable rows.
 */

import { Fragment, type FC } from 'react';
import type { HbiSourceLineageState } from '@hbc/models/pcc';
import { PccDashboardCard } from '../../layout/PccDashboardCard';
import { PccPreviewState, type PccPreviewStateKind } from '../../ui/PccPreviewState';
import { PccStatusPill, type PccStatusPillTone } from '../../ui/PccStatusPill';
import type {
  IPccLaunchPadHbiLineageEntry,
  IPccLaunchPadHbiLineageGroup,
  IPccLaunchPadHbiLineageViewModel,
} from './launchPadViewModel';
import styles from './PccExternalSystemsSurface.module.css';

const LINEAGE_STATE_TONES: Readonly<Record<HbiSourceLineageState, PccStatusPillTone>> = {
  loading: 'info',
  'citation-ready': 'success',
  refusal: 'warning',
  unavailable: 'neutral',
  unauthorized: 'neutral',
  'insufficient-evidence': 'neutral',
};

const LINEAGE_STATE_LABELS: Readonly<Record<HbiSourceLineageState, string>> = {
  loading: 'Loading',
  'citation-ready': 'Citation-ready',
  refusal: 'Refusal',
  unavailable: 'Unavailable',
  unauthorized: 'Unauthorized',
  'insufficient-evidence': 'Insufficient evidence',
};

export interface PccExternalSystemsHbiLineageCardProps {
  readonly hbiLineage: IPccLaunchPadHbiLineageViewModel;
  readonly cardState: PccPreviewStateKind;
  readonly isAvailable: boolean;
}

export const PccExternalSystemsHbiLineageCard: FC<PccExternalSystemsHbiLineageCardProps> = ({
  hbiLineage,
  cardState,
  isAvailable,
}) => (
  <PccDashboardCard footprint="full" eyebrow="HBI" title="HBI source lineage">
    <div
      className={styles.body}
      data-pcc-readiness-section="external-systems"
      data-pcc-launch-pad-lane="hbi-lineage"
    >
      <p className={styles.hbiBoundaryCopy} data-pcc-launch-pad-hbi-boundary-copy="">
        {hbiLineage.boundaryCopy}
      </p>
      {!isAvailable ? (
        <PccPreviewState state={cardState} />
      ) : hbiLineage.totalEntries === 0 ? (
        <PccPreviewState state="empty" />
      ) : (
        <ul className={styles.hbiGroupList} data-pcc-launch-pad-hbi-lineage-groups="">
          {hbiLineage.groups.map((group) =>
            group.rows.length === 0 ? null : (
              <HbiLineageGroupSection key={group.state} group={group} />
            ),
          )}
        </ul>
      )}
    </div>
  </PccDashboardCard>
);

interface HbiLineageGroupSectionProps {
  readonly group: IPccLaunchPadHbiLineageGroup;
}

const HbiLineageGroupSection: FC<HbiLineageGroupSectionProps> = ({ group }) => (
  <li className={styles.hbiGroup} data-pcc-launch-pad-hbi-lineage-group={group.state}>
    <h4 className={styles.hbiGroupTitle}>
      <PccStatusPill tone={LINEAGE_STATE_TONES[group.state]}>
        {LINEAGE_STATE_LABELS[group.state]} ({group.rows.length})
      </PccStatusPill>
    </h4>
    <ul className={styles.hbiRowList} data-pcc-launch-pad-hbi-lineage-rows={group.state}>
      {group.rows.map((row) => (
        <HbiLineageRow key={row.fieldKey} row={row} />
      ))}
    </ul>
  </li>
);

interface HbiLineageRowProps {
  readonly row: IPccLaunchPadHbiLineageEntry;
}

const HbiLineageRow: FC<HbiLineageRowProps> = ({ row }) => (
  <li
    className={styles.hbiRow}
    data-pcc-launch-pad-hbi-lineage-entry={row.fieldKey}
    data-pcc-launch-pad-hbi-lineage-state={row.state}
  >
    <div className={styles.hbiRowHeader}>
      <span className={styles.hbiRowTitle}>{row.fieldLabel}</span>
    </div>
    <p className={styles.hbiRowTransformation}>{row.transformationNote}</p>
    <div className={styles.hbiRowMetaRow}>
      <PccStatusPill tone="neutral">Confidence: {row.confidenceBand}</PccStatusPill>
      <PccStatusPill tone="neutral">Freshness: {row.freshnessBand}</PccStatusPill>
    </div>
    <HbiLineageStateBody row={row} />
  </li>
);

const HbiLineageStateBody: FC<HbiLineageRowProps> = ({ row }) => {
  switch (row.state) {
    case 'citation-ready':
      return (
        <Fragment>
          <p className={styles.hbiRowAttribution} data-pcc-launch-pad-hbi-citation={row.fieldKey}>
            via {row.sourceListOrSystem} · {row.sourceObjectType}
          </p>
          <p className={styles.hbiRowCitationLabel}>{row.citationLabel}</p>
        </Fragment>
      );
    case 'refusal':
      return (
        <Fragment>
          <p
            className={styles.hbiRowRefusal}
            data-pcc-launch-pad-hbi-refusal-code={row.refusalCode}
          >
            {row.refusalCopy}
          </p>
        </Fragment>
      );
    case 'unauthorized':
      return (
        <p className={styles.hbiRowRedacted} data-pcc-launch-pad-hbi-redacted={row.fieldKey}>
          {row.redactedCaption}
        </p>
      );
    case 'loading':
      return <PccPreviewState state="loading" />;
    case 'unavailable':
    case 'insufficient-evidence':
    default:
      return null;
  }
};

export default PccExternalSystemsHbiLineageCard;
