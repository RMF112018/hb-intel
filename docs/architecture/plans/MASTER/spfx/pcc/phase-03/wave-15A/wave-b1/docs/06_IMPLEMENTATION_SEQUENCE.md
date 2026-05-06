# 06 — Implementation Sequence

## Batch 0 — Scope Supersession

Prompt: `Prompt_00_Rebaseline_Scope_Supersession_Context_Efficient.md`

Purpose:

- Supersede the prior context-band implementation plan.
- Establish `PccProjectHeroBand` + `PccHorizontalTabs` as the shell target.
- Create a docs-only rebaseline closeout.

## Batch 1 — Breakpoint Foundation

Prompt: `Prompt_01_Breakpoint_Foundation_8_Mode_Contract.md`

Purpose:

- Expand PCC responsive mode contract from 5 modes to 8.
- Update footprint maps and tests.
- Do not touch visible shell UI.

## Batch 2 — Horizontal Tabs Primitive

Prompt: `Prompt_02_Horizontal_Tabs_Primitive.md`

Purpose:

- Add `PccHorizontalTabs`.
- Keep rail mounted for now.
- Prove tab behavior in isolation.

## Batch 3 — Project Hero Band

Prompt: `Prompt_03_Project_Hero_Band.md`

Purpose:

- Add `PccProjectHeroBand`.
- Expand placeholder project context.
- Keep old header mounted until shell replacement.

## Batch 4 — Shell Recomposition and Rail Removal

Prompt: `Prompt_04_Shell_Recomposition_And_Rail_Removal.md`

Purpose:

- Mount hero + tabs in `PccShell`.
- Remove rail/header imports.
- Delete old rail files only after tests are migrated.
- Preserve routing and bento invariants.

## Batch 5 — Navigation A11y and Surface Smoke

Prompt: `Prompt_05_Navigation_A11y_Keyboard_And_Surface_Smoke.md`

Purpose:

- Harden keyboard/a11y behavior.
- Smoke all 8 surfaces through shell.
- Verify tab semantics and focus behavior.

## Batch 6 — Bento Priority and Laptop QA

Prompt: `Prompt_06_Bento_Priority_And_Standard_Laptop_QA.md`

Purpose:

- Tune standardLaptop content priority.
- Ensure primary cards are prioritized.
- Capture or log 14-inch laptop QA evidence.

## Batch 7 — README and Evidence

Prompt: `Prompt_07_Readme_Evidence_And_Screenshot_Index.md`

Purpose:

- Update app README and evidence index.
- Document new shell architecture and 8 breakpoints.

## Batch 8 — Final Closeout

Prompt: `Prompt_08_Final_Wave_B_Closeout_And_Handoff.md`

Purpose:

- Produce final Wave B shell remediation closeout.
- Hand off to later surface remediation.
