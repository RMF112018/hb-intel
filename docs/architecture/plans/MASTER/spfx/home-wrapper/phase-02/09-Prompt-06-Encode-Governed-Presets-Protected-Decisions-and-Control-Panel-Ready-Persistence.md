# Prompt 06 — Encode Governed Presets, Protected Decisions, and Control-Panel-Ready Persistence

## Objective

Prepare the shell for future controlled layout administration by defining:
- approved presets
- protected decisions
- configurable decisions
- serialized persistence shape
- invalid-config fallback rules

Do this **without** turning the public shell into a freeform dashboard editor.

## Why this shell issue exists / current-state problem

The earlier composition package was right that control-panel readiness matters. The current shell is not ready because it has none of the boundary contracts that such a control panel would need.

Today there is no explicit answer to:
- what may be changed by a future maintainer
- what must remain code-governed
- what a persisted shell layout payload looks like
- how invalid persisted state will be normalized
- how alternate presets differ without collapsing hierarchy

Without that boundary, a future admin UI will either:
- stay too weak to be useful, or
- become strong enough to damage homepage quality

## Repo-truth evidence and exact shell files / seams to inspect

Inspect at minimum:

- shell schema / registry / preset files from Prompts 01–05
- `apps/hb-webparts/src/webparts/hbHomepage/HbHomepageShell.tsx`
- any normalization and persistence helpers introduced earlier
- shell validation/reporting artifacts if already added

Keep the shell-only boundary and post-hero boundary in force.
Also treat `docs/reference/shell/HB-Shell-Entry-Breakpoint-Spec.md` as a governing input for what must be protected versus configurable.

## Why the current shell implementation is insufficient

A future control panel cannot safely exist on top of:
- implicit JSX order
- no preset definitions
- no protected-decision model
- no invalid-state normalization
- no persistence shape

Those are shell defects, not admin-UI defects.

## Required shell implementation outcome

### 1. Define approved public-shell presets
Create at least:
- one strong default preset representing the intended public shell
- one alternate approved preset if the shell can legitimately support it without flattening hierarchy

Each preset should define:
- band sequencing
- slot occupancy choices
- prominence differences
- responsive demotion rules if applicable

### 2. Define protected shell decisions
Mark which decisions remain code-governed, such as:
- post-hero boundary
- prohibited pairings
- dominant-slot ceilings
- recognition-role ceilings
- invalid-state fallback behavior
- forced single-column first-lane behavior on tablet portrait and handheld states
- conditional two-column first-lane behavior
- first-lane visibility / hierarchy protections
- any short-height constrained-state protections required by the breakpoint spec

### 3. Define configurable shell decisions
Mark which decisions a future maintainer may change safely, such as:
- preset selection
- optional occupant visibility
- limited reorder within compatible structures
- compact vs standard treatment where supported
- action-budget metadata references for future top-actions alignment, if represented as adjacent shell policy rather than active shell UI

### 4. Define a persistence shape
Create a serializable shape for future persisted shell state. It must be:
- typed
- validated
- normalizable
- independent from raw JSX ordering

That shape should also be able to represent:
- named entry state policy references
- first-lane policy references
- protected vs configurable decision boundaries
without making those protected decisions freely overrideable by persisted payloads

### 5. Keep public rendering preset-driven
Do not let the public shell renderer behave like a freeform dashboard runtime.

If you create any preview/dev harness to prove preset switching, keep it bounded and clearly non-public.

## What done really looks like

You are done only when all of the following are true:

1. The shell has approved preset definitions.
2. Protected vs configurable decisions are explicit in code and/or disciplined docs near the shell.
3. A future persisted layout payload has a stable typed shape.
4. Invalid persisted state can be normalized without breaking public rendering.
5. Entry-state protections from the breakpoint spec are encoded as protected shell decisions.
6. The public renderer stays authored and governed rather than freeform.

## Constraints / prohibitions

- Do not build a full tenant-maintainer UI here unless an extremely small internal harness is necessary for proof.
- Do not introduce freeform drag-resize behavior in the public shell.
- Do not make every occupant reorderable everywhere.
- Do not let alternate presets erase hierarchy and turn the page into a neutral container.
- Do not violate the post-hero shell boundary.

## Proof of closure required

Provide all of the following:

1. exact files changed
2. preset definitions summary
3. protected decision list
4. configurable decision list
5. serialized persistence shape example
6. explicit protected-vs-configurable list for entry-state rules
7. invalid persisted state example and normalized output
8. explanation of why the resulting shell is genuinely control-panel-ready without already being a freeform editor


## Instruction not to re-read files that are still in active context unless needed to confirm drift, dependencies, or uncertainty after changes

Do not re-read files that are still in active context unless needed to confirm drift, dependencies, or uncertainty after changes.
