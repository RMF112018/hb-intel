# PH7.6 — BIC Standardization & Registration Enforcement

**Version:** 1.0  
**Purpose:** Turn `@hbc/bic-next-move` into a platform-wide accountability standard instead of a strong but isolated package.  
**Audience:** Implementation agent(s), architecture owner, maintainers, and reviewers.  
**Implementation Objective:** Standardize Ball-in-Court / next-move ownership semantics across modules, define registration requirements, publish the adoption matrix, and make BIC integration a release expectation for ownership-driven workflows.

---

## Prerequisites

- PH7.1 and PH7.4 complete.
- Review the BIC shared-feature plan, package sources, and current modules with actionable ownership semantics.
<!-- PH7.6R: Two additional prerequisites identified during validation (2026-03-09):
  1. SF02-T08-Deployment.md must be amended before execution: the task file still references
     "ADR-0011-bic-next-move-platform-primitive.md" in 5 locations (3-line plan, pre-deployment
     checklist, ADR content block heading, migration guide body, Blueprint progress comment).
     ADR-0011 is already occupied by ADR-0011-verification-deployment.md. ADR-0080
     (docs/architecture/adr/ADR-0080-bic-next-move-platform-primitive.md) is the correct,
     already-created record (PH7.4R). All five SF02-T08 references must be corrected to
     ADR-0080 before that task file is executed; otherwise SF02-T08 will produce a duplicate
     that conflicts with the existing ADR-0011 and shadows ADR-0080.
  2. PH7.5 implementation (complexity stub removal + ComplexityProvider wiring) should be
     complete before BIC module adoption begins. HbcBicBadge, HbcBicDetail, and
     HbcBicBlockedBanner all read complexity context via @hbc/ui-kit/app-shell. Until the
     ui-kit useComplexity stub is replaced by the real @hbc/complexity context, BIC components
     will always render as 'standard' tier regardless of user preference. Adopting modules
     before PH7.5 is complete produces correct-looking but functionally incorrect BIC rendering.
-->

---

## Source Inputs

- `packages/bic-next-move/src/types/*`
- `packages/bic-next-move/src/registry/*`
- `packages/bic-next-move/src/hooks/*`
- `packages/bic-next-move/src/components/*`
- current feature/app modules with ownership semantics

---

## 7.6.1 — Define the Platform Ownership Vocabulary

- Publish the core vocabulary: current owner, next move, expected action, previous owner, next owner, escalation owner, blocked, unassigned, urgency tier, transfer history.

## 7.6.2 — Identify Modules That Must Register

- Classify each active module/workflow as must register, may integrate later, or not applicable; include status and blockers.
<!-- PH7.6R: Concrete classification work required (2026-03-09):
  BIC_MODULE_MANIFEST currently lists 10 keys across 4 domains. These keys must be explicitly
  mapped to their owning feature packages and the mapping must be reconciled against
  docs/reference/platform-primitives.md Adoption Matrix:

    Manifest key              → Feature package
    ─────────────────────────────────────────────
    bd-scorecard              → @hbc/features-business-development
    bd-department-sections    → @hbc/features-business-development
    estimating-pursuit        → @hbc/features-estimating
    estimating-kickoff        → @hbc/features-estimating
    project-hub-pmp           → @hbc/features-project-hub
    project-hub-turnover      → @hbc/features-project-hub
    project-hub-constraints   → @hbc/features-project-hub
    project-hub-permits       → @hbc/features-project-hub
    project-hub-monthly-review → @hbc/features-project-hub
    admin-provisioning        → @hbc/features-admin  ← CONFLICT (see below)

  REQUIRED RESOLUTION — admin-provisioning manifest key vs. adoption matrix N/A:
  The adoption matrix (platform-primitives.md) classifies @hbc/features-admin as N/A for
  @hbc/bic-next-move. However, BIC_MODULE_MANIFEST includes 'admin-provisioning', implying
  the provisioning workflow has BIC ownership semantics. One of these must govern:
    Option A: Admin provisioning does have genuine BIC semantics (provisioning saga has an
              assignable "next-move" step). Keep the manifest key; update matrix to "Planned".
    Option B: Admin provisioning is a system/automated workflow with no human ownership.
              Remove 'admin-provisioning' from BIC_MODULE_MANIFEST; matrix N/A stands.
  Architecture owner must choose Option A or B during PH7.6 §7.6.2 execution.
  The resolved choice must be annotated in BIC_MODULE_MANIFEST and platform-primitives.md.

  Modules absent from manifest with current "Planned" adoption matrix status also need
  explicit classification: @hbc/features-accounting, @hbc/features-safety,
  @hbc/features-quality-control-warranty, @hbc/features-risk-management, and
  @hbc/features-leadership are all "Planned" in the matrix but have no manifest keys yet.
  Each must be either added to the manifest (with specific workflow keys) or reclassified
  to "Required — manifest key pending" with blockers documented.
-->

## 7.6.3 — Publish the BIC Registration Standard

