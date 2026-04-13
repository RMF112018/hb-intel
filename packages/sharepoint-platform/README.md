# @hbc/sharepoint-platform

**Version:** 0.1.0
**Status:** Layer 1 — Shared SharePoint platform primitives (UI-free)

---

## Purpose

`@hbc/sharepoint-platform` provides the low-level SharePoint REST mechanics that every SPFx data-access layer in HB Intel needs, without carrying any domain, UI, or framework dependencies.

It is intentionally narrow:

- **Host context** — store and retrieve the SharePoint site URL and an optional list-host override.
- **List descriptors & endpoint builders** — bind by list GUID (never by title) and build `/items` and `/fields` REST URLs with properly encoded query strings.
- **Request digest** — fetch `FormDigestValue` for write operations.
- **Users** — `ensureUserByEmail` and a pure `resolveCurrentUserId`.
- **Item meta / ETag** — generic `fetchItemMetaByFieldValue` returning `{ itemId, etag }`.
- **MERGE** — generic `mergeItemById` using the SharePoint `X-HTTP-Method: MERGE` + `If-Match` convention.
- **Result envelopes** — `FetchResult<T>`, `WriteResult`, `asError`.
- **Cache invalidation primitive** — `createCacheInvalidationBus()`.

## Package boundaries

- Zero React, zero UI imports.
- No domain constants (no Kudos, no People & Culture GUIDs).
- No generic "fetch any list by name" API — callers always supply a `SharePointListDescriptor` so binding is GUID-based.
- Depends only on the standard web `fetch` global. No `@hbc/*` dependencies.

## Public API

```ts
import {
  storeSiteUrl,
  getSiteUrl,
  storeListHostUrl,
  getListHostUrl,
  type SharePointListDescriptor,
  buildListItemsEndpoint,
  buildListFieldsEndpoint,
  fetchRequestDigest,
  ensureUserByEmail,
  resolveCurrentUserId,
  fetchItemMetaByFieldValue,
  mergeItemById,
  createCacheInvalidationBus,
  type FetchResult,
  type WriteResult,
  asError,
} from '@hbc/sharepoint-platform';
```

## Verification

```bash
pnpm --filter @hbc/sharepoint-platform build
pnpm --filter @hbc/sharepoint-platform test
```
