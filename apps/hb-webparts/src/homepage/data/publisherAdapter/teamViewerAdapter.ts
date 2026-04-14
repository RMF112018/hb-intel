/**
 * Publisher → Team Viewer adapter.
 *
 * Maps the structured `HB Article Team Members` child-row
 * set into the two shapes the Team Viewer webpart consumes:
 *
 *   - `TeamViewerControlPayload.properties` — the JSON bag the XML
 *     template assigns to the `teamViewer` canvas control on every
 *     generated Project Spotlight page (heading, articleId,
 *     destinationKey, layout, density, featureFlags).
 *   - `TeamViewerPerson` — the normalized render row the Team Viewer
 *     surface selectors expect after its own reader loads the child
 *     rows by `articleId`. Centralizing this mapping here prevents
 *     drift between what the publisher authors and what the
 *     TeamViewer reader / harness consumes.
 *
 * Pure. No network. No DOM. The publisher's page compositor and the
 * authoring-UI preview both call through this adapter so the three
 * surfaces (publisher, preview, published TeamViewer) cannot emit
 * divergent shapes.
 *
 * Authority:
 *   docs/architecture/plans/MASTER/spfx/publisher/architecture/
 *     03-Exact-Field-Definitions.md (row fields)
 *     05-Template-Registry-Schema.md (shell team slot)
 *     07-Webpart-Input-Contracts.md (Team Viewer inputs)
 *   apps/hb-webparts/src/webparts/teamViewer/teamViewerContracts.ts
 *     (TeamViewerPerson normalized shape)
 *
 * Empty-state posture: when no rows opt into the viewer, the publisher
 * compositor emits a `HiddenControlPayload` so the page has no team
 * section; when at least one row opts in, the TeamViewer webpart on
 * the published page renders its own empty / populated branches from
 * the data it reads at runtime. The publisher never renders the final
 * team surface itself.
 */

import type { PublisherArticleRow, PublisherTeamMemberRow } from './publisherContracts';
import type {
  TeamViewerConfig,
  TeamViewerDensity,
  TeamViewerFeatureFlags,
  TeamViewerLayout,
  TeamViewerPerson,
} from '../../../webparts/teamViewer/teamViewerContracts';

// Re-export the canonical TeamViewer contracts so consumers of the
// publisher adapter can speak the exact same shapes the TeamViewer
// webpart consumes — no parallel domain types live on the publisher
// side.
export type {
  TeamViewerConfig,
  TeamViewerDensity,
  TeamViewerFeatureFlags,
  TeamViewerLayout,
  TeamViewerPerson,
};

/** Default heading applied when the article did not supply one. */
export const TEAM_VIEWER_DEFAULT_HEADING = 'Team';

/**
 * The publisher writes the canonical `TeamViewerConfig` shape into the
 * TeamViewer canvas control's `webPartData.properties`. By aliasing
 * the webpart contract directly, the publisher and the webpart cannot
 * drift on field names (`flags` vs `featureFlags`), enum values
 * (layout/density), or required-vs-optional shape — the type system
 * enforces the same JSON on both sides of the integration seam.
 */
export type PublisherTeamViewerProperties = TeamViewerConfig;

/**
 * Subset of `TeamViewerPerson` the publisher can populate from its
 * own row shape. Aliased to the canonical `TeamViewerPerson` so
 * downstream callers, harnesses, and renderers all consume one
 * contract; the publisher leaves the Graph-enriched fields
 * (`upn`/`email`/`department`/...) undefined and the webpart's
 * reader fills them in at render time.
 */
export type PublisherTeamViewerPerson = TeamViewerPerson;

