# Phase 4C Development Plan – UI Design System Completion & Accessibility Hardening

**Version:** 1.0 (UI Kit Audit Remediation & Design Hardening)
**Purpose:** This document defines the complete Phase 4C implementation roadmap to elevate Phase 4 (UI Design System) from a baseline audit score of ~88.5–89.0% to a production-ready 99%+ through targeted accessibility fixes, token hardening, deprecated token removal, and comprehensive documentation.
**Audience:** Implementation agents, engineering leads, quality assurance, design system maintainers, and technical stakeholders.
**Implementation Objective:** Deliver a hardened, production-grade UI design system with full WCAG 2.2 AA accessibility compliance, zero hardcoded theme values, deprecated token resolution, complete Fluent UI pattern alignment, and comprehensive developer/operator documentation.

---

## Refined Blueprint Section for Phase 4C

### Locked Architectural Outcome

Phase 4C represents the *completion and hardening* of Phase 4. The UI design system is now:
- **Fully accessible** in both light and dark (Field Mode) themes with WCAG 2.2 AA compliance verified
- **Token-compliant** with zero hardcoded color/style values; all theme references use semantic CSS variables
- **Functionally complete** with all deprecated tokens scanned, identified, and either removed or versioned with tracking
- **Fluent UI aligned** with proper component integration patterns, shimmer utilities, and focus management hooks
- **Comprehensively documented** with role-specific guides for developers, operators, and component contributors
- **Audit-verified** at 99%+ across all scoring categories: theming, accessibility, functional completeness, code quality, and documentation

### Locked Decisions from the Structured Interview (2026-03-07)

#### 1. Task Granularity & File Structure
- **D-PH4C-01**: Nine independent concern-based task files (PH4C.1–PH4C.9) with interdependencies documented in hard prerequisites
- **D-PH4C-02**: Master plan file with complete file map, recommended sequence, release gating, and deferred-scope roadmap

#### 2. Deprecated Token Resolution
- **D-PH4C-03**: Scan-gated approach — run grep first; remove if zero usages; add versioned TSDoc + tracking issues if usages exist
- **D-PH4C-04**: Three deprecated tokens identified: `hbcColorSurfaceElevated`, `hbcColorSurfaceSubtle`, `hbcColorTextSubtle`

#### 3. Shimmer Infrastructure
- **D-PH4C-05**: Shared utility module MUST be created at `packages/ui-kit/src/shared/shimmer.ts` before PH4C.2 starts
- **D-PH4C-06**: Shimmer module exports conventions, theme-aware overlay patterns, and loading skeleton utilities

#### 4. Token Hardcoding Remediation
- **D-PH4C-07**: Replace all hardcoded values (`rgba(255,255,255,0.85)`, `HBC_SURFACE_LIGHT['...']`) with CSS variables
- **D-PH4C-08**: Define variables in both `hbcLightTheme` and `hbcFieldTheme` for dual-mode support

#### 5. Hook Wiring & Config Props
- **D-PH4C-09**: `useSavedViews` exported but not wired; documented as config-only prop with explicit deferred-scope note for controlled mode
- **D-PH4C-10**: `useFocusTrap` hook exists but not imported in HbcCommandPalette; WCAG 2.4.3 + 2.1.2 violation

#### 6. Status Badge High-Contrast Fix
- **D-PH4C-11**: Use `makeStyles` with Fluent tokens and `forced-colors` media query for Windows high-contrast mode support
- **D-PH4C-12**: Inline style overrides must be replaced with semantic Fluent Badge integration

#### 7. ESLint Compliance & Triage
- **D-PH4C-13**: Three-bucket triage — Fix Now (F-09, F-03, F-04) / Suppress with Justification / Escalate
- **D-PH4C-14**: ESLint linter integration for UI-kit consistency checks; Fluent import validation

#### 8. Dev Auth Bypass In Scope
- **D-PH4C-15**: MockAdapter pattern for Storybook testing; in scope as PH4C.9 (Dev Auth Bypass)
- **D-PH4C-16**: Boundary documented: dev-only code path, zero production leak

#### 9. ADR Selectivity
- **D-PH4C-17**: Three selective ADRs required — (A) shimmer convention, (B) deprecated token policy, (C) Dev Auth Bypass boundary
- **D-PH4C-18**: ADR file paths: `docs/architecture/adr/ADR-PH4C-01-shimmer-utility-convention.md`, etc.

