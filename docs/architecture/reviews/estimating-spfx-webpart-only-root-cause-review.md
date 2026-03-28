# Estimating SPFx Web-Part-Only Root Cause Review

**Date:** 2026-03-28
**Scope:** Prove the root cause of the Estimating SPFx deployment failure, lock the target state, and establish the implementation boundary for subsequent remediation.
**Decision reference:** Phase 4 Estimating SPFx remediation sequence (Prompts 01-03)

## 1. Root Cause Analysis

The Estimating SPFx deployment failure has a **compound root cause** with three interacting defects.

### 1.1 Module Format Mismatch (PRIMARY)

**Evidence:**
- `apps/estimating/vite.config.ts` builds the entry point (`EstimatingWebPart.tsx`) as a Vite/Rollup bundle with ES module output format.
- `apps/estimating/package.json` declares `"type": "module"` and uses `vite build` as the build command.
- Vite externals mark `@microsoft/sp-*` and `@msinternal/*` packages, confirming they are expected at runtime — but Vite emits `export default class ...` syntax.
- The SPFx runtime uses a require.js/SystemJS-style module loader that expects AMD-compatible module format (not ES modules).
- `tools/package-sppkg.ts` correctly generates `loaderConfig` with `entryModuleId` and `scriptResources`, but the underlying JS bundles are in a format the SPFx loader cannot consume.

**Result:** The .sppkg uploads successfully, the web part may register in the App Catalog, but the SPFx runtime loader cannot resolve the entry module export at runtime. The web part either does not render or fails silently.

### 1.2 Manifest Declares Unsupported Hosts (SECONDARY)

**Evidence:**
- `apps/estimating/src/webparts/estimating/EstimatingWebPart.manifest.json` declared:
  ```json
  "supportedHosts": ["SharePointWebPart", "SharePointFullPage", "TeamsPersonalApp"]
  ```
- Estimating was the **only** webpart (of 11 total) with `SharePointFullPage`. All other webpart manifests use `["SharePointWebPart", "TeamsPersonalApp"]`.
- No normative plan, ADR, or blueprint document specifies full-page SPFx behavior for Estimating.
- Blueprint V4 uniformly describes all 11 breakout domains as "SPFx webparts" with simplified shells — no full-page application semantics.

**Impact:** `SharePointFullPage` caused the web part to appear in the single-part app page picker, which is untested, undesired, and contradicts the locked web-part-only target state.

**Fix applied:** Removed `SharePointFullPage` from `supportedHosts` in this prompt. Manifest now matches all other webpart manifests.

### 1.3 Custom Packaging Bypasses Compliance Verification (CONTRIBUTING)

**Evidence:**
- `tools/package-sppkg.ts` hand-assembles .sppkg OPC archives using the `archiver` library.
- The OPC structure is correct: `[Content_Types].xml`, `_rels/.rels`, `AppManifest.xml`, runtime manifest with `loaderConfig`, and `ClientSideAssets/` directory.
- However, the tool has no verification that:
  - Module IDs in `scriptResources` match actual bundle exports
  - The `internalModuleBaseUrls` placeholder (`https://spclientsideassetlibrary/`) is correctly rewritten by SharePoint
  - Bundle format is consumable by the SPFx loader
  - All code-split chunks are correctly declared and loadable
- `tools/validate-manifests.ts` validates file presence, GUID uniqueness, and port uniqueness only — not deployment correctness.
- No public evidence exists of a fully Vite-only SPFx web part (no gulp/heft) successfully deploying to production SharePoint.

**Impact:** The pipeline trusts custom packaging output without deployment-level validation, masking the module format incompatibility.

## 2. Current Package Classification

**Structurally valid but operationally noncompliant.**

| Aspect | Status |
|--------|--------|
| OPC archive structure | Correct |
| `[Content_Types].xml` | Correct |
| `_rels/.rels` | Correct |
| `AppManifest.xml` | Correct |
| Runtime manifest with `loaderConfig` | Correct structure, but references incompatible bundles |
| JS bundle format | **Incompatible** — ES modules vs required AMD-compatible |
| `internalModuleBaseUrls` placeholder | Correct value, but rewrite behavior unverified |
| `includeClientSideAssets` | Correctly set to `true` |
| `skipFeatureDeployment` | Correctly set to `true` |
| Deployment method (PnP.PowerShell) | Correct |

