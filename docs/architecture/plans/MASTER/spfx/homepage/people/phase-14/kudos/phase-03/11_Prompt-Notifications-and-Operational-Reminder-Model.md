# Prompt — Notifications and Operational Reminder Model

## Objective
Bring the implemented notification/reminder behavior into honest operational alignment with the Decision Lock and current runtime reality, closing overclaims and strengthening the reminder model where feasible.

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
- `apps/hb-webparts/src/homepage/helpers/kudosNotificationBuilder.ts`
- `apps/hb-webparts/src/homepage/data/kudosNotificationDispatch.ts`
- `apps/hb-webparts/src/webparts/hbKudosCompanion/HbKudosCompanion.tsx`
- `apps/hb-webparts/src/webparts/hbKudosCompanion/HbKudosCompanionWebPart.manifest.json`
- any config surfaces needed for thresholds/cadence if implemented via property pane

## Non-negotiable requirements
- Do not claim real delivery if the implementation still only queues/logs intents.
- Align runtime, manifests, and docs with what is actually implemented.
- Where feasible, strengthen the operational reminder model for thresholds/cadence without inventing unsupported delivery infrastructure.
- Keep clear separation between notification intent generation and actual channel delivery.

## Guardrails
- Repo truth first.
- Do not accept comments, manifest descriptions, or stale reports as proof by themselves.
- Do not leave “writer support exists” as a substitute for a runtime-complete workflow.
- Do not preserve weak bespoke local UI where shared homepage-safe promotion is warranted.
- Do not claim closure unless code, runtime behavior, tests, and documentation align.

## Required outputs
- code/doc/manifest corrections to eliminate overclaim
- any strengthened threshold/cadence handling that is actually implemented
- tests for reminder-target and notification-intent behavior

## Verification
- show exact before/after truth for notification and reminder capabilities
- prove runtime and manifest language are now aligned
- run relevant tests
