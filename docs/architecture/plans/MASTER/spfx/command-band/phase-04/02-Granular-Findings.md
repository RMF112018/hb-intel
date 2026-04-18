# 02 — Granular Findings

## Finding 01 — Persisted identity, reorder trust, and save semantics are not actually closed

### Attached-package posture
The attached wave-02 package assumes structural correctness is already in place and focuses on later hardening.

### Repo-truth assessment
That assumption is false.

The live admin save path still maps drafts to persisted item IDs by **current array position** rather than a stable persisted identity. Reorder changes local item order, but `handleSave()` still constructs `{ itemId: resolvedItems[i]?.id, draft }`, and the dedicated `reorderPriorityRailItems()` seam exists but is not invoked by the admin. `handleArchiveItem()` performs an immediate archive mutation and local removal outside the buffered save/discard model.

### Why the current framing is insufficient
A validation-only prompt cannot close this. This is correctness, not polish.

### What is missing
- stable admin-side item identity model
- deterministic persisted reorder semantics
- explicit destructive-action workflow semantics
- writer coverage for combined add/edit/reorder/archive sequences
- regression tests for identity persistence after item movement

### Recommended action
Split out a first prompt dedicated to reopening structural closure for persisted identity and write trust.

### Implementation implications
Refactor the admin draft model around stable persisted IDs plus client-only draft IDs, route reorder through the correct writer or an equivalent authoritative save plan, and separate buffered edits from immediate destructive commands.

### Closure implications
No honest closure is possible until reorder/add/archive/edit sequences preserve the correct SharePoint rows and failure states do not silently desynchronize UI from storage.

---

## Finding 02 — The permission model exists on paper but is not integrated into the authoring runtime

### Attached-package posture
The wave-02 package does not explicitly revisit permission behavior.

### Repo-truth assessment
`priorityActionsAdminState.ts` defines `PriorityActionsPermissions`, but the live admin surface does not actually resolve or enforce those permissions in a meaningful authoring workflow.

### Why the current framing is insufficient
Permission handling is part of the maintainer-product contract and part of hosted proof requirements. It is not optional cleanup.

### What is missing
- permission resolution and consumption in the admin
- read-only / insufficient-permission UI states
- disabling or hiding destructive/publish actions for unauthorized users
- hosted proof for permission-state behavior

### Recommended action
Add an explicit admin productization prompt that includes permission-aware states and read-only treatment.

### Implementation implications
The admin must stop behaving as if every viewer is a full maintainer and must present clear capability-based affordances.

### Closure implications
Hosted proof remains incomplete until permission-state behavior is real.

---

## Finding 03 — The shared surface family still trails the command-band spec materially

### Attached-package posture
The original package treats the remaining UI work mostly as tokenization and visual uplift.

### Repo-truth assessment
The shared surface is still materially below the spec’s behavioral target.

Examples of drift:
- the surface variants are only `rail | grid | compact`
- overflow is still an inline expand/collapse section
- grouped / segmented behavior is not materially implemented
- device logic is viewport-based, not container-aware
- phone behavior does not implement a true sheet / overflow pattern
- shared types model group data, but the shared surface still renders a flat item list

### Why the current framing is insufficient
A token pass will not convert an underpowered interaction model into the intended command band.

### What is missing
- actual breakpoint-mode variants
- anchored overflow on larger breakpoints
- phone-specific overflow treatment
- grouping / segmented treatment
- container-aware shell fit
- material use of `@floating-ui/react` and `@radix-ui/react-scroll-area` where the spec expects them

### Recommended action
Add a dedicated prompt for rebuilding the shared surface and breakpoint/overflow system.

### Implementation implications
This is a shared-primitives change, not a local CSS tweak.

### Closure implications
The public rail cannot credibly meet the spec until overflow, breakpoint, and grouping behavior are purpose-fit.

---

## Finding 04 — Preview fidelity is not strong enough to support benchmark-grade closure

### Attached-package posture
The attached package mentions hosted proof and validation, but not preview/runtime parity as a first-class risk.

### Repo-truth assessment
The preview is not driven by the same full resolution logic as the public runtime:
- it derives visible vs overflow items by simple slice logic
- it collapses device modes into desktop/tablet/phone rather than the fuller public device model
- it does not flow through the same grouped/segmented/overflow semantics that the public surface is supposed to own

### Why the current framing is insufficient
A preview that only looks similar is not enough. The spec requires preview backed by the same shared surface family and truthful runtime behavior.

### What is missing
- parity between preview and public render-model construction
- preview use of the authoritative breakpoint/overflow logic
- proof that preview reflects real runtime semantics rather than approximations

### Recommended action
Expand the validation/runtime prompt to include preview/public parity as an explicit closure unit.

### Implementation implications
The preview should consume the same resolved render model or the closest practical shared pipeline, not a separate approximation.

### Closure implications
Admin hosted proof is weak unless preview fidelity is trustworthy.

---

## Finding 05 — Contract/runtime drift is broader than the attached validation prompt admits

### Attached-package posture
The original validation prompt says to validate supported icon keys and document or remove unsupported claims if needed.

