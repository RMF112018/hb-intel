# Prompt — Shared-Surface Promotion and Boundary Discipline

## Objective
Audit and fix the remaining shared-surface boundary drift so repeated HB Kudos governance and support patterns are promoted appropriately into shared homepage-safe seams while genuinely domain-specific behavior remains local.

## Repo truth
Work directly against the live repo:
- `https://github.com/RMF112018/hb-intel`

Do not re-read files that are already in your current context or memory.

## Governing authority
Use repo truth and at minimum:
- `docs/architecture/plans/MASTER/spfx/homepage/people/phase-14/kudos/Decision-Lock-Appendix.md`
- current live `@hbc/ui-kit`
- current live `docs/reference/ui-kit/`


## Scope
- `apps/hb-webparts/src/webparts/hbKudos/HbKudos.tsx`
- `apps/hb-webparts/src/webparts/hbKudosCompanion/HbKudosCompanion.tsx`
- `apps/hb-webparts/src/homepage/shared/KudosGovernancePrimitives.tsx`
- `apps/hb-webparts/src/homepage/shared/KudosDetailPanelContent.tsx`
- `packages/ui-kit/src/homepage.ts`
- relevant doctrine files under `docs/reference/ui-kit/`

## Non-negotiable requirements
- Identify what should remain local vs what should move into shared homepage-safe primitives.
- Promote repeated visual/interaction patterns that are currently duplicated or bespoke.
- Do not move domain-specific SharePoint workflow logic into shared UI packages.
- Reduce doctrine-breaking local premium styling.

## Guardrails
- Repo truth first.
- Do not accept comments, manifest descriptions, or stale reports as proof by themselves.
- Do not leave “writer support exists” as a substitute for a runtime-complete workflow.
- Do not preserve weak bespoke local UI where shared homepage-safe promotion is warranted.
- Do not claim closure unless code, runtime behavior, tests, and documentation align.

## Required outputs
- shared/local boundary analysis
- code changes promoting repeated patterns where warranted
- short rationale for each promoted or retained pattern

## Verification
- list each pattern retained local vs promoted shared
- show how the final structure better matches doctrine and package-boundary discipline
- run relevant tests/build checks
