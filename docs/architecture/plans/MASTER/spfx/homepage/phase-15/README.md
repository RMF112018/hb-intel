# HB Central Homepage UI Reset — Forceful Phase-Based Prompt Package

## Objective

This package instructs a local code agent to execute a **hard visual reset** of the HB Central SharePoint homepage experience across:

- `apps/hb-webparts` (Lane A)
- `apps/hb-shell-extension` (Lane B)
- `packages/ui-kit` (`@hbc/ui-kit`)
- any directly-governing homepage, shell, doctrine, import, and packaging files

The package is intentionally forceful because the current rendered state is **not acceptable**. The objective is not cosmetic cleanup. The objective is to move the implementation materially closer to a **premium, productized, purchase-grade intranet experience**.

## Current-State Decision

Treat the following as already decided:

- the current rendered state is unsatisfactory
- no current homepage webpart is acceptable in its present visual state
- the current hero is too empty and generic
- the current welcome card is too ordinary
- the current utility, launcher, editorial, operational, and discovery surfaces are too visually similar
- the current shell-extension posture is too scaffold-like
- the page still reads as “custom cards placed inside SharePoint” rather than a cohesive HB Central product

The code agent must **not** spend time defending the existing UI.

## Package Contents

- `Phase-Implementation-Plan-Summary.md`
- `Prompt-01_Shared_Surface_System_Reset.md`
- `Prompt-02_Lane-B_Shell-Extension_Premiumization.md`
- `Prompt-03_Top-Band_Hard_Reset.md`
- `Prompt-04_Utility_Command_Surfaces_Reset.md`
- `Prompt-05_Discovery_and_Launcher_Redesign.md`
- `Prompt-06_Communications_Surfaces_Redesign.md`
- `Prompt-07_Operational_Surfaces_Redesign.md`
- `Prompt-08_Composition_Integration_and_Final_Polish.md`

## Execution Order

Run the prompts in order. Do not skip ahead.

The sequencing is deliberate:

1. rebuild the shared visual system first
2. fix the shell layer second
3. rebuild the top-of-page signature moment third
4. rebuild utility and discovery next
5. rebuild editorial and operational surfaces after the system foundations are in place
6. finish with full-page composition, integration, validation, and documentation

## Non-Negotiable Rules

- Do **not** reread files that are already in the agent’s active context or memory.
- Do **not** perform cosmetic-only edits.
- Do **not** preserve weak current patterns merely for continuity.
- Do **not** invent unsupported SharePoint takeover behavior.
- Do **not** regress packaging, import discipline, accessibility, or reduced-motion handling.
- Do **not** claim success without rendering proof, code proof, and validation proof.

## Expected Output Quality

The target is **not** “clean enterprise UI.”

The target is:

- premium
- confident
- composed
- branded
- clearly authored
- materially stronger than stock SharePoint
- credible as a purchasable premium intranet product

## Required Deliverables Across the Full Package

By the end of the package, the code agent should have produced:

- implemented code changes
- any required shared primitive additions/refactors
- updated docs/doctrine where needed
- validation notes
- screenshots or rendered proof where available
- concise completion notes per phase
