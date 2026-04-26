# Prompt 05 — Final Tests, Documentation, Version Bump, Package Proof, and Tenant Validation

## Objective

Finalize the Foleon preview fallback feature set after Prompts 01–04 by performing a repo-truth release-readiness pass.

This prompt is not a new feature prompt. It is the final closure prompt for:

1. preview model and fixtures;
2. Highlights configured-empty preview fallback;
3. Content Hub configured-empty preview fallback and live filter/search distinction;
4. Manager read-only preview guidance;
5. documentation, versioning, build/package proof, and tenant validation readiness.

The expected deployable package version for this feature branch is `1.0.17.0`, unless repo truth proves a different versioning standard is required.

## Current completed work to preserve

Use current `main` as source of truth, but preserve the following completed implementation intent and commits:

- Prompt 01: `d583a8be9238e88ae45b08d8c7d076948d9882c4` — `hb-intel-foleon: add preview fixture model`
- Prompt 02: `3322beb3f98cbff65a96649d7e9f37900859e91c` — `hb-intel-foleon: add highlights preview fallback`
- Prompt 03: `a42901ce728c8c454b7cdaceef9a13bba89b0a4b` — `hb-intel-foleon: add content hub preview fallback`
- Prompt 04: `a79fe318ff36d9d0f6d9186488590f2d62665973` — `hb-intel-foleon: add manager preview guidance`

If current repo history differs, do not assume the commits are missing. Verify `git log` and current source before making any changes.

## Global instructions for the code agent

- Work only in `/Users/bobbyfetting/hb-intel`.
- Use the live repo `main` branch as source of truth.
- Do not rely on prior summaries without verifying source files.
- Do not re-read files already within your current context unless verifying a specific line, contradiction, version reference, or diff.
- Existing unrelated dirty/untracked files may be present, including `.gitignore`, Safety/backend files, docs, and deleted zip artifacts. Do not modify, stage, unstage, delete, restore, or commit unrelated work.
- Stage only Prompt 05 files.
- Do not touch unrelated Safety files, backend files, docs outside the Foleon scope, or untracked phase docs.
- Do not implement beyond this prompt's scope.
- Preserve current Foleon runtime proof and diagnostics.
- Preserve the runtime config bridge, manual Foleon property pane behavior, safe defaults, and diagnostics behavior introduced through versions `1.0.14.0`–`1.0.16.0`.
- Preserve all preview fallback behavior completed in Prompts 01–04.
- Do not weaken reader origin, iframe, publish-status, display-window, or preview-URL gates.
- Do not add backend dependencies for preview content.
- Do not change SharePoint list provisioning unless repo truth proves a strict source-architecture need. The expected result is no provisioning change.
- Do not commit generated `.sppkg` binaries unless the active repo packaging standard explicitly requires them.

## Files to inspect

Inspect current repo truth before modifying anything:

### Preview implementation files from Prompts 01–04

- `apps/hb-intel-foleon/src/preview/FoleonPreviewTypes.ts`
- `apps/hb-intel-foleon/src/preview/FoleonPreviewData.ts`
- `apps/hb-intel-foleon/src/preview/__tests__/FoleonPreviewData.test.ts`
- `apps/hb-intel-foleon/src/components/FoleonPreviewCard.tsx`
- `apps/hb-intel-foleon/src/components/FoleonPreviewFallback.tsx`
- `apps/hb-intel-foleon/src/components/FoleonPreviewFallback.module.css`
- `apps/hb-intel-foleon/src/components/__tests__/FoleonPreviewFallback.test.tsx`
- `apps/hb-intel-foleon/src/pages/HighlightsPage.tsx`
- `apps/hb-intel-foleon/src/pages/__tests__/HighlightsPage.preview.test.tsx`
- `apps/hb-intel-foleon/src/pages/ContentHubPage.tsx`
- `apps/hb-intel-foleon/src/pages/__tests__/ContentHubPage.preview.test.tsx`
- `apps/hb-intel-foleon/src/pages/manage/ManagePreviewGuidancePanel.tsx`
- `apps/hb-intel-foleon/src/pages/manage/ManageOrchestrator.tsx`
- `apps/hb-intel-foleon/src/pages/manage/manageFields.module.css`
- `apps/hb-intel-foleon/src/pages/__tests__/ManagePage.test.tsx`

### Runtime, manifest, version, packaging, and proof files

