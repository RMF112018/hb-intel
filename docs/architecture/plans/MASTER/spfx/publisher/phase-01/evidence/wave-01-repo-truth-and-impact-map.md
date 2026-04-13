# Wave 1 / Prompt-01 — Repo-Truth and Impact Map

**Audit Date:** 2026-04-13
**Scope:** Exhaustive repo-truth and impact mapping for the Project Spotlight publisher SPFx app.
**Authority:** `docs/architecture/plans/MASTER/spfx/publisher/architecture/` (binding) + Wave/Prompt package in the parent folder.

---

## 1. Owning Surfaces & Recommendation

### 1.1 Publisher UI — **NEW**
**Recommended owner:** new SPFx webpart `apps/hb-webparts/src/webparts/projectSpotlightPublisher/`.

**Rationale:**
- `@hbc/spfx-hb-webparts` (`apps/hb-webparts`) is the canonical multi-tenant-safe location for homepage + article-scoped webparts.
- Pattern precedent: `teamViewer`, `hbSignatureHero`, `hbHeroBanner`, `peopleCultureCompanion`.
- Reusable UI mounts through `apps/hb-webparts/src/mount.tsx` + manifest registry.
- SPFx surface bootstrap is localized to the webpart folder per existing pattern.

**Current state:** No publisher webpart exists. `companyPulse` is a newsroom consumer, not an authoring tool.

### 1.2 List / Data Services — **NEW (reuse platform)**
**Recommended owner:** local modules under `apps/hb-webparts/src/homepage/data/projectSpotlight*/` layered over `@hbc/sharepoint-platform`.

- **List provisioning (schema authority):** `packages/sharepoint-docs/infrastructure/provision-publisher-lists.ps1` already defines the full 8-list schema.
- **Reader pattern:** follow `heroBannerListSource.ts` + `heroBannerListDescriptor.ts`.
- **Writer pattern:** follow `heroBannerListWriter.ts` (request digest + `mergeItemById`).
- **Domain-adapter pattern:** follow `kudosAdapter/` (reads, governance, validation, submission).
- **Platform primitives:** `fetchListItemsJson`, `buildListItemsEndpoint`, `fetchRequestDigest`, `mergeItemById`, `ensureUserByEmail`, `fetchItemMetaByFieldValue`, `createCacheInvalidationBus`.

### 1.3 Page-Generation Logic (XML Shell Driver) — **NEW**
**Recommended owner:** new module `apps/hb-webparts/src/homepage/data/projectSpotlightPageGeneration/`.

- **Canonical shell:** `docs/architecture/plans/MASTER/spfx/publisher/architecture/Project-Spotlight-In-Progress.page-template.xml` (PnP ProvisioningSchema).
- **Shell composition:** OOB Page Title (banner), OOB Text (subhead), OOB Text (body), `teamViewer`, OOB Image Gallery.
- **Driver responsibility:** parse XML + resolve template + post data → emit populated `ClientSidePage` JSON → POST page to ProjectSpotlight site.
- No existing page-generation code in repo — fully new.

### 1.4 Page-Binding Logic — **NEW**
**Recommended owner:** new module `apps/hb-webparts/src/homepage/data/projectSpotlightPageBinding/`.

- **List schema locked:** `HB Article Destination Pages` (BindingId, ArticleId, TargetSiteUrl, PageId, PageUrl, PageName, PageTemplateKey, PageShellVersion, RenderVersion, PublishStatus, LastSyncDateUtc, SyncStatus, LastSyncMessage, PublishedDateUtc).
- **Republish gating:** compare `PageShellVersion` + `RenderVersion` to determine regenerate-vs-in-place update.

### 1.5 Team Viewer Integration — **LANDED + LOCKED**
**Location:** `apps/hb-webparts/src/webparts/teamViewer/` (Phase-01 Prompts 01–06 complete, commits `3bb8dd10` → `35b0f38c`).

- Input contract: `TeamViewerInput` (locked).
- Binding: `articleId` (direct) or `destinationKey` (host-context resolution) via `useTeamViewerArticleBinding`.
- Data source: `HB Article Team Members` list.
- Feature flag: `profileDetailDrawer` defaults `false` in v1 shell.
- Ready to mount in Project Spotlight generated pages; only remaining concern is the data-loading seam in subsequent prompts.

---

## 2. Legacy / Stale Code Paths

Grep coverage: `company-pulse`, `CompanyPulse`, `article-publisher`, `ArticlePublisher`, `dual-destination`, `publisher`, `news` across `apps/**` and `packages/**`.

