# Project Setup Requests — Boundary Separation

> **Date**: 2026-03-30
> **Scope**: Re-scope the current Estimating SPFx surface to its true product boundary: Project Setup Requests
> **Surfaces**: `apps/estimating/` (directory to be renamed in follow-up), SPFx shell, build orchestrator

---

## 1. Product Direction

The current Estimating SPFx surface only deploys Project Setup Requests routes. Per product direction:

- **Project Setup Requests** → standalone SPFx package (this surface)
- **Bids** → future Estimating SPFx surface (separate package)
- **Templates** → future Admin SPFx surface (separate package)
- **PWA migration** → this surface will eventually move into the PWA; avoid dead-end page-local decisions
- **TeamsPersonalApp** → remains in supported hosts

## 2. Repo-Truth Findings

| Aspect | Before | Finding |
|--------|--------|---------|
| Package name | `@hbc/spfx-estimating` | Implies broader Estimating scope |
| Solution name | `hb-intel-estimating` | Same mismatch |
| WebPart title | "HB Intel Estimating" | Users see "Estimating" in SharePoint |
| IIFE global | `__hbIntel_estimating` | Build artifact identity tied to old scope |
| Bundle filename | `estimating-app.js` | Same mismatch |
| Router | Only Project Setup routes registered | Correct posture, but framed as "deployment restriction" |
| BidsPage.tsx | Present but unrouted | Dead code for this surface |
| TemplatesPage.tsx | Present but unrouted | Dead code for this surface |
| Build domain | `{ dir: 'estimating', camel: 'estimating' }` | Incorrect camel/pascal names |

## 3. Boundary Decisions Made

### 3.1 Identity Re-scope (Implemented)

| Aspect | Before | After |
|--------|--------|-------|
| Package name | `@hbc/spfx-estimating` | `@hbc/spfx-project-setup` |
| Version | 0.1.13 | 0.2.0 (minor bump for breaking identity change) |
| Solution name | `hb-intel-estimating` | `hb-intel-project-setup` |
| Solution version | 0.0.0.8 | 1.0.0.0 |
| WebPart title | "HB Intel Estimating" | "Project Setup Requests" |
| WebPart icon | BuildDefinition | ProjectCollection |
| IIFE global | `__hbIntel_estimating` | `__hbIntel_projectSetup` |
| Bundle filename | `estimating-app.js` | `project-setup-app.js` |
| Build domain camel | `estimating` | `projectSetup` |
| Build domain pascal | `Estimating` | `ProjectSetup` |

### 3.2 Dead Code Removal (Implemented)

- **Deleted** `BidsPage.tsx` — mock data table, belongs in future Estimating SPFx
- **Deleted** `TemplatesPage.tsx` — empty state placeholder, belongs in future Admin SPFx

### 3.3 Preserved Decisions

- **Directory path** `apps/estimating/` kept for now — a directory rename is a high-blast-radius follow-up
- **Feature package** `@hbc/features-estimating` unchanged — it owns Project Setup wizard config alongside Bid Readiness, and splitting it is a separate concern
- **Solution ID** `d01a9600-a68a-4afe-83a5-514339f47dbb` preserved — same SharePoint app identity for upgrade deployment
- **WebPart ID** `3c4dbd5c-5bec-4014-8b77-737ac725a5cc` preserved — same component identity
- **Feature ID** `cb3b1520-1665-4412-83ab-344c2182a2fd` preserved
- **TeamsPersonalApp** in supportedHosts preserved
- **Light-mode enforcement** via `HbcThemeProvider(forceTheme='light')` preserved
- **WorkspaceId** remains `'estimating'` (valid shell workspace; the surface belongs to the estimating product domain)
- **Backend mode** default `'ui-review'` for this directory preserved in build orchestrator

## 4. Files Changed

| File | Change |
|------|--------|
| `apps/estimating/package.json` | Name → `@hbc/spfx-project-setup`, version → 0.2.0 |
| `apps/estimating/config/package-solution.json` | Solution name, version, descriptions, feature title, sppkg path |
| `apps/estimating/src/webparts/estimating/EstimatingWebPart.manifest.json` | Title, description, icon |
| `apps/estimating/vite.config.ts` | IIFE global → `__hbIntel_projectSetup`, filename → `project-setup-app.js` |
| `apps/estimating/src/mount.tsx` | Global publication → `__hbIntel_projectSetup` |
| `apps/estimating/src/router/root-route.tsx` | Shell config renamed, comments updated |
| `apps/estimating/src/router/routes.ts` | Comments updated to reflect true boundary |
| `apps/estimating/src/test/router.test.ts` | Test descriptions updated |
| `apps/estimating/src/pages/BidsPage.tsx` | **Deleted** |
| `apps/estimating/src/pages/TemplatesPage.tsx` | **Deleted** |
| `tools/build-spfx-package.ts` | Domain entry camel/pascal updated |
| `.github/workflows/ci.yml` | Filter name updated |
| `.github/workflows/P0-E1-gate.yml` | Filter name updated |

## 5. Verification

| Check | Result |
|-------|--------|
| `@hbc/spfx-project-setup build` | Pass (1,183.90 KB, gzip 337.21 KB) |
| `@hbc/spfx-project-setup lint` | Pass (0 errors, 62 pre-existing warnings) |
| `@hbc/spfx-project-setup test` | 107/107 pass + 2 todo (16 files) |

## 6. Risks and Follow-Ups

### Follow-ups (recommended order)

1. **Directory rename** `apps/estimating/` → `apps/project-setup/` — high blast radius (vite configs, CI paths, vitest workspace, build orchestrator `dir` field). Should be its own commit.
2. **Feature package split** — extract Project Setup config from `@hbc/features-estimating` into `@hbc/features-project-setup` if the Bid Readiness / Post-Bid features diverge in ownership.
3. **UI composition polish** — deeper page-level UI improvements for the Project Setup surfaces (later prompts).
4. **SPFx package rebuild** — run `npx tsx tools/build-spfx-package.ts --domain estimating` to produce `hb-intel-project-setup.sppkg`.

### Risks

- **SharePoint App Catalog upgrade**: The solution ID is preserved, so SharePoint will treat this as an upgrade of the existing app. The name change from "hb-intel-estimating" to "hb-intel-project-setup" should be transparent to the upgrade flow, but verify in the staging app catalog.
- **Teams app identity**: If the Teams app was pinned by webpart ID (preserved), it should continue working. If it was pinned by solution name, the name change may require re-pinning.
