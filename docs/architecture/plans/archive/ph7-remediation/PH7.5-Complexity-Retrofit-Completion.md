# PH7.5 — Complexity Retrofit Completion

**Version:** 1.0  
**Purpose:** Finish the platform-wide normalization of `@hbc/complexity` so it governs information-density behavior consistently across the PWA, SPFx, UI kit, and future feature packages.  
**Audience:** Implementation agent(s), architecture owner, maintainers, and reviewers.  
**Implementation Objective:** Close the gap between the `@hbc/complexity` package plan and real platform adoption by completing the retrofit audit, sensitivity matrix, package integration, and documented completion criteria.

---

## Prerequisites

- PH7.1 and PH7.4 complete.
- Review the complexity shared-feature plan, provider implementation, exports, test setup, and any interim complexity access paths outside the package.

---

## Source Inputs

- `packages/complexity/*`
- `packages/ui-kit/*`
- app roots in `apps/pwa` and SPFx entry seams
- `docs/reference/ui-kit/*`
- `SF03-Complexity-Dial.md`

---

## 7.5.1 — Confirm the Canonical Complexity Package Boundary

- Document exactly what `@hbc/complexity` owns and inventory all complexity-related hooks/components outside the package as canonical, transitional, stub, remove, or redirect.
- **Known transitional path (PH7.5R, 2026-03-09):** `packages/ui-kit/src/hooks/useComplexity.ts` is a documented stub returning a static `{ variant: 'standard' }`, exported from `packages/ui-kit/src/hooks/index.ts` (line 17) and re-exported from `packages/ui-kit/src/index.ts` (line 196) as part of the public `@hbc/ui-kit` API. Classify as **remove**: delete the file and its two export entries; any consumer importing `useComplexity` from `@hbc/ui-kit` must switch to `import { useComplexity } from '@hbc/complexity'`. Note the return-type difference — the stub returns `{ variant }` while `@hbc/complexity` returns the full `IComplexityContext` shape (`{ tier, atLeast, is, setTier, showCoaching, ... }`).
- **Not complexity paths — classify as not applicable:** `useDensity`, `useAdaptiveDensity`, `useFormDensity`, and `density.ts` in `@hbc/ui-kit` are a physical display-density system (`compact | comfortable | touch` based on pointer-device detection). They are a distinct, parallel concern and must not be inventoried or modified as part of this phase.

## 7.5.2 — Complete the Sensitivity Matrix

- Create or finish `docs/reference/ui-kit/complexity-sensitivity.md` with per-surface tier behavior, override rules, coaching behavior, and SPFx/PWA notes.

## 7.5.3 — Perform the Retrofit Audit

- Audit candidate UI-kit and shell components for complexity participation and classify each as compliant, needs prop retrofit, needs provider integration, needs docs only, or not applicable.
- **Confirmed compliant (PH7.5R, 2026-03-09):** `HbcAuditTrailPanel` (`expert`), `HbcDataTable` advanced filters (`expert`), `HbcFormField` complexity-sensitive mode (`standard`), `HbcStatusTimeline` (`standard`), `HbcPermissionMatrix` (`expert`), `HbcCoachingCallout` (`essential`–`standard` + `showCoaching` check). All six use `useComplexityGate` from `@hbc/complexity` with correct internal defaults and `complexityMinTier`/`complexityMaxTier` override props.
- **HbcDataTable `_showAdvancedFilters` — intentional placeholder (PH7.5R, 2026-03-09):** The gate is called unconditionally (correct per Rules of Hooks) and its result stored in `_showAdvancedFilters`, but the advanced filter row UI does not yet exist — the underscore prefix documents this as an intentional future-feature placeholder. The gate is structurally complete; the guarded UI element is deferred to the module implementation phase. No change required; document this classification in audit results.
- **Not applicable — physical density system:** `useDensity`, `useAdaptiveDensity`, `useFormDensity`, and `density.ts` operate on `compact | comfortable | touch` tiers determined by pointer-device capability. They are not complexity surfaces and require no classification or retrofit.

## 7.5.4 — Normalize App Root Integration

