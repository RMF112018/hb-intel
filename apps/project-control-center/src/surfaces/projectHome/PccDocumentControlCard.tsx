import { useId, useMemo, useRef, useState, type FC, type KeyboardEvent } from 'react';
import {
  SAMPLE_PCC_DOCUMENT_CONTROL_HOME_FEED,
  type DocumentControlHomeFeedMode,
  type IPccDocumentControlHomeFeed,
  type IPccDocumentControlLatestChangeFeedItem,
  type IPccDocumentControlRecentFeedItem,
} from '@hbc/models/pcc';
import { PccDashboardCard } from '../../layout/PccDashboardCard';
import { PccPreviewState } from '../../ui/PccPreviewState';
import { PccProjectHomeGatewayAction } from './PccProjectHomeGatewayAction';
import type { PccProjectHomeCardProps } from './shared';
import styles from './PccProjectHome.module.css';

interface PccDocumentControlCardProps extends PccProjectHomeCardProps {
  readonly homeFeed?: IPccDocumentControlHomeFeed;
}

const FEED_TABS: readonly {
  readonly mode: DocumentControlHomeFeedMode;
  readonly label: string;
}[] = [
  { mode: 'my-recent-files', label: 'My Recent Files' },
  { mode: 'latest-changes', label: 'Latest Changes' },
] as const;

const EMPTY_FEED_COPY = 'No items available in this view yet.';

function formatUtcLabel(utc: string): string {
  if (Number.isNaN(Date.parse(utc))) return utc;
  return `${utc.slice(0, 16).replace('T', ' ')} UTC`;
}

function formatChangeKindLabel(changeKind: 'added' | 'updated'): 'Added' | 'Updated' {
  return changeKind === 'added' ? 'Added' : 'Updated';
}

function resolveHomeFeed(homeFeed?: IPccDocumentControlHomeFeed): IPccDocumentControlHomeFeed {
  return homeFeed ?? SAMPLE_PCC_DOCUMENT_CONTROL_HOME_FEED;
}

const RecentFeedRow: FC<{ item: IPccDocumentControlRecentFeedItem }> = ({ item }) => (
  <li
    className={styles.documentFeedRow}
    data-pcc-document-control-feed-item=""
    data-pcc-document-control-feed-item-id={item.id}
    data-pcc-document-control-feed-item-source={item.source}
    data-pcc-document-control-feed-item-kind={item.kind}
    data-pcc-document-control-feed-item-deep-link-posture={item.deepLinkPosture}
  >
    <p className={styles.documentFeedTitle}>{item.title}</p>
    <p className={styles.documentFeedMeta}>
      <span className={styles.documentFeedPill}>{item.source}</span>
      <span>{item.kind}</span>
      <span>{formatUtcLabel(item.accessedAtUtc)}</span>
    </p>
    <p className={styles.documentFeedContext}>{item.contextLabel}</p>
  </li>
);

const LatestChangesFeedRow: FC<{ item: IPccDocumentControlLatestChangeFeedItem }> = ({ item }) => (
  <li
    className={styles.documentFeedRow}
    data-pcc-document-control-feed-item=""
    data-pcc-document-control-feed-item-id={item.id}
    data-pcc-document-control-feed-item-source={item.source}
    data-pcc-document-control-feed-item-kind={item.kind}
    data-pcc-document-control-feed-item-deep-link-posture={item.deepLinkPosture}
    data-pcc-document-control-feed-change-kind={item.changeKind}
  >
    <p className={styles.documentFeedTitle}>{item.title}</p>
    <p className={styles.documentFeedMeta}>
      <span className={styles.documentFeedPill}>{item.source}</span>
      <span>{item.kind}</span>
      <span className={styles.documentFeedChangeKind}>
        {formatChangeKindLabel(item.changeKind)}
      </span>
      <span>{formatUtcLabel(item.changedAtUtc)}</span>
    </p>
    <p className={styles.documentFeedContext}>{item.contextLabel}</p>
  </li>
);