## 3. Locked Target State

For the Estimating SPFx remediation:

- Estimating is a **SharePoint web part only**
- Expected to be **addable to a SharePoint page** via the web part toolbox
- **Not** expected to launch as a full-page SPFx application
- **Not** expected to use single-part app pages
- **Not** expected to implement `SharePointFullPage`
- Vite-based local development is preserved where it does not conflict with deployment compliance

Any contradictory language in repo docs, code, manifests, build scripts, packaging scripts, or validation scripts is a defect to be resolved.

## 4. Contradiction Inventory

| # | Location | Contradiction | Resolution |
|---|----------|---------------|------------|
| C1 | `EstimatingWebPart.manifest.json` | `supportedHosts` included `SharePointFullPage` — unique among all 11 webparts | **Fixed in this prompt** — removed `SharePointFullPage` |
| C2 | `tools/package-sppkg.ts` | Packages Vite ES module output as-is; SPFx loader expects AMD-compatible format | Prompt 02 — packaging remediation |
| C3 | `tools/validate-manifests.ts` | Validates file presence and GUID/port uniqueness only — does not check `supportedHosts` compliance, bundle format, or deployment correctness | Prompt 03 — validation strengthening |
| C4 | `.github/workflows/spfx-build.yml` | Pipeline trusts custom packager output without deployment validation | Prompt 02 — pipeline update |
| C5 | ADR-0007 / ADR-0011 | Describe `.sppkg` packaging as "deferred" but `package-sppkg.ts` now exists and is treated as authoritative in CI | Noted; ADRs describe the original decision context accurately — the packaging tool was added later |

## 5. Implementation Decision Record

### What must change next (Prompt 02)

| File | Change |
|------|--------|
| `apps/estimating/vite.config.ts` | Configure Rollup output to produce AMD-compatible or SPFx-loader-compatible bundle format |
| `tools/package-sppkg.ts` | Either retire as authoritative deployment tool or add bundle format verification |
| `.github/workflows/spfx-build.yml` | Point to compliant packaging path |
| Build pipeline | Ensure production bundles are in SPFx-consumable format |

### What must not change yet

| File | Reason |
|------|--------|
| `apps/estimating/src/webparts/estimating/EstimatingWebPart.tsx` | Source-level web part implementation is correct |
| `apps/estimating/src/App.tsx` | Application composition is correct |
| `apps/estimating/config/package-solution.json` | Solution metadata is correct |
| Other webpart manifests | Already correct |
| Shared packages (`@hbc/auth`, `@hbc/shell`, etc.) | Not affected by this remediation |

### Legacy/custom behavior to retire

- The custom `.sppkg` assembly in `tools/package-sppkg.ts` must not remain the sole authoritative deployment artifact generator unless it is upgraded to verify bundle format compatibility.
- Validation tooling must be strengthened beyond file-presence and GUID-uniqueness checks.

## 6. Remediation Sequence

| Prompt | Scope | Status |
|--------|-------|--------|
| **01 (this prompt)** | Root cause proof, target-state lock, manifest fix | **Complete** |
| **02** | Compliant packaging and build remediation | Pending |
| **03** | Manifest/runtime/registration fix and validation strengthening | Pending |

## 7. External Research Summary

Key Microsoft guidance findings that inform the remediation:

1. **SPFx module loader** uses a require.js/SystemJS pattern — ES module bundles are not compatible.
2. **`internalModuleBaseUrls`** with the `https://spclientsideassetlibrary/` placeholder is rewritten by SharePoint when assets are included in the .sppkg — but only if SharePoint recognizes the package structure correctly.
3. **`supportedHosts`** controls toolbox/picker visibility only — it does not affect code execution. `SharePointWebPart` alone is sufficient for web-part-only deployment.
4. **No public evidence** exists of a fully Vite-only SPFx deployment to production without the official toolchain at least for packaging.
5. The closest viable pattern is using **Vite for the inner application** while keeping SPFx toolchain involvement for packaging, or ensuring Vite output format matches what the SPFx loader expects.
