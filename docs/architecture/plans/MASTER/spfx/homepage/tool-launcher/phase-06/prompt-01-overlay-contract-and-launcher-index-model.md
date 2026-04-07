# Prompt 01 — Overlay Contract and Launcher Index Model

## Objective

Define and implement the **all-platforms overlay / index contract** for Tool Launcher / Work Hub so the full platform inventory is exposed through a structured secondary surface driven by normalized launcher data rather than by ad hoc rendering logic.

## Required stance

- repo truth first
- do not re-read files still in your current context unless needed
- preserve the Phase 01 normalized launcher seam and the Phase 02 launcher shell
- preserve the Phase 03 flagship hierarchy, Phase 04 utility rail, and Phase 05 workflow shelves
- structure before micro-polish
- do not create a separate faux app or full-page directory in this phase

## Existing implementation context

Review at minimum:

- `apps/hb-webparts/src/webparts/toolLauncherWorkHub/ToolLauncherWorkHub.tsx`
- the Phase 01 launcher model / adapter files
- the Phase 02 launcher anatomy / shell files
- the Phase 03 flagship-stage files
- the Phase 04 utility-rail files
- the Phase 05 workflow-shelf files
- `apps/hb-webparts/src/homepage/ReferenceHomepageComposition.tsx`
- any local launcher helper or model files created during earlier phases

Also use the existing planning inputs already available in this workstream:

- Tool Launcher / Work Hub architecture and layout brief
- SPFx doctrine / homepage overlay
- seeded platform field expectations from the live list model

## What you must determine and lock

Define the overlay / index contract in terms of:

1. what normalized launcher records are eligible for the full inventory layer
2. what fields the index surface requires vs treats as optional
3. how broad inventory rows differ from flagship cards and workflow shelf cards
4. what ordering rules apply to the all-platforms view
5. what suppression or fallback behavior applies to invalid / incomplete rows

## Implementation requirement

Create or refine the launcher-side contract needed for:

- the all-platforms entry point
- the overlay shell input model
- full inventory row derivation
- inventory ordering and visibility filtering
- empty / no-results states

This contract must:

- accept normalized launcher-derived data rather than raw SharePoint items
- remain compatible with earlier launcher hierarchy decisions
- be ready for later search refinement without redoing the base structure
- stay local to homepage / launcher code unless shared extraction is clearly justified

## Required output

Produce a markdown file named:

- `phase-06-overlay-contract.md`

The file must include:

### 1. Current-state inventory gap
What the launcher is doing now vs what a real all-platforms layer requires.

### 2. Overlay / index contract
Minimum and optional fields, hierarchy, and derivation rules.

### 3. Ordering and suppression rules
How full inventory ordering is resolved and how invalid rows are handled.

### 4. Structural coding plan
Which local files or component boundaries should own the overlay / index logic.

### 5. Guardrails
What must not happen during all-platforms work.

## Coding expectation

As part of this prompt, implement the overlay / index contract in the repo so later prompts can render and search the full inventory without bypassing the normalized launcher seam.