- **Add and document** provider placement, storage mode, sync behavior, lock behavior, and coaching toggle availability for each runtime root. As of PH7.5R (2026-03-09), neither runtime root has `ComplexityProvider` wired.
- **PWA (`apps/pwa`):** Add `<ComplexityProvider>` (no props) inside `App.tsx`, wrapping the router content inside `HbcErrorBoundary`. No `spfxContext` prop — provider uses `localStorage` and attaches the `StorageEvent` listener for cross-tab sync (SF03-D01, D-05).
- **SPFx (per-module webpart apps):** The repo uses individual per-module SPFx webpart apps (`apps/accounting`, `apps/estimating`, etc.), each with its own webpart class that calls `createRoot(this.domElement)` independently. There is no shared Application Customizer, and React Context does not cross `createRoot` boundaries, making a centralised Application Customizer approach non-viable. The correct integration point is each module webpart's `render()` method: wrap `<App />` with `<ComplexityProvider spfxContext={this.context}>`. The `spfxContext` prop signals the provider to use `sessionStorage` and skip the `StorageEvent` listener (SF03-D01, D-05). One `ComplexityProvider` per webpart; each webpart's provider is isolated to that webpart's React tree.
- **Cross-webpart tier consistency in SPFx:** Each webpart reads `hbc::complexity::v1` from `sessionStorage` on mount, so webparts co-located on the same SharePoint page start at the same cached tier. Tier changes made in one webpart are not propagated to other webparts on the same page — this is acceptable per the per-site-type deployment model, where module apps rarely share a page. Document this behaviour explicitly in the app-root integration matrix.

## 7.5.5 — Remove Transitional Complexity Drift

- Eliminate or explicitly document temporary complexity paths outside the package, including duplicated types/enums or app-local fallback gating.
- **Primary drift target (PH7.5R, 2026-03-09):** Remove `packages/ui-kit/src/hooks/useComplexity.ts` (the SF02-T05 stub). Full removal checklist:
  1. Delete `packages/ui-kit/src/hooks/useComplexity.ts`.
  2. Remove `export { useComplexity } from './useComplexity.js'` from `packages/ui-kit/src/hooks/index.ts`.
  3. Remove `export { useComplexity } from './hooks/useComplexity.js'` (line 196) from `packages/ui-kit/src/index.ts`.
  4. Search the workspace for any import of `useComplexity` from `@hbc/ui-kit`; redirect each to `import { useComplexity } from '@hbc/complexity'`. The canonical return shape is `IComplexityContext` — adjust any call sites that destructured `{ variant }` to use `{ tier }` instead.
- **Physical density system — no action:** `useDensity`, `useAdaptiveDensity`, `useFormDensity`, and `density.ts` are not complexity drift. Do not touch them.

## 7.5.6 — Expand Test Coverage and Root Governance Alignment

- Ensure package-local tests cover provider behavior, storage, lock expiry, cross-tab sync, and coaching toggles, and prepare the package for PH7.8 root governance inclusion.

## 7.5.7 — Close the Shared-Feature Plan Loop

- Update `SF03-Complexity-Dial.md` to reflect actual retrofit, testing, and deployment/verification completion state.
- **SF03-T09 ADR number correction (PH7.5R, 2026-03-09):** SF03-T09 references `docs/architecture/adr/0012-complexity-dial-platform-primitive.md`. The actual `ADR-0012` in the repository is `ADR-0012-models-comprehensive-structure.md` — a conflict. Per PH7.4R findings, the next available sequential ADR number is **ADR-0081**. When executing SF03-T09, create `docs/architecture/adr/ADR-0081-complexity-dial-platform-primitive.md` (not `0012-...`). Update the SF03 master plan's ADR reference accordingly. The SF03-T09 task file itself also contains the wrong filename in its pre-deployment checklist and ADR content block — correct both to `ADR-0081-complexity-dial-platform-primitive.md` before or during execution.

---

## Deliverables

- `docs/reference/ui-kit/complexity-sensitivity.md`
- updated package docs
- app-root integration matrix
- retrofit audit results
- shared-feature plan closure notes

---

## Acceptance Criteria Checklist

- [x] `@hbc/complexity` is clearly the canonical source for complexity behavior.
- [x] Sensitivity matrix is published and complete for relevant surfaces.
- [x] App-root integration is documented and intentional.
- [x] Transitional/stub complexity paths are removed or explicitly documented.
- [x] Complexity-sensitive UI surfaces are audited and classified.
- [x] `SF03-Complexity-Dial.md` reflects true completion state.

---

## Verification Evidence

- `pnpm turbo run build --filter=@hbc/complexity`
- `pnpm turbo run lint --filter=@hbc/complexity`
- `pnpm turbo run check-types --filter=@hbc/complexity`
- `pnpm turbo run test --filter=@hbc/complexity`

---

## Progress Notes Template

```markdown
<!-- IMPLEMENTATION PROGRESS & NOTES
PH7.5 started: YYYY-MM-DD
PH7.5 completed: YYYY-MM-DD

Artifacts:
- `docs/reference/ui-kit/complexity-sensitivity.md`
- updated package docs
- app-root integration matrix
- retrofit audit results
- shared-feature plan closure notes

Verification:
- build: PASS/FAIL
- lint: PASS/FAIL
- check-types: PASS/FAIL
- test / validation: PASS/FAIL

Notes:
- unresolved items:
- deferred items with rationale:
-->
```

