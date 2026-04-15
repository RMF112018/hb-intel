/**
 * Workspace orchestration for the Publisher shell.
 *
 * Owns the left-rail queue state (groups, loading, error, collapse),
 * the active promotion ruleset, and the selected-article identity.
 * The hook is deliberately narrow: it does not own the authoring
 * draft, lifecycle handlers, or preview state — those live in the
 * shell until Workstream I Prompt 04 extracts controller hooks.
 */
import * as React from 'react';
import {
  SUPPORTED_DESTINATIONS,
  isDestinationSupported,
  type PublisherArticleRow,
  type PublisherPromotionRuleRow,
  type PublisherRepositories,
  type WorkflowState,
} from '../../../data/publisherAdapter/index.js';

/**
 * Order the left draft rail groups surfaces in. The editorial rail
 * presents drafts first, then in-review, then approved, then published;
 * archived, withdrawn, and legacy `scheduled` follow as collapsed-by-
 * default residual groups.
 *
 * Phase-09 Prompt-05: `scheduled` is included here (Option B —
 * quarantine) rather than silently omitted. There is still no
 * scheduled-publish executor and no inbound transition targets
 * `scheduled` (see `workflowStateMachine.ts`), so legacy rows are
 * read-compatible only — but operators can see them in the rail,
 * move them to `approved` or `withdrawn`, and slug governance scans
 * include their slugs. Silent omission previously made these rows
 * invisible to authoring safeguards; that is the defect this prompt
 * closes. Rail group label is "Scheduled (legacy)" so the
 * quarantine is visually explicit.
 */
export const DRAFT_GROUP_ORDER: readonly WorkflowState[] = [
  'draft',
  'review',
  'approved',
  'published',
  'archived',
  'withdrawn',
  'scheduled',
];

export const COLLAPSED_GROUPS_BY_DEFAULT: ReadonlySet<WorkflowState> = new Set([
  'archived',
  'withdrawn',
  'scheduled',
]);

export interface DraftGroupMap {
  readonly draft: readonly PublisherArticleRow[];
  readonly review: readonly PublisherArticleRow[];
  readonly approved: readonly PublisherArticleRow[];
  readonly scheduled: readonly PublisherArticleRow[];
  readonly published: readonly PublisherArticleRow[];
  readonly archived: readonly PublisherArticleRow[];
  readonly withdrawn: readonly PublisherArticleRow[];
}

export const EMPTY_DRAFT_GROUPS: DraftGroupMap = {
  draft: [],
  review: [],
  approved: [],
  scheduled: [],
  published: [],
  archived: [],
  withdrawn: [],
};

export interface DraftWorkspaceHandle {
  readonly groups: DraftGroupMap;
  readonly groupsLoading: boolean;
  readonly groupsError: string | undefined;
  readonly hasAnyArticles: boolean;
  readonly collapsedGroups: ReadonlySet<WorkflowState>;
  readonly toggleGroupCollapsed: (state: WorkflowState) => void;
  readonly promotionRules: readonly PublisherPromotionRuleRow[];
  readonly selectedArticleId: string | undefined;
  readonly setSelectedArticleId: React.Dispatch<React.SetStateAction<string | undefined>>;
  readonly reloadGroups: () => Promise<void>;
}

export function useDraftWorkspace(
  repositories: PublisherRepositories,
): DraftWorkspaceHandle {
  const [groups, setGroups] = React.useState<DraftGroupMap>(EMPTY_DRAFT_GROUPS);
  const [groupsLoading, setGroupsLoading] = React.useState(false);
  const [groupsError, setGroupsError] = React.useState<string | undefined>();
  const [collapsedGroups, setCollapsedGroups] = React.useState<ReadonlySet<WorkflowState>>(
    () => new Set(COLLAPSED_GROUPS_BY_DEFAULT),
  );
  const [promotionRules, setPromotionRules] = React.useState<readonly PublisherPromotionRuleRow[]>([]);
  const [selectedArticleId, setSelectedArticleId] = React.useState<string | undefined>();

  const reloadGroups = React.useCallback(async () => {
    setGroupsLoading(true);
    setGroupsError(undefined);
    try {
      const results = await Promise.all(
        DRAFT_GROUP_ORDER.map((state) =>
          repositories.articles.listByWorkflowState(state, {
            destinations: SUPPORTED_DESTINATIONS,
          }),
        ),
      );
      // Defense-in-depth: this surface is project-spotlight scoped.
      const next: DraftGroupMap = { ...EMPTY_DRAFT_GROUPS };
      DRAFT_GROUP_ORDER.forEach((state, i) => {
        const rows = results[i]!.filter((row) => isDestinationSupported(row.Destination));
        (next as Record<WorkflowState, readonly PublisherArticleRow[]>)[state] = rows;
      });
      setGroups(next);
    } catch (err) {
      setGroupsError(err instanceof Error ? err.message : 'Failed to load articles.');
    } finally {
      setGroupsLoading(false);
    }
  }, [repositories]);

  React.useEffect(() => {
    void reloadGroups();
  }, [reloadGroups]);

  // Load active promotion rules once per repositories identity.
  React.useEffect(() => {
    void (async () => {
      try {
        const rules = await repositories.promotionRules.listActive();
        setPromotionRules(rules);
      } catch {
        // Best-effort — fall back to publisher defaults.
        setPromotionRules([]);
      }
    })();
  }, [repositories]);

  const toggleGroupCollapsed = React.useCallback((state: WorkflowState) => {
    setCollapsedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(state)) next.delete(state);
      else next.add(state);
      return next;
    });
  }, []);

  const hasAnyArticles = DRAFT_GROUP_ORDER.some((state) => groups[state].length > 0);

  return {
    groups,
    groupsLoading,
    groupsError,
    hasAnyArticles,
    collapsedGroups,
    toggleGroupCollapsed,
    promotionRules,
    selectedArticleId,
    setSelectedArticleId,
    reloadGroups,
  };
}
