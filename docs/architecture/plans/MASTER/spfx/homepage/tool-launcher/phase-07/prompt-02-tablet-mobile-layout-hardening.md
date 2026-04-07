# Prompt 02 — Tablet / Mobile Layout Hardening

## Objective

Implement the **tablet and mobile layout hardening** for Tool Launcher / Work Hub so the launcher remains premium, scannable, and hierarchy-driven outside the ideal desktop width.

## Required stance

- repo truth first
- do not re-read files still in your current context unless needed
- preserve the Phase 01 normalized launcher seam
- preserve the responsive contract created in Prompt 01
- preserve flagship hierarchy and the additive role of the utility rail, shelves, and overlay
- do not convert the launcher into a generic stacked quick-links column

## Existing implementation context

Review at minimum:

- the responsive contract and any code created in Prompt 01
- the current launcher composition shell files
- flagship-stage components
- utility-rail components
- workflow-shelf components
- all-platforms overlay trigger / entry files
- local launcher style modules and helper files

## What you must implement

Apply the breakpoint plan to real launcher regions, including:

1. command band behavior on tablet and mobile
2. flagship stage column reduction, stacking, or card resizing rules
3. utility rail repositioning or compression rules
4. workflow shelf row / grid / stack behavior
5. all-platforms trigger visibility and placement
6. safe spacing, line-length, and density adjustments for narrower widths

## Hard constraints

- the flagship stage must still read as primary
- the utility rail must remain clearly secondary
- the shelves must stay curated and categorized
- the launcher must not devolve into a giant list of equal-weight tiles
- mobile behavior must not assume a separate standalone page unless already present in repo truth

## Required output

Produce a markdown file named:

- `phase-07-tablet-mobile-hardening.md`

The file must include:

### 1. What changed
Summary of the regional layout changes by breakpoint.

### 2. Region-by-region behavior
Command band, flagship stage, utility rail, shelves, and overlay trigger.

### 3. Remaining layout debt
Anything intentionally deferred to later phases.

### 4. Validation notes
How tablet/mobile behavior was checked.

## Coding expectation

As part of this prompt, implement the actual tablet and mobile hardening in the repo, including any local CSS/module/style adjustments and component refinements needed to make reduced-width behavior credible and stable.
