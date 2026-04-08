# Prompt-11E-01 — Tool Launcher Search and Discovery Upgrade

## Objective

Execute **Phase 11E** for the Tool Launcher / Work Hub.

This phase corresponds to the previously defined **Phase 04**.

Your job is to transform the current search behavior into a real discovery system that materially improves findability, ranking quality, and usefulness without regressing host safety, performance, or accessibility.

---

## Required Pre-Read

Use these first:

- `docs/architecture/reviews/tool-launcher/phase-11a-tool-launcher-rebuild-readme.md`
- `docs/architecture/reviews/tool-launcher/phase-11a-tool-launcher-rebuild-change-boundaries.md`
- `docs/architecture/reviews/tool-launcher/phase-11a-tool-launcher-rebuild-validation-checklist.md`
- outputs from phases 11B, 11C, and 11D
- `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Governing-Standard.md`

Then inspect the relevant discovery/search seams under:
- `apps/hb-webparts/src/webparts/toolLauncherWorkHub/`
- especially `launcherSearch` and any overlay / command-surface search logic

Do not re-read files that are already in current context or memory.

---

## Phase Goal

Upgrade the launcher from basic matching to intentional discovery.

The search and discovery experience should help users find tools by:
- platform name
- aliases / keywords
- workflow
- category
- support owner
- intent clues
- product curation / ranking
- contextual discovery inside the launcher surfaces

---

## Required Focus Areas

### 1. Search quality
Improve matching and result quality beyond simple flat substring behavior where appropriate.

You may introduce:
- weighted ranking
- multi-field scoring
- exact-match preference
- prefix preference
- category / workflow signal
- support-owner relevance
- notice / support / featured influence if justified

Keep the implementation bounded and maintainable.

### 2. Command-surface suggestions
Improve the command band experience so suggestions feel useful and intentional, not like a thin query echo.

Suggestions should better support:
- fast launch
- disambiguation
- category / workflow hints
- clear next-action behavior
- professional no-results treatment

### 3. Discovery panel / all-platforms behavior
Upgrade the all-platforms view so it behaves like a real discovery surface.

That may include:
- better grouping
- stronger filtering
- better count / scope signaling
- improved zero-state / no-match handling
- stronger use of categories / shelves / support cues

### 4. Future-ready discovery hooks
Where justified, prepare for:
- favorites
- recent tools
- recommended tools
- support-guided discovery
- role-aware discovery

Do not overbuild speculative features, but avoid blocking them.

### 5. Accessibility and keyboard support
Preserve or improve:
- keyboard navigation
- focus management
- screen-reader clarity
- interactive semantics

---

## Preserve These Seams

Preserve unless narrowly justified otherwise:

- live data and presentation seams from prior phases
- launch behavior
- host-safe SharePoint posture
- overall composition work
- support/status semantics already in place

---

## Required Deliverables

### 1. Code changes
Update the relevant Tool Launcher discovery and search files under:
- `apps/hb-webparts/src/webparts/toolLauncherWorkHub/`

### 2. Summary document
Create:
`docs/architecture/reviews/tool-launcher/phase-11e-search-and-discovery-upgrade-summary.md`

This file must describe:
- what discovery/search logic changed
- how ranking or grouping improved
- what UX surfaces changed
- what future discovery hooks are now supported

### 3. Validation document
Create:
`docs/architecture/reviews/tool-launcher/phase-11e-search-and-discovery-upgrade-validation.md`

This file must describe:
- how search behaviors were validated
- what keyboard behaviors were checked
- how no-results / degraded states were checked
- whether performance concerns remain

---

## Validation Expectations

Before concluding, validate at minimum:

- search still works in command surface
- all-platforms discovery still works
- search quality is materially better than before
- ranking or grouping is more intentional
- no obvious performance regressions were introduced
- keyboard navigation remains strong
- build still passes cleanly
- degraded states remain professional

---

## Important Constraints

- Do not re-read files that are already in current context or memory.
- Do not widen this into a full data-model redesign; 11C already handled that.
- Do not turn this into the support/status rebuild; that belongs to 11F.
- Do not sacrifice maintainability for clever scoring.
- Do not regress accessibility for visual gain.

---

## Required Completion Notes

When finished, provide concise completion notes covering:

- files changed
- files created
- discovery/search improvements implemented
- validation performed
- performance considerations
- build status
- recommended next phase
- residual issues for later phases

---

## Final Instruction

Execute **Phase 11E** as the Tool Launcher search-and-discovery upgrade phase.

The result should materially improve findability, ranking quality, and discovery usefulness while preserving accessibility, host safety, and maintainability.