#### 10. Release Gating: Two-Layer Model
- **D-PH4C-19**: Layer 1 — Automated gate (build, lint, type-check, test, bundle size, console validation)
- **D-PH4C-20**: Layer 2 — Manual gate with audit score ≥99% plus one named sign-off per role category

---

## Phase 4C Success Criteria

1. ✓ Shimmer shared utility module created at `packages/ui-kit/src/shared/shimmer.ts` with theme-aware conventions and loading skeleton helpers
2. ✓ HbcCommandPalette — `useFocusTrap` hook imported, called, and refs merged; focus trap confirmed in Storybook + Axe sweep
3. ✓ HbcDataTable — `<td headers>` attribute added to all cells; WCAG 1.3.1 compliance verified
4. ✓ HbcDataTable — shimmer overlay opacity replaced with CSS variable; Field Mode validation confirmed
5. ✓ HbcDataTable — stale/fresh border tokens replaced with CSS variables; both themes tested
6. ✓ HbcDataTable — responsibility row background token replaced with CSS variable; both themes validated
7. ✓ HbcConnectivityBar — hardcoded colors replaced with semantic token/variable references; Windows high-contrast tested
8. ✓ HbcStatusBadge — inline style overrides replaced with Fluent `makeStyles` + `forced-colors` media query
9. ✓ Deprecated tokens (`hbcColorSurfaceElevated`, `hbcColorSurfaceSubtle`, `hbcColorTextSubtle`) scanned; zero usages found or resolved with versioning + tracking issues
10. ✓ useSavedViews hook — config-only prop documented; deferred-scope note added for controlled mode implementation
11. ✓ ESLint compliance — three-bucket triage applied; high-severity issues fixed, medium suppressed with justification, low escalated
12. ✓ All 9 task files executed in recommended sequence; hard prerequisites verified before dependent tasks start
13. ✓ Three ADRs created: shimmer convention, deprecated token policy, Dev Auth Bypass boundary
14. ✓ All documentation files in correct `docs/` subfolders following Diátaxis structure (how-to, reference, adr, explanation)
15. ✓ Audit score reaches 99%+ across all categories (theming, accessibility, functional completeness, code quality, documentation)
16. ✓ Two-layer release gate passes: Layer 1 automated gates + Layer 2 manual audit ≥99% with named sign-offs
17. ✓ Final sign-off table completed with all roles (Code, QA, Accessibility, Design System Lead, Product Owner)

---

## Phase 4C Definition of Done

Phase 4C is complete when:
1. All 9 granular task files (PH4C.1 through PH4C.9) are executed in recommended sequence.
2. All hard prerequisites are verified before dependent tasks begin (especially PH4C.7 → PH4C.2 dependency).
3. Phase 4 audit coverage reaches **99%+** across all five categories: theming & token compliance, accessibility & WCAG 2.2 AA, functional completeness, code quality & Fluent UI patterns, and documentation.
4. `pnpm turbo run build --filter=@hbc/ui-kit` succeeds with zero warnings.
5. `pnpm turbo run lint --filter=@hbc/ui-kit` succeeds with zero violations (high-severity compliance, suppressions justified, escalations documented).
6. `pnpm turbo run check-types --filter=@hbc/ui-kit` succeeds with zero type errors.
7. Storybook Axe sweep on all affected components (HbcCommandPalette, HbcDataTable, HbcStatusBadge, HbcConnectivityBar) confirms zero accessibility violations.
8. Production bundle contains zero references to deprecated tokens or hardcoded color values in UI Kit components.
9. All documentation files exist in correct `docs/` subfolders and follow Diátaxis structure.
10. All ADRs (3 total) are created and cross-linked.
11. Final Layer 1 + Layer 2 release gate passes; all sign-offs recorded with dates and role IDs.

---

## Scope Boundaries

