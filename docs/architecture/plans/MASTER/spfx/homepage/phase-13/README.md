# Phase C Prompt Package — Homepage Utility / Discovery Premiumization

## Objective

This package instructs the local code agent to implement **Phase C** of the HB Central homepage premiumization program.

Phase C is the **utility / discovery premiumization pass**. Its purpose is to eliminate the remaining “plain intranet links in boxes” feel by redesigning the homepage's highest-frequency action and navigation surfaces inside the current SharePoint/SPFx constraints.

The primary targets are:

- `PriorityActionsRail`
- `ToolLauncherWorkHub`
- `SmartSearchWayfinding`

Phase C must stay anchored to live repo truth and must preserve the lane boundaries, packaging model, homepage doctrine overlay, import discipline, accessibility rules, and authoring-safe behavior already established in the repo.

---

## Package Contents

1. `Phase-C-Implementation-Plan-Summary.md`
2. `Prompt-01-Phase-C-Baseline-and-Utility-Discovery-Architecture.md`
3. `Prompt-02-Redesign-Priority-Actions-Rail.md`
4. `Prompt-03-Redesign-Tool-Launcher-Work-Hub.md`
5. `Prompt-04-Redesign-Smart-Search-Wayfinding.md`
6. `Prompt-05-Validation-Docs-and-Completion-Closeout.md`

---

## Required Execution Order

Run the prompts in order.

Do **not** skip ahead.

Each prompt assumes the prior prompt's changes are already present in the working tree.

---

## Locked Phase C Scope

### In scope
- premiumize the utility/discovery homepage surfaces
- improve action-row, launcher-tile, destination-tile, and search/discovery affordances
- strengthen utility and discovery hierarchy, scan rhythm, status handling, and action clarity
- refine icon treatment where the current experience still feels placeholder-grade
- use and extend the Phase A shared-system uplift where needed
- update docs/stories/tests required by repo truth and touched scope
- preserve SPFx lane/package safety

### Out of scope
- top-band redesign work
- broader communications/editorial premiumization
- operational spotlight redesign beyond any shared dependency needed by the target surfaces
- shell takeover / custom SharePoint chrome
- Lane B Application Customizer work
- backend/data-model changes
- broad authoring-schema rewrites unless strictly required
- speculative design-system expansion not justified by the target surfaces

---

## Repo-Truth Anchors

The prompts are written assuming the current live repo truth includes at least the following authoritative files and constraints:

- `apps/hb-webparts/README.md`
- `apps/hb-webparts/src/homepage/ReferenceHomepageComposition.tsx`
- `apps/hb-webparts/src/homepage/tokens.ts`
- `apps/hb-webparts/src/homepage/shared/*`
- `apps/hb-webparts/src/webparts/priorityActionsRail/*`
- `apps/hb-webparts/src/webparts/toolLauncherWorkHub/*`
- `apps/hb-webparts/src/webparts/smartSearchWayfinding/*`
- `apps/hb-webparts/src/homepage/helpers/utilityConfig.ts`
- `apps/hb-webparts/src/homepage/helpers/discoveryConfig.ts`
- `apps/hb-webparts/src/homepage/webparts/utilityContracts.ts`
- `apps/hb-webparts/src/homepage/webparts/discoveryContracts.ts`
- `packages/ui-kit/src/homepage.ts`
- any homepage-safe primitives added during Phase A
- `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Homepage-Overlay.md`

If repo truth has materially changed, the agent must reconcile against the live code before editing.

---

## Hard Gates

The code agent must satisfy all of the following:

- **Do not re-read files that are still within your current context window or memory.** Re-read only when needed to resolve uncertainty, verify drift, or inspect files not already in active context.
- Keep homepage imports compliant with the existing homepage entry-point doctrine.
- Do not introduce root `@hbc/ui-kit` imports into homepage webparts.
- Preserve Lane A ownership and do not create shell chrome.
- Do not regress `.sppkg` packaging, mount/dispatch seams, or multi-webpart cumulative behavior.
- Keep accessibility, token discipline, reduced-motion support, and authoring-safe defaults intact.
- Reuse the Phase A shared primitives where appropriate instead of rebuilding local one-off styling.
- Only extend the shared homepage system where multiple utility/discovery surfaces truly need it.
- Update docs only where implementation truth changed; do not create speculative architecture drift.

---

## Expected End State

By the end of Phase C, the repo should have:

- a clearly premiumized utility/action rail surface
- a clearly premiumized launcher/work-hub surface
- a clearly premiumized discovery/search/wayfinding surface
- stronger iconography, row/tile affordances, and action hierarchy
- improved scan rhythm and reduced “plain links in cards” behavior
- validation, docs, and closeout artifacts aligned to implementation truth

---

## Completion Artifacts Expected from the Agent

At minimum, the agent should leave behind:

- code changes implementing the Phase C utility/discovery premiumization
- updated docs/stories/tests where required
- a completion note summarizing:
  - what changed
  - what was deliberately left for later phases
  - any risks / follow-ons / migration notes
