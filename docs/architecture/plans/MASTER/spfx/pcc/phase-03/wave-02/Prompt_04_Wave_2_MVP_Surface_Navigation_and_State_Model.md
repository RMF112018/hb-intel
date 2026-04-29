# Prompt 04 — Wave 2 MVP Surface Navigation and State Model

## Operating Instructions

You are executing this prompt in the live `RMF112018/hb-intel` repository. Treat the current repo as the source of truth. Do not assume files from memory are current. However, do not repeatedly re-read files that are still within your current context unless the file may have changed or the prompt specifically requires a freshness check.

Work to closure. Do not defer required analysis, do not ask broad clarification questions, and do not implement outside the allowed scope. If repo truth conflicts with this prompt, stop before code changes and document the conflict clearly.

## Objective

Wire the eight PCC MVP surfaces into the shell navigation using `PCC_MVP_SURFACE_IDS` / `PCC_MVP_SURFACES`. Use internal state/tab navigation only.

## Required Behavior

- Render all eight MVP surfaces in the left navigation rail.
- Default active surface: `project-home`.
- Use display names/descriptions from `@hbc/models/pcc` where practical.
- Provide an active state, focus state, keyboard navigation, and compact/narrow mode affordance.
- Surface panels may be preview frames only.
- No URL router library unless Prompt 01 proved an existing convention requires it.

## Required Surfaces

```text
project-home
team-and-access
documents
project-readiness
approvals
external-systems
control-center-settings
site-health
```

## State Model

Use a simple state model equivalent to:

```ts
interface PccShellState {
  activeSurfaceId: PccMvpSurfaceId;
  previewMode: true;
  selectedProjectId?: PccProjectId;
}
```

## Forbidden Work

Do not implement live route params, backend entity loading, persisted navigation preferences, tenant reads, or real authorization.

## Validation

Add tests confirming:

- all `PCC_MVP_SURFACE_IDS` render a navigation item;
- default selected surface is Project Home;
- selecting a surface changes the visible panel;
- keyboard/focus behavior is sane;
- no live route/backend/Graph/PnP/Procore paths exist.

Run package validation commands.

## Closeout

Create `Wave_2_Prompt_04_Closeout.md` with navigation coverage and guardrail confirmations.
