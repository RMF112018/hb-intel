# Prompt 03 — Project Spotlight Supporting Rail and Hierarchy Enforcement

## Objective

Add the supporting spotlight rail and enforce the final featured-vs-secondary hierarchy on desktop.

The purpose of this phase is to complete the desktop composition without allowing the secondary items to compete with the featured spotlight.

## Prerequisite

Complete Prompt 02 first.

Carry forward the approved featured surface without weakening it.

Do **not** re-read files already in your current context or memory unless they changed, your context is stale, or the task scope expanded.

## Required Product Outcome

Project Spotlight should now read as:

- one dominant featured project
- one clearly secondary supporting rail
- a curated editorial project storytelling surface

It must **not** read as:

- a balanced card grid
- an equal-weight project gallery
- a generic SharePoint thumbnail module

## Required Supporting Rail Behavior

The supporting rail should:

- contain 3–5 items
- use lighter image-led tiles
- show project name
- show a compact metadata line
- optionally show a milestone chip
- use whole-tile click targeting
- remain visually subordinate to the featured surface

## Specific Implementation Work

### 1. Implement the supporting tile
Create the supporting spotlight item shell with minimal but useful information.

### 2. Implement the desktop rail
Place the supporting items in the approved desktop composition, subordinate to the featured spotlight.

### 3. Enforce hierarchy
Adjust sizing, spacing, text scale, and image treatment so the featured spotlight remains the undeniable primary story.

### 4. Build narrow-width fallback logic
Where appropriate, prepare the composition to degrade safely without fully implementing all responsive behavior yet.

### 5. Keep supporting content disciplined
Do not let supporting tiles accumulate extra labels, CTA clutter, or descriptive copy that competes with the feature.

## Required Deliverables

### A. Desktop Composition Summary
Explain how the full featured + supporting composition now works.

### B. Hierarchy Enforcement Summary
State the exact design decisions that keep the supporting rail secondary.

### C. Reuse vs New Build Summary
State what was reused, what was added, and why.

## Validation Requirements

Before closing:

- verify the featured item is visually dominant on first scan
- verify supporting items are scannable but secondary
- verify the rail does not become cluttered
- verify the composition works with 3, 4, and 5 supporting items
- run the smallest credible lint/type/test validation for the touched scope

## Risk Exposure

Watch for:
- equal-weight visual balance
- too much text in supporting tiles
- oversized thumbnails
- rail clutter
- repeated CTA noise

## Standards / Best Practices

- hierarchy over symmetry
- supporting items as navigation, not co-headliners
- light metadata only
- no generic dashboard tile behavior
- keep the composition calm and premium

## Final Instruction

Do not implement the full Project Team interaction layer yet.

This prompt is complete only when the desktop composition clearly reads as one flagship story plus a supporting rail.