const DocumentControlFeedBody: FC<{ homeFeed?: IPccDocumentControlHomeFeed }> = ({ homeFeed }) => {
  const resolvedFeed = useMemo(() => resolveHomeFeed(homeFeed), [homeFeed]);
  const [activeMode, setActiveMode] = useState<DocumentControlHomeFeedMode>('my-recent-files');
  const [focusedIndex, setFocusedIndex] = useState(0);

  const tabIdBase = useId();
  const panelIdBase = useId();
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);

  const tabToItems: Readonly<Record<DocumentControlHomeFeedMode, readonly unknown[]>> = {
    'my-recent-files': resolvedFeed.myRecentFiles,
    'latest-changes': resolvedFeed.latestChanges,
  };

  function focusTab(index: number): void {
    const next = (index + FEED_TABS.length) % FEED_TABS.length;
    setFocusedIndex(next);
    tabRefs.current[next]?.focus();
  }

  function onTabKeyDown(event: KeyboardEvent<HTMLButtonElement>, index: number): void {
    switch (event.key) {
      case 'ArrowRight':
        event.preventDefault();
        focusTab(index + 1);
        return;
      case 'ArrowLeft':
        event.preventDefault();
        focusTab(index - 1);
        return;
      case 'Home':
        event.preventDefault();
        focusTab(0);
        return;
      case 'End':
        event.preventDefault();
        focusTab(FEED_TABS.length - 1);
        return;
      case 'Enter':
      case ' ': {
        event.preventDefault();
        const mode = FEED_TABS[focusedIndex]?.mode;
        if (mode !== undefined) setActiveMode(mode);
        return;
      }
      default:
        return;
    }
  }

  return (
    <div
      className={styles.documentFeedRoot}
      data-pcc-document-control-card=""
      data-pcc-document-control-feed-mode={activeMode}
    >
      {/* Prompt 09B keeps row-level deep links deferred until canonical path
          resolution and authorization gates are approved in a later phase. */}
      <div
        className={styles.documentFeedTabs}
        role="tablist"
        aria-label="Document Control feed views"
      >
        {FEED_TABS.map(({ mode, label }, index) => {
          const active = activeMode === mode;
          const tabId = `${tabIdBase}-${mode}`;
          const panelId = `${panelIdBase}-${mode}`;
          return (
            <button
              key={mode}
              ref={(el) => {
                tabRefs.current[index] = el;
              }}
              type="button"
              id={tabId}
              role="tab"
              aria-controls={panelId}
              aria-selected={active ? 'true' : 'false'}
              tabIndex={focusedIndex === index ? 0 : -1}
              className={styles.documentFeedTab}
              data-pcc-document-control-feed-tab={mode}
              data-pcc-document-control-feed-tab-state={active ? 'active' : 'inactive'}
              onClick={() => {
                setFocusedIndex(index);
                setActiveMode(mode);
              }}
              onKeyDown={(event) => onTabKeyDown(event, index)}
            >
              {label}
            </button>
          );
        })}
      </div>

      {FEED_TABS.map(({ mode }) => {
        const active = activeMode === mode;
        const tabId = `${tabIdBase}-${mode}`;
        const panelId = `${panelIdBase}-${mode}`;
        const items = tabToItems[mode];

        return (
          <section
            key={mode}
            id={panelId}
            role="tabpanel"
            aria-labelledby={tabId}
            hidden={!active}
            className={styles.documentFeedPanel}
            data-pcc-document-control-feed-panel={mode}
            data-pcc-document-control-feed-panel-state={active ? 'active' : 'inactive'}
          >
            {items.length === 0 ? (
              <p className={styles.documentFeedEmpty}>{EMPTY_FEED_COPY}</p>
            ) : mode === 'my-recent-files' ? (
              <ul className={styles.documentFeedList}>
                {resolvedFeed.myRecentFiles.map((item) => (
                  <RecentFeedRow key={item.id} item={item} />
                ))}
              </ul>
            ) : (
              <ul className={styles.documentFeedList}>
                {resolvedFeed.latestChanges.map((item) => (
                  <LatestChangesFeedRow key={item.id} item={item} />
                ))}
              </ul>
            )}
          </section>
        );
      })}
    </div>
  );
};

export const PccDocumentControlCard: FC<PccDocumentControlCardProps> = ({
  state = 'preview',
  homeFeed,
  spanOverrides,
  gateway,
  onSelectModule,
}) => (
  <PccDashboardCard
    footprint="wide"
    tier="tier2"
    region="operational"
    eyebrow="Documents"
    title="Document Control Center"
    spanOverrides={spanOverrides}
    action={
      gateway ? (
        <PccProjectHomeGatewayAction gateway={gateway} onSelectModule={onSelectModule} />
      ) : undefined
    }
  >
    {state === 'preview' ? (
      <DocumentControlFeedBody homeFeed={homeFeed} />
    ) : (
      <PccPreviewState state={state} />
    )}
  </PccDashboardCard>
);

export default PccDocumentControlCard;
