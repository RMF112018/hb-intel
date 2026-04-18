Use this in a fresh local code-agent session.

```text
You are working in the live local HB Intel repo.

Primary repo:
https://github.com/RMF112018/hb-intel.git

Critical operating instruction:
Do not re-read files that are already in your current context or memory unless needed to resolve uncertainty or verify drift.

Execution standard:
This prompt is part of a multi-prompt package. Stay tightly scoped to this prompt, but do whatever is required inside scope to reach a real finished state. Do not defer required work. If a boundary, diagnostic, or validation item is necessary for this prompt to be complete, address it now.

Objective:
Introduce the minimum correct **wrapper-facing** integration contract for the embedded `PriorityActionsRail`, without corrupting shell semantics or re-homing rail product logic into the shell.

Inspect first:
- `apps/hb-webparts/src/webparts/hbHomepage/hbHomepageContract.ts`
- `apps/hb-webparts/src/webparts/hbHomepage/shell/shellTypes.ts`
- `apps/hb-webparts/src/webparts/hbHomepage/shell/shellValidation.ts`
- `apps/hb-webparts/src/homepage/webparts/utilityContracts.ts`
- `apps/hb-webparts/src/homepage/data/usePriorityActionsData.ts`
- `apps/hb-webparts/src/homepage/data/priorityActionsContracts.ts`
- any new wrapper runtime file created in Prompt 01

Current issue:
The repo has:
- shell-facing module slices for shell zones
- rail-owned list/data seams for the public/admin rail product

What it does not have is a clean wrapper-facing seam for embedding the rail inside `HbHomepage`.

The wrong fix would be to force rail concerns into shell occupant types or shell preset semantics.

Intended future state:
The wrapper has a typed way to pass only the integration inputs it actually owns, such as:
- whether embedded rail rendering is enabled
- band key
- active audience
- narrow fallback config only if genuinely needed

The shell remains shell-specific.

Required implementation:
1. Add or extend a **wrapper config extraction seam**.
   - Prefer a dedicated file such as `hbHomepageWrapperConfig.ts` rather than crowding shell validation with wrapper-only concerns.
2. Add or refine contract types in `hbHomepageContract.ts` for wrapper-owned rail inputs.
3. Reuse existing active-audience semantics intentionally.
4. Do not add `priorityActionsRail` to `ModuleConfigSlices` unless you can prove that doing so is still shell-semantic and not just a convenience leak. Prefer keeping wrapper extraction separate from shell module slices.
5. Preserve the rail’s existing list/admin/data seam. The wrapper must not become the new content authority.

Acceptance criteria:
- wrapper-owned rail props are typed
- audience propagation is explicit
- band key handling is explicit
- wrapper contract is understandable without reading shell occupant code
- shell occupant model remains unchanged

Validation required:
- typecheck must pass
- wrapper runtime compiles cleanly with new types
- demonstrate in the final report that shell semantics were not widened

What done looks like:
A reviewer can see a clear distinction between:
- wrapper integration config
- shell zone config
- rail product data config

with no semantic leakage between them.
```