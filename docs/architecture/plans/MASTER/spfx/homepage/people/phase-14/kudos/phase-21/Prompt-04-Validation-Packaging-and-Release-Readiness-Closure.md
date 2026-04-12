# Prompt 04 — Validation, packaging, and release-readiness closure

## Objective

Perform the final rigorous closure pass so Wave 4 ends with real evidence that HB Kudos is stable, properly packaged, and ready to persist as production-grade code.

## Files and seams in scope

Runtime and packaging:
- `apps/hb-webparts/src/mount.tsx`
- `apps/hb-webparts/src/webparts/hbKudos/HbKudosWebPart.manifest.json`
- `apps/hb-webparts/src/webparts/hbKudosCompanion/HbKudosCompanionWebPart.manifest.json`

Runtime/test/harness seams:
- `apps/dev-harness/src/tabs/KudosTab.tsx`
- `apps/dev-harness/src/harness/kudosHarness.ts`
- existing lint / typecheck / Playwright / runtime test paths relevant to HB Kudos in the repo

Relevant product files:
- the real public and companion Kudos implementation footprint

## Required validation work

### 1. Doctrine and regression validation
Confirm:
- Wave 1, 2, and 3 gains remain intact
- no doctrine regressions were introduced
- no structural regressions were introduced
- no cohesion/accessibility regressions were introduced

### 2. Runtime/package integrity validation
Confirm:
- `mount.tsx` still maps the correct webpart IDs
- manifest adjacency remains correct
- packaged/runtime assumptions remain intact
- no manifest or registration drift has been introduced

### 3. Quality validation
Run and/or verify:
- lint
- typecheck
- relevant local tests
- relevant harness/runtime checks
- relevant Playwright or equivalent checks already available in the repo

### 4. Closure standard
Do not stop at “it compiles.”
Prove:
- stability
- correctness of runtime linkage
- preservation of SharePoint-hosted behavior
- reference-quality readiness

## Constraints

- Do not invent entirely new test infrastructure unless a tiny supporting addition is truly necessary.
- Use the repo’s existing validation pathways wherever possible.
- Do not reopen broad implementation work unless validation reveals a specific closure blocker.

## Guardrails

- Do not re-read files that are already in your current context or memory unless you need fresh verification or additional surrounding context.
- Do not claim closure without real checks.
- Do not destabilize packaging/runtime seams while validating them.

## Deliverable

Produce a final closure report with:
- files changed in Wave 4
- validation steps run
- doctrine checks passed
- runtime/package checks passed
- any remaining known limitations
- explicit statement on whether HB Kudos is now acceptable as production-grade, long-lived, reference-quality homepage code
