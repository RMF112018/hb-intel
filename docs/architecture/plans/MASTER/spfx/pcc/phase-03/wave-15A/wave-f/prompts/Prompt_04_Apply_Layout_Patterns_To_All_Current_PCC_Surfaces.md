# Prompt 04 — Apply Layout Patterns to All Current PCC Surfaces

## Role

You are the local code agent executing PCC Phase 3 Wave 15A / Wave D — Grid, Bento, Card Hierarchy, and Layout Primitives.

## Objective

Apply the shared Tier 1 / Tier 2 / Tier 3 and command/operational/reference patterns to every current routed PCC surface.

## Scope

- All current routed surface components under `apps/project-control-center/src/surfaces/`.
- Surface tests for tier/region/active-panel/direct-child behavior.
- Minimal CSS changes through shared primitives first, surface modules second only where needed.

## Non-Scope

- No new business capability.
- No changed read-model contracts or fixtures unless needed for test-only labels.
- No live actions.
- No broad shell/navigation redesign.

## Required Repo-Truth Inspection

- Re-inspect `PccSurfaceRouter.tsx` for current routed surfaces.
- Inspect each surface source and child cards before editing.
- Inspect tests for each route: Project Home, Team & Access, Documents, Project Readiness, Approvals, External Systems, Settings, Site Health.
- Verify External Systems drawer exclusion from bento direct-child expectations.

## Exact or Best-Known Source Areas to Change

- `apps/project-control-center/src/surfaces/projectHome/**`
- `apps/project-control-center/src/surfaces/teamAccess/**`
- `apps/project-control-center/src/surfaces/documents/**`
- `apps/project-control-center/src/surfaces/projectReadiness/**`
- `apps/project-control-center/src/surfaces/approvals/**`
- `apps/project-control-center/src/surfaces/externalSystems/**`
- `apps/project-control-center/src/surfaces/controlCenterSettings/**`
- `apps/project-control-center/src/surfaces/siteHealth/**`
- `apps/project-control-center/src/tests/**` and colocated tests

## Implementation Requirements

- One Tier 1 command/context card per ready routed surface.
- Operational cards use Tier 2 and appear before references.
- Reference/deferred/support cards use Tier 3 and lower density/weight.
- Team & Access must be explicitly remediated for narrow-column readability.
- Preserve `data-pcc-active-surface-panel` uniqueness.
- Preserve direct cards under `PccBentoGrid`.
- Preserve Prompt 05 product-grade state/copy and disabled-affordance behavior.

## Required Tests

- Route tests for one Tier 1 card per surface.
- Tests for operational/reference region markers.
- Tests for direct-child invariants.
- Existing surface tests remain green.
- Add Team & Access forceMode responsive assertions.

## Required Screenshot / Evidence Output

- Capture or queue before/after screenshots for each route.
- At minimum, capture Team & Access after remediation in all required modes before proceeding to closeout.

## Scorecard Impact

Primary score movement for card hierarchy, scan path, surface composition, density, and product confidence.

## Closeout Requirements

Use the shared closeout format below and update/create Wave D evidence docs under the canonical Wave 15A paths.

## Stop Conditions

- Any surface cannot be classified into command/operational/reference without product decision.
- Team & Access still shows narrow-column collapse after primitive and surface changes.
- Active-panel uniqueness breaks.
- Tests indicate direct-child invariant broken.

## Instruction on Context Reuse

Do not re-read files that are still within your current context unless exact wording, line references, or changed repo state must be verified.

## Shared Instructions

## Repo-Truth Baseline

- Repository: `RMF112018/hb-intel`
- Audited ref: `a79d62155f5dc16936dbfa70d5c8a3cbea34b3e1`
- PCC app root: `apps/project-control-center/`
- Recommended package placement: `docs/architecture/plans/MASTER/spfx/pcc/phase-03/wave-15A/wave-D-grid-card-layout-remediation/`
- Runtime implementation is **not** included in this package. This package is for a local code agent to execute in the repo.

## Non-Negotiables for the Local Agent

- Inspect repo truth before editing.
- Do not re-read files still within current context unless exact wording, line references, or changed repo state must be verified.
- Preserve active routed-surface semantics: exactly one `[data-pcc-active-surface-panel]` per active route.
- Preserve the bento direct-child invariant unless a shared layout primitive explicitly replaces it.
- Prefer shared primitives and named contracts over one-off surface CSS.
- Do not introduce backend/API, Graph, PnP, Procore SDK, Document Crunch, Adobe Sign, CI, package-manager, or app-catalog scope.
- Do not claim final `56/56` readiness. Wave D can move layout/card/responsive/visual hierarchy categories, but final readiness requires Wave H-style tenant-hosted, screenshot, accessibility, keyboard, and regression evidence.

## Required Closeout Format

At the end of this prompt, report:

- exact files inspected;
- exact files changed;
- tests run and results;
- screenshots/evidence produced;
- lockfile MD5 before/after if any source/docs changed;
- residual issues;
- stop conditions encountered;
- next prompt to execute.

## Next Prompt

Proceed to `Prompt_05_Layout_Tests_Responsive_Smoke_And_Screenshot_Evidence.md`.
