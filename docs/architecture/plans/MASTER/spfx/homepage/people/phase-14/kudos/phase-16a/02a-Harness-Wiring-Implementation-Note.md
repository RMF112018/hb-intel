# 02a — Dev-Harness Wiring Implementation Note

Implementation delivered by phase-16a prompt 02. Closes Gap 2
(`01a-Closure-Gap-Lock-Verification.md §Gap 2`).

## What landed

### Real tab routes

- `/?tab=kudos` → `apps/dev-harness/src/tabs/KudosTab.tsx` mounts the
  real `HbKudos` from `apps/hb-webparts/src/webparts/hbKudos/HbKudos.tsx`.
- `/?tab=kudos-companion` → `apps/dev-harness/src/tabs/KudosCompanionTab.tsx`
  mounts the real `HbKudosCompanion` from
  `apps/hb-webparts/src/webparts/hbKudosCompanion/HbKudosCompanion.tsx`.

Both tabs are registered in `apps/dev-harness/src/TabRouter.tsx` and
honor the existing `/?tab=<id>` deep-link contract used by every other
harness tab.

### Harness data adapter

`apps/dev-harness/src/harness/kudosHarness.ts` is the one coherent
Kudos adapter. It:

1. Stores a harness site URL via `storeSiteUrl('https://harness.local/sites/hb')`
   so the real `usePeopleCultureData` hook runs its fetch path.
2. Replaces `globalThis.fetch` with a scoped interceptor that serves
   exactly the endpoints the Kudos data layer hits:
   - `/_api/contextinfo` → deterministic digest.
   - `/_api/web/lists(guid'<kudos-guid>')/items` GET → seeded kudos as
     list items (etag + person field shape).
   - Kudos list item POST (create) → appends to seed store and bumps
     the cache probe.
   - Kudos list item POST + `X-HTTP-Method: MERGE` → merges into the
     seed store and bumps the cache probe.
   - `/_api/web/lists(guid'<audit-guid>')/items` GET/POST → reads /
     appends audit events.
   - `/_api/web/ensureuser('<email>')` → deterministic numeric id.
   - `ClientPeoplePickerSearchUser` → honors
     `__hbKudosPeopleSearchMode` for the seven catalog modes.
   - `.../fields` → empty array (runtime guardrails pass through).
3. Requests outside the harness URL are delegated to the real
   `fetch`, so co-hosted harness tabs are unaffected.

### Globals exposed on `window`

All pre-assumed by the Playwright helpers in
`e2e/webparts/kudos/helpers/`:

| Global | Purpose |
|---|---|
| `window.__hbKudosSeed(payload)` | Installs deterministic seeded state (items, audits, currentUserId, currentUserRole), calls `invalidatePeopleCultureCache()` to force the hook to refetch, and bumps the cache probe. Seed is installed **before** any user-driven mutation runs because the Playwright `goto*` helpers call it right after `waitForFunction` and before the first assertion. |
| `window.__hbKudosProbe.workflowStates` | The exact 7-state workflow union from `communicationsContracts.ts` (`pending`, `revisionRequested`, `approved`, `approvedScheduled`, `rejected`, `withdrawn`, `removedUnpublished`). The drift guard spec compares against this. |
| `window.__hbKudosCacheProbe.invalidations` | Counter bumped on every successful POST/MERGE that passes through the interceptor. Also bumped by `__hbKudosSeed`. The `stale-after-action` hosted fault intentionally suppresses the bump so the probe fires the regression. |
| `window.__hbKudosPeopleSearchMode` | Defaults to `exact-match`. Setter consumed by the interceptor's people-picker path. |
| `window.__hbKudosHostedFault` | Defaults to `none`. Setter consumed by the interceptor's write path to deterministically produce 404 / 412 / 403 / audit-write-failure / stale-after-action / slot-collision outcomes. |
| `window.__hbKudosReset` | Test-only: clears the store + counters + mode/fault defaults for isolation between top-level test runs. |

### Production isolation

- No dev-only globals leak into production runtime. `installKudosHarness()`
  is called only from the dev-harness tab `useEffect`, never from
  `hb-webparts` sources.
- The `fetch` replacement is scoped: only requests whose URL starts
  with the harness site URL are intercepted. All other requests pass
  through unchanged.
- The harness does not mutate SPFx runtime code or webpart source.

### Spec execution posture

The Playwright Kudos lane still carries `test.fixme` at the describe
level. Removing those guards is **prompt 04**'s responsibility (per
the non-drift lock in `01a-Closure-Gap-Lock-Verification.md`).
Prompt 04 depends on prompt 03 (test-id instrumentation on the real
runtime surfaces), which this phase-16a prompt does NOT touch —
locator registry entries like `hb-kudos-public-root` still do not
appear in product code.

## Verification

| Check | Result |
|---|---|
| Kudos spec discovery unchanged | `pnpm exec playwright test --config=playwright.webparts.config.ts e2e/webparts/kudos --list` → 108 tests in 23 files |
| Dev-harness typecheck clean for new files | `pnpm exec tsc --noEmit -p apps/dev-harness/tsconfig.json` shows no errors in `kudosHarness.ts`, `KudosTab.tsx`, `KudosCompanionTab.tsx`, or `TabRouter.tsx` (pre-existing errors in unrelated pwa/leadership files are out of scope) |
| Globals wired to real runtime state | `__hbKudosProbe.workflowStates` mirrors the type declaration in `apps/hb-webparts/src/homepage/webparts/communicationsContracts.ts:137`; `__hbKudosCacheProbe` is bumped in the same code path that triggers `invalidatePeopleCultureCache()` from `apps/hb-webparts/src/homepage/data/usePeopleCultureData.ts:40` |

## Follow-up scope (explicitly not in this prompt)

Per `01a-Closure-Gap-Lock-Verification.md`:

- **Gap 3 / prompt 03**: `data-hbc-testid` attributes on the real
  `HbKudos` + `HbKudosCompanion` DOM. Without them, the harness-mounted
  components render but the Playwright locators miss.
- **Gap 4 / prompt 04**: remove `test.fixme`, promote P0 execution.
- **Gap 5 / prompt 06**: live SharePoint contract lane.

The harness is now adequate for prompts 03–07 to land without
blocking on transport wiring.
