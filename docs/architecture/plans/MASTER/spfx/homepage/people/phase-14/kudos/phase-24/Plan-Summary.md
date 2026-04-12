# HB Kudos Companion — P0 Closure Prompt Package

## Package objective

This package instructs the local code agent to resolve **all P0 issues** identified in the doctrine-aligned audit of the **HB Kudos Companion** runtime.

These prompts are intentionally limited to the current P0 wave:

1. Separate **load-failure**, **true empty**, and **filtered-empty** states
2. Add explicit **degraded**, **misconfigured**, and **partial-state** rendering paths
3. Harden **authoring-safe** and **SharePoint-host-safe** runtime behavior
4. Reduce prohibited **ordinary-source inline visual authoring** in the Companion runtime

## Governing authority

The work in this package must align to the following governing files first:

- `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Governing-Standard.md`
- `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Homepage-Overlay.md`

The following remain relevant secondary doctrine and architecture references where they do not conflict with the two SPFx doctrine files above:

- `docs/reference/ui-kit/UI-System-Layer-Model.md`
- `docs/reference/ui-kit/Presentation-Lane-Standard.md`
- `docs/reference/ui-kit/Productive-Lane-Standard.md`
- `apps/hb-webparts/src/webparts/hbKudos/kudosRuntimeContract.ts`

## Locked execution posture

- Work from the live repo on the active working branch based on `main` truth.
- Treat the **HB Kudos Companion** as a **SharePoint-hosted homepage-family webpart**.
- Respect SharePoint host chrome. Do not add fake shell chrome, duplicate navigation, or host-fighting patterns.
- Treat **authoring safety**, **host-safe behavior**, and **professional degraded states** as production requirements, not optional polish.
- Do not re-read files that are already in your current context or memory unless you need fresh verification or additional surrounding context.
- Do not drift into Wave 1 non-P0 redesign work unless a narrow supporting change is required to close the P0 issue cleanly.

## Primary implementation scope

Core files likely to be involved:

- `apps/hb-webparts/src/webparts/hbKudosCompanion/HbKudosCompanion.tsx`
- `apps/hb-webparts/src/webparts/hbKudosCompanion/companion.module.css`
- `apps/hb-webparts/src/homepage/shared/KudosGovernancePrimitives.tsx`
- `apps/hb-webparts/src/homepage/shared/governance.module.css`
- `apps/hb-webparts/src/homepage/data/usePeopleCultureData.ts`
- `apps/hb-webparts/src/mount.tsx`
- `apps/dev-harness/src/tabs/KudosCompanionTab.tsx`
- any narrow helper, contract, or test files required to close the issues correctly

## Expected outcome of this package

After all prompts are executed, the Companion should:

- clearly distinguish **error**, **empty**, and **filtered-empty** conditions
- render safely when configuration, data, or host conditions are incomplete or degraded
- behave more reliably inside SharePoint edit/view conditions and hosted page-canvas constraints
- remove or materially reduce prohibited inline visual authoring from ordinary homepage source in the Companion runtime
- remain visually premium, host-aware, and non-generic without drifting into fake app-shell behavior

## Prompt execution order

1. `Prompt-01-P0-Load-Error-Empty-State-Closure.md`
2. `Prompt-02-P0-Degraded-Misconfigured-Partial-State-Closure.md`
3. `Prompt-03-P0-Authoring-and-Host-Safe-Hardening.md`
4. `Prompt-04-P0-Inline-Visual-Authoring-Retirement.md`

## Validation expectations after the wave

Use the repo’s existing validation workflows for the affected SPFx/homepage surfaces and dev harness. At minimum, validate:

- no regression in Companion rendering
- clear distinction between load failure, true empty, and filtered-empty outcomes
- stable rendering in local/dev-harness scenarios
- stable rendering when site/list context is missing or incomplete
- no fake shell chrome or host-fighting behavior introduced
- no new broad `@hbc/ui-kit` root imports in homepage webpart code
- no material increase in inline visual styling inside ordinary homepage source

## Deliverables expected from the code agent

- implemented code changes
- any narrowly required helper/test additions
- concise execution summary
- validation summary
- remaining risks or doctrine exceptions, if any
