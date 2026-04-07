# Prompt 03 — Full Inventory Search, Focus, and Dismissal Behavior

## Objective

Implement **full inventory search**, **focus management**, and **dismissal behavior** for the all-platforms layer so the overlay becomes a usable discovery surface without overreaching into later personalization work.

## Required stance

- repo truth first
- do not re-read files still in your current context unless needed
- use the normalized launcher seam as the source for search data
- keep search behavior scoped to broad inventory access, not advanced personalization
- do not let interaction complexity overwhelm the launcher hierarchy or SharePoint host safety

## Existing implementation context

Review at minimum:

- the Phase 01 normalized launcher model / adapter files
- the Phase 06 overlay contract files
- the Phase 06 overlay shell / index-row implementation from Prompt 02
- any local launcher helper files related to filtering, search, or overlay state
- `apps/hb-webparts/src/webparts/toolLauncherWorkHub/ToolLauncherWorkHub.tsx`

## What you must implement

Wire the overlay so it can:

- search the full platform inventory using normalized launcher metadata
- support matching against platform name, aliases / keywords, short descriptor, category, and related normalized fields
- display clear empty-result states when search resolves to nothing useful
- manage focus cleanly when the overlay opens and closes
- dismiss cleanly via the intended UI affordances and keyboard behavior

## Data handling requirements

Do not bind search behavior directly to raw SharePoint field names.

Use the normalized launcher seam to derive, at minimum:

- searchable display text
- aliases / keywords for matching
- descriptor / category metadata useful for result filtering
- visibility filtering before or during result shaping

If the normalized seam is missing a selector or derived helper needed for this phase, add it there rather than bypassing the seam.

## Required output

Produce a markdown file named:

- `phase-06-overlay-search-and-interaction-notes.md`

The file must include:

### 1. Search approach
How broad inventory matching is performed from normalized launcher data.

### 2. Focus / dismissal model
How the overlay behaves on open, close, and no-results states.

### 3. Accessibility notes
What was done to keep the overlay keyboard-usable and host-safe.

### 4. Deferred refinement
What remains for later phases.

## Coding expectation

Implement the full inventory search and interaction behavior in the repo and ensure the overlay is now usable as a broad inventory layer without turning into an overbuilt command palette.
