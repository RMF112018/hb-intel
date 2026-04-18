# HB Homepage + PriorityActionsRail — Enhanced Audit-and-Prompt Package

## Package purpose

This package replaces the attached `hbHomepage_priorityActionsRail_audit_package` and `hbHomepage_priorityActionsRail_prompt_package` with a stronger, repo-truth-first package for a local code agent.

It is built around these proven conclusions:

1. `HbHomepage.tsx` is still only a pass-through today.
2. `mount.tsx` still dispatches hero, `PriorityActionsRail`, and `HbHomepage` as separate SPFx webparts.
3. `PriorityActionsRail` is not a shell occupant today.
4. `HbKudosZone` proves the repo already accepts the pattern “embed the React surface, not the SPFx webpart”.
5. The correct integration target is **wrapper-owned pre-shell composition**, not a shell-occupant migration.
6. The attached packages were directionally right on that recommendation, but materially under-specified the **cutover**, **contract reconciliation**, **diagnostics**, **tests**, and **closure proof** needed to finish the work safely.

## What changed versus the attached packages

This replacement package adds or strengthens the following:

- a repo-truth verification matrix against the 10 starting hypotheses
- an explicit correction register for what the attached packages got right, wrong, or left too shallow
- a stronger target-state architecture definition
- explicit handling of the **duplicate-action-layer risk** created by embedding the rail while a separate page-canvas rail still exists
- a dedicated prompt for **homepage page-canvas cutover / proof**
- a stronger wrapper-config recommendation that avoids corrupting shell semantics
- a stronger comment / doctrine / reference-composition reconciliation plan
- tighter closure criteria, including DOM proof, tests, visual proof, and page-canvas proof

## Core architecture decision

Treat this as a **homepage wrapper runtime correction**.

Do not migrate `PriorityActionsRail` into the shell occupant registry, shell presets, shell band semantics, or shell validation model.

Instead, make the flagship homepage runtime become:

1. standalone hero webpart
2. `HbHomepage` wrapper-owned priority-actions region
3. `HbHomepageShell`

The standalone `PriorityActionsRail` webpart must still remain independently mountable for non-homepage contexts unless repo proof forces a different product decision.

## Execution order

1. Read `00-Executive-Summary.md`
2. Read `01-Repo-Truth-Verification-Matrix.md`
3. Read `02-Attached-Package-Corrections-And-Gap-Register.md`
4. Read `03-Research-Uplift-And-Implementation-Constraints.md`
5. Read `04-Target-State-Architecture.md`
6. Read `05-Execution-Plan.md`
7. Execute Prompts 01–05 in order
8. Validate against `06-Closure-And-Validation-Checklist.md`

## Non-negotiable execution rules

- Do not re-read files already in current context or memory unless needed to resolve uncertainty or verify drift.
- Do not solve this by adding a `priority-actions-rail` shell occupant.
- Do not distort shell presets, shell band semantics, or occupant metadata to carry a command-band concern.
- Do not claim completion while the page-canvas still risks showing both:
  - wrapper-owned embedded rail, and
  - separate page-authored rail or OOB Quick Links.
- Do not stop at “it renders”.
- Closure requires:
  - wrapper ownership proof,
  - order proof,
  - contract/doc comment reconciliation,
  - and homepage page-canvas cutover proof.

## Package contents

- `00-Executive-Summary.md`
- `01-Repo-Truth-Verification-Matrix.md`
- `02-Attached-Package-Corrections-And-Gap-Register.md`
- `03-Research-Uplift-And-Implementation-Constraints.md`
- `04-Target-State-Architecture.md`
- `05-Execution-Plan.md`
- `06-Closure-And-Validation-Checklist.md`
- `Prompt-01-Create-Wrapper-Owned-Homepage-Entry-Stack-Runtime.md`
- `Prompt-02-Add-Wrapper-Contract-And-Config-Extraction.md`
- `Prompt-03-Reconcile-Entry-Stack-Semantics-Docs-And-Reference-Composition.md`
- `Prompt-04-Prove-And-Complete-Homepage-Page-Canvas-Cutover.md`
- `Prompt-05-Add-Tests-Diagnostics-Visual-Proof-And-Hard-Closure.md`
