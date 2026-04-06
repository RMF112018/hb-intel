# Prompt 06 — Project Spotlight Header, CTA, Authoring, and Property Pane Refinement

## Objective

Correct the section-level header and CTA behavior, align authoring controls to the SharePoint list-driven operating model, and clean up any property-pane/config seams that still assume the manifest hardcoded items are the primary source.

---

## Required work

### A. Header CTA correction
The section-level header action must not be implicitly tied to the featured item CTA.

Implement a clean section-level action model such as:
- `allProjectsLabel`
- `allProjectsUrl`

or another repo-consistent equivalent.

### B. Authoring model cleanup
Refine the authoring/config model so the webpart clearly treats the SharePoint list as the primary source.

Examples:
- heading / section-level CTA remain configurable
- list source and filtering options are explicit
- item-level inline manifest content is no longer the day-to-day authoring model

### C. Visibility and governance logic
Ensure the runtime respects:
- `HomepageEnabled`
- publish window
- audience filtering
- stale thresholds
- featured/item ordering rules

### D. Empty/error authoring states
Improve no-data / invalid-data states so they are doctrine-compliant and operationally helpful.

---

## Deliverables

### 1. Files changed
### 2. Header/CTA change summary
### 3. Authoring model summary
### 4. Validation
At minimum:
- typecheck/build
- proof section-level CTA is decoupled from featured item CTA
- proof list-governed runtime behavior is intact
- proof empty/error states remain clean

---

## Hard constraints

- Keep scope narrow to Project Spotlight authoring/config and related homepage helpers.
- Do not redesign the whole property-pane system if a narrow correction is enough.
