# TeamViewer — Runtime Binding Closure Note

## Locked topology

- **List host (control plane):**
  `https://hedrickbrotherscom.sharepoint.com/sites/HBCentral`
  Defined in `data/teamViewerHostContext.ts` as
  `TEAM_VIEWER_CANONICAL_LIST_HOST_URL`. All list reads target this URL.
- **Render hosts (consumer sites):**
  `/sites/CompanyPulse`, `/sites/ProjectSpotlight`, or any future
  publisher destination. Never treated as the list host.

## Canonical article-resolution order

Produced by `hooks/useTeamViewerArticleBinding.ts` and consumed by
`hooks/useTeamViewerData.ts`:

1. **`direct-binding`** — explicit `articleId` on config wins. No list
   lookup for the binding row; the team-member fetch runs immediately
   against HBCentral.
2. **`property`** — explicit `destinationKey` on config. Filters
   `HB Article Destination Pages` by `BindingId eq <key>` at HBCentral,
   then fetches team members.
3. **`host-context`** — current render site + page URL. Filters
   `HB Article Destination Pages` by
   `TargetSiteUrl eq <renderSiteUrl> and PageUrl eq <renderPageUrl>
   and PublishStatus eq 'published'` at HBCentral.

If none of the three paths produces an `ArticleId` the hook returns an
empty person set and the orchestrator renders the intentional
article-unresolved empty variant. There is **no silent fallback** to
a different article.

## Layer separation

| Concept | Value | Code location |
|---|---|---|
| List host URL | Always HBCentral (canonical constant) | `teamViewerHostContext.ts` |
| Current render host URL | `binding.renderSiteUrl` | `useTeamViewerArticleBinding.ts` |
| Current page URL | `binding.renderPageUrl` | `useTeamViewerArticleBinding.ts` (fed by `mount.tsx` via `window.location.href`) |
| Article-binding resolution | `resolveArticleId(binding, signal)` | `useTeamViewerData.ts` |
| SharePoint reads | `fetchArticleIdForRenderContext` / `fetchArticleIdForDestinationKey` / `fetchArticleTeamMemberRows` — all take `listHostUrl` explicitly | `teamViewerListSource.ts` |

No component constructs SharePoint URLs by hand; every endpoint flows
through `buildListItemsEndpoint` + the GUID-bound descriptor in
`teamViewerListRegistry.ts`.

## Behavior guarantees

- **CompanyPulse** and **ProjectSpotlight** both route through the same
  HBCentral list reads. Their render site/page URLs are used **only**
  as OData filter keys — no cross-site list reads are issued.
- A **dev/harness `listHostOverride`** property exists on the config
  contract for isolated testing; resolver trims to the canonical URL
  when absent or malformed (`resolveTeamViewerListHostUrl`).
- A **stale render context** (missing site or page URL) produces a
  binding with `articleId: ''` and `resolutionSource: 'host-context'`;
  the data hook refuses the lookup and the empty state renders.
- **Refresh** (`TeamViewerErrorState` retry) aborts in-flight requests
  and re-runs the full pipeline against the current binding.

## Validated scenarios

The dev-harness tab continues to cover:

- `host-context-resolved` — simulates a bound render site+page.
- `host-context-unresolved` — simulates an unbound render site+page.
- direct-binding and destination-key paths are exercised by the data
  hook's resolver branches (`useTeamViewerData.ts` → `resolveArticleId`).

## Drift prevention

- The list host is a single exported constant; changing it requires an
  ADR.
- `TeamViewerArticleBinding` forces consumers to name `listHostUrl`,
  `renderSiteUrl`, `renderPageUrl`, and `articleId` separately. Old
  call sites that used `articleSiteUrl` no longer type-check.
- Every list-source function takes a typed `params` object with
  `listHostUrl` first — there is no positional ambiguity between list
  host and render host.