### In Scope for Phase 4C
- Shimmer shared utility module creation and theme-aware loading skeleton helpers
- Focus management hook integration (useFocusTrap) into HbcCommandPalette with ref merging and keyboard navigation testing
- WCAG 1.3.1 headers attribute addition to all HbcDataTable `<td>` elements with column id mapping
- Token hardcoding remediation in HbcDataTable (shimmer overlay, stale/fresh borders, responsibility row background)
- Token hardcoding remediation in HbcConnectivityBar (action button hardcoded colors)
- StatusBadge high-contrast fix with `makeStyles` and `forced-colors` media query
- Deprecated token scan-gated resolution (three tokens: identify usages, remove or version with tracking)
- useSavedViews config-only prop documentation with deferred-scope note for controlled mode
- ESLint compliance triage and UI-kit linter integration
- Dev Auth Bypass pattern for Storybook MockAdapter integration (PH4C.9)
- Three selective ADRs (shimmer convention, deprecated token policy, Dev Auth Bypass boundary)
- Comprehensive how-to guides for developers, operators, and component contributors
- Two-layer release gating with automated Layer 1 and manual audit-based Layer 2

### Explicitly Deferred
- `useSavedViews` controlled mode implementation (documentation only; implementation planned for Phase 5)
- New component creation beyond those in audit (only existing components are hardened)
- Design system visual redesign (only token/accessibility hardening in scope)
- Localization or internationalization (baseline WCAG 2.1 AA scope only)
- Performance optimizations beyond shimmer/bundle validation
- Fluent UI library version upgrades (use locked version from Phase 4)

---

## Implementation Principles

1. **Copy-Paste Ready**: Every code block in every task file is complete, production-grade, and immediately executable. No `// ...` truncations or pseudo-code.
2. **Locked Decisions Embedded**: Every implementation step and code block references the relevant D-PH4C-XX decision, enforcing traceability to the structured interview.
3. **Hard Prerequisites Enforced**: Each dependent task file includes a `## Prerequisites` section with exact verification commands; dependent task must not start until prerequisites pass.
4. **Dual-Theme Testing**: All token replacements include definitions in both `hbcLightTheme` and `hbcFieldTheme`; Field Mode validation is mandatory for every token change.
5. **WCAG 2.2 AA Baseline**: All accessibility fixes target WCAG 2.2 AA compliance; Axe sweep is verification tool of record.
6. **Diátaxis Structure**: All documentation lives in correct `docs/` subfolders (how-to, reference, explanation, adr) with clear audience separation (developer, operator, contributor).
7. **Scan-Gated Deprecation**: Deprecated tokens are scanned for usages first; removal or versioning decision is data-driven, not assumption-based.
8. **Role-Based Sign-Off**: Final approval requires sign-off from code review, QA, accessibility, design system, and product ownership roles.

---

## Deliverables Summary

### Code Changes
- 9 component/theme files updated with accessibility fixes and token replacements
- 1 new shimmer shared utility module created
- 1 new MockAdapter pattern for Storybook dev testing
- All changes backward-compatible with production; zero breaking changes

### Documentation (8 files, Diátaxis-compliant)
- 2 How-To guides (developer component building, operator deployment)
- 1 Explanation guide (design system architecture)
- 5 Reference guides (shimmer utility, token remediation, deprecated tokens, accessibility patterns, etc.)

### Architecture Decision Records (3 ADRs)
- ADR-PH4C-01: Shimmer utility convention
- ADR-PH4C-02: Deprecated token policy
- ADR-PH4C-03: Dev Auth Bypass boundary

---

## Recommended Implementation Sequence

### Phase 4C Task Execution Order

> **Critical dependency:** `PH4C.7` is the only hard prerequisite in the chain. It must be complete before `PH4C.2` begins. All other tasks are independent and may run in parallel once their prerequisites are satisfied.

1. **PH4C.7 – Shimmer Infrastructure** (**START HERE — FOUNDATIONAL**, 2–3 hours)
   - Creates `packages/ui-kit/src/shared/shimmer.ts` — prerequisite for PH4C.2
   - Updates HbcDataTable shimmer import + implements CommandPalette AI shimmer
   - Creates ADR for shimmer utility convention
   - Verify: `ls packages/ui-kit/src/shared/shimmer.ts` + `pnpm turbo run build --filter=@hbc/ui-kit`

2. **PH4C.9 – Dev Auth Bypass / Storybook MockAdapter** (2–3 hours, independent — run in parallel with PH4C.7 if desired)
   - Wire `@hbc/auth` `MockAdapter` into Storybook global preview
   - **Must complete before PH4C.8** so verification sweeps run against authenticated stories
   - Creates ADR for Dev Auth Bypass boundary
   - Verify: `pnpm --filter @hbc/ui-kit storybook` renders mock user correctly

