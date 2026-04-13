# Phase 04 — Closure Note — Rewire Webpart-Local Orchestration

## What was rewired
Layer 3 (webpart-local runtime) no longer imports from the low-level
SharePoint transport modules that were displaced by the adapter layer.
All Kudos business actions now flow through `homepage/data/kudosAdapter/`.

Consumer updates:
- `webparts/hbKudos/HbKudos.tsx` — `submitKudosDraft` now imported from
  the Kudos adapter (was `peopleCultureSubmissionSource`).
- `webparts/hbKudosCompanion/components/DetailPanel.tsx` — both
  `getKudosAuditTimeline` (aliased locally as `fetchKudosAuditTimeline`)
  and the `KudosAuditTimelineEntry` type now imported from the Kudos
  adapter (type was still pointing at `kudosGovernanceWriter`).

Adapter augmentation:
- `kudosAdapter/reads.ts` re-exports `KudosAuditTimelineEntry` so Layer 3
  has a single typed surface for audit-timeline reads.

## Remaining Layer-3 imports from `homepage/data/**`
These are intentionally left — they are not low-level transport mechanics
and Phase 04 explicitly requires keeping local orchestration local:

- `spContext.getKudosListHostUrl` / `resolveCurrentUserId` — canonical
  host resolution and current-user seam, used at the bootstrap edge.
- `usePeopleCultureData` — shared PC cache hook (invalidation primitive
  now comes from `@hbc/sharepoint-platform`).
- `useKudosComposer`, `useSharePointPeopleSearch` — composer state +
  people-search transport hooks; webpart-local concerns per plan 04.

## Invariants preserved
- Queue, filter, and dialog UX logic stays in the companion runtime.
- Public featured/recent/archive derivation stays in `usePublicKudosData`.
- Recipient photo hydration (`useRecipientPhotoHydration`) stays local.
- Bulk-approval progress/action-dialog behavior unchanged.
- GUID binding, canonical `KUDOS_LIST_HOST_URL`, audit-event writes,
  post-mutation cache invalidation all unchanged.

## Verification
| Command | Result |
|---|---|
| `pnpm --filter @hbc/spfx-hb-webparts check-types` | pass |
| `pnpm --filter @hbc/spfx-hb-webparts test` | 464 pass / 17 fail — identical to Phase-03 baseline; no loss of workflow, archive/public visibility, or bulk-approval behavior |

## Manifest
- `apps/hb-webparts/config/package-solution.json` feature version
  `1.0.0.188` → `1.0.0.189`.
- Solution version unchanged at `1.0.0.189`.
