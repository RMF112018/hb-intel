import type { FC } from 'react';
import { PccStatusPill } from '../../ui/PccStatusPill';
import type { IPccLaunchPadMappingRow } from './launchPadViewModel';
import styles from './PccExternalSystemsSurface.module.css';

export interface PccExternalSystemsMappingDetailProps {
  readonly row: IPccLaunchPadMappingRow;
}

export const PccExternalSystemsMappingDetail: FC<PccExternalSystemsMappingDetailProps> = ({
  row,
}) => (
  <section
    className={styles.mappingDetail}
    data-pcc-launch-pad-mapping-detail={row.id}
    aria-label={`Mapping ${row.id} details`}
  >
    <header className={styles.mappingDetailHeader}>
      <h5 className={styles.mappingDetailTitle}>Mapping detail</h5>
      <PccStatusPill tone="info">{row.mappingState}</PccStatusPill>
    </header>
    <dl className={styles.mappingDetailDl}>
      <dt>Mapping id</dt>
      <dd>{row.id}</dd>
      <dt>System</dt>
      <dd>{row.systemDisplayName}</dd>
      <dt>Scope</dt>
      <dd>{row.mappingScope}</dd>
      <dt>Source object type</dt>
      <dd>{row.sourceObjectType}</dd>
      <dt>External display name</dt>
      <dd>{row.externalDisplayName}</dd>
      <dt>Owner</dt>
      <dd>
        {row.ownerPersona} · {row.ownerUpn}
      </dd>
      <dt>Last verified</dt>
      <dd>{row.lastVerifiedDisplay}</dd>
      {row.externalObjectId !== undefined ? (
        <>
          <dt>External object id</dt>
          <dd data-pcc-launch-pad-mapping-external-object-id={row.externalObjectId}>
            {row.externalObjectNumber ?? row.externalObjectId}
          </dd>
        </>
      ) : null}
      {row.conflictingMappingId !== undefined ? (
        <>
          <dt>Conflicting mapping</dt>
          <dd data-pcc-launch-pad-mapping-conflicting-id={row.conflictingMappingId}>
            {row.conflictingMappingId}
          </dd>
        </>
      ) : null}
      {row.reviewItemId !== null ? (
        <>
          <dt>Linked review item</dt>
          <dd>
            <span
              className={styles.mappingReviewBadge}
              data-pcc-launch-pad-mapping-review-item={row.reviewItemId}
            >
              {row.reviewItemId}
            </span>
            <span className={styles.mappingReviewNote}>
              {' '}
              · See Custom Link Review Queue above. Wave 14 owns approval / checkpoint semantics —
              cross-reference only.
            </span>
          </dd>
        </>
      ) : null}
    </dl>
  </section>
);

export default PccExternalSystemsMappingDetail;
