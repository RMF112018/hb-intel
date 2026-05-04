# Wave 13 — Prompt 13E — SPFx Fixture Integration Into Core Surfaces

## Scope

Wire the existing Wave 13 Procore project-mapping and Procore sync-health
read-model seams into PCC SPFx core surfaces using the fixture/backend
client patterns already present in `apps/project-control-center`. SPFx
integration only — no new model contracts, no new backend routes, no
direct SPFx-to-Procore path, no SDK, no write-back, no Procore links,
no enabled Procore actions.

This prompt builds on the seams locked by 13B/13C/13D:

- `@hbc/models/pcc` envelope keys `procore-project-mapping` and
  `procore-sync-health` (Wave 13B/13C);
- backend routes `pcc/projects/{projectId}/procore-project-mapping` and
  `pcc/projects/{projectId}/procore-sync-health` + mock provider
  (Wave 13D).

## Repo-truth file changes

### Read-model client extension (existing files)

- `apps/project-control-center/src/api/pccReadModelClient.ts` — adds the
  two route IDs (`procore-project-mapping`, `procore-sync-health`),
  their static path templates, and two `IPccReadModelClient` methods
  (`getProcoreProjectMapping`, `getProcoreSyncHealth`).
- `apps/project-control-center/src/api/pccFixtureReadModelClient.ts` —
  returns `SAMPLE_PROCORE_PROJECT_MAPPING_READ_MODEL` and
  `SAMPLE_PROCORE_SYNC_HEALTH_READ_MODEL` from `@hbc/models/pcc` for
  known projects. Unknown-project / `simulateBackendUnavailable`
  branches preserve `moduleIdentity`, `subjectAreas`,
  `registryFieldInternalNames`, `queryRecommendations`, and
  `ownershipNote`, emptying only project-specific arrays.
- `apps/project-control-center/src/api/pccBackendReadModelClient.ts` —
  binds the two methods through the existing `callBackend` pattern. No
  query params; `viewerPersona` is never serialized into the URL;
  fallback semantics for empty base URL, missing `globalThis.fetch`,
  non-2xx, malformed JSON, and invalid envelope shape match every
  sibling method.

### Shared adapter (new)

- `apps/project-control-center/src/viewModels/procoreSurfaceAdapter.ts`
  — pure, envelope-in adapter consumed by every PCC core surface that
  surfaces Procore-derived signals. Exports
  `buildPccProcoreSurfaceViewModel`,
  `buildProcorePriorityActionsForRail`,
  `IPccProcoreSurfaceClient`, `IPccProcoreSurfaceViewModel`, and the
  literal `PROCORE_DEGRADED_STATE_IDS` tuple covering the seven
  canonical degraded IDs called for by 13E:

  ```
  unmapped | stale | permission-denied | tool-disabled |
  rate-limited | partial-sync | backend-unavailable
  ```

  Adapter logic:
  - reuses `mapProcoreSourceStatusToPccPreviewState`,
    `deriveProcoreFreshnessBand`, `isProcoreSignalActionable`, and
    `redactProcoreSyncErrorMessage` from `@hbc/models/pcc` — no
    duplicated literals;
  - drives card state from envelope source-status via the existing
    `mapPccSourceStatusToPreviewState` helper (no new preview-state
    vocabulary);
  - emits one of the five allowed `PccStatusPill` tones
    (`info | success | warning | danger | neutral`);
  - fails closed for unknown projects and degraded envelopes (drops
    project-bound outputs to safe empty values);
  - does NOT include `'loading'` in its output union (loading is owned
    by hooks, not the adapter).

- `apps/project-control-center/src/viewModels/procoreSurfaceFixture.ts`
  — static fixture envelopes + precomputed view-model used by surface
  fixture-only render paths.
- `apps/project-control-center/src/viewModels/useProcoreSurfaceReadModel.ts`
  — hook used by Project Readiness when a read-model client is
  supplied; calls the two methods in parallel and runs them through
  the shared adapter.

### Surface integration (display-only)

Stable per-card markers added (one canonical degraded-state marker
per card so tests can scope assertions cleanly):

| Surface                        | Card                                                                             | Markers                                                                                                                                                        |
| ------------------------------ | -------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Project Home (read-model path) | Procore snapshot                                                                 | `data-pcc-card-id="procore-snapshot"`, `data-pcc-procore-degraded-state`, `data-pcc-procore-mapping-state`                                                     |
| Priority Actions Rail          | (uses existing `category:'procore-sync'` seam → `external-system-mapping` group) | rail markers unchanged                                                                                                                                         |
| Project Readiness              | Procore source confidence                                                        | `data-pcc-readiness-region="procore-source-confidence"`, `data-pcc-card-id="procore-source-confidence"`, `data-pcc-procore-degraded-state`                     |
| External Systems               | Procore configuration & status                                                   | `data-pcc-card-id="procore-configuration-status"`, `data-pcc-procore-configuration-state`, `data-pcc-procore-mapping-state`, `data-pcc-procore-degraded-state` |
| Site Health                    | Procore sync & repair posture                                                    | `data-pcc-card-id="procore-sync-repair"`, `data-pcc-procore-degraded-state`                                                                                    |

