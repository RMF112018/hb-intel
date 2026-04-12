# 01a — Closure Gap Lock Verification

Companion to `01-Closure-Gap-Summary.md`. Each gap is verified against
the current repo state (branch `main`, parent `af909ee6`) so prompts
02–07 can proceed without re-litigating scope.

## Gap verification

### Gap 1 — Browser suite scaffolding vs execution

**Verified.** `e2e/webparts/kudos/**` ships 23 spec files across
`public/` (8), `companion/` (8), `shared/` (1), and `hosted/` (6) — 108
discoverable cases (`pnpm exec playwright test
--config=playwright.webparts.config.ts e2e/webparts/kudos --list`).
Every `describe` carries `test.fixme` pending harness wiring. Suite
structure is complete; execution is not.

### Gap 2 — Dev-harness prerequisites

**Verified absent.**

- `apps/dev-harness/src/tabs/` has no `kudos*` tab file.
- Repo-wide search for `__hbKudosSeed`, `__hbKudosProbe`, and
  `__hbKudosCacheProbe` returns zero matches inside
  `apps/dev-harness/`. The globals are declared and consumed only by
  the test helpers under `e2e/webparts/kudos/helpers/`.
- People-search mode override (`__hbKudosPeopleSearchMode`) and
  hosted-fault override (`__hbKudosHostedFault`) are equally absent
  from dev-harness code.

Scope owner: phase-16a prompt 02.

### Gap 3 — Locator contract not yet in product code

**Verified absent.** The registry at
`e2e/webparts/kudos/helpers/kudosLocators.ts` enumerates the required
`data-hbc-testid` ids. A repo-wide grep for representative anchors
(`hb-kudos-public-root`, `hb-kudos-companion-root`,
`hb-kudos-give-trigger`) returns no hits in
`apps/hb-webparts/**`. The contract is one-sided.

Scope owner: phase-16a prompt 03.

### Gap 4 — Source-level coverage gaps

**Verified.** Target functions exist today and lack direct Vitest
coverage:

| Target | Source location |
|---|---|
| `applyCompanionFilter` | `apps/hb-webparts/src/webparts/hbKudosCompanion/HbKudosCompanion.tsx:220` |
| `fetchKudosAuditTimeline` | `apps/hb-webparts/src/homepage/data/kudosGovernanceWriter.ts:1096` |
| role resolution / denial / fallback | `apps/hb-webparts/src/homepage/helpers/kudosRoleResolver.ts`, `kudosCapabilities.ts` |
| prominence collision / demotion | `apps/hb-webparts/src/homepage/helpers/kudosProminenceRules.ts` |
| cache invalidation observability | `apps/hb-webparts/src/homepage/data/usePeopleCultureData.ts` |

Scope owner: phase-16a prompt 05.

### Gap 5 — No live SharePoint contract lane

**Verified absent.** No `e2e/live/**` or SharePoint-pointed Playwright
project exists; `playwright.webparts.config.ts` targets only the local
dev-harness. All current confidence is simulated.

Scope owner: phase-16a prompt 06.

### Gap 6 — CI not yet a true Kudos regression gate

**Verified.** The closure recommendation in `14-Closure-Report.md §8`
proposes a Vitest gate and a Playwright discovery gate now, with
execution promotion after harness wiring. Neither step is yet wired
into CI configuration.

Scope owner: phase-16a prompt 07.

## Lock

All six gaps in `01-Closure-Gap-Summary.md` are confirmed against
present repo truth. Prompts 02–07 are authorized to close only these
gaps and MUST NOT drift into broad redesign. In particular:

- No new fake root probes in test code without wiring the harness
  (prompt 02 owns the real wiring).
- No brittle selectors added in product code — the locator contract
  from the registry is the single source of truth (prompt 03).
- Discovery-only Playwright must not be declared closed (prompts 04
  and 07 own the execution promotion).
- `test.fixme` must be removed as part of closure (prompt 04 owns the
  removal once 02 + 03 land).
- The thin live SharePoint lane is not optional (prompt 06).

## Artifacts referenced

- `01-Closure-Gap-Summary.md` — the authoritative gap list.
- `09-Scenario-Matrix.md` — coverage coordinates and priority tiers.
- `10-Harness-Architecture.md` — prerequisites contract owned by
  prompts 02 and 03.
- `11-Fixture-Catalog.md` — deterministic seed API consumed by the
  harness seed hook.
- `14-Closure-Report.md` — prior-phase closure state and CI
  recommendation this phase-16a must actually implement.
