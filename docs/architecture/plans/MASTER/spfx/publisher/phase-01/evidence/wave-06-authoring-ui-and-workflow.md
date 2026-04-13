# Wave 6 / Prompt-06 — Authoring UI and Workflow

**Closed:** 2026-04-13
**Scope:** New `projectSpotlightPublisher` SPFx webpart; post + child-row + workflow writers; pure workflow state machine; mount registration. Editorial flow (draft → inReview → approved → scheduled → published → archived → withdrawn) is now wireable end-to-end without raw page-canvas editing.

---

## 1. Owning surface

`apps/hb-webparts/src/webparts/projectSpotlightPublisher/` — a new SPFx webpart under the existing `@hbc/spfx-hb-webparts` shell. This matches Wave 1's recommendation and keeps publisher UI co-resident with the other homepage + article surfaces (TeamViewer, hbHeroBanner, hbHeroBannerAdmin, peopleCulture, …).

Webpart identity:
- manifest id / webPartId: `1a6f8b2c-4e5d-42c1-8f9a-3b7c5d6e8f10` (registered via `PROJECT_SPOTLIGHT_PUBLISHER_WEBPART_ID` in `runtimeContract.ts`).
- alias: `ProjectSpotlightPublisherWebPart`.
- group: HB Intel.
- `hiddenFromToolbox: true` — authoring is surfaced by deep-linking into the Publisher page, not by ad-hoc canvas drop.
- Mount registered in `apps/hb-webparts/src/mount.tsx` using the same `WEBPART_RENDERERS[id]` pattern the rest of the app uses.

## 2. UI surfaces

Single React component (`ProjectSpotlightPublisher.tsx`) with the following panes / tabs. Scope is deliberately lean per prompt-06 discipline ("avoid over-designing"):

| Surface | Role |
|---------|------|
| **List pane** (left column) | Workflow-state filter (every `WorkflowState`); selects a post for editing; `New post` button seeds a draft. |
| **Header** | Post title + workflow-state badge + binding-status badge (when a binding exists). |
| **Metadata tab** | Title, Slug, PostFamily, SpotlightType, ProjectStage, ArticleSubject, ProjectId, ProjectName, SummaryExcerpt. |
| **Banner tab** | BannerImageUrl (required), BannerImageAltText (required), BannerTitleOverride, BannerEyebrow, BannerThemeVariant, BannerShowPublishDate, BannerShowGradient. |
| **Content tab** | Subhead, BodyRichText (HTML accepted; compositor passes through), TeamSectionHeading, TeamViewerLayout, TeamViewerDensity, ShowGallery. |
| **Team tab** | Child-row editor for `Project Spotlight Post Team Members` — add, remove, reorder (↑/↓), toggle `IncludeInViewer`, edit `DisplayName / PersonPrincipal / JobTitle / PhotoUrl`. |
| **Gallery tab** | Child-row editor for `Project Spotlight Post Media` — add, remove, reorder, change `MediaRole`, edit `ImageAssetUrl / AltText / Caption`. |
| **Status tab** | Read-only view of template resolution (`TemplateKey@version`, `PageShellKey@version`, selection rule, `AllowRepublishInPlace`, `ForceRegenerationOnShellChange`) and the current page binding (`BindingId`, `BindingStatus`, `PageName`, `PageUrl`, shell/template identity, `LastOperation`, `LastSuccessfulSyncDateUtc`). |
| **Action bar** | `Save draft`, `Preview`, `Republish` (enabled only when a binding exists), `Publish` (enabled only when `WorkflowState === 'approved'`), plus one `→ <nextState>` button per allowed transition from `validTransitionsFrom(currentState)`. |

Saving persists through the repository factory: `posts.upsert`, `teamMembers.replaceAllForPost`, `media.replaceAllForPost`. Workflow transitions write both the updated post row and a `Project Spotlight Workflow History` row via `workflowHistory.append`. Publish/republish/preview delegate to `createDefaultPublishOrchestrator`.

Styling follows operational-admin doctrine rather than premium-authored doctrine: token-disciplined neutral surfaces, no mold-breaker chrome. `@hbc/ui-kit` primitives (`HbcEmptyState`, `HbcSpinner`) drive empty / loading states.

## 3. Workflow state machine (new)

`publisherAdapter/workflowStateMachine.ts` — pure, zero-dep module mirroring architecture doc 09:

```
draft     → inReview | archived | withdrawn
inReview  → approved | draft | withdrawn
approved  → scheduled | published | draft | withdrawn
scheduled → published | approved | withdrawn
published → archived | withdrawn
archived  → withdrawn
withdrawn → (terminal)
```

Exports:
- `canTransition(from, to)`
- `validTransitionsFrom(from)`
- `historyActionFor(from, to)` — maps transitions to the `WorkflowHistoryAction` enum (`publish`, `archive`, `withdraw`, `approvalDecision`, `transition`).

Seven Vitest cases cover: canonical happy path, `scheduled → published`, forbidden step-skips, universal `→ withdrawn`, `withdrawn` terminal, forbidden `published → draft/inReview`, and history-action mapping.

## 4. Writers (Wave 6 stub promotion)

`publisherAdapter/publisherWriters.ts` — four writers following the `pageBindingWriter` pattern (list-title REST + `fetchRequestDigest`):

- `createSharePointPostWriter` — upsert (lookup by `PostId`; MERGE existing, POST new).
- `createSharePointTeamMembersWriter` — `replaceAllForPost`: list ids by `PostId`, delete each, POST fresh rows.
- `createSharePointMediaWriter` — `replaceAllForPost` with the same pattern.
- `createSharePointWorkflowHistoryWriter` — append-only POST.

