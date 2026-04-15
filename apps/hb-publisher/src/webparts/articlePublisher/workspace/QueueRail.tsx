/**
 * Left draft rail for the Publisher workspace.
 *
 * Thin presentational wrapper over `DraftQueue` that renders the
 * rail header, the error/empty affordances, and the queue itself.
 * State is owned by `useDraftWorkspace`; render affordances live
 * here so the shell stays a composition root.
 */
import * as React from 'react';
import { HbcEmptyState } from '@hbc/ui-kit/homepage';
import type { WorkflowState } from '../../../data/publisherAdapter/index.js';
import { DraftQueue } from '../draftQueue/index.js';
import { PublisherButton } from '../sharedChrome/index.js';
import styles from '../article-publisher.module.css';
import type { DraftGroupMap } from './useDraftWorkspace.js';
import { COLLAPSED_GROUPS_BY_DEFAULT, DRAFT_GROUP_ORDER } from './useDraftWorkspace.js';

export interface QueueRailProps {
  readonly groups: DraftGroupMap;
  readonly groupsLoading: boolean;
  readonly groupsError: string | undefined;
  readonly hasAnyArticles: boolean;
  readonly selectedArticleId: string | undefined;
  readonly onSelect: (articleId: string) => void;
  readonly onReload: () => void;
  readonly onCreateNew: () => void;
  readonly actorEmail?: string;
  readonly spineSlot?: React.ReactNode;
}

export function QueueRail({
  groups,
  groupsLoading,
  groupsError,
  hasAnyArticles,
  selectedArticleId,
  onSelect,
  onReload,
  onCreateNew,
  actorEmail,
  spineSlot,
}: QueueRailProps) {
  return (
    <aside className={styles.draftRail} aria-label="Drafts and recent articles">
      <header className={styles.draftRailHeader}>
        <div className={styles.draftRailKicker}>Publisher</div>
        <div className={styles.draftRailTitle}>Drafts</div>
        <PublisherButton variant="primary" size="sm" onClick={onCreateNew}>
          + New draft
        </PublisherButton>
      </header>

      {groupsError ? (
        <div className={styles.railError} role="alert">
          <div>{groupsError}</div>
          <PublisherButton size="sm" onClick={onReload}>
            Try again
          </PublisherButton>
        </div>
      ) : !hasAnyArticles && !groupsLoading ? (
        <HbcEmptyState
          title="No articles yet"
          description="Start your first Project Spotlight to see it here."
        />
      ) : (
        <DraftQueue
          groupOrder={DRAFT_GROUP_ORDER as readonly WorkflowState[]}
          groups={groups}
          selectedArticleId={selectedArticleId}
          onSelect={onSelect}
          actorEmail={actorEmail}
          loading={groupsLoading && !hasAnyArticles}
          defaultCollapsed={COLLAPSED_GROUPS_BY_DEFAULT}
        />
      )}

      {spineSlot}
    </aside>
  );
}
