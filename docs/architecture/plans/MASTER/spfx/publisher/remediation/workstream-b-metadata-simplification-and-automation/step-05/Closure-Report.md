# Workstream B — Step 05 Closure Report

**Prompt:** Phase-08 / Phase-2 / Prompt-05 — Validate metadata simplification end-to-end and close Workstream B
**Status:** Workstream B closed.
**Date:** 2026-04-14
**Final SPFx manifest:** `hb-webparts` 1.0.0.274

---

## 1. Scope and objective

Scrub the entire metadata flow for drift, ensure friendly labels and automation are wired everywhere, and produce closure evidence for Workstream B (Metadata Simplification and Automation).

This step does not introduce new authoring affordances. Its deliverable is the validated closure of Workstream B, a small drift fix, and an honest accounting of remaining downstream work.

---

## 2. Final scrub applied in this step

- Updated the stale `MetadataPanel` comment that still credited the adapter for slug seeding. After workstream-b step-03, slug is system-managed at the surface via `resolveSlugForSave`. Comment now reads accurately and points to the governance module.

No functional changes.

---

## 3. End-to-end metadata validation

Measured against the workstream-B objective (remove avoidable author burden in setup and metadata handling by replacing manual identity work with governed automation and friendly author-facing language):

### 3.1 Friendly labels everywhere — PASS
- Every Publisher enum surfaced in the UI routes through `authorLabels.ts` (`articleContentTypeLabel`, `destinationLabel`, `spotlightTypeLabel`, `projectStageLabel`, `articleSubjectLabel`, `heroThemeVariantLabel`, `mediaRoleLabel`, `teamViewerModeLabel`, `teamViewerGroupingModeLabel`, `teamViewerSortModeLabel`, `workflowOutcomeLabel`, `draftGroupLabel`, `draftGroupEmptyCopy`, `transitionActionLabel`).
- `ChooserGroup`'s `getLabel` is a required prop; TypeScript fails any future chooser that omits a governed label function.
- Per-enum labels are typed `Record<EnumType, string>`, so any new enum value without a governed label fails the build.
- `authorLabels.test.ts` asserts every enum value carries a non-empty, non-raw label and that no `→ <enum>` regression returns.

### 3.2 Authoritative project picker — PASS
- The Identity section's only authoring path for project identity is `<ProjectPicker>` bound to the HBCentral Projects list via `createProjectsLookupSearch`.
- The manual `ProjectId` / `ProjectName` text-input fallback is gone. When the picker is unavailable, the section renders either a read-only chip (when a project is already bound) or an editorial `role="status"` notice directing the author to reload in the hosted page.
- Authoritative field hydration (`ProjectId`, `ProjectName`, `ProjectLocation`) flows from the picker into the article draft via `handleProjectChange`.

### 3.3 System-managed slug — PASS
- `slugGovernance.ts` owns the slug pipeline (`generateSlugFromTitle`, `generateSlug`, `applySlugUniqueness`, `shouldRegenerateSlug`, `resolveSlugForSave`).
- `emptyArticle()` no longer seeds `Slug` from the article id. New drafts start blank; the save path resolves the system-managed value.
- `handleSave` builds a `takenSlugs` set from the workspace inventory (excluding the current article), resolves a collision-free slug via `resolveSlugForSave`, and writes it before `repositories.articles.upsert`.
- Stability rule preserved: slug tracks the headline while the article is in `draft`; once it leaves draft (review / approved / published / archived / withdrawn), the persisted slug is preserved so external links remain stable.
- 20 governance tests cover normalisation, fallback, uniqueness suffixing, length capping, and draft-vs-non-draft policy.

### 3.4 Intelligent metadata defaults — PASS
- `metadataDefaults.ts` provides `defaultTeamHeading`, `defaultHeroCategoryLabel`, and `intelligentDefaultsForSave`.
- `handleSave` routes the draft through `intelligentDefaultsForSave` so `TeamViewerTitle` and `HeroCategoryLabel` fill from current article context when blank; author-typed values are preserved on every subsequent save.
- `handleProjectChange` opportunistically fills the team heading the moment a project is picked, only when the heading is currently blank.
- The `TeamPresentationPanel` heading input shows the resolved default ("The Team at {project name}" or "The Team") as an HTML `placeholder`, so authors can preview what will be applied before saving.
- 11 metadata-defaults tests lock in derivation, trimming, fill-only-when-empty semantics, and author-override preservation.

### 3.5 No raw enum / data-model leaks to authors — PASS
- Manual scrub of `ArticlePublisher.tsx` for `WorkflowState`, `PublishStatus`, `SyncStatus`, `Destination`, `ArticleContentType`, `HeroThemeVariant`, `MediaRole`, `TeamViewer*`, `SpotlightType`, `ProjectStage`, `ArticleSubject`, `Slug`, `TemplateKey`, `TargetSiteUrl`, `BindingId`, `PageTemplateKey`, `RenderVersion`, and `PageShellVersion` raw token emission — clean. Only governance and persistence references remain (slug resolver, template resolver, comments, internal state).

