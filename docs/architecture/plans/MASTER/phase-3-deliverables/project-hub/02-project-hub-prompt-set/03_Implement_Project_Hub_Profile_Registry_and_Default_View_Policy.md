# Prompt 03 — Implement Project Hub Profile Registry and Role/Device Default View Policy

```text
You are acting as a senior routing, shell-composition, workspace-architecture, profile-governance, Project Hub, repo-truth, and implementation-readiness engineer for HB Intel.

## Objective
Implement a governed Project Hub default-view profile system that selects the correct Project Hub home shell by role and device class, while preserving one underlying project operating runtime.

## Critical Instruction
Do not re-read files that are already in your active context window or memory. Only open additional files when needed to close a concrete evidence gap.

## Required Context
Assume Prompt 01 validated the findings and Prompt 02 aligned the UI to `@hbc/ui-kit` doctrine.
Honor repo truth if the earlier prompts refined any assumptions.

## Core Requirement
Do not implement five unrelated pages with duplicate logic.
Implement a **single governed Project Hub runtime** with a **profile registry / resolver layer** that selects a default view profile by role + device + allowed override policy.

## Canonical Profile IDs
Implement support for these profile IDs:
- `hybrid-operating-layer`
- `canvas-first-operating-layer`
- `next-move-hub`
- `executive-cockpit`
- `field-tablet-split-pane`

## Spec Files
- `hybrid-operating-layer` → `docs/architecture/plans/MASTER/phase-3-deliverables/project-hub-ui/01_Project_Hub_Hybrid_Operating_Layer_Wireframe_Spec.md`
- `canvas-first-operating-layer` → `docs/architecture/plans/MASTER/phase-3-deliverables/project-hub-ui/02_Project_Hub_Canvas_First_Operating_Layer_Wireframe_Spec.md`
- `next-move-hub` → `docs/architecture/plans/MASTER/phase-3-deliverables/project-hub-ui/04_Project_Hub_Next_Move_Hub_Wireframe_Spec.md`
- `executive-cockpit` → `docs/architecture/plans/MASTER/phase-3-deliverables/project-hub-ui/05_Project_Hub_Health_Risk_Executive_Cockpit_Wireframe_Spec.md`
- `field-tablet-split-pane` → `docs/architecture/plans/MASTER/phase-3-deliverables/project-hub-ui/07_Project_Hub_Field_Tablet_Split_Pane_Hub_Wireframe_Spec.md`

## Default Policy To Implement
Use this as the default policy unless repo truth requires a small refinement:

### Desktop / large laptop
- Portfolio Executive / Executive Reviewer / Executive leadership → `executive-cockpit`
- Project Executive → `hybrid-operating-layer`
- Project Manager → `hybrid-operating-layer`
- Superintendent → `next-move-hub` (or `hybrid-operating-layer` only if validated repo truth strongly requires that)
- Field Engineer → `next-move-hub`
- QA/QC → `canvas-first-operating-layer` or `next-move-hub`
- Safety leadership → `canvas-first-operating-layer`

### Tablet
- Superintendent / Field Engineer / QA/QC / field-oriented Safety → `field-tablet-split-pane`
- Executive leadership → `executive-cockpit` tablet variant
- PM / PE → `canvas-first-operating-layer` or a governed hybrid tablet variant based on repo-truth fit

### Narrow / fallback
- prefer `canvas-first-operating-layer` or a compact `next-move-hub`

## Implementation Requirements
1. Create a Project Hub profile registry.
2. Create a role/device resolver.
3. Separate shell profile composition from tile/runtime composition.
4. Implement profile persistence keyed strongly enough to prevent profile collisions across role/device/project contexts.
5. Support user override only where policy allows; do not let personalization destroy mandated operational behavior.
6. Keep the system maintainable and auditable.

## Strong Recommendations To Follow
Implement or adapt a structure equivalent to:
- Project Hub profile registry
- Project Hub profile resolver
- Project Hub region/shell contracts
- Project Hub persistence for profile/layout state
- strong typing for profile IDs, region IDs, device classes, and role mappings

## Required Profile Characteristics
Each profile must declare or derive:
- `profileId`
- supported roles
- supported device classes
- default regions
- mandatory regions
- mandatory tiles / surfaces
- optional tiles / surfaces
- collapse rules
- interaction rules
- persistence keying / versioning behavior

## Do Not
- Do not copy-paste the full home implementation five times.
- Do not allow device detection to become brittle or hidden.
- Do not make project identity subordinate to profile identity.
- Do not let user customization remove mandatory operational surfaces.

## Deliverables
Produce and implement:

### 1. Profile System
The registry, resolver, types, and persistence needed for governed role/device default views.

### 2. Mapping Evidence
Show exactly where the role/device policy is encoded and how profile selection works.

### 3. Upgrade Notes
Document any places where the current route/page architecture had to be refactored to support shell profiles cleanly.

## Acceptance Criteria
This prompt is complete only when:
- the five canonical profile IDs exist in a governed system,
- role/device default selection is implemented and testable,
- profile persistence is deterministic,
- the solution uses one underlying Project Hub runtime rather than five fragmented implementations.
```
