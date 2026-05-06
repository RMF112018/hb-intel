# PCC Shell Remediation Prompt Package — Context-Efficient Edition

## Purpose

This package replaces the earlier broad-audit-oriented prompt set for PCC Wave 15A / Wave B shell remediation.

The package keeps the same remediation target:

- Replace the heavy vertical `PccNavigationRail` shell with premium horizontal tab navigation.
- Replace the current `PccProjectIntelligenceHeader` with a compact `PccProjectHeroBand`.
- Expand PCC from the current 5 responsive modes to the finalized 8-mode breakpoint policy.
- Preserve PCC routing, read-model boundaries, bento direct-child behavior, and no-live-runtime posture.
- Produce evidence-backed closeouts without claiming final 56/56 from Wave B alone.

## Context-Efficiency Principle

These prompts are designed for a local code agent operating with accumulated context across a multi-prompt sequence.

The agent must not repeatedly re-read broad repo areas. Each prompt includes:

- the necessary source map,
- the exact allowed files,
- targeted “read only if needed” guidance,
- explicit permission to rely on active context,
- narrow validation commands,
- stop conditions.

## Baseline

Prompt 01 audit closeout was pushed as:

```text
23b3acdea487339dec299df711dfac0b2d226efe
```

That commit added:

```text
docs/architecture/blueprint/sp-project-control-center/phase-3/wave-15A/wave-b/prompt-01/closeout/PROMPT_01_CLOSEOUT.md
```

## Recommended Execution Order

1. `prompts/Prompt_00_Rebaseline_Scope_Supersession_Context_Efficient.md`
2. `prompts/Prompt_01_Breakpoint_Foundation_8_Mode_Contract.md`
3. `prompts/Prompt_02_Horizontal_Tabs_Primitive.md`
4. `prompts/Prompt_03_Project_Hero_Band.md`
5. `prompts/Prompt_04_Shell_Recomposition_And_Rail_Removal.md`
6. `prompts/Prompt_05_Navigation_A11y_Keyboard_And_Surface_Smoke.md`
7. `prompts/Prompt_06_Bento_Priority_And_Standard_Laptop_QA.md`
8. `prompts/Prompt_07_Readme_Evidence_And_Screenshot_Index.md`
9. `prompts/Prompt_08_Final_Wave_B_Closeout_And_Handoff.md`

## What Changed From Prior Package

This edition removes instructions like:

- “re-read all repo truth”
- “inspect every related file”
- “perform exhaustive repo audit every prompt”
- “search broadly before acting”

and replaces them with:

- “use active context first”
- “read only exact files needed for edits or failing tests”
- “do not re-open unchanged files already in current context”
- “verify with commands, not broad browsing”
- “read more only when a stop condition, stale context, missing API contract, or failing validation requires it”

## Non-Scope

- No backend/API runtime changes.
- No Graph/PnP/SharePoint REST.
- No Procore live integration.
- No package/manifest bump unless a prompt explicitly changes packaging files and stops for approval.
- No surface redesign beyond Project Home card-priority tuning in Prompt 06.
- No broad updates under `docs/architecture/plans/MASTER/**`.
