# Prompt 01 — Launcher Anatomy and Desktop Skeleton Spec

## Objective

Define and implement the **desktop anatomy** for Tool Launcher / Work Hub as a premium marketplace launcher within the homepage Utility zone, using the Phase 01 launcher adapter seam rather than the legacy grouped config contract.

## Required stance

- repo truth first
- do not re-read files still in your current context unless needed
- composition first, not final polish first
- do not regress to equal-weight grouped quick links
- do not build fake shell chrome
- keep the launcher clearly subordinate to the Signature Hero while still premium and intentional

## Existing implementation context

Review at minimum:

- `apps/hb-webparts/src/webparts/toolLauncherWorkHub/ToolLauncherWorkHub.tsx`
- `apps/hb-webparts/src/homepage/ReferenceHomepageComposition.tsx`
- the Phase 01 launcher adapter / normalization outputs
- any local helper, model, or contract files added during Phase 01

Also use these planning inputs already available in this session/workstream:

- Tool Launcher / Work Hub architecture and layout brief
- tool launcher asset manifest
- SPFx doctrine / homepage overlay

## What you must determine and lock

Define the launcher anatomy in terms of **desktop regions**:

1. command band
2. primary launcher stage
3. secondary utility rail
4. workflow shelf area

For each region, document:

- purpose
- data dependency
- minimum viable desktop rendering requirement
- empty/partial-data fallback posture
- whether the region is required or suppressible

## Implementation requirement

Create or update a local launcher composition shell that makes these regions explicit in code.

This shell must:

- accept normalized launcher data or region-specific slices from the Phase 01 seam
- avoid hard-coding raw SharePoint field assumptions
- preserve homepage-safe spacing and hierarchy
- be ready for later phases to deepen visuals without redoing the structure

## Required output

Produce a markdown file named:

- `phase-02-launcher-anatomy-spec.md`

The file must include:

### 1. Current-state anatomy gap
What the existing Tool Launcher shape is doing now vs what the desktop skeleton needs.

### 2. Region model
Describe the four desktop regions clearly.

### 3. Required data per region
State which normalized launcher fields or slices each region depends on.

### 4. Structural coding plan
State which component or file boundaries should own each region.

### 5. Guardrails
Explain what must not happen during desktop skeleton work.

## Coding expectation

As part of this prompt, implement the anatomy shell or equivalent region-capable launcher wrapper in the repo so later prompts can build against it.
