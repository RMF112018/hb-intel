# PriorityActionsRail — Next Code-Agent Package

## Objective

Migrate `PriorityActionsRailWebPart` to the same first-class SPFx loader-contract model already proven for `HbHeroBannerWebPart`, while preserving the current sequential single-webpart rollout strategy.

This package assumes:

- `HbHeroBannerWebPart` is the validated proof case
- the rollout model remains **one webpart at a time**
- the next target is `PriorityActionsRailWebPart`
- the target manifest ID is `b3f07190-79cf-437d-a1d6-ecbf3f77e616`

## Files in this package

1. `Phase-Summary-PriorityActionsRail-Proof-Case.md`
2. `Prompt-01-Generalize-Proof-Case-Entry-Selection.md`
3. `Prompt-02-Migrate-PriorityActionsRail-Proof-Case.md`
4. `Prompt-03-Build-Inspect-and-Tenant-Validate-PriorityActionsRail.md`
5. `Prompt-04-Capture-Completion-and-Refresh-Rollout-Handoff.md`

## Execution order

Run the prompts in sequence.

- Prompt 01
- Prompt 02
- Prompt 03
- Prompt 04

Do not skip directly to tenant validation. The point of this package is to keep the rollout deterministic and evidence-based.

## Hard gates

- Stay on **Path A**: sequential single-webpart proof cases only.
- Do not batch multiple webparts into the allowlist.
- Do not reintroduce the neutral shell manifest or AMD shim path.
- Do not modify `ShellWebPart.ts` unless an actual blocker is proven.
- Do not re-read files that are already in active context unless needed for verification.
- Do not broaden into homepage-composition work, UI redesign, or multi-webpart packaging.

## Acceptance standard for this package

`PriorityActionsRailWebPart` is considered successful only if:

- the package uploads successfully to the App Catalog
- the webpart renders in the tenant
- `loaderConfig.entryModuleId` is native and identity-correct for `b3f07190-79cf-437d-a1d6-ecbf3f77e616`
- no shim files are emitted or requested
- no neutral shell manifest is emitted
- the earlier `require()`-style loader failure is absent for the target webpart

## Expected next target after this package

If this package succeeds, the recommended next target is `LeadershipMessageWebPart`.
