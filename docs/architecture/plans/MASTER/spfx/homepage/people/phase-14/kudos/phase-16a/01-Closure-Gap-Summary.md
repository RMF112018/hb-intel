# 01 — Closure Gap Summary

## Objective

Lock the exact remaining gaps between the current repo state and true closure of the HB Kudos testing effort.

## Repo-truth closure gaps

### Gap 1 — Browser suite scaffolding exists, but execution is still blocked

The repo already has:

- `e2e/webparts/kudos/public/**`
- `e2e/webparts/kudos/companion/**`
- `e2e/webparts/kudos/shared/**`
- `e2e/webparts/kudos/hosted/**`
- fixtures/helpers/locator registry/assertions

But the suite is still guarded by `test.fixme` because the harness prerequisites are not fully landed.

### Gap 2 — Dev-harness prerequisites are still the main blocker

The current lane expects:

- `/?tab=kudos`
- `/?tab=kudos-companion`
- `window.__hbKudosSeed(payload)`
- `window.__hbKudosProbe.workflowStates`
- `window.__hbKudosCacheProbe.invalidations`
- people-search mode override
- hosted-fault override

The current closure effort must verify these are actually implemented in the dev harness and not merely documented.

### Gap 3 — Locator contract appears stronger in tests than in runtime code

`e2e/webparts/kudos/helpers/kudosLocators.ts` defines a clear contract, but closure requires those locator ids to exist on the real public and companion UI surfaces, not just in helper files and spec assumptions.

### Gap 4 — Source-level logic still needs a few direct tests

The repo already has strong seam tests, but closure should add direct runnable coverage for:

- `applyCompanionFilter`
- `fetchKudosAuditTimeline`
- role resolution / denial / fallback behavior
- prominence collision / demotion behavior
- cache invalidation observability coupling
- state/race-sensitive behaviors where browser-only coverage is too indirect

### Gap 5 — The current posture is still too simulated

The deterministic browser harness is good and should stay, but comprehensive closure should also add a thin real-contract lane against a dedicated SharePoint dev/staging environment so final confidence is not based only on simulation.

### Gap 6 — CI is not yet a true Kudos regression gate

Current posture is best described as:

- strong runnable Vitest seam coverage
- Playwright discovery / structure in place
- full browser execution not yet promoted

That is not yet a true closure state.

## Required interpretation lock

The next prompts are not allowed to drift into broad redesign. They must close only the gaps above.

## Prohibited shortcuts

- do not call discovery-only Playwright “closed”
- do not leave `test.fixme` in place and declare success
- do not add fake root probes in test code without wiring the harness
- do not add brittle selectors instead of implementing the locator contract
- do not skip the thin live SharePoint lane
