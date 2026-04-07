# Prompt 01 — Utility Rail Contract and Support Model

## Objective

Define and implement the **utility-rail contract** for Tool Launcher / Work Hub so the right-side support region has a clear, limited purpose: support actions, support metadata, and quiet operational context that assists the launcher without competing with the flagship stage.

## Required stance

- repo truth first
- do not re-read files still in your current context unless needed
- preserve the Phase 01 normalized launcher seam and the Phase 02 shell
- preserve the Phase 03 flagship-stage hierarchy
- structure before micro-polish
- do not create a second launcher or noisy support dashboard

## Existing implementation context

Review at minimum:

- `apps/hb-webparts/src/webparts/toolLauncherWorkHub/ToolLauncherWorkHub.tsx`
- the Phase 01 launcher model / adapter files
- the Phase 02 launcher anatomy / shell files
- the Phase 03 flagship-stage files
- `apps/hb-webparts/src/homepage/ReferenceHomepageComposition.tsx`
- any local launcher helper or model files created during earlier phases

Also use the existing planning inputs already available in this workstream:

- Tool Launcher / Work Hub architecture and layout brief
- SPFx doctrine / homepage overlay
- seeded support and notice field expectations from the live list model

## What you must determine and lock

Define the utility-rail contract in terms of:

1. what content categories belong in the rail right now
2. what support metadata is required vs optional
3. what should render as a CTA versus quiet metadata
4. what suppression rules apply when support data is missing
5. what belongs in later phases instead of this rail

## Implementation requirement

Create or refine a local utility-rail surface / composition layer suitable for:

- help / support actions
- request-access actions
- support-owner references where justified
- notice / maintenance / outage treatment
- low-noise secondary utility content

This surface must:

- accept normalized launcher-derived data rather than raw SharePoint items
- remain clearly secondary to the flagship stage
- support clean suppression when no useful support content exists
- be ready for later refinement without redoing its core structure

## Required output

Produce a markdown file named:

- `phase-04-utility-rail-contract.md`

The file must include:

### 1. Current-state utility-rail gap
What the launcher is doing now vs what a real utility rail requires.

### 2. Utility-rail contract
Minimum and optional content blocks, hierarchy, and behavior.

### 3. Suppression and escalation rules
When the rail renders, when sections collapse, and what gets deferred.

### 4. Structural coding plan
Which local files or component boundaries should own the utility rail.

### 5. Guardrails
What must not happen during utility-rail work.

## Coding expectation

As part of this prompt, implement the utility-rail surface / contract in the repo so later prompts can wire real support data into it.
