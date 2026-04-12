# 00 — Plan Summary

## Objective

Close the remaining gaps preventing the HB Kudos test effort from being truly executable and credible as a regression gate.

This closure package is focused on execution readiness, not theory.

## Process Overview

- wire the missing dev-harness routes and probe globals the current Playwright lane already depends on
- push the `data-hbc-testid` locator contract into the real runtime surfaces and shared primitives
- remove `test.fixme` blockers by proving the existing browser specs can execute
- add targeted source-level tests for remaining high-risk logic seams
- add a thin live SharePoint integration lane for real contract proof
- promote CI from discovery-only to executable regression gating

## Recommended closure sequence

### Workstream 1 — Make the harness real

Implement the exact dev-harness tabs, seed hooks, probe globals, and runtime test plumbing that the existing `e2e/webparts/kudos/**` lane expects.

### Workstream 2 — Instrument the product surfaces

Add the missing `data-hbc-testid` attributes to the actual public and companion runtime surfaces and any shared primitives they depend on.

### Workstream 3 — Turn the Playwright lane on

Drop the `test.fixme` guards only after the harness and locator prerequisites are genuinely satisfied.

### Workstream 4 — Tighten source-level seam coverage

Add direct runnable tests for logic seams that should not rely only on browser execution.

### Workstream 5 — Add a thin live integration lane

Prove the real SharePoint / Graph contracts in a narrow, safe, deterministic, non-destructive way.

### Workstream 6 — Promote CI and close

Move from:
- Vitest-only confidence
- Playwright `--list` discovery

to:
- runnable P0 browser regression gate
- artifact-backed failure triage
- explicit closure report

## Closure standard

Do not call this effort closed until all of the following are true:

- dev-harness Kudos tabs exist and work
- required global probes exist and are consumed by the browser suite
- locator contract is implemented in runtime code
- P0 browser tests execute successfully
- critical source-level seams have direct tests
- live SharePoint contract checks exist
- CI enforces the runnable subset
