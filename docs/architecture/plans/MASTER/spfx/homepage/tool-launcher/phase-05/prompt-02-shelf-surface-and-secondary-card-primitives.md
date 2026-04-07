# Prompt 02 — Shelf Surface and Secondary Card Primitives

## Objective

Implement the **workflow shelf surface and secondary card primitives** so secondary launcher inventory has a premium but clearly subordinate visual language beneath the flagship stage.

## Required stance

- repo truth first
- do not re-read files still in current context unless needed
- keep shelf primitives local unless shared extraction is clearly justified
- preserve distinction between flagship cards and shelf cards
- do not create a second flagship stage under a different name
- do not collapse shelf cards into the existing grouped icon tile model

## Existing implementation context

Review at minimum:

- outputs of Prompt 01
- outputs of Phases 02–04
- current Tool Launcher local surface implementation
- any local launcher shell or primitive work already introduced in earlier phases
- `@hbc/ui-kit/homepage` primitives actually appropriate for homepage-safe composition

## Required work

Create or refine the shelf-level rendering surface and the medium-weight card family used inside shelves.

The shelf system should support:

- shelf header / label treatment
- clear section rhythm between shelves
- medium-emphasis secondary cards
- brand-aware or logo-aware display where supported
- whole-card click or clear launch CTA behavior
- optional low-weight descriptor / category / support metadata where appropriate

The card family must remain visually below the flagship stage in authority.

## Required output

Produce a markdown file named:

- `phase-05-secondary-card-surface-notes.md`

The file must include:

### 1. Shelf surface anatomy
How each shelf is structured.

### 2. Secondary card anatomy
What a shelf card contains and what it intentionally excludes.

### 3. Hierarchy protection
How shelf visuals remain subordinate to the flagship stage.

### 4. Degraded states
How missing logo or partial metadata is handled at the shelf-card level.

### 5. Promotion guidance
What should remain local vs what might later deserve shared extraction.
