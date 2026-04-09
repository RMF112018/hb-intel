# Project Sites UI-Kit Compliance Audit

## 1. Executive conclusion

`apps/project-sites/` is **mostly compliant with targeted gaps**.

Repo-truth summary: the Project Sites surface is a **productive-lane SPFx webpart** with the right general ownership model. It composes current `@hbc/ui-kit` primitives and theme tokens for its core UI, keeps feature-specific orchestration and data logic local, and does not show presentation-lane misuse. The main compliance gaps are narrower and structural: it still anchors the consumer and build configuration to the full `@hbc/ui-kit` barrel instead of the newer entry-point model, it uses a relative cross-package source import from the app host into `packages/spfx`, and it still carries routine hardcoded spacing/layout values in consumer-local styles. Earlier Project Sites upgrade notes show a real maturation pass, but they do not prove compliance against the latest two-lane / entry-point doctrine.

## 2. Scope and files inspected

### Prompt / audit target
- `Pasted markdown.md` (attached prompt)

### Core authority / repo truth
- `CLAUDE.md`
- `docs/README.md`
- `docs/architecture/blueprint/current-state-map.md`
- `docs/architecture/blueprint/package-relationship-map.md`

### Latest UI-system doctrine / target direction
- `docs/reference/ui-kit/UI-System-Layer-Model.md`
- `docs/reference/ui-kit/Presentation-Lane-Standard.md`
- `docs/reference/ui-kit/Productive-Lane-Standard.md`
- `docs/architecture/blueprint/ui-system-target-architecture.md`
- `docs/explanation/ui-system/Why-Two-Lanes.md`
- `docs/how-to/developer/Building-New-Homepage-Surfaces.md`
- `docs/how-to/developer/Migrating-Legacy-UI-to-the-Two-Lane-System.md`
- `docs/reference/ui-kit/entry-points.md`

### Latest validation / reconciliation context
- `docs/architecture/plans/MASTER/ui-kit/wave-01/UI-System-Reconciliation-Execution-Note.md`
- `docs/architecture/reviews/spfx/project-sites/project-sites-ui-kit-upgrade.md`

### Validation context requested by prompt but not found in live repo
- `docs/architecture/reviews/ui-system-refactor-audit-findings-validation.md` — not found
- `docs/architecture/reviews/ui-system-remediation-pass-01-completion.md` — not found

### UI-kit implementation truth
- `packages/ui-kit/package.json`
- `packages/ui-kit/src/index.ts`
- `packages/ui-kit/src/primitives.ts`
- `packages/ui-kit/src/homepage.ts`
- `packages/ui-kit/src/theme/tokens.ts`
- `packages/ui-kit/src/app-shell.ts`

### Project Sites area under audit
- `apps/project-sites/package.json`
- `apps/project-sites/tsconfig.json`
- `apps/project-sites/vite.config.ts`
- `apps/project-sites/src/mount.tsx`
- `packages/spfx/src/webparts/projectSites/ProjectSitesWebPart.ts`
- `packages/spfx/src/webparts/projectSites/ProjectSitesWebPart.manifest.json`
- `packages/spfx/src/webparts/projectSites/ProjectSitesRoot.tsx`
- `packages/spfx/src/webparts/projectSites/components/ProjectSiteCard.tsx`
- `packages/spfx/src/webparts/projectSites/hooks/useAvailableYears.ts`
- `packages/spfx/src/webparts/projectSites/hooks/useProjectSites.ts`
- `packages/spfx/src/webparts/projectSites/types.ts`

## 3. UI-system classification

Project Sites is **productive-lane**.

Why:
- the surface is work-oriented rather than editorial;
- it provides an operational year filter, query-driven results, loading/error/empty handling, and actionable project-site cards;
- it does not function as a homepage hero, showcase, recognition, or communications surface;
- it does not import or depend on `@hbc/ui-kit/homepage` presentation-lane surface families.

This is the correct lane under the latest doctrine. Nothing in the inspected implementation suggests it should be reclassified as presentation-lane or mixed.

## 4. Compliance assessment by category

### 4.1 Shared UI ownership

**Verdict:** Mostly compliant.

**Proven:**
- Project Sites consumes shared UI from `@hbc/ui-kit` rather than re-creating basic reusable building blocks. Current code uses shared components such as `HbcThemeProvider`, `HbcEmptyState`, `HbcSegmentedControl`, `HbcCard`, `HbcStatusBadge`, and `HbcDescriptionList`.
- The local `ProjectSiteCard` is a feature-specific composition around `IProjectSiteEntry`, project-stage state, and site-link behavior. That is an appropriate consumer-local assembly, not a reusable cross-product primitive.
- There is no direct evidence in the inspected live code of Project Sites maintaining its own parallel design system or duplicate generic primitive library.