- `apps/hb-intel-foleon/src/webparts/foleon/runtimeContract.ts`
- `apps/hb-intel-foleon/src/webparts/foleon/FoleonWebPart.manifest.json`
- `apps/hb-intel-foleon/package.json`
- `apps/hb-intel-foleon/config/package-solution.json`
- `apps/hb-intel-foleon/scripts/prove-foleon-package.ts`
- `apps/hb-intel-foleon/scripts/validate-foleon-feature-assets.ts`
- `tools/build-spfx-package.ts`
- `tools/spfx-shell/scripts/validate-foleon-runtime-config-bridge.ts`
- `tools/spfx-shell/src/webparts/shell/foleonRuntimeConfigBridge.ts`

### Documentation files

- `apps/hb-intel-foleon/README.md`
- `apps/hb-intel-foleon/docs/release-runbook.md`
- `apps/hb-intel-foleon/docs/provisioning.md`
- `apps/hb-intel-foleon/docs/telemetry.md`
- `apps/hb-intel-foleon/docs/accessibility-checklist.md`
- `apps/hb-intel-foleon/docs/homepage-uiux-audit-checklist-notes-foleon.md`
- `apps/hb-intel-foleon/docs/homepage-uiux-audit-scorecard-foleon.md`

## Files likely to modify

Expected Prompt 05 modifications are limited to:

- final test updates under `apps/hb-intel-foleon/src/**/__tests__` only if gaps are found;
- `apps/hb-intel-foleon/src/webparts/foleon/runtimeContract.ts`;
- `apps/hb-intel-foleon/src/webparts/foleon/FoleonWebPart.manifest.json`;
- Foleon app docs under `apps/hb-intel-foleon/docs/`;
- `apps/hb-intel-foleon/README.md`.

Do not modify public route or Manager implementation code unless validation exposes a Prompt 05-caused defect or a missed acceptance gap that cannot be closed in tests/docs/versioning alone. If implementation code changes are required, keep them minimal and explain why in the closure report.

## Required final audit before changes

Before modifying files, verify and record the current behavior from source:

1. Preview records are isolated from `FoleonContentRecord` and carry an explicit preview discriminator.
2. Preview records have no URL, href, doc ID, item ID, embed, telemetry, reader, or open-mode fields.
3. Highlights configured + successful zero renderable records renders preview fallback.
4. Highlights config/fetch errors render `FoleonError`, not preview.
5. Highlights live records suppress preview fallback and continue to use `FoleonCard`.
6. Content Hub configured + successful zero registry records renders Hub preview fallback.
7. Content Hub live records + search/type miss renders the filter-specific empty state, not preview.
8. Content Hub empty-registry search updates local input without calling `onSearch` or emitting normal Search telemetry.
9. Content Hub live-record search still calls `onSearch` normally.
10. Manager guidance appears only in ready state when public preview remains likely relevant.
11. Manager guidance uses the public-readiness condition from actual `FoleonManagedContent` fields.
12. Manager guidance is read-only and does not create fake records, placements, actions, sync runs, links, buttons, or editable content.
13. Runtime proof still reports configuration readiness, not content availability.
14. No preview fallback weakens reader gating or iframe/origin policy.

If any of these are false, fix only the Foleon preview fallback defect and document the correction.

## Implementation requirements

### 1. Finalize test coverage

Run the existing test suite first. If the existing Prompt 01–04 tests already cover all required behavior, do not add redundant tests.

Add or adjust tests only for real gaps in these areas:

- Preview fixture safety and discriminator shape.
- Highlights configured-empty preview fallback.
- Highlights live data precedence.
- Highlights config/fetch error behavior.
- No preview records in `FoleonCard`, `onOpenReader`, `onOpenExternal`, or `onCardImpression`.
- No anchors, iframes, fake working buttons, disabled reader buttons, mock URLs, or fake reader areas in preview UI.
- Content Hub configured-empty preview fallback.
- Content Hub live filter/search miss remains `FoleonEmpty`, not preview.
- Content Hub empty-registry search does not call `onSearch`.
- Content Hub live-record search still calls `onSearch`.
- Manager guidance ready-state/public-readiness trigger.
- Manager guidance does not appear in blocked/error states.
- Manager guidance is read-only and contains no fake controls, anchors, iframes, records, placements, sync actions, or editable preview content.
- Runtime contract/proof tests still pass after version bump.

### 2. Update version to `1.0.17.0`

If all Prompt 01–04 preview behavior is present on one deployable branch, update the package/runtime version from `1.0.16.0` to `1.0.17.0` in the correct repo-truth files.

Expected version files include at minimum:

- `apps/hb-intel-foleon/src/webparts/foleon/runtimeContract.ts`
- `apps/hb-intel-foleon/src/webparts/foleon/FoleonWebPart.manifest.json`

