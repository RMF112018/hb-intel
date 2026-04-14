# Workstream B — Step 04 Closure Report

**Prompt:** Phase-08 / Phase-2 / Prompt-04 — Implement intelligent defaults for team heading and related metadata
**Status:** Closed.
**Date:** 2026-04-14
**Manifest:** `hb-webparts` → 1.0.0.273

---

## 1. Summary of what was changed

Authors no longer have to type the Team section heading by hand. The system now derives an intelligent default from the bound project ("The Team at {project name}") and applies it automatically when the heading is empty. Author-typed values are preserved on every save.

Highlights:

- **New module `metadataDefaults.ts`** with three small pure functions:
  - `defaultTeamHeading(projectName)` → `"The Team at {projectName}"` when a project is set; `"The Team"` otherwise.
  - `defaultHeroCategoryLabel(projectName)` → trimmed project name when set; `undefined` (no default) otherwise.
  - `intelligentDefaultsForSave(draft)` → returns a draft with empty/whitespace `TeamViewerTitle` and `HeroCategoryLabel` filled, plus the list of fields that were filled.
- **`handleSave` in `ArticlePublisher.tsx`** now passes the draft through `intelligentDefaultsForSave` before promotion-policy lock-only re-application, slug resolution, and `repositories.articles.upsert`. Empty fields are filled; non-empty author values pass through untouched.
- **`handleProjectChange` in `MetadataPanel`** opportunistically fills the team heading the moment a project is picked, but only when the heading is currently blank — author-typed headings are preserved. This lets the author see the resolved heading immediately rather than waiting for save.
- **`TeamPresentationPanel` heading input** now uses the resolved default as its HTML `placeholder`. Authors who leave the field blank can preview exactly what will be applied on save (e.g., placeholder reads "The Team at Riverside Tower"). The placeholder updates live as the bound project changes.
- **Hero category label default**: `HeroCategoryLabel` is filled from `ProjectName` on save when blank. Authors can override; once overridden, the value sticks. When no project is bound, no default is introduced (the field stays blank).
- **`HeroTitle` default not added.** The hero render layer already falls back to the article headline when `HeroTitle` is blank, so a save-time default would be redundant. Documented as a deliberate non-action.
- **New tests `metadataDefaults.test.ts`** (11 cases) covering: project-bound and project-less heading derivation, whitespace trimming, fill-only-when-empty semantics for both fields, preservation of author-typed values, no-project-no-hero-default behaviour, and the whitespace-as-blank rule.

Preserved seams (unchanged):
- Adapter surface under `publisherAdapter/**` — no changes.
- Lifecycle: publish / republish / archive / withdraw / preview unchanged. Defaults are applied to the in-memory draft before `repositories.articles.upsert`; once persisted, they behave like any other field.
- All workstream-A preserved seams (webpart id, prop contract, mount wiring, `actorEmail` threading, `workflowStateMachine`, orchestrator, page binding services, template resolver, promotion selector, projects lookup) — unchanged.
- Workstream-B step-01 governed labels, step-02 authoritative project picker, step-03 governed slug generation — unchanged.

---

## 2. Exact files changed

- `apps/hb-webparts/src/webparts/articlePublisher/metadataDefaults.ts` (new)
- `apps/hb-webparts/src/webparts/articlePublisher/metadataDefaults.test.ts` (new)
- `apps/hb-webparts/src/webparts/articlePublisher/ArticlePublisher.tsx` (import; `handleSave` defaults pass; `handleProjectChange` opportunistic fill; `TeamPresentationPanel` placeholder)
- `apps/hb-webparts/config/package-solution.json` (`1.0.0.272` → `1.0.0.273`)

No changes to:
- `apps/hb-webparts/src/mount.tsx`
- `apps/hb-webparts/src/webparts/articlePublisher/runtimeContract.ts`, `ArticlePublisherWebPart.manifest.json` (webpart id unchanged)
- `apps/hb-webparts/src/webparts/articlePublisher/article-publisher.module.css` / `.d.ts` (no styling change)
- `apps/hb-webparts/src/webparts/articlePublisher/ArticlePublisher.test.tsx`, `authorLabels.ts`/`.test.ts`, `slugGovernance.ts`/`.test.ts`, `ProjectPicker.tsx`
- `apps/hb-webparts/src/homepage/data/publisherAdapter/**`

---

## 3. Validation performed

- `pnpm --dir apps/hb-webparts run check-types` → pass.
- `pnpm --dir apps/hb-webparts exec vitest run src/webparts/articlePublisher` → 65/65 pass (12 article-publisher + 22 author-labels + 20 slug-governance + 11 metadata-defaults).
- Manual scrub: no admin language reintroduced; the placeholder copy in the team-heading input is the live resolved default ("The Team at …"), not a static "e.g. Project team" prompt.
- Editability semantics manually verified against the helpers and tests: empty/whitespace fields fill on save, non-empty author values pass through unchanged on every subsequent save.
- 28 pre-existing failures in `publisherAdapter/**` test suites remain unchanged and out of scope.

---

## 4. Closure report path

`docs/architecture/plans/MASTER/spfx/publisher/remediation/workstream-b-metadata-simplification-and-automation/step-04/Closure-Report.md`

---

## 5. Real blockers remaining

None. Workstream B can proceed to **Prompt-05** — validate metadata simplification end-to-end and close Workstream B.