**Unproven / limited:**
- This audit did not inspect every historical Project Sites planning file or every unrelated package for duplicate versions of the same consumer UI. The findings above are limited to the inspected live implementation.

### 4.2 Foundation / token compliance

**Verdict:** Partially compliant.

**Proven:**
- The consumer uses shared tokens and theme primitives for colors, radii, elevation, and typography. Examples include `HBC_SURFACE_LIGHT`, `HBC_STATUS_COLORS`, `HBC_RADIUS_XL`, `HBC_RADIUS_SM`, `elevationLevel1`, `elevationLevel2`, `heading1`, `heading3`, `bodySmall`, and `label`.
- Light-mode enforcement is intentional and layered: `HbcThemeProvider(forceTheme='light')` at mount, compile-time `HBC_SURFACE_LIGHT` usage in Griffel styles, and `supportsThemeVariants: false` in the SPFx manifest.

**Gaps:**
- Consumer styles still rely on many hardcoded spacing and layout values (`24px`, `32px`, `16px`, `8px`, `6px`, etc.) in `ProjectSitesRoot.tsx` and `ProjectSiteCard.tsx` instead of consistently using shared spacing foundations.
- Under the latest layer model and productive-lane doctrine, routine application spacing and visual rhythm should not keep drifting into consumer-local ad hoc values when shared foundations exist.

**Proven vs unproven:**
- It is proven that mixed token + literal spacing usage exists.
- It is not proven that every literal value should be centralized today; the compliance issue is the pattern, not that every single pixel literal is automatically invalid.

### 4.3 Primitive-layer compliance

**Verdict:** Mostly compliant with an import-discipline gap.

**Proven:**
- The surface consumes the right kind of shared building blocks for a productive-lane UI: card, segmented control, empty state, description list, status badge.
- There is no evidence of direct `@fluentui/*` usage inside the inspected Project Sites consumer files.

**Gap:**
- The latest UI-kit system now has a dedicated `@hbc/ui-kit/primitives` entry point, but Project Sites continues to import primitive-layer components from the main `@hbc/ui-kit` barrel.

**Proven vs unproven:**
- It is proven that the dedicated primitive entry point exists and that Project Sites does not use it.
- It is unproven whether every Project Sites ui-kit import can move immediately without a small export-path adjustment elsewhere.

### 4.4 Surface-family compliance

**Verdict:** Compliant.

**Proven:**
- Project Sites does not misuse homepage/presentation surface families.
- It does not import from `@hbc/ui-kit/homepage`.
- Its local root + card composition is acceptable consumer-local productive composition rather than a misclassified presentation section.

**Unproven / limited:**
- No dedicated productive surface-family abstraction was introduced specifically for Project Sites, but current doctrine does not require every productive surface to be lifted into shared ownership.

### 4.5 Entry-point / import compliance

**Verdict:** Targeted structural non-compliance.

**Proven:**
- `apps/project-sites/package.json` depends on the full `@hbc/ui-kit` package.
- `apps/project-sites/tsconfig.json` maps `@hbc/ui-kit` directly to `../../packages/ui-kit/src/index.ts`.
- `apps/project-sites/vite.config.ts` aliases `@hbc/ui-kit` directly to `../../packages/ui-kit/src/index.ts`.
- `apps/project-sites/src/mount.tsx` imports `HbcThemeProvider` from `@hbc/ui-kit`.
- `ProjectSitesRoot.tsx` and `ProjectSiteCard.tsx` import primitives, tokens, and types from the same main barrel.

**Why this is out of compliance:**
- The latest UI-kit doctrine and entry-point map define a clearer split: `@hbc/ui-kit/primitives`, `@hbc/ui-kit/theme`, `@hbc/ui-kit/icons`, `@hbc/ui-kit/app-shell`, and `@hbc/ui-kit/homepage` now exist specifically to narrow consumer dependency surfaces and clarify layer ownership.
- The entry-point reference explicitly says the full `@hbc/ui-kit` barrel is for PWA, dev-harness, or non-constrained contexts, while SPFx consumers should prefer narrower paths.

**Important nuance:**
- The current export shape still leaves `HbcThemeProvider` on the main barrel. `@hbc/ui-kit/app-shell` does **not** export it. That means Project Sites cannot fully leave the main barrel today unless ui-kit adds a narrower sanctioned export path or documents a deliberate exception.
- Even with that nuance, most current consumer imports (`HbcCard`, `HbcStatusBadge`, `HbcDescriptionList`, `HbcSegmentedControl`, theme tokens, icons) are still broader than necessary.

### 4.6 Package-boundary compliance

**Verdict:** Mostly compliant with one structural gap.

