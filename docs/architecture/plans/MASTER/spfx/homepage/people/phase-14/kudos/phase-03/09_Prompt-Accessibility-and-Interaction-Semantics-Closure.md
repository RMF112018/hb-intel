# Prompt — Accessibility and Interaction Semantics Closure

## Objective
Close the accessibility, keyboard, focus, and interaction-semantics gaps in the HB Kudos surfaces so the implementation can credibly approach a strict production-ready standard.

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
- `apps/hb-webparts/src/webparts/hbKudosCompanion/HbKudosCompanion.tsx`
- `apps/hb-webparts/src/webparts/hbKudos/HbKudos.tsx`
- `apps/hb-webparts/src/homepage/shared/KudosDetailPanelContent.tsx`
- `apps/hb-webparts/src/homepage/shared/KudosGovernancePrimitives.tsx`
- any relevant shared flyout/dialog primitives consumed from `@hbc/ui-kit/homepage` if changes are needed

## Non-negotiable requirements
- Do not use fake tab semantics. Either implement proper tabs with tabpanel relationships or convert the control model to filter buttons / segmented control.
- Restore visible focus on all custom controls.
- Remove `outline: none` unless a compliant replacement focus treatment is implemented.
- Validate dialog/flyout focus entry, containment, and return behavior where composition requires it.
- Keep the resulting semantics consistent with actual behavior.

## Guardrails
- Repo truth first.
- Do not accept comments, manifest descriptions, or stale reports as proof by themselves.
- Do not leave “writer support exists” as a substitute for a runtime-complete workflow.
- Do not preserve weak bespoke local UI where shared homepage-safe promotion is warranted.
- Do not claim closure unless code, runtime behavior, tests, and documentation align.

## Required outputs
- semantic/control fixes
- focus treatment improvements
- tests where feasible and documented manual verification where browser behavior must be observed

## Verification
- demonstrate keyboard interaction paths for queue controls, archive controls, and flyout entry/exit
- identify the exact controls whose semantics changed
- run accessibility-oriented verification for touched scope