3. **PH4C.1 – Accessibility & Focus Management** (3–4 hours, independent)
   - `useFocusTrap` import + ref merge in `HbcCommandPalette`
   - `headers` attribute on all `<td>` elements in `HbcDataTable`
   - Verify: Storybook Axe sweep — zero critical/serious violations

4. **PH4C.2 – Theme Token Hardcoding** (4–5 hours, **REQUIRES PH4C.7 complete**)
   - Four token replacement tasks: DataTable shimmer, borders, responsibility row + ConnectivityBar
   - CSS variables defined in both `hbcLightTheme` and `hbcFieldTheme`
   - Verify: `grep -r "HBC_SURFACE_LIGHT\[" packages/ui-kit/src/HbcDataTable/` → zero results

5. **PH4C.3 – Deprecated Token Resolution** (2–3 hours, recommended after PH4C.2)
   - Scan-gated: grep first → remove if zero usages, TSDoc + tracking if usages found
   - Creates migration guide at `docs/how-to/developer/deprecated-token-migration.md`
   - Creates ADR for deprecated token policy
   - Verify: scan result documented in progress notes

6. **PH4C.4 – SavedViews Integration** (2–3 hours, independent)
   - Add optional `savedViewsConfig` prop to `HbcDataTable`
   - Internal `useSavedViews` delegation + backward compatibility confirmed
   - Explicit deferred-scope note for controlled mode
   - Verify: Storybook `WithSavedViews` story renders correctly

7. **PH4C.5 – ESLint Fluent Import Compliance** (2–4 hours, independent)
   - Three-bucket triage across all 14 `apps/` directories
   - Fix Now / Suppress with Justification / Escalate
   - Verify: `pnpm turbo lint` → zero unexplained `no-direct-fluent-import` violations

8. **PH4C.6 – High-Contrast & Code Quality Patterns** (1–2 hours, independent)
   - Replace `HbcStatusBadge` inline `style` with `makeStyles` + `forced-colors` media query
   - All HBC status variants covered
   - Verify: Storybook high-contrast story renders correctly

9. **PH4C.8 – Verification, Testing & Documentation Closure** (**FINAL — do last**, 3–4 hours, **REQUIRES PH4C.9 complete**)
   - Touch density row height assertion (≥56px)
   - Confirm `HbcEmptyState.md` and `HbcErrorBoundary.md` present
   - Full monorepo gate: lint + type-check + build + test + storybook build
   - Storybook Axe sweep — all modified components
   - Audit score recalculation ≥99%
   - Layer 1 + Layer 2 release gate sign-off

---

## Release Gate Criteria – Two-Layer Model

### Layer 1: Automated Verification (11 gates, all must pass)

1. Build: `pnpm turbo run build --filter=@hbc/ui-kit` — Exit 0, zero warnings
2. Lint: `pnpm turbo run lint --filter=@hbc/ui-kit` — Exit 0, zero violations
3. Type-Check: `pnpm turbo run check-types --filter=@hbc/ui-kit` — Exit 0
4. Unit Test: `pnpm turbo run test --filter=@hbc/ui-kit` — Exit 0, ≥95% coverage
5. Bundle Size: Within baseline +10% or documented
6. Accessibility Sweep: Storybook Axe (4 components) — Zero WCAG 2.2 AA violations
7. Console Validation: Dev harness light + dark modes — Zero errors
8. Deprecated Token Leak: Grep scan — Zero matches or tracked
9. Hardcoded Value Leak: Grep scan — Zero matches
10. Production Mock Leak: Grep in dist/ — Zero matches
11. Documentation Gate: 8 files in correct folders, Diátaxis structure, links valid

### Layer 2: Manual Audit (after Layer 1 passes)

| Category | Weight | Target | Requirement |
|----------|--------|--------|-------------|
| Theming & Token Compliance | 30% | 100% | All hardcoded values replaced; dual-theme support |
| Accessibility & WCAG 2.2 AA | 25% | 100% | Axe sweep clean; focus management tested |
| Functional Completeness | 25% | 100% | All tasks completed; prerequisites verified |
| Code Quality & Fluent UI Patterns | 15% | 100% | ESLint triage applied; patterns enforced |
| Documentation & Maintainability | 5% | 100% | Diátaxis compliant; audience separation clear |
| **OVERALL SCORE TARGET** | **100%** | **≥99%** | **Minimum 49.5/50 points** |

