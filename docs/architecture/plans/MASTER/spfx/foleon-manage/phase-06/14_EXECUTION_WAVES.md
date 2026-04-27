# 14 — Execution Waves

## Wave 01 — UI Shell and Information Architecture

### Goal

Rebuild the Manager shell so the app reads as a polished Foleon Manager, not a diagnostics dump.

### Outcomes

- Header renamed/presented as `Foleon Manager`.
- `Homepage Foleon Content` selected by default.
- Top-level status chips replace raw readiness dominance.
- Global banner used only when action is required.
- Raw diagnostics moved out of primary view.
- Existing data/workflows preserved.

### Prompt

Use `15_PROMPT_01_UI_SHELL_AND_INFORMATION_ARCHITECTURE.md`.

## Wave 02 — Homepage Content Tab Redesign

### Goal

Make lane cards and selected-lane workspace the primary marketing workflow.

### Outcomes

- Three lane cards render.
- Selected-lane workspace exists.
- Content library is secondary.
- Editor/placement workflows remain reachable.
- Live/preview/blocked/empty/needs-setup states are plain-language.

### Prompt

Use `16_PROMPT_02_HOMEPAGE_CONTENT_TAB_REDESIGN.md`.

## Wave 03 — Config Tab Redesign

### Goal

Make Config a task-oriented admin console.

### Outcomes

- System Health Summary groups readiness.
- Required Admin Actions ranked.
- Technical labels replaced.
- Config source/proof tables moved to diagnostics.
- Redacted diagnostics preserved.

### Prompt

Use `17_PROMPT_03_CONFIG_TAB_REDESIGN.md`.

## Wave 04 — Degraded States and Diagnostics

### Goal

Polish API consent, backend unavailable, read-only, blocked write/sync, and diagnostics UX.

### Outcomes

- API consent required banner is calm/actionable.
- No fatal full-surface block for token/consent failures when read-only rendering is safe.
- Disabled write actions explain blockers.
- Diagnostics are redacted/copyable.

### Prompt

Use `18_PROMPT_04_DEGRADED_STATES_AND_DIAGNOSTICS.md`.

## Wave 05 — Final UI Polish, Tests, and Proof

### Goal

Close with responsive polish, accessibility, tests, screenshots, package/version only if source behavior changes, and closure report.

### Outcomes

- Desktop/narrow SharePoint proof.
- Accessibility pass.
- Regression tests.
- Package proof if required.
- Closure report.
- Final commit.

### Prompt

Use `19_PROMPT_05_FINAL_UI_POLISH_TESTS_AND_PROOF.md`.
