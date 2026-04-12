# Prompt 04 — Dialog Semantics and Task-Shell Accessibility

## Active finding
The task-shell family introduces nested dialog semantics inside an existing modal dialog.

This is the **only active remediation topic** for this prompt. Do not work on any other audit finding in parallel.

## Repo and branch
- Repo: `https://github.com/RMF112018/hb-intel.git`
- Branch: `main`

## Governing authority
Primary binding doctrine:
1. `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Governing-Standard.md`
2. `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Homepage-Overlay.md`

Supporting authority:
- `docs/reference/ui-kit/homepage-webpart-benchmark.md`
- `apps/hb-webparts/.eslintrc.cjs`

## Mandatory working posture
- Treat this finding as unresolved until it is **fully closed**.
- Perform an **exhaustive scrub** of the complete repo-truth footprint associated with this finding.
- Do **not** apply superficial fixes.
- Do **not** stop when the most visible symptom improves.
- Do **not** re-read files that are still within your current context or memory.
- Preserve strong existing architecture unless this prompt explicitly directs structural replacement.
- Do not declare success until you can prove the defect is gone everywhere in the relevant footprint.

## Why this finding matters
The shared flyout shell already provides dialog semantics. Nesting another dialog inside it weakens accessibility and muddies an otherwise strong host-aware interaction shell.

## In-scope footprint to start from
- `packages/ui-kit/src/HbcKudosComposer/HbcKudosComposerFlyout.tsx`
- `apps/hb-webparts/src/homepage/shared/kudosShells.tsx`
- `apps/hb-webparts/src/homepage/shared/KudosGovernancePrimitives.tsx`
- all task-dialog consumers in the Kudos family
- relevant hosted keyboard/focus tests under `e2e/webparts/kudos/`

You must expand from these seed files to every directly and indirectly related file needed to fully close the finding.

## Required work
1. Remove nested dialog semantics from the inner task-shell family.
2. Ensure each shell still has correct labeling, focus behavior, and modal semantics.
3. Re-check focus restoration, ESC behavior, and keyboard traversal.
4. Expand or update hosted tests if needed so this regression cannot quietly return.

## Non-negotiables
- Do not weaken the shared flyout shell.
- Do not regress focus trapping, scroll lock, or host-chrome offset behavior.
- Do not patch only one shell call-site if the semantic defect exists across the family.

## Closure proof required before you stop
You must provide:
1. the full list of files touched
2. why each touched file was in scope
3. what stale / redundant / contradictory code was removed
4. what replaced it
5. what remains intentionally unchanged
6. why the original finding is now 100% closed in the audited footprint

## Deliverables
- code changes
- any necessary test/harness updates
- any necessary docs/comments updates
- a concise closure summary tied to the finding only