<!-- IMPLEMENTATION PROGRESS & NOTES
PH7.5R validation completed: 2026-03-09
Amendments applied: 2026-03-09

Findings:
- `packages/ui-kit/src/hooks/useComplexity.ts` confirmed as the sole transitional drift
  path. Stub returns { variant: 'standard' } statically; exported publicly from @hbc/ui-kit
  hooks/index.ts and index.ts. Return type differs from IComplexityContext ({ tier, ... }).
- PWA App.tsx confirmed missing ComplexityProvider. Provider tree is HbcThemeProvider >
  HbcErrorBoundary > [MsalGuard] > QueryClientProvider > RouterProvider.
- No SPFx Application Customizer app exists. Architecture uses per-module webpart apps
  (apps/accounting, apps/estimating, etc.), each with an independent createRoot() call.
  Application Customizer model from SF03-T09 is not viable — React Context does not cross
  createRoot boundaries. Correct integration: one ComplexityProvider per webpart render().
- HbcDataTable `_showAdvancedFilters` gate is computed but guards no UI element yet.
  Classified as intentional future-feature placeholder per owner direction.
- All 6 SF03-T07 retrofit components confirmed compliant (useComplexityGate from
  @hbc/complexity, correct defaults, IComplexityAwareProps override props).
- useDensity / useAdaptiveDensity / useFormDensity / density.ts classified as not applicable
  (physical display density, separate concern).
- SF03-T01–T08 complete (2026-03-08). SF03-T09 (Deployment) not yet executed.
- SF03-T09 references ADR-0012-complexity-dial-platform-primitive.md; actual ADR-0012 is
  ADR-0012-models-comprehensive-structure.md. Correct number is ADR-0081 (next sequential
  after ADR-0079, with ADR-0080 assigned to bic-next-move per PH7.4R).

Amendments applied:
- §7.5.1: named useComplexity stub as remove target with full export chain and type-shape
  note; classified density system as not applicable.
- §7.5.3: documented all 6 confirmed-compliant components; classified _showAdvancedFilters
  as intentional future-feature placeholder; classified density system as not applicable.
- §7.5.4: reframed from "document" to "add and document"; specified per-webpart
  ComplexityProvider pattern for SPFx with rationale (no Application Customizer,
  createRoot isolation); specified PWA placement; documented cross-webpart tier behavior.
- §7.5.5: added full 4-step removal checklist for ui-kit stub with call-site migration
  note (variant → tier).
- §7.5.7: added ADR-0081 correction directive covering SF03-T09 checklist and ADR
  content block.

Next: PH7.5 implementation (awaiting user confirmation to proceed).

PH7.5 implementation completed: 2026-03-09

Actions:
- Deleted packages/ui-kit/src/hooks/useComplexity.ts (11-line stub)
- Removed useComplexity export from hooks/index.ts, index.ts, app-shell.ts
- Migrated bic-next-move HbcBicBadge.tsx and HbcBicDetail.tsx imports from @hbc/ui-kit → @hbc/complexity
- Changed destructure from { variant } to { tier } in both components
- Updated 3 test mock files to mock @hbc/complexity with full IComplexityContext shape
- Added @hbc/complexity alias to bic-next-move vitest.config.ts
- Added @hbc/complexity dependency to bic-next-move package.json
- Wired ComplexityProvider into PWA App.tsx (no spfxContext prop — localStorage + StorageEvent)
- Wired ComplexityProvider into dev-harness App.tsx (no spfxContext prop — same as PWA)
- Wired ComplexityProvider with spfxContext prop into all 11 SPFx App.tsx files
- Updated all 11 SPFx WebPart.tsx render() calls to pass this.context as spfxContext
- Added @hbc/complexity dependency to all 13 app package.json files (PWA + dev-harness + 11 SPFx)
- Expanded complexity-sensitivity.md with Per-Surface Tier Behavior, Coaching Behavior, Storage Mode Notes, Cross-webpart Consistency sections
- Added Retrofit Audit Results section (6 compliant + 2 intentional exclusions)
- Corrected all 0012-complexity ADR references to ADR-0081 in SF03-T09-Deployment.md
- Appended progress comment to SF03-Complexity-Dial.md
- Marked all acceptance criteria as complete

Files modified: ~52 (1 deleted, 3 ui-kit exports, 2 bic-next-move source, 3 bic-next-move tests,
  2 bic-next-move config, 2 PWA, 2 dev-harness, 11 SPFx App.tsx, 11 SPFx WebPart.tsx,
  11 SPFx package.json, 3 docs)
-->