**Proven:**
- The Project Sites implementation is split sensibly between an app host (`apps/project-sites`) and SPFx webpart source (`packages/spfx/src/webparts/projectSites/*`). That is a credible package-ownership shape.
- Business/data hooks remain outside ui-kit, and the ui-kit package is not polluted with Project Sites-specific business logic.

**Gap:**
- `apps/project-sites/src/mount.tsx` imports `ProjectSitesRoot` through a filesystem-relative path into `../../../packages/spfx/src/webparts/projectSites/ProjectSitesRoot.js`.
- The app already defines a dedicated path alias for Project Sites webpart code (`@hbc/spfx/project-sites` in `tsconfig.json` and Vite config), but the mount file does not use a package-oriented seam.

**Why this is out of compliance:**
- The relative import weakens package-boundary clarity and makes the host app reach directly into source layout rather than consuming a clearer package-level import seam.

### 4.7 Local-vs-shared placement compliance

**Verdict:** Mostly compliant.

**Proven:**
- `ProjectSiteCard` is tightly coupled to Project Sites data, stage handling, and site-link behavior. Keeping it local is appropriate.
- The root component, hooks, and SP field mapping/types are all feature-specific and belong in the consumer/package boundary rather than in `@hbc/ui-kit`.
- Current code shows the consumer assembling the shared system rather than replacing it wholesale.

**Unproven / limited:**
- This audit did not inspect every past Project Sites artifact for retired local wrappers. The assessment is based on the current inspected implementation.

### 4.8 Visual-system / doctrine-fit compliance

**Verdict:** Mostly compliant with targeted gaps.

**Proven:**
- The surface reads as a productive application UI rather than a flattened homepage/editorial module.
- State handling is deliberate: loading, empty, error, live-region announcement, and disabled provisioning states are all handled in the current code.
- The prior upgrade note demonstrates that the surface already went through a meaningful light-mode and governed-primitive migration.

**Gaps:**
- The visual-system fit is stronger than the import/boundary fit. The biggest current compliance debt is not lane confusion but consumer discipline against the latest layered export model and foundation/token completeness.

**Proven vs unproven:**
- It is proven that the surface is not presentation-lane misuse.
- Without screenshots, visual-system fit is inferred from structure, imports, tokens, and composition rather than direct rendered proof.

## 5. Named compliance gaps

### Gap 1 — Full ui-kit main-barrel dependency in a constrained SPFx consumer
- **Severity:** Medium
- **Files involved:**
  - `apps/project-sites/package.json`
  - `apps/project-sites/tsconfig.json`
  - `apps/project-sites/vite.config.ts`
  - `apps/project-sites/src/mount.tsx`
  - `packages/spfx/src/webparts/projectSites/ProjectSitesRoot.tsx`
  - `packages/spfx/src/webparts/projectSites/components/ProjectSiteCard.tsx`
- **Why it is out of compliance:** The latest doctrine now exposes narrower entry points for foundations, primitives, icons, app shell, and homepage surfaces. Project Sites still anchors itself to the full `@hbc/ui-kit` barrel.
- **Type:** Structural + doctrinal

### Gap 2 — Primitive-layer imports are broader than necessary
- **Severity:** Medium
- **Files involved:**
  - `packages/spfx/src/webparts/projectSites/ProjectSitesRoot.tsx`
  - `packages/spfx/src/webparts/projectSites/components/ProjectSiteCard.tsx`
- **Why it is out of compliance:** The consumer imports primitive-layer UI from the root barrel instead of `@hbc/ui-kit/primitives`, despite that entry point existing specifically for Layer 2 building blocks.
- **Type:** Doctrinal

### Gap 3 — Theme-provider narrow-entry exception is not formalized
- **Severity:** Low-Medium
- **Files involved:**
  - `apps/project-sites/src/mount.tsx`
  - `packages/ui-kit/src/app-shell.ts`
  - `packages/ui-kit/src/index.ts`
- **Why it is out of compliance:** The Project Sites mount needs `HbcThemeProvider`, but the current ui-kit export shape leaves that symbol on the main barrel instead of a narrower SPFx-safe path. The consumer therefore needs an exception or an export-path correction to fully align with the newest doctrine.
- **Type:** Structural + doctrinal

### Gap 4 — App build config reinforces root-barrel usage
- **Severity:** Medium
- **Files involved:**
  - `apps/project-sites/tsconfig.json`
  - `apps/project-sites/vite.config.ts`
- **Why it is out of compliance:** The app host aliases `@hbc/ui-kit` directly to the ui-kit root source path, which hardens the older consumption pattern instead of the newer layer-aware entry-point model.
- **Type:** Structural

### Gap 5 — Cross-package relative source import from app host into package source
- **Severity:** Medium
- **Files involved:**
  - `apps/project-sites/src/mount.tsx`
