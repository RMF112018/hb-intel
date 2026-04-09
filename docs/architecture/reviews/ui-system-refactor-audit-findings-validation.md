# UI-System Refactor Audit Findings Validation

**Date:** 2026-04-08
**Scope:** Validate ChatGPT UI-system audit findings against live repository truth
**Method:** Direct inspection of code, exports, consumers, enforcement, docs, and build artifacts
**Branch:** main (commit ba8966aa)

---

## 1. Executive Conclusion

The prior ChatGPT audit was **mostly accurate with corrections needed on consumer migration framing and enforcement completeness**.

The repo is genuinely in a "mostly conforming with targeted gaps" posture. The foundation, primitive, and surface-family layers are real and materially improved. However:

- **Consumer migration completeness was overstated.** The audit's "6/9 migrated" framing does not hold against repo truth. Actual clean shared-surface-family adoption is **4/9**, with 1 partial and 4 fully local.
- **Foundation color drift is real** — two distinct brand palettes exist (`tokens.ts` vs `homepage.ts`) with no single governing source.
- **Enforcement is incomplete** — ESLint blocks some disallowed imports but `vite.config.ts` still aliases the root entry point as a fallback.
- **Productive-lane hardening is asserted but under-evidenced** — the execution note claims zero contamination without naming specific productive consumers inspected.
- **Visual proof exists at surface-family level but not at consumer level** — no screenshots of actual webpart compositions in homepage context.

**Repo-truth conformance judgment:** The UI-system refactor has delivered real architectural value — layered entry points, separated primitives, first-class presentation surface families, and credible build/packaging proof. It is not fully conforming and should not be represented as such. The gaps are specific, identifiable, and tractable.

---

## 2. Validation Matrix

