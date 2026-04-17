# 02 — Research-Informed Shell Architecture and UX Implications

## Purpose

This file ties current repo gaps to current best-practice web platform and interface patterns.

The goal is not to chase novelty. The goal is to choose the smallest set of external concepts and dependencies that materially improve the shell.

## 1. Container-aware layout must replace viewport-only shell logic

### Why this matters to `hbHomepage`
The current shell is composed inside SharePoint page regions. The public renderer needs to react to the **space the shell actually gets**, not just the browser viewport.

That is exactly the problem container queries and container observation solve.

### Research implication
Use **CSS container queries** for shell slot styling and shell band adjustments. Container queries let component styles react to the size of the containing element rather than only the viewport. They also support container-relative length units such as `cqi` and `cqmin`.

### Immediate shell application
Use container-aware logic to decide things like:
- whether a supporting band should pair or stack
- whether a recognition slot should compact
- whether a shell section should demote from paired to sequential treatment
- whether shell-owned wrappers need different padding, label, or rhythm treatment

### Guidance
Prefer:
- CSS container queries for style/layout decisions
- `ResizeObserver` only where JavaScript must compute active shell breakpoint or preset resolution from actual container width

Avoid:
- pure `window.matchMedia` shell logic as the main responsive engine

## 2. Shared track alignment is worth planning for

### Why this matters
If the shell introduces multi-occupant bands, nested sections can become ragged quickly. Shared alignment between nested grids improves polish and predictability.

### Research implication
**CSS subgrid** is now broadly available and is useful when a child grid should inherit track sizing and line names from a parent grid.

### Immediate shell application
This is most relevant if the shell introduces:
- paired contextual bands
- repeated shell section headers and body tracks
- shared call-to-action baselines across paired occupants

### Guidance
Do not force `subgrid` everywhere. Use it where the shell genuinely needs shared track alignment across nested grids.

## 3. Accessibility reflow is a shell requirement, not only a child requirement

### Why this matters
The shell will own:
- band wrappers
- section labels
- any shell-level fallback surfaces
- any future preset / layout editing controls
- any shell-level expand/collapse affordances

That shell chrome is **not** exempt from ordinary reflow expectations.

### Research implication
WCAG 2.1 Reflow expects content to work without loss of information or functionality at a width equivalent to 320 CSS pixels for vertical-scrolling content, except for parts that truly require two-dimensional layout.

### Immediate shell application
The shell should ensure:
- shell-owned controls and fallback surfaces reflow cleanly
- paired bands demote before non-excepted shell chrome forces two-dimensional scroll
- any future layout-admin affordances remain keyboard reachable and reflow safely

## 4. Public shell renderer and admin editing surface should not be the same architectural thing

### Why this matters
The public shell must preserve authored hierarchy. A future admin surface may need safe reorder and, eventually, safe resize interactions.

Those are related, but they should not collapse into one freeform runtime model too early.

### Research implication
For **controlled reorder flows**, `dnd-kit` is a strong fit because it supports sortable interfaces, keyboard sensors, pointer sensors, and overlay patterns.

For **true draggable/resizable dashboards**, `react-grid-layout` is a credible option because it supports responsive breakpoints, serialized layouts, drag, resize, and per-breakpoint layouts.

### Immediate shell application
The right near-term choice for `hbHomepage` is:

- keep the **public render path preset-driven**
- keep **freeform grid editing out of the public shell**
- prepare persistence and capability metadata now
- reserve `dnd-kit` or `react-grid-layout` for a maintainer-facing editing layer when that layer is actually in scope

### Recommendation hierarchy
1. **Now:** preset-driven shell, typed schema, capability metadata
2. **Later, if admin reorder is needed:** `dnd-kit`
3. **Only if admin resize becomes a real requirement:** evaluate `react-grid-layout` for the admin editing surface, not the public shell renderer

## 5. Typed validation belongs at the shell boundary

### Why this matters
A future persisted shell layout will eventually arrive from:
- list-backed config
- property-pane config
- admin UI state
- test fixtures
- migration logic

Untyped `Record<string, unknown>` is not sufficient at that boundary.

### Research implication
Use a runtime schema validator. The repo already uses `zod` elsewhere, so using it here would align with existing dependency reality rather than introduce a one-off tool.

### Immediate shell application
Create a typed shell schema for:
- presets
- bands
- slots
- occupants
- capability metadata
- protected decisions
- invalid-state normalization

