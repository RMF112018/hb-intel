# Wave 5 / Prompt-05 — Content Mapping and Page Binding

**Closed:** 2026-04-13
**Scope:** Formalized content mapping, durable page-binding write seam, republish/regeneration decision rules, and an end-to-end publish orchestrator for the Project Spotlight publisher.

---

## 1. Content-mapping layer

The content-mapping layer is the pure `composeProjectSpotlightPage` function delivered in Wave 4, plus the per-slot tests that assert every shell zone populates correctly. Wave 5 does not duplicate that logic; it locks it as the single canonical mapping path consumed by both publish (`pageShellService.publishPage`) and preview (`pageShellService.composePage`).

Shell-zone mappings (arch doc 05 canonical shell):

| Shell slot | Source | Typed payload |
|------------|--------|---------------|
| banner / title | `PublisherPost` (`Title`, `BannerTitleOverride`, `BannerImageUrl`, `BannerImageAltText`, `BannerEyebrow`, `BannerShowPublishDate`, `BannerShowGradient`, `BannerThemeVariant`) | `BannerControlPayload` |
| subhead | `PublisherPost.Subhead` | `TextControlPayload` (`<h3>` wrapper) |
| body | `PublisherPost.BodyRichText` | `TextControlPayload` (pass-through) |
| team | `PublisherTeamMember` rows + `Post.TeamSectionHeading/Layout/Density/EnableProfileDrawer` + `Post.PostId` → `articleId` | `TeamViewerControlPayload` |
| gallery | `PublisherMedia` rows where `MediaRole='gallery'`, ordered by `SortOrder`, respecting `Post.ShowGallery` + `Template.ShowGalleryBlock/GalleryRendererKind` | `ImageGalleryControlPayload` |

Suppression paths (template flags, renderer-`none`, post-level toggles, empty child sets) produce typed `HiddenControlPayload` entries so the downstream page-creation service can drop the control or render an empty shell position without ever silently falling back.

## 2. Binding writer (`pageBindingWriter.ts`)

New SharePoint write seam keyed by `PostId`:

- `createSharePointPageBindingWriter(deps?)` — defaults the descriptor to `PUBLISHER_LISTS.pageBindings` (list host = HBCentral) and the request-digest primitive to `@hbc/sharepoint-platform`'s `fetchRequestDigest`. Both are injectable for tests.
- `mapBindingRowToListFields(row)` — exported pure projector from typed `PublisherPageBindingRow` → raw SP field bag. Emits explicit `null` for optional cells so MERGE clears stale content rather than silently leaving it.
- Upsert logic: lookup by `PostId` → POST MERGE via `X-HTTP-Method: MERGE` + `If-Match: *` when a row exists; POST insert otherwise. Returns a typed outcome with `wasCreated`, `bindingId`, and `itemId`.

`publisherRepositories.PageBindingRepository.upsert` is promoted from a Wave 3 stub to a real delegating call — it now returns `{ bindingId, wasCreated, itemId }` and surfaces writer failures as thrown errors so callers can decide the recovery path. Default factory wires the SharePoint writer automatically; callers can inject a mock for tests.

## 3. Republish policy (`republishPolicy.ts`)

Pure `decideRepublishAction({ composed, template, existingBinding, idempotent? })` returns a typed `RepublishDecision` with `action`, `reason`, optional `regenerationCause`, and human-readable `notes[]`. Action set:

- `create` — no existing binding.
- `inPlaceUpdate` — binding exists and is compatible (shell + template identity align, or template flags permit drift).
- `regenerate` — binding exists but shell / template **identity** has drifted in a way that forbids in-place update. Triggers:
  - `shellKeyDrift` (always regenerate — page shell swapped).
  - `templateKeyDrift` (always regenerate — different template profile).
  - `shellVersionDrift` when `template.ForceRegenerationOnShellChange=true`.
  - `templateVersionDrift` when `template.AllowRepublishInPlace=false`.
- `blocked` — binding is archived or withdrawn; reactivation must be deliberate.
- `noOp` — idempotent caller + no drift.

`bindingStatus==='error'` maps to `inPlaceUpdate` so retries are cheap.

11 Vitest cases cover each action + decision rule.

## 4. Publish orchestrator (`publishOrchestrator.ts`)

`createPublishOrchestrator({ repositories, pageBindingWriter, pageShellService }).run(req)` ties the full chain:

1. `buildPublishResolutionContext(repos, postId)` — read post + children + active templates + any existing binding, run the deterministic resolver.
2. `pageShellService.composePage(context)` — pure mapping to `ComposedPage` + structural validation.
3. `decideRepublishAction(...)` — determine `create | inPlaceUpdate | regenerate | blocked | noOp`.
4. For actions that write a page: `pageShellService.publishPage(context)` drives the SharePoint Pages REST call.
5. For actions that write a binding: construct the `PublisherPageBindingRow` — preserve `existingBinding.BindingId` on `inPlaceUpdate`, generate a fresh `bindingId` on `create` / `regenerate` — and call `pageBindingWriter.upsert`.

Never duplicates a live page for a post: `inPlaceUpdate` preserves `PageId` / `PageUrl` by reusing the existing binding row, while `regenerate` archives that path via a new binding + page (page-archive behavior on the prior row is Wave 6 UI scope; Wave 5 never deletes rows).

`mode='preview'` short-circuits after composition — no Pages-REST call, no binding write.

Typed failures carry `stage: 'resolution' | 'composition' | 'policy' | 'pagePublish' | 'bindingWrite'` so the Wave 6 UI can render precise error guidance.

`createDefaultPublishOrchestrator({ repositories, pageBindingWriter, pageCreation })` is the ergonomic factory that wires the default shell service.

