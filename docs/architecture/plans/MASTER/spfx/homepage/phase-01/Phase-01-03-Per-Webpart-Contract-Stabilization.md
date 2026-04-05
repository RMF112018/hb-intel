# Phase 01-03 — Per-Webpart Contract Stabilization

## Objective

Stabilize the **ten homepage webpart contracts** so each webpart is documented and implemented as a bounded product surface with explicit configuration, fallback behavior, authoring expectations, and state handling.

This prompt should convert “working component folders” into **clear product surfaces**.

---

## Required Inputs

Use live repo truth from `main`, especially:

- all ten webpart folders under `apps/hb-webparts/src/webparts/`
- `apps/hb-webparts/src/homepage/webparts/**`
- `apps/hb-webparts/src/homepage/helpers/authoringGovernance.ts`
- `apps/hb-webparts/src/homepage/shared/**`
- Prompt 01 and Prompt 02 outputs
- the homepage overlay doctrine

Do **not** re-read files already in your current context or memory unless they changed, you need exact verification, or the task widened.

---

## Webparts In Scope

1. Personalized Welcome Header
2. HB Hero Banner
3. Priority Actions Rail
4. Tool Launcher / Work Hub
5. Company Pulse
6. Leadership Message
7. People & Culture
8. Project / Portfolio Spotlight
9. Safety & Field Excellence
10. Smart Search / Wayfinding

---

## What You Must Determine

For each webpart, determine:

- exact purpose
- intended homepage zone
- allowed content/config scope
- required config fields vs optional fields
- identity/audience/freshness dependencies
- loading state behavior
- empty state behavior
- invalid-config behavior
- stale-data behavior where relevant
- authoring-mode expectations
- whether the webpart is independently renderable without the full homepage composition

---

## Required Actions

1. Audit all ten webparts against the criteria above.
2. Create a **per-webpart contract reference** — either one strong consolidated document or one doc per webpart if that is cleaner.
3. Ensure each webpart has explicit fallback behavior in code and docs.
4. Tighten config normalization where current behavior is too implicit or inconsistent.
5. Ensure authoring-governance expectations are aligned with actual webpart behavior.
6. Preserve independent rendering for each webpart.
7. Only make code changes that improve contract clarity, fallback safety, or authoring safety.

---

## Guardrails

- Do not use this prompt to perform a broad visual redesign.
- Do not add shell-level features.
- Do not introduce PWA-style app-shell assumptions into homepage webparts.
- Do not break the current mount/dispatch seam.
- Do not remove current fallback behavior unless replaced by something explicitly safer and more product-ready.

---

## Deliverables

At minimum:

- a per-webpart contract reference
- code adjustments needed to align implementation with those contracts
- explicit fallback-state notes per webpart
- a completion note summarizing the stabilization status of all ten webparts and any remaining Phase 02 handoff items

---

## Acceptance Criteria

This prompt is complete when:

- all ten webparts have explicit product contracts
- every webpart has documented and implemented fallback behavior
- authoring expectations are explicit
- independently rendered webpart behavior is preserved
- the package is meaningfully safer to refine in Phase 02
