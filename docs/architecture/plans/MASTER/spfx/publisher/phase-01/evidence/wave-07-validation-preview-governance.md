# Wave 7 / Prompt-07 — Validation, Preview, and Governance

**Closed:** 2026-04-13
**Scope:** Template-aware validation engine, preview builder that shares the publish resolution pipeline, publish orchestrator guardrail, authoring-UI Preview tab + drift/validation chips, test coverage.

---

## 1. Validation engine

`apps/hb-webparts/src/homepage/data/publisherAdapter/validation/validationEngine.ts`

Pure `validatePublishContext(context, { shell })` → `ValidationResult { ok, errors[], warnings[], summaryByCategory }`. Every finding carries `{ category, severity, field?, message, actionHint? }` using the exact nine categories from architecture doc 08 §"Validation error categories".

### Global rules (arch doc 08 §1–§16)

| # | Rule | Severity | Category |
|---|------|----------|----------|
| 1 | `PostId` present | error | `missing-required-field` |
| 2 | `TargetSiteKey === 'projectSpotlight'` | error | `invalid-template-match` |
| 3 | `TargetSiteUrl` contains `sites/ProjectSpotlight` | error | `invalid-template-match` |
| 4 | `PostFamily` set | error | `missing-required-field` |
| 5 | `TemplateKey` resolves to an active template | error | `missing-required-field` / `invalid-template-match` |
| 6 | `PageShellKey` set | error | `missing-required-field` |
| 7 | `SourceTemplatePath` set | error | `missing-required-field` |
| 8 | `Title` set | error | `missing-required-field` |
| 9 | `Subhead` set when shell has the subhead slot | error | `missing-required-field` |
| 10 | `BodyRichText` set when shell has the body slot | error | `missing-required-field` |
| 11 | `Slug` set (uniqueness flagged as a hosted concern) | error / warning | `invalid-slug` |
| 12 | `BannerImageUrl` set when shell has the banner slot | error | `missing-required-field` |
| 13 | `BannerImageAltText` set when banner image exists | error | `invalid-image-accessibility` |
| 14 | Every `gallery` media row has `AltText` | error | `invalid-image-accessibility` |
| 15 | Existing-binding `BindingStatus === 'error'` surfaces a retry warning | warning | `page-generation-blocker` |
| 16 | Secondary-image media does not render on a shell that lacks the slot | warning | `invalid-shell-compatibility` |

### Template-profile required fields (arch doc 08 §§A,B,C)

Routed by `template.RequiredFieldSetKey`:

- `req-ps-inprogress-monthly-v1` — ProjectId, ProjectName, ProjectStage, Title, Subhead, SummaryExcerpt, Slug, BannerImageUrl, BannerImageAltText, BodyRichText.
- `req-ps-inprogress-milestone-v1` — same set less ProjectStage, plus `MilestoneLabel` + `MilestoneDateUtc` (both required).
- `req-ps-inprogress-project-update-v1` — same base minus ProjectStage.

Unknown `RequiredFieldSetKey` values emit an `invalid-template-match` **warning** and continue with global rules only. No silent skip.

### Conditional rules

- `ShowTeamViewer !== false` AND `template.ShowTeamBlock === true` AND no `IncludeInViewer!==false` rows → `invalid-team-configuration` error.
- `ShowGallery !== false` AND `template.ShowGalleryBlock === true` AND no `MediaRole === 'gallery'` rows → `invalid-gallery-configuration` error.

### Shell-compatibility + drift

- `template.ShowTeamBlock` without a team slot → `invalid-shell-compatibility` error.
- `template.ShowGalleryBlock` without a gallery slot → `invalid-shell-compatibility` error.
- `template.BannerRendererKind === 'hbSignatureHero'` on a non-Custom banner slot → `invalid-shell-compatibility` warning.
- `existingBinding.PageShellVersion !== shell.shellVersion` AND `template.ForceRegenerationOnShellChange === true` → `page-generation-blocker` warning ("will regenerate on next publish").

### Length recommendations (warnings only)

Title ≤ 120, Subhead ≤ 200, SummaryExcerpt ≤ 280. Not hard blockers; flagged as warnings categorized under `missing-required-field` for UI grouping.

### Tests

