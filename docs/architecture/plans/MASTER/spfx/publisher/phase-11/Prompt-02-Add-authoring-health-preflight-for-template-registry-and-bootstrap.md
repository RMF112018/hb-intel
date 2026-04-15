# Prompt 02 — Add authoring-health preflight for template registry and bootstrap state

## Objective
Close the current blind spot where the Publisher surface can load, let an author begin work, and only later reveal that template/bootstrap state is unusable.

This prompt treats template-registry readiness as an **authoring health** problem, not just a later save/publish failure.

---

## Repo-truth current state

The live repo already proves that template resolution is a hard dependency:

- `useDraftLifecycle.handleSave()` resolves the system-managed template at save time
- `buildPublishResolutionContext()` reads the article, template registry, team, media, and binding before preview/publish
- if the template registry is empty or unreadable, the author only learns reactively through a later failure path
- the prior tenant extraction report recorded all publisher lists as empty at extraction time, so “environment exists but is not actually usable” is not hypothetical

The current shell does **not** treat this as a first-class preflight health state.

---

## Why this is wrong

This is wasted-work risk.

Without an early health model:
- the operator can start writing into an environment that cannot resolve templates
- later failures look like action-specific problems instead of environment/bootstrap unavailability
- save-readiness, preview-readiness, and publish-readiness can drift into reactive failure handling instead of proactive truthfulness

For an authoring surface, bootstrap state must be visible early enough to prevent surprise.

---

## Governing authority / required reference docs

### Required repo references
- `docs/architecture/plans/MASTER/spfx/publisher/architecture/lists/publisher-list-schema-report.md`
- `apps/hb-publisher/src/webparts/articlePublisher/ArticlePublisher.tsx`
- `apps/hb-publisher/src/webparts/articlePublisher/controllers/useDraftLifecycle.ts`
- `apps/hb-publisher/src/webparts/articlePublisher/controllers/useReadinessController.ts`
- `apps/hb-publisher/src/webparts/articlePublisher/workspace/useDraftWorkspace.ts`
- `apps/hb-publisher/src/data/publisherAdapter/publishResolutionContext.ts`
- `apps/hb-publisher/src/data/publisherAdapter/templateResolver.ts`
- any existing diagnostics/readiness/status surface used by the shell

### Research lenses to apply while implementing
Apply these concepts:
- make environment health a distinct explicit state, not a side effect
- keep error summaries actionable and specific
- expose status changes accessibly
- prefer early, truthful warnings over late action-specific surprises

---

## Files and seams to inspect exhaustively

### Health-state / shell surfaces
- `apps/hb-publisher/src/webparts/articlePublisher/ArticlePublisher.tsx`
- readiness / diagnostics surfaces
- status-banner surface
- any shell-level notice/banner components that can carry environment health

### Resolution/bootstrap seams
- `apps/hb-publisher/src/data/publisherAdapter/publishResolutionContext.ts`
- `apps/hb-publisher/src/webparts/articlePublisher/controllers/useDraftLifecycle.ts`
- `apps/hb-publisher/src/webparts/articlePublisher/workspace/useDraftWorkspace.ts`
- template-registry repository calls
- template resolver inputs and failure modes

### Tests
- any test files around resolution context, readiness, and shell rendering
- create new tests where current coverage does not pin the required behavior

---

## Exact defect to close
The application still lacks an explicit preflight health signal for:
- empty active template registry
- template-registry read failure
- other bootstrap conditions that make save/publish impossible before meaningful authoring can succeed

The author should not have to learn this only by clicking an action and failing later.

---

## Required implementation objective
Introduce an explicit, repo-truth-aligned **authoring health preflight** model.

### The end state must do all of the following
1. **Model template/bootstrap health explicitly**
   - at minimum distinguish:
     - loading
     - healthy / usable
     - empty active registry
     - registry read failure
     - draft-specific unresolved template match, where relevant

2. **Surface the problem early**
   - the shell must tell the operator when template/bootstrap state is not usable before or at the earliest meaningful interaction point
   - do not bury this only in save/publish failure strings

3. **Keep the message precise**
   - “no active templates found” must not be phrased the same as “template registry failed to load”
   - “template registry is healthy, but this draft does not currently resolve to a matching template” must not be phrased the same as a global environment failure

4. **Integrate with action gating**
   - save, preview recomposition, publish, and republish must factor the relevant health state appropriately
   - do not conflate template/bootstrap health with unrelated field validation failures

5. **Clear the signal when health is restored**
   - once the registry becomes usable again, the preflight block/banner must disappear without stale error residue

---

## Strong implementation guidance

### Preferred implementation pattern
Add a typed authoring-health/preflight state owned by the shell or workspace layer and consumed by:
- the right-rail readiness area
- top-of-canvas blocking notices when appropriate
- action-button gating/reason text
- status messaging

Do not leave health truth fragmented across one-off `setStatus()` calls.

### Distinguish global vs draft-specific problems
Keep these separate:

#### Global/bootstrap failures
- template registry unreadable
- no active templates available at all

#### Draft-specific resolution failures
- the registry exists, but the current draft’s discriminator set does not resolve to a matching active template

The UI should not tell authors “the environment is broken” when the real issue is “this draft does not currently match a template.”

### Accessibility expectations
If you add a preflight banner or summary:
- ensure it is discoverable by assistive technology
- ensure state changes are announced appropriately
- keep messaging concise, specific, and non-duplicative

### Scope guard
Do **not** redesign the template system or registry data model.
This prompt is about health modeling, surfacing, and truthful action gating.

---

## Adjacent systems that must be reconciled
You must reconcile this prompt against:
- Prompt 01 save-readiness modeling
- publish resolution context
- readiness summaries
- preview recomposition behavior
- top-level shell notices
- status channel wording
- any comments/docs that still imply template/bootstrap health is only a later action-time concern

---

## Validation and regression requirements
You must prove all of the following:

1. Empty active-template state is surfaced early and clearly.
2. Template-registry read failure is surfaced early and clearly.
3. Healthy registry state removes the block/banner.
4. Draft-specific no-match cases are distinguished from global registry failure.
5. Save/publish/recompose gating is truthful and non-contradictory.
6. Existing supported Project Spotlight flow still works with a healthy seeded registry.

### Minimum test expectations
Add or update targeted tests that pin:
- empty registry behavior
- registry read failure behavior
- healthy registry behavior
- draft-specific no-match behavior
- action-button gating reason consistency

---

## Required closure artifacts
Create a closure report in the Publisher closure docs that states:
- the authoring health states introduced
- how global bootstrap failures differ from draft-specific resolution failures
- which shell surfaces now expose the health signal
- which actions are gated by this state
- the tests added/updated

The report must describe what is now implemented, not a future health framework.

---

## Mandatory operating instructions
- Work in the live local `hb-intel` repo.
- Treat repo truth as final authority over older package wording.
- Scrub the full template/bootstrap health path before changing anything.
- Do not make unrelated changes.
- Do not weaken existing supported Project Spotlight behavior.
- Do not re-open already-closed companyPulse/milestone/scheduled remediation unless a fresh regression is found.
- Prove closure before moving to the next prompt.
- Do not re-read files already in active context unless needed to confirm drift, dependencies, or uncertainty after changes.
