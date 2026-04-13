/**
 * teamViewerListRegistry — TeamViewer SharePoint list bindings.
 *
 * Binding discipline mirrors the People & Culture list registry: we
 * intend to bind by list GUID (stable across rename/URL drift). The
 * publisher product (see
 * `docs/architecture/plans/MASTER/spfx/publisher/architecture/03-Exact-Field-Definitions.md`)
 * is the canonical source of the `HB Articles`, `HB Article Team Members`,
 * and `HB Article Destination Pages` list schemas.
 *
 * **Provisioning status (Phase-01 Prompt-02):** the live lists are not
 * yet provisioned in this tenant. The GUIDs below are intentionally
 * empty placeholders. The `fetchTeamViewer*` call sites refuse to build
 * an endpoint when the GUID is empty and surface a typed "not provisioned"
 * result so the runtime degrades to the empty state instead of issuing
 * requests against a non-existent list.
 *
 * When the lists are provisioned, populate these GUIDs (and adjust
 * `urlSegment` to the real list URL segment) in a single change; no
 * other code needs to move.
 */
import type { SharePointListDescriptor } from '@hbc/sharepoint-platform';

export type TeamViewerListKey = 'articles' | 'articleTeamMembers' | 'articleDestinationPages';

export interface TeamViewerListDescriptor extends SharePointListDescriptor {
  key: TeamViewerListKey;
  purpose: string;
  /** Field internal names the source adapter depends on. */
  criticalFieldInternalNames: ReadonlyArray<string>;
  /** `true` when the list GUID is populated and ready for runtime reads. */
  isProvisioned: boolean;
}

function desc(d: Omit<TeamViewerListDescriptor, 'isProvisioned'>): TeamViewerListDescriptor {
  return { ...d, isProvisioned: d.id.length > 0 };
}

/**
 * Authoritative list registry. GUIDs are empty placeholders until the
 * lists are provisioned — see the module docblock.
 */
export const TEAM_VIEWER_LIST_REGISTRY: Readonly<Record<TeamViewerListKey, TeamViewerListDescriptor>> = {
  articles: desc({
    key: 'articles',
    id: '',
    title: 'HB Articles',
    urlSegment: 'HB Articles',
    purpose: 'Article parent list. TeamViewer reads only when a direct articleId is supplied.',
    criticalFieldInternalNames: ['ArticleId', 'Title', 'ShowTeamViewer', 'TeamViewerMode'],
  }),
  articleTeamMembers: desc({
    key: 'articleTeamMembers',
    id: '',
    title: 'HB Article Team Members',
    urlSegment: 'HB Article Team Members',
    purpose: 'Article child rows — one person per row. Keyed by ArticleId lookup.',
    criticalFieldInternalNames: [
      'ArticleId',
      'TeamMemberId',
      'PersonPrincipal',
      'DisplayName',
      'Role',
      'SortOrder',
      'GroupKey',
      'BioSnippet',
      'ResumeRichText',
      'ResumeDocumentUrl',
      'ResumeDocumentLabel',
      'ContactLink',
    ],
  }),
  articleDestinationPages: desc({
    key: 'articleDestinationPages',
    id: '',
    title: 'HB Article Destination Pages',
    urlSegment: 'HB Article Destination Pages',
    purpose: 'Page-to-article binding. Resolves active article from host site+page URL.',
    criticalFieldInternalNames: ['BindingId', 'ArticleId', 'TargetSiteUrl', 'PageUrl', 'PublishStatus'],
  }),
} as const;

export function getTeamViewerList(key: TeamViewerListKey): TeamViewerListDescriptor {
  return TEAM_VIEWER_LIST_REGISTRY[key];
}
