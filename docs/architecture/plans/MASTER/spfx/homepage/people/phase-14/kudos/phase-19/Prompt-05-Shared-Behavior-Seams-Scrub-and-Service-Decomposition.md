# Prompt 05 — Shared behavior seams scrub and service decomposition

## Objective

Scrub and harden the shared HB Kudos behavior seams so they are quieter, more maintainable, and better separated without changing the working workflow model.

## Files in scope

- `apps/hb-webparts/src/homepage/data/usePeopleCultureData.ts`
- `apps/hb-webparts/src/homepage/data/useSharePointPeopleSearch.ts`
- `apps/hb-webparts/src/homepage/data/useKudosComposer.ts`
- `apps/hb-webparts/src/homepage/data/peopleCultureSubmissionSource.ts`
- `apps/hb-webparts/src/homepage/data/kudosGovernanceWriter.ts`
- `apps/hb-webparts/src/homepage/webparts/kudosContracts.ts`

You may add narrowly scoped helper files if they genuinely clarify responsibility boundaries.

## Problems to correct

### 1. Production debug logging in people search
Remove or properly gate the noisy production diagnostics in `useSharePointPeopleSearch.ts`.

### 2. Uneven hook discipline
Improve dependency and effect hygiene where the current hook posture signals risk, confusion, or suppressions that can be resolved cleanly.

### 3. Shared modules doing too much
Reduce responsibility overload where it materially improves readability and maintainability, especially in larger shared seams such as governance writing.

## Required implementation direction

### 1. Remove production debug noise
Do not leave noisy `console.warn`-style operational traces in active production paths.
Use a quieter, intentional posture.

### 2. Tighten hook discipline
Resolve dependency and effect hygiene issues where possible without destabilizing the runtime.

### 3. Improve responsibility boundaries
Where a shared file is too broad, separate logical concerns into narrower helpers only when that improves clarity and does not create pointless indirection.

### 4. Preserve working behavior
Do not regress:
- SharePoint digest handling
- ensureUser resolution
- typed-recipient submission semantics
- governance patch planning
- audit-event writes
- notification intent dispatch
- cache invalidation
- harness expectations unless a small compatible update is necessary

## Constraints

- Do not rewrite the backend/data model.
- Do not change list schema assumptions.
- Do not casually alter public APIs consumed elsewhere unless you update all real callsites safely.
- Do not overengineer a service layer for the sake of aesthetics.

## Guardrails

- Do not re-read files that are already in your current context or memory unless you need fresh verification or additional surrounding context.
- Do not remove useful diagnostics unless replaced with a clearly intentional pattern.
- Do not break the dev harness or the SharePoint runtime contracts.

## Deliverable

Implement the cleanup and report:
- what production debug noise was removed
- what hook-discipline improvements were made
- what shared files were decomposed or clarified
- what was intentionally preserved and why
