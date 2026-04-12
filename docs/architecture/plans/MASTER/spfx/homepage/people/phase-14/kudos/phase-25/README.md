# README — HB Kudos Companion P1 Prompt Package

## Purpose

This package covers all **Priority 1** issues from the doctrine-aligned audit of the **HB Kudos Companion**.

These prompts assume the P0 package has already been executed or is otherwise closed enough that the Companion now has:

- distinct loading / error / empty-state handling
- better degraded and partial-state safety
- stronger host-safe and authoring-safe posture
- improved compliance around ordinary homepage source visual authoring

## Package contents

- `Plan-Summary.md`
- `Prompt-01-P1-Queue-Workspace-Hierarchy-Rebuild.md`
- `Prompt-02-P1-Detail-Panel-Action-Family-Rebuild.md`
- `Prompt-03-P1-Task-Specific-Governance-Input-Controls.md`
- `Prompt-04-P1-Styling-Ownership-and-Visual-Governance-Hardening.md`
- `Prompt-05-P1-Premium-Stack-Adoption-and-Interaction-Upgrade.md`

## Execution order

Execute the prompts in numeric order.

Do not skip ahead unless a prompt explicitly says it is safe to do so.

## Package philosophy

This is **not** a decorative refresh package.

It is a structural product-quality package focused on turning the Companion into a stronger SharePoint-hosted governance workspace while remaining aligned with:

- `UI-Doctrine-SPFx-Governing-Standard.md`
- `UI-Doctrine-SPFx-Homepage-Overlay.md`

## Important guardrails

- Do not re-read files that are already in your current context or memory unless you need fresh verification or additional surrounding context.
- Do not replace strong typed governance logic with looser abstractions.
- Do not create artificial shell framing inside the webpart.
- Do not treat premium stack adoption as symbolic. Use it only where it materially improves the result.
- Do not redesign public `HbKudos` unless a shared seam must change safely for Companion quality.
- Do not introduce regressions in SharePoint-hosted behavior, role gating, audit-event writing, or list-binding safety.

## Expected deliverable from the code agent

For each prompt, the code agent should report:

- what it changed
- what files were touched
- why the changes satisfy the doctrine
- any remaining constraints or follow-on items

## Recommended follow-up

After this P1 package is executed, run a separate validation / closure package before moving to lower-priority work.
