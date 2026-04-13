# TeamViewer — source-binding and schema notes (Phase-01 Prompt-02)

## Source-of-truth lists

TeamViewer binds to three SharePoint lists defined in the publisher
architecture (`docs/architecture/plans/MASTER/spfx/publisher/architecture/03-Exact-Field-Definitions.md`):

| Registry key | Live title | Role |
|---|---|---|
| `articles` | `HB Articles` | Article parent rows. |
| `articleTeamMembers` | `HB Article Team Members` | Child person rows keyed by `ArticleId`. |
| `articleDestinationPages` | `HB Article Destination Pages` | Host site + page URL → article id. |

Binding discipline: **by list GUID**, via
`teamViewerListRegistry.TEAM_VIEWER_LIST_REGISTRY`. The live GUIDs are
empty placeholders (`id: ''`) until the lists are provisioned. Every
source function guards on `isProvisioned` and returns a typed
`not-provisioned` result, so the runtime degrades cleanly to empty
state rather than issuing requests against a non-existent list.

## Binding strategy

Resolution order (see `hooks/useTeamViewerArticleBinding.ts` and
`hooks/useTeamViewerData.ts`):

1. explicit `articleId` property → `resolutionSource: 'direct-binding'`.
2. explicit `destinationKey` property → `resolutionSource: 'property'`.
3. host site URL + host page URL → `HB Article Destination Pages` row
   lookup → `resolutionSource: 'host-context'`.

Host-context resolution filters by `PageUrl eq '<url>'` and
`PublishStatus eq 'published'` and takes the first row.

## Required vs. optional inputs

The `TeamViewerPerson` contract makes the minimum visible payload
explicit:

| Field | Requirement | Source field | Fallback rule |
|---|---|---|---|
| `id` | required | `TeamMemberId` (fallback: synthetic `<articleId>::<name>::<idx>`) | always produced. |
| `articleId` | required | Binding context. | — |
| `displayName` | required | `DisplayName` (fallback: `PersonPrincipal.Title`) | row dropped if absent. |
| `email` / `upn` | optional | `PersonPrincipal.EMail` / `.UserName` | undefined when absent. |
| `jobTitle` | optional | `Role` | title row omitted on card. |
| `department` | optional | `Department` | — |
| `teamLabel` | optional | `Company` | — |
| `groupKey` | optional | `GroupKey` | collapses into the unnamed bucket. |
| `sortOrder` | optional | `SortOrder` | sorts last; ties break on `displayName`. |
| `profileUrl` | optional | `ContactLink.Url` | link omitted when absent. |
| `photoUrl` | optional | Graph photo hydration at runtime. | initials avatar. |
| `bio` | optional | `BioSnippet` | section omitted in drawer. |
| `resumeRichText` | optional | `ResumeRichText` (rich HTML) | section omitted. |
| `resumeDocumentUrl` | optional | `ResumeDocumentUrl` | link omitted. |
| `resumeDocumentLabel` | optional | `ResumeDocumentLabel` | falls back to `Open resume document`. |

## Fallback rules (encoded in `teamViewerNormalization.ts`)

- **missing photo** → `photoUrl` undefined → hydration → initials avatar.
- **missing name** → row dropped. No "Unknown" rendering.
- **missing title** → `jobTitle` undefined → card omits title row but
  preserves spacing rhythm.
- **empty person set** → hook returns `people: []` → surface renders
  `TeamViewerEmptyState`.
- **malformed person field** → non-string values coerced to `undefined`;
  person-principal string with a `|` is split into `upn`.
- **malformed destination-page row** → no `ArticleId` string →
  binding resolves to empty and surface renders empty state.
- **SharePoint REST error** → surfaced through the hook as
  `error: Error` and rendered via `TeamViewerErrorState` with retry.
- **list not provisioned** → empty people set (no error banner).

## Refresh + cache invalidation

- `useTeamViewerData.refresh()` bumps an internal nonce; the effect
  aborts the in-flight fetch and re-issues against the current binding.
- In-flight reads are canceled when the binding changes or the
  component unmounts (`AbortController`).
- No module-level cache is introduced in Prompt 02. Adding a shared
  cache should re-use `createCacheInvalidationBus` from
  `@hbc/sharepoint-platform` (same pattern as `usePeopleCultureData`).

## Bio / resume schema — locked and provisioned

Phase-01 closure locks the profile-drawer schema on
`HB Article Team Members`. All five fields are provisioned by
`packages/sharepoint-docs/infrastructure/provision-publisher-lists.ps1`:

| Internal name | Type | Required | Runtime consumer |
|---|---|:---:|---|
| `BioSnippet` | Multiple lines plain text | No | `person.bio` — short bio, rendered as `<p>` in the drawer About section. |
| `ResumeRichText` | Multiple lines rich text (HTML) | No | `person.resumeRichText` — rendered into the drawer Resume section via sanitized `dangerouslySetInnerHTML`. |
| `ResumeDocumentUrl` | Hyperlink | No | `person.resumeDocumentUrl` — becomes the external-link CTA in the drawer Contact & Links section. |
| `ResumeDocumentLabel` | Single line text | No | `person.resumeDocumentLabel` — customizes the resume-link label; defaults to `Open resume document` when empty. |
| `ContactLink` | Hyperlink | No | `person.profileUrl` — generic contact/profile page link. |

All five fields are optional. The drawer renders only the sections
that have data. The display-name fallback chain is unchanged:
`DisplayName` → `PersonPrincipal.Title`; rows missing both are
dropped at normalization (never surfaced as "Unknown").

Resume HTML **must be sanitized upstream** at the data boundary
(publisher authoring or a post-fetch sanitizer) — the renderer does
not sanitize.

## Render inputs for Prompt 03

`components/TeamViewerSurface.tsx` consumes:

- `heading: string`
- `groups: TeamViewerGroup[]` — from `sortPeople` + `groupPeople`
- `layout: TeamViewerLayout` — from resolved config
- `density: TeamViewerDensity` — resolved config, auto-scaled via
  `selectDensityForSize` when the caller leaves it at `'standard'`
- `onOpenDetail?: (person) => void` — present only when the
  `profileDetailDrawer` flag is enabled

`components/TeamViewerDetailDrawer.tsx` consumes a single
`TeamViewerPerson` with any combination of `bio`, `resumeRichText`,
`resumeDocumentUrl`, `profileUrl`.
