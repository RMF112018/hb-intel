# HB Homepage Hero Unification — Enhanced Combined Audit and Implementation Prompt Package

## Objective

This package replaces the attached prior package with a stronger, narrower, repo-truth-anchored implementation package for the HB Homepage hero unification effort.

The target is not a cosmetic adjustment.

The target is to:

1. move the flagship homepage hero into the correct wrapper-owned runtime position,
2. make the hero participate in the same entry-stack authority as the launcher band and shell,
3. materially improve constrained-width and short-height behavior,
4. prevent architecture drift between runtime, reference composition, and governance seams,
5. and close the hosted cutover risk that would otherwise duplicate or orphan the hero.

## What this package improves

Compared with the attached package, this package is materially stronger in five ways:

1. It treats the current split hero/homepage composition as an **intentional repo-truth decision**, not a vague implementation accident.
2. It isolates the missing closure units the prior package underdeveloped:
   - wrapper-owned hero config / property migration,
   - shared entry-state truth for hero + launcher + shell,
   - duplicate-hero risk during hosted cutover,
   - reference/runtime/documentation cutover,
   - closure-grade proof.
3. It avoids overbroad work that repo truth does **not** currently justify as a primary wave, such as gratuitous manifest churn.
4. It converts the remediation into narrower and more executable prompt units.
5. It defines what “done” looks like at runtime, in code, and in hosted validation.

## Core repo-truth conclusion

The current flagship homepage composition is explicitly encoded as:

1. standalone hero webpart,
2. wrapper-embedded launcher/actions band inside `HbHomepage`,
3. shell-owned post-entry operating layer inside `HbHomepage`.

That is declared in:

- `apps/hb-webparts/src/webparts/hbHomepage/HbHomepageEntryStack.tsx`
- `apps/hb-webparts/src/homepage/entryStack/entryStackOrchestration.ts`
- `apps/hb-webparts/src/webparts/hbHomepage/hbHomepageContract.ts`
- `apps/hb-webparts/src/mount.tsx`

The requested end state is therefore an architecture cutover, not a styling pass.

## Correct target state

The correct flagship target state is:

1. wrapper-owned hero region
2. wrapper-owned launcher/actions region
3. shell-owned post-entry operating layer

inside `HbHomepage`.

The hero should **not** become a shell occupant.

The hero should remain a reusable hero surface with separate article-mode behavior, but the flagship homepage should stop depending on a separately authored standalone hero webpart above the homepage app.

## New closure units added by this package

The attached package was directionally right, but too shallow in these areas:

1. **Property/config migration**  
   There is no wrapper-owned hero integration seam today equivalent to the existing wrapper-owned rail seam. That must be added explicitly.

2. **Shared entry-state truth**  
   The repo already has shell measurement, entry-state policy, and shared snapshot helpers. The prior package did not anchor strongly enough to those existing seams or force hero participation in them.

3. **Hosted duplicate-hero risk**  
   If the old standalone hero remains authored on the flagship page while the hero is also embedded into `HbHomepage`, the page can end up with two heroes. That is a real cutover risk and must be closed deliberately.

4. **Reference/runtime truth cutover**  
   `mount.tsx`, `entryStackOrchestration.ts`, `ReferenceHomepageComposition.tsx`, and contract comments must all be updated in lockstep with runtime.

5. **Closure-grade proof**  
   The package must require runtime markers, width/height validation, tests, and hosted cutover instructions rather than relying on subjective visual review.

## Package contents

- `00-Executive-Summary.md`
- `01-Package-vs-Repo-Truth-Reconciliation.md`
- `02-Current-Hero-and-Homepage-Implementation-Map.md`
- `03-Expanded-Findings-Register.md`
- `04-Research-Informed-Architecture-and-Design-Considerations.md`
- `05-Prioritized-Remediation-Plan.md`
- `06-Recommended-Implementation-Waves.md`
- `07-Closure-Evidence-Matrix.md`
- `08-Dependency-and-Development-Concept-Recommendations.md`
- `Plan-Summary.md`
- `Prompt-01-Cut-Over-Flagship-Wrapper-Owned-Hero-Composition.md`
- `Prompt-02-Create-Wrapper-Owned-Hero-Integration-Seam-And-Property-Migration.md`
- `Prompt-03-Unify-Entry-Stack-Measurement-State-For-Hero-Launcher-And-Shell.md`
- `Prompt-04-Rebuild-Hero-Responsive-Modes-And-Crowding-Controls.md`
- `Prompt-05-Prevent-Duplicate-Hero-During-Flagship-Hosted-Cutover.md`
- `Prompt-06-Update-Repo-Truth-Seams-And-Reference-Composition.md`
- `Prompt-07-Add-Responsive-Regression-Proof-And-Runtime-Diagnostics.md`
- `Prompt-08-Document-Hosted-Validation-And-Operational-Cutover.md`

## How to use this package

1. Read `00-Executive-Summary.md`.
2. Read `03-Expanded-Findings-Register.md`.
3. Read `05-Prioritized-Remediation-Plan.md`.
4. Execute prompts in order unless live repo conditions require a minor resequence.
5. Do not skip Prompt 05, Prompt 07, or Prompt 08. Those are closure-critical, not optional cleanup.

## Important implementation posture

This package is intentionally strict about three things:

- do not blur wrapper and shell ownership,
- do not leave real hosted cutover work for “later,”
- do not sign off without proof that the unified entry stack behaves correctly on constrained widths and short heights.
