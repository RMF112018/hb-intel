# Workstream B — Step 03 Closure Report

**Prompt:** Phase-08 / Phase-2 / Prompt-03 — Remove author-facing slug management and implement governed slug generation
**Status:** Closed.
**Date:** 2026-04-14
**Manifest:** `hb-webparts` → 1.0.0.272

---

## 1. Summary of what was changed

Workstream A step-04 already removed the author-facing `Slug` `<input>` from the `MetadataPanel`. The persisted `Slug` value, however, was being seeded from the random `ArticleId` in `emptyArticle()` and never regenerated from the title — so the system silently shipped slugs like `art-1730145200000-7f3a` to the destination page on first publish. This step replaces that with governed slug generation: derived from the article headline, normalised to a URL-safe form, and deduped against every other article in the workspace before save.

Highlights:

- **New module `slugGovernance.ts`** with the slug pipeline as four small pure functions:
  - `generateSlugFromTitle(title)` — lowercases, drops apostrophes, collapses non-alphanumeric runs to a single hyphen, trims leading/trailing hyphens, and caps at `SLUG_MAX_LENGTH` (80 characters).
  - `generateSlug(article)` — calls `generateSlugFromTitle`; falls back to `untitled-<id-tail>` when the title yields no usable characters so a brand-new draft can always be saved.
  - `applySlugUniqueness(candidate, takenSlugs)` — appends `-2`, `-3`, … until unique. Honours `SLUG_MAX_LENGTH` by trimming the base when the suffix would exceed it. Last-resort fallback uses a 6-char base-36 timestamp suffix.
  - `shouldRegenerateSlug(state, currentSlug)` — slug is regenerated while the article is in `draft` (so the headline can be iterated freely) **or** whenever the persisted slug is missing/blank, regardless of state. Once an article is in `review` / `approved` / `published` / `archived` / `withdrawn` and a slug exists, the slug is preserved on save so external links and destination-page bindings remain stable.
  - `resolveSlugForSave(article, takenSlugs)` — composes the above into the single function the save path calls.
- **`emptyArticle()`** no longer seeds `Slug: id`. New drafts start with `Slug: ''`; the save path resolves the system-managed value.
- **`handleSave` in `ArticlePublisher.tsx`**:
  - Builds `takenSlugs` from the existing `groups` state (which already loads every operational workflow state in parallel for the draft rail), excluding the current article's own slug so re-saving the same article does not collide with itself.
  - Calls `resolveSlugForSave(...)` and assigns the result to the row before persisting through `repositories.articles.upsert(...)`.
  - The previously-resolved template key path is unchanged; slug resolution is additive next to it.
  - The save callback's dependency list is updated to include `groups` so React re-binds it whenever the workspace inventory changes.
- **No author-facing UI exposure** of the slug. The Identity section continues to render Headline, Summary excerpt, Article type, Destination, Spotlight type, Project stage, Subject, and the Project picker. The slug is invisible to authors. (Authors who want to see the slug can still see the destination page URL once published, which already encodes it via the page-binding writer.)
- **New tests `slugGovernance.test.ts`** (20 cases) covering: title-to-slug normalisation (lowercasing, hyphenation, apostrophe stripping, length cap), empty-title fallback, uniqueness suffixing (no collision, single, multiple), `SLUG_MAX_LENGTH` honoured under suffixing, draft-vs-non-draft regeneration policy, missing-slug recovery path on non-draft articles, and the end-to-end `resolveSlugForSave` contract.

Preserved seams (unchanged):
- Adapter surface under `publisherAdapter/**` — no changes. `Slug` remains a `PublisherArticleRow` field; the adapter is unaware that the value is now governed at the surface.
- Lifecycle behaviour: publish / republish / archive / withdraw / preview unchanged. Slug is set before `repositories.articles.upsert(...)` and remains stable across subsequent operations once the article leaves draft.
- Webpart id, prop contract, mount wiring, `actorEmail` threading, `workflowStateMachine`, orchestrator, page binding / page creation services, template resolver, promotion selector, projects lookup, and the Workstream-A editorial shell + readiness rail — all unchanged.
- Workstream-B step-01 governed labels and step-02 authoritative project picker — unchanged.

---

## 2. Exact files changed

- `apps/hb-webparts/src/webparts/articlePublisher/slugGovernance.ts` (new)
- `apps/hb-webparts/src/webparts/articlePublisher/slugGovernance.test.ts` (new)
- `apps/hb-webparts/src/webparts/articlePublisher/ArticlePublisher.tsx` (import + `emptyArticle` + `handleSave` slug resolution)
- `apps/hb-webparts/config/package-solution.json` (`1.0.0.271` → `1.0.0.272`)

No changes to:
- `apps/hb-webparts/src/mount.tsx`
- `apps/hb-webparts/src/webparts/articlePublisher/runtimeContract.ts`, `ArticlePublisherWebPart.manifest.json` (webpart id unchanged)
- `apps/hb-webparts/src/webparts/articlePublisher/article-publisher.module.css` / `.d.ts` (no styling change; slug has no UI)
- `apps/hb-webparts/src/webparts/articlePublisher/ArticlePublisher.test.tsx`, `authorLabels.ts`, `authorLabels.test.ts`, `ProjectPicker.tsx`
- `apps/hb-webparts/src/homepage/data/publisherAdapter/**`

---

## 3. Validation performed

- `pnpm --dir apps/hb-webparts run check-types` → pass.
- `pnpm --dir apps/hb-webparts exec vitest run src/webparts/articlePublisher` → 54/54 pass (12 article-publisher + 22 author-labels + 20 slug-governance).
- Manual scrub of `MetadataPanel` JSX — no `Slug` field, no admin "(slug auto-generated)" placeholder copy, no raw `ArticleId`-as-slug emission.
- Save path traced end-to-end: `handleSave` → `resolveSlugForSave` → `repositories.articles.upsert` → `reloadGroups` → `reloadSelected`. Subsequent re-saves on the same article exclude its own slug from `takenSlugs` so they do not collide with themselves.
- 28 pre-existing failures in `publisherAdapter/**` test suites remain unchanged and out of scope.

---

## 4. Closure report path

`docs/architecture/plans/MASTER/spfx/publisher/remediation/workstream-b-metadata-simplification-and-automation/step-03/Closure-Report.md`

---

## 5. Real blockers remaining

None. Workstream B can proceed:
- **Prompt-04** — implement intelligent defaults for team heading and related metadata.
- **Prompt-05** — validate metadata simplification end-to-end and close Workstream B.
