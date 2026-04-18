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
Create the real flagship homepage runtime wrapper so `HbHomepage` owns a pre-shell `PriorityActionsRail` region before `HbHomepageShell`.

Inspect first:
- `apps/hb-webparts/src/webparts/hbHomepage/HbHomepage.tsx`
- `apps/hb-webparts/src/webparts/hbHomepage/HbHomepageShell.tsx`
- `apps/hb-webparts/src/webparts/hbHomepage/HbHomepageShell.module.css`
- `apps/hb-webparts/src/webparts/priorityActionsRail/PriorityActionsRail.tsx`
- `apps/hb-webparts/src/webparts/hbHomepage/hbHomepageContract.ts`
- any existing hbHomepage tests or runtime-adjacent helper seams you find directly relevant

Current issue:
`HbHomepage` is only a pass-through. There is no real wrapper-owned pre-shell region. As a result, the homepage runtime cannot truthfully claim that priority actions is part of homepage-owned composition.

Intended future state:
The flagship homepage runtime becomes:

1. wrapper root
2. wrapper-owned priority-actions region
3. shell root

The shell remains shell-only. The rail remains a standalone React surface that can still be rendered independently elsewhere.

Required implementation:
1. Keep `HbHomepage.tsx` clean.
   - Prefer creating a dedicated runtime component such as `HbHomepageEntryStack.tsx` or similarly named file.
2. Add a dedicated CSS module for the wrapper-owned entry-stack region.
3. Render embedded `PriorityActionsRail` before `HbHomepageShell`.
4. Emit stable data attributes on:
   - wrapper root
   - actions region
   - shell region
   so DOM order and ownership are machine-checkable.
5. Align wrapper spacing/width behavior intentionally with the existing shell envelope; do not assume the current standalone rail width will automatically look correct when embedded.
6. Do not add `PriorityActionsRail` to shell occupants, shell presets, shell band semantics, or shell validation.

Implementation expectations:
- The wrapper should be semantically obvious in code.
- Keep responsibilities separated:
  - wrapper decides composition order
  - rail owns rail behavior
  - shell owns shell lanes
- If you introduce a new file, give it a precise name and place it beside the existing hbHomepage runtime files.

Acceptance criteria:
- `HbHomepage` no longer directly returns only `<HbHomepageShell {...props} />`
- embedded rail renders before shell in the wrapper
- wrapper data attributes clearly prove ordering
- shell code path remains shell-only
- no rail shell-occupant migration appears anywhere

Validation required:
- run the relevant tests for touched files if they exist
- run lint/typecheck for touched package scope where appropriate
- provide a concise diff summary naming the new/changed runtime files

What done looks like:
A reviewer can open the runtime code and immediately see that `HbHomepage` now owns a pre-shell actions region, while `HbHomepageShell` remains the shell and the rail remains an embedded product surface rather than a shell occupant.
```