Update all manifest `expectedPackageVersion` default values from `1.0.16.0` to `1.0.17.0`.

Do not change the manifest ID.
Do not change webpart alias.
Do not change `supportedHosts`.
Do not change `supportsFullBleed` unless repo truth unexpectedly proves a packaging defect.
Do not bump multiple times.
Do not modify `package.json` version unless the existing repo packaging convention requires it.

### 3. Update docs

Update Foleon app documentation so an admin or developer can understand the feature without reading the implementation diffs.

Documentation must explain:

- what the preview fallback is;
- why it exists;
- that it is a clearly labeled preview/sample layout, not mock deception;
- where it appears:
  - Highlights configured + zero public/renderable records;
  - Content Hub configured + zero registry records;
  - Manager read-only guidance when public preview remains likely relevant;
- where it must not appear:
  - missing runtime/list configuration;
  - fetch/service errors;
  - Reader route;
  - Content Hub filter/search misses against an existing live corpus;
  - live records that are public-ready;
- how admins replace preview with real content:
  - publish visible content;
  - ensure content is public-renderable;
  - create/activate valid homepage placements where required;
  - sync or create records through the Manager/backend workflow as applicable;
- telemetry posture:
  - preview records do not emit production content telemetry;
  - preview cards do not emit impressions, reader opens, external opens, or fake search telemetry;
  - empty-registry Hub search does not emit normal Search telemetry;
  - live-record Hub search continues to emit normal Search telemetry;
- governance/security posture:
  - no backend dependency for preview content;
  - no SharePoint provisioning change;
  - no reader gate weakening;
  - no preview URLs or mock Foleon URLs;
  - no fake iframes;
- tenant validation steps for empty-preview and live-data precedence.

Candidate docs to update:

- `apps/hb-intel-foleon/README.md`
- `apps/hb-intel-foleon/docs/release-runbook.md`
- `apps/hb-intel-foleon/docs/telemetry.md`
- `apps/hb-intel-foleon/docs/provisioning.md` only if useful to clarify that provisioning is unchanged.
- `apps/hb-intel-foleon/docs/accessibility-checklist.md` only if current preview accessibility guidance is missing.

Do not create broad new architecture docs unless needed. Prefer concise updates to the existing Foleon app docs.

### 4. Preserve runtime proof truthfulness

The preview feature must not change the meaning of runtime proof.

Required proof semantics:

- `canInitialize` remains a configuration-readiness flag, not a content-availability flag.
- `issueCodes` remain empty when required config is present, even if preview fallback is visible due to no public content.
- Preview fallback state must not masquerade as live content in runtime proof.
- `window.__hbIntel_foleonRuntimeBindingProof` must remain redacted and must not include raw list GUIDs, raw origins, raw reader paths, preview fixture content, sample titles, or preview data.
- `?foleon-diagnostics=1` remains admin diagnostics only and does not expose preview fixture data.

### 5. Preserve telemetry non-contamination

Confirm and document:

- Preview cards do not call `onCardImpression`.
- Preview cards do not call `onOpenReader`.
- Preview cards do not call `onOpenExternal`.
- Preview cards do not emit reader open/close/embed events.
- Preview cards do not emit external open events.
- Empty-registry Hub search does not call the telemetry-facing `onSearch` prop.
- Live-record search behavior remains unchanged.
- Manager guidance does not emit telemetry or call sync/placement workflows.

### 6. Build and package proof

Run the full validation command set below.

Build/package proof must confirm:

- version is `1.0.17.0` in source and package truth;
- manifest ID remains `2160edb3-675e-4451-92bb-8345f9d1c71e`;
- generated package includes the updated runtime bundle;
- generated package includes the updated preview code because it is imported by routed components;
- runtime config bridge validation still passes;
- schema validation still passes;
- package proof still passes;
- no Safety or unrelated webpart files were staged or committed.

If the generated `.sppkg` appears in `dist/sppkg/`, do not stage it unless current repo policy requires committed package binaries. Document the generated artifact path and whether it was intentionally left unstaged.

## Full validation command set

Run all commands unless a repo-truth reason makes a command impossible. Document every result.

```bash
git status --short
git branch --show-current
git log -5 --oneline

npx tsx tools/spfx-shell/scripts/validate-foleon-runtime-config-bridge.ts

pnpm --filter @hbc/spfx-hb-intel-foleon lint
pnpm --filter @hbc/spfx-hb-intel-foleon check-types
pnpm --filter @hbc/spfx-hb-intel-foleon test
pnpm --filter @hbc/spfx-hb-intel-foleon build
pnpm --filter @hbc/spfx-hb-intel-foleon schema:validate

pnpm --dir tools/spfx-shell build

npx tsx tools/build-spfx-package.ts --domain hb-intel-foleon
pnpm --filter @hbc/spfx-hb-intel-foleon package:proof
```