/** Build the canonical `TeamViewerConfig` JSON bag from an article. */
export function buildTeamViewerProperties(
  article: PublisherArticleRow,
): PublisherTeamViewerProperties {
  // TeamViewerGroupingMode/TeamViewerSortMode/TeamViewerMaxInitialVisible
  // are tenant-schema-backed article fields but have no matching
  // runtime knobs on TeamViewerConfig yet; they are intentionally
  // deferred from emitted control JSON in this sprint.
  const mode = article.TeamViewerMode ?? 'compact';
  const layout: TeamViewerLayout =
    mode === 'grouped'
      ? 'grouped'
      : mode === 'summaryExpand'
        ? 'strip'
        : mode === 'orgChart'
          ? 'rail'
          : 'grid';
  const density: TeamViewerDensity =
    mode === 'summaryExpand' ? 'expanded' : 'standard';
  return {
    heading:
      article.TeamViewerTitle && article.TeamViewerTitle.trim().length > 0
        ? article.TeamViewerTitle
        : TEAM_VIEWER_DEFAULT_HEADING,
    articleId: article.ArticleId,
    destinationKey: article.Destination,
    listHostOverride: undefined,
    layout,
    density,
    flags: {
      profileDetailDrawer: article.TeamViewerAllowExpand ?? false,
    },
  };
}

/**
 * Sort the publisher rows the way the Team Viewer renderer expects:
 * by `SortOrder` ascending with a stable `DisplayName` tiebreaker.
 *
 * The tenant `HB Article Team Members` schema does not define an
 * `IncludeInViewer` column, so every row authored on an article is
 * visible on the rendered page. If hosts need to hide a row they
 * should remove it from the child list.
 */
export function selectVisibleTeamMembers(
  rows: readonly PublisherTeamMemberRow[],
): readonly PublisherTeamMemberRow[] {
  return rows
    .slice()
    .sort((a, b) => {
      const ao = a.SortOrder ?? Number.MAX_SAFE_INTEGER;
      const bo = b.SortOrder ?? Number.MAX_SAFE_INTEGER;
      if (ao !== bo) return ao - bo;
      return a.DisplayName.localeCompare(b.DisplayName);
    });
}

/**
 * Map a single publisher row into the TeamViewer render row subset.
 * Photo/department enrichment is left undefined on purpose — the
 * Team Viewer webpart's Graph-enriched reader fills those at render
 * time from the resolved `PersonPrincipal`.
 *
 * `jobTitle` / `projectRole` source: the tenant `Role` column when
 * an author has set a secondary role descriptor; otherwise the
 * tenant `Title` column, which the redesigned teammate composer
 * (workstream-d step-02) populates with the role caption or
 * directory job title. Historically the adapter read only `Role`,
 * but the composer no longer surfaces `Role` as a free-text field —
 * falling back to `Title` keeps the downstream render consistent
 * with what the author sees in the composer and the article card,
 * and remains backwards-compatible with legacy rows that only
 * carry a `Role` value.
 */
export function mapPublisherRowToTeamViewerPerson(
  row: PublisherTeamMemberRow,
): PublisherTeamViewerPerson {
  const jobTitle = firstNonEmpty(row.Role, row.Title);
  return {
    id: row.TeamMemberId,
    articleId: row.ArticleId,
    articleTeamMemberId: row.TeamMemberId,
    displayName: row.DisplayName,
    jobTitle,
    projectRole: jobTitle,
    department: row.Department,
    groupKey: row.GroupKey,
    sortOrder: row.SortOrder,
    bio: row.BioSnippet,
    profileUrl: row.ContactLink,
  };
}

function firstNonEmpty(
  ...values: readonly (string | undefined)[]
): string | undefined {
  for (const v of values) {
    if (typeof v !== 'string') continue;
    const t = v.trim();
    if (t.length > 0) return t;
  }
  return undefined;
}

/**
 * Map the full child-row set through the visibility filter and row
 * mapper. Returns the list the TeamViewer renderer will receive
 * after its HBCentral-bound reader fetches rows by `articleId`.
 */
export function buildTeamViewerPersonList(
  rows: readonly PublisherTeamMemberRow[],
): readonly PublisherTeamViewerPerson[] {
  return selectVisibleTeamMembers(rows).map(mapPublisherRowToTeamViewerPerson);
}

/**
 * Informational classification of team size used for hosted
 * verification notes and the authoring-UI preview. Does not change
 * behavior — density still comes from the article.
 */
export type TeamSizeBucket = 'empty' | 'small' | 'medium' | 'large';

export function classifyTeamSize(count: number): TeamSizeBucket {
  if (count <= 0) return 'empty';
  if (count <= 3) return 'small';
  if (count <= 8) return 'medium';
  return 'large';
}
