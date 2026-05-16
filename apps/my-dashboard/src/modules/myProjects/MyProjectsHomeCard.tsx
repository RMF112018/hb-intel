import { useEffect, useMemo, useRef, useState } from 'react';
import type {
  MyProjectLinkItem,
  MyProjectLinksReadModel,
  MyWorkReadModelEnvelope,
  MyWorkReadModelSourceStatus,
} from '@hbc/models/myWork';
import { MY_PROJECT_ASSIGNMENT_ROLE_BY_ID } from '@hbc/models/myWork';
import { createMyWorkReadModelClient } from '../../api/myWorkReadModelClientFactory.js';
import { MyWorkCard } from '../../layout/MyWorkCard.js';
import type { MyWorkCardFootprint, MyWorkCardSpanOverrides } from '../../layout/myWorkFootprints.js';
import styles from './MyProjectsHomeCard.module.css';

export interface MyProjectsHomeCardProps {
  readonly getApiToken?: () => Promise<string>;
  readonly footprint?: MyWorkCardFootprint;
  readonly spanOverrides?: MyWorkCardSpanOverrides;
}

const EMPTY_ITEMS: readonly MyProjectLinkItem[] = Object.freeze([]);
const INITIAL_VISIBLE_ROWS = 5;

const LOADING_COPY = 'Loading your project links…';
const EMPTY_COPY = 'No assigned projects were found for your current project-role assignments.';
const PARTIAL_COPY =
  'Some launch destinations could not be fully verified. Available project links are shown below.';
const PRINCIPAL_UNRESOLVED_COPY =
  'We could not confirm your project assignment identity for this view.';
const SOURCE_UNAVAILABLE_COPY = 'Project launch sources are temporarily unavailable. Try again shortly.';
const BACKEND_UNAVAILABLE_COPY =
  'Project links are temporarily unavailable while the My Dashboard service is unreachable.';
const BOUNDED_SOURCE_COPY =
  'Your project list is available, but the source inventory exceeded the current review limit. Some assignments may not yet be shown.';

function hasBoundedWarning(items: readonly MyProjectLinkItem[]): boolean {
  return items.some((item) =>
    item.warnings.some((warning) => warning.code === 'assignment-source-bounded'),
  );
}

function selectBannerText(params: {
  readonly sourceStatus: MyWorkReadModelSourceStatus;
  readonly sourceReadiness: MyProjectLinksReadModel['sourceReadiness'] | null;
  readonly items: readonly MyProjectLinkItem[];
}): string | null {
  if (params.sourceStatus === 'principal-unresolved') {
    return PRINCIPAL_UNRESOLVED_COPY;
  }
  if (hasBoundedWarning(params.items)) {
    return BOUNDED_SOURCE_COPY;
  }
  if (
    params.sourceStatus === 'partial' ||
    params.sourceReadiness?.projects === 'partial' ||
    params.sourceReadiness?.legacyFallbackRegistry === 'partial'
  ) {
    return PARTIAL_COPY;
  }
  if (
    params.sourceStatus === 'source-unavailable' ||
    params.sourceReadiness?.projects === 'source-unavailable' ||
    params.sourceReadiness?.legacyFallbackRegistry === 'source-unavailable'
  ) {
    return SOURCE_UNAVAILABLE_COPY;
  }
  if (params.sourceStatus === 'backend-unavailable') {
    return BACKEND_UNAVAILABLE_COPY;
  }
  return null;
}

function sourceBadgeLabel(source: MyProjectLinkItem['source']): string {
  if (source === 'projects-only') return 'Project Site';
  if (source === 'merged') return 'Site + Legacy';
  return 'Legacy Folder';
}

function roleLabels(
  roles: readonly MyProjectLinkItem['assignmentRoles'][number][],
): readonly string[] {
  return roles
    .map((roleId) => MY_PROJECT_ASSIGNMENT_ROLE_BY_ID[roleId])
    .sort((a, b) => a.priority - b.priority)
    .map((definition) => definition.displayLabel);
}

function rowHasProcoreInvalidWarning(row: MyProjectLinkItem): boolean {
  return row.warnings.some((warning) => warning.code === 'procore-project-invalid');
}