If `tools/spfx-shell` build fails under Node 22 due to SPFx engine constraints, rerun under Node 18 and document both results.

If a validation command fails due to unrelated pre-existing repo state, do not broaden the prompt. Document the failure, isolate whether Prompt 05 caused it, and fix only Prompt 05-caused failures.

## Tenant validation runbook to include in docs or closure

Include or update tenant validation instructions covering:

1. Deploy `hb-intel-foleon` package version `1.0.17.0` to the app catalog/site as currently required.
2. Configure list GUIDs using the existing property pane fields.
3. Validate runtime proof:
   ```js
   JSON.stringify(window.__hbIntel_foleonRuntimeBindingProof, null, 2)
   ```
4. Expected proof for configured empty-content state:
   - `packageVersion: "1.0.17.0"`
   - `canInitialize: true`
   - `issueCodes: []`
   - required config `presence.*` fields remain true
   - proof does not include preview fixture data
5. Test Highlights with configured lists but zero public/renderable records.
6. Test Content Hub with zero registry records.
7. Type a Hub search while registry is empty and confirm no live Search telemetry is written.
8. Add or sync one published, visible, public-ready content registry record.
9. Confirm Content Hub preview disappears and live archive renders.
10. Add or activate a valid homepage placement as required by Highlights.
11. Confirm Highlights preview disappears when renderable live Highlights records exist.
12. Confirm live card impressions/clicks work only for real records.
13. Confirm Reader gate behavior remains unchanged.
14. Confirm `?foleon-diagnostics=1` shows admin diagnostics only and does not expose preview data.
15. Confirm console has no new preview-related errors.

## Explicit non-goals

Do not:

- change preview fixture data unless tests/docs reveal a strict defect;
- add new public preview behavior beyond Prompts 01–03;
- add new Manager workflows beyond Prompt 04 guidance;
- create fake Foleon URLs;
- create fake reader iframes;
- add fake buttons or disabled reader buttons;
- add preview records to Manager data;
- add backend functions;
- change SharePoint list schemas or provisioning assets;
- change runtime proof semantics;
- weaken iframe/origin/publish/display-window gates;
- alter Safety or unrelated webparts;
- commit generated `.sppkg` unless repo policy explicitly requires it.

## Commit rules

- One focused commit for Prompt 05 if changes are made.
- Stage only Prompt 05 changes.
- Do not stage unrelated dirty/untracked files.
- Do not stage generated package artifacts unless current repo policy explicitly requires them.
- Commit message:

```text
hb-intel-foleon: finalize preview fallback package proof
```

Commit body must include:

- version bump summary;
- docs updated;
- tests added/confirmed;
- validation commands run;
- package proof result;
- runtime proof impact;
- telemetry impact;
- confirmation no backend/provisioning/Safety/unrelated changes;
- generated package artifact path and staged/not-staged status;
- tenant validation follow-ups.

## Required closure report

Return this exact closure report format:

```md
# Closure Report

## Summary

## Files Changed

## Versioning
- Previous package/runtime version:
- New package/runtime version:
- Manifest ID unchanged:
- Manifest expectedPackageVersion defaults updated:

## Documentation Updated

## Tests Added / Updated / Confirmed

## Validation Commands and Results

## Package Proof
- Package build command:
- Generated package path:
- Package proof result:
- Generated artifact staged or intentionally left unstaged:

## Runtime Proof Impact
- `canInitialize` semantics preserved:
- Redacted proof preserved:
- Diagnostics behavior preserved:

## Telemetry Impact
- Preview impressions:
- Preview reader opens:
- Preview external opens:
- Empty-registry Hub search:
- Live-record Hub search:

## Tenant Validation Notes

## Risks / Follow-Ups

## Commit
```

## Acceptance standard

Prompt 05 is complete only when:

- all Prompt 01–04 behavior remains intact;
- all Foleon tests pass;
- build passes;
- schema validation passes;
- runtime config bridge validation passes;
- SPFx shell build is validated or Node-version exception is documented;
- package build succeeds;
- package proof succeeds;
- package/runtime version is consistently `1.0.17.0` where repo truth requires it;
- docs explain preview behavior accurately;
- no preview data contaminates live telemetry, runtime proof, reader routing, external opens, Manager state, or SharePoint provisioning;
- unrelated files remain untouched and unstaged.
