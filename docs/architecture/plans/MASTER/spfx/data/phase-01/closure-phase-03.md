# Phase 03 — Closure Note — Formalize Kudos Domain Adapter

## 3-layer responsibility summary

### Layer 1 — `@hbc/sharepoint-platform`
UI-free SharePoint mechanics: host/list-host storage, `SharePointListDescriptor` + endpoint builders, request digest, ensure-user, current-user, item meta/ETag, MERGE, normalized result envelopes, cache-invalidation bus. No React, no domain logic.

### Layer 2 — `apps/hb-webparts/src/homepage/data/kudosAdapter/` (new)
Typed Kudos domain front door. Single import surface for Layer 3.

Exports:
- `getKudosEntries(siteUrl)` — narrows `fetchPeopleCultureListData` to the Kudos slice.
- `getKudosAuditTimeline(siteUrl, kudosId)` — re-export of the existing audit-timeline reader.
- `submitKudosDraft` + supporting types — re-exported from `peopleCultureSubmissionSource`.
- `applyKudosPatch` (alias of `submitKudosGovernanceAction`), `submitKudosGovernanceAction`, `executeKudosPatch`, `buildKudosPatchPlan`, `fetchProminenceSlotState` — re-exported from `kudosGovernanceWriter`.
- `validateKudosBindings(siteUrl)` — verifies the critical field internal names on the Kudos and Kudos Audit Events lists via platform `buildListFieldsEndpoint`.

### Layer 3 — `apps/hb-webparts/src/webparts/hbKudos/**` and `webparts/hbKudosCompanion/**`
Webpart-local orchestration: UX state, view composition, queue derivation, detail-panel flows, bulk-approval progress, filters, celebrate hook. Now consumes the Layer 2 adapter for Kudos business actions; no longer imports `kudosGovernanceWriter.ts` directly.

## Rewired consumers
- `webparts/hbKudos/hooks/useCelebrateAction.ts`
- `webparts/hbKudosCompanion/runtime/useBulkApproval.ts`
- `webparts/hbKudosCompanion/runtime/useCompanionActions.ts`
- `webparts/hbKudosCompanion/components/DetailPanel.tsx`

## What did not move
- `kudosContracts.ts` remains the authoritative domain typing source.
- Kudos role resolution (`kudosRoleResolver.ts`), capability derivation (`kudosCapabilities.ts`), prominence rules (`kudosProminenceRules.ts`), and notification builder stay where they are — they are domain helpers consumed by the adapter's underlying writer, not Layer 2 entrypoints themselves.
- Underlying modules (`peopleCultureSubmissionSource.ts`, `kudosGovernanceWriter.ts`, `peopleCultureListSource.ts`) remain exported for internal use; the adapter is the preferred front door for new Layer-3 code.

## Invariants preserved
- GUID-safe list binding.
- Canonical `KUDOS_LIST_HOST_URL`.
- Audit-event writes on every governance transition.
- Post-mutation cache invalidation via the shared bus.
- No generic "fetch any list" adapter surface.

## Verification
| Command | Result |
|---|---|
| `pnpm --filter @hbc/spfx-hb-webparts check-types` | pass |
| `pnpm --filter @hbc/spfx-hb-webparts test` | 464 pass / 17 fail — baseline was 459/17; +5 new adapter tests pass; failure count unchanged |

## Manifest
- `apps/hb-webparts/config/package-solution.json` feature version `1.0.0.187` → `1.0.0.188`.
- Solution version unchanged at `1.0.0.189`.
