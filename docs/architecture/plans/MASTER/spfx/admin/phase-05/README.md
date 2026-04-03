# README — Admin SPFx IT Control Center Phase 5 Prompt Package

## What this package contains

This package is a local-code-agent execution set for:

**Phase 5 — Operator console foundation in SPFx**

Included files:

1. `Admin-SPFx-IT-Control-Center-Phase-5-Summary-Plan.md`
2. `README.md`
3. `Prompt-01-Phase-5-Repo-Truth-And-Operator-Console-Baseline.md`
4. `Prompt-02-Phase-5-Route-Taxonomy-And-Navigation-Registry.md`
5. `Prompt-03-Phase-5-Shell-Refactor-And-Primary-Navigation.md`
6. `Prompt-04-Phase-5-Workflow-Lane-Page-Scaffolds.md`
7. `Prompt-05-Phase-5-Rehome-Existing-Surfaces-And-Preserve-Behavior.md`
8. `Prompt-06-Phase-5-Operator-Entry-Points-And-Context-Handoff.md`
9. `Prompt-07-Phase-5-Docs-Alignment-And-Local-Guidance.md`
10. `Prompt-08-Phase-5-Validation-And-Exit-Reconciliation.md`

## Intended execution order

Run the prompt files in numeric order.

Do not skip ahead unless repo truth forces a correction and the active prompt tells the agent to stop and reconcile first.

## Primary implementation posture for this phase

Phase 5 is a **shell / IA / workflow composition phase**.

That means:
- it should refactor the Admin app into a stronger operator console,
- it should create stable lane/page anchors,
- it should preserve healthy existing functionality,
- and it should avoid pulling later-phase backend/control-plane work into SPFx.

## Required working assumptions

Use these as locked unless repo truth materially contradicts them:

- The Admin app is becoming the operator console.
- Privileged work remains backend-owned.
- `@hbc/features-admin` remains admin intelligence, not shell/control-plane ownership.
- `@hbc/shell` remains the canonical shell-ownership package.
- Existing provisioning oversight should be preserved and rehomed, not discarded.
- Existing access-control administration should remain available even if it no longer dominates the primary operator-console landing experience.

## How the local code agent should behave

- Read the smallest authoritative file set needed for the current prompt.
- Do **not** re-read files that are already in active context or memory unless:
  - the file changed,
  - context became stale,
  - or the prompt explicitly requires a fresh verification.
- Prefer live repo truth over earlier commentary.
- Keep this phase architecture-safe and shell-focused.
- Do not over-engineer the UI shell by inventing framework layers the repo does not need.

## Where changes are most likely

### Primary
- `apps/admin/src/router/**`
- `apps/admin/src/pages/**`
- `apps/admin/src/components/**`
- `apps/admin/src/constants/**`
- `apps/admin/src/utils/**`

### Secondary / only if justified
- `packages/shell/**`
- `packages/ui-kit/**`

### Documentation
- `docs/architecture/plans/MASTER/spfx/admin/**`
- `apps/admin/README.md`
- directly affected reference docs

## Cautions

- Do not move privileged execution logic into SPFx.
- Do not let route renames break existing deep links without fixing the callers.
- Do not erase or hide healthy existing admin surfaces just because the IA is changing.
- Do not let “operator console” become an excuse to build later-phase domain functionality prematurely.
- Do not create page-local shell orchestration that should live in `@hbc/shell` if the package already exposes the right seam.
- Do not expand `@hbc/features-admin` into shell ownership.

## Validation posture

Use the smallest meaningful validation set for each step.

Expected validation emphasis for this phase:
- route correctness
- preserved permission gating
- rendered shell/navigation structure
- working existing pages after rehoming
- deep-link and inbound context behavior
- documentation alignment

Run broader tests only when the touched code actually justifies them.

## Canonical Phase 5 artifacts

### Baseline docs (define the model)

| Document | Prompt | Purpose |
|----------|--------|---------|
| [Operator-Console Baseline](admin-spfx-phase-5-operator-console-baseline.md) | P5-01 | Current shell/route posture, page inventory, lane mapping, preservation/change requirements |
| [Route Taxonomy](admin-spfx-phase-5-route-taxonomy.md) | P5-02 | Canonical lane model, route registry, navigation metadata, legacy redirects |
| [Page Ownership Map](admin-spfx-phase-5-page-ownership-map.md) | P5-02 | Page-to-lane mapping, rehomed pages, scaffold pages, legacy redirects |

### Implementation notes (created by later prompts)

| Document | Prompt | Purpose |
|----------|--------|---------|
| Route registry (`apps/admin/src/router/lane-registry.ts`) | P5-02 | Single source of truth for lane metadata, route paths, navigation labels, ordering |
| Shell refactor (`apps/admin/src/router/root-route.tsx`, `routes.ts`) | P5-03 | Lane-driven navigation, 8 lane routes, 3 legacy redirects, operator landing page |
| Lane page scaffolds (`apps/admin/src/pages/*LanePage.tsx`) | P5-04 | Dedicated scaffold pages for Setup, Validation, SharePoint, Entra with purpose/ownership/links |
| [Rehoming Decisions](admin-spfx-phase-5-rehoming-decisions.md) | P5-05 | Page placement, legacy redirect rationale, permission model, stale reference fixes |
| Docs alignment (P5-07) | P5-07 | README lane model guidance, admin-recovery-boundary route update, current-state-map update |

### Exit reconciliation (created by P5-08)

| Document | Prompt | Purpose |
|----------|--------|---------|
| [Exit Reconciliation](admin-spfx-phase-5-exit-reconciliation.md) | P5-08 | Acceptance criteria, validation results, residual risks, next phase entry |

## Completion standard

The package is complete when the Admin app behaves like the operator-console foundation for the control center and the repo has clear documentation explaining:
- the lane model,
- the route model,
- the page ownership model,
- and the preserved boundary between frontend operator shell and backend privileged execution.
