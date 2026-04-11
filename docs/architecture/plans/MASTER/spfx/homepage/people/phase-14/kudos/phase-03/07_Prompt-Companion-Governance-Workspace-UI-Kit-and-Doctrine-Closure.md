# Prompt — Companion Governance Workspace UI-Kit and Doctrine Closure

## Objective
Refactor HB Kudos Companion so it reads and behaves like a premium governance workspace and aligns with the current homepage entry-point, token, shared-surface, and anti-generic doctrine.

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
- `apps/hb-webparts/src/homepage/shared/KudosGovernancePrimitives.tsx`
- `apps/hb-webparts/src/homepage/shared/KudosDetailPanelContent.tsx`
- `packages/ui-kit/src/homepage.ts`
- relevant current doctrine files under `docs/reference/ui-kit/`

## Non-negotiable requirements
- Remove hardcoded inline premium styling where governed tokenized/shared composition should exist.
- Do not leave browser `prompt` / `confirm` UX as the moderation interaction model.
- Promote repeated governance patterns into shared homepage-safe seams where appropriate.
- Make the companion read as a premium governance workspace, not a plain queue with cosmetic styling.
- Preserve SharePoint host-aware composition.

## Guardrails
- Repo truth first.
- Do not accept comments, manifest descriptions, or stale reports as proof by themselves.
- Do not leave “writer support exists” as a substitute for a runtime-complete workflow.
- Do not preserve weak bespoke local UI where shared homepage-safe promotion is warranted.
- Do not claim closure unless code, runtime behavior, tests, and documentation align.

## Required outputs
- refactored companion UI
- new or improved shared homepage-safe governance primitives where warranted
- updated doctrine-aligned comments/docs where needed

## Verification
- identify which patterns were promoted vs intentionally kept local
- show that hardcoded local styling was materially reduced
- run relevant tests and capture before/after closure notes
