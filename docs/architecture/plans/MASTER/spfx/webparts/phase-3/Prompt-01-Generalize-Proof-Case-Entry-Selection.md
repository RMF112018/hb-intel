# Prompt 01 — Generalize Proof-Case Entry Selection

## Objective

Generalize the hb-webparts proof-case build routing so the active isolated Vite entry is selected by webpart manifest ID rather than remaining hardcoded to the hero proof-case entry.

This prompt is **not** the target-webpart switch yet. Keep the currently validated proof-case behavior intact while making the build system ready for the next target.

---

## Context

The rollout handoff explicitly noted that the current proof-case entry routing should be generalized before or at the start of Tier 1 rollout. Right now the working proof case is hero; the next target is `PriorityActionsRailWebPart`.

The build needs a small, explicit lookup model so future proof-case migrations do not require ad hoc hardcoded entry-file replacements.

---

## Scope

Primary file:
- `tools/build-spfx-package.ts`

Possible supporting file:
- `docs/architecture/plans/MASTER/spfx/webparts/phase-2/`

Do **not** broaden beyond the minimum routing generalization.

---

## Required outcome

Implement a manifest-ID-to-entry-file lookup for hb-webparts proof cases.

The logic must support, at minimum:

- `39762a4d-c7fd-44a6-a11e-4f8de9f5778d` → `src/mount-hero-proof-case.tsx`
- `b3f07190-79cf-437d-a1d6-ecbf3f77e616` → `src/mount-priority-actions-rail-proof-case.tsx`

The build must continue to use the currently active proof-case target after this prompt. Do **not** switch the active allowlist target yet.

---

## Hard constraints

Do **not** change any of the following in this prompt:

- active proof-case allowlist target
- `ShellWebPart.ts`
- `mount.tsx`
- package version
- manifest IDs
- neutral shell bypass logic
- shim-generation guard logic
- tenant behavior

Do not re-read files that are already in your active context unless needed for verification.

---

## Implementation steps

1. Open `tools/build-spfx-package.ts`.
2. Locate the current hb-webparts proof-case build-entry logic.
3. Replace hero-specific entry hardcoding with a small explicit lookup map keyed by manifest ID.
4. Derive the proof-case entry path from the single active proof-case target.
5. Keep behavior deterministic:
   - if no matching entry is found for the active proof-case ID, fail loudly with a clear error
   - do not silently fall back to the wrong entry
6. Preserve the current validated hero proof-case behavior after the refactor.
7. Add a concise engineering note documenting the new lookup model and why it exists.

---

## Validation requirements

### A. Routing validation
Confirm the build script can resolve the hero entry through the lookup map.

### B. Non-regression validation
Confirm this prompt does **not** switch the active proof-case target.

### C. Safety validation
Confirm the build would fail clearly if a future proof-case ID has no mapped entry file.

---

## Deliverable

Provide a concise completion note with:

1. files changed
2. lookup map added
3. current active proof-case behavior preserved
4. failure mode for unmapped proof-case IDs
5. confirmation that no target switch occurred
