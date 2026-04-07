# Prompt 01 — Responsive Contract and Breakpoint Plan

## Objective

Define and implement the **responsive contract and breakpoint plan** for Tool Launcher / Work Hub so every launcher region has clear width-adaptation rules before deeper responsive polish is applied.

## Required stance

- repo truth first
- do not re-read files still in your current context unless needed
- preserve the Phase 01 normalized launcher seam and the Phase 02 launcher shell
- preserve the Phase 03 flagship hierarchy, Phase 04 utility rail, Phase 05 workflow shelves, and Phase 06 overlay / index layer
- structure before micro-polish
- do not invent a separate mobile product in this phase

## Existing implementation context

Review at minimum:

- `apps/hb-webparts/src/webparts/toolLauncherWorkHub/ToolLauncherWorkHub.tsx`
- the Phase 01 launcher model / adapter files
- the Phase 02 launcher anatomy / shell files
- the Phase 03 flagship-stage files
- the Phase 04 utility-rail files
- the Phase 05 workflow-shelf files
- the Phase 06 overlay / index files
- `apps/hb-webparts/src/homepage/ReferenceHomepageComposition.tsx`
- any local launcher helper, model, or styles files created during earlier phases

Also use the existing planning inputs already available in this workstream:

- Tool Launcher / Work Hub architecture and layout brief
- SPFx doctrine / homepage overlay
- seeded platform field expectations from the live list model

## What you must determine and lock

Define the responsive contract in terms of:

1. what launcher regions must remain visually primary at reduced widths
2. how the command band compresses or reflows
3. when the flagship stage shifts from side-by-side to stacked or reduced-column treatment
4. how the utility rail repositions or compresses without becoming noisy
5. how workflow shelves adapt without collapsing into a giant generic tile board
6. what happens to the all-platforms entry point and overlay trigger at each breakpoint
7. what should be hidden, suppressed, or simplified vs what must remain visible

## Implementation requirement

Create or refine the launcher-side responsive contract needed for:

- breakpoint tiers
- regional layout rules
- density adjustments
- spacing and ordering changes
- overlay trigger behavior at reduced widths
- author-safe no-data and partial-data fallbacks

This contract must:

- remain driven by the normalized launcher seam rather than raw SharePoint items
- preserve hierarchy rather than flattening it
- stay local to homepage / launcher code unless shared extraction is clearly justified
- be explicit enough that later prompts do not improvise width behavior ad hoc

## Required output

Produce a markdown file named:

- `phase-07-responsive-contract.md`

The file must include:

### 1. Current-state responsive gap
What the launcher is doing now vs what a hardened responsive launcher requires.

### 2. Breakpoint plan
Named width tiers and regional behavior rules.

### 3. Hierarchy preservation rules
What must remain primary vs what may compress or subordinate.

### 4. Structural coding plan
Which local files or component boundaries should own the responsive rules.

### 5. Guardrails
What must not happen during responsive hardening.

## Coding expectation

As part of this prompt, implement the responsive contract in the repo so later prompts can harden tablet, mobile, and authoring states without re-deciding the basic breakpoint system.
