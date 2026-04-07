# Prompt 02 — Featured Stage Rendering and Ordering

## Objective

Implement the **live featured-stage rendering** for Tool Launcher / Work Hub so featured platforms display in the flagship stage using the normalized launcher seam, with explicit ordering and clean suppression behavior.

## Required stance

- repo truth first
- do not re-read files still in your current context unless needed
- use the Phase 01 normalized launcher seam rather than raw SharePoint assumptions
- use the Phase 02 shell and Phase 03 flagship contract rather than inventing a parallel layout path
- preserve homepage-safe composition and host-aware behavior

## Existing implementation context

Review at minimum:

- the Phase 01 normalized launcher adapter/model files
- the Phase 02 launcher shell / flagship region implementation
- the Phase 03 flagship primitive / contract files created in Prompt 01
- `apps/hb-webparts/src/webparts/toolLauncherWorkHub/ToolLauncherWorkHub.tsx`

## What you must implement

Wire the featured stage so that it:

- pulls featured platform records from the normalized launcher model
- orders them by explicit featured sort logic first, then stable fallback ordering
- suppresses the flagship stage cleanly when no valid featured records exist
- preserves the command band, utility rail, and shelf scaffolds without reworking their phase scope
- produces a clearly primary stage at desktop width

## Data handling requirements

Do not bind directly to raw SharePoint field names.

Use the normalized launcher seam to derive, at minimum:

- featured records
- featured ordering
- descriptor text
- launch URL
- audience visibility / active eligibility if already normalized
- support for optional notice/status metadata where already present

If the normalized seam is missing a selector or derived helper needed for this phase, add it there rather than bypassing the seam.

## Required output

Produce a markdown file named:

- `phase-03-featured-stage-binding-notes.md`

The file must include:

### 1. Binding approach
How featured data is selected and ordered.

### 2. Suppression rules
When the stage renders vs collapses.

### 3. Data assumptions
What the stage assumes the normalized launcher seam provides.

### 4. Residual debt
What is deferred to later phases.

## Coding expectation

Implement the featured-stage binding in the repo and ensure the launcher now renders a real flagship stage from normalized live data rather than only grouped launcher groups.