**Named Sign-Offs Required:**
- Code Review Lead
- QA Lead
- Accessibility Lead
- Design System Lead
- Product Owner

---

## ADR Register

| ADR | File | Decision | Date |
|-----|------|----------|------|
| ADR-PH4C-01 | `docs/architecture/adr/ADR-PH4C-01-shimmer-utility-convention.md` | Shimmer utility module convention and theme-aware patterns | 2026-03-07 |
| ADR-PH4C-02 | `docs/architecture/adr/ADR-PH4C-02-deprecated-token-policy.md` | Deprecated token scan-gated resolution policy | 2026-03-07 |
| ADR-PH4C-03 | `docs/architecture/adr/ADR-PH4C-03-dev-auth-bypass-boundary.md` | Dev Auth Bypass Storybook scope and zero-production-leak gating | 2026-03-07 |

---

## Phase 4C Task Files

> **Note:** Execute in the recommended sequence below. `PH4C.7` is the only hard prerequisite — it must be complete before `PH4C.2` can begin.

| File | Concern | Source Tasks | Duration |
|------|---------|--------------|----------|
| `PH4C.1-Accessibility-Focus-Management.md` | Focus trap + WCAG table headers | A-01, D-01 | 3–4 hours |
| `PH4C.2-Theme-Token-Hardcoding.md` | DataTable + ConnectivityBar token fixes | B-01, B-02, B-03, B-04 | 4–5 hours |
| `PH4C.3-Deprecated-Token-Resolution.md` | Scan-gated deprecated token removal | B-05 | 2–3 hours |
| `PH4C.4-SavedViews-Integration.md` | `useSavedViews` internal wiring + deferred-scope note | C-01 | 2–3 hours |
| `PH4C.5-ESLint-Fluent-Import-Compliance.md` | Three-bucket ESLint audit across all `apps/` | C-02 | 2–4 hours |
| `PH4C.6-HighContrast-CodeQuality.md` | `HbcStatusBadge` `makeStyles` + `forced-colors` fix | D-02 | 1–2 hours |
| `PH4C.7-Shimmer-Infrastructure.md` | Shared shimmer module + CommandPalette AI loading (**FOUNDATIONAL — do first**) | D-03 | 2–3 hours |
| `PH4C.8-Verification-Testing-Documentation.md` | Full verification, testing, ADR creation, release gate closure | E-01–E-04 | 3–4 hours |
| `PH4C.9-DevAuthBypass-Storybook.md` | `MockAdapter` Storybook integration + Dev Auth Bypass boundary | New scope | 2–3 hours |

---

## Deferred-Scope Roadmap

| Item | Not In Scope | Deferral Reason | Future Direction |
|------|--------------|-----------------|------------------|
| useSavedViews controlled mode | Component state mgmt | Requires design + research | Phase 5+ |
| New component creation | Beyond audit scope | Separate design phase | Phase 6+ |
| Design system visual redesign | Token/a11y hardening only | Requires brand alignment | Future refresh |
| Localization / i18n | Baseline WCAG 2.1 AA | Vendor integration needed | Phase 7+ |
| Performance optimizations | Beyond shimmer/bundle | Requires profiling phase | Phase 5+ |
| Fluent UI library upgrades | Using locked version | Requires migration testing | Future phase |

---

**End of Phase 4C Master Plan**

<!-- IMPLEMENTATION PROGRESS & NOTES
Phase 4C master plan created: 2026-03-07
All 9 task files to follow (PH4C.1–PH4C.9).
Locked decisions: D-PH4C-01 through D-PH4C-20 embedded.
Hard prerequisites: PH4C.7 → PH4C.2 dependency documented.
Release gating: Two-layer model (11 automated + manual audit ≥99% + named sign-offs).
ADR register: 3 selective ADRs planned (shimmer, deprecated token policy, Dev Auth Bypass).
Status: READY FOR IMPLEMENTATION.
Next: Execute PH4C.7 (Shimmer) as prerequisite before PH4C.2 can begin.
-->