`validationEngine.test.ts` — 10 cases: happy path, missing `Title`, team misconfiguration, gallery misconfiguration, gallery image missing alt text with `media[0].AltText` field path, milestone template requiring `MilestoneLabel` + `MilestoneDateUtc`, `hbSignatureHero` compatibility warning, shell-version-drift under `ForceRegenerationOnShellChange`, unknown `RequiredFieldSetKey` tolerance, TargetSiteKey sanity.

## 2. Preview builder

`apps/hb-webparts/src/homepage/data/publisherAdapter/preview/previewBuilder.ts`

`buildPublisherPreview(repositories, postId, { shell? })` → `PreviewOutcome` with `resolution`, `composedPage`, `structuralErrors`, `validation`, `decision`, `drift`.

**Pipeline proof (operating-charter rule 8):**

```
buildPublisherPreview
  ├── buildPublishResolutionContext   ← same function publishOrchestrator.run() calls
  │     └── resolveTemplate            ← deterministic resolver (Wave 3)
  ├── composeProjectSpotlightPage     ← same compositor publishOrchestrator uses
  ├── validateComposedPageStructure   ← Wave 4 structural validator
  ├── validatePublishContext          ← Wave 7 content validator
  └── decideRepublishAction           ← Wave 5 policy
```

No duplicated logic. The compositor test `previewBuilder.test.ts#shares compositor output with the publish pipeline` asserts `direct.controls === preview.composedPage.controls` by running `composeProjectSpotlightPage` against the same resolution context and comparing control-by-control.

`drift: { shellKeyDrift, shellVersionDrift, templateKeyDrift, templateVersionDrift }` is derived from the existing binding vs. the composed identity; a missing binding yields all-false.

### Tests

`previewBuilder.test.ts` — 5 cases: well-formed preview, compositor-parity with publish pipeline, validation failures propagate without throwing, drift flags populate when binding has drifted, typed failure when the post is missing.

## 3. Orchestrator guardrail

`apps/hb-webparts/src/homepage/data/publisherAdapter/publishOrchestrator.ts`

Additions:
- `PublishRequest.validateBeforePublish?: boolean` (default `true`).
- `PublishRequest.shell?: PageShellManifest` (defaults to `PROJECT_SPOTLIGHT_V1_SHELL`).
- `PublishOutcome` widened: success carries optional `validation`; failure `stage` includes `'validation'` with an attached `ValidationResult`.
- Preview mode always runs validation (never blocks) so the UI sees findings.
- Create / republish mode runs validation between composition and policy; an `ok:false` result blocks the page-creation service and binding writer.

Governance ledger:

| Bypass surface | Closure |
|----------------|---------|
| Silent publish of an invalid post | `validateBeforePublish` defaults to `true`; violation → `stage:'validation'` failure. |
| UI publish click ignoring validation | Authoring-UI `Publish` / `Republish` buttons disabled when `preview.validation.ok === false`; tooltip names the first error. |
| Unseen drift between binding and current shell | Drift chip + preview Drift Banner; orchestrator's republish policy still forces regeneration when `ForceRegenerationOnShellChange`. |
| Automation path deliberately skipping validation | Single opt-in: `{ validateBeforePublish: false }` — documented, explicit, and covered by a dedicated test. |

Tests added to `publishOrchestrator.test.ts` (now 9 cases total): validation-failure blocks publish and does not touch page-creation or binding writers; `validateBeforePublish: false` bypasses the gate.

## 4. Authoring UI plumbing

`apps/hb-webparts/src/webparts/projectSpotlightPublisher/ProjectSpotlightPublisher.tsx`

- New **Preview** tab (between Gallery and Status). Renders (top → bottom): drift banner (red on key drift, amber on version drift, silent when aligned), validation findings list (errors grouped first, then warnings, each with category badge + field path + actionHint), decision preview ("on publish, action = X because Y, notes..."), and a structured page preview listing each composed control with slot-specific summary (banner title+image URL+alt; subhead/body snippets; team heading+layout+density+articleId; gallery count+layout).
- `Publish` and `Republish` buttons disabled when `preview.validation.ok === false`; title tooltips name the first blocking error.
- Action bar surfaces `⚠ drift — will regenerate` chip when drift is detected, and `🛑 N blocking error(s)` chip when validation blocks.
- Save draft is unchanged (drafts can be invalid); the `statusLine` still reports save results.
- Preview refreshes automatically on tab open or post change; cache stale after Save.

