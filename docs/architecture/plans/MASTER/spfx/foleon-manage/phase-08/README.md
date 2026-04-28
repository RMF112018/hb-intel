# HB Intel Foleon Manager — Feed Desk Remediation Package

## Purpose

This package is a hard corrective plan for the `HB Intel Foleon Manager` SPFx application. The current hosted UI has drifted into an incoherent mix of command-header fragments, tab placeholders, status strips, buckets, boards, panels, and diagnostics surfaces. It is not a credible news-feed management application.

The remediation resets the product around a clear editorial/news-feed operating model:

**Foleon = source authoring platform**  
**Foleon Manager = HB Central feed placement desk**  
**HB Central Readers = employee-facing presentation surfaces**

The Manager is not a design tool, not a Foleon replacement, not a diagnostics console, and not a lane-board experiment. It is an editorial control surface for placing Foleon-produced content into HB Central.

## Required Outcome

The next implementation must replace the current structure with a specific, governed app structure:

1. `Feed Desk` — default workspace. Queue + feed slots + inspector.
2. `Schedule` — calendar/list view of display windows and upcoming/expired content.
3. `Preview` — governed employee-facing preview workspace. If routing is not ready, it remains a polished blocked-state with clear owner/next action.
4. `Admin` — configuration, readiness, diagnostics, sync proof, package/runtime proof.

Feed lanes/channels are **not** top-level nav. They are managed inside the Feed Desk as feed slots:

- Project Spotlight
- Company Pulse
- Leadership Message

## Non-Negotiable Decisions

- Retire the current `Content Operations / Lane Board / Preview / Admin` IA.
- Retire `Lane Board` as a primary nav item. Fold lane state into `Feed Slots` inside the Feed Desk.
- Replace the top button clutter with one primary command and a small overflow/utility cluster.
- Replace buckets/boards/panels as the main model with a newsroom-style queue, filter rail, and inspector.
- Admin/config must remain available but cannot dominate the first impression.
- Do not preserve old component names, markers, or CSS class contracts just to reduce diff churn.
- Do not add backend routes unless a narrow proof shows current typed view models cannot support the UI.

## Package Contents

- `01_REPO_TRUTH_AUDIT.md`
- `02_SUBJECT_MATTER_RESEARCH.md`
- `03_FAILURE_DIAGNOSIS.md`
- `04_PRODUCT_DEFINITION.md`
- `05_TARGET_INFORMATION_ARCHITECTURE.md`
- `06_EXPLICIT_WIREFRAMES.md`
- `07_COMPONENT_ARCHITECTURE.md`
- `08_STATE_MODEL_AND_COPY.md`
- `09_VISUAL_SYSTEM_AND_CSS_REMEDIATION.md`
- `10_ACCESSIBILITY_AND_INTERACTION_MODEL.md`
- `11_IMPLEMENTATION_PLAN.md`
- `12_TEST_AND_VALIDATION_PLAN.md`
- `13_HOSTED_PROOF_PLAN.md`
- `14_ACCEPTANCE_SCORECARD.md`
- `prompts/01_hard_reset_feed_desk_shell.md`
- `prompts/02_build_feed_queue_slots_inspector.md`
- `prompts/03_schedule_preview_admin_integration.md`
- `prompts/04_css_purge_breakpoints_package_proof.md`

## Execution Sequence

Use the prompts in order. Do not start with styling. Start by replacing the IA and component structure.

