# Prompt-01 — Phase 5 Repo Truth and Operator-Console Baseline

## Objective

Create the canonical **Phase 5 operator-console baseline** for the Admin SPFx app based on current repo truth.

This prompt should produce a durable, implementation-facing baseline that explains:
- what the Admin app is today,
- where it falls short of the intended operator-console model,
- what Phase 5 must change,
- and what Phase 5 must preserve.

## Important execution rules

- Read the smallest authoritative file set needed.
- Do **not** re-read files still in active context unless they changed or the context is stale.
- Use current code as authority over older review artifacts when they disagree.
- Do not start changing shell code in this prompt.
- Do not drift into later-phase backend functionality.

## Read this authority set

1. `docs/architecture/plans/MASTER/spfx/admin/admin-spfx-it-control-center-end-state-plan.md`
2. `docs/architecture/plans/MASTER/spfx/admin/admin-spfx-target-architecture.md`
3. `apps/admin/README.md`
4. `apps/admin/src/App.tsx`
5. `apps/admin/src/router/root-route.tsx`
6. `apps/admin/src/router/routes.ts`
7. `apps/admin/src/pages/SystemSettingsPage.tsx`
8. `apps/admin/src/pages/OperationalDashboardPage.tsx`
9. `apps/admin/src/pages/ProvisioningOversightPage.tsx`
10. `apps/admin/src/pages/ErrorLogPage.tsx`
11. `packages/features/admin/README.md`
12. `packages/shell/README.md`
13. `docs/architecture/reviews/phase-5-admin-exception-path-audit.md`
14. `docs/architecture/reviews/phase-5-admin-recovery-boundary-and-authorization-report.md`

## Create

- `docs/architecture/plans/MASTER/spfx/admin/phase-5/admin-spfx-phase-5-operator-console-baseline.md`

## Required sections

1. **Purpose**
2. **Current Admin shell and route posture**
3. **Current page inventory and what each page actually owns**
4. **What Phase 5 must preserve**
5. **What Phase 5 must change**
6. **Canonical operator-console lane set for this phase**
7. **Known current gaps / mismatches**
8. **Explicit non-goals for this phase**
9. **Implementation implications for Prompts 02–08**

## Minimum factual findings to capture if still true

- The current admin shell is still a simplified tool-picker shell.
- The current route set is still limited to a small number of pages.
- `ProvisioningOversightPage` is the strongest current run-oriented workflow page.
- `OperationalDashboardPage` is observability/queue-oriented, not a full operator-console landing shell.
- `SystemSettingsPage` is currently dominated by access-control / approval authority configuration.
- `ErrorLogPage` is still deferred and placeholder-based.
- `@hbc/features-admin` is still an admin-intelligence package, not the shell owner.
- `@hbc/shell` is already the canonical shell-ownership package.

## Deliverable quality bar

The baseline must be implementation-ready, not vague.
It must clearly separate:
- present truth,
- preserved behavior,
- phase-5-required refactor,
- and later-phase work.

## Validation

Before finishing:
- verify every referenced file path exists,
- ensure the baseline reflects current code, not stale assumptions,
- ensure it does not prescribe backend changes that belong to later phases.

## Completion condition

Stop after the baseline doc is complete.
Do not begin the route registry or shell refactor in this prompt.
