# PACKAGE MANIFEST — HB Intel My Dashboard UI Posture Reset Implementation Package

## Package Identity

- **Package title:** HB Intel My Dashboard UI Posture Reset Implementation Package
- **Generated date:** 2026-05-15
- **Target repository:** `RMF112018/hb-intel`
- **Target branch posture:** `main` must be re-verified by the local code agent before edits
- **Primary app:** `apps/my-dashboard/`
- **Objective:** Replace the current developer-first / state-demonstration UI posture with a production-ready, employee-facing, quick-action personal launch pad that meets or exceeds the locked target UI posture in this package.

## Binding Product Direction

This package leaves **no product/design decisions open** for the implementation sequence.

The implementation target is closed:

1. **No tabs or dropdown module launcher at this stage.**
2. **Everything material remains directly available from the primary My Dashboard page.**
3. **Exactly two rendered production modules remain on the primary page for this reset:**
   - `My Projects`
   - `Adobe Sign Action Queue`
4. **One card per module.**
5. **No standalone Work Summary card.**
6. **No standalone Source Readiness card.**
7. **No separate Adobe Sign focused-module page required for primary module understanding or state closure.**
8. **The current telemetry-heavy hero is replaced by a compact page header.**
9. **Desktop bento choreography is locked to My Projects first / left and Adobe Sign second / right:**
   - Large laptop / desktop / ultrawide: `7 / 5`
   - Standard laptop: `6 / 4`
   - Small laptop and below: stacked full-width cards
10. **The page must present as a polished employee dashboard, not as an integration validation harness.**

## Package Contents

```text
HB_Intel_My_Dashboard_UI_Posture_Reset_Implementation_Package_2026-05-15/
├── PACKAGE_MANIFEST.md
├── README.md
├── docs/
│   ├── 00-Executive-Implementation-Brief.md
│   ├── 01-Repo-Truth-Current-State-Audit-Summary.md
│   ├── 02-Decision-Lock-And-Closed-Target-Posture.md
│   ├── 03-Comprehensive-Target-UI-Posture.md
│   ├── 04-Target-Primary-Page-Layout-And-Bento-Choreography.md
│   ├── 05-Target-Module-State-Matrices.md
│   ├── 06-Target-Copy-Library.md
│   ├── 07-Implementation-Sequence-And-Dependency-Map.md
│   ├── 08-Acceptance-Criteria-And-Proof-Of-Closure.md
│   └── 09-Repo-Seam-Reference-Map.md
├── prompts/
│   ├── Prompt-00-Repo-Truth-Drift-Lock-And-Execution-Plan.md
│   ├── Prompt-01-Reset-My-Dashboard-Shell-To-Single-Page-Command-Surface.md
│   ├── Prompt-02-Replace-Hero-Telemetry-With-Compact-Production-Header.md
│   ├── Prompt-03-Consolidate-Adobe-Sign-Into-One-Module-Card.md
│   ├── Prompt-04-Refactor-My-Projects-Into-Disciplined-Launch-Pad-Card.md
│   ├── Prompt-05-Recompose-Bento-Grid-And-Primary-Page-Module-Choreography.md
│   ├── Prompt-06-Remove-Obsolete-UI-Artifacts-And-Reconcile-Tests-Docs.md
│   └── Prompt-07-Validation-Package-Build-And-Hosted-Evidence-Readiness.md
└── reference/
    ├── Expected-Removal-And-Preservation-Map.md
    ├── Implementation-Guardrails.md
    ├── Repo-Truth-Inspection-Seams.md
    └── Target-State-Acceptance-Matrix.md
```

## Recommended Serialized Execution Order

Execute the prompts in strict order:

1. `Prompt-00`
2. `Prompt-01`
3. `Prompt-02`
4. `Prompt-03`
5. `Prompt-04`
6. `Prompt-05`
7. `Prompt-06`
8. `Prompt-07`

Do **not** skip prompts.  
Do **not** combine prompts unless a later repo-truth drift check proves two prompts are already fully closed.  
Do **not** re-open product decisions already locked in `docs/02-Decision-Lock-And-Closed-Target-Posture.md`.

## Primary Deliverable Standard

The completed implementation must result in a My Dashboard page that:

- loads as one directly useful primary page;
- has no visible module tabs or dropdown module launcher;
- includes one polished `My Projects` card and one polished `Adobe Sign Action Queue` card;
- renders state handling inside those owning cards;
- uses bento layout intentionally and densely;
- removes page-level and shell-level overexposure of integration/source telemetry;
- preserves read-model truth, OAuth initiation integrity, and source-of-record handoff posture;
- compiles, tests, and packages cleanly.

## No-Deferral Rule

Anything required to meet the target posture in this package must be included in this implementation sequence.  
Do not defer:

- shell cleanup,
- header redesign,
- Adobe consolidation,
- My Projects composition changes,
- layout choreography,
- removal of obsolete UI artifacts,
- test/documentation reconciliation,
- package/build proof.