function ActionSlot({
  area,
  row,
}: {
  readonly area: 'sharepoint' | 'procore';
  readonly row: MyProjectLinkItem;
}) {
  if (area === 'sharepoint') {
    const action = row.sharePointAction;
    if (action.state === 'available' && action.href) {
      return (
        <a
          href={action.href}
          target="_blank"
          rel="noopener noreferrer"
          className={styles.actionLink}
          data-my-projects-action-slot="sharepoint"
          data-my-projects-action-state="available"
        >
          {action.label}
        </a>
      );
    }
    return (
      <span
        className={styles.actionUnavailable}
        data-my-projects-action-slot="sharepoint"
        data-my-projects-action-state="unavailable"
        aria-label="SharePoint unavailable for this project."
      >
        SharePoint unavailable
      </span>
    );
  }

  const action = row.procoreAction;
  if (action.state === 'available' && action.href) {
    return (
      <a
        href={action.href}
        target="_blank"
        rel="noopener noreferrer"
        className={styles.actionLink}
        data-my-projects-action-slot="procore"
        data-my-projects-action-state="available"
      >
        Open Procore
      </a>
    );
  }

  const invalidToken = rowHasProcoreInvalidWarning(row);
  const unavailableReason = invalidToken
    ? 'Procore unavailable due to invalid project token.'
    : 'Procore unavailable for this project.';
  return (
    <span
      className={styles.actionUnavailable}
      data-my-projects-action-slot="procore"
      data-my-projects-action-state="unavailable"
      aria-label={unavailableReason}
    >
      Procore unavailable
    </span>
  );
}

function RoleChips({
  rowKey,
  roles,
}: {
  readonly rowKey: string;
  readonly roles: readonly MyProjectLinkItem['assignmentRoles'][number][];
}) {
  const labels = roleLabels(roles);
  const inline = labels.slice(0, 2);
  const overflow = labels.slice(2);
  const [showOverflow, setShowOverflow] = useState(false);

  return (
    <div className={styles.roleZone} data-my-projects-role-zone="">
      {inline.map((label) => (
        <span key={`${rowKey}:${label}`} className={styles.roleChip} data-my-projects-role-chip="">
          {label}
        </span>
      ))}
      {overflow.length > 0 ? (
        <>
          <button
            type="button"
            className={styles.roleOverflowButton}
            aria-expanded={showOverflow ? 'true' : 'false'}
            aria-controls={`my-projects-overflow-roles-${rowKey}`}
            onClick={() => setShowOverflow((current) => !current)}
            data-my-projects-role-overflow-button=""
          >
            +{overflow.length}
          </button>
          <div
            id={`my-projects-overflow-roles-${rowKey}`}
            className={styles.roleOverflowDetails}
            hidden={!showOverflow}
            data-my-projects-role-overflow-details=""
          >
            {overflow.join(', ')}
          </div>
        </>
      ) : null}
    </div>
  );
}

function ProjectLaunchRow({ row }: { readonly row: MyProjectLinkItem }) {
  return (
    <li
      className={styles.row}
      data-my-projects-row={row.recordKey}
      data-my-projects-row-source={row.source}
    >
      <div className={styles.rowTop}>
        <span
          className={styles.sourceBadge}
          data-my-projects-source-badge={row.source}
          title={sourceBadgeLabel(row.source)}
        >
          {sourceBadgeLabel(row.source)}
        </span>
        <span className={styles.projectNumber}>{row.projectNumber}</span>
      </div>
      <p className={styles.projectName}>{row.projectName}</p>
      {row.projectStage ? <p className={styles.projectStage}>{row.projectStage}</p> : null}

      <RoleChips rowKey={row.recordKey} roles={row.assignmentRoles} />

      <div className={styles.actionRail} aria-label="Project launch actions">
        <ActionSlot area="sharepoint" row={row} />
        <ActionSlot area="procore" row={row} />
      </div>
    </li>
  );
}

function hasDisclosure(items: readonly MyProjectLinkItem[]): boolean {
  return items.length > INITIAL_VISIBLE_ROWS;
}

function visibleItems(
  items: readonly MyProjectLinkItem[],
  expanded: boolean,
): readonly MyProjectLinkItem[] {
  if (expanded) return items;
  return items.slice(0, INITIAL_VISIBLE_ROWS);
}

function hasAnyUnavailableSharePoint(items: readonly MyProjectLinkItem[]): boolean {
  return items.some((item) => item.sharePointAction.state === 'unavailable');
}

function hasAnyUnavailableProcore(items: readonly MyProjectLinkItem[]): boolean {
  return items.some((item) => item.procoreAction.state === 'unavailable');
}

