# HB Kudos UI Audit + Remediation Prompt Package
## Host-aware revision for persistent SharePoint assistant button

This package is a revised remediation set for the HB Kudos UI in the live repo.

It supersedes any prompt language that treated the floating lower-right SharePoint assistant button as removable, suppressible, or irrelevant.

The assistant button is a **persistent host control**. It must be treated as an immutable part of the SharePoint runtime environment.

## Governing correction

The local code agent must treat the following as hard requirements:

- The SharePoint assistant button is **not a defect**.
- The Kudos flyout, footer, scrolling region, and action layout must **accommodate** that button.
- No remediation may attempt to hide, relocate, disable, out-z-index, clip, or visually fight the host control.
- Validation must be performed with the SharePoint assistant button visible and active in normal SharePoint-hosted runtime.
- Success at 90% browser zoom is not acceptable as closure proof. The required validation baseline is standard **100% browser zoom**.

## Package contents

- `00-Plan-Summary.md`
- `01-Audit-Summary.md`
- `02-Prompt-Shared-Flyout-Host-Aware-Overlay.md`
- `03-Prompt-Footer-Safe-Zone-and-Host-Control-Clearance.md`
- `04-Prompt-HB-Kudos-Composer-Layout-and-Viewport-Remediation.md`
- `05-Prompt-People-Picker-Ownership-and-Dropdown-Remediation.md`
- `06-Prompt-Surface-and-Archive-Density-Responsive-Remediation.md`
- `07-Prompt-Hosted-Validation-and-Closure.md`

## Repo scope

Primary repo:
- `https://github.com/RMF112018/hb-intel.git`

Mandatory code paths:
- `apps/hb-webparts/src/webparts/hbKudos/`
- `apps/hb-webparts/src/homepage/data/useSharePointPeopleSearch.ts`
- `packages/ui-kit/src/HbcKudosComposer/`
- `packages/ui-kit/src/HbcPeoplePicker/`
- `packages/ui-kit/src/HbcPeopleCultureSurface/`
- `apps/hb-webparts/src/mount.tsx`

## Non-negotiable architectural rule

The fix must be ownership-correct:

- shared flyout / sheet / footer behavior belongs in shared UI infrastructure
- SharePoint runtime accommodation belongs in the shared hosted overlay strategy
- picker consolidation belongs in the shared picker lane
- HB Kudos local code may only own thin composition and local density refinements

## Explicit prohibition

Do not close this work with:
- a one-off CSS nudge in `HbKudos.tsx`
- a local-only z-index patch
- a “works at 90% zoom” claim
- validation that hides the SharePoint assistant button
- validation performed only in local preview or Storybook
