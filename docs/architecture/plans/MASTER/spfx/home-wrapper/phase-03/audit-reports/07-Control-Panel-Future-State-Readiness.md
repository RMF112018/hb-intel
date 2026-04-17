# Control-Panel Future-State Readiness

## Executive judgment

The codebase is now **partially ready** for the future tenant-maintainer homepage control panel.

The important shift is that the shell now contains real governance primitives in code, not just intent in documents.

But it is still missing the persisted and authoring-facing seams that would make that future safe and practical.

## 1. What already prepares the shell for that future

### Preset model
The shell already has approved presets.

That is the right starting point for governed layout editing because it gives the future maintainer:
- bounded choice
- safe defaults
- predictable composition grammar

### Slot and band model
The shell already has:
- semantic bands
- slots
- slot roles
- occupant metadata

That is exactly the structure a future control panel should build on.

### Protected vs configurable decisions
This is one of the strongest current foundations.

The code already distinguishes:
- what must remain system-authored
- what may later be configurable

That is essential for avoiding homepage entropy.

### Diagnostics and validation
The shell already validates layout input and produces diagnostics.
That is the right seam for future preview and save validation.

## 2. What would block or complicate that future today

### No persisted configuration layer
There is no live persisted layout/configuration model yet.
Without that, the control panel has nothing authoritative to read or write.

### No maintainer-facing authoring surface
The shell has policy and validation, but no UI for:
- previewing presets
- toggling occupants
- reordering within safe bounds
- viewing incompatibility warnings
- understanding breakpoint implications

### Capability model is under-enforced
Some metadata exists but is not yet fully honored in runtime layout behavior.

If a future control panel arrived today, it would expose more choice than the shell can currently enforce with confidence.

### Full entry-stack governance is still external
A layout editor that only edits `hbHomepage` but not the hero/actions relationship would still leave the most important first-fold behavior partially outside its scope.

## 3. What should be established now

### A. Persisted shell layout contract
Add a canonical persisted representation for:
- preset ID
- optional occupant visibility
- safe slot overrides
- effective version / migration info

### B. Preview-safe validation engine
Before any layout is saved, validate:
- prohibited pairings
- first-lane rules
- recognition ceiling
- breakpoint fit
- inactive-candidate restrictions

### C. Approved footprint modes
Occupants should advertise supported modes such as:
- full
- major
- minor
- compact
- summary-collapse

The control panel should expose only supported combinations.

### D. Entry-stack governance boundary
The system should formally define which decisions belong to:
- hero
- actions band
- shell body

and which can be jointly previewed.

## 4. What should eventually be maintainer-configurable

- preset selection
- optional visibility of approved non-core occupants
- limited reorder inside compatible semantic bands
- approved emphasis modes for campaign-style homepage periods
- action budget references and overflow behavior metadata
- compact vs standard treatment where a surface explicitly supports it

## 5. What should remain code-governed

- hero independence and flagship role
- first shell lane must begin on first load
- phone/tablet single-column rules
- prohibited pairings
- recognition ceiling
- inactive-candidate gating
- fallback/error behavior
- manifest and host-runtime constraints

## 6. Prepare-now / implement-later work

### Belongs in the current wave
- persisted shell layout schema
- stronger occupant capability enforcement
- better wide-state behavior
- first-lane policy correction for Project Spotlight
- explicit preview/validation seam

### Belongs in a later wave
- maintainer-facing editor UI
- live preview of breakpoint states
- approval/publish workflow for homepage layout changes
- richer preset analytics and experimentation support

## 7. Net readiness verdict

The shell is no longer missing the conceptual foundations for a future control panel.

It is now missing the **productization layers**:
- persistence
- preview
- authoring UI
- stronger capability enforcement

That is a much better problem to have.
