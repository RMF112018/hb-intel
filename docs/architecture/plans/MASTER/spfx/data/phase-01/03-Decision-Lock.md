# 03 — Decision Lock

## Non-negotiable architectural decisions

### 1. The platform layer is mechanics-only
The extracted shared layer may own:
- host/bootstrap resolution
- list registry and endpoint building
- request digest retrieval
- SharePoint user resolution
- current-user resolution
- MERGE / ETag helpers
- cache invalidation primitives
- normalized request result/error envelopes

It may **not** own:
- Kudos workflow semantics
- archive/public predicates
- role/capability policy
- prominence rules
- queue filtering
- public or companion orchestration

---

### 2. The architecture must stay typed and explicit
No exported “generic list client” may become the main public API for homepage content.

Allowed:
- typed methods like `getKudosEntries()`, `submitKudosDraft()`, `applyKudosPatch()`

Prohibited:
- `getListItems(listName, fields, filters)`
- `updateListItem(listName, payload)`
- “configuration-driven universal SharePoint repository” patterns

---

### 3. GUID-safe binding is mandatory
For critical production lists, binding must remain based on GUID-backed registry descriptors, not display titles.

This is especially important because the People & Culture surfaces already demonstrate title/URL drift risk.

---

### 4. Canonical list-host policy must be explicit
The repo currently treats HBCentral as the canonical HB Kudos list host.

That production fact may remain, but it must move to an explicit infrastructure seam such as:
- platform config contract
- environment-aware host policy module
- bootstrap-owned provider

It must not remain buried as a mixed concern inside a general-purpose app helper.

---

### 5. Writers must preserve ETag and audit guarantees
The extracted architecture must preserve all of the following:
- item lookup by `KudosId`
- item meta + ETag fetch
- MERGE + `If-Match`
- audit-event row creation
- no blind overwrite path
- cache invalidation after mutation

---

### 6. Domain adapters must not be promoted until reuse is proven
The platform layer should be extracted now.

The **Kudos domain adapter** can be formalized now because it is already mature.

Other homepage domain adapters should only be promoted after repo-truth evidence shows that:
- the second consumer needs the same adapter shape,
- the adapter boundary is stable,
- no persona flattening will occur.

---

### 7. Local orchestration remains inside `apps/hb-webparts`
The following stay local:
- `useKudosComposer`
- `usePublicKudosData`
- `useCelebrateAction`
- `useCompanionActions`
- `useCompanionQueue`
- `useBulkApproval`
- `useCompanionRole`

These are product behavior, not platform.

---

### 8. Existing runtime behavior is the default contract
Refactor for boundary quality, not for incidental feature changes.

Preserve unless intentionally changed:
- public/homepage visibility behavior
- archive behavior
- companion action behavior
- audit writes
- notification dispatch points
- refresh behavior after mutations
- hosted SharePoint mounting assumptions

---

### 9. Shared package creation must follow workspace discipline
The repo already has a real `packages/*` workspace lane.

Any extracted platform layer must be introduced as a real workspace package with:
- explicit exports
- explicit dependency ownership
- no UI imports
- no webpart-local state
- tests at the package boundary

---

### 10. Second-consumer proof must be mechanics-first
The first post-extraction reuse target should prove:
- registry-based binding
- endpoint construction
- host/bootstrap mechanics
- cache and invalidation
- error envelopes

It should **not** force another webpart into the Kudos domain contract.
