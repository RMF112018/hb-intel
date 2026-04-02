# Findings Summary

## Confirmed repo facts

1. The repo already contains a substantial shared-platform package layer, including `packages/ui-kit`, `packages/shell`, `packages/app-shell`, and `packages/spfx`, alongside many other shared primitives.
2. The repo documents its own source-of-truth hierarchy and explicitly states that `docs/architecture/blueprint/current-state-map.md` governs present implementation truth when documents disagree.
3. `@hbc/shell` is already documented as the canonical owner of shell composition, shell-state/status arbitration, navigation shell orchestration, and runtime host boundary enforcement.
4. `@hbc/app-shell` already exists as a facade that aggregates shell-facing UI resources, but its own README warns against using it in PWA contexts because of SPFx-oriented transitive dependencies.
5. The public tree for `packages/spfx` appears relatively narrow versus the target end-state of a broad canonical SPFx app composition layer; it visibly includes at least a header application customizer and document-manager web part surface.
6. The visible SPFx-oriented apps (`apps/accounting`, `apps/estimating`, `apps/admin`) share highly similar source structures with `pages`, `router`, `App.tsx`, `bootstrap.ts`, `main.tsx`, and app-specific web part entry folders, which strongly suggests repeated composition glue and potential shell/layout duplication.
7. The existing SPFx header application customizer already renders `HbcAppShell` in `mode: 'spfx'` and suppresses the SharePoint suite bar, which is evidence that a shared SPFx shell direction already exists in code, even if the ownership boundary is not yet perfectly clean.
8. The docs tree already contains numerous accepted ADRs for shell, layout, component-library, navigation, form, workspace page shell, layout variants, command bars, responsive behavior, theme enforcement, SPFx hosting, and component-consumption enforcement.

## Confirmed study-guided design principles

1. The target experience should be task-first rather than module-first.
2. Every actionable item should make the next responsible party visible.
3. Cross-item traversal should preserve context rather than forcing repeated re-orientation.
4. The suite should be device-intelligent, not merely responsive.
5. Complexity should adapt to user maturity and role.
6. Permission behavior, degraded states, and implementation edges should be visible and plainspoken.
7. The suite should feel premium, coherent, field-capable, and low-friction.
8. Common category pain points that must be designed against include steep learning curve, cognitive overload, dense navigation, too many clicks, weak lifecycle continuity, mobile/web mismatch, offline fragility, notification overload, permission opacity, and rollout trust failures.

## Confirmed Microsoft / platform guidance that should shape the implementation

1. Microsoft continues to position React as the recommended framework for SPFx solutions.
2. Microsoft continues to position Fluent UI as the official front-end framework for Microsoft 365 / SharePoint-aligned experiences.
3. Current Microsoft guidance explicitly warns SPFx developers to avoid global CSS collisions and to prefer CSS Modules or Fluent styling APIs.
4. SPFx theme and section-background awareness should be handled through theme variants and site theme colors rather than hard-coded visual assumptions.
5. Accessibility, keyboard behavior, and screen-reader support remain required rather than optional.
6. Dynamic loading should be considered where it meaningfully reduces bundle cost for heavier SPFx surfaces.

## Inferred recommendations

1. The repo likely needs a clearer canonical SPFx composition layer so individual apps stop independently wiring the same provider/bootstrap/router/shell boundary logic.
2. The quickest safe path is not to replace `@hbc/ui-kit` or `@hbc/shell`, but to tighten their ownership boundaries and reduce app-local drift.
3. Layout and interaction conformance should be driven through governed shared primitives plus enforcement rules, not informal visual cleanup.
4. The conformance effort should explicitly verify which app sources actually feed the three target `.sppkg` artifacts before changing rollout scope.
5. Doctrine updates are not optional; they are part of the implementation because the repo already has a strong architectural paper trail that should be kept authoritative.

## Unresolved items the prompt series deliberately validates early

1. exact source-app mapping for:
   - `hb-intel-accounting.sppkg`
   - `hb-intel-project-setup.sppkg`
   - `hb-intel-project-sites.sppkg`
2. whether `packages/spfx` should become the primary canonical SPFx integration layer for the suite or whether a narrower boundary adjustment is better supported by repo truth
3. which current app-local UI patterns are justified specialization versus true drift
4. whether any existing doctrinal docs in `docs/architecture/plans/MASTER/spfx/accounting/` or `docs/architecture/reviews/` materially disagree with current implementation truth and require reconciliation