### Repo-truth assessment
The drift is broader and more important than that:

- `IconKey` is stored, edited, and validated only superficially, but the public rail resolves icons from badge variant rather than an icon registry.
- Config layout modes (`segmented`, `hybrid`, `scroll`, `sheet-trigger`) are modeled but not materially executed.
- Group fields are modeled but not translated into grouped public structure.
- `OpenExternalInNewTabByDefault` is modeled at config level but not meaningfully applied end-to-end.
- `fetchPriorityActionsConfig(siteUrl, bandKey)` does not use `bandKey` in its network filter even though the function signature and schema model imply band-specific resolution.
- `normalizeItemRows()` silently drops duplicate `actionKey` rows instead of surfacing a data-integrity problem.

### Why the current framing is insufficient
This is not just “tighten a few validators.” It is a combined contract, query, normalization, preview, and runtime truth problem.

### What is missing
- explicit decision on which modeled fields must now become live behavior
- correction of network/query drift
- duplicate-detection handling strategy
- stronger validation and tests for unsupported or inconsistent states

### Recommended action
Replace the thin validation prompt with a broader contract/runtime alignment prompt.

### Implementation implications
Either implement the modeled behavior now or narrow the contract honestly. For an end-state package, the default posture should be to implement.

### Closure implications
No closure document should describe these modeled behaviors as real until the code actually honors them.

---

## Finding 06 — Validation and test coverage are too narrow for the current risk profile

### Attached-package posture
The original package calls for stronger validation and tests, but only at a high level.

### Repo-truth assessment
The current risk profile requires deeper proof than the existing framing implies.

High-risk areas needing explicit coverage:
- add/edit/reorder/archive identity persistence
- config row resolution by band key
- preview/public parity
- duplicate row handling
- icon/layout/group/runtime truth
- destructive-action failure handling
- container-aware breakpoint behavior

### Why the current framing is insufficient
A few validation-rule additions are not enough if the high-risk seams remain untested.

### What is missing
- writer and admin workflow tests
- parity tests between preview/public render models
- tests around duplicate data and partial configuration
- proof that invalid states block publish/save rather than merely decorate the UI

### Recommended action
Distribute test obligations directly into the structural, surface, and contract prompts instead of leaving testing as a generic afterthought.

### Implementation implications
Each prompt must define the exact regression tests it expects.

### Closure implications
Without targeted tests, “code-side closure” claims remain too easy to overstate.

---

## Finding 07 — Styling closure is real, but it is subordinate to reopened structural and behavioral gaps

### Attached-package posture
Prompt 01 focuses on token discipline and premium styling.

### Repo-truth assessment
That work is still necessary. The shared and admin CSS still use many hardcoded values and still read too much like safe enterprise panels.

However, styling cannot be allowed to hide unresolved product-model drift.

### Why the current framing is insufficient
A strong-looking UI can still be wrong, misleading, or internally inconsistent.

### What is missing
- stronger token/alias discipline
- removal of remaining hardcoded presentation values
- contrast / focus / reduced-motion proof
- visual redesign that follows corrected behavior rather than masking it

### Recommended action
Keep styling closure, but move it later in sequence and make it explicitly dependent on structural/runtime corrections already landing.

### Implementation implications
The styling prompt should be forceful and specific, but it should not be the first remediation prompt.

### Closure implications
Styling proof is only meaningful once the UI reflects the correct product model.

---

## Finding 08 — Hosted proof remains mandatory, but the repo also contains stale closure claims that must be corrected

### Attached-package posture
The original hosted-proof prompt focuses on screenshots, runtime checks, and manifest/runtime verification.

### Repo-truth assessment
That is still necessary, but it is under-scoped because the repo already contains phase-02 closure materials that claim effective code-side pass status and benchmark alignment.

Those docs now conflict with repo truth strongly enough that they can mislead future work.

### Why the current framing is insufficient
A hosted-proof prompt that captures screenshots but leaves inaccurate closure docs untouched still allows false closure.

### What is missing
- explicit review and correction of closure docs / scorecards / checklists
- manifest/runtime verification against actual host intent
- confirmation that proof-case seams and toolbox visibility settings are intentional
- honest hosted-proof deliverables, not checklist theater

### Recommended action
Rewrite the hosted-proof prompt so it also corrects stale closure artifacts and requires truthful final documentation.

### Implementation implications
This is both a runtime validation task and a documentation integrity task.

### Closure implications
Final acceptance must include accurate docs, not just images.

---

## Finding 09 — The attached package’s strongest idea is worth preserving: keep the package narrow and exacting

### Attached-package posture
Stay focused on the command-band subject matter and avoid unrelated repo drift.

### Repo-truth assessment
This is correct and should be preserved.

### Why the current framing is strong
Even after expanding the prompt count, the package should remain tightly bounded to the command-band end-state.

### What is worth preserving
- narrow scope
- no-deferral posture
- repo-truth grounding
- forceful closure standards
- emphasis on proof instead of rhetoric

### Recommended action
Carry that discipline forward into the enhanced package.

### Closure implications
The improved package should be deeper, not broader for its own sake.
