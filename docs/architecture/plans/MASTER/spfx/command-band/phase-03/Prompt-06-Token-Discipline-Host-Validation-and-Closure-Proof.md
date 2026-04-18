# Prompt 06 — Token Discipline, Host Validation, and Closure Proof

## Objective

Finish the wave honestly.

This prompt removes remaining token-discipline and visual-system drift, performs hosted validation, and refreshes closure artifacts so the repo no longer claims completion without matching evidence.

---

## First instruction

**Do not re-read files that are still within your current context window or memory.** Re-read only when needed to verify drift, resolve uncertainty, or inspect files not already in active context.

---

## Repo seams to inspect

Primary seams:
- `packages/ui-kit/src/HbcPriorityRail/priority-rail.module.css`
- `apps/hb-webparts/src/webparts/priorityActionsRailAdmin/priority-actions-rail-admin.module.css`
- any rebuilt `HbcPriorityRail` shared-family files
- any updated public/admin consumer files
- `docs/architecture/plans/MASTER/spfx/command-band/phase-02/Closure-Checklist.md`
- `docs/architecture/plans/MASTER/spfx/command-band/phase-02/Closure-Scorecard.md`

Inspect as needed:
- shared token or theme alias files
- any visual-proof scripts already present in the repo
- packaging / hosted validation scripts relevant to this webpart lane

---

## Governing references

- `docs/architecture/plans/MASTER/spfx/command-band/phase-02/Closure-Checklist.md`
- `docs/architecture/plans/MASTER/spfx/command-band/phase-02/Closure-Scorecard.md`
- `docs/architecture/plans/MASTER/spfx/homepage/phase-15/HB-Central-Homepage-Perception-Targets.md`

---

## Current repo-truth problem

Even after the structural fixes, the wave is not honestly closed if any of the following remain true:
- hardcoded colors and one-off styling still dominate the command-band family
- the surface still visually reads like a safety-zone tinted card/list strip
- preview controls still carry inline styling or ad hoc token bypasses
- hosted screenshots are still missing
- runtime console validation is still missing
- closure docs still claim pass status without matching post-fix evidence

---

## Required end state

The wave should end with:
- stronger token discipline
- cleaner shared visual grammar
- hosted SharePoint validation evidence
- refreshed closure docs that match actual reality
- no false completion language

---

## Required tasks

### 1. Remove remaining token/style drift
Audit the public/admin command-band files for:
- hardcoded colors
- hardcoded border/background treatments
- one-off inline styles
- visually generic card/list treatments that conflict with the intended command-surface posture

Replace them with governed token/alias usage or shared styling patterns that match repo doctrine.

### 2. Run the real code-quality checks
Execute and capture the relevant proofs for the touched workstream, such as:
- TypeScript checks
- relevant tests
- packaging/build checks for the hb-webparts lane if touched
- any targeted visual-proof generation already available in repo tooling

Do not claim pass without running the checks you cite.

### 3. Perform hosted validation
Validate in real SharePoint runtime conditions.

Capture evidence for at minimum:
- public rail desktop state
- public rail tablet/compact state
- public rail phone or narrow-width behavior
- overflow interaction behavior
- admin editable state
- admin read-only / insufficient-permission state if available
- add/edit/reorder/archive flow
- save/discard truth
- no blocking console/runtime errors during the validated flows

### 4. Refresh closure artifacts honestly
Update the closure checklist and scorecard so they reflect:
- the actual post-fix state
- the actual hosted evidence
- the actual remaining gaps, if any

Do not leave stale “pending hosted proof” language if hosted proof is now captured.
Do not leave pass claims that no longer match reality.

### 5. Produce a concise final evidence note
Create or update a final note summarizing:
- what was fixed
- what was validated
- what files/documentation were updated
- whether the wave is truly closed now

---

## Hard constraints

- do not fabricate hosted proof
- do not mark closure passed if evidence is incomplete
- do not broaden into unrelated homepage closure work
- do not use “future work” placeholders for in-scope proof gaps that should be closed in this wave

---

## Proof of closure

Return evidence showing:

1. the token/style cleanup performed
2. the exact checks run and their results
3. hosted screenshots or equivalent hosted proof references
4. runtime console verification outcome
5. refreshed closure checklist and scorecard language
6. final closure status with explicit honesty about anything still open
7. exact files changed