- **Why it is out of compliance:** The host app imports `ProjectSitesRoot` through a relative source-path reach into `packages/spfx` instead of a cleaner package-oriented import seam. This weakens boundary clarity and makes the import contract more fragile than necessary.
- **Type:** Structural

### Gap 6 — Routine spacing and layout rhythm still live as consumer-local literals
- **Severity:** Low-Medium
- **Files involved:**
  - `packages/spfx/src/webparts/projectSites/ProjectSitesRoot.tsx`
  - `packages/spfx/src/webparts/projectSites/components/ProjectSiteCard.tsx`
- **Why it is out of compliance:** The latest layer model and productive-lane standard expect routine UI rhythm to lean on shared foundations. Current code still uses many local literal spacing/layout values instead of consistently consuming spacing tokens.
- **Type:** Doctrinal + visual-system

### Gap 7 — Prior validation does not prove latest-doctrine compliance
- **Severity:** Low-Medium
- **Files involved:**
  - `docs/architecture/reviews/spfx/project-sites/project-sites-ui-kit-upgrade.md`
- **Why it is out of compliance:** The prior Project Sites upgrade report validates theming, light-mode enforcement, primitive migration, accessibility, and packaging, but it does not validate compliance against the latest entry-point/layer model now governing `@hbc/ui-kit`.
- **Type:** Verification + doctrinal

## 6. What is already compliant

The following areas are already aligned and should not be unnecessarily reworked:

- **Correct lane classification.** Project Sites is a productive-lane surface and behaves like one.
- **No homepage/presentation misuse.** The consumer does not import `@hbc/ui-kit/homepage` or try to force presentation-lane grammar into an operational surface.
- **Strong shared-primitive usage.** The surface uses shared ui-kit components for the meaningful repeated building blocks.
- **No direct Fluent leakage.** The inspected Project Sites implementation does not bypass ui-kit with `@fluentui/*` imports.
- **Feature-local composition is in the right place.** `ProjectSiteCard`, hooks, and field mapping/types are appropriately local.
- **Light-mode governance is intentional.** `forceTheme='light'` and `supportsThemeVariants=false` are coherent with SharePoint’s host context for this surface.
- **Operational accessibility/state structure is deliberate.** The current implementation includes a section landmark, live-region announcement, alert handling, and disabled-state semantics.

## 7. Recommended remediation approach

The best remediation shape is **narrow cleanup + boundary correction**, not a rebuild.

Why:
- The surface is correctly classified.
- Shared UI ownership is broadly correct.
- The consumer does not need a presentation-lane redesign or a shared-surface extraction.
- The main debt is architectural discipline around entry points, boundary seams, and foundation completeness.

Recommended shape:
1. **Formalize the ThemeProvider exception or fix the export shape.** Either expose `HbcThemeProvider` through a narrower sanctioned path for SPFx consumers, or explicitly document a permitted root-barrel exception for that one symbol.
2. **Migrate eligible consumer imports** from `@hbc/ui-kit` to `@hbc/ui-kit/primitives`, `@hbc/ui-kit/theme`, and `@hbc/ui-kit/icons`.
3. **Remove root-barrel aliasing pressure** from `apps/project-sites` build/config paths once the import split is in place.
4. **Replace the relative cross-package source import** in `mount.tsx` with a cleaner package-oriented seam.
5. **Normalize routine spacing/rhythm** toward foundation tokens where practical, without over-abstracting feature-specific composition.

This is a **moderate boundary/doctrine reconciliation pass**, not a larger UI-system rebuild.

## 8. Verification considerations

Any remediation should be verified with the following:

- **Typecheck** for `@hbc/ui-kit`, `@hbc/spfx`, and `@hbc/spfx-project-sites`
- **Lint** with explicit attention to import discipline and any no-restricted-import rules
- **Build** for `@hbc/spfx-project-sites`
- **Consumer-level visual proof** on desktop and narrower widths after any spacing-token cleanup
- **Packaging / integration proof** that the SPFx IIFE mount/unmount contract still works and that light-theme behavior remains intact
- **Import audit proof** that direct root-barrel imports are eliminated or explicitly justified
- **Boundary proof** that the app host no longer reaches into cross-package source via fragile relative imports

## 9. Final repo-truth posture

Project Sites is a **productive SPFx consumer with largely correct UI ownership and composition**, but it is **not fully compliant** with the latest ui-kit doctrine because its consumer and build configuration still rely on the full `@hbc/ui-kit` barrel, its app host uses a relative cross-package source import, and its styles retain routine hardcoded spacing/layout values. The surface does **not** need a visual rebuild or a lane reclassification. It needs a focused boundary-and-entry-point cleanup to align the live consumer with the newer layered export model.
