# Prompt — Employee HB Kudos UI-Kit and Doctrine Closure

## Objective
Refine the employee-facing HB Kudos surface, archive, and detail-supporting composition so the experience is premium, host-aware, and doctrine-compliant rather than a partially assembled public surface.

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
- `apps/hb-webparts/src/homepage/shared/KudosDetailPanelContent.tsx`
- `apps/hb-webparts/src/homepage/shared/KudosGovernancePrimitives.tsx`
- `packages/ui-kit/src/homepage.ts`
- relevant current doctrine files under `docs/reference/ui-kit/`

## Non-negotiable requirements
- Fix broken or misleading public-surface affordances such as in-page anchors if they do not map to real DOM targets.
- Bring archive/history composition to the same premium standard as the top recognition lane.
- Reduce hardcoded local styling and move repeated patterns into governed/shared seams where justified.
- Keep the surface premium but host-aware for SharePoint homepage use.

## Guardrails
- Repo truth first.
- Do not accept comments, manifest descriptions, or stale reports as proof by themselves.
- Do not leave “writer support exists” as a substitute for a runtime-complete workflow.
- Do not preserve weak bespoke local UI where shared homepage-safe promotion is warranted.
- Do not claim closure unless code, runtime behavior, tests, and documentation align.

## Required outputs
- refined employee-facing HB Kudos UI
- any shared primitive promotion justified by repeated patterns
- tests or snapshot updates as appropriate

## Verification
- prove archive/detail affordances are coherent and functional
- show that employee supporting surfaces no longer undercut the premium recognition experience
- run touched-scope verification
