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
import type { TeamViewerDensity, TeamViewerLayout } from './publisherEnums';

/** Default heading applied when the post did not supply one. */
export const TEAM_VIEWER_DEFAULT_HEADING = 'Team';

/**
 * The exact JSON shape written into the TeamViewer control's
 * `webPartData.properties` on the canvas. Structural equal-by-value
 * match for `teamViewerConfig.TeamViewerConfig` raw input.
 */
export interface PublisherTeamViewerProperties {
  readonly heading: string;
  readonly articleId: string;
  readonly destinationKey: 'projectSpotlight';
  readonly listHostOverride: string | undefined;
  readonly layout: TeamViewerLayout;
  readonly density: TeamViewerDensity;
  readonly featureFlags: {
    readonly profileDetailDrawer: boolean;
  };
}

/**
 * Subset of `TeamViewerPerson` the publisher can populate from its
 * own row shape. Full `TeamViewerPerson` shape (with
 * `upn/email/department/...`) is reconstructed by the TeamViewer
 * reader when it fetches additional Graph data at render time.
 */
export interface PublisherTeamViewerPerson {
  readonly id: string;
  readonly articleId: string;
  readonly articleTeamMemberId: string;
  readonly displayName: string;
  readonly jobTitle?: string;
  readonly photoUrl?: string;
  readonly sortOrder?: number;
  readonly bio?: string;
  readonly resumeRichText?: string;
  readonly resumeDocumentUrl?: string;
  readonly profileUrl?: string;
}

/** Build the structured TeamViewer properties bag from an article. */
export function buildTeamViewerProperties(
  article: PublisherArticleRow,
): PublisherTeamViewerProperties {
  return {
    heading:
      article.TeamViewerTitle && article.TeamViewerTitle.trim().length > 0
        ? article.TeamViewerTitle
        : TEAM_VIEWER_DEFAULT_HEADING,
    articleId: article.ArticleId,
    destinationKey: 'projectSpotlight',
    listHostOverride: undefined,
    layout: 'grid',
    density: 'standard',
    featureFlags: {
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
 * behavior — density still comes from the post.
 */
export type TeamSizeBucket = 'empty' | 'small' | 'medium' | 'large';

export function classifyTeamSize(count: number): TeamSizeBucket {
  if (count <= 0) return 'empty';
  if (count <= 3) return 'small';
  if (count <= 8) return 'medium';
  return 'large';
}
