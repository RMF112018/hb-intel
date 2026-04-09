# UI System Audit Closure — Prompt Package

## Objective

This package contains a comprehensive closure prompt set aligned to the seven recommended next actions in:

`docs/architecture/reviews/UI-System-Audit-Validation-Report.md`

The goal is to move the UI-system audit from **validated with targeted gaps** to **closed with evidence, cleanup, and traceable documentation**.

All prompts are written for execution in the live HB Intel repository.

Do not reread files that are already in your active context unless needed.

---

## Package Contents

- `00_Package_Summary.md`
- `Prompt-01-Capture-Visual-Proof.md`
- `Prompt-02-Commit-Build-Evidence.md`
- `Prompt-03-Migrate-Shell-Layout-Constants.md`
- `Prompt-04-Complete-Deprecated-Alias-Retirement-Plan.md`
- `Prompt-05-Resolve-PeopleCulture-Naming-and-Authority.md`
- `Prompt-06-Begin-Main-Barrel-Reduction.md`
- `Prompt-07-Cross-Reference-Mount-Mapping-and-Packaging-Proof.md`

---

## Recommended Execution Order

Execute in this order unless repo truth forces adjustment:

1. Prompt 01 — Capture visual proof
2. Prompt 02 — Commit build evidence
3. Prompt 07 — Cross-reference mount mapping and packaging proof
4. Prompt 03 — Migrate shell-layout constants
5. Prompt 05 — Resolve PeopleCulture naming and authority
6. Prompt 06 — Begin main-barrel reduction
7. Prompt 04 — Complete deprecated alias retirement plan

Rationale:
- Evidence and proof closure should happen first while the validated implementation state is fresh.
- Packaging traceability should be tightened before further structural cleanup changes the repo state.
- Shell constant migration and PeopleCulture authority cleanup are narrow structural corrections.
- Main-barrel reduction and deprecated alias retirement planning should happen after current authority surfaces and shared seams are clarified.

---

## Governing Review File

Every prompt in this package is governed by:

- `docs/architecture/reviews/UI-System-Audit-Validation-Report.md`

Where relevant, the prompts also rely on:

- `docs/architecture/plans/MASTER/ui-kit/wave-01/Prompt-00-Acceptance-and-Corrective-Addendum.md`
- `docs/architecture/plans/MASTER/ui-kit/wave-01/UI-System-Reconciliation-Execution-Note.md`
- `docs/reference/ui-kit/UI-System-Layer-Model.md`
- `docs/reference/ui-kit/Presentation-Lane-Standard.md`
- `docs/reference/ui-kit/Productive-Lane-Standard.md`
- `docs/architecture/blueprint/ui-system-target-architecture.md`
- `docs/how-to/developer/Building-New-Homepage-Surfaces.md`
- `docs/how-to/developer/Migrating-Legacy-UI-to-the-Two-Lane-System.md`

---

## Execution Standard

For every prompt in this package:

- use live repo truth first,
- name exact affected consumers, files, and artifacts,
- distinguish structural completion from proof completion,
- avoid broad rewrites unless the prompt explicitly calls for them,
- preserve the two-lane / four-layer model,
- do not reread files already in active context unless needed,
- produce precise completion notes with remaining risks called out plainly.

---

## Closure Standard

This package is complete only when all seven next-step areas are closed in a way that leaves:

- named consumer visual proof,
- committed build / packaging proof,
- improved architectural separation,
- clearer authority around ambiguous consumers,
- a smaller and better-disciplined shared barrel,
- a concrete alias retirement program with exact migration gates,
- and better traceability between packaging proof and runtime webpart mappings.
