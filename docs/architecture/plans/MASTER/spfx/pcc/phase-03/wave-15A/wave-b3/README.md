# PCC Wave 15A — Prompt 02 Remediation Package

## Objective

Implement the shared PCC bento/card primitive contract that governs hierarchy, semantics, visual weight, state posture, and surface composition across every current Project Control Center route.

This package converts Prompt 02 from a narrow card-prop exercise into a durable **surface composition system**. The output must prevent future PCC routes from drifting back into equal-weight white-card grids.

## What This Stage Must Deliver

1. A shared `PccDashboardCard` contract with:
   - explicit `tier`
   - explicit `region`
   - explicit `headingLevel`
   - ARIA labeling tied to visible headings
   - preserved legacy `hierarchy`
   - preserved existing data markers

2. A completed footprint expansion:
   - keep `hero`, `wide`, `standard`, `compact`, `tall`, `full`
   - add `rail`
   - add `detail`
   - update every responsive map and test

3. A visual hierarchy system:
   - Tier 1 command card treatment
   - Tier 2 operational treatment
   - Tier 3 reference treatment
   - State/deferred treatment
   - region-specific styling hooks

4. Surface-wide migration:
   - Project Home
   - Team & Access
   - Documents
   - Project Readiness
   - Approvals
   - External Systems
   - Control Center Settings
   - Site Health

5. Validation:
   - primitive tests
   - route/surface composition tests
   - footprint map tests
   - accessibility tests
   - no direct-child bento regression
   - screenshot evidence plan and closeout notes

## Execution Rules

- Treat this package as the authoritative implementation contract for Prompt 02.
- Do not re-read files that are still within the current agent context or memory. Use targeted reads only when needed to verify current repo truth.
- Preserve read-only / preview-only / inert behavior.
- Do not enable any mutation, integration, launch, save, approval, repair, access, sync, or HBI execution flow.
- Do not install packages.
- Do not change `pnpm-lock.yaml`.
- Do not modify backend/functions.
- Do not change read-model business semantics.
- Do not introduce wrappers between `PccBentoGrid` and `PccDashboardCard` direct children.

## Implementation Order

1. Read `01_CARD_TIER_REGION_CONTRACT.md`.
2. Read `03_VISUAL_HIERARCHY_AND_TOKEN_SPEC.md`.
3. Read `05_FOOTPRINT_RAIL_DETAIL_SPAN_SPEC.md`.
4. Execute prompts 01–03.
5. Read `02_SURFACE_CARD_INVENTORY_MATRIX.md`.
6. Execute prompts 04–07.
7. Execute prompt 08 for tests.
8. Execute prompt 09 for evidence and closeout.

## Definition of Done

Prompt 02 is done only when all of the following are true:

- `PccDashboardCard` supports `tier`, `region`, and `headingLevel`.
- Every rendered PCC card has a testable tier and region.
- Every routed surface has exactly one Tier 1 command card in ready state.
- State/deferred/reference cards cannot visually compete with Tier 1 cards.
- `rail` and `detail` footprints exist and resolve for all responsive modes.
- Card headings label card containers through `aria-labelledby` where visible titles exist.
- Existing `data-pcc-*` markers are preserved unless intentionally replaced and tests updated.
- Route-level tests prove direct-child bento invariants.
- Hosted screenshot/evidence plan is completed or explicitly attached as a post-implementation gate.
- All required validation commands pass or documented substitutions are provided.
