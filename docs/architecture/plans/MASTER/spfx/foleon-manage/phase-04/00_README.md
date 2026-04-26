# Foleon Preview Fallback Development Package

Generated: 2026-04-25  
Repo truth: `RMF112018/hb-intel main (fetched via GitHub connector during audit)`  
Package purpose: audit and development plan only. This package does **not** implement the feature.

## Objective

Implement a polished, clearly labeled preview fallback for the `hb-intel-foleon` SPFx application when the Foleon integration is configured but no real Foleon content is available yet.

The fallback must show what the final Foleon experience will look like without pretending that sample content is real, without opening fake URLs, and without polluting production telemetry.

## Package contents

| File | Purpose |
|---|---|
| `01_REPO_TRUTH_AUDIT_FINDINGS.md` | Current route, data, state, runtime, and governance findings |
| `02_PREVIEW_FALLBACK_REQUIREMENTS.md` | Product and safety requirements for the fallback |
| `03_UI_UX_SPECIFICATION.md` | Visual, responsive, accessibility, and copy specification |
| `04_TECHNICAL_ARCHITECTURE_PLAN.md` | Files to modify/add and implementation architecture |
| `05_DATA_FIXTURE_AND_CONTENT_MODEL.md` | Preview fixture structure and safe sample content model |
| `06_ROUTE_BEHAVIOR_MATRIX.md` | Route-by-route decision table |
| `07_TESTING_AND_VALIDATION_PLAN.md` | Unit, DOM, package, and tenant validation requirements |
| `08_RISK_EXPOSURE_AND_GOVERNANCE.md` | Risk register and mitigations |
| `09_IMPLEMENTATION_PROMPT_PACKAGE_README.md` | Code-agent prompt package overview |
| `10_PROMPT_01_PREVIEW_MODEL_AND_FIXTURES.md` | Prompt 01 for isolated preview data/model |
| `11_PROMPT_02_HIGHLIGHTS_PREVIEW_FALLBACK.md` | Prompt 02 for Highlights route fallback |
| `12_PROMPT_03_CONTENT_HUB_PREVIEW_FALLBACK.md` | Prompt 03 for Content Hub fallback |
| `13_PROMPT_04_MANAGER_PREVIEW_GUIDANCE.md` | Prompt 04 for Manager route guidance |
| `14_PROMPT_05_TESTS_DOCS_AND_PACKAGE_PROOF.md` | Prompt 05 for tests, docs, version, proof |
| `15_TENANT_VALIDATION_RUNBOOK.md` | Post-deployment tenant validation |
| `manifest.json` | Package manifest and file index |

## Key recommendations

- Enable preview fallback by default only when runtime config is complete and content is empty.
- Do **not** add a property-pane toggle in the first pass. The runtime condition is safer and avoids one more persisted property surface.
- Add no backend dependency and no SharePoint list dependency for preview records.
- Use static TypeScript fixture data isolated from live services.
- Use `FoleonCard` where practical, but add explicit preview-safe actions so sample cards never emit normal `Card Click`, `Card Impression`, `External Open`, or `Reader Open` telemetry.
- Recommend one final package version bump from `1.0.16.0` to `1.0.17.0` if implementation lands as one feature branch.

## Important non-goals

- Do not create fake Foleon reader iframes.
- Do not mask missing list GUIDs, origin-policy defects, manifest/version mismatches, or backend connector defects.
- Do not add tenant REST auto-discovery.
- Do not change Safety, shell behavior outside the existing Foleon runtime bridge, or unrelated webparts.
- Do not commit `.sppkg` binaries unless the repo’s active packaging standard explicitly requires it.

## Executive audit summary

The current `hb-intel-foleon` app is no longer failing at runtime initialization based on the provided hosted proof and the reviewed source. Its current user-facing weakness is state modeling: when the app is properly configured but the content pipeline has no usable records, the public surfaces resolve to generic empty states.

The correct cutover target is a narrowly scoped preview fallback that appears only in configured-but-empty states. It must not replace configuration diagnostics, reader gating, management workflows, or production telemetry. It should be implemented as an isolated preview model and a reusable preview component that can render a polished sample of the intended final Highlights and Content Hub surfaces without writing to SharePoint, emitting normal telemetry, or opening fake URLs.

Recommended implementation sequence:

1. Add isolated preview fixture/model utilities and tests.
2. Implement Highlights preview fallback for configured + zero resolved records.
3. Implement Content Hub archive preview for configured + zero registry records, while preserving search/filter no-result empty states.
4. Add optional admin-facing preview guidance in the Manager route.
5. Finalize tests, docs, package version `1.0.17.0`, package proof, and tenant validation.


## Repo-truth files reviewed

- `apps/hb-intel-foleon/src/FoleonApp.tsx`
- `apps/hb-intel-foleon/src/pages/HighlightsPage.tsx`
- `apps/hb-intel-foleon/src/pages/ContentHubPage.tsx`
- `apps/hb-intel-foleon/src/pages/ReaderPage.tsx`
- `apps/hb-intel-foleon/src/pages/ManagePage.tsx`
- `apps/hb-intel-foleon/src/pages/manage/ManageOrchestrator.tsx`
- `apps/hb-intel-foleon/src/components/FoleonCard.tsx`
- `apps/hb-intel-foleon/src/components/FoleonStates.tsx`
- `apps/hb-intel-foleon/src/services/FoleonContentService.ts`
- `apps/hb-intel-foleon/src/services/FoleonPlacementService.ts`
- `apps/hb-intel-foleon/src/services/FoleonTelemetryEmitter.ts`
- `apps/hb-intel-foleon/src/types/foleon-content.types.ts`
- `apps/hb-intel-foleon/src/runtime/foleonRuntimeContract.ts`
- `apps/hb-intel-foleon/src/mount.tsx`
- `apps/hb-intel-foleon/src/webparts/foleon/runtimeContract.ts`
- `apps/hb-intel-foleon/src/webparts/foleon/FoleonWebPart.manifest.json`
- `tools/spfx-shell/src/webparts/shell/foleonRuntimeConfigBridge.ts`
- `apps/hb-intel-foleon/package.json`
- `apps/hb-intel-foleon/README.md`
- `docs/reference/spfx-surfaces/homepage-uiux-audit-checklist.md`
- `docs/reference/spfx-surfaces/homepage-uiux-audit-scorecard.md`
- `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Governing-Standard.md`
- `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Homepage-Overlay.md`


## External subject-matter sources consulted

- Microsoft Learn — SharePoint Framework property pane configuration: property panes expose configurable web part properties and support pages/groups/fields, including text fields, toggles, dropdowns, and custom controls.
- Microsoft Learn — SPFx preconfigured entries: manifest `preconfiguredEntries` can initialize web parts with scenario-specific defaults.
- Microsoft Learn — SPFx custom property pane controls: custom controls are appropriate when async or richer configuration behavior is needed.
- Microsoft Fluent 2 — Skeleton / shimmer guidance: loading placeholders should reflect the final layout structure, remain simple, and avoid long-running indeterminate illusions.
- Fluent 2 Accessibility guidance: accessible experiences require clear structure, predictable navigation, visible focus, and WCAG contrast.
- MDN ARIA `aria-busy` and `status` role: dynamic loading/status regions should communicate state politely and avoid disruptive focus changes.
- Foleon knowledge base — embed element guidance: embeds require a source URL, and whether a page can be embedded depends on source-site settings.

