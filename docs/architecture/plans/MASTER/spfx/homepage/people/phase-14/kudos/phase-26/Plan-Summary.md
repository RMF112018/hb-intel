# Plan-Summary — HB Kudos Companion P2 Remediation Package

## Package objective

This package instructs the local code agent to resolve all **Priority 2** issues identified in the doctrine-aligned audit of the **HB Kudos Companion** runtime.

This package is limited to the following P2 issues:

1. Add explicit responsive breakpoints and hosted-condition hardening for real SharePoint rendering conditions.
2. Normalize queue-row anatomy and metadata consistency so row structure remains stable and predictable.
3. Tighten surface-family boundaries between the public `HbKudos` runtime and the Companion runtime without destabilizing shared seams.

## Locked governing authority

Treat the following files as **binding governing authority** for this package:

- `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Governing-Standard.md`
- `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Homepage-Overlay.md`

These doctrine files override older generic assumptions where conflict exists.

Also align with the current live implementation and adjacent runtime contracts, including:

- `apps/hb-webparts/src/webparts/hbKudosCompanion/HbKudosCompanion.tsx`
- `apps/hb-webparts/src/webparts/hbKudosCompanion/companion.module.css`
- `apps/hb-webparts/src/homepage/shared/KudosGovernancePrimitives.tsx`
- `apps/hb-webparts/src/homepage/shared/governance.module.css`
- `apps/hb-webparts/src/homepage/shared/KudosDetailPanelContent.tsx`
- `apps/hb-webparts/src/homepage/webparts/kudosContracts.ts`
- `apps/hb-webparts/src/webparts/hbKudos/kudosRuntimeContract.ts`
- `apps/hb-webparts/src/webparts/hbKudos/kudosVariants.ts`
- `apps/hb-webparts/src/webparts/hbKudos/HbKudos.tsx`
- `apps/hb-webparts/src/mount.tsx`
- `apps/dev-harness/src/tabs/KudosCompanionTab.tsx`

## Non-negotiable execution rules

- Do not re-read files that are already in your current context or memory unless you need fresh verification or additional surrounding context.
- Do not broaden this package into a public `HbKudos` redesign.
- Do not create fake shell chrome, fake navigation, or faux standalone-app framing inside the SharePoint page canvas.
- Do not weaken role gating, audit logging, list-binding safety, or typed governance actions.
- Do not collapse the Companion into a timid enterprise card grid.
- Do not introduce brittle responsive hacks or host-fighting behavior.
- Do not blur runtime ownership boundaries just to reduce file count.
- Preserve the current shared seams where they are genuinely shared and improve separation where ownership is muddy.

## Required execution order

Run the prompts in this order:

1. `Prompt-01-P2-Responsive-Hosted-Condition-Hardening.md`
2. `Prompt-02-P2-Queue-Row-Anatomy-and-Metadata-Normalization.md`
3. `Prompt-03-P2-Surface-Family-Boundary-and-Ownership-Tightening.md`

## Expected outcome after this package

After all prompts are executed, the Companion should:

- behave more predictably at narrow, medium, and constrained SharePoint-hosted widths
- maintain stable row anatomy regardless of recipient count or metadata combinations
- have cleaner public-vs-Companion ownership boundaries across shared Kudos surface-family files
- remain host-safe, doctrine-aligned, and easier to maintain

## Validation expectation

After execution, validate in both:

- SharePoint-hosted runtime
- dev harness (`KudosCompanionTab`)

Validation should specifically confirm:

- responsive behavior is explicit and not accidental
- no row collapses or inconsistent metadata disappearance
- no ownership drift between public and Companion runtimes
- no regression in governance behavior, role enforcement, or shared rendering quality
