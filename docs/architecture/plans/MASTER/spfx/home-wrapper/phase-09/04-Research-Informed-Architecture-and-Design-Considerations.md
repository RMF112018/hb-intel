# Research-Informed Architecture and Design Considerations

## Why research matters here

The homepage shell is not just a code structure problem. It is a constrained-host composition problem that sits at the intersection of:
- responsive architecture,
- modular layout planning,
- intranet utility prioritization,
- and accessibility/reflow discipline.

## Research synthesis

### 1. Container-aware components should adapt to the space they actually inhabit
Modern frontend guidance favors components that respond to their **container context**, not only the global viewport. This is especially relevant when components may appear in main content, side lanes, or narrower host regions.

**Implication for HB Homepage:**  
The shell should not stop at internal container awareness. The whole entry experience should establish one authoritative measurement model that downstream child systems consume.

### 2. Responsive systems need fluid grids, multiple breakpoints, and content prioritization
Responsive design guidance emphasizes fluid grids, explicit breakpoints, progressive disclosure, and prioritization of important content when space tightens.

**Implication for HB Homepage:**  
A shell that only toggles between stack and one fixed paired pattern is too narrow. It needs a broader but governed set of recipes that prioritize content differently by entry state.

### 3. WCAG reflow expectations make horizontal overflow a hard failure for ordinary content
Reflow standards are clear that ordinary reading/content experiences should avoid two-dimensional scrolling at constrained widths and zoomed states.

**Implication for HB Homepage:**  
No closure is acceptable unless the homepage proves:
- no ordinary-content horizontal overflow,
- stable reflow at constrained widths,
- and safe behavior under zoom.

### 4. Component-level micro-layouts matter, not just page-level grids
Modern layout guidance emphasizes “micro layouts” within components and nested layouts that adapt to where the component is placed.

**Implication for HB Homepage:**  
Each hosted module needs a declared shell-fit contract and nested-mode behavior. The shell cannot assume a component can survive a narrow slot just because it has done so visually once.

---

## Research-driven recommendations

## Recommendation 01 — Establish entry-level container authority
Create a shared entry-experience context that computes:
- authoritative usable width,
- shell insets,
- host height constraints,
- entry state,
- density state,
- and visibility budgeting.

Consume that in both:
- launcher band,
- and shell layout logic.

## Recommendation 02 — Move from fixed layouts to governed recipe-based composition
Use a limited but meaningful library of shell recipes, such as:
- `feature-pair-spotlight`
- `editorial-2up-balanced`
- `editorial-2up-asymmetric`
- `feature-plus-utility-strip`
- `stacked-full`
- `stacked-compact-secondary`
- `single-column-fallback`

The goal is not infinite freedom.  
The goal is **controlled variety**.

## Recommendation 03 — Create explicit hosted-surface fit declarations
Each zone should declare:
- its safe narrowest stable width,
- whether it can appear in paired layouts,
- what nested render modes it supports,
- and what fallback behavior is required if the shell cannot place it safely.

## Recommendation 04 — Build proof into the shell system
Shell acceptance should require:
- width-state snapshots,
- slot-layout assertions,
- no-overflow assertions,
- launcher/shell state alignment checks,
- and screenshot evidence across key host widths and zoom states.

## Recommendation 05 — Use width more confidently without chasing visual excess
The answer is not “make everything huge.”
The answer is:
- reduce timid center-column behavior,
- allow richer asymmetry where safe,
- preserve a disciplined grid rhythm,
- and keep constrained hosts protected.

---

## Dependency and development concept guidance

## Additional dependencies
Do **not** add new dependencies casually.

This remediation can likely be completed using:
- existing React and TypeScript seams,
- current CSS module architecture,
- ResizeObserver-based measurement,
- existing validation/schema patterns,
- and browser-native container-query features where already supported in the project target environment.

## Helpful development concepts to add
These are recommended even if no new dependency is introduced:

1. **Shared entry-state context/provider**
2. **Named shell recipe registry**
3. **Per-occupant shell-fit contract types**
4. **Conformance assertion helpers**
5. **Screenshot / host-width evidence matrix**
6. **Protected recipe decisions for prohibited pairings**
7. **Preset schema hardening**

## Things to avoid
- uncontrolled layout freedom,
- visual-only closure,
- multiple competing width authorities,
- hidden fallback logic with no diagnostics,
- or allowing host apps to self-govern placement outside shell authority.

---

## Design principle summary

The target state is:

> a container-aware, host-resilient, width-confident, evidence-backed homepage shell that governs modular composition through explicit recipes and explicit hosted-surface fit contracts.
