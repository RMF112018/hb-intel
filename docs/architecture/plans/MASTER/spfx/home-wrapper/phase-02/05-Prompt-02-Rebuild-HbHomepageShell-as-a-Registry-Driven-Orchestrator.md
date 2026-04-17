# Prompt 02 — Rebuild `HbHomepageShell` as a Registry-Driven Orchestrator

## Objective

Replace the shell’s current fixed stacked renderer with a registry-driven, preset-driven post-hero orchestrator that renders explicit bands and slots from validated shell data.

This prompt is where the shell becomes a real shell.

## Why this shell issue exists / current-state problem

The current renderer is too thin:

- it creates one `zoneProps` object
- it renders five zones in fixed JSX order
- it depends on CSS gap and padding for almost all shell-level authorship

That is a composed host, not a governed shell.

The shell should own:
- composition authority
- band/slot semantics
- shell-level hierarchy
- explicit first-lane semantics
- explicit section metadata
- protected orchestration decisions

It should **not** own:
- hero composition
- child product logic
- deep child presentation logic

## Repo-truth evidence and exact shell files / seams to inspect

Inspect at minimum:

- `apps/hb-webparts/src/webparts/hbHomepage/HbHomepageShell.tsx`
- `apps/hb-webparts/src/webparts/hbHomepage/HbHomepage.tsx`
- `apps/hb-webparts/src/webparts/hbHomepage/hbHomepageContract.ts`
- `apps/hb-webparts/src/webparts/hbHomepage/zones/*`
- schema/registry files from Prompt 01
- `apps/hb-webparts/src/mount.tsx`

Also keep the governing shell contract doc open:
- `docs/architecture/plans/MASTER/spfx/homepage/hb-homepage/phase-01/03-Architecture-and-Shell-Embedded-Contract.md`

That doc makes the post-hero boundary explicit. Respect it.

Also keep `docs/reference/shell/HB-Shell-Entry-Breakpoint-Spec.md` open. The shell renderer now needs to express the first shell lane as an intentional shell concept, not an accidental first item in a stack.

## Why the current shell implementation is insufficient

A fixed vertical render order is insufficient because it cannot express:

- primary vs supporting vs recognition roles
- band-level semantics
- slot metadata
- inactive candidates vs active occupants
- preset-driven changes
- compatibility-aware rendering decisions

It also makes review harder because the shell’s composition logic is buried in JSX order instead of being inspectable in data.

## Required shell implementation outcome

Rebuild the renderer so it does all of the following:

### 1. Render from validated shell state
The shell should render from the schema/registry/preset data introduced in Prompt 01, not from a hand-authored stack.

### 2. Use explicit bands and slots
Introduce explicit shell structure such as:
- band wrappers
- slot wrappers
- section metadata
- stable data attributes for diagnostics and validation

The exact naming is up to you, but the semantic structure must be explicit.

### 3. Preserve zone wrapper boundaries
Keep the current zone wrappers bounded. The shell should choose **where** to render an occupant; the zone wrapper should still own **how** the child is mounted with its scoped props.

### 4. Keep the post-hero boundary explicit
The shell must remain the post-hero operating layer. Do not introduce a fake top-band inside `hbHomepage` that duplicates or absorbs the independent hero.

### 5. Make current hierarchy explicit without flattening persona
Encode current public-shell intent such that:
- dominant editorial / operational anchors are deliberate
- contextual surfaces are grouped intentionally
- recognition remains visible but governed
- the page no longer reads as “stack / gap / stack / gap / stack”

That does **not** mean every band must be side-by-side on day one. It means the shell’s hierarchy must be codified instead of accidental.

### 6. Make the first shell lane explicit
The renderer should know which band is the **entry band / first shell lane**.

That first lane should support stronger shell policy than later lanes, including:
- dominant-left or single-column guidance where applicable
- stricter slot comfort rules
- portrait / handheld fallback requirements
- clearer diagnostics when a proposed first-lane pairing is invalid

## What done really looks like

You are done only when all of the following are true:

1. `HbHomepageShell.tsx` is no longer a fixed hard-coded zone list.
2. The shell renders active occupants by resolving validated shell data.
3. Band and slot semantics are visible in the code and the DOM.
4. Current occupant set can be changed by presets / shell data without rewriting render order.
5. Zone wrappers remain thin and child logic remains bounded.
6. The first shell lane is an explicit renderer concept rather than an implicit first item.
7. The independent hero boundary is preserved and explicitly documented in the resulting shell code/comments where helpful.

## Constraints / prohibitions

- Do not move the hero into `hbHomepage`.
- Do not rebuild the child webparts as monoliths.
- Do not create a neutral equal-weight grid that erases hierarchy.
- Do not make shell structure so abstract that nobody can read it.
- Do not leave active/inactive occupant distinction implicit.

## Proof of closure required

Provide all of the following:

1. exact files changed
2. old render model vs new render model summary
3. rendered band / slot structure overview
4. explanation of how current occupants are resolved from the new shell data
5. explicit statement of how the post-hero boundary was preserved
6. explanation of how the first shell lane is identified and governed
7. explanation of how the new shell avoids falling back into equal-weight sequential stacking


## Instruction not to re-read files that are still in active context unless needed to confirm drift, dependencies, or uncertainty after changes

Do not re-read files that are still in active context unless needed to confirm drift, dependencies, or uncertainty after changes.
