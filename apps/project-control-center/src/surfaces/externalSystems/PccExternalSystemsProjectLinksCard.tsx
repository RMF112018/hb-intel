import { forwardRef, type FC, type Ref } from 'react';
import { PccDashboardCard } from '../../layout/PccDashboardCard';
import { PccPreviewState, type PccPreviewStateKind } from '../../ui/PccPreviewState';
import { PccStatusPill, type PccStatusPillTone } from '../../ui/PccStatusPill';
import type {
  IPccLaunchPadLinkGroup,
  IPccLaunchPadLinkRow,
  IPccLaunchPadProjectLinksViewModel,
} from './launchPadViewModel';
import type { ProjectExternalLinkApprovalState } from '@hbc/models/pcc';
import styles from './PccExternalSystemsSurface.module.css';

const APPROVAL_STATE_TONES: Readonly<Record<ProjectExternalLinkApprovalState, PccStatusPillTone>> =
  {
    draft: 'neutral',
    submitted: 'info',
    approved: 'success',
    rejected: 'danger',
    'blocked-by-policy': 'danger',
    archived: 'neutral',
    superseded: 'neutral',
  };

export interface PccExternalSystemsProjectLinksCardProps {
  readonly projectLinks: IPccLaunchPadProjectLinksViewModel;
  readonly cardState: PccPreviewStateKind;
  readonly isAvailable: boolean;
  readonly onOpenAddLinkDrawer?: () => void;
  readonly addLinkButtonRef?: Ref<HTMLButtonElement>;
}

const AddLinkAction = forwardRef<HTMLButtonElement, { readonly onOpen: () => void }>(
  function AddLinkAction({ onOpen }, ref) {
    return (
      <button
        ref={ref}
        type="button"
        className={styles.addLinkAction}
        onClick={onOpen}
        data-pcc-launch-pad-add-link-trigger=""
        aria-label="Add or edit project launch link"
      >
        Add project link
      </button>
    );
  },
);

export const PccExternalSystemsProjectLinksCard = ({
  projectLinks,
  cardState,
  isAvailable,
  onOpenAddLinkDrawer,
  addLinkButtonRef,
}: PccExternalSystemsProjectLinksCardProps) => (
  <PccDashboardCard
    footprint="full"
    eyebrow="Launch links"
    title="Project launch links"
    action={
      onOpenAddLinkDrawer ? (
        <AddLinkAction ref={addLinkButtonRef} onOpen={onOpenAddLinkDrawer} />
      ) : undefined
    }
  >
    <div
      className={styles.body}
      data-pcc-readiness-section="external-systems"
      data-pcc-launch-pad-lane="project-links"
    >
      {!isAvailable ? (
        <PccPreviewState state={cardState} />
      ) : projectLinks.totalLinks === 0 ? (
        <PccPreviewState state="empty" />
      ) : (
        <ul className={styles.linkGroupList} data-pcc-launch-pad-link-groups="">
          {projectLinks.groups.map((group) => (
            <LinkGroupSection key={group.category} group={group} />
          ))}
        </ul>
      )}
    </div>
  </PccDashboardCard>
);

interface LinkGroupSectionProps {
  readonly group: IPccLaunchPadLinkGroup;
}

const LinkGroupSection: FC<LinkGroupSectionProps> = ({ group }) => (
  <li className={styles.linkGroup} data-pcc-launch-pad-link-group={group.category}>
    <h4 className={styles.linkGroupTitle}>{group.category}</h4>
    <ul className={styles.linkRowList} data-pcc-launch-pad-link-rows={group.category}>
      {group.rows.map((row) => (
        <LinkRow key={row.id} row={row} />
      ))}
    </ul>
  </li>
);

interface LinkRowProps {
  readonly row: IPccLaunchPadLinkRow;
}

const LinkRow: FC<LinkRowProps> = ({ row }) => {
  const approvalTone = APPROVAL_STATE_TONES[row.approvalState];
  const policyTone: PccStatusPillTone = row.urlPolicyState === 'allowed' ? 'success' : 'warning';
  return (
    <li
      className={styles.linkRow}
      data-pcc-launch-pad-link={row.id}
      data-pcc-launch-pad-link-system={row.systemKey}
      data-pcc-launch-pad-link-approval-state={row.approvalState}
      data-pcc-launch-pad-link-policy-state={row.urlPolicyState}
      data-pcc-launch-pad-link-allowed={row.policyAndApprovalAllowed ? 'true' : 'false'}
    >
      <div className={styles.linkRowTitleRow}>
        <span className={styles.linkRowTitle}>{row.title}</span>
        <span className={styles.linkRowProvider}>{row.systemDisplayName}</span>
      </div>
      <div className={styles.linkRowMetaRow}>
        <PccStatusPill tone={approvalTone}>{row.approvalState}</PccStatusPill>
        <PccStatusPill tone={policyTone}>{row.urlPolicyState}</PccStatusPill>
        <span className={styles.linkRowMetaItem}>Type: {row.linkType}</span>
        <span className={styles.linkRowMetaItem} data-pcc-launch-pad-link-hostname={row.hostname}>
          Host: {row.hostname}
        </span>
        {row.openInNewTab ? (
          <span className={styles.linkRowMetaItem} data-pcc-launch-pad-link-open-in-new-tab="true">
            Opens in new tab
          </span>
        ) : null}
      </div>
      <div className={styles.linkRowActionRow}>
        <button
          type="button"
          disabled
          aria-disabled="true"
          className={styles.linkRowAction}
          data-pcc-launch-pad-link-action="open"
          data-pcc-launch-pad-link-action-state="preview-disabled"
        >
          Open external system
        </button>
        <span className={styles.linkRowReason} data-pcc-launch-pad-link-disabled-reason={row.id}>
          {row.disabledReason}
        </span>
      </div>
    </li>
  );
};

export default PccExternalSystemsProjectLinksCard;