Pure projectors exported: `mapPostRowToListFields`, `mapTeamMemberRowToListFields`, `mapMediaRowToListFields`, `mapWorkflowHistoryRowToListFields`. Each emits explicit `null` for unset optional cells so MERGE clears stale content.

`PublisherRepositoryWriters` is a new grouping type. `createPublisherRepositories(access?, lists?, writers?)` now takes an optional writers bag and defaults every writer to the SharePoint implementation. Consumers that passed only the first argument continue to work. Four repository methods are promoted from Wave 3/5 stubs to delegating calls:

- `posts.upsert` — delegates to `PostWriter.upsert`, returns `{ wasCreated, itemId }`.
- `teamMembers.replaceAllForPost` — returns `{ deleted, written }`.
- `media.replaceAllForPost` — returns `{ deleted, written }`.
- `workflowHistory.append` — returns `{ itemId }`.

`publishingErrors.append` remains a Wave-5-era stub; it is not exercised by the Wave 6 UI and stays queued for a dedicated error-surfacing prompt.

## 5. Status / binding visibility

The Status tab surfaces both the live template-resolution result and the current binding row. It uses `buildPublishResolutionContext` for the resolution trace and `repositories.pageBindings.getByPostId` for the binding row — no separate code path from what publish/republish use. Operating-charter rule 8 (single resolution pipeline) therefore applies to authoring too.

The action bar's guardrails are the visual shape of the architecture rules:
- `Publish` disabled unless `WorkflowState === 'approved'` (prevents publishing a draft that bypassed review).
- `Republish` disabled unless a binding row already exists.
- Transition buttons are generated from `validTransitionsFrom(currentState)` — unsupported transitions are simply not rendered.
- Every successful transition writes a workflow-history row with `from`, `to`, and the mapped `action`, so the audit trail matches architecture doc 09.

## 6. Verification performed

| Check | Result |
|-------|--------|
| `pnpm --filter @hbc/spfx-hb-webparts check-types` | ✅ clean |
| `pnpm exec vitest run src/homepage/data/publisherAdapter/` | ✅ 50 / 50 pass (12 resolver + 3 parser + 10 compositor + 11 republish + 7 orchestrator + 7 workflow state machine) |
| Mount map updated | ✅ `WEBPART_RENDERERS[PROJECT_SPOTLIGHT_PUBLISHER_WEBPART_ID]` registered |
| Legacy Team Viewer webpart | ✅ untouched |
| Legacy provisioner | ✅ untouched |
| `@hbc/sharepoint-platform` public API | ✅ untouched |
| Hosted tenant authoring (end-to-end click-through) | ⏸ Wave 9 |

## 7. Files delivered

**New:**
- `apps/hb-webparts/src/webparts/projectSpotlightPublisher/index.ts`
- `apps/hb-webparts/src/webparts/projectSpotlightPublisher/runtimeContract.ts`
- `apps/hb-webparts/src/webparts/projectSpotlightPublisher/ProjectSpotlightPublisher.tsx`
- `apps/hb-webparts/src/webparts/projectSpotlightPublisher/ProjectSpotlightPublisherWebPart.manifest.json`
- `apps/hb-webparts/src/webparts/projectSpotlightPublisher/project-spotlight-publisher.module.css`
- `apps/hb-webparts/src/webparts/projectSpotlightPublisher/project-spotlight-publisher.module.css.d.ts`
- `apps/hb-webparts/src/homepage/data/publisherAdapter/workflowStateMachine.ts`
- `apps/hb-webparts/src/homepage/data/publisherAdapter/workflowStateMachine.test.ts`
- `apps/hb-webparts/src/homepage/data/publisherAdapter/publisherWriters.ts`

**Modified:**
- `apps/hb-webparts/src/homepage/data/publisherAdapter/publisherRepositories.ts` — repository factory now takes an optional `writers` bag; four repository methods promoted from stubs to delegating calls; return signatures updated.
- `apps/hb-webparts/src/homepage/data/publisherAdapter/index.ts` — barrel re-exports Wave 6 modules.
- `apps/hb-webparts/src/mount.tsx` — Project Spotlight Publisher renderer registered.
- `apps/hb-webparts/config/package-solution.json` — manifest version bump.
- `docs/architecture/plans/MASTER/spfx/publisher/phase-01/evidence/implementation-tracker.md` — Wave 6 flipped to ✅.

## 8. Out of scope (by design)

- Rich-text editors for Subhead / BodyRichText (plain `<textarea>`; authors paste HTML).
- Scheduled-publish authoring UI (blocking unknown #6).
- Publishing-error rollup surface (`publishingErrors.append` remains a stub).
- Visual preview of the rendered page canvas (preview returns the decision trace; full preview is Wave 7 scope).
- Template-aware field-requirement gating on `Save` (Wave 7 / Prompt-07 owns the validation engine).
- Team Viewer migration from legacy binding.

## 9. Handoff to Prompt-07

Prompt-07 / Wave 7 (Validation, preview, governance) consumes:
- The `Status` panel as the rendering host for a richer preview (swap the decision-trace dl for a page-preview surface).
- `orchestrator.run({ mode: 'preview' })` as the canonical preview input.
- `template.RequiredFieldSetKey` / `template.ValidationProfileKey` to gate `Save` and `Publish` with template-aware field-requirement checks.
- `publishingErrors.append` pending promotion (Wave 7 can promote the same way Wave 6 promoted the other writers).

Blocking unknowns carried forward: #3 photo hydration timing (TeamViewer currently routes to its runtime adapter, unchanged); #4 publish principal (Wave 9); #6 scheduled publishing (Waves 7/9); others tracked in `implementation-tracker.md`.
