import { Fragment, type FC } from 'react';
import type { ExternalSystemMappingState } from '@hbc/models/pcc';
import { PccDashboardCard } from '../../layout/PccDashboardCard';
import { PccPreviewState, type PccPreviewStateKind } from '../../ui/PccPreviewState';
import { PccStatusPill, type PccStatusPillTone } from '../../ui/PccStatusPill';
import { PccExternalSystemsMappingDetail } from './PccExternalSystemsMappingDetail';
import type {
  IPccLaunchPadMappingRow,
  IPccLaunchPadMappingStatusGroup,
  IPccLaunchPadMappingStatusViewModel,
} from './launchPadViewModel';
import styles from './PccExternalSystemsSurface.module.css';

const MAPPING_STATE_TONES: Readonly<Record<ExternalSystemMappingState, PccStatusPillTone>> = {
  'not-mapped': 'neutral',
  mapped: 'info',
  stale: 'warning',
  conflict: 'danger',
  missing: 'warning',
  'review-required': 'warning',
  blocked: 'danger',
  confirmed: 'success',
};

const MAPPING_STATE_LABELS: Readonly<Record<ExternalSystemMappingState, string>> = {
  'not-mapped': 'Not mapped',
  mapped: 'Mapped',
  stale: 'Stale',
  conflict: 'Conflict',
  missing: 'Missing',
  'review-required': 'Review required',
  blocked: 'Blocked',
  confirmed: 'Confirmed',
};

export interface PccExternalSystemsMappingStatusCardProps {
  readonly mappingStatus: IPccLaunchPadMappingStatusViewModel;
  readonly cardState: PccPreviewStateKind;
  readonly isAvailable: boolean;
  readonly selectedMappingId: string | null;
  readonly onSelectMapping: (id: string | null) => void;
}

export const PccExternalSystemsMappingStatusCard: FC<PccExternalSystemsMappingStatusCardProps> = ({
  mappingStatus,
  cardState,
  isAvailable,
  selectedMappingId,
  onSelectMapping,
}) => (
  <PccDashboardCard
    footprint="full"
    tier="tier2"
    region="detail"
    eyebrow="Mapping"
    title="Mapping status"
  >
    <div
      className={styles.body}
      data-pcc-readiness-section="external-systems"
      data-pcc-launch-pad-lane="mapping-status"
    >
      {!isAvailable ? (
        <PccPreviewState state={cardState} />
      ) : mappingStatus.totalMappings === 0 ? (
        <PccPreviewState state="empty" />
      ) : (
        <ul className={styles.mappingGroupList} data-pcc-launch-pad-mapping-groups="">
          {mappingStatus.groups.map((group) =>
            group.rows.length === 0 ? null : (
              <MappingGroupSection
                key={group.mappingState}
                group={group}
                selectedMappingId={selectedMappingId}
                onSelectMapping={onSelectMapping}
              />
            ),
          )}
        </ul>
      )}
    </div>
  </PccDashboardCard>
);

interface MappingGroupSectionProps {
  readonly group: IPccLaunchPadMappingStatusGroup;
  readonly selectedMappingId: string | null;
  readonly onSelectMapping: (id: string | null) => void;
}

const MappingGroupSection: FC<MappingGroupSectionProps> = ({
  group,
  selectedMappingId,
  onSelectMapping,
}) => (
  <li className={styles.mappingGroup} data-pcc-launch-pad-mapping-group={group.mappingState}>
    <h4 className={styles.mappingGroupTitle}>
      <PccStatusPill tone={MAPPING_STATE_TONES[group.mappingState]}>
        {MAPPING_STATE_LABELS[group.mappingState]} ({group.rows.length})
      </PccStatusPill>
    </h4>
    <ul className={styles.mappingRowList} data-pcc-launch-pad-mapping-rows={group.mappingState}>
      {group.rows.map((row) => (
        <MappingRow
          key={row.id}
          row={row}
          isSelected={row.id === selectedMappingId}
          onSelectMapping={onSelectMapping}
        />
      ))}
    </ul>
  </li>
);

interface MappingRowProps {
  readonly row: IPccLaunchPadMappingRow;
  readonly isSelected: boolean;
  readonly onSelectMapping: (id: string | null) => void;
}

const MappingRow: FC<MappingRowProps> = ({ row, isSelected, onSelectMapping }) => {
  const handleToggle = (): void => {
    onSelectMapping(isSelected ? null : row.id);
  };
  return (
    <li
      className={styles.mappingRow}
      data-pcc-launch-pad-mapping-row={row.id}
      data-pcc-launch-pad-mapping-state={row.mappingState}
      data-pcc-launch-pad-mapping-system={row.systemKey}
      {...(row.conflictingMappingId !== undefined
        ? { 'data-pcc-launch-pad-mapping-conflicting-id': row.conflictingMappingId }
        : {})}
      {...(row.externalObjectId !== undefined
        ? { 'data-pcc-launch-pad-mapping-has-external-object': 'true' }
        : {})}
    >
      <button
        type="button"
        className={styles.mappingRowTrigger}
        onClick={handleToggle}
        aria-expanded={isSelected ? 'true' : 'false'}
        aria-controls={`mapping-detail-${row.id}`}
        aria-label={`Show details for mapping ${row.id}`}
        data-pcc-launch-pad-mapping-row-trigger=""
      >
        <span className={styles.mappingRowTitleRow}>
          <span className={styles.mappingRowTitle}>{row.externalDisplayName}</span>
          <span className={styles.mappingRowProvider}>{row.systemDisplayName}</span>
        </span>
        <span className={styles.mappingRowMetaRow}>
          <span className={styles.mappingRowMetaItem}>Scope: {row.mappingScope}</span>
          <span className={styles.mappingRowMetaItem}>Owner: {row.ownerPersona}</span>
          <span className={styles.mappingRowMetaItem}>Verified: {row.lastVerifiedDisplay}</span>
          {row.reviewItemId !== null ? (
            <span
              className={styles.mappingReviewBadge}
              data-pcc-launch-pad-mapping-review-cross-ref={row.reviewItemId}
            >
              Linked review item
            </span>
          ) : null}
        </span>
      </button>
      {isSelected ? (
        <Fragment>
          <div id={`mapping-detail-${row.id}`}>
            <PccExternalSystemsMappingDetail row={row} />
          </div>
        </Fragment>
      ) : null}
    </li>
  );
};

export default PccExternalSystemsMappingStatusCard;