## 6. Research-to-gap mapping

| Repo gap | Research-backed implication | Recommended response |
|---|---|---|
| Fixed stack with no schema | Typed config and validation are required before composition becomes data-driven | Introduce a validated shell schema and registry |
| Viewport-led spacing only | Container queries and `ResizeObserver` solve container-fit responsiveness better than viewport-only logic | Implement container-aware shell breakpoint resolution |
| No occupant capability model | Public shell should not discover fit by trial and error | Add slot eligibility, comfort width, pairing restrictions, compact support |
| No future admin boundary | Public render and editing surface should not collapse into one freeform engine too early | Use governed presets now; reserve drag/reorder tools for later admin work |
| Silent failure behavior | Shell-owned wrappers and controls must remain accessible and reflow-safe | Add visible degraded-state surfaces and invalid-config fallbacks |

## Dependencies / concepts worth introducing or formalizing

### Strong immediate candidates
- native CSS container queries
- `ResizeObserver` for measured shell-width resolution where JS is truly needed
- `zod` for shell schema validation

### Deferred until a maintainer editor is actually in scope
- `dnd-kit` for safe reorder interactions
- `react-grid-layout` for resizable admin editing only if resize becomes a real requirement

## Bottom line

The earlier composition package was right to push toward schema, capabilities, and shell governance.

The stronger implementation answer is:

- typed shell schema
- container-aware public shell renderer
- governed presets
- visible degraded states
- admin-ready persistence boundaries
- no freeform layout engine in the public shell path yet


## 5. The local shell entry breakpoint spec must become an implementation input, not a reference note

### Why this matters
The new repo spec `docs/reference/shell/HB-Shell-Entry-Breakpoint-Spec.md` resolves an ambiguity the earlier package left open: the shell is not merely “responsive.” It is expected to preserve an **entry-state value hierarchy** across major device classes.

That means the shell must now reason about:
- practical usable shell width rather than raw device resolution
- first-lane visibility on initial load
- conditional two-column first-lane behavior
- portrait and handheld single-column fallbacks
- narrowest stable nested modes for early-entry occupants

### Immediate shell implication
The shell should define named entry states aligned to the spec’s practical targets, for example:
- ultrawide desktop
- standard desktop baseline
- tablet landscape
- tablet portrait
- phone portrait
- short-height constrained

The exact names may differ, but the shell must stop treating “desktop / tablet / mobile” as vague CSS vibes.

### Important boundary
The spec includes the independent hero and the adjacent top-actions layer.

This package still remains post-hero and shell-only.

So the correct interpretation is:
- do **not** move the hero into `hbHomepage`
- do **not** turn this package into a broad quick-links redesign
- **do** make shell decisions that preserve the spec’s first-screen value-density goals by ensuring the first shell lane is structured and sized appropriately after those adjacent layers

### Governance consequence
These entry-state rules should be treated as partly protected shell decisions, not as casual future admin toggles. In particular:
- tablet portrait and handheld single-column first-lane fallback
- conditional two-column first-lane behavior
- dominant-first-lane hierarchy
- narrow-state shell-fit restrictions for occupants
should not be left to arbitrary downstream configuration.

## 6. “First lane” should be treated as a real shell concept

### Why this matters
The spec repeatedly distinguishes the **first shell lane** from generic downstream content. That distinction matters because the entry experience is where hierarchy, value density, and shell-fit failures are most visible.

### Immediate shell implication
The registry / preset model should not only know about bands and slots in the abstract. It should know which band is the **entry band / first lane**, because that band needs stronger policy:
- visible on first load
- dominant-left or single-column guidance where applicable
- stricter slot comfort rules
- tighter compatibility requirements than lower-priority downstream bands

### Avoid
Do not let a future preset system make the first lane indistinguishable from every later lane. The spec clearly expects stronger guardrails there.

## 7. Breakpoint closure proof must use practical shell targets

### Why this matters
The spec’s matrix explicitly distinguishes raw device resolutions from practical shell design targets after SharePoint chrome, browser chrome, zoom, and safe-area effects.

### Immediate shell implication
Closure proof should target the practical shell widths and constrained-height conditions, not just generic browser widths.

That means shell validation should prove behavior at representative usable-width bands rather than claiming “mobile works” because a viewport was resized loosely.