Project Home priority actions: the existing rail seam already routes
`category:'procore-sync'` to the `external-system-mapping` group. 13E
maps actionable Procore-derived `priority-action` signals to
`IPriorityAction[]` (id / category / title / severity only) and
appends them to the rail input list — no new lane, no invented
`IPriorityAction` record fields.

External Systems Procore tile: existing tile rendering preserved. The
new Procore configuration & status card emits
`data-pcc-procore-configuration-state="configured"` only when the
project mapping is `mapping-confirmed` AND both envelopes are
`available` — otherwise `missing` / `unavailable-fixture`.

### No-runtime + bento invariants

- Every new card is a direct `PccDashboardCard` child of the surface's
  existing bento grid path; no outer `<section>` / live-region wrappers
  around new direct children.
- No `<a href^="http(s)://">` in any Procore card.
- No enabled mutation buttons; disabled affordances return structured
  `{ opened: false, reason: 'procore-mvp-no-link' }` (not silent
  no-ops).
- No new `fetch(` callsite — the only `fetch(` site remains
  `pccBackendReadModelClient.ts`.
- No new package, manifest, lockfile, CI, or workflow changes.

## Tests added / extended

- `apps/project-control-center/src/viewModels/procoreSurfaceAdapter.test.ts`
  — pure adapter coverage: each of the seven canonical degraded
  states; fail-closed for unknown projects / unavailable envelopes;
  redaction of `errors`; vocabulary-from-`@hbc/models` checks for
  mapping state, source state, sync state; pill tones limited to the
  allowed five; `buildProcorePriorityActionsForRail` only emits
  category, id, title, severity (no invented record fields), and
  drops info-severity signals.
- `apps/project-control-center/src/tests/PccProcoreSurfaceCards.test.tsx`
  — surface-level coverage across External Systems, Site Health,
  Project Readiness (fixture path), and Project Home (read-model
  path): card present with stable `data-pcc-card-id`, bento
  direct-child invariant via `marker.closest('[data-pcc-card]')` then
  `parentElement.matches('[data-pcc-bento-grid]')`, no http(s)
  anchors, no enabled mutation buttons, allowed degraded-state and
  pill-tone values.
- Extensions to existing tests:
  - `pccReadModelClient.test.ts` — route-id list bumped from 21 to 23.
  - `pccBackendReadModelClient.test.ts` — `ROUTE_METHOD_TUPLES`
    extended with the two new tuples.
  - `pccFixtureReadModelClient.test.ts` — adds two
    `procore-project-mapping` / `procore-sync-health` describe blocks
    and bumps the "every method" matrix from 21 to 23.
  - `pcc-api-dormancy.test.ts` — adds a per-file allowlist entry for
    `procoreSurfaceAdapter.ts`'s narrow value-import of
    `mapPccSourceStatusToPreviewState`. The forbidden-runtime
    substring scan is anchored to package specifiers (relative `./`,
    `../`, and root-anchored `/` paths are skipped) so the local
    `viewModels/procoreSurfaceAdapter` module name does not trip the
    `procore` substring guard.
  - `projectHomeAdapter.test.ts` / `useProjectHomeReadModel.test.ts`
    — pass the two procore envelopes through every adapter call;
    assert priority-action prefix-equality (Procore-derived
    candidates may append) plus `category:'procore-sync'` on every
    appended item.
  - Surface card-count tests bumped:
    - `PccExternalSystemsSurface.test.tsx`: 1 + N → 1 + N + 1.
    - `PccSiteHealthSurface.test.tsx`: 4 → 5.
    - `PccProjectHome.test.tsx`: read-model path 15 → 16.
    - `askHbiGroundingCloseout.test.tsx`: 15 → 16.
    - `PccApp.optIn.test.tsx`: 15 → 16, fetch count 4 → 6, expected
      URL set extended with the two procore endpoints.

## Validation plan

- `pnpm --filter @hbc/spfx-project-control-center check-types`
- `pnpm --filter @hbc/spfx-project-control-center test`
- `pnpm --filter @hbc/spfx-project-control-center build`
- Lockfile MD5 capture (before / after) — no install commands.

Hosted / tenant / browser proof is OPERATOR-PENDING and not applicable
to local validation.
