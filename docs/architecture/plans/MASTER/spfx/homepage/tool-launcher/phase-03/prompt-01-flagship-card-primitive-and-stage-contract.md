# Prompt 01 — Flagship Card Primitive and Stage Contract

## Objective

Define and implement the **flagship platform card primitive** and the **featured-stage contract** for Tool Launcher / Work Hub so featured platforms render with materially greater authority than workflow shelf entries.

## Required stance

- repo truth first
- do not re-read files still in your current context unless needed
- preserve the Phase 01 normalized launcher seam and Phase 02 composition shell
- structure before micro-polish
- do not regress to grouped quick links wearing nicer CSS
- do not create a second hero or faux shell

## Existing implementation context

Review at minimum:

- `apps/hb-webparts/src/webparts/toolLauncherWorkHub/ToolLauncherWorkHub.tsx`
- the Phase 01 launcher model / adapter files
- the Phase 02 launcher anatomy / shell files
- `apps/hb-webparts/src/homepage/ReferenceHomepageComposition.tsx`
- any local launcher helper or model files created during earlier phases

Also use these planning inputs already available in this workstream:

- Tool Launcher / Work Hub architecture and layout brief
- tool-launcher asset manifest
- SPFx doctrine / homepage overlay

## What you must determine and lock

Define the featured-stage contract in terms of:

1. which launcher records qualify for the flagship stage
2. what data the flagship stage requires vs what is optional
3. what the flagship card primitive renders at minimum
4. what the degraded state looks like when data is incomplete
5. what interaction behaviors belong to flagship cards now vs later phases

## Implementation requirement

Create or refine a local launcher surface / primitive suitable for featured platforms.

This primitive must:

- accept normalized featured launcher records rather than raw list items
- support logo-led rendering without assuming every record has perfect assets
- support a primary CTA posture
- support optional short descriptor and status/notice metadata
- remain clearly distinct from workflow shelf cards
- be ready for later refinement without redoing its core structure

## Required output

Produce a markdown file named:

- `phase-03-flagship-stage-contract.md`

The file must include:

### 1. Current-state featured-stage gap
What the current launcher rendering is doing now vs what a true flagship stage requires.

### 2. Flagship card contract
Minimum and optional fields, hierarchy, and behavior.

### 3. Stage qualification rules
How items become featured-stage entries.

### 4. Structural coding plan
Which local files or component boundaries should own the flagship card and stage.

### 5. Guardrails
What must not happen during flagship-stage work.

## Coding expectation

As part of this prompt, implement the flagship card primitive and featured-stage contract in the repo so later prompts can wire real featured data into it.