## 5. Regeneration decision rules

Codified in `republishPolicy.ts` and exercised by both the policy tests and the orchestrator tests:

| Scenario | Action | Regeneration cause | Reason |
|----------|--------|--------------------|--------|
| No binding | `create` | — | `noExistingBinding` |
| Binding + all versions match | `inPlaceUpdate` | — | `contentChanged` |
| Binding + all versions match + `idempotent=true` | `noOp` | — | `alreadyInSync` |
| Shell **key** drift | `regenerate` | `shellKeyDrift` | `shellKeyDrift` |
| Template **key** drift | `regenerate` | `templateKeyDrift` | `templateKeyDrift` |
| Shell **version** drift + `template.ForceRegenerationOnShellChange` | `regenerate` | `shellVersionDrift` | `shellVersionDrift` |
| Shell **version** drift without regen flag | `inPlaceUpdate` | — | `shellVersionDrift` (note in log) |
| Template **version** drift + `template.AllowRepublishInPlace=false` | `regenerate` | `templateKeyDrift` | `templateVersionDrift` |
| Template **version** drift + `AllowRepublishInPlace=true` | `inPlaceUpdate` | — | `templateVersionDrift` (note in log) |
| `BindingStatus='error'` | `inPlaceUpdate` | — | `bindingError` (retry) |
| `BindingStatus='archived' \| 'withdrawn'` | `blocked` | — | `bindingArchived` / `bindingWithdrawn` |

## 6. Mapping-populates-correct-regions evidence

Compositor tests (10) already assert per-slot population in Wave 4. Wave 5 adds orchestrator-level confirmation (7 tests) that the binding row written to SharePoint carries the same identity the compositor stamped on the `ComposedPage`:

- create path: `bindingRow.PageShellKey`, `PageShellVersion`, `TemplateKey`, `TemplateVersion`, `SourceTemplatePath`, `PageName`, `PageId`, `BindingStatus='published'`, `LastOperation='publish'`.
- republish path: `bindingRow.BindingId` preserved from existing binding; `LastOperation='republish'`.
- regenerate path: `bindingRow.BindingId` freshly generated; `LastOperation='regenerate'`.
- blocked path: no page call, no binding write.
- preview path: no page call, no binding write, full 5-control composition returned.
- page-publish failure path: binding write is not attempted.

## 7. Test evidence

```
Test Files  5 passed (5)
     Tests 43 passed (43)
```

Breakdown:
- `templateResolver.test.ts` — 12 (carryover).
- `xmlShellParser.test.ts` — 3 (carryover).
- `pageCompositor.test.ts` — 10 (carryover; still the canonical mapping proofs).
- `republishPolicy.test.ts` — 11 (new).
- `publishOrchestrator.test.ts` — 7 (new).

Command: `pnpm exec vitest run src/homepage/data/publisherAdapter/` from `apps/hb-webparts/`.

## 8. Verification performed

| Check | Result |
|-------|--------|
| `pnpm --filter @hbc/spfx-hb-webparts check-types` | ✅ clean |
| `pnpm exec vitest run src/homepage/data/publisherAdapter/` | ✅ 43/43 pass |
| Legacy Team Viewer webpart | ✅ untouched |
| Legacy provisioner | ✅ untouched |
| `@hbc/sharepoint-platform` public API | ✅ untouched (consumed only via `fetchRequestDigest`) |
| Hosted tenant publish + republish | ⏸ Wave 9 |

## 9. Files delivered

**New:**
- `apps/hb-webparts/src/homepage/data/publisherAdapter/pageBindingWriter.ts`
- `apps/hb-webparts/src/homepage/data/publisherAdapter/republishPolicy.ts`
- `apps/hb-webparts/src/homepage/data/publisherAdapter/republishPolicy.test.ts`
- `apps/hb-webparts/src/homepage/data/publisherAdapter/publishOrchestrator.ts`
- `apps/hb-webparts/src/homepage/data/publisherAdapter/publishOrchestrator.test.ts`

**Modified:**
- `apps/hb-webparts/src/homepage/data/publisherAdapter/publisherRepositories.ts` — `PageBindingRepository.upsert` promoted from stub to delegating writer call; factory now optionally accepts a `PageBindingWriter` dependency and defaults to the SharePoint writer.
- `apps/hb-webparts/src/homepage/data/publisherAdapter/index.ts` — barrel re-exports Wave 5 modules.
- `apps/hb-webparts/config/package-solution.json` — manifest version bump.
- `docs/architecture/plans/MASTER/spfx/publisher/phase-01/evidence/implementation-tracker.md` — Wave 5 flipped to ✅.

## 10. Out of scope (by design)

- Authoring UI / workflow surfaces (Wave 6).
- Validation engine + preview surface (Wave 7).
- Team Viewer migration from legacy binding (future named prompt).
- Deletion or archive of the physical destination page (Wave 5 never deletes rows or pages; withdraw/archive UI is Wave 6 scope).
- Scheduled-publish trigger mechanism (blocking unknown #6; Wave 6 authoring UI scope).
- Hosted tenant writes (Wave 9 hosted verification).

## 11. Handoff to Prompt-06

Prompt-06 / Wave 6 (Authoring UI and workflow) consumes:
- `createPublishOrchestrator(...).run({ postId, mode })` for publish, republish, preview.
- `PublishOutcome.stage` to drive user-facing error messaging.
- `PublisherRepositories.workflowHistory.append` (still a stub; Wave 6 will promote it the same way Wave 5 promoted `pageBindings.upsert`).
- Blocking unknowns #4 (publish principal) and #6 (scheduled publishing) remain open for the UI to resolve.
