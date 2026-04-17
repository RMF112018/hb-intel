# Prompt 03 — Implement Container-Aware Responsive Resolution and Slot Comfort Rules

## Objective

Make the shell responsive based on the actual space available to the shell and its slots, not just the viewport, and encode comfort rules that govern when occupants may pair, stack, compact, or demote.

This prompt closes the gap between “modules individually respond” and “the shell actively orchestrates the best layout.”

## Why this shell issue exists / current-state problem

The current shell CSS does only three things:

- flex-column layout
- wider gap/padding at 768px
- wider gap/padding again at 1200px

That means the shell does **not** currently own:
- pairing logic
- stacking/demotion rules
- comfort thresholds
- container-aware breakpoint resolution
- compact-mode switching
- slot-specific density management

In practice, the modules are doing more adaptive work than the shell.

## Repo-truth evidence and exact shell files / seams to inspect

Inspect at minimum:

- `apps/hb-webparts/src/webparts/hbHomepage/HbHomepageShell.module.css`
- `apps/hb-webparts/src/webparts/hbHomepage/HbHomepageShell.tsx`
- shell schema / registry / preset files from Prompts 01–02
- current zone wrapper files
- any occupant capability records introduced in Prompt 01
- `docs/reference/shell/HB-Shell-Entry-Breakpoint-Spec.md`

Keep shell-fit reality in mind:
- `PeopleCulturePublicSurface.tsx` contains an internal `maxWidth: 1040`
- the shell currently has no slot comfort model at all
- the breakpoint spec now expects named entry-state behavior rather than vague “desktop/tablet/mobile” handling

## Why the current shell implementation is insufficient

Viewport-only gap changes are not enough because SharePoint hosting creates real-world cases where:

- the browser viewport is wide, but the shell container is not
- page region changes alter usable shell width
- a slot can become too narrow for a given occupant even when the viewport is still “desktop”
- one band may need to demote while another can still stay paired

Without container-aware logic, the shell can only guess.

## Required shell implementation outcome

Implement responsive orchestration that is driven by actual shell/container conditions and capability data.

### 1. Introduce container-aware shell resolution
Use CSS container queries where possible and JavaScript measurement only where the resolver truly needs computed shell width.

If JavaScript measurement is required, use a measured shell/container width approach rather than viewport-only `matchMedia`.

### 2. Encode slot comfort rules
The shell must be able to answer questions like:
- can this occupant render comfortably in this slot width?
- if not, should it:
  - stack
  - demote to a lower band
  - switch to compact mode
  - defer to a summary treatment
- which pairings are prohibited below a given comfort width?

### 3. Add breakpoint-appropriate band behavior
Do **not** stop at generic wide / medium / narrow states.

Define deliberate behavior aligned to the practical shell design targets in `docs/reference/shell/HB-Shell-Entry-Breakpoint-Spec.md`, covering at minimum:

- **ultrawide desktop** — roughly `1600–2200 px` usable shell width
- **desktop baseline** — roughly `1180–1400 px` usable shell width
- **tablet landscape** — roughly `980–1250 px` usable shell width
- **tablet portrait** — roughly `720–950 px` usable shell width
- **phone portrait** — roughly `375–430 px` usable shell width
- **short-height constrained** states where height, not width, becomes the limiting factor

The exact state names may vary, but the model must preserve the same practical behavior.

### 3A. Encode first-lane policy, not just generic responsive policy
The shell must know which band is the **first shell lane** and apply stronger rules there.

At minimum:
- the first shell lane must begin on first view
- two-column first-lane behavior must be conditional
- tablet portrait and handheld states should default to single-column first-lane behavior
- if the first lane is paired on desktop baseline widths, the dominant-left hierarchy must remain clear

### 4. Preserve authored hierarchy during responsive change
Responsive behavior should preserve the shell’s authored hierarchy, not flatten it for convenience.

That means:
- dominant anchors should remain clearly dominant
- contextual surfaces should form calmer supporting treatments
- recognition should remain visible without overpowering the page
- compacting should not turn the shell into a generic utility stack

### 5. Respect the adjacent entry stack without absorbing it
This prompt is still shell-only.

Do not rebuild the independent hero or the full utility/actions layer here.

But do ensure the shell’s own top spacing, first-band treatment, and lane sequencing respect the breakpoint spec’s entry-state goals:
- brand + action + value on first screen
- the hero is not the homepage
- the first shell lane must not feel buried beneath oversized upper layers

### 6. Meet reflow expectations for shell-owned chrome
Any shell-owned labels, wrappers, controls, fallback surfaces, or future preset affordances must remain reflow-safe and keyboard reachable.

## What done really looks like

You are done only when all of the following are true:

1. The shell can resolve layout from the size of its actual container, not only the viewport.
2. Pairing / stacking / compacting is governed by explicit slot comfort rules.
3. Responsive behavior is visible in shell logic, not left entirely to child internals.
4. The shell defines entry states aligned to the local breakpoint spec’s practical design targets.
5. The first shell lane is governed explicitly, including single-column portrait/handheld fallback and conditional pairing.
6. Narrower shell states still preserve hierarchy and avoid accidental clutter.
7. The shell’s non-excepted chrome reflows cleanly.
8. The implementation is readable enough that another engineer can explain why a given occupant moved or compacted.

## Constraints / prohibitions

- Do not rely only on larger gaps and padding as the “responsive strategy.”
- Do not use viewport-only breakpoints as the sole shell resolution mechanism.
- Do not flatten the page into one neutral stacked list at all narrow states unless the capability rules actually require it.
- Do not treat the local breakpoint spec as advisory prose only; encode it into shell behavior.
- Do not assume a two-column first lane is acceptable just because a breakpoint was crossed.
- Do not rebuild the hero or a full Top Actions product here.
- Do not force unrelated child-webpart redesign work.
- Do not add a freeform drag-resize engine to the public shell renderer.

## Proof of closure required

Provide all of the following:

1. exact files changed
2. shell breakpoint / container-state model summary
3. slot comfort rule summary
4. explicit first-lane rule summary by named entry state
5. one example each of:
   - paired state
   - demoted/stacked state
   - compacted state
6. explanation of how shell-owned chrome remains reflow-safe
7. before vs after explanation of why the shell now owns adaptive composition rather than only adaptive spacing
8. confirmation of how the implementation aligns to `docs/reference/shell/HB-Shell-Entry-Breakpoint-Spec.md`


## Instruction not to re-read files that are still in active context unless needed to confirm drift, dependencies, or uncertainty after changes

Do not re-read files that are still in active context unless needed to confirm drift, dependencies, or uncertainty after changes.
