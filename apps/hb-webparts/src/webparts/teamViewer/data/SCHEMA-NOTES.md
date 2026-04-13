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
| `resumeRichText` | optional | **schema gap — see below**. | section omitted. |
| `resumeDocumentUrl` | optional | **schema gap — see below**. | link omitted. |

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

## Bio / resume schema gaps

The publisher architecture defines the following on
`HB Article Team Members`:

- `BioSnippet` — Multiple lines plain text  ✓ (maps to `person.bio`)
- `ContactLink` — Hyperlink  ✓ (maps to `person.profileUrl`)

**Gaps** for the flag-gated bio/resume drawer:

- `ResumeRichText` — Multiple lines **rich text** — proposed.
- `ResumeDocumentUrl` — Hyperlink — proposed.

### Minimum required schema additions

Add the following columns to `HB Article Team Members` **before** the
`profileDetailDrawer` feature flag is enabled in any host:

| Internal name | Type | Required | Description |
|---|---|---|---|
| `ResumeRichText` | Multiple lines of text (rich / HTML) | No | Sanitized resume body rendered inside the TeamViewer drawer. |
| `ResumeDocumentUrl` | Hyperlink | No | Link to a stored resume document; opens in a new tab. |

Both are optional. The drawer renders only the sections it has data
for. Until the columns exist the normalizer will coerce their values
to `undefined`, so adding them later is a backwards-compatible change.

The contracts (`teamViewerContracts.ts`) already include the matching
fields, so no TypeScript migration is required at that point.

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