| Path | Current Role | Action | Notes |
|------|--------------|--------|-------|
| `apps/hb-webparts/src/webparts/companyPulse/` | Legacy newsroom display webpart | **ISOLATE** | No authoring capability. No dual-destination logic. Keep as-is. |
| `apps/hb-webparts/src/homepage/helpers/communicationsConfig.ts` | Company Pulse config normalization | **ISOLATE** | Company Pulse domain only. Do not reuse in publisher. |
| `apps/hb-webparts/src/homepage/webparts/communicationsContracts.ts` | Company Pulse domain contracts | **ISOLATE** | Do not reuse. Create `projectSpotlightPublisherContracts.ts` for publisher. |
| `packages/ui-kit/src/HbcNewsroomSurface/` | Display surface for Company Pulse | **DO NOT REUSE IN PUBLISHER AUTHORING** | Publisher needs its own authoring surface family. |

**No dual-destination or article-publisher remnants found.** The repo is clean of the patterns the architecture guidance warned against.

---

## 3. Reuse Inventory

### 3.1 Platform / Packages

- **`@hbc/sharepoint-platform`** (mature, v0.1.0) — required for every publisher data path. Public API is sufficient; no modifications needed.
- **`@hbc/ui-kit`** — selectively reuse: `HbcEmptyState`, `HbcSpinner`, Lucide icons, `createGraphPersonPhotoFn`, `HbcHomepageActionRow`, `HbcHomepageSurfaceCard`, `HbcHomepageSectionShell`. **Do not reuse** `HbcNewsroomSurface` in publisher authoring.
- **`packages/data-seeding`** (scaffold) — candidate for future list-initialization orchestration; not needed for MVP.

### 3.2 Reference Webparts

- **TeamViewer** (`apps/hb-webparts/src/webparts/teamViewer/`) — architecture reference for: contract mirroring (`teamViewerRuntimeContract`), hook orchestration (`useTeamViewerArticleBinding`, `useTeamViewerData`, `useTeamViewerPhotoHydration`), pure display selectors, data normalization, dev-harness scenarios. Study patterns; do not duplicate logic.
- **hbSignatureHero** — reference for article-mode contract (`HbSignatureHeroArticleContent`) and author-photo hydration (`useArticleAuthorPhoto`). **Not active in v1 shell**; future-shell-variant evolution path only.
- **hbHeroBanner** — reference for list source/writer seam pair.

### 3.3 Data Access Patterns (to mirror)

- **List Source pattern** — descriptor → fetcher → row mapper → hook → fallback. Source: `heroBannerListSource.ts`.
- **Write Seam pattern** — request digest → `mergeItemById` from platform. Source: `heroBannerListWriter.ts`.
- **Domain Adapter pattern** — folder shape with `reads.ts`, `governance.ts`, `validation.ts`, `submission.ts`, `__tests__/`. Source: `kudosAdapter/`.
- **Article Binding pattern** — direct property → host-context resolution → normalized binding key. Source: `useTeamViewerArticleBinding.ts`.

### 3.4 Locked Schemas (no change required for Wave 2)

- `HB Articles` (master)
- `HB Article Team Members` (child, TeamViewer source)
- `HB Article Media` (child, gallery/hero/supporting)
- `HB Article Template Registry`
- `HB Article Destination Pages` (binding)
- `HB Article Workflow History`
- `HB Article Publishing Errors`
- `HB Article Promotion Rules`

---

## 4. File-by-File Impact Map

