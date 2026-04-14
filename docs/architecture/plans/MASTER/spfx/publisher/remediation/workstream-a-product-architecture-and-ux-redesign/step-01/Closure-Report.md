# Workstream A — Step 01 Closure Report

**Prompt:** Phase-08 / Phase-1 / Prompt-01 — Audit and lock the future-state product architecture
**Status:** Closed. Documentation-only; no code changes required for this step.
**Date:** 2026-04-14

---

## 1. Scope and objective

Audit the current Publisher implementation in live repo truth, confirm the actual runtime seams that downstream redesign work must preserve, and lock the future-state product architecture, page information architecture, and section model for the editorial workspace that Workstream A will implement across Prompts 02–05.

This step is decision-capture. It does not rewrite the surface. It defines the target that Prompt-03 will build and Prompt-04 will re-IA.

---

## 2. Current implementation footprint (repo truth)

### 2.1 Webpart surface
- `apps/hb-webparts/src/webparts/articlePublisher/ArticlePublisher.tsx` — 1817 lines. Single-file authoring surface built as a two-pane admin console:
  - **Left aside:** state-filter `<select>` + flat article list (`postList` → `postRow`).
  - **Main editor:**
    - Header: title + `WorkflowState` badge + binding `PublishStatus` badge.
    - Tab strip (`nav.tabs`) — seven flat tabs: `metadata`, `hero`, `content`, `team`, `gallery`, `preview`, `status`.
    - Panel body routed by `tab` state.
    - Footer action bar: Save draft / Preview / Republish / Publish + raw `→ <state>` transition buttons emitted directly from `validTransitionsFrom`.
- `apps/hb-webparts/src/webparts/articlePublisher/article-publisher.module.css` — 574 lines. Panel/tab/card styling; enterprise-admin visual language. Not host-canvas-premium.
- `apps/hb-webparts/src/webparts/articlePublisher/ProjectPicker.tsx` — typed project-lookup picker (reusable, retain).
- `apps/hb-webparts/src/webparts/articlePublisher/ArticlePublisherWebPart.manifest.json` — webpart manifest (id + version).
- `apps/hb-webparts/src/webparts/articlePublisher/runtimeContract.ts` — exports `ARTICLE_PUBLISHER_WEBPART_ID`.
- `apps/hb-webparts/src/webparts/articlePublisher/ArticlePublisher.test.tsx` — surface tests; will be partially rewritten when the shell changes in Prompt-03.

### 2.2 Mount seam
- `apps/hb-webparts/src/mount.tsx` wires `ARTICLE_PUBLISHER_WEBPART_ID` → `<ArticlePublisher siteUrl actorEmail … />`. No host-chrome assumptions. `actorEmail` is threaded from `identity.email`.

### 2.3 Adapter layer (data / workflow / publish pipeline)
`apps/hb-webparts/src/homepage/data/publisherAdapter/` — healthy, well-tested. Barrel (`index.ts`) re-exports:
- `publisherEnums` (Destination, WorkflowState, ArticleContentType, ArticleSubject, HeroTheme, Spotlight, TeamViewer modes, ProjectStage …)
- `destinationSiteUrls` — `SUPPORTED_DESTINATIONS` is computed from `isDestinationSupported` and today resolves to **`projectSpotlight` only**.
- `publisherContracts`, `publisherListDescriptors`, `publisherRowMappers` — typed list contracts.
- `publisherRepositories` — `createPublisherRepositories()` (HB Articles master + children + workflow history).
- `templateResolver`, `publishResolutionContext`, `republishPolicy`.
- `pageGeneration/*`, `pageBindingWriter` — `createSharePointPageCreationService`, `createSharePointPageBindingWriter`, compositor payloads.
- `publishOrchestrator` — `createDefaultPublishOrchestrator` / `publish` / `republish` / preview.
- `publisherWriters`, `workflowStateMachine` (`canTransition`, `validTransitionsFrom`).
- `validation/validationEngine`.
- `preview/previewBuilder` — `buildPublisherPreview`.
- `teamViewerAdapter`, `promotionRuleSelector`, `projectsLookupSource`.

