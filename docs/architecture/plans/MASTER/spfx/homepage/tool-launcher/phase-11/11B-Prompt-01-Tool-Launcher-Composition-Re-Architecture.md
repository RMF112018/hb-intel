# Prompt-11B-01 — Tool Launcher Composition Re-Architecture

## Objective

Execute **Phase 11B** for the Tool Launcher / Work Hub.

This phase corresponds to the previously defined **Phase 01**.

Your job is to **rebuild the composition architecture** of the Tool Launcher so it behaves like a premium, visibly non-generic, SharePoint-hosted HB launcher surface.

This is the first implementation phase after the README / implementation-brief phase.

You must preserve the validated runtime seams and rebuild the weak surface composition.

---

## Required Pre-Read

Use these files first and treat them as controlling for this phase:

- `docs/architecture/reviews/tool-launcher/phase-11a-tool-launcher-rebuild-readme.md`
- `docs/architecture/reviews/tool-launcher/phase-11a-tool-launcher-rebuild-change-boundaries.md`
- `docs/architecture/reviews/tool-launcher/phase-11a-tool-launcher-rebuild-validation-checklist.md`
- `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Governing-Standard.md`

Then inspect the current Tool Launcher implementation under:

- `apps/hb-webparts/src/webparts/toolLauncherWorkHub/`
- `apps/hb-webparts/src/homepage/data/toolLauncherNormalization.ts`
- `apps/hb-webparts/src/homepage/data/useToolLauncherData.ts`
- `apps/hb-webparts/src/homepage/webparts/toolLauncherContracts.ts`
- `apps/hb-webparts/src/mount.tsx`

Do not widen the review beyond what is needed for this phase.

Do not re-read files that are already in current context or memory.

---

## Phase Goal

Replace the current timid composition with a stronger flagship launcher composition that:

- creates a clearer focal sequence
- gives the command surface real authority
- makes the featured region feel like a stage instead of a generic grid
- improves the support/status area so it reads as an intentional utility surface
- gives shelves better rhythm and structure
- uses SharePoint page canvas width more confidently
- remains host-safe
- remains authoring-safe

This phase is about **composition and surface architecture**, not full data-model redesign.

---

## Preserve These Seams

Preserve unless a narrow, well-justified refactor is required:

- live SharePoint list sourcing through the existing data seam
- normalized platform contracts
- presentation-model entry seam
- mount/runtime seam
- loading / empty / fallback protections unless they must be improved
- current launch behavior

Do not break these seams casually.

---

## Replace / Rebuild These Areas

You should expect to materially rebuild or replace, as needed:

- `LauncherCompositionShell`
- `LauncherCommandBand`
- `LauncherFlagshipStage`
- `LauncherUtilityRail`
- `LauncherWorkflowShelves`
- supporting composition wrappers and layout helpers
- any weak surface primitives that keep the outcome stuck in a timid card-grid posture

You may also refactor related subcomponents where necessary to support the new composition.

---

## Governing Composition Direction

Your rebuilt surface should move toward:

### 1. A real command surface
The top band should feel like the operating entry point for the launcher, not a faint toolbar.

It should have:
- stronger identity
- clearer action grouping
- more credible search placement
- improved support for “All Platforms” and “Need Help”
- premium but restrained interaction treatment

### 2. A real flagship stage
The featured area should not read like an undifferentiated auto-fill grid.

It should create:
- a visible primary focal area
- clear secondary launch surfaces
- better editorial rhythm
- stronger discovery value
- better above-the-fold confidence

### 3. A stronger support / status surface
The right-side or adjacent support/status region should feel intentional and useful, not like passive metadata accumulation.

It should better organize:
- notices
- request access
- help destinations
- support ownership
- partial-data degraded states

### 4. Better shelf composition
Workflow shelves should feel curated and useful, not like lightly styled leftovers.

They should have:
- stronger headings
- better spacing rhythm
- better relationship to the flagship stage
- credible secondary-launch behavior

### 5. Better canvas authority
The launcher should claim the SharePoint canvas with more confidence while still respecting the host.

Do not duplicate shell chrome.

Do not fake an app shell.

Do create a visibly premium, HB-owned content surface inside supported page-canvas reality.

---

## Doctrine Requirements

You must follow the SPFx governing doctrine, especially the requirements that:

- flagship surfaces must be visibly non-generic
- default Fluent-feeling card outcomes are not acceptable as the flagship answer
- design-safety-zone outcomes are prohibited
- structural rebuild is preferred over decorative refinement when materially underperforming
- SharePoint host constraints still apply
- authoring safety still applies

Do not claim compliance while delivering another thin-border white-card grid.

---

## Technical Expectations

### A. Scope discipline
Keep the work within the Tool Launcher domain unless a very small shared helper refactor is required.

### B. Runtime discipline
Preserve list-driven rendering and mount behavior.

### C. Primitive discipline
You may:
- extend existing launcher-specific primitives,
- introduce new launcher-owned primitives,
- wrap stronger `@hbc/ui-kit` exports where helpful,
- selectively bypass weak current patterns when needed.

Do not force this phase through weak existing wrappers if they materially limit the outcome.

### D. Search handling
Keep the existing search working, but this phase should not become the full search/discovery redesign.

### E. Accessibility
Preserve or improve keyboard, focus, and semantic behavior.

### F. Authoring
Ensure the rebuilt composition still behaves well:
- in edit mode
- with partial data
- with sparse support metadata
- when featured items are few
- when shelves are sparse
- when support/status sections are partially empty

---

## Required Deliverables

### 1. Code changes
Update the Tool Launcher composition implementation under:
- `apps/hb-webparts/src/webparts/toolLauncherWorkHub/`

### 2. Summary document
Create:
`docs/architecture/reviews/tool-launcher/phase-11b-composition-rearchitecture-summary.md`

This file must describe:
- the composition changes made
- what files were touched
- what was preserved
- what was replaced
- why the new composition is stronger

### 3. Validation document
Create:
`docs/architecture/reviews/tool-launcher/phase-11b-composition-rearchitecture-validation.md`

This file must describe:
- how the new composition was validated
- what degraded/partial states were checked
- whether host safety and authoring safety were maintained
- whether the build passed cleanly
- any residual issues that later phases should address

---

## Validation Expectations

Before concluding, validate at minimum:

- launcher still renders from live list-driven data seam
- launch links still work
- command surface is materially stronger
- featured region no longer reads as generic grid-first composition
- support/status is more intentional
- shelves feel subordinate but still premium
- empty/loading/error states still exist and are professional
- no obvious accessibility regressions
- project builds cleanly
- any package/build step needed for local proof is completed and documented

If a clean rebuild is required to verify the result, do it and document the exact command(s) used.

---

## Important Constraints

- Do not re-read files that are already in current context or memory.
- Do not drift into phase 11C data-model work unless strictly needed for this phase.
- Do not widen into a homepage-wide UI overhaul.
- Do not regress the live data seam.
- Do not settle for superficial styling changes.
- Do not preserve weak composition for the sake of minimal diff size.

---

## Required Completion Notes

When finished, provide concise completion notes covering:

- files changed
- files created
- preserve vs replace decisions actually implemented
- validation performed
- build / packaging status
- recommended next phase
- residual issues for later phases

---

## Final Instruction

Execute **Phase 11B** as a real composition re-architecture phase for the Tool Launcher.

Preserve the validated runtime seams.

Replace the weak current surface language and composition model with a stronger, premium, host-safe launcher composition consistent with the governing SPFx doctrine.