| Path | Role | Action | Notes |
|------|------|--------|-------|
| `docs/architecture/plans/MASTER/spfx/publisher/architecture/00-10` | Binding architecture authority | **REFERENCE** | Immutable source of truth. |
| `.../architecture/Project-Spotlight-In-Progress.page-template.xml` | Canonical v1 page shell | **REFERENCE** | PnP ProvisioningSchema XML; drives page-generation. |
| `packages/sharepoint-docs/infrastructure/provision-publisher-lists.ps1` | List schema provisioning | **REFERENCE** | Locked. Run prior to Wave 2 list validation. |
| `packages/sharepoint-platform/src/` | Core data primitives | **REUSE** | Public API stable; no modifications. |
| `packages/ui-kit/src/HbcNewsroomSurface/` | Legacy newsroom display | **ISOLATE** | Do NOT use in publisher authoring. |
| `packages/ui-kit/src/homepage.ts` | Homepage exports | **REUSE SELECTIVELY** | Icons, photo fn, empty-state, spinner, layout primitives. |
| `apps/hb-webparts/src/mount.tsx` | SPFx webpart bootstrap | **EXTEND** | Add publisher webpart entry in a later wave. |
| `apps/hb-webparts/src/webparts/teamViewer/` | Team-member renderer | **REUSE (integrate)** | Mount in generated page shell. |
| `apps/hb-webparts/src/webparts/hbSignatureHero/` | Premium hero banner | **REFERENCE** | Not active in v1 shell. |
| `apps/hb-webparts/src/webparts/companyPulse/` | Legacy newsroom viewer | **ISOLATE** | No authoring capability. |
| `apps/hb-webparts/src/homepage/data/heroBannerListSource.ts` | Hero banner read seam | **REFERENCE** | Pattern template for article list source. |
| `apps/hb-webparts/src/homepage/data/heroBannerListWriter.ts` | Hero banner write seam | **REFERENCE** | Pattern template for article writers. |
| `apps/hb-webparts/src/homepage/data/projectSpotlightListSource.ts` | Homepage widget rollup | **REFERENCE (do not modify)** | Distinct concern from publisher authoring list. |
| `apps/hb-webparts/src/homepage/data/kudosAdapter/` | Domain-adapter structure | **REFERENCE** | Adopt structure for `projectSpotlightAdapter/`. |
| `apps/hb-webparts/src/homepage/helpers/communicationsConfig.ts` | Company Pulse config | **ISOLATE** | Company Pulse only. |
| `apps/hb-webparts/src/homepage/helpers/authoringGovernance.ts` | Authoring error messaging | **REUSE SELECTIVELY** | Evaluate reuse for publisher authoring feedback. |
| `apps/hb-webparts/src/homepage/webparts/communicationsContracts.ts` | Company Pulse contracts | **ISOLATE** | Do not reuse. |
| `apps/hb-webparts/src/webparts/projectSpotlightPublisher/` (not present) | Publisher UI webpart | **NEW** | Create in Wave 6 / Prompt-06. |
| `apps/hb-webparts/src/homepage/data/projectSpotlight*/` (not present) | Publisher data seam | **NEW** | Create in Waves 2-5. |

---

## 5. Reuse / Refactor / Replace Matrix (by concern)

### Publisher UI
- **CREATE:** multi-step authoring form, master-record field mapping, child-record managers (team members, media), template resolution UI, preview rendering, workflow state machine.
- **REUSE:** `@hbc/ui-kit` primitives, photo hydration from homepage export, authoringGovernance messaging helpers (evaluate).

### Data Services
- **CREATE:** list descriptors, list sources (article, team members, media, template registry, binding), writers, adapters, hooks.
- **REUSE:** `@hbc/sharepoint-platform` primitives.

### Page Generation
- **CREATE:** XML→JSON driver, webpart property injector, Pages API caller, version tracker.
- **REUSE:** PnP XML schema (template), TeamViewer + OOB webpart input contracts.

### Page Binding
- **CREATE:** binding writer, republish gating, version tracking.
- **REUSE:** `HB Article Destination Pages` schema.

### Team Viewer
- **NO CHANGES.** Already landed and locked.

---

## 6. Blocking Unknowns (must resolve before Wave 2)

1. **SharePoint Pages REST API path + authentication model** for creating pages on `/sites/ProjectSpotlight`. PnP Framework vs. direct REST vs. CSOM.
2. **Webpart property injection at generation time** — how TeamViewer `articleId` (and other control props) are applied when creating the `ClientSidePage` JSON.
3. **Photo hydration timing** — generation-time embed vs. runtime fetch for Team Viewer on published pages.
4. **Publish permissions / service principal** for the ProjectSpotlight site.
5. **Rollback / version-history policy** — scope of `HB Article Workflow History` auditing and whether previous page snapshots are retrievable.
6. **Scheduled publishing** — in scope for MVP? If yes, async trigger mechanism (Azure Function, SharePoint workflow, client-only).
7. **OOB Image Gallery layout variant** (carousel / grid) for v1 shell.

---

## 7. Publisher App Existence Confirmation

**Does a publisher app or webpart already exist in any form?** **No.**

- No folder matches `publisher*`, `Publisher*`, or `projectSpotlightPublisher*` under `apps/hb-webparts/src/webparts/`.
- No publisher manifest exists.
- `projectSpotlightListSource.ts` is a homepage-widget rollup, not a publisher authoring surface.
- `companyPulse` is a newsroom display webpart, not a publisher.

A new SPFx webpart must be created in a subsequent wave.

---

## 8. Readiness Statement

Wave 1 discovery is complete. Architecture is locked, list schemas are provisioned, platform primitives are mature, and reference patterns are well documented. No refactoring of existing code is required; no dual-destination contamination exists. Team Viewer is landed and ready for embedded mount.

Wave 2 (list provisioning verification + domain contracts) can proceed once the seven blocking unknowns above are resolved (or explicitly deferred with documented assumptions).
