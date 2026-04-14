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
  return {
    heading:
      article.TeamViewerTitle && article.TeamViewerTitle.trim().length > 0
        ? article.TeamViewerTitle
        : TEAM_VIEWER_DEFAULT_HEADING,
    articleId: article.ArticleId,
    destinationKey: article.Destination,
    listHostOverride: undefined,
    layout: 'grid',
    density: 'standard',
    flags: {
      profileDetailDrawer: false,
    },
  };
}

/**
 * Filter + sort the raw publisher rows the way the Team Viewer
 * renderer expects them. Rows with `IncludeInViewer === false` are
 * dropped; the remainder are sorted by `SortOrder` ascending with a
 * stable `DisplayName` tiebreaker.
 */
export function selectVisibleTeamMembers(
  rows: readonly PublisherTeamMemberRow[],
): readonly PublisherTeamMemberRow[] {
  return rows
    .filter((r) => r.IncludeInViewer !== false)
    .slice()
    .sort((a, b) => {
      const ao = a.SortOrder ?? Number.MAX_SAFE_INTEGER;
      const bo = b.SortOrder ?? Number.MAX_SAFE_INTEGER;
      if (ao !== bo) return ao - bo;
      return a.DisplayName.localeCompare(b.DisplayName);
    });
}

/** Map a single publisher row into the TeamViewer render row subset. */
export function mapPublisherRowToTeamViewerPerson(
  row: PublisherTeamMemberRow,
): PublisherTeamViewerPerson {
  return {
    id: row.TeamMemberId,
    articleId: row.ArticleId,
    articleTeamMemberId: row.TeamMemberId,
    displayName: row.DisplayName,
    jobTitle: row.JobTitle,
    photoUrl: row.PhotoUrl,
    sortOrder: row.SortOrder,
    bio: row.BioSnippet,
    resumeRichText: row.ResumeRichText,
    resumeDocumentUrl: row.ResumeDocumentUrl,
    profileUrl: row.ContactLink,
  };
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