export function MyProjectsHomeCard({
  getApiToken,
  footprint = 'full',
  spanOverrides,
}: MyProjectsHomeCardProps) {
  const client = useMemo(() => createMyWorkReadModelClient({ getApiToken }), [getApiToken]);
  const [isLoading, setIsLoading] = useState(true);
  const [expanded, setExpanded] = useState(false);
  const [envelope, setEnvelope] = useState<MyWorkReadModelEnvelope<MyProjectLinksReadModel> | null>(
    null,
  );
  const disclosureButtonRef = useRef<HTMLButtonElement | null>(null);
  const restoreDisclosureFocusRef = useRef(false);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    void client
      .getMyProjectLinks()
      .then((result) => {
        if (!cancelled) {
          setEnvelope(result);
          setIsLoading(false);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setEnvelope(null);
          setIsLoading(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [client]);

  const sourceStatus: MyWorkReadModelSourceStatus = envelope?.sourceStatus ?? 'backend-unavailable';
  const items = envelope?.data.items ?? EMPTY_ITEMS;
  const sourceReadiness = envelope?.data.sourceReadiness ?? null;
  const bannerText = isLoading
    ? null
    : selectBannerText({ sourceStatus, sourceReadiness, items });
  const displayedItems = visibleItems(items, expanded);
  const showRowDisclosure = hasDisclosure(items);
  const usableRowCount = isLoading ? 0 : items.length;
  const isPopulated = usableRowCount > 0;
  const compactState: 'loading' | 'empty' | 'banner-only' | null = isLoading
    ? 'loading'
    : isPopulated
      ? null
      : bannerText
        ? 'banner-only'
        : 'empty';

  const handleToggleDisclosure = () => {
    setExpanded((current) => {
      const next = !current;
      if (current === true && next === false) {
        restoreDisclosureFocusRef.current = true;
      }
      return next;
    });
  };

  useEffect(() => {
    if (!expanded && restoreDisclosureFocusRef.current) {
      disclosureButtonRef.current?.focus();
      restoreDisclosureFocusRef.current = false;
    }
  }, [expanded]);

  return (
    <MyWorkCard
      role="my-projects-home"
      footprint={footprint}
      spanOverrides={spanOverrides}
      eyebrow="My Portfolio"
      title="My Projects"
      extraDataAttributes={{
        'data-my-project-links-source-status': sourceStatus,
        'data-my-projects-visible-count': String(displayedItems.length),
      }}
    >
      <p className={styles.purpose}>Open assigned projects in SharePoint or Procore.</p>

      {bannerText ? (
        <div
          className={styles.banner}
          data-my-projects-readiness-banner={sourceStatus}
          data-my-projects-compact-state={compactState === 'banner-only' ? 'banner-only' : undefined}
        >
          <p className={styles.bannerText}>{bannerText}</p>
        </div>
      ) : null}

      {compactState === 'loading' ? (
        <div
          className={styles.compactBlock}
          data-my-projects-compact-state="loading"
          role="status"
          aria-live="polite"
        >
          <p className={styles.compactBlockText}>{LOADING_COPY}</p>
        </div>
      ) : null}

      {compactState === 'empty' ? (
        <div className={styles.compactBlock} data-my-projects-compact-state="empty">
          <p className={styles.compactBlockText}>{EMPTY_COPY}</p>
        </div>
      ) : null}

      {isPopulated ? (
        <div className={styles.launchRegion} data-my-projects-launch-region="">
          <div
            data-my-projects-expanded={expanded ? 'true' : 'false'}
            data-my-projects-has-disclosure={showRowDisclosure ? 'true' : 'false'}
          />
          <ul className={styles.rows} id="my-projects-row-list" data-my-projects-rows="">
            {displayedItems.map((row) => (
              <ProjectLaunchRow key={row.recordKey} row={row} />
            ))}
          </ul>
          {showRowDisclosure ? (
            <button
              ref={disclosureButtonRef}
              type="button"
              className={styles.disclosure}
              aria-expanded={expanded ? 'true' : 'false'}
              aria-controls="my-projects-row-list"
              onClick={handleToggleDisclosure}
              data-my-projects-disclosure=""
            >
              {expanded ? 'Show fewer' : 'View all My Projects'}
            </button>
          ) : null}
          {hasAnyUnavailableSharePoint(items) ? (
            <p className={styles.assistiveHint}>
              One or more projects do not currently have a SharePoint launch destination.
            </p>
          ) : null}
          {hasAnyUnavailableProcore(items) ? (
            <p className={styles.assistiveHint}>
              One or more projects do not currently have a Procore launch destination.
            </p>
          ) : null}
        </div>
      ) : null}
    </MyWorkCard>
  );
}

export default MyProjectsHomeCard;
