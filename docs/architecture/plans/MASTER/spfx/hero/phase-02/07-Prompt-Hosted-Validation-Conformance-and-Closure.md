# 07 — Prompt: Hosted Validation, Conformance, and Closure

Perform the final hosted validation and closure review for the Hero Banner Admin + Greeting Awareness effort.

## Mandatory operating instruction

**Do not re-read files that are already in your active context unless needed to confirm drift, dependencies, or uncertainty after changes.**

## Strict governing authority

Treat strict compliance with the following as mandatory during closure:

- `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Governing-Standard.md`
- `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Homepage-Overlay.md`

## Governing review files

Use all of the following during closure:

- `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Governing-Standard.md`
- `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Homepage-Overlay.md`
- `docs/architecture/plans/MASTER/spfx/benchmark/01-Homepage-Webpart-Conformance-Standard.md`
- `docs/architecture/plans/MASTER/spfx/benchmark/02-Kudos-Public-Benchmark-Reference.md`
- `docs/architecture/plans/MASTER/spfx/benchmark/03-Homepage-Webpart-Delivery-Workflow-and-Gates.md`
- `docs/architecture/plans/MASTER/spfx/benchmark/04-Conformance-Scoring-Matrix.md`
- `docs/architecture/plans/MASTER/spfx/benchmark/06-Closure-Checklist.md`
- `docs/architecture/plans/MASTER/spfx/benchmark/07-Persona-and-Design-Symmetry-Rule.md`

## Locked URLs to validate

- **Admin hosting page:** `https://hedrickbrotherscom.sharepoint.com/sites/HBCentral/SitePages/Homepage-Admin.aspx`
- **Controlled public homepage:** `https://hedrickbrotherscom.sharepoint.com/sites/HBCentral`

## Objective

Validate that the completed work is doctrine-compliant, benchmark-grade for its purpose, host-resilient, and ready for closure.

## Required validation scope

### A. Greeting awareness
Prove all boundary times render correctly.

### B. Public Hero Banner
Prove:
- canonical config renders correctly on the HBCentral homepage
- background image update flows through
- authored text and CTAs render correctly
- empty/error/fallback states are credible

### C. Hero Banner Admin app
Prove:
- load state
- save success
- save failure handling
- dirty-state protection
- preview usefulness
- keyboard/focus behavior
- no dead controls
- host-page suitability on `.../SitePages/Homepage-Admin.aspx`

### D. Host/runtime behavior
Prove:
- SharePoint-hosted behavior is acceptable at both locked URLs
- relevant zoom/viewport conditions were checked
- no host-obstruction issues remain
- no console/runtime errors remain unreviewed

### E. Conformance review
Score the public Hero Banner and the admin app against the benchmark governance categories.
The admin app may differ in persona, but it still must demonstrate seriousness, seam quality, closure rigor, and strict doctrine compliance.

## Required deliverables

Produce all of the following:

1. Doctrine Compliance Summary
2. Hosted Validation Report
3. Defect Log
4. Conformance Scorecard
5. Closure Checklist
6. Final Pass/Fail Decision
7. Remaining Non-Blocking Follow-Ups Only

## Hard rule

Do not close this effort because it “works.”
Close it only if strict doctrine compliance, benchmark-grade quality, persona-fit execution, hosted proof, and explicit closure evidence all support acceptance.
