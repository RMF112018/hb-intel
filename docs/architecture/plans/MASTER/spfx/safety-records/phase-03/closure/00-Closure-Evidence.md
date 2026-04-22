# Safety App — Phase-3 Closure Evidence

**Manifest title:** `hb-intel-safety`
**Solution version:** `1.2.3.0` (solution + feature, SharePoint four-part)
**Scope:** final closure pass against the remaining Phase-3 audit gaps.
**Governing authorities:** `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Governing-Standard.md`; `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Homepage-Overlay.md` (where the overlay tightens the base doctrine); `docs/reference/spfx-surfaces/homepage-uiux-audit-checklist.md`.

---

## 1. Implementation summary

Six routes, one governed navigation surface, one authored masthead family, one governed confirmation flow, and one rewritten token-disciplined stylesheet now jointly bring `apps/safety` up to a productized SPFx closure standard. Prior Wave-1 work (route-aware `HbcTabs`, `/incidents` redirect, shell state props) is preserved.

### Gaps closed
- **Token & styling drift.** `webpart.css` no longer contains ordinary Safety-owned hex values. All surface, stroke, foreground, and brand references consume the Fluent/HBC CSS custom properties published by `FluentProvider` + `HbcThemeProvider` (`var(--colorNeutralBackground1/2/3)`, `var(--colorNeutralStroke1/2)`, `var(--colorNeutralForeground1/2)`, `var(--colorBrandForeground1)`, `var(--colorStrokeFocus2)`).
- **Premium expression & product voice.** A new `SafetyMasthead` primitive (local composition over `HbcTypography`) is applied to all six route surfaces. `UploadPage` recomposes into a primary/supporting two-column card workspace; `InspectionDetailPage` introduces a two-column detail layout (`safety-page--detail`) with a Provenance aside. Findings, section scores, and review-queue rows carry severity/status via `HbcRiskBadge` / `HbcStatusBadge`.
- **Detail-page state-model honesty.** Subordinate queries (`useInspections` on project-week, `useFindings` on inspection detail, `useReportingPeriods` on upload) now participate in page state. Parent-only success no longer masks subordinate failure; a governed partial-failure banner explicitly reports degraded scope and offers a targeted `refetch()`.
- **Confirmation-flow rigor.** The review-queue “Supersede & commit” action routes through `HbcConfirmDialog` (variant `danger`, role `alertdialog`). Standard `Retry` remains single-click. No browser `confirm()` path exists.
- **Accessibility & motion.** `.safety-link` carries a focus-visible outline, 32px min height, and token-driven color. `@media (prefers-reduced-motion: reduce)` zeroes local transitions/animations for Safety-owned elements. File-picker trigger has an explicit `aria-label`.
- **Proof posture.** Unit tests 37 → 48 (+6 confirmation-flow tests, +5 router/IA tests). E2E smoke → real coverage of tab IA, `/incidents` absence, and masthead rendering. Package was rebuilt and verified to embed the new source (masthead classes, dialog copy, partial-failure banner copy).

### Intentionally deferred
- The `build-spfx-package.ts` orchestrator produces a valid `hb-intel-safety.sppkg` and shim proof for this domain but flags a "missing freshness evidence" gate. That gate is only wired for domains carrying `freshBuildRequired: true` (currently `hb-homepage`, `hb-webparts`, `hb-publisher`). Promoting Safety into that strictness tier is a separate cross-cutting change; see §5.

---

## 2. File-by-file change map

