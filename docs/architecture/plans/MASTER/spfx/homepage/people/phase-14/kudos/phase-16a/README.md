# HB Kudos Targeted Closure Package

## Purpose

This package is a **closure-only** prompt set for the HB Kudos testing effort.

It is not a fresh architecture package.
It is not a broad re-audit.
It is not a net-new stress-test design.

Its sole purpose is to close the remaining blockers that currently prevent the Kudos test posture from being truly **comprehensive, executable, and regression-gate ready** across:

- the public-facing Kudos webpart
- the admin / companion Kudos webpart
- the shared data / seam / boundary contracts
- the hosted runtime / UX verification layer

## Repo-truth closure focus

The existing repo already contains:

- broad Playwright spec structure under `e2e/webparts/kudos/**`
- deterministic fixtures and helpers
- meaningful Vitest seam coverage in `apps/hb-webparts/src/homepage/__tests__/`
- mature runtime seams in:
  - `apps/hb-webparts/src/webparts/hbKudos/`
  - `apps/hb-webparts/src/webparts/hbKudosCompanion/`
  - `apps/hb-webparts/src/homepage/data/`
  - `apps/hb-webparts/src/homepage/helpers/`
  - `apps/hb-webparts/src/homepage/shared/`

The remaining closure work is targeted at these gaps:

1. the browser suite is still blocked by missing dev-harness wiring
2. the product/runtime surfaces do not yet appear fully instrumented with the locator contract expected by the E2E lane
3. the Playwright lane must be made executable, not just discoverable
4. several source-level logic seams still deserve direct runnable coverage
5. a thin live SharePoint integration lane should be added so the final posture is not purely simulated
6. CI must be promoted from discovery-only toward true regression gating

## Architectural rules

- Use repo truth only.
- Do not re-open the overall phase strategy.
- Do not redesign the Kudos system.
- Do not replace the current Playwright-based lane with a different browser framework unless the repo forces it.
- Do not weaken the existing scenario matrix.
- Do not leave `test.fixme` scaffolding in place and call the suite “closed.”
- Do not create test-only abstractions that drift from the actual runtime seams.
- Prefer narrow, deterministic, reversible wiring over broad speculative refactors.

## Mandatory agent directive

Include and follow this directive in every workstream:

> Do not re-read files that are already in your active context unless needed to confirm drift, dependencies, or uncertainty after changes.

## Execution order

1. `00-Plan-Summary.md`
2. `01-Closure-Gap-Summary.md`
3. `02-Dev-Harness-Wiring-Prompt.md`
4. `03-Test-ID-Instrumentation-Prompt.md`
5. `04-Playwright-Activation-Prompt.md`
6. `05-Source-Level-Hardening-Prompt.md`
7. `06-Live-SharePoint-Integration-Lane-Prompt.md`
8. `07-CI-Promotion-and-Final-Closure-Prompt.md`

## Closure standard

This package is complete only when:

- the Playwright Kudos lane can actually execute
- the dev harness exposes the required Kudos routes and globals
- the locator contract is present in runtime code
- the P0 browser lane runs green
- the remaining pure/data seams have direct runnable coverage
- a thin live SharePoint integration lane exists for non-destructive contract proof
- CI is configured to enforce the runnable suite rather than merely discover it
