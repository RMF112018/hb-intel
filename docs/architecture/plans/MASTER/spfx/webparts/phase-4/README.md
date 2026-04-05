# HB Webparts — Cumulative Full-Package Rollout Prompt Package

## Objective

Transition `hb-webparts` from the current single-active-proof-case rollout model to a cumulative full-package model that retains previously validated webparts and restores the remaining webparts into the same `.sppkg`, while preserving the first-class loader-contract behavior established by the first two proof cases:

- `HbHeroBannerWebPart`
- `PriorityActionsRailWebPart`

The package produced by these prompts should move the build away from "swap the active proof case" and toward "package all webparts through the now-proven first-class pattern."

## Required posture

The code agent must not treat the current single-target proof-case filter as the intended end state.

The end state for this package is:

- one `hb-webparts.sppkg`
- all intended homepage webparts included in the package
- previously validated webparts retained
- no regression to the original broken loader behavior
- no silent fallback to the old neutral-manifest / post-bundle shim model unless explicitly proven necessary and re-validated

## Prompt order

1. `Prompt-01-Design-Cumulative-Full-Package-Architecture.md`
2. `Prompt-02-Implement-Cumulative-All-Webparts-Package.md`
3. `Prompt-03-Build-Inspect-and-Tenant-Validate-Full-Package.md`
4. `Prompt-04-Cleanup-Handoff-and-Next-Phase.md`

## Current context

The first two proof cases captured the successful build parameters and first-class loader pattern. Those proof cases are now reference implementations, not disposable one-off experiments.

The cumulative package must use those learnings to address **all webparts in the package**.

## Webparts expected in the package

- `PersonalizedWelcomeHeaderWebPart` — `46bfde64-f0cb-4f62-9f6b-a466f8fadc1f`
- `HbHeroBannerWebPart` — `39762a4d-c7fd-44a6-a11e-4f8de9f5778d`
- `PriorityActionsRailWebPart` — `b3f07190-79cf-437d-a1d6-ecbf3f77e616`
- `ToolLauncherWorkHubWebPart` — `cb7060f5-b852-4600-b912-a5f6f7221ce2`
- `CompanyPulseWebPart` — `0b53f651-fd92-4f7f-a9da-f7797017f5eb`
- `LeadershipMessageWebPart` — `e8fa8a84-a48a-41d2-85a6-b7c7df70aeca`
- `PeopleCultureWebPart` — `27ac10f4-4054-4dd2-bd53-3b4ef4379ab4`
- `ProjectPortfolioSpotlightWebPart` — `8370ab0c-b6df-4db0-82f1-24b54750f508`
- `SafetyFieldExcellenceWebPart` — `89ca5ff3-21f4-4b23-a953-4b7306ea1029`
- `SmartSearchWayfindingWebPart` — `11d72b36-a92f-4e2d-9918-75df2cb0d11e`

## Hard guardrails

- Do not re-read files that are already in your active context unless needed for verification.
- Do not revert to the original broken loader contract.
- Do not silently reintroduce neutral-manifest-first packaging as the default end state.
- Do not declare success from local build alone.
- Do not change webpart IDs, aliases, or source manifests unless required and justified.
- Prefer cumulative retention over target replacement.
- Prefer evidence over assumptions.

## Deliverables

- completion notes for each prompt
- updated package build
- package inspection evidence
- tenant validation checklist
- updated rollout/handoff documentation for the post-cumulative phase
