# 11 — Implementation Wave Plan

## Wave Architecture

The remediation is divided into eight implementation prompts plus one fresh-session reviewer prompt.

## Prompt 01 — Read-Only Repo-Truth Readiness Audit

**Purpose:** Confirm the live repo still matches this package before edits begin.

**No files modified.**

## Prompt 02 — Module Boundary and Card Height Posture

**Purpose:** Correct structural debt before adding flagship UI:

- top-align the card/grid posture;
- remove `titleContent` from `MyWorkCard`;
- create module-local Adobe CSS;
- remove Adobe-specific shared-card CSS.

## Prompt 03 — Header, Status Rail, and View-Switch Rebuild

**Purpose:** Introduce the new upper-card system:

- stable heading;
- visible state chip;
- freshness rail;
- semantic manual-activation view switch.

## Prompt 04 — Activity Rows, Summary Rails, and Preview Context

**Purpose:** Replace raw key/value list posture:

- queue/completed activity rows;
- dedicated list structure;
- preview-limit copy;
- better metadata hierarchy.

## Prompt 05 — State Panels, Copy Completion, and Completed Retry

**Purpose:** Finish authored state UX:

- state panels for loading/empty/degraded modes;
- final production copy deck integration;
- Completed panel retry hook and UI.

## Prompt 06 — Responsive Shell-Fit and Compact Mode Hardening

**Purpose:** Make the card intentionally adaptive across modes:

- data mode marker;
- compact/touch posture;
- stacking and wrapping rules;
- phone/tablet resilience.

## Prompt 07 — Accessibility, Tests, Keyboard, and Regression Closure

**Purpose:** Prove behavior:

- tablist/tab/tabpanel semantics;
- keyboard behavior;
- retry tests;
- row action tests;
- copy regression tests;
- source discipline.

## Prompt 08 — Hosted Evidence, Re-Audit, Scorecard, and Closeout

**Purpose:** Close the effort:

- validation;
- evidence matrix;
- scorecard re-run;
- closeout docs.

## Prompt 09 — Fresh Session Reviewer Prompt

**Purpose:** Independently re-audit the completed remediation in a new ChatGPT session.

## Sequence Rule

Do not:

- execute Prompt 04 before Prompt 03;
- execute Prompt 05 before Prompt 04;
- execute Prompt 08 before code prompts are complete.

The sequence is dependency-aware.

## Expected Commit Cadence

Recommended commit cadence:

1. Prompt 02 commit
2. Prompt 03 commit
3. Prompt 04 commit
4. Prompt 05 commit
5. Prompt 06 commit
6. Prompt 07 commit
7. Prompt 08 docs/closeout commit, only if docs are created

Prompt 01 is read-only and produces no commit.

## Stop/Go Model

Each prompt includes:

- required baseline checks;
- allowed file boundaries;
- validation gates;
- required execution report.

If any prompt reveals a contradiction in repo truth, stop and report before implementation drift compounds.