This layer is production-grade and is the strong seam that the redesigned surface will continue to sit on top of.

---

## 3. Confirmed runtime seams (preserve through Workstream A)

Downstream prompts must not break these contracts:

| Seam | Source | Why preserved |
|---|---|---|
| `ARTICLE_PUBLISHER_WEBPART_ID` | `webparts/articlePublisher/runtimeContract.ts` | Host page binds by id. |
| `<ArticlePublisher>` prop contract (`siteUrl`, `actorEmail`, `repositoriesOverride`) | `ArticlePublisher.tsx` | Mount/test consumers. |
| `createPublisherRepositories` | `publisherAdapter/publisherRepositories` | Master + child + history writes. |
| `createDefaultPublishOrchestrator` | `publisherAdapter/publishOrchestrator` | publish / republish / archive / withdraw. |
| `createSharePointPageBindingWriter`, `createSharePointPageCreationService` | `publisherAdapter/pageBindingWriter`, `pageGeneration` | Destination page lifecycle. |
| `buildPublishResolutionContext` | `publisherAdapter/publishResolutionContext` | Deterministic publish decision input. |
| `workflowStateMachine.canTransition` / `validTransitionsFrom` | `publisherAdapter/workflowStateMachine` | Author-safe transitions. |
| `buildPublisherPreview` | `publisherAdapter/preview/previewBuilder` | Structured preview. |
| `createProjectsLookupSearch` / `ProjectPicker` | `publisherAdapter/projectsLookupSource`, `webparts/articlePublisher/ProjectPicker.tsx` | Typed project selection. |
| `selectPromotionPolicy`, `resolveTemplateSystemManaged` | `publisherAdapter/promotionRuleSelector`, `templateResolver` | Promotion + template policy. |
| `fetchRequestDigest`, `storeSiteUrl` from `@hbc/sharepoint-platform` | platform package | SPFx runtime. |
| `actorEmail` threading from `identity.email` | `mount.tsx` | Workflow-history audit trail. |

These are the non-negotiable contracts the redesign must continue to honor.

---

## 4. Doctrine alignment gaps (current vs governing standard)

Measured against `UI-Doctrine-SPFx-Governing-Standard.md` and `UI-Doctrine-SPFx-Homepage-Overlay.md`:

1. **Admin-console framing, not editorial product.** The surface reads as a CRUD tool — state filter + flat list + seven equal tabs + raw-state transition buttons — rather than a focused editorial workspace. Violates the standard's direction to move SPFx surfaces toward premium, product-thinking compositions.
2. **Tab-first IA exposes the data model, not the story.** Tabs are named after row groups (`metadata`, `hero`, `content`, `team`, `gallery`, `status`) rather than author-facing tasks. Authors must learn the schema to compose an article.
3. **Raw internal values surfaced.** Badges render the internal `WorkflowState` token and binding `PublishStatus` token; transition buttons expose literal state names (`→ approved`, `→ published`). Authors should see friendly, decision-oriented affordances, not raw enums.
4. **Generic card/list visual language.** The aside list (`postList/postRow`) and panel cards sit inside the default enterprise card grid language the doctrine explicitly asks premium surfaces to break out of.
5. **Placeholder-feeling wording.** "(Untitled)", "(no project)", filter label `"Filter:"`, badge string `"binding <PublishStatus>"` — functional but not authored. Doctrine bars "placeholder UX, fake affordances, or temporary wording."
6. **Terminology drift — `postList` / `postRow` class names.** Repo identity is Articles, not Posts; the barrel comment explicitly calls this out ("never `Post*` / `PostId`"). Visible class names contradict repo identity.
7. **Lifecycle surfaced as a flat button strip.** Save / Preview / Publish / Republish / dynamic `→ state` buttons are all adjacent with no primary-action hierarchy, no contextual grouping, and no premium lifecycle drawer pattern.
8. **Scheduled legacy-state notice and validation chips bolted into the action bar.** Author context should flow from a lifecycle-aware surface, not from ad-hoc inline notices beside the buttons.
9. **No author-facing empty/loading state discipline at the workspace level.** Empty states exist for the list and the "select an article" panel, but the workspace does not compose these as a first-class editorial state.

