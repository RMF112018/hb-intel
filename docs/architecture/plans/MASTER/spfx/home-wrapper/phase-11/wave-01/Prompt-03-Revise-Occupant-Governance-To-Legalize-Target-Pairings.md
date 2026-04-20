# Prompt 03 — Revise Occupant Governance To Legalize Target Pairings

## Objective
Revise occupant registry, legality rules, and protected decisions so the requested three rows are legal and protected rather than blocked by the current band-semantic and slot-role rules.

## Governing authority
- `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Governing-Standard.md`
- `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Homepage-Overlay.md`

## Inspect these seams first
- `apps/hb-webparts/src/webparts/hbHomepage/shell/occupantRegistry.ts`
- `apps/hb-webparts/src/webparts/hbHomepage/shell/shellTypes.ts`
- `apps/hb-webparts/src/webparts/hbHomepage/shell/shellValidation.ts`
- `apps/hb-webparts/src/webparts/hbHomepage/shell/protectedDecisions.ts`
- `apps/hb-webparts/src/webparts/hbHomepage/shell/defaultPreset.ts`

## Current gap to close
Today the requested rows are not all legal because:
- hbKudos is recognition-only
- Safety is operational-spotlight-only
- People Culture Public is primary-only and people-culture-only
- protected semantics still reinforce the old band model

## Required implementation outcome
Make the requested pairings first-class and legal in code.
That includes whatever updates are necessary to:
- allowed band semantics,
- allowed slot roles,
- protected band semantics,
- validation logic,
- preset legality.

## Rules
- Do not weaken governance into freeform composition.
- Do not make the shell a page builder.
- Keep the approved six-surface curation locked.
- Do not re-read files already in active context unless needed to confirm drift, dependencies, or uncertainty after changes.

## Proof of closure
Provide:
1. the exact registry changes,
2. the exact legality/protected-decision changes,
3. explanation of why each requested row is now legal,
4. validation/test output showing the preset no longer normalizes away or rejects the target arrangement.
