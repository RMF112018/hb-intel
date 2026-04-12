# Plan-Summary — HB Kudos Companion P1 Remediation Package

## Package objective

This package instructs the local code agent to resolve all **Priority 1** issues identified in the doctrine-aligned audit of the **HB Kudos Companion** runtime.

This package is limited to the following P1 issues:

1. Rebuild the queue workspace hierarchy so it reads as a premium, productized, host-safe governance surface.
2. Restructure the detail panel into safer action families with clearer operator flow.
3. Replace generic governance dialog inputs with task-specific controls.
4. Tighten styling ownership across the runtime, local CSS modules, and governance primitives.
5. Use the approved premium stack more materially where relevant.

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
- `apps/hb-webparts/src/homepage/data/usePeopleCultureData.ts`
- `apps/hb-webparts/src/homepage/data/kudosGovernanceWriter.ts`
- `apps/hb-webparts/src/homepage/helpers/kudosCapabilities.ts`
- `apps/hb-webparts/src/homepage/helpers/kudosRoleResolver.ts`
- `apps/hb-webparts/src/homepage/webparts/kudosContracts.ts`
- `apps/hb-webparts/src/webparts/hbKudos/kudosRuntimeContract.ts`
- `apps/hb-webparts/src/webparts/hbKudos/kudosVariants.ts`
- `apps/hb-webparts/src/mount.tsx`
- `apps/hb-webparts/src/webparts/hbKudosCompanion/HbKudosCompanionWebPart.manifest.json`
- `apps/dev-harness/src/tabs/KudosCompanionTab.tsx`

## Non-negotiable execution rules

- Do not re-read files that are already in your current context or memory unless you need fresh verification or additional surrounding context.
- Do not generate fake shell chrome, fake navigation, or faux standalone-app framing inside the SharePoint page canvas.
- Do not break host-safe SharePoint behavior.
- Do not weaken role gating, audit logging, list-binding safety, or typed governance actions.
- Do not collapse the Companion into a timid enterprise card grid.
- Do not use decorative polish as a substitute for structural improvement.
- Do not introduce raw, ad hoc visual values in ordinary homepage source when the same outcome can be achieved through doctrine-aligned token, variant, or CSS-module discipline.
- Do not broaden scope into public `HbKudos` redesign work except where a shared seam or shared family file must be adjusted safely.

## Required execution order

Run the prompts in this order:

1. `Prompt-01-P1-Queue-Workspace-Hierarchy-Rebuild.md`
2. `Prompt-02-P1-Detail-Panel-Action-Family-Rebuild.md`
3. `Prompt-03-P1-Task-Specific-Governance-Input-Controls.md`
4. `Prompt-04-P1-Styling-Ownership-and-Visual-Governance-Hardening.md`
5. `Prompt-05-P1-Premium-Stack-Adoption-and-Interaction-Upgrade.md`

## Expected outcome after this package

After all prompts are executed, the Companion should:

- feel like a premium, host-safe, productized SPFx governance workspace
- retain SharePoint-aware coexistence with the host
- present clearer queue hierarchy and stronger operator workflow
- remove generic/internal-tool input patterns for governance actions
- show cleaner visual ownership and lower inline-style sprawl
- make real, relevant use of the approved premium stack where it improves the homepage-family SPFx experience

## Validation expectation

After execution, validate in both:

- SharePoint-hosted runtime
- dev harness (`KudosCompanionTab`)

Validation should specifically confirm:

- no shell duplication
- no regression in role enforcement or governance writes
- stable loading/error/empty behavior
- improved queue readability and operator flow
- safer action grouping
- task-specific action inputs
- stronger but host-safe polish
