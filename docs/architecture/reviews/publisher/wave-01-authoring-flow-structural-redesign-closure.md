# Publisher Wave-01 — Authoring flow & section hierarchy closure

**Prompt:** `docs/architecture/plans/MASTER/spfx/publisher/phase-14/Prompt-02-Structural-redesign-default-authoring-flow-and-section-hierarchy.md`
**Scope:** center authoring path — MetadataPanel (identity) and StoryPanel (story).
**Manifest:** hb-publisher Feature 1.0.0.30.

## What section hierarchy was replaced

Before this change, two panels on the first-pass editorial path still behaved like flat configuration blobs:

- **MetadataPanel** exposed eight peer decisions (Headline, Summary, Article type, Publishes-to readout, Spotlight type, Project stage, Subject, Project) at equal visual weight, with the single first-class decision — project binding — sitting at the bottom.
- **StoryPanel** presented four optional editorial flourishes (Intro, Closing, Callout, Pull quote) as peers to the two required fields (Subhead, Article body), effectively doubling the decision surface on an empty draft.

Both have been recomposed around a short, ordered editorial sequence backed by opt-in progressive disclosure.

## First-pass fields that remain visible

**Identity (MetadataPanel) — primary path, in order:**

1. Project (picker, first-class)
2. Headline
3. Summary excerpt
4. Article type (+ inline "Publishes to" readout, + legacy-milestone notice when applicable)

**Story (StoryPanel) — primary path, in order:**

1. Subhead
2. Article body (Tiptap)

## Advanced controls that moved and why

- Spotlight type, Project stage, and Subject → moved into a new `Editorial metadata` `<details>` disclosure (`testId: metadata-advanced-section`). They are listing/filter inputs, not first-pass authoring decisions; burying them is correct. The disclosure opens automatically when a seeded draft already has any of the three set so authors never lose sight of values they (or a prior save) chose.
- Body intro, Body closing, Callout text, Pull quote → moved into a new `Editorial flourishes` disclosure on StoryPanel (`testId: story-flourishes-section`). Same auto-open semantics when a draft already carries any of the four.
- Hero and Team advanced sections were already correctly disclosed in the prior phases; those patterns are preserved unchanged (`hero-advanced-section`, `team-advanced-section`).

## Defaults preserved

- Project-picker behaviour, project-bound read-only fallback chip, lookup-error messaging, and the "no manual ProjectId / ProjectName text entry" invariant are all unchanged — exercised by the existing `metadataPanel.test.tsx` suite, which continues to pass.
- The team-heading auto-default (via `defaultTeamHeading(entry.projectName)`) still fires on project selection when the heading is blank.
- Slug, TemplateKey, and TargetSiteUrl remain system-managed and continue to stay out of the author's UI.
- Intelligent defaults on the hero category label, team heading placeholder, and promotion policy application are unchanged.

## Why the new path is materially shorter and clearer

- A blank first-pass draft now shows **two panels' worth of six required/primary fields** (1 picker + 3 metadata + 2 story fields) instead of the previous **twelve equally-weighted fields**. That is a ~50% reduction in the visible decision surface at the moment authors most need focus.
- Project binding is now the first thing an author sees in the identity section, which matches the editorial reality: the project drives team heading defaults, hero category fallback, and promotion-policy resolution. Putting it last created a subtle back-and-forth flow that has now been eliminated.
- The subhead + body pair in StoryPanel is no longer diluted by four optional embellishments competing for attention — flourishes are still one click away, but they read as opt-in depth rather than peer-level obligations.
- Both disclosures follow the same `<details>` pattern already used and tested on HeroPanel and TeamPresentationPanel, so the pattern is now uniform across the four authoring panels.

## Readiness / validation compatibility

- Section ids (`section-identity`, `section-story`) and `sectionAnchorForFindingField` backlinks are unchanged — readiness issues that anchor to identity or story still land the author in the right place.
- No required field is hidden behind a disclosure; all validation targets (Title, SummaryExcerpt, Subhead, BodyRichText, ProjectId) remain on the primary path.
- No-op for `publishOrchestrator`, `useReadinessController`, `useDraftLifecycle`, and save-path promotion policy application.

## Verification

- `pnpm --filter @hbc/spfx-hb-publisher check-types` — clean.
- `pnpm --filter @hbc/spfx-hb-publisher test` — 614 passing (including the existing MetadataPanel, HeroPanel, and TeamPresentationPanel disclosure suites); 6 failures all pre-existing in `publisherAdapter/__tests__/publisherEndToEnd.test.ts`, unrelated to this change (confirmed against the pre-change baseline in phase-14 prompt-01 closure).
- Manifest bumped: `config/package-solution.json` 1.0.0.29 → 1.0.0.30.