These gaps are the target for Prompts 02–04. This report locks the direction; it does not fix them here.

---

## 5. Locked future-state product architecture

The Publisher is an **Editorial Workspace** webpart that helps authors compose a single premium Project Spotlight article end-to-end inside SharePoint.

Locked decisions:

- **Single webpart, single mount.** `ARTICLE_PUBLISHER_WEBPART_ID` and the `<ArticlePublisher>` prop shape do not change. Rebuild the surface only.
- **One destination in scope.** `SUPPORTED_DESTINATIONS` remains `['projectSpotlight']`; UI, copy, and affordances are written for Project Spotlight authoring. Future destinations (e.g., Company Pulse) will be introduced in a later workstream, not retrofitted via drift.
- **Adapter layer is the contract.** The redesigned surface composes on top of the existing adapter seams in §3 without modifying them.
- **Host-safe.** No suite-bar, app-bar, or global-shell assumptions. Own the page canvas; design for coexistence with SharePoint chrome.
- **Premium authored composition over enterprise card grid.** Surface uses the token and primitive discipline in the Governing Standard + Homepage Overlay; new visual primitives, if needed, are proposed into `@hbc/ui-kit` rather than invented locally.
- **Author-confident lifecycle.** Publish / republish / archive / withdraw remain behaviorally identical; their *presentation* becomes a contextual lifecycle surface, not a raw button strip.
- **Editorial framing, not CRUD framing.** The product is "compose and publish an article," not "edit a row in HB Articles."

---

## 6. Locked page information architecture

Three zones, replacing the current aside-list + seven-tab admin IA:

1. **Library zone — "Your articles"**
   Entry surface for picking an existing article or starting a new draft. Replaces the state-filtered flat list. Organised by author-relevant cues (recency, state grouping, project), not by raw `WorkflowState` enum value. Empty/loading/error states are first-class.

2. **Workspace zone — the single-article editorial canvas**
   Primary authoring surface for the selected article. Composed from the named sections in §7, rendered as a focused vertical editorial flow with a premium hero, composition rail, and contextual affordances — not a tab strip keyed by table group. One article, one workspace, one continuous flow.

3. **Lifecycle zone — contextual, non-modal**
   Lifecycle operations (save, preview, publish, republish, archive, withdraw, state transitions allowed by the workflow state machine) surface as a contextual lifecycle surface anchored to the active article. Primary action has clear hierarchy; secondary and destructive actions are grouped; validation and drift signals are expressed as first-class lifecycle feedback rather than inline chips in a button row. The lifecycle zone consumes `workflowStateMachine.validTransitionsFrom` but presents transitions as author-facing outcomes, never raw enum labels.

Retired:
- Flat tab IA (`metadata` / `hero` / `content` / `team` / `gallery` / `preview` / `status`).
- Raw `WorkflowState` / `PublishStatus` badges as the primary author signal.
- `postList` / `postRow` terminology and any other `Post*` drift in the surface.
- Adjacency-only button strip for Save / Preview / Republish / Publish.

---

## 7. Locked section model (Workspace zone)

The Workspace zone is composed of the following sections. Each is backed by an existing adapter contract — the redesign re-presents them, it does not re-derive them.

