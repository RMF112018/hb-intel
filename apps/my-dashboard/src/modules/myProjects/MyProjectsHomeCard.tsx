import { useEffect, useMemo, useState } from 'react';
import type {
  MyProjectLinkItem,
  MyProjectLinksReadModel,
  MyWorkReadModelEnvelope,
  MyWorkReadModelSourceStatus,
} from '@hbc/models/myWork';
import { createMyWorkReadModelClient } from '../../api/myWorkReadModelClientFactory.js';
import { MyWorkCard } from '../../layout/MyWorkCard.js';
import { useMyWorkBentoContext } from '../../layout/MyWorkBentoGrid.js';
import type {
  MyWorkCardFootprint,
  MyWorkCardSpanOverrides,
} from '../../layout/myWorkFootprints.js';
import { ProjectPortfolioBrowser } from './ProjectPortfolioBrowser.js';
import { ProjectPortfolioTile } from './ProjectPortfolioTile.js';
import {
  resolveMyProjectsVisibleCount,
  selectVisibleProjects,
  sortMyProjectsForDisplay,
} from './myProjectPortfolioPresentation.js';
import styles from './MyProjectsHomeCard.module.css';

export interface MyProjectsHomeCardProps {
  readonly getApiToken?: () => Promise<string>;
  readonly footprint?: MyWorkCardFootprint;
  readonly spanOverrides?: MyWorkCardSpanOverrides;
}

const EMPTY_ITEMS: readonly MyProjectLinkItem[] = Object.freeze([]);

const LOADING_COPY = 'Loading your project links…';
const EMPTY_COPY = 'No assigned projects were found for your current project-role assignments.';
const PARTIAL_COPY =
  'Some launch destinations could not be fully verified. Available project links are shown below.';
const PRINCIPAL_UNRESOLVED_COPY =
  'We could not confirm your project assignment identity for this view.';
const SOURCE_UNAVAILABLE_COPY =
  'Project launch sources are temporarily unavailable. Try again shortly.';
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
  const { mode } = useMyWorkBentoContext();
  const client = useMemo(() => createMyWorkReadModelClient({ getApiToken }), [getApiToken]);
  const [isLoading, setIsLoading] = useState(true);
  const [envelope, setEnvelope] = useState<MyWorkReadModelEnvelope<MyProjectLinksReadModel> | null>(
    null,
  );
  const [openTileKey, setOpenTileKey] = useState<string | null>(null);
  const [browserOpen, setBrowserOpen] = useState(false);

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
  const bannerText = isLoading ? null : selectBannerText({ sourceStatus, sourceReadiness, items });

  const sortedItems = useMemo(() => sortMyProjectsForDisplay(items), [items]);
  const visibleCount = resolveMyProjectsVisibleCount(mode);
  const displayedItems = useMemo(
    () => selectVisibleProjects(sortedItems, mode, false),
    [sortedItems, mode],
  );
  const showRowDisclosure = sortedItems.length > visibleCount;

  const usableRowCount = isLoading ? 0 : sortedItems.length;
  const isPopulated = usableRowCount > 0;
  const compactState: 'loading' | 'empty' | 'banner-only' | null = isLoading
    ? 'loading'
    : isPopulated
      ? null
      : bannerText
        ? 'banner-only'
        : 'empty';

  useEffect(() => {
    if (openTileKey && !displayedItems.some((row) => row.recordKey === openTileKey)) {
      setOpenTileKey(null);
    }
  }, [displayedItems, openTileKey]);

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
      <div className={styles.masthead} data-my-projects-masthead="">
        <div className={styles.mastheadEyebrowRow}>
          <span className={styles.mastheadRule} aria-hidden="true" />
          {!isLoading && sortedItems.length > 0 ? (
            <span className={styles.mastheadCadence}>{sortedItems.length} active</span>
          ) : null}
        </div>
        <p className={styles.lead}>Open assigned projects in SharePoint or Procore.</p>
      </div>

      {bannerText ? (
        <div
          className={styles.banner}
          data-my-projects-readiness-banner={sourceStatus}
          data-my-projects-compact-state={
            compactState === 'banner-only' ? 'banner-only' : undefined
          }
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
        <div className={styles.portfolioRegion} data-my-projects-portfolio-region="">
          <div hidden data-my-projects-has-disclosure={showRowDisclosure ? 'true' : 'false'} />
          <div
            className={styles.grid}
            id="my-projects-tile-grid"
            data-my-projects-grid=""
            data-my-projects-mode={mode}
          >
            {displayedItems.map((row) => (
              <ProjectPortfolioTile
                key={row.recordKey}
                row={row}
                isOpen={openTileKey === row.recordKey}
                onOpenChange={(open) => setOpenTileKey(open ? row.recordKey : null)}
              />
            ))}
          </div>
          {showRowDisclosure ? (
            <button
              type="button"
              className={styles.disclosure}
              onClick={() => setBrowserOpen(true)}
              data-my-projects-view-all=""
            >
              View all projects
            </button>
          ) : null}
          {hasAnyUnavailableSharePoint(sortedItems) ? (
            <p className={styles.assistiveHint}>
              One or more projects do not currently have a SharePoint launch destination.
            </p>
          ) : null}
          {hasAnyUnavailableProcore(sortedItems) ? (
            <p className={styles.assistiveHint}>
              One or more projects do not currently have a Procore launch destination.
            </p>
          ) : null}
        </div>
      ) : null}

      <ProjectPortfolioBrowser
        items={sortedItems}
        mode={mode}
        isOpen={browserOpen}
        onOpenChange={setBrowserOpen}
      />
    </MyWorkCard>
  );
}

export default MyProjectsHomeCard;