- Document what it means to be BIC-compliant: registry use, canonical state/types, unassigned handling, urgency semantics, blocked navigation behavior, and no local shadow models without ADR exception.
<!-- PH7.6R: Three filesystem documentation files are missing (2026-03-09):
  The content for all three files was authored in SF02-T08-Deployment.md but has never been
  extracted to actual files on disk. Executing §7.6.3 requires materializing:

    1. docs/how-to/developer/bic-module-adoption.md
       Source content: SF02-T08-Deployment.md § "Module Adoption Guide" block.
       This file is ALSO referenced by a live source-code comment in
       packages/bic-next-move/src/constants/manifest.ts line 13 — a broken documentation
       link that is currently visible in every developer's IDE. Extracting this file
       resolves that broken reference.

    2. docs/how-to/developer/bic-server-aggregation-migration.md
       Source content: SF02-T08-Deployment.md § "Migration Guide" block.
       Referenced by ADR-0080 Consequences section and BicModuleRegistry.ts JSDoc.

    3. docs/reference/bic-next-move/api.md
       A full API reference for @hbc/bic-next-move (IBicNextMoveConfig<T>, hooks, components,
       testing sub-path). Referenced by the module adoption guide (step 7).
       This is a Diátaxis reference-quadrant artifact. No source template exists in SF02-T08;
       it must be authored from the package source during PH7.6 execution.

  All three files are prerequisite to a complete BIC registration standard — the standard
  must link to the adoption guide and migration guide to be actionable for module authors.
-->

## 7.6.4 — Define Release Gate Expectations

- Create the rule that no action-owning module ships without full BIC integration, not-applicable classification, or ADR exception.

## 7.6.5 — Extend and Refine the Adoption Matrix

- Extend the existing cross-primitive adoption matrix to include BIC-specific per-workflow classification, and add registration, UI, testing, release-gate, and exception columns for the BIC primitive.
<!-- PH7.6R: Matrix already exists — reframe from "build" to "extend and refine" (2026-03-09):
  docs/reference/platform-primitives.md was created during PH7.4 and already contains a
  full adoption matrix covering all 11 feature packages and 14 apps across all 3 Tier-1
  primitives. The PH7.4 matrix uses coarse status values ("Planned", "N/A") that are
  insufficient for BIC-specific tracking once feature development begins.

  PH7.6 §7.6.5 must extend the existing matrix rather than creating a duplicate. Required
  additions to platform-primitives.md:

    1. Refine the BIC column from generic "Planned" to per-workflow classification:
         Required (workflows: <list manifest keys>)   — concern area confirmed present
         N/A (<rationale>)                             — concern area absent; state why
         Required — manifest key pending               — concern confirmed, key not yet added
       This replaces the undifferentiated "Planned" status for every BIC row.

    2. Optionally add a BIC-specific detail table (distinct from the cross-primitive
       summary matrix) showing per-module: registration status, UI component status,
       testing status, release-gate status, and exception ADR. This table lives in
       platform-primitives.md §@hbc/bic-next-move Package Detail or in a linked
       docs/reference/bic-next-move/adoption-matrix.md.

    3. Apply the admin-provisioning resolution from §7.6.2 to update the admin row.
-->

## 7.6.6 — Align Testing and Reference Examples

- Ensure BIC is prepared for PH7.8 root test governance and has clear examples for future authors.

## 7.6.7 — Update the Shared-Feature Plan and Correct SF02-T08

- Update `SF02-BIC-Next-Move.md` to reflect current implementation state, standardization policy, and module adoption path.
- Amend `SF02-T08-Deployment.md` to correct all ADR number references from ADR-0011 to ADR-0080 before that task file is executed.
<!-- PH7.6R: SF02-T08-Deployment.md contains 5 incorrect ADR-0011 references (2026-03-09):
  SF02-BIC-Next-Move.md was correctly updated during PH7.4R (ADR-0080 comment added at
  line 8). However, SF02-T08-Deployment.md — the individual deployment task file — was not
  touched during PH7.4R and still contains five live references to the wrong ADR number:

    Location 1 — 3-Line Plan (line ~19):
      Current:  "Write ADR `0011-bic-next-move-platform-primitive.md`"
      Correct:  "ADR-0080-bic-next-move-platform-primitive.md already exists (PH7.4R);
                 execute pre-deployment checklist and verify build."

    Location 2 — Pre-Deployment Checklist, Documentation section (line ~41):
      Current:  "ADR `docs/architecture/adr/0011-bic-next-move-platform-primitive.md` written"
      Correct:  "ADR `docs/architecture/adr/ADR-0080-bic-next-move-platform-primitive.md`
                 exists (created PH7.4R) — confirm file is present, no action required"

    Location 3 — ADR content block heading (line ~65):
      Current:  "## ADR: `docs/architecture/adr/0011-bic-next-move-platform-primitive.md`"
      Correct:  "## ADR: `docs/architecture/adr/ADR-0080-bic-next-move-platform-primitive.md`
                 (already created PH7.4R — do not recreate)"

    Location 4 — ADR content block body / D-06 rationale (line ~133):
      Current:  references "bic-server-aggregation-migration.md" under the D-06 Rationale —
                also references ADR document number 0011 internally
      Correct:  update internal ADR date/number to ADR-0080; 2026-03-09

    Location 5 — Blueprint Progress Comment (line ~470):
      Current:  "ADR created: docs/architecture/adr/0011-bic-next-move-platform-primitive.md"
      Correct:  "ADR exists: docs/architecture/adr/ADR-0080-bic-next-move-platform-primitive.md
                 (created PH7.4R — not created by SF02-T08)"

  If SF02-T08 is executed without these corrections, it will attempt to create a new file at
  docs/architecture/adr/0011-bic-next-move-platform-primitive.md, conflicting with the
  existing ADR-0011-verification-deployment.md and duplicating the content already present
  in ADR-0080. The ADR-0011 file must not be created.

  These SF02-T08 corrections must be applied as part of PH7.6 §7.6.7, or as an explicit
  preliminary step before SF02-T08 is executed (whichever comes first).
