# Prompt-11F-01 — Tool Launcher Support and Status Rebuild

## Objective

Execute **Phase 11F** for the Tool Launcher / Work Hub.

This phase corresponds to the previously defined **Phase 05**.

Your job is to rebuild the support and status surface so it behaves like a useful operational module instead of a passive aggregation of metadata.

---

## Required Pre-Read

Use these first:

- `docs/architecture/reviews/tool-launcher/phase-11a-tool-launcher-rebuild-readme.md`
- `docs/architecture/reviews/tool-launcher/phase-11a-tool-launcher-rebuild-change-boundaries.md`
- `docs/architecture/reviews/tool-launcher/phase-11a-tool-launcher-rebuild-validation-checklist.md`
- outputs from phases 11B through 11E
- `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Governing-Standard.md`

Then inspect the relevant Tool Launcher support/status files and data seams.

Do not re-read files that are already in current context or memory.

---

## Phase Goal

Make the support and status portion of the launcher actively useful.

The rebuilt surface should help users understand:
- what needs attention
- where to get help
- how to request access
- who owns support
- what is urgent vs informational
- what to do next

---

## Required Focus Areas

### 1. Notices
Improve notice treatment so the surface better distinguishes:
- critical
- warning
- informational
- neutral / low-urgency states

Notice rendering should be useful, scannable, and operationally clear.

### 2. Help and request-access behavior
Make help and access actions feel like intentional product affordances rather than lightly styled lists.

Clarify:
- action destination
- relation to platform
- partial-data handling
- user confidence in next step

### 3. Support ownership
Improve support-owner treatment so users can understand who supports what without the surface feeling cluttered or secondary.

### 4. Sparse / degraded states
The rebuilt support/status area must still behave well when only one or two support metadata categories are available.

No dead, weak, or awkward “half-empty” feel.

### 5. Operational grouping and utility
Reconsider grouping, sequencing, and visual emphasis so the module feels like a support utility surface, not an appendix.

---

## Preserve These Seams

Preserve unless narrowly justified otherwise:

- live support/status data semantics from prior phases
- launch behavior
- host-safe SharePoint posture
- overall composition and discovery work already completed

---

## Required Deliverables

### 1. Code changes
Update the relevant Tool Launcher support/status rendering files under:
- `apps/hb-webparts/src/webparts/toolLauncherWorkHub/`

### 2. Summary document
Create:
`docs/architecture/reviews/tool-launcher/phase-11f-support-and-status-rebuild-summary.md`

This file must describe:
- what support/status structures changed
- how usefulness improved
- what partial-data strategies were implemented
- what remained intentionally bounded

### 3. Validation document
Create:
`docs/architecture/reviews/tool-launcher/phase-11f-support-and-status-rebuild-validation.md`

This file must describe:
- what sparse/degraded states were checked
- how operational clarity was validated
- what urgency / tone handling was validated
- whether any future improvements remain optional

---

## Validation Expectations

Before concluding, validate at minimum:

- support/status area is more useful than before
- sparse metadata states still feel intentional
- notices are more legible and prioritized
- help / access / support-owner behavior is clearer
- no regressions to composition or discovery
- build still passes cleanly
- no obvious accessibility regressions were introduced

---

## Important Constraints

- Do not re-read files that are already in current context or memory.
- Do not widen this phase into general search/discovery redesign; 11E already handled that.
- Do not regress the work done in earlier phases.
- Do not let the support/status surface become visually noisy or overbuilt.
- Do not accept passive metadata accumulation as the final outcome.

---

## Required Completion Notes

When finished, provide concise completion notes covering:

- files changed
- files created
- support/status improvements implemented
- sparse/degraded-state handling
- validation performed
- build status
- recommended next phase
- residual issues for later phases

---

## Final Instruction

Execute **Phase 11F** as the Tool Launcher support-and-status rebuild phase.

The result should be a genuinely useful operational support surface that remains premium, host-safe, and resilient under partial-data conditions.
