# Prompt 05 — Homepage surface-family and composition alignment

## Objective

Correct the problem where HB Kudos technically imports from `@hbc/ui-kit/homepage` but still bypasses the spirit of the shared system.

Bring the public and companion HB Kudos surfaces into alignment with a disciplined local homepage surface-family model built on shared foundations.

## Files in scope

- `apps/hb-webparts/src/webparts/hbKudos/PublicKudosSurface.tsx`
- `apps/hb-webparts/src/webparts/hbKudos/ArchiveList.tsx`
- `apps/hb-webparts/src/webparts/hbKudos/KudosArticleReader.tsx`
- `apps/hb-webparts/src/webparts/hbKudosCompanion/HbKudosCompanion.tsx`
- `apps/hb-webparts/src/homepage/shared/KudosGovernancePrimitives.tsx`
- `apps/hb-webparts/src/homepage/shared/KudosDetailPanelContent.tsx`

## Required implementation direction

### 1. Treat Kudos as a real local homepage surface family
The local ownership of Kudos composition is acceptable.
The current ad hoc posture is not.

Formalize a coherent local surface-family model for recurring patterns such as:
- public masthead
- featured recognition card
- recent recognition rows
- archive zone
- article / feed flyout body composition
- governance action controls
- governance queue rows
- governance detail sections

### 2. Build from shared foundations, not around them
Continue using the correct homepage entry-point discipline.
But the resulting local system must clearly look and behave like it is built from shared foundations, not merely adjacent to them.

### 3. Strengthen family resemblance between public and companion surfaces
They should not be identical.
They should clearly belong to the same Kudos product family in:
- icon language
- token language
- variant language
- material language
- rhythm and hierarchy

### 4. Do not jump ahead into broader architecture wave work
This prompt is about surface-family and composition alignment, not the full structural decomposition of every runtime file.

## Constraints

- Preserve existing runtime behavior.
- Preserve SharePoint-hosted viability.
- Preserve public vs companion role differences.
- Do not promote local-only Kudos patterns into global ui-kit unless there is a clearly justified cross-surface reuse case.

## Guardrails

- Do not re-read files that are already in your current context or memory unless you need fresh verification or additional surrounding context.
- Do not collapse the surface back into generic card-grid UI.
- Do not leave the family alignment implicit; make it explicit in the source structure.

## Deliverable

Implement the surface-family alignment and report:
- what recurring Kudos surface patterns are now governed locally
- how public and companion now align as one product family
- what remains intentionally local rather than promoted to shared ui-kit
