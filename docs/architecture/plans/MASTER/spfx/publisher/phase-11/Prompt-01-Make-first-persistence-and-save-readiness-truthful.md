# Prompt 01 — Make first persistence and save readiness truthful

## Objective
Close the live mismatch between:
- the Publisher shell's current **Save draft** affordance, and
- the actual tenant-required persistence model for `HB Articles`.

This prompt is **not** about redesigning the whole workflow.
It is about making the existing first-persistence boundary operationally truthful in the live application.

---

## Repo-truth current state

The current repo already contains a more mature persistence seam than the earlier remediation package acknowledged:

- `emptyArticle()` still seeds a brand-new draft with blank values for several tenant-required `HB Articles` fields
- `useDraftLifecycle.handleSave()` resolves a template, derives defaults/slug, and uses `createDraftSaveOrchestrator()` to persist the master row plus child rows
- the save flow already has truthful **partial-persistence** reporting when child writes fail after master save
- publish validation exists, but the shell still does not model **save readiness** explicitly enough before the user clicks **Save draft**
- in `ArticlePublisher.tsx`, **Save draft** is currently enabled whenever:
  - a draft exists
  - the app is not busy
  - the destination is not unsupported

That means the current shell still invites first persistence even when the master row is not genuinely ready for a truthful save attempt.

---

## Why this is wrong

This is a structural authoring trust problem.

The defect is not merely “SharePoint may reject bad input.”
The deeper problem is that the application still advertises a save action as if it were a normal in-progress authoring affordance, while the actual persistence model is the live required-field master list.

That creates three failures:

1. **Operator expectation drift**
   - the UI implies “save my in-progress work”
   - the backend seam actually means “attempt to persist a real master row”

2. **State-model drift**
   - publish readiness has a derived model
   - save readiness does not

3. **Accessibility / usability drift**
   - a disabled or failing save action without explicit, field-tied guidance is not a truthful authoring experience

---

## Governing authority / required reference docs

### Required repo references
- `docs/architecture/plans/MASTER/spfx/publisher/architecture/lists/publisher-list-schema-report.md`
- `apps/hb-publisher/src/webparts/articlePublisher/ArticlePublisher.tsx`
- `apps/hb-publisher/src/webparts/articlePublisher/controllers/draftPolicyHelpers.ts`
- `apps/hb-publisher/src/webparts/articlePublisher/controllers/useDraftLifecycle.ts`
- `apps/hb-publisher/src/webparts/articlePublisher/controllers/useReadinessController.ts`
- `apps/hb-publisher/src/data/publisherAdapter/draftSaveOrchestrator.ts`
- `apps/hb-publisher/src/data/publisherAdapter/publisherWriters.ts`
- `apps/hb-publisher/src/data/publisherAdapter/validation/validationEngine.ts`

### Research lenses to apply while implementing
Use the following concepts to improve the closure quality:
- explicit declarative UI states instead of scattered boolean gating
- field-level error identification and accessible error messaging
- avoid relying on disabled-only action affordances without explanatory guidance
- keep status messages truthful to what the system can actually persist

Do **not** add a brand-new workflow engine or second draft database unless exhaustive repo-truth review proves that gating the current first-persistence boundary cannot close the defect.

---

## Files and seams to inspect exhaustively
At minimum inspect and reconcile these seams together:

### Shell/action gating
- `apps/hb-publisher/src/webparts/articlePublisher/ArticlePublisher.tsx`
- any button-title / disabled-reason helper used by action buttons
- any readiness or diagnostics component that should narrate save-state truth

### Lifecycle/persistence
- `apps/hb-publisher/src/webparts/articlePublisher/controllers/useDraftLifecycle.ts`
- `apps/hb-publisher/src/data/publisherAdapter/draftSaveOrchestrator.ts`
- `apps/hb-publisher/src/data/publisherAdapter/publisherWriters.ts`

### Draft creation / default state
- `apps/hb-publisher/src/webparts/articlePublisher/controllers/draftPolicyHelpers.ts`

### Readiness / validation
- `apps/hb-publisher/src/webparts/articlePublisher/controllers/useReadinessController.ts`
- `apps/hb-publisher/src/data/publisherAdapter/validation/validationEngine.ts`

### Tests
- any existing test files covering:
  - `useReadinessController`
  - `useDraftLifecycle`
  - `ArticlePublisher`
  - `draftSaveOrchestrator`
  - validation behavior

---

## Exact defect to close
A brand-new draft can still be presented as saveable even though the required-field and template-resolution boundary for a truthful first persistence is not yet satisfied.

The app must stop advertising a casual “draft save” when the current state is actually “master-row persistence is not yet valid to attempt.”

