# Phase 05 — Closure Note — Prove Platform Reuse with a Second Consumer

## Proof target
Project Spotlight webpart — a list-backed homepage surface distinct from Kudos in persona, content family, and orchestration.

## Narrow mechanic added to the platform
`@hbc/sharepoint-platform` now exports `fetchListItemsJson<T>(endpointUrl, options?)` (new `src/listRead.ts`). Owns only transport mechanics:
- `Accept: application/json;odata=nometadata` header
- non-OK status → labeled `Error` translation
- `{ value: T[] }` response unwrap
- `AbortSignal` passthrough

The helper deliberately does **not** construct endpoints — callers pass the URL in. GUID-binding discipline on the endpoint-builder side is preserved.

## Second-consumer adoption
- `apps/hb-webparts/src/homepage/data/projectSpotlightListSource.ts` — `fetchSpotlightListItems` now calls `fetchListItemsJson<RawSpotlightListItem>(url, { label: 'SharePoint list' })` instead of hand-rolling the fetch + unwrap. Persona-specific logic (URL construction, publish-window filter, mapping to `ProjectPortfolioSpotlightItem`, team-member / image / freshness handling) stays in the webpart's own source module.

## Not done (intentional)
- The Homepage Project Spotlights list is still bound by `getbytitle(...)` because no canonical GUID is registered for it. Per plan 05, the GUID-safe binding upgrade is **optional**; leaving this as a title-bound read avoids inventing a registry entry without schema-report authority.
- Project Spotlight has no writer path, so no MERGE / ensure-user / digest reuse applies.
- No cache-invalidation bus adopted for Spotlight — it has no mutation path that would call it.

## Hard rules observed
- No forcing of Kudos contracts on Spotlight — it continues to return `ProjectPortfolioSpotlightItem`, not `KudosEntry`.
- No universal adapter abstraction introduced.
- No flattening of Spotlight persona logic into the platform — mapping, filtering, and normalization all stay in `projectSpotlightListSource.ts`.
- The new platform helper is a narrow transport mechanic, not a CRUD framework.

## Verification
| Command | Result |
|---|---|
| `pnpm --filter @hbc/sharepoint-platform build` | pass |
| `pnpm --filter @hbc/sharepoint-platform test` | 34/34 pass (30 prior + 4 new `listRead` tests) |
| `pnpm --filter @hbc/spfx-hb-webparts check-types` | pass |
| `pnpm --filter @hbc/spfx-hb-webparts test` | 464 pass / 17 fail — identical to Phase-04 baseline; Spotlight persona behavior unchanged |

## Manifest
- `apps/hb-webparts/config/package-solution.json` feature version `1.0.0.189` → `1.0.0.190`.
- Solution version unchanged at `1.0.0.189`.