| Section | Purpose | Backing data contract |
|---|---|---|
| **Identity** | Article title, subject, content type, project binding, owning author. | `PublisherArticleRow` (Title, ArticleSubject, ArticleContentType, Project*, Author); `createProjectsLookupSearch`. |
| **Hero** | Hero composition (theme variant, hero media role, headline framing). | `PublisherArticleRow` hero fields + `HERO_THEME_VARIANT_VALUES`; `PublisherMediaRow` with `MediaRole='hero'`. |
| **Story** | Body copy and structured narrative content the author composes. | `PublisherArticleRow` content fields. |
| **Media gallery** | Supporting / secondary / gallery media beyond hero. | `PublisherMediaRow` (roles `gallery` / `supporting` / `secondary`). |
| **Team** | Team-member spotlight authored through the team-viewer model. | `PublisherTeamMemberRow` + `TEAM_VIEWER_*` enums + `teamViewerAdapter`. |
| **Promotion** | Promotion policy application and promotion-rule signalling. | `selectPromotionPolicy` / `PublisherPromotionRuleRow`. |
| **Destination binding** | The Project Spotlight page-binding surface — template resolution, page binding, drift signalling. | `resolveTemplateSystemManaged`, `PublisherPageBindingRow`, `createSharePointPageBindingWriter`. |
| **Preview** | Structured preview of the composed article as it will publish. | `buildPublisherPreview`. |
| **Lifecycle** | Publish decision, validation blocking, allowed transitions, drift-aware republish. | `createDefaultPublishOrchestrator`, `buildPublishResolutionContext`, `workflowStateMachine`, `validationEngine`. |

Sections are sequenced editorially (Identity → Hero → Story → Media → Team → Promotion → Destination binding → Preview → Lifecycle). The section model is the authoritative list; Prompt-03 implements it and Prompt-04 applies the editorial IA on top.

---

## 8. Downstream change map

The following files are expected to change across Workstream A. This map is directional — Prompts 02–05 remain authoritative for their own scope.

- **Prompt-02 (journey + workspace layout):** documentation-only under this workstream folder (`step-02/`). No code change.
- **Prompt-03 (new workspace shell + navigation model):**
  - `apps/hb-webparts/src/webparts/articlePublisher/ArticlePublisher.tsx` — full surface rebuild against §6–§7.
  - `apps/hb-webparts/src/webparts/articlePublisher/article-publisher.module.css` — retire admin-grid language; align with doctrine tokens.
  - `apps/hb-webparts/src/webparts/articlePublisher/ArticlePublisher.test.tsx` — rewrite surface tests for the new IA.
  - Possible new local composition files inside `webparts/articlePublisher/` for section-level pieces. New reusable visual primitives go to `@hbc/ui-kit`, not here.
- **Prompt-04 (replace tab-first admin IA with editorial IA):**
  - Further edits to `ArticlePublisher.tsx` + CSS + tests to enforce the editorial IA over the shell from Prompt-03.
  - Terminology scrub: remove `postList` / `postRow` and any remaining `Post*` drift from visible names.
- **Prompt-05 (hosted doctrine validation and workstream closure):**
  - Closure report under `workstream-a-product-architecture-and-ux-redesign/step-05/`.
  - Any targeted final drift closures surfaced by hosted validation.

Not changed by Workstream A:
- `apps/hb-webparts/src/mount.tsx` prop wiring.
- `webparts/articlePublisher/runtimeContract.ts` / `ArticlePublisherWebPart.manifest.json` id and public contract.
- `homepage/data/publisherAdapter/**` — no adapter behavior changes.
- `ProjectPicker.tsx` — retained as-is (may be composed differently).

---

## 9. Out of scope for this step

- No edits to `ArticlePublisher.tsx`, its CSS, its tests, its manifest, its runtime contract, or the mount seam.
- No edits to any file under `publisherAdapter/`.
- No new `@hbc/ui-kit` primitives.
- No manifest version bump.
- No behavior changes to publish / republish / archive / withdraw / preview.

---

## 10. Validation

- Seams in §3 verified against `ArticlePublisher.tsx` imports (lines 17–77) and `publisherAdapter/index.ts` barrel (lines 17–35).
- `SUPPORTED_DESTINATIONS` verified in `publisherAdapter/destinationSiteUrls.ts:88` — derived from `isDestinationSupported`; today resolves to Project Spotlight only.
- Current IA observations in §2.1 verified against `ArticlePublisher.tsx:596–792` (aside + tab nav + panel router + action bar footer).
- §5–§7 cross-checked against the SPFx Governing Standard (§1 governing intent, §2 shared obligations, §3.1 respect the host, §3.2 own the page canvas) and the Homepage Overlay; no binding rule contradicted.

---

## 11. Real blockers

None. Downstream prompts (02–05) can proceed against the lock recorded in §5–§8.
