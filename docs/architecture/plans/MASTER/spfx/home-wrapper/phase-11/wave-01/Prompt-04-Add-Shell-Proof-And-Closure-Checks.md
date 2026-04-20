# Prompt 04 — Add Shell Proof And Closure Checks

## Objective
Add inspectable proof that the shell is rendering the locked three-row arrangement correctly, instead of relying on subjective visual review alone.

## Governing authority
- `docs/reference/spfx-surfaces/benchmark/01-Homepage-Webpart-Conformance-Standard.md`
- `docs/reference/spfx-surfaces/benchmark/03-Homepage-Webpart-Delivery-Workflow-and-Gates.md`
- `docs/reference/spfx-surfaces/benchmark/06-Closure-Checklist.md`

## Inspect these seams first
- `apps/hb-webparts/src/webparts/hbHomepage/shell/shellConformance.ts`
- `apps/hb-webparts/src/webparts/hbHomepage/HbHomepageShell.tsx`
- shell tests under `apps/hb-webparts/src/webparts/hbHomepage/**/__tests__`
- any existing harness or conformance preview seams already used by the shell

## Current gap to close
The shell has conformance plumbing, but it does not yet prove the specific locked arrangement you now need to enforce.

## Required implementation outcome
Add proof that verifies:
- exact row order,
- exact occupant membership,
- handedness alternation,
- large/small ratio behavior,
- no extra live post-launcher surfaces,
- clean handheld fallback.

## Rules
- Prefer inspectable deterministic assertions over screenshot-only claims.
- Keep proof scoped to the homepage shell objective.
- Do not re-read files already in active context unless needed to confirm drift, dependencies, or uncertainty after changes.

## Proof of closure
Return:
1. test/harness additions,
2. what each assertion proves,
3. any remaining gaps requiring Wave 02 child-surface work.
