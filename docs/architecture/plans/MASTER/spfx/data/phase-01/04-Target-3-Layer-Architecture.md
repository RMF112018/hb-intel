# 04 — Target 3-Layer Architecture

## Target package/boundary model

## Layer 1 — Shared platform layer

### Recommended location
Create a real workspace package under `packages/`, for example:
- `packages/sharepoint-data`
- or another explicit name with the same intent

### Responsibilities
- SPFx/host bootstrap state contracts
- canonical site/list-host resolution
- list registry descriptor primitives
- endpoint construction helpers
- request digest retrieval
- ensure-user / current-user resolution
- item meta lookup helpers
- MERGE + ETag write helper
- normalized fetch result / write result / error helpers
- cache invalidation publisher/store
- broadly reusable SharePoint people-search transport helpers

### Example exports
- `createSharePointHostContextStore()`
- `resolveCanonicalSiteUrl()`
- `buildListItemsEndpoint()`
- `buildListFieldsEndpoint()`
- `fetchRequestDigest()`
- `ensureUserByEmail()`
- `resolveCurrentUserId()`
- `fetchItemMetaByAppId()`
- `mergeItemById()`
- `createCacheInvalidationBus()`

### Rules
- zero React
- zero UI imports
- zero Kudos workflow logic
- no domain-specific field constants
- no homepage persona logic

---

## Layer 2 — Shared domain-adapter layer

### Initial state
Formalize a **Kudos adapter boundary** first.

This can start either:
- inside `apps/hb-webparts` behind a domain-adapter folder, or
- as a dedicated package once the platform package is stable

### Responsibilities
- typed Kudos read contracts
- typed Kudos field maps
- raw SharePoint → Kudos model mapping
- submission adapter
- governance adapter
- audit timeline adapter
- domain-safe reader/writer APIs

### Example exports
- `getKudosEntries()`
- `submitKudosDraft()`
- `applyKudosPatch()`
- `getKudosAuditTimeline()`
- `validateKudosBindings()`

### Rules
- typed, domain-specific contracts only
- no generic list API
- may depend on Layer 1
- may be consumed by multiple Kudos runtimes
- does not own webpart-local orchestration

---

## Layer 3 — Webpart-local orchestration layer

### Location
Remain in:
- `apps/hb-webparts/src/webparts/hbKudos/*`
- `apps/hb-webparts/src/webparts/hbKudosCompanion/*`

### Responsibilities
- UX state
- view composition
- local hook state
- detail-panel flows
- queue derivation
- filter state
- public spotlight/archive derivation
- bulk approval progress UI
- recipient photo hydration
- host-safe layout behavior

### Rules
- may consume Layer 2 adapters
- may consume UI kit primitives
- may not reach directly to Layer 1 helpers once Layer 2 is complete, except for clearly justified bootstrap-only seams

---

## Target import direction

### Allowed
- Layer 3 → Layer 2
- Layer 2 → Layer 1
- Layer 3 → UI kit
- Layer 1 → no UI

### Prohibited
- Layer 1 → Layer 2
- Layer 1 → Layer 3
- Layer 2 → webpart-local hooks/components
- Layer 3 → old low-level app-local transport helpers after extraction closes

---

## Target runtime flow examples

### Public Kudos read path
`HbKudos`  
→ local orchestration hook  
→ Kudos domain adapter  
→ shared SharePoint platform  
→ SharePoint

### Companion governance write path
`HbKudosCompanion`  
→ local action hook  
→ Kudos governance adapter  
→ shared SharePoint platform  
→ SharePoint  
→ audit-event write  
→ invalidation publish  
→ local refresh

### People search path
local composer panel  
→ typed people-search adapter  
→ shared SharePoint platform digest + search transport  
→ SharePoint people picker service

---

## Comparison against the current repo
The live repo already approximates this model, but:
- Layer 1 is fragmented across app-local modules,
- Layer 2 is mixed together with Layer 1 mechanics,
- Layer 3 sometimes still reaches into Layer 1-ish helpers directly.

The target architecture finishes that separation without changing product identity.