---

## 4. Preserved seams (verified after closure pass)

Re-confirmed unchanged through Workstream B:

| Seam | Source | Confirmed |
|---|---|---|
| `ARTICLE_PUBLISHER_WEBPART_ID` | `runtimeContract.ts` | ✓ |
| `<ArticlePublisher>` prop contract (`siteUrl`, `actorEmail`, `repositoriesOverride`) | `ArticlePublisher.tsx` | ✓ |
| `mount.tsx` wiring (host identity → `actorEmail`) | `mount.tsx` | ✓ |
| `createPublisherRepositories` | `publisherAdapter/publisherRepositories` | ✓ |
| `createDefaultPublishOrchestrator` (publish / republish / archive / withdraw / transitionManual) | `publisherAdapter/publishOrchestrator` | ✓ |
| `createSharePointPageBindingWriter`, `createSharePointPageCreationService` | `publisherAdapter/pageBindingWriter`, `pageGeneration` | ✓ |
| `buildPublishResolutionContext` | `publisherAdapter/publishResolutionContext` | ✓ |
| `workflowStateMachine.canTransition` / `validTransitionsFrom` | `publisherAdapter/workflowStateMachine` | ✓ |
| `buildPublisherPreview` | `publisherAdapter/preview/previewBuilder` | ✓ |
| `createProjectsLookupSearch` + `ProjectPicker` | `publisherAdapter/projectsLookupSource`, `ProjectPicker.tsx` | ✓ |
| `selectPromotionPolicy`, `resolveTemplateSystemManaged` | `publisherAdapter/promotionRuleSelector`, `templateResolver` | ✓ |
| `SUPPORTED_DESTINATIONS` = `['projectSpotlight']` | `publisherAdapter/destinationSiteUrls` | ✓ |
| `PublisherArticleRow` shape | `publisherAdapter/publisherContracts` | ✓ |

No adapter, runtime-contract, webpart-manifest-id, or mount wiring change across the workstream.

---

## 5. Validation performed this step

- `pnpm --dir apps/hb-webparts run check-types` → pass.
- `pnpm --dir apps/hb-webparts exec vitest run src/webparts/articlePublisher` → 65/65 pass (12 article-publisher + 22 author-labels + 20 slug-governance + 11 metadata-defaults).
- 28 pre-existing failures in `publisherAdapter/**` test suites remain unchanged and out of scope for this workstream.

---

## 6. Workstream B — final state

- **Author-facing labels:** governed end-to-end through `authorLabels.ts`. No raw enums reach authors.
- **Project identity:** authoritative through `<ProjectPicker>`; manual entry retired.
- **Slug:** system-managed via `slugGovernance.ts`; derived from headline, deduped against the workspace, stable after the article leaves draft.
- **Team heading + hero category:** filled by `intelligentDefaultsForSave`; author overrides preserved.
- **Manifest progression:** `1.0.0.270` → `1.0.0.271` → `1.0.0.272` → `1.0.0.273` → `1.0.0.274`.

---

## 7. Remaining downstream dependencies (honest accounting)

Out of Workstream B scope; surfaced for transparency:

1. **`ProjectNumber` persistence.** `ProjectLookupEntry` exposes `projectNumber`; `<ProjectPicker>` renders it while a session selection is fresh, but the `PublisherArticleRow` contract does not model it. After save and reload, the chip falls back to project name + id + location. Persisting `ProjectNumber` is a tenant-schema change.
2. **Rich-text body editor.** The Story section's body is still a `<textarea>` accepting HTML. A dedicated rich-text editor is a Workstream-C / authoring-tools concern.
3. **Visual hero-theme chooser.** `HeroThemeVariant` renders through the text-label `ChooserGroup`. A true visual chooser with thumbnails is a later shared-primitive candidate in `@hbc/ui-kit`.
4. **Media asset picker.** Image URLs are typed by hand. An asset-picker / upload affordance is a Workstream-C concern.
5. **Pre-existing `publisherAdapter/**` test failures (28).** Independent of Workstreams A and B; owned by the preview/resolution-context test suite.
6. **SPFx hosted-page E2E validation.** A one-time hosted smoke test (load the page, pick a draft, edit, save, verify slug/team-heading/hero category defaults, run preview, take a publish action) should be run before the next SPFx release cut; the manifest version is already incremented.

None of the above blocks closure of Workstream B.

---

## 8. Closure report path

`docs/architecture/plans/MASTER/spfx/publisher/remediation/workstream-b-metadata-simplification-and-automation/step-05/Closure-Report.md`

Workstream summary:
`docs/architecture/plans/MASTER/spfx/publisher/remediation/workstream-b-metadata-simplification-and-automation/Workstream-Closure.md`

---

## 9. Real blockers remaining for Workstream B

**None.** Workstream B — Metadata Simplification and Automation — is closed.