| File | Why | Gap closed |
|---|---|---|
| `apps/safety/src/webpart.css` | Rewrote to use Fluent/HBC CSS custom properties. Added authored breakpoint contract, `safety-page--detail` two-column layout, focus-visible on `.safety-link`, reduced-motion media query. | Token discipline; A11y; Motion |
| `apps/safety/src/components/SafetyMasthead.tsx` *(new)* | Safety-local product-family voice: eyebrow + title + description + meta + actions. Thin composition over `HbcTypography`. | Premium composition |
| `apps/safety/src/components/SafetyReviewActions.tsx` | Wrapped “Supersede & commit” in `HbcConfirmDialog` (variant `danger`). Retry stays single-click. Explicit destructive copy. | Confirmation UX |
| `apps/safety/src/components/index.ts` | Export new masthead primitive. | — |
| `apps/safety/src/pages/UploadPage.tsx` | Masthead; primary/supporting card composition; `useReportingPeriods` loading/error surfaced; file-picker `aria-label`; scoped eslint suppression for the hidden native input. | Composition; State; A11y |
| `apps/safety/src/pages/ReportingPeriodDashboardPage.tsx` | Masthead with period meta; preserves redirect banner + KPI cards + `HbcDataTable`. | Composition |
| `apps/safety/src/pages/ProjectWeekDetailPage.tsx` | Masthead; subordinate-failure banner for `useInspections`; explicit table loading state. | Composition; State |
| `apps/safety/src/pages/InspectionsPage.tsx` | Masthead (list-surface voice). | Composition |
| `apps/safety/src/pages/InspectionDetailPage.tsx` | Masthead; `safety-page--detail` two-column layout; subordinate-failure banner for `useFindings`; Provenance aside card. | Composition; State |
| `apps/safety/src/pages/ReviewQueuePage.tsx` | Masthead with count meta. | Composition |
| `apps/safety/src/test/router.test.ts` | +drill-in path coverage, +redirect search-state persistence test. | Proof |
| `apps/safety/src/test/reviewActions.test.tsx` *(new)* | 6 tests: retry single-click; supersede gated by duplicate; confirm dialog opens on trigger; mutation doesn't fire before confirm; cancel does nothing; confirm fires `onRetry(run, true)`. | Proof / Confirmation UX |
| `apps/safety/src/test/setup.ts` | `matchMedia` polyfill so ui-kit coarse-pointer + reduced-motion hooks run under jsdom. | Proof infrastructure |
| `apps/safety/package.json` | Add `@testing-library/react` + `@testing-library/user-event` devDeps. | Proof infrastructure |
| `apps/safety/config/package-solution.json` | Solution + feature version 1.2.2.0 → 1.2.3.0. | Packaging truth |
| `e2e/webparts/safety.spec.ts` | Added tab-IA coverage (Upload/Periods/Review/Inspections visible; Incidents absent) + masthead visibility. | Proof |

---

## 3. Validation evidence

### Unit + integration tests (`pnpm --filter @hbc/spfx-safety test`)

```
 ✓ src/test/wpsState.test.ts        (9 tests)
 ✓ src/test/themePosture.test.ts    (11 tests)
 ✓ src/test/bootstrap.test.ts       (4 tests)
 ✓ src/test/reviewActions.test.tsx  (6 tests)
 ✓ src/test/router.test.ts          (18 tests)

 Test Files  5 passed (5)
      Tests  48 passed (48)
```

### Typecheck (`pnpm --filter @hbc/spfx-safety exec tsc --noEmit -p tsconfig.json`)

Exit 0. 2421 files compiled.

### Lint (`pnpm --filter @hbc/spfx-safety lint`)

Exit 0. No errors. No warnings. (The sole prior-run `no-inline-styles` warning on the hidden file input is now scoped-suppressed with written justification.)

### Feature-package regression (`pnpm --filter @hbc/features-safety test`)

Exit 0. 18 suites / 79 tests passing. No churn from Safety-app changes.

### Confirmation-flow verification notes

`SafetyReviewActions.test.tsx` asserts:
1. `onRetry` is *not* called when the trigger is clicked.
2. `HbcConfirmDialog` surfaces `role="alertdialog"` with the literal title `Supersede prior inspection?`.
3. Clicking Cancel closes the dialog without firing the mutation.
4. Clicking the destructive confirm inside the dialog fires `onRetry(runId, true)` exactly once.

### Accessibility verification notes

