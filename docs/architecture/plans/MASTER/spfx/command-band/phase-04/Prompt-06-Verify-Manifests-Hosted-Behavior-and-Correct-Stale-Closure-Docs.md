# Prompt 06 — Verify Manifests, Hosted Behavior, and Correct Stale Closure Docs

## Objective

Complete the final host/runtime validation phase for the command band and correct any stale phase-02 closure docs so the repo stops overstating completion.

## Current issue / future-state gap

Hosted proof is still mandatory, but the live repo also contains phase-02 closure materials that read as though the command-band work is already effectively closed at code level.

That is no longer safe enough because repo truth still showed unresolved structural and behavioral gaps during this audit.

Manifest/runtime drift also still needs explicit verification, including any settings or proof-case behavior that were previously accepted without current hosted confirmation.

## Intended future state

The command-band package closes honestly:
- manifests and runtime seams are verified against actual host intent
- hosted proof exists for the required public and admin states
- stale closure checklists / scorecards / summary docs are corrected
- the repo’s final command-band documentation reflects the actual state of the code and hosted validation evidence

## Repo seams / files / symbols to inspect

Inspect at minimum:

- `apps/hb-webparts/src/webparts/priorityActionsRail/PriorityActionsRailWebPart.manifest.json`
- `apps/hb-webparts/src/webparts/priorityActionsRailAdmin/PriorityActionsRailAdminWebPart.manifest.json`
- `apps/hb-webparts/src/mount-priority-actions-rail-proof-case.tsx`
- any mount/entry/package seams that govern these webparts
- `docs/architecture/plans/MASTER/spfx/command-band/phase-02/Closure-Checklist.md`
- any adjacent scorecard / README / summary docs in the same phase package
- any generated hosted-proof or validation notes you add

Do not re-read files already in active context unless needed to confirm drift, dependencies, or uncertainty after changes.

## Governing files / doctrine / specs

- `docs/architecture/plans/MASTER/spfx/command-band/PriorityActionsRail-and-Admin-Spec.md`
- `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Governing-Standard.md`
- `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Homepage-Overlay.md`
- `docs/architecture/plans/MASTER/spfx/benchmark/04-Conformance-Scoring-Matrix.md`
- `docs/architecture/plans/MASTER/spfx/benchmark/06-Closure-Checklist.md`

## Required implementation outcomes

1. Verify manifest/runtime posture for both webparts and correct any drift that is no longer justified.

2. Verify proof-case/runtime seams so they still align with the intended validation path.

3. Execute or prepare truthful hosted validation for:
   - public rail desktop/laptop/tablet/phone-like widths
   - overflow behavior
   - keyboard/focus behavior
   - empty/error/partial states
   - admin add/edit/reorder/archive/save/discard flows
   - permission-state behavior

4. Update stale closure docs so they no longer claim pass status or benchmark-grade completion unless the current code and proof now support it.

5. Produce a truthful final closure summary:
   - what is now closed
   - what proof exists
   - what remains open, if anything

## Supporting development concepts to apply materially

- hosted validation over local confidence
- documentation integrity as part of engineering closure
- benchmark scorecards as enforcement, not theater
- explicit runtime proof artifacts

## Proof of closure

Return:

- manifest/runtime verification notes
- any manifest/runtime changes made
- the hosted-proof artifact list or capture instructions used
- the docs updated or corrected
- the final pass/fail judgment with explicit honesty about anything still open

## Boundaries / anti-drift rules

- Do not keep stale “PASS” wording in docs if the proof is not there.
- Do not fabricate hosted validation that did not occur.
- Do not treat screenshots alone as sufficient if runtime/manifest drift remains unverified.
- Do not reopen unrelated packaging work outside the two command-band webparts unless directly required for truthful validation.