CSS + `.d.ts` extended with drift/validation chip classes, drift banner variants, finding list, preview control grid, and snippet text.

## 5. Test evidence

```
Test Files  8 passed (8)
     Tests 67 passed (67)
```

Breakdown:
- `templateResolver.test.ts` — 12 (carryover).
- `xmlShellParser.test.ts` — 3 (carryover).
- `pageCompositor.test.ts` — 10 (carryover).
- `republishPolicy.test.ts` — 11 (carryover).
- `workflowStateMachine.test.ts` — 7 (carryover).
- `publishOrchestrator.test.ts` — 9 (was 7; + validation-blocks, + validateBeforePublish=false bypass).
- `validationEngine.test.ts` — 10 (new).
- `previewBuilder.test.ts` — 5 (new).

Run command: `pnpm exec vitest run src/homepage/data/publisherAdapter/` from `apps/hb-webparts/`.

## 6. Verification performed

| Check | Result |
|-------|--------|
| `pnpm --filter @hbc/spfx-hb-webparts check-types` | ✅ clean |
| `pnpm exec vitest run src/homepage/data/publisherAdapter/` | ✅ 67 / 67 pass |
| Preview ↔ publish compositor parity asserted in-test | ✅ `previewBuilder.test.ts` |
| `buildPublisherPreview` consumes the same resolver + compositor as publish | ✅ pipeline trace above |
| Legacy Team Viewer webpart | ✅ untouched |
| Legacy provisioner | ✅ untouched |
| `@hbc/sharepoint-platform` public API | ✅ untouched |

## 7. Files delivered

**New:**
- `apps/hb-webparts/src/homepage/data/publisherAdapter/validation/validationEngine.ts`
- `apps/hb-webparts/src/homepage/data/publisherAdapter/validation/validationEngine.test.ts`
- `apps/hb-webparts/src/homepage/data/publisherAdapter/preview/previewBuilder.ts`
- `apps/hb-webparts/src/homepage/data/publisherAdapter/preview/previewBuilder.test.ts`

**Modified:**
- `apps/hb-webparts/src/homepage/data/publisherAdapter/publishOrchestrator.ts` — `validateBeforePublish` gate; `stage='validation'` failure; preview mode runs validation; shell override.
- `apps/hb-webparts/src/homepage/data/publisherAdapter/publishOrchestrator.test.ts` — +2 cases.
- `apps/hb-webparts/src/homepage/data/publisherAdapter/index.ts` — barrel re-exports Wave 7 modules.
- `apps/hb-webparts/src/webparts/projectSpotlightPublisher/ProjectSpotlightPublisher.tsx` — Preview tab, validation-driven gates, drift chip.
- `apps/hb-webparts/src/webparts/projectSpotlightPublisher/project-spotlight-publisher.module.css` (+ `.d.ts`) — new classes.
- `apps/hb-webparts/config/package-solution.json` — manifest version bump.
- `docs/architecture/plans/MASTER/spfx/publisher/phase-01/evidence/implementation-tracker.md` — Wave 7 ✅.

## 8. Out of scope (by design)

- Visual full-page rendering of the composed page (preview is structural + honest).
- `Slug` uniqueness lookup — flagged as a warning; Wave 9 hosted concern.
- `publishingErrors.append` writer promotion — findings surface in the validator, not in the errors list.
- Team-viewer profile-drawer content validation (warnings only; no hard checks).
- Per-template length-limit tuning — length caps remain global warnings.

## 9. Handoff to Prompt-08

Prompt-08 / Wave 8 (Team Viewer closure) inherits:
- A publish pipeline that validates before write: Team Viewer binding issues surface as `invalid-team-configuration` findings, not silent page-generation failures.
- A structural preview that shows the exact TeamViewer payload (`articleId`, `destinationKey`, layout, density, feature flags) the page-creation service will write — direct input for contract-confirmation against the live `teamViewer` webpart.

Blocking unknowns carried forward unchanged: #3 photo hydration timing (TeamViewer routes to its runtime adapter), #4 publish principal (Wave 9), #6 scheduled publishing.
