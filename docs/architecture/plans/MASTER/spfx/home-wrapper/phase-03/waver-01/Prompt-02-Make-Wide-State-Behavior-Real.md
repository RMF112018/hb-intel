# Prompt 02 — Make the shell’s wide-state behavior real

## Objective
Correct the mismatch between the shell’s breakpoint policy and its physical CSS/layout ceiling so the shell can actually realize its defined ultrawide and premium wide states.

## Governing authority
- `docs/reference/shell/HB-Shell-Entry-Breakpoint-Spec.md`
- `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Governing-Standard.md`
- `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Homepage-Overlay.md`

## Inspect these files first
- `apps/hb-webparts/src/webparts/hbHomepage/HbHomepageShell.module.css`
- `apps/hb-webparts/src/webparts/hbHomepage/shell/breakpointPolicy.ts`
- `apps/hb-webparts/src/webparts/hbHomepage/HbHomepageShell.tsx`
- any shell/shared surface width constraints that materially cap layout expression

Do not re-read files that are still in active context unless you need to confirm drift, dependencies, or uncertainty after changes.

## Current gap
The shell defines an ultrawide state beginning at `1600px`, but the shell CSS currently caps the shell below that. The shell cannot claim premium wide-state behavior while preventing itself from entering that state.

## Required implementation outcome
- make the declared wide states physically reachable
- preserve readable scan width and composed negative space
- avoid turning the page into an over-stretched centered rail
- keep pairing logic and slot fit safe at wider widths

## Closure proof required
Provide:
- before/after explanation of the width mismatch
- resulting shell width strategy
- note on how ultrawide state is now reachable
- any screenshots or test evidence available in the repo workflow

## Prohibited
- no unrelated module redesign
- no arbitrary freeform resize system
