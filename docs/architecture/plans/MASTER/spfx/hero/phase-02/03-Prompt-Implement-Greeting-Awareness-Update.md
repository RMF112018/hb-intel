# 03 — Prompt: Implement Greeting Awareness Update

Implement the greeting-awareness update first as an isolated closure unit.

## Mandatory operating instruction

**Do not re-read files that are already in your active context unless needed to confirm drift, dependencies, or uncertainty after changes.**

## Strict governing authority

Maintain strict compliance with:

1. `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Governing-Standard.md`
2. `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Homepage-Overlay.md`

This prompt must not introduce any workaround or duplication that weakens doctrine compliance.

## Objective

Update the shared greeting logic so all relevant consumers use the requested system-time windows:

- `03:00:00` through `11:59:59` → `Good morning, {user name}`
- `12:00:00` through `17:00:59` → `Good afternoon, {user name}`
- `17:01:00` through `02:59:59` → `Good evening, {user name}`

## Required scope

At minimum inspect and update as needed:

- `apps/hb-webparts/src/homepage/helpers/greeting.ts`
- `apps/hb-webparts/src/homepage/helpers/welcomeMessage.ts`
- `apps/hb-webparts/src/webparts/hbSignatureHero/HbSignatureHero.tsx`
- any tests or stories that exercise greeting behavior
- any other direct consumers of `resolveGreetingAt` / `resolveGreetingForHour`

## Implementation requirements

1. Keep the greeting logic explicit and readable.
2. Use deterministic boundary handling.
3. Add tests that prove:
   - `02:59` = evening
   - `03:00` = morning
   - `11:59` = morning
   - `12:00` = afternoon
   - `17:00` = afternoon
   - `17:01` = evening
   - `00:00` = evening
4. Do not spread duplicate greeting logic into view components.
5. Keep the naming/domain language consistent with current helper conventions.
6. Preserve strict doctrine compliance while updating consumers.

## Validation requirements

Prove:
- helper logic passes tests
- consumers still render correctly
- no stale assumptions remain in comments/docs/tests

## Required deliverable format

Return a concise closure report with:

1. Objective
2. Doctrine-Compliance Check
3. Files Changed
4. Logic Update Summary
5. Validation Performed
6. Boundary Test Results
7. Residual Risks