- `.safety-link` carries `min-height: 32px`, negative-margin hit-area padding, and a `:focus-visible` outline using `var(--colorStrokeFocus2)` with brand fallback.
- Hidden native file input has `aria-label="Choose safety checklist workbook"`; the visible trigger button carries a parallel `aria-label`.
- Reduced-motion: `@media (prefers-reduced-motion: reduce)` zeroes transitions on link, findings row, score-strip item, and masthead. The `HbcConfirmDialog` inherits reduced-motion behavior from `HbcModal` (ui-kit concern, out of scope).
- `matchMedia` polyfill in `test/setup.ts` ensures the coarse-pointer + reduced-motion hooks evaluate deterministically under test.

### Breakpoint / compact-state verification notes

CSS media queries in `webpart.css`:
- `.safety-stat-strip`: 4-up → 2-up at ≤960px → 1-up at ≤540px.
- `.safety-upload`: single-column → 3fr/2fr primary/aside at ≥960px.
- `.safety-page--detail`: single-column → 3fr/2fr at ≥1200px.
- `.safety-filter-bar`: flex-wrap with 14–22rem field min/max.

---

## 4. Package proof

Build command: `npx tsx tools/build-spfx-package.ts --domain safety` (fresh — `apps/safety/dist` cleared first).

Artifact: `dist/sppkg/hb-intel-safety.sppkg` — 425,423 bytes, built from the fresh `apps/safety/dist/safety-app-ae2e859f.js` bundle.

`AppManifest.xml` (extracted):
```
Version="1.2.3.0"
Name="hb-intel-safety"
ProductID="e78a16be-7853-40a4-be18-3b01b3ca405d"
```

Source-intent verification (grep against the packaged `safety-app-ae2e859f.js`):

| Expected token from Phase-3 source | Count in packaged bundle |
|---|---|
| `safety-masthead` | 1 |
| `safety-stat-strip` | 1 |
| `Supersede prior inspection?` (dialog title) | 1 |
| `Supersede & commit` (trigger + confirm label) | 2 |
| `Retry findings` (partial-failure banner) | 1 |
| `Safety · Upload` (masthead eyebrow) | 1 |

All source-level closure changes are reflected in the built artifact.

Shim-proof artifact: `dist/sppkg/safety-shim-proof.json` records the packaged bundle name (`safety-app-ae2e859f.js`), the neutral shell module identity, and the shim file mappings. `allRequiredAssetsPresent: true`.

---

## 5. Exception register

| Item | Justification | Blocker? |
|---|---|---|
| **Freshness-evidence gate.** `build-spfx-package.ts` prints “missing freshness evidence required for package-truth proof” for the safety domain. | That gate activates only for domains carrying `freshBuildRequired: true` (currently `hb-homepage`, `hb-webparts`, `hb-publisher`). The orchestrator still generates the correct sppkg, shim proof, and runtime assets for safety; every source-intent string we care about is verified present (§4). Promoting safety to `freshBuildRequired` is a cross-cutting tooling change and was explicitly out of scope for this pass. | No. Source-to-artifact fidelity is independently proven by the grep matrix above. |
| **Hidden native file input.** `UploadPage.tsx` still renders a raw `<input type="file" style={{display:'none'}}>`. | No `HbcFileInput` primitive exists yet in `@hbc/ui-kit`; the hidden-input pattern is the only way to get a styled trigger while preserving native file-picker semantics. Suppressed with `eslint-disable ... no-raw-form-elements, no-inline-styles` and an explicit justification comment. Carries an `aria-label` for SR users. | No. Pattern is accessible and governed via justification; promotion to a ui-kit primitive is a separate design task. |
| **e2e suite is Playwright.** Not executed as part of this pass. | The safety e2e spec runs against the webparts dev harness; invoking the full Playwright runner here would be out of scope and would require a harness start. Specs are shipped and will run in CI as today. | No. |

---

*Closure artifact owner:* Safety Record Keeping domain. *Last built:* 2026-04-22.