| Finding ID | Finding Summary | Status | Repo-Truth Verdict | Key Evidence |
|:---:|---|:---:|---|---|
| F01 | Overall: mostly conforming with targeted gaps | **Confirmed** | Accurate | 5/9 consumers use shared surfaces; foundation drift and enforcement gaps exist |
| F02 | Foundation drift still exists | **Confirmed** | Real gap, possibly intentional but ungoverned | `tokens.ts` (#004B87/#F37021) vs `homepage.ts` (#225391/#E57E46) — two distinct brand color sets |
| F03 | Primitive layer is real and improved | **Confirmed** | Accurate | `primitives.ts` exports 30+ L2 components, clearly separated from surface families |
| F04 | Shared presentation surface families are real | **Confirmed** | Accurate | 6 surface families with differentiated visual grammar, not disguised productive cards |
| F05 | Homepage consumer migration is incomplete | **Confirmed with correction** | Audit understated the gap | 4/9 cleanly migrated, 1 partial, 4 local — not 6/9 as framed |
| F06 | Productive-lane hardening is under-proven | **Partially Confirmed** | Assertion without named evidence | Execution note asserts zero contamination; no named productive consumers inspected |
| F07 | Boundary/enforcement alignment incomplete | **Confirmed** | Accurate | ESLint blocks root + app-shell; vite.config.ts still aliases root as fallback |
| F08 | Documentation directionally strong but not reconciled | **Confirmed** | Accurate | Execution note overstates migration completeness; some generic consumer references |
| F09 | Packaging/build proof is real | **Confirmed** | Accurate | 11 GUIDs traceable manifest → mount → component → bundle |
| F10 | Verification/visual proof remains incomplete | **Confirmed** | Accurate | Surface-family screenshots exist; no consumer-level visual proof; 13 pre-existing test failures |

---

## 3. Detailed Validation by Finding

### Finding 01 — Overall Conclusion

**Finding:** The repo is mostly conforming with targeted gaps, not fully conforming and not materially off-target.

**Verdict: Confirmed**

**Files inspected:** All 9 named consumer webparts, `packages/ui-kit/package.json`, `packages/ui-kit/src/homepage.ts`, `packages/ui-kit/src/primitives.ts`, `apps/hb-webparts/.eslintrc.cjs`, `apps/hb-webparts/vite.config.ts`

**What is proven:**
- The layered entry-point system (8 entry points) is real and functional.
- 160+ public symbols are classified across foundation, primitive, surface-family, and adapter layers.
- 5 of 9 named homepage consumers use shared surface families from `@hbc/ui-kit/homepage`.
- Build/packaging pipeline produces traceable artifacts.

**What is not proven:**
- Full consumer migration — 4 consumers remain fully local with extensive hardcoded styling.
- Full enforcement — doctrine describes stricter import discipline than is actually enforced.
- Full visual conformance — no consumer-level visual proof exists.

**Audit wording:** Should stand as-is. "Mostly conforming with targeted gaps" is the correct characterization.

---

### Finding 02 — Foundation Drift Still Exists

**Finding:** The foundation layer improved materially, but the repo still has real brand-token drift and not one fully clean shared source of truth.

**Verdict: Confirmed**

**Files inspected:** `packages/ui-kit/src/theme/tokens.ts`, `packages/ui-kit/src/homepage.ts`, `apps/hb-webparts/src/webparts/projectPortfolioSpotlight/ProjectPortfolioSpotlight.tsx`, `apps/hb-webparts/src/webparts/peopleCulture/PeopleCultureMerged.tsx`, surface-family CSS modules

**What is proven:**

**Primary brand blue:**
| Source | Value | Notes |
|---|---|---|
| `tokens.ts` `HBC_PRIMARY_BLUE` | `#004B87` / `rgb(0, 75, 135)` | Canonical HB logo-derived primary |
| `homepage.ts` `HBC_HOMEPAGE_BRAND_FOUNDATION.primaryBlue` | `#225391` / `rgb(34, 83, 145)` | Redefined for homepage — different value |
| CSS modules (all 6 surfaces) | `rgba(34, 83, 145, ...)` | Use homepage value, not tokens.ts |
| `ProjectPortfolioSpotlight.tsx` local `HB.blue` | `#225391` | Hardcodes homepage value locally |
| `PeopleCultureMerged.tsx` local `HB.blue` | `#225391` | Hardcodes homepage value locally |

**Accent orange:**
| Source | Value | Notes |
|---|---|---|
| `tokens.ts` `HBC_ACCENT_ORANGE` | `#F37021` / `rgb(243, 112, 33)` | Canonical HB accent |
| `homepage.ts` `HBC_HOMEPAGE_BRAND_FOUNDATION.secondaryOrange` | `#E57E46` / `rgb(229, 126, 70)` | Redefined — warmer, lighter |
| CSS modules (all 6 surfaces) | `rgba(229, 126, 70, ...)` | Use homepage value, not tokens.ts |
| `ProjectPortfolioSpotlight.tsx` local `HB.orange` | `#E57E46` | Hardcodes homepage value locally |
| `PeopleCultureMerged.tsx` local `HB.orange` | `#E57E46` | Hardcodes homepage value locally |

**Analysis:** The homepage brand colors are likely intentional — softer, warmer tones for premium presentation surfaces vs. the app-shell primary identity. However, this distinction is **not governed by any documented decision**. `homepage.ts` redefines rather than deriving from `tokens.ts`, and two large consumers (`ProjectPortfolioSpotlight`, `PeopleCultureMerged`) duplicate the homepage values locally rather than importing them.

This is a real conformance gap: two brand-color definitions exist without a single governing source or documented rationale for the divergence.

**Audit wording:** Should stand as-is. The drift is real and correctly identified.

---

### Finding 03 — Primitive Layer Is Real and Materially Improved

**Finding:** `@hbc/ui-kit/primitives` is real, clearly separates primitives from surface families, and materially improves package clarity.

**Verdict: Confirmed**

**Files inspected:** `packages/ui-kit/src/primitives.ts`, `packages/ui-kit/package.json`

**What is proven:**
- `@hbc/ui-kit/primitives` entry point exists in package.json exports map.
- `primitives.ts` exports 30+ Layer-2 building blocks: buttons, typography, status badges, form fields, text areas, rich text editors, cards, modals, panels, tearsheets, popovers, confirm dialogs, banners, toasts, tooltips, empty states, coaching callouts, error boundaries, breadcrumbs, tabs, pagination, search, segmented controls, bottom nav, trees, description lists, score bars, status timelines, approval steppers.
- `primitives.ts` explicitly excludes surface families, module-specific UI, app shell, homepage surfaces, and data-fetching components via documented governance comments.
- Clean separation between Layer 2 (primitives) and Layer 3 (surface families) is architecturally real.

**What is not proven:**
- Consumer adoption breadth — the primitive entry point exists but the exploration did not measure how many consumers import from `@hbc/ui-kit/primitives` vs the root barrel. The impact is currently more architectural than consumer-proven.

**Audit wording:** Should stand as-is. The finding is accurate. The consumer-adoption caveat is worth noting but does not change the verdict.

---

### Finding 04 — Shared Presentation Surface-Family System Is Real

**Finding:** `@hbc/ui-kit/homepage` truly exposes first-class presentation surface families that are more than disguised productive cards.

**Verdict: Confirmed**

**Files inspected:** `packages/ui-kit/src/homepage.ts`, `packages/ui-kit/src/HbcSignatureHeroSurface/index.tsx`, `packages/ui-kit/src/HbcEditorialSurface/index.tsx`, `packages/ui-kit/src/HbcOperationalSurface/index.tsx`, `packages/ui-kit/src/HbcCommandSurface/index.tsx`, `packages/ui-kit/src/HbcLauncherSurface/index.tsx`, `packages/ui-kit/src/HbcDiscoverySurface/index.tsx`, associated CSS modules

**What is proven:**
- 6 distinct surface families exist as real components with differentiated visual grammar:
  - **HbcSignatureHeroSurface:** Full-width flagship with branded gradient, motion choreography, asymmetric layout
  - **HbcEditorialSurface:** Magazine-like featured/secondary rhythm with editorial spacing and Radix separators
  - **HbcOperationalSurface:** Dashboard-adjacent with severity-aware signal system
  - **HbcCommandSurface:** Dense, efficient with urgency variants (default/high/critical) and micro-interaction affordances
  - **HbcLauncherSurface:** Grouped tool launcher with grid/list layouts and tinted tile system
  - **HbcDiscoverySurface:** Search/wayfinding with sections for quick paths, categories, promoted destinations
- Each surface has distinct composition grammar — hero gradient vs editorial rhythm vs command density vs discovery warmth.
- These are NOT disguised productive cards. The visual grammar, spacing, motion, and composition patterns are measurably different from productive-lane surfaces.
- `homepage.ts` also exports premium helpers (`HbcPremiumCta`, `HbcPremiumBadge`, `HbcHomepageEyebrow`, `HbcHomepageMetadataRow`), presentation tokens, typography scales, and motion utilities.

**Audit wording:** Should stand as-is. The finding is accurate and well-supported by code evidence.

---

### Finding 05 — Homepage Consumer Migration Is Incomplete

**Finding:** Some named homepage consumers are still materially local rather than truly migrated onto shared presentation surface families.

**Verdict: Confirmed with correction — the gap is larger than the audit's "6/9" framing suggests**

**Files inspected:** All 9 named consumer webparts (see Section 4 for per-consumer detail)

**What is proven:**

| Consumer | Shared Surface Used | Verdict |
|---|---|---|
| LeadershipMessage | `HbcEditorialSurface` | **Clean migration** |
| PriorityActionsRail | `HbcCommandSurface` | **Clean migration** |
| SafetyFieldExcellence | `HbcOperationalSurface` | **Clean migration** |
| SmartSearchWayfinding | `HbcDiscoverySurface` | **Clean migration** (with custom search slot) |
| ToolLauncherWorkHub | `HbcLauncherSurface` (fallback only) | **Partial** — live data path uses 4-region composition shell; only manifest-config fallback uses shared surface |
| HbSignatureHero | None | **Local** — builds own micro-composition despite `HbcSignatureHeroSurface` existing in ui-kit |
| CompanyPulse | None | **Local** — uses custom CSS module system (`newsroom-surface.module.css`) with local components |
| ProjectPortfolioSpotlight | None | **Local** — 1,118 lines, fully self-contained with extensive inline styles and locally hardcoded brand colors |
| PeopleCultureMerged | None | **Local** — 652 lines, fully self-contained with extensive inline styles and locally hardcoded brand colors |

**Corrected count:** 4 cleanly migrated, 1 partial, 4 local = **4.5/9 at best, not 6/9**.

**The "6/9 migrated" framing should be corrected.** It likely counted consumers that import *anything* from `@hbc/ui-kit/homepage` (e.g., `motion`, `HbcPremiumCta`) as "migrated," but importing shared helpers is not the same as adopting a shared surface family. Migration means delegating the core surface grammar to a shared component.

**Audit wording:** The finding itself (migration is incomplete) is correct and should stand. The specific framing of how many are migrated needs correction — tighten from "6/9" to "4/9 clean, 1 partial, 4 local."

---

### Finding 06 — Productive-Lane Hardening Is Under-Proven

**Finding:** The repo does not contain strong enough evidence that Prompt 04 was truly satisfied at the level required.

**Verdict: Partially Confirmed**

**Files inspected:** `UI-System-Reconciliation-Execution-Note.md`, Prompt 04 requirements

**What is proven:**
- The execution note asserts productive-lane surfaces are "audited and hardened" with "zero contamination by presentation patterns."
- The execution note states productive lane maintains "density discipline, restrained motion (TRANSITION_FAST/NORMAL only), standard elevation (elevationRest, elevationRaised, elevationLevel1-2)."
- The assertion is directionally credible — the productive/presentation separation at the surface-family level is architecturally real.

**What is not proven:**
- Prompt 04 requires **naming specific productive-lane consumers materially affected** — "which tables/forms/workspace shells examined, which named consumers corrected or intentionally unchanged."
- The execution note does not name specific productive consumers that were inspected.
- No named productive consumer surfaces are identified as having been checked for presentation contamination.
- Without named consumers, the claim of "zero contamination" is an assertion, not a proven conclusion.

**Audit wording:** Should be tightened. The finding correctly identifies under-proving, but should note that the assertion is directionally credible even if under-evidenced. It is "partly proven" rather than "mostly asserted."

---

### Finding 07 — Boundary and Enforcement Alignment Is Incomplete

**Finding:** Docs describe stricter homepage import discipline than is actually enforced.

**Verdict: Confirmed**

**Files inspected:** `apps/hb-webparts/.eslintrc.cjs`, `apps/hb-webparts/vite.config.ts`, `packages/ui-kit/src/homepage.ts` (import guardrails constant)

**What is proven:**

**Doctrinal standard (homepage.ts):**
```
HBC_HOMEPAGE_IMPORT_GUARDRAILS = {
  allowedEntrypoint: '@hbc/ui-kit/homepage',
  relatedTokenEntrypointsAllowed: ['@hbc/ui-kit/theme', '@hbc/ui-kit/icons', '@hbc/ui-kit/branding'],
  prohibitedEntrypointsInHomepageWebparts: ['@hbc/ui-kit', '@hbc/ui-kit/app-shell'],
}
```

**ESLint enforcement (.eslintrc.cjs):**
- Blocks `@hbc/ui-kit` (root) with warning message
- Blocks `@hbc/ui-kit/app-shell` with warning message
- Does NOT block `@hbc/ui-kit/primitives` or `@hbc/ui-kit/fluent` (not in prohibited list but also not in allowed list)

**Vite alias (vite.config.ts):**
- `@hbc/ui-kit` root is aliased as a **fallback** after specific entry points
- This means code importing from `@hbc/ui-kit` root will resolve at build time even if ESLint warns
- The alias ordering means specific paths (`@hbc/ui-kit/homepage`, `/theme`, `/icons`, `/branding`) resolve first, but root still works

**Gap:** ESLint provides lint-time warnings but not build-time enforcement. A developer could suppress the lint warning and still successfully import from the root barrel. The vite alias for root `@hbc/ui-kit` acts as a safety net but also an enforcement escape hatch.

**Audit wording:** Should stand as-is. The finding is accurate and well-supported.

---

### Finding 08 — Documentation Is Directionally Strong but Not Fully Reconciled

**Finding:** Docs materially align to the layer model and two-lane model, but some docs still overstate conformance or drift from live repo truth.

**Verdict: Confirmed**

**Files inspected:** `UI-System-Reconciliation-Execution-Note.md`, `Prompt-00-Acceptance-and-Corrective-Addendum.md`, core doctrine files (layer model, lane standards, target architecture, why-two-lanes)

**What is proven:**
- Core doctrine files (UI-System-Layer-Model, Presentation-Lane-Standard, Productive-Lane-Standard, Why-Two-Lanes, target architecture) are internally consistent and well-aligned to the layered two-lane model.
- How-to guides (Building-New-Homepage-Surfaces, Migrating-Legacy-UI) are practical and aligned to architecture.
- The corrective addendum (Prompt 00A) is clear about visual obligations and quality floor expectations.

**What is not proven / overstatement areas:**
- The execution note reports Wave 01 completion in terms that imply broader consumer migration than actually achieved.
- "250+ consumer files import from ui-kit" is technically true but doesn't distinguish between root-barrel imports and governed entry-point imports.
- Consumer naming in the execution note is often generic rather than identifying specific surfaces that were inspected/migrated.
- The execution note's presentation-lane quality description is aspirational in places where the two largest consumers (ProjectPortfolioSpotlight, PeopleCultureMerged) still build entirely locally.

**Audit wording:** Should stand as-is. The directional accuracy is real; the reconciliation gap is also real.

---

### Finding 09 — Packaging/Build Proof Is Real

**Finding:** Package/build proof for the homepage/SPFx webparts is credible.

**Verdict: Confirmed**

**Files inspected:** `hb-webparts-multi-webpart-packaging-verification.md` (root), `docs/architecture/reviews/evidence/ui-system-build-proof/build-evidence-log.md`, `apps/hb-webparts/src/mount.tsx`

**What is proven:**
- All 11 webpart GUIDs are traceable through the full chain: SPFx manifest → `mount.tsx` dispatch → component file → compiled bundle.
- Build evidence log confirms: check-types pass, lint pass, Vite build pass (4,383 modules transformed).
- Build artifact: `apps/hb-webparts/dist/hb-webparts-app.js` — 575.08 KB (204.00 KB gzip).
- CSS output: 31.32 KB (6.19 KB gzip).
- Build configuration: IIFE format for SPFx `SPComponentLoader`, externals for `@microsoft/sp-*`.
- Mount dispatch maps each GUID to the correct renderer function with the correct component file.

**Named webpart traceability verified:**

| Webpart | GUID | Component | In Bundle |
|---|---|---|---|
| Personalized Welcome Header | `46bfde64-...` | PersonalizedWelcomeHeader | Yes |
| HB Hero Banner | `39762a4d-...` | HbHeroBanner | Yes |
| Priority Actions Rail | `b3f07190-...` | PriorityActionsRail | Yes |
| Tool Launcher / Work Hub | `cb7060f5-...` | ToolLauncherWorkHub | Yes |
| Company Pulse | `0b53f651-...` | CompanyPulse | Yes |
| Leadership Message | `e8fa8a84-...` | LeadershipMessage | Yes |
| People and Culture | `27ac10f4-...` | PeopleCultureMerged | Yes |
| Project / Portfolio Spotlight | `8370ab0c-...` | ProjectPortfolioSpotlight | Yes |
| Safety and Field Excellence | `89ca5ff3-...` | SafetyFieldExcellence | Yes |
| Smart Search / Wayfinding | `11d72b36-...` | SmartSearchWayfinding | Yes |
| HB Signature Hero | `28acd6a7-...` | HbSignatureHero | Yes |

**Audit wording:** Should stand as-is. Build/packaging proof is credible and well-documented.

---

### Finding 10 — Verification / Visual Proof Remains Incomplete

**Finding:** Consumer-level visual proof is insufficient relative to Prompt 08 expectations.

**Verdict: Confirmed**

**Files inspected:** `docs/architecture/reviews/evidence/ui-system-visual-proof/` directory, `docs/architecture/reviews/evidence/ui-system-build-proof/build-evidence-log.md`, Prompt 08 requirements

**What is proven:**
- Visual proof screenshots exist for **surface-family components** (isolated/Storybook-level):
  - HbcSignatureHeroSurface (desktop, tablet, compact)
  - HbcEditorialSurface (desktop, tablet)
  - HbcCommandSurface (desktop, tablet, high-urgency, critical-urgency)
  - HbcDiscoverySurface (desktop, tablet)
  - HbcOperationalSurface (desktop, tablet)
- Build evidence is credible (see Finding 09).

**What is not proven:**
- **No consumer-level visual proof** — no screenshots of actual webpart compositions (e.g., LeadershipMessage rendering inside HbcEditorialSurface, PriorityActionsRail rendering inside HbcCommandSurface) in their homepage context.
- **No before/after comparisons** as required by Prompt 00A and Prompt 08.
- **No side-by-side pre-refactor vs post-refactor screenshots.**
- **No explicit visual advancement statement** per consumer as required by Prompt 03, 05, and 08 completion standards.
- **13 pre-existing test failures** remain unresolved (documented as not caused by current work but still part of the conformance story).
- **HbcLauncherSurface visual proof is absent** from the visual-proof directory.

**Prompt 08 specifically requires:**
> "Which named consumers directly verified, which have before/after visual proof, which not verified and why"

This has not been satisfied at the consumer level.

**Audit wording:** Should stand as-is. The finding correctly identifies the visual-proof gap.

---

## 4. Named Consumer Validation

| Consumer | Shared Surface Family | Migration Status | Evidence |
|---|---|---|---|
| **HB Signature Hero** | None (despite `HbcSignatureHeroSurface` existing) | **Local — should likely migrate** | 141 lines; builds own micro-composition with `motion` + `hedrickLogo` from branding; no hardcoded colors but uses own layout grammar |
| **Leadership Message** | `HbcEditorialSurface` | **Shared-family migrated** | 86 lines; fully delegates to shared editorial surface; only local styling is neutral gray text colors (#323130, rgba(0,0,0,0.55)) |
| **Company Pulse** | None | **Local by design** | 167 lines; custom newsroom composition with CSS modules; uses `HbcPremiumCta` and `motion` from homepage but builds own surface grammar via `newsroom-surface.module.css` |
| **Project / Portfolio Spotlight** | None | **Local but should likely migrate** | 1,118 lines; extensive inline styles; locally hardcodes `#225391`/`#E57E46` brand colors in `HB` const; does NOT import shared tokens; editorial spotlight composition |
| **Tool Launcher / Work Hub** | `HbcLauncherSurface` (fallback path only) | **Partially migrated** | 214 lines; live data path uses 4-region composition shell (LauncherCommandBand, FlagshipStage, UtilityRail, WorkflowShelves); only manifest-config fallback delegates to `HbcLauncherSurface` |
| **People and Culture** | None | **Local but should likely migrate** | 652 lines; extensive inline styles; locally hardcodes `#225391`/`#E57E46` + warm cream + custom palette; does NOT import shared tokens; 3-zone composition (hero + kudos + support) |
| **Priority Actions Rail** | `HbcCommandSurface` | **Shared-family migrated** | 100 lines; fully delegates to shared command surface; no hardcoded colors; pure mapping layer |
| **Safety and Field Excellence** | `HbcOperationalSurface` | **Shared-family migrated** | 132 lines; fully delegates to shared operational surface; no hardcoded colors; pure mapping layer |
| **Smart Search / Wayfinding** | `HbcDiscoverySurface` | **Shared-family migrated** | 166 lines; mostly delegates to shared discovery surface; minor local search-input styling with hardcoded warm-orange border |

**Summary:** 4 cleanly migrated, 1 partial, 1 local by design, 3 local (should likely migrate).

---

## 5. Boundary / Enforcement Validation

### Written Doctrine

`homepage.ts` defines `HBC_HOMEPAGE_IMPORT_GUARDRAILS`:
- **Allowed:** `@hbc/ui-kit/homepage`, `@hbc/ui-kit/theme`, `@hbc/ui-kit/icons`, `@hbc/ui-kit/branding`
- **Prohibited:** `@hbc/ui-kit` (root), `@hbc/ui-kit/app-shell`

### Actual ESLint Enforcement

`.eslintrc.cjs` implements `no-restricted-imports` for:
- `@hbc/ui-kit` — blocked with message directing to `/homepage`
- `@hbc/ui-kit/app-shell` — blocked with message directing to `/homepage`

**Gap:** ESLint is a lint-time check, not a build-time gate. Warnings can be suppressed with `// eslint-disable-next-line`.

### Actual Vite Build Resolution

`vite.config.ts` defines aliases in this order:
1. `@hbc/ui-kit/homepage` → specific source
2. `@hbc/ui-kit/theme` → specific source
3. `@hbc/ui-kit/icons` → specific source
4. `@hbc/ui-kit/branding` → specific source
5. `@hbc/ui-kit` → **root barrel (fallback)**

**Gap:** The root `@hbc/ui-kit` alias means any import from the root barrel will resolve successfully at build time regardless of ESLint warnings.

### Alignment Assessment

| Layer | Doctrine | Enforcement | Aligned? |
|---|---|---|---|
| Root barrel blocked | Yes (guardrails constant) | ESLint warns; Vite still resolves | **Partial** |
| App-shell blocked | Yes (guardrails constant) | ESLint warns; no Vite alias | **Mostly** |
| Homepage allowed | Yes | Vite resolves; ESLint allows | **Yes** |
| Theme/icons/branding allowed | Yes | Vite resolves; ESLint allows | **Yes** |
| Primitives/fluent status | Unclear in guardrails | Not blocked by ESLint | **Undefined** |

**Conclusion:** Enforcement is directionally correct but has a meaningful gap: the vite root-barrel alias acts as an escape hatch that undermines the ESLint restriction. The doctrine also does not address `@hbc/ui-kit/primitives` or `@hbc/ui-kit/fluent` entry points for homepage webparts.

---

## 6. Documentation Truthfulness Validation

### What Is Accurate

- **Core doctrine files** (UI-System-Layer-Model, lane standards, target architecture, Why-Two-Lanes) accurately describe the intended architecture and are internally consistent.
- **How-to guides** (Building-New-Homepage-Surfaces, Migrating-Legacy-UI) are practical and reflect the actual migration posture.
- **Corrective addendum** (Prompt 00A) correctly establishes visual obligations and the signature-hero quality floor.
- **Entry-point documentation** in `homepage.ts` accurately describes the governed subset and its purpose.

### What Is Overstated

- **Execution note** reports Wave 01 as complete with language that implies broader consumer adoption than achieved. The 4 unmigrated consumers (including the two largest and most complex) represent significant remaining local surface grammar.
- **"250+ consumer files import from ui-kit"** is technically true but misleading without distinguishing governed entry-point imports from root-barrel imports.
- **Productive-lane "zero contamination" claim** lacks named consumer evidence to support it.
- **Presentation-lane quality obligations** are well-documented in doctrine but the execution note does not acknowledge that the two largest homepage consumers (ProjectPortfolioSpotlight at 1,118 lines, PeopleCultureMerged at 652 lines) still build entirely outside the shared system with duplicated brand values.

### What Is Understated

- The execution note does not sufficiently highlight the **foundation color-drift gap** between `tokens.ts` and `homepage.ts` as a conformance concern.
- The enforcement gap (vite root-barrel alias) is not called out as a remaining risk.

---

## 7. Verification / Packaging Validation

### Build/Package Proof — Credible

- **Type checking:** Passes for `hb-webparts`.
- **Lint:** Passes (1 pre-existing error noted).
- **Build:** Vite produces `hb-webparts-app.js` at 575.08 KB (204.00 KB gzip) via IIFE format.
- **Bundle traceability:** All 11 webpart GUIDs verified in compiled output through manifest → mount.tsx → component → bundle chain.
- **External handling:** `@microsoft/sp-*` packages correctly externalized.

### Verification Still Weak

- **Consumer-level visual proof:** Missing. No screenshots of actual webpart compositions in homepage context.
- **Before/after comparisons:** Missing. Required by Prompt 00A and Prompt 08.
- **Responsive proof at consumer level:** Missing. Surface-family screenshots exist but not consumer compositions.
- **Visual advancement statements:** Missing per consumer.

### Visual Proof Present

Surface-family component screenshots exist for 5 of 6 families:
- HbcSignatureHeroSurface (3 variants)
- HbcEditorialSurface (2 variants)
- HbcCommandSurface (4 variants)
- HbcDiscoverySurface (2 variants)
- HbcOperationalSurface (2 variants)

**Missing:** HbcLauncherSurface visual proof.

### Unresolved Failures

- **13 pre-existing test failures** documented in build evidence log as unrelated to current work. These should remain visible in the conformance story — they do not block the UI-system assessment but represent repo health debt.
- **Workspace check-types:** 56/71 pass (1 pre-existing `spfx-leadership` failure).
- **Bundle size:** 575 KB against 800 KB chunk warning limit — within budget but not measured against any presentation-lane-specific budget.

### Impact on Conformance Story

Build/packaging proof is solid. Verification weakness is concentrated in **visual proof and consumer-level validation**, which is exactly where the presentation-lane conformance story needs the most evidence. The current evidence proves the code compiles and bundles correctly but does not prove the visual outcome meets the presentation-lane quality standard.

---

## 8. Corrections to the Original Audit

### Wording That Should Be Tightened

1. **Consumer migration count:** Any "6/9 migrated" framing should be corrected to "4/9 cleanly migrated onto shared surface families, 1 partial (ToolLauncherWorkHub), 4 remain local." Importing shared helpers (motion, HbcPremiumCta) is not migration.

2. **Productive-lane hardening:** Should be described as "directionally credible but under-evidenced" rather than either fully proven or merely asserted.

### Claims That Should Be Downgraded

1. **Consumer migration completeness** should be downgraded from any suggestion of majority-migrated to minority-migrated with significant remaining work.

2. **Foundation "single source of truth"** should be downgraded — two distinct brand-color palettes exist without governing documentation.

### Claims That Should Be Upgraded

None identified. The audit was appropriately calibrated or slightly generous in its assessments.

### Claims That Should Remain Unchanged

1. **F01 — Overall "mostly conforming with targeted gaps"** — accurate.
2. **F03 — Primitive layer is real** — accurate.
3. **F04 — Presentation surface families are real** — accurate.
4. **F07 — Enforcement incomplete** — accurate.
5. **F09 — Build proof is real** — accurate.
6. **F10 — Visual proof incomplete** — accurate.

---

## 9. Final Recommended Next Move

**Consolidate foundation color governance before further consumer migration.**

The single highest-value next action is to resolve the foundation color drift between `tokens.ts` and `homepage.ts`:

1. Document whether the two brand-color palettes (`#004B87`/`#F37021` vs `#225391`/`#E57E46`) are an intentional presentation-lane distinction or unintended drift.
2. If intentional, make `homepage.ts` derive its colors from `tokens.ts` via semantic aliasing rather than redefining them independently.
3. Make `ProjectPortfolioSpotlight` and `PeopleCultureMerged` import from the governed source rather than hardcoding values locally.

This unblocks clean consumer migration by ensuring that when consumers adopt shared surfaces, they inherit from a governed color source rather than propagating a second ungoverned palette.

After color governance: prioritize consumer-level visual proof for the 4 already-migrated consumers to close the Prompt 08 gap, then tackle migration of `HbSignatureHero` (which should use `HbcSignatureHeroSurface`) as the simplest remaining migration.

---

## 10. Closure update — People & Culture migration (W01 follow-on)

**Status update:** `PeopleCultureMerged` has now been cleanly migrated to a new shared surface family in `@hbc/ui-kit/homepage`. The 652-line local composition has been replaced with a thin consumer that delegates to:

- `HbcPeopleCultureSurface` — cohesive presentation-lane surface family (gradient hero band, kudos spotlight, recognition rail, sparse-state invite)
- `HbcKudosComposerFlyout` / `HbcKudosComposerForm` / `HbcKudosComposerPreview` — sibling presentation primitives for the kudos submission flow
- `HbcAvatarStack` — new shared homepage primitive used by both the surface family and the composer preview

Business logic, SharePoint list fetching, normalization, validation, and submission all remain local to the webpart. The kudos draft / validation-error type contracts now live in `@hbc/ui-kit/homepage` with a re-export shim in `useKudosComposer.ts` so existing imports keep working.

**Impact on this validation report:**

- The "named consumers still entirely local" set drops from `{HbSignatureHero, PeopleCultureMerged, ProjectPortfolioSpotlight}` to `{HbSignatureHero, ProjectPortfolioSpotlight}`.
- The cleanly-migrated count rises from 4/9 (44%) to **5/9 (56%)**.
- People & Culture is now visually proven at the surface-family level via Storybook stories under `packages/ui-kit/src/HbcPeopleCultureSurface/`, `HbcKudosComposer/`, and `HbcAvatarStack/`.
- See `docs/architecture/reviews/people-culture-ui-kit-migration-completion.md` for the full file-by-file change list, ownership decisions, token strategy, and verification record.

**Recommended next move (revised):** Tackle `HbSignatureHero` (smallest remaining migration target) and produce consumer-level visual proof for the previously-migrated 5 consumers + the new People & Culture consumer.

---

## 11. Closure update — Company Pulse migration (W01 follow-on)

**Status update:** `CompanyPulse` has now been cleanly migrated to a new shared surface family in `@hbc/ui-kit/homepage`. The previous "Local by design" characterization in the execution note was an understatement — the 3-layout-mode behavior, featured-story grammar, headline-rail grammar, and tertiary quick-read zone are all durable shared-family presentation concerns. A cohesive `HbcNewsroomSurface` makes that ownership explicit, preserving the blue-led editorial register that keeps Company Pulse visually distinct from the warm celebratory People & Culture surface.

The ~600-line local `apps/hb-webparts/src/homepage/shared/newsroom/` module (featured story component + headline stack component + category chip component + palette utilities + CSS module) has been removed and folded into the cohesive new surface family. The consumer now delegates to:

- `HbcNewsroomSurface` — cohesive presentation-lane surface family with inline featured-story, headline-stack, headline-item, category-chip, tertiary-zone, and sparse-footer sub-components
- `resolveNewsroomLayout(model)` — pure presentation-layer helper that derives the `rich` / `sparse` / `headline-only` layout from the view-model

Business logic, normalization (`normalizeCompanyPulseConfig`), audience filtering, authoring-governance messaging (`resolveAuthoringMessage`), loading / no-data / invalid fallback rendering, and SPFx webpart integration all remain local to the webpart.

**Impact on this validation report:**

- The "named consumers still entirely local" set drops from `{HbSignatureHero, ProjectPortfolioSpotlight}` to `{HbSignatureHero}` in practice. (Note: the Wave 01 Execution Note still lists `ProjectPortfolioSpotlight` as "should likely migrate", which is pre-existing drift against the repo state recorded in `docs/architecture/reviews/project-spotlight-ui-kit-migration-completion.md`; reconciling that is out of scope for this Company Pulse closure.)
- The cleanly-migrated count rises from 5/9 (56%) to **6/9 (67%)** per the updated execution-note summary.
- Company Pulse is now visually proven at the surface-family level via Storybook stories under `packages/ui-kit/src/HbcNewsroomSurface/HbcNewsroomSurface.stories.tsx` covering Default (rich), Sparse, HeadlineOnly, and Mobile variants.
- See `docs/architecture/reviews/company-pulse-ui-kit-migration-completion.md` for the full file-by-file change list, ownership decisions, token strategy, and verification record.

**Recommended next move (revised again):** Tackle `HbSignatureHero` (the last remaining named local consumer) and reconcile the stale `ProjectPortfolioSpotlight` row in the Wave 01 Execution Note with the committed Project Spotlight migration already recorded in its own completion report.
