# Prompt 05 — Project Spotlight Supporting Rail and Team Strip Refinement

## Objective

Refine the subordinate surfaces so they feel like premium gallery/navigation and human-context layers rather than list rows and utility UI.

---

## Required work

### A. Supporting rail refinement
Upgrade the supporting rail so it feels like curated gallery navigation.

Required outcomes:
- stronger thumbnail presence
- better internal spacing and hierarchy
- less list-row feel
- premium hover / active behavior
- still clearly subordinate to the featured project

### B. Team strip refinement
Refine the team strip so it feels intentional and human.

Required outcomes:
- better inline label/copy
- improved avatar overlap/ring treatment
- warmer, more polished inline presentation
- preserve avatar-strip + flyout architecture

### C. Team flyout refinement
Refine the team detail panel so it feels elegant and lightweight.

Requirements:
- preserve accessibility and focus behavior
- preserve mobile bottom-sheet fallback
- avoid modal heaviness
- support missing-photo fallback cleanly

---

## Architectural notes

The target architecture explicitly calls for:
- lightweight supporting spotlight tiles
- integrated project team strip
- flyout detail layer
- restrained motion

Align to that architecture directly.

---

## Deliverables

### 1. Files changed
### 2. Rail refinement summary
### 3. Team strip / flyout refinement summary
### 4. Validation
At minimum:
- typecheck/build
- proof the rail remains subordinate
- proof team interaction still works on desktop and mobile
- no accessibility regression

---

## Hard constraints

- Do not add unrelated new content blocks.
- Do not increase metadata density.
- Do not detach the team surface from the featured project.
