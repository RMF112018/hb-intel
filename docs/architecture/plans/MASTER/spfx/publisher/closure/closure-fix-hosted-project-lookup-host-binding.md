# Closure — Fix hosted project lookup host binding

**Phase:** `docs/architecture/plans/MASTER/spfx/publisher/phase-09`
**Prompt:** `Prompt-01-Fix-hosted-project-lookup-host-binding.md`
**Status:** Closed

## Defect

`createProjectsLookupSearch` was bound to the mounted page `siteUrl`, which `mount.tsx` derives from `spfxContext.pageContext.web.absoluteUrl`. The Article Publisher is hosted on Marketing-New, so the project picker queried Marketing-New's `_api/web/lists/getbytitle('Projects')` endpoint instead of the authoritative HBCentral `Projects` list. The search would fail (or return wrong data) whenever the hosted page site does not happen to carry the same list.

## Resolution

Bind the project lookup seam explicitly to the canonical HBCentral control-plane host via the existing constant `PUBLISHER_LIST_HOST_SITE_URL` (defined in `apps/hb-publisher/src/data/publisherAdapter/publisherListDescriptors.ts`). The mounted page `siteUrl` remains available for legitimate host-context concerns (`storeSiteUrl` effect) but is no longer used to authorize the Projects lookup.

## Old path (before)

```
mount.tsx
  spfxContext.pageContext.web.absoluteUrl (Marketing-New on hosted page)
    -> siteUrl prop
      -> ArticlePublisher.tsx
        searchProjects = siteUrl
          ? createProjectsLookupSearch({ hostSiteUrl: siteUrl })
          : undefined
```

Result on Marketing-New: Projects lookup hits `https://.../sites/Marketing-New/_api/web/lists/getbytitle('Projects')` — wrong host.

## New path (after)

```
ArticlePublisher.tsx
  import { PUBLISHER_LIST_HOST_SITE_URL } from '.../publisherListDescriptors'
  searchProjects = createProjectsLookupSearch({
    hostSiteUrl: PUBLISHER_LIST_HOST_SITE_URL,
  })
```

Result on Marketing-New (and any host): Projects lookup hits `https://hedrickbrotherscom.sharepoint.com/sites/HBCentral/_api/web/lists/getbytitle('Projects')` — correct canonical host.

## Why Marketing-New now resolves against HBCentral

The lookup host is a compile-time constant, not a prop. It cannot be overridden by the mount boundary or the hosted page. `PUBLISHER_LIST_HOST_SITE_URL` is the same constant already used by every publisher list descriptor, so the Projects lookup is now consistent with the rest of the publisher's list-host discipline.

SharePoint Online shares authentication cookies across site collections on the same tenant domain, so cross-site REST calls from Marketing-New to HBCentral work without an additional token exchange (same pattern already used by `useSharePointPeopleSearch`).

## Files changed

- `apps/hb-publisher/src/webparts/articlePublisher/ArticlePublisher.tsx`
  - Added import of `PUBLISHER_LIST_HOST_SITE_URL`.
  - Replaced `siteUrl`-gated `searchProjects` memo with an unconditional bind to the canonical constant.
  - Removed `siteUrl` from the memo dependency list.
- `apps/hb-publisher/config/package-solution.json`
  - Version bumped `1.0.0.1 → 1.0.0.2` (solution + feature).

## Unchanged by design

- `apps/hb-publisher/src/mount.tsx` — still passes the page `siteUrl` for genuine host-context usage.
- `apps/hb-publisher/src/data/publisherAdapter/projectsLookupSource.ts` — already accepts an explicit `hostSiteUrl`; no shape change needed.
- All other list host bindings — untouched.

## Validation

1. `createProjectsLookupSearch` no longer depends on the mounted page site URL. Proof: the `searchProjects` memo has an empty dependency list and does not reference `siteUrl`.
2. HBCentral control-plane site is the lookup target. Proof: the factory is called with `PUBLISHER_LIST_HOST_SITE_URL` (`https://hedrickbrotherscom.sharepoint.com/sites/HBCentral`), the same constant the publisher list descriptors are pinned to.
3. Authoring behavior compiles. Proof: `pnpm --filter @hbc/spfx-hb-publisher check-types` and `pnpm --filter @hbc/spfx-hb-publisher test` pass. `MetadataPanel`'s `searchProjects` prop is typed `ProjectLookupSearchFn | undefined`, so passing an always-defined function remains type-safe.
4. No unrelated host bindings changed. Proof: grep for other occurrences of `createProjectsLookupSearch` and for `hostSiteUrl` usage shows only the single call site in `ArticlePublisher.tsx`.

## Remaining assumptions

- `PUBLISHER_LIST_HOST_SITE_URL` continues to be the tenant's HBCentral absolute URL. A tenant migration would require updating that constant (single source of truth), not this call site.
