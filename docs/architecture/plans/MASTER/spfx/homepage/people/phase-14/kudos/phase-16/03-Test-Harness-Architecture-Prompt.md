# 03 — Test Harness Architecture Prompt

You are working in the live repo for `RMF112018/hb-intel`.

Your task is to implement the **strongest-fit test harness architecture** for the HB Kudos stress suite.

## Mandatory directive

Do not re-read files that are already in your active context unless needed to confirm drift, dependencies, or uncertainty after changes.

## Objective

Use the current repo’s testing posture and runtime seams to implement a serious, maintainable stress harness for the complete Kudos workflow and UX.

## Architecture decision lock

Use the existing Playwright lane as the primary browser/E2E harness unless repo truth forces a different choice. The repo already contains a dedicated Playwright webparts configuration and webparts E2E lane. Build on that foundation instead of introducing a second competing browser harness.

## Required work

### 1. Inspect and lock the current test execution seams

At minimum, confirm and document the final harness plan around:

- `playwright.webparts.config.ts`
- `e2e/webparts`
- dev harness assumptions
- base URL assumptions
- report / trace artifact locations
- CI vs local retry behavior

### 2. Implement the suite structure

Create or extend a clear test structure such as:

- `e2e/webparts/kudos/public/`
- `e2e/webparts/kudos/companion/`
- `e2e/webparts/kudos/shared/`
- `e2e/webparts/kudos/hosted/`
- `e2e/webparts/kudos/fixtures/`
- `e2e/webparts/kudos/helpers/`

Use names that match repo conventions if a better existing pattern is present.

### 3. Implement deterministic helpers

Add reusable helpers for:

- seeded Kudos entry generation
- seeded audit-event generation
- deterministic clock control or deterministic timestamps
- common page object / locator helpers
- screenshot naming discipline
- trace/report artifact naming discipline
- reusable assertions for public/admin data boundaries

### 4. Implement a harness contract document

Create a markdown doc inside the repo that explains:

- how the suite is organized
- how data is seeded / mocked / injected
- which seams are real vs simulated
- how to run focused subsets
- how to produce traces/screenshots/reports

## Required design rules

- Prefer **stable locators** and durable test IDs where missing.
- If stable test IDs are missing, add them deliberately rather than relying on brittle visual text only.
- Do not overuse forced clicks.
- Use Playwright’s actionability and retrying assertions correctly.
- Capture traces and screenshots for failure analysis.
- Make the suite readable enough that failures can be triaged quickly.

## Required evidence outputs

The harness must support generation of:

- Playwright HTML report
- per-failure trace artifacts
- curated proof screenshots for key workflows
- explicit run commands for local execution

## Prohibited shortcuts

- no Cypress sidecar unless absolutely forced by repo truth
- no pure unit-test substitute for browser coverage
- no ad hoc one-file mega spec
- no nondeterministic random data without stable seed control
- no fake passing screenshots disconnected from the executed suite

## Final deliverables in this workstream

1. harness architecture committed
2. helper/fixture structure committed
3. any required selector/test-id hardening committed
4. run instructions committed
5. short implementation summary committed
