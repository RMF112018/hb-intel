# Prompt-11C-01 — Tool Launcher Presentation Model and Data Hardening

## Objective

Execute **Phase 11C** for the Tool Launcher / Work Hub.

This phase corresponds to the previously defined **Phase 02**.

Your job is to harden and enrich the presentation model and adjacent data behavior so the rebuilt launcher is driven by strong product logic instead of thin normalization, alphabetical defaults, and mechanical rendering.

This phase should improve the data-to-UI foundation without collapsing into a broad feature rewrite.

---

## Required Pre-Read

Use these first:

- `docs/architecture/reviews/tool-launcher/phase-11a-tool-launcher-rebuild-readme.md`
- `docs/architecture/reviews/tool-launcher/phase-11a-tool-launcher-rebuild-change-boundaries.md`
- `docs/architecture/reviews/tool-launcher/phase-11a-tool-launcher-rebuild-validation-checklist.md`
- `docs/architecture/reviews/tool-launcher/phase-11b-composition-rearchitecture-summary.md`
- `docs/architecture/reviews/tool-launcher/phase-11b-composition-rearchitecture-validation.md`
- `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Governing-Standard.md`

Then inspect the relevant Tool Launcher data seams, especially:

- `apps/hb-webparts/src/homepage/data/toolLauncherNormalization.ts`
- `apps/hb-webparts/src/homepage/data/toolLauncherListSource.ts`
- `apps/hb-webparts/src/homepage/data/useToolLauncherData.ts`
- `apps/hb-webparts/src/homepage/webparts/toolLauncherContracts.ts`
- relevant Tool Launcher rendering files under `apps/hb-webparts/src/webparts/toolLauncherWorkHub/`

Do not re-read files that are already in current context or memory.

---

## Phase Goal

Strengthen the Tool Launcher data foundation so the UI is driven by durable, curated, and future-ready presentation logic.

The output of this phase should support:

- better ordering
- better grouping
- richer support for future discovery behaviors
- clearer handling of stale / reviewed / support metadata
- better audience handling
- stronger derivation contracts for flagship, shelves, support/status, and discovery surfaces

---

## Required Focus Areas

### 1. Presentation-model quality
Review and improve the derivation logic so the launcher is not overly dependent on:
- alphabetical group ordering
- simplistic shelf ordering
- flat featured treatment
- thin support summaries
- purely mechanical category grouping

Introduce stronger curated presentation rules where justified.

### 2. Audience / visibility logic
Investigate the current posture around:
- `AudienceVisibility`
- `AudienceRulesJSON`
- any unresolved or partially implemented audience logic

If `AudienceRulesJSON` is selected but not meaningfully used, either:
- implement an appropriate bounded role in the presentation pipeline, or
- formally narrow it out of active runtime expectations with clear documentation and code cleanup.

Do not leave critical data seams in ambiguous half-state.

### 3. Review / freshness / governance cues
Determine how the current governance fields should influence presentation behavior:
- `RequiresReview`
- `LastReviewedOn`
- support-owner metadata
- tenant/environment labeling where applicable

You do not need to fully surface every field visually in this phase, but the presentation model should become capable of supporting future UX decisions about freshness, support emphasis, and trust cues.

### 4. Discovery readiness
Prepare the model so later discovery phases can support:
- favorites
- recent launches
- recommended tools
- support-owner assisted discovery
- category and workflow filtering
- ranked results

Do not fully implement those product features unless narrowly required, but ensure the contracts and derivations are not blocking them.

### 5. List-source robustness
Review the current fetch posture, including result completeness and scale considerations.

At minimum, evaluate:
- `$top=100`
- whether paging is required
- any missing protections around malformed responses
- whether caching behavior is still appropriate after the rebuild workstream

Implement bounded improvements where needed.

---

## Preserve These Seams

Preserve unless there is a narrow, justified reason to adjust them:

- the live SharePoint list-driven model
- the normalized contract boundary
- the mount/runtime seam
- current launch behavior
- the composition work already completed in 11B

Do not regress working runtime behavior while hardening the data foundation.

---

## Required Deliverables

### 1. Code changes
Update the relevant Tool Launcher data and presentation files, likely including:
- `apps/hb-webparts/src/homepage/data/toolLauncherNormalization.ts`
- `apps/hb-webparts/src/homepage/data/toolLauncherListSource.ts`
- `apps/hb-webparts/src/homepage/data/useToolLauncherData.ts`
- `apps/hb-webparts/src/homepage/webparts/toolLauncherContracts.ts`
- any narrowly related launcher files under `apps/hb-webparts/src/webparts/toolLauncherWorkHub/`

### 2. Summary document
Create:
`docs/architecture/reviews/tool-launcher/phase-11c-presentation-model-and-data-hardening-summary.md`

This file must describe:
- what contracts changed
- what derivation logic changed
- what data seams were preserved
- what ambiguous seams were resolved
- what later phases are now unblocked

### 3. Validation document
Create:
`docs/architecture/reviews/tool-launcher/phase-11c-presentation-model-and-data-hardening-validation.md`

This file must describe:
- what behaviors were validated
- how audience handling was validated
- whether list completeness and result handling were checked
- whether any compatibility or migration concerns remain
- what later phases still need to surface visually

---

## Validation Expectations

Before concluding, validate at minimum:

- live list-driven data still renders correctly
- no regressions to launch behavior
- featured / shelf / index derivations still work
- audience filtering is clearer and not left in ambiguous half-state
- support and governance metadata are handled coherently
- list fetch behavior is appropriate for expected scale
- build still passes cleanly
- no obvious regressions to loading / empty / fallback states

---

## Important Constraints

- Do not re-read files that are already in current context or memory.
- Do not widen into full search/discovery UX implementation; that belongs to 11E.
- Do not turn this into a full support/status rebuild; that belongs to 11F.
- Do not regress composition work completed in 11B.
- Do not leave ambiguous data seams unresolved if they materially affect future phases.

---

## Required Completion Notes

When finished, provide concise completion notes covering:

- files changed
- files created
- contracts / derivation changes
- ambiguous data seams resolved
- validation performed
- build status
- recommended next phase
- residual issues for later phases

---

## Final Instruction

Execute **Phase 11C** as the Tool Launcher presentation-model and data-hardening phase.

Strengthen the data-to-UI contract so later phases can build on a stable, curated, product-ready foundation.
