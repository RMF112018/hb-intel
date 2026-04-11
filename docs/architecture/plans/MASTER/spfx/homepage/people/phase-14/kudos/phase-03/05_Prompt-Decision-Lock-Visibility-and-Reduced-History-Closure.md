# Prompt — Decision Lock Visibility and Reduced-History Closure

## Objective
Close the visibility and detail-panel safety gaps so public viewers, associated parties, reviewers, and admins each see only the correct level of recognition and workflow history required by the Decision Lock Appendix.

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
- `apps/hb-webparts/src/homepage/webparts/kudosContracts.ts`
- `apps/hb-webparts/src/homepage/shared/KudosDetailPanelContent.tsx`
- `apps/hb-webparts/src/homepage/shared/KudosGovernancePrimitives.tsx`
- `apps/hb-webparts/src/webparts/hbKudos/HbKudos.tsx`
- `apps/hb-webparts/src/webparts/hbKudosCompanion/HbKudosCompanion.tsx`
- `apps/hb-webparts/src/homepage/data/kudosGovernanceWriter.ts`

## Non-negotiable requirements
- Submitters and recipients may see associated items they are allowed to access, but non-governance viewers must not receive deeper workflow history.
- Associated no-longer-public items must render a reduced history-safe view.
- Internal governance notes must remain reviewer/admin-only.
- Do not leak workflow progression through a viewer-facing timeline block.
- Keep reviewer/admin detail fidelity intact.

## Guardrails
- Repo truth first.
- Do not accept comments, manifest descriptions, or stale reports as proof by themselves.
- Do not leave “writer support exists” as a substitute for a runtime-complete workflow.
- Do not preserve weak bespoke local UI where shared homepage-safe promotion is warranted.
- Do not claim closure unless code, runtime behavior, tests, and documentation align.

## Required outputs
- detail-panel rendering changes
- any predicate/model changes needed to support role-safe history rendering
- tests for viewer vs reviewer/admin detail visibility

## Verification
- prove non-governance viewers no longer see deeper workflow history
- prove associated-viewer access still works for recognition-safe content
- prove reviewer/admin governance sections and internal notes remain available where appropriate