-->

---

## Deliverables

- `docs/reference/bic-next-move/` glossary and API reference (`api.md`)
- extended `docs/reference/platform-primitives.md` adoption matrix (BIC-specific per-workflow classification)
- `docs/how-to/developer/bic-module-adoption.md` (extracted from SF02-T08 content)
- `docs/how-to/developer/bic-server-aggregation-migration.md` (extracted from SF02-T08 content)
- release-gate rule documented in `docs/reference/platform-primitives.md` or dedicated doc
- updated `SF02-BIC-Next-Move.md` reflecting standardization policy and adoption path
- SF02-T08-Deployment.md amended (all 5 ADR-0011 references corrected to ADR-0080)

---

## Acceptance Criteria Checklist

- [ ] Platform ownership vocabulary is published (`docs/reference/bic-next-move/api.md` or glossary doc).
- [ ] BIC_MODULE_MANIFEST keys are explicitly mapped to feature packages; admin-provisioning conflict resolved.
- [ ] `docs/how-to/developer/bic-module-adoption.md` exists on disk (extracted from SF02-T08).
- [ ] `docs/how-to/developer/bic-server-aggregation-migration.md` exists on disk (extracted from SF02-T08).
- [ ] BIC registration standard is documented (compliance criteria, shadow-model prohibition, ADR exception process).
- [ ] Release-gate rule for action-owning modules is documented.
- [ ] `docs/reference/platform-primitives.md` adoption matrix extended with BIC per-workflow classification.
- [ ] SF02-T08-Deployment.md corrected: all 5 ADR-0011 references updated to ADR-0080.
- [ ] `SF02-BIC-Next-Move.md` reflects standardization status and next adoption steps.

---

## Verification Evidence

- updated docs link check
- current modules classified
- ADR exception review if applicable

---

## Progress Notes Template

```markdown
<!-- IMPLEMENTATION PROGRESS & NOTES
PH7.6 started: YYYY-MM-DD
PH7.6 completed: YYYY-MM-DD

Artifacts:
- docs/reference/bic-next-move/api.md
- docs/how-to/developer/bic-module-adoption.md (extracted from SF02-T08)
- docs/how-to/developer/bic-server-aggregation-migration.md (extracted from SF02-T08)
- docs/reference/platform-primitives.md (extended BIC adoption matrix)
- release-gate rule (location: TBD)
- SF02-BIC-Next-Move.md (updated)
- SF02-T08-Deployment.md (ADR-0011 → ADR-0080 corrections applied)

Verification:
- build: PASS/FAIL
- lint: PASS/FAIL
- check-types: PASS/FAIL
- test / validation: PASS/FAIL
- docs link check: PASS/FAIL

Notes:
- admin-provisioning resolution: Option A or B (record here)
- unresolved items:
- deferred items with rationale:
-->
```

<!-- IMPLEMENTATION PROGRESS & NOTES
PH7.6R Validation: 2026-03-09

Validation findings (5 amendments applied):
  Amendment A — Prerequisites: SF02-T08 ADR correction required before execution;
    PH7.5 implementation must precede BIC module adoption (complexity stub dependency).
  Amendment B — §7.6.2: BIC_MODULE_MANIFEST keys mapped to feature packages;
    admin-provisioning manifest key vs. @hbc/features-admin N/A conflict identified and
    requires architecture-owner resolution (Option A: keep key + update matrix; or
    Option B: remove key + N/A stands).
  Amendment C — §7.6.3: Three missing filesystem docs identified (bic-module-adoption.md,
    bic-server-aggregation-migration.md, bic-next-move/api.md); content for first two
    already authored in SF02-T08 and ready to extract; broken manifest.ts source-code
    reference documented.
  Amendment D — §7.6.5: Adoption matrix already exists in platform-primitives.md (PH7.4);
    task reframed from "build" to "extend and refine" with BIC per-workflow classification
    replacing coarse "Planned" status.
  Amendment E — §7.6.7: SF02-T08-Deployment.md correction scope added; all 5 ADR-0011
    references documented with exact locations and correct replacements (ADR-0080);
    ADR-0080 already exists (created PH7.4R).

Next: PH7.6 implementation (awaiting user confirmation)
-->