---

## Required implementation objective
Implement a **truthful first-persistence model** for the current repo architecture.

### Required closure direction
Use the repo-compatible closure path:

- keep `HB Articles` as the authoritative persisted master record
- do **not** invent a second relaxed draft store
- instead, model and enforce first-persistence readiness explicitly in the shell

### The end state must do all of the following
1. **Make save readiness explicit**
   - derive a typed save-health state from the current draft and required environment inputs
   - do not leave save gating as a shallow `!!articleDraft && !busy && !unsupportedDestinationLoaded`

2. **Gate first persistence truthfully**
   - before the first successful master persistence, the shell must block save when required master-record conditions are not met
   - the user must be told exactly what is missing or why the environment is not ready

3. **Keep later save behavior honest**
   - once a row is legitimately persisted, preserve the current staged partial-persistence truth model
   - do not regress the existing `DraftSaveOutcome` handling

4. **Narrate the block clearly**
   - the right rail and/or status surface must explain why save is blocked
   - do not rely on a disabled button with no meaningful explanation

5. **Tie guidance to real fields**
   - missing `Subhead`, `SummaryExcerpt`, `BodyRichText`, `HeroPrimaryImage`, `HeroPrimaryImageAltText`, `TemplateKey` resolution prerequisites, and any other truly required first-save inputs must be explained in repo-truth terms
   - avoid generic “complete required fields” language if the shell can name the actual blockers

6. **Stay aligned with current publish validation**
   - save-readiness and publish-readiness can differ, but they must not contradict each other
   - do not let the shell imply that save is available for a state the system itself still considers structurally unready

---

## Strong implementation guidance

### Preferred implementation pattern
Introduce an explicit authoring/save-health model, for example a discriminated union or similarly explicit typed state, that can distinguish:
- no draft selected
- busy
- unsupported destination
- unsupported legacy content type, if applicable
- missing required first-persistence fields
- environment/bootstrap block
- ready for first persistence
- ready for subsequent persistence

Do not spread this across unrelated booleans if that leaves the shell logic ambiguous.

### UI guidance expectations
The shell should provide:
- a compact summary of why save is blocked
- field-specific or system-specific guidance that the author can act on
- accessible error exposure for affected fields or summaries where appropriate
- truthful button state and button reason text

### Accessibility expectations
Where save-blocking guidance is field-driven:
- use field-associated error messaging where practical
- expose invalid fields programmatically, not only visually
- make status/error announcements screen-reader discoverable
- do not assume color or button disablement alone is sufficient

### Scope guard
Do **not** turn this prompt into a general form redesign.
Only change the surfaces needed to make the save boundary truthful and actionable.

---

## Adjacent systems that must be reconciled
You must reconcile this prompt against:
- template resolution at save time
- readiness summary composition
- validation findings shown in the right rail
- status banner wording
- create-new draft behavior
- reload-after-partial-persistence behavior
- any helper comments that still describe a looser draft model than the live persistence boundary actually supports

---

## Validation and regression requirements
You must prove all of the following:

1. A brand-new draft can no longer hit a misleading first-save path.
2. The shell explains **why** first persistence is blocked.
3. Once a draft becomes first-save-ready, save can proceed normally.
4. Existing partial-persistence truthfulness is preserved:
   - master saved / child failed still reports accurately
   - server reload behavior still re-syncs authoritative state
5. Supported Project Spotlight authoring/publish behavior is not weakened.
6. Any new save-health logic is covered by targeted tests.

### Minimum test expectations
Add or update targeted tests that pin:
- first-save blocked for missing required fields
- actionable save-block messaging
- save enabled once minimum first-persistence criteria are satisfied
- no regression in partial-persistence outcome handling

If the most natural location is a new test file, create it.
Do not avoid tests because the current coverage is uneven.

---

## Required closure artifacts
Create a closure report in the Publisher closure docs that states:
- the chosen save-health model
- the exact first-persistence rule now enforced
- the shell surfaces changed
- the tests added/updated
- why this closure is consistent with the tenant-required `HB Articles` schema

The closure report must describe what is true **now**, not what might be done later.

---

## Mandatory operating instructions
- Work in the live local `hb-intel` repo.
- Treat the tenant schema authority as binding.
- Scrub the entire affected save/readiness path before changing anything.
- Do not make unrelated changes.
- Do not weaken existing supported Project Spotlight behavior.
- Do not reopen already-closed milestone/destination/scheduled work unless your code review proves an actual regression in this save path.
- Prove closure before moving to the next prompt.
- Do not re-read files already in active context unless needed to confirm drift, dependencies, or uncertainty after changes.
