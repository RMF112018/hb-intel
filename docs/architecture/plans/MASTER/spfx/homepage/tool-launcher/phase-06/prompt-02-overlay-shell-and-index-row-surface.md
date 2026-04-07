# Prompt 02 — Overlay Shell and Index-Row Surface

## Objective

Implement the **overlay shell** and **index-row / compact-result surface** for Tool Launcher / Work Hub so the broader platform inventory is exposed through a premium anchored layer rather than a generic modal or giant tile wall.

## Required stance

- repo truth first
- do not re-read files still in your current context unless needed
- preserve the Phase 01 normalized launcher seam
- use the Phase 02 launcher anatomy and desktop shell rather than inventing a parallel launcher
- preserve the Phase 03, Phase 04, and Phase 05 hierarchy decisions
- do not let the overlay become a second homepage hero or faux app shell

## Existing implementation context

Review at minimum:

- the Phase 01 normalized launcher adapter/model files
- the Phase 02 launcher shell files
- the Phase 03 flagship-stage files
- the Phase 04 utility-rail files
- the Phase 05 workflow-shelf files
- the Phase 06 overlay contract files created in Prompt 01
- `apps/hb-webparts/src/webparts/toolLauncherWorkHub/ToolLauncherWorkHub.tsx`

## What you must implement

Create or refine a local overlay / drawer / panel shell that can:

- open from the launcher’s all-platforms entry point
- contain the full inventory index surface
- host search input and results cleanly
- close predictably without disrupting the homepage composition
- remain visually subordinate to the flagship stage and consistent with the Utility zone

Also implement the index-row or compact-result primitive for platform inventory.

That result surface should support:

- platform logo or fallback treatment
- platform name
- short descriptor
- optional quiet metadata such as category or audience tag where helpful
- direct-launch CTA or row-level launch affordance

Do **not** reuse flagship cards for this layer.
Do **not** render the full inventory as another grouped tile grid.

## Required output

Produce a markdown file named:

- `phase-06-overlay-surface-notes.md`

The file must include:

### 1. Overlay shell choice
What shell pattern was selected and why it fits SharePoint host constraints.

### 2. Index-row surface choice
How the full inventory is rendered and why it stays subordinate to the flagship stage.

### 3. State model
How open, close, and base overlay state are managed.

### 4. Residual debt
What remains for Prompt 03 and later phases.

## Coding expectation

Implement the overlay shell and index-row / result surface in the repo so the launcher has a real all-platforms layer ready for search and interaction hardening.
