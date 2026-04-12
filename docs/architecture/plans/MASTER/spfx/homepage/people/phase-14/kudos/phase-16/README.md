# HB Kudos Stress-Test Prompt Package

## Purpose

This package instructs the local code agent to implement a **broad, deterministic, end-to-end stress test** of the complete HB Kudos system on the live repo main branch.

This package is **repo-truth-based**. It is built around the current split runtime:

- `apps/hb-webparts/src/webparts/hbKudos/`
- `apps/hb-webparts/src/webparts/hbKudosCompanion/`
- `apps/hb-webparts/src/homepage/data/`
- `apps/hb-webparts/src/homepage/shared/`
- `apps/hb-webparts/src/homepage/helpers/`
- `apps/hb-webparts/src/homepage/webparts/`
- `packages/ui-kit/src/homepage.ts`
- the constrained homepage exports for `HbcPeopleCultureSurface`, `HbcKudosComposer*`, `HbcPeoplePicker`, and `HbcAvatarStack`
- `apps/hb-webparts/src/mount.tsx`
- existing Playwright infrastructure rooted at `playwright.webparts.config.ts` and `e2e/webparts`

## Primary objective

Implement a **production-grade stress harness** that proves the complete Kudos workflow and UX across:

- employee/public surface
- admin/companion governance surface
- shared UI-kit seams
- SharePoint data read/write seams
- state refresh / cache invalidation / audit-event integrity
- hosted runtime behavior

The implementation must cover both **happy paths** and **adversarial / edge / drift paths**.

## Architectural rules

- Use **repo truth**, not historical assumptions.
- Do **not** collapse the workflow model into a fake larger status enum.
- The current core workflow union is 7-state. Many user-visible states are implemented as **actions, metadata overlays, visibility modes, prominence modes, or audit events**, not as standalone workflow states.
- Preserve existing runtime boundaries:
  - employee/public detail view must **not** leak audit timeline or governance internals
  - governance detail view **must** prove audit timeline behavior
  - typed people search and photo hydration must be tested through their real seams
- Prefer extending the existing Playwright / `e2e/webparts` infrastructure over introducing a second overlapping E2E runner.
- Favor deterministic fixtures, deterministic clocks, deterministic IDs, and deterministic seed generation.
- Any mocks, stubs, or seed adapters must be explicit and reversible.
- The stress harness must produce evidence artifacts, not just pass/fail booleans.

## Mandatory agent directive

Include this directive in every workstream and keep following it throughout execution:

> Do not re-read files that are already in your active context unless needed to confirm drift, dependencies, or uncertainty after changes.

## Prohibited shortcuts

- Do not replace the full stress objective with narrow unit tests only.
- Do not stop at a static scenario matrix.
- Do not implement only composer tests.
- Do not implement only companion moderation tests.
- Do not rely on vague “manual validation recommended” language as closure.
- Do not introduce dead scaffolds, placeholder specs, or fake pass markers.
- Do not silently weaken coverage when a seam is difficult.
- Do not flatten public/admin boundaries into one permissive fake mode.

## Expected implementation shape

The final result should include, at minimum:

- a locked scenario/state matrix derived from current repo truth
- a deterministic fixture/seed strategy
- Playwright-based browser stress coverage
- shared-seam validation around data mapping, people picker, composer, photo handling, and detail-panel boundaries
- hosted validation for SharePoint-style runtime constraints
- evidence artifacts:
  - screenshots
  - HTML report
  - traces
  - defect log / coverage map
  - explicit closure summary

## Execution order

1. `00-Plan-Summary.md`
2. `01-Audit-Summary.md`
3. `02-Scenario-Matrix-Prompt.md`
4. `03-Test-Harness-Architecture-Prompt.md`
5. `04-Fixtures-and-Seed-Data-Prompt.md`
6. `05-Public-Webpart-Stress-Test-Prompt.md`
7. `06-Admin-Companion-Stress-Test-Prompt.md`
8. `07-Shared-Component-and-Seam-Validation-Prompt.md`
9. `08-Hosted-Validation-and-Closure-Prompt.md`

Do not change the execution order unless repo truth forces a dependency inversion, and if it does, document that inversion explicitly in the implementation notes.
