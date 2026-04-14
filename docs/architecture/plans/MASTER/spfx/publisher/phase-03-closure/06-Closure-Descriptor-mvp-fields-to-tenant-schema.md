# Closure 06 — Descriptor mvpFields realigned to tenant schema

## Objective
Rewrite the publisher list-descriptor `mvpFields` metadata so it
reflects the real tenant columns on each `HB Article*` list and no
longer carries pre-tenant-audit assumptions. Keep the descriptor
useful for diagnostics and drift tests rather than aspirational.

## Files changed
- `apps/hb-webparts/src/homepage/data/publisherAdapter/publisherListDescriptors.ts`
- `apps/hb-webparts/src/homepage/data/publisherAdapter/publisherListDescriptors.test.ts`

## Exact issue closed
The `HB Articles` descriptor (`POSTS_MVP_FIELDS`) was materially
drifted from tenant truth. It listed ~20 pre-tenant columns that do
not exist on the tenant list — `BannerTitleOverride`, `PostFamily`,
`PageShellKey`, `Banner*`, `HeroRendererKind`, `TeamSectionHeading`,
`TeamViewerLayout` / `Density` / `EnableProfileDrawer`,
`ShowGallery`, `GalleryLayoutProfile`,
`IncludeInProjectSpotlightRollups`, `TargetSiteKey`,
`GeneratedPageName`, `SourceTemplatePath`, `AppliedTemplateVersion`,
`AppliedShellVersion`, `LastSuccessfulPublishDateUtc` — and omitted
~25 tenant columns that the publisher already reads/writes through
`PublisherArticleRow` (the full `Hero*` set, `ArticleContentType`,
`Destination`, `IncludeInDestinationLanding`,
`IncludeInHomepageFeed`, `SuppressFromRollups`, `ManualSortOverride`,
`TeamViewerTitle`, `TeamViewerIntro`, `MilestoneLabel`,
`MilestoneDateUtc`, `PublishedByEmail`, `ProjectStatusLabel`,
`BodyIntro`, `BodyClosing`, `CalloutText`, `PullQuote`,
`PageTemplateKey`, `PageShellVersion`, `RenderVersion`,
`TemplateOverrideAllowed`). The variable was also named
`POSTS_MVP_FIELDS` — a pre-rebrand token.

The other seven descriptors (Team Members, Media, Template Registry,
Destination Pages, Workflow History, Publishing Errors, Promotion
Rules) already agreed with the tenant schema after Prompts 03 and
04, but there was no drift test keeping them honest.

## Remediation
1. **Descriptor rewrite.** Renamed `POSTS_MVP_FIELDS` →
   `ARTICLES_MVP_FIELDS` and rewrote it strictly from the schema
   report's `HB Articles` section. Every entry corresponds to a
   real tenant internal field; every pre-tenant name is gone. The
   leading doc comment now names the authority and explicitly lists
   the removed pre-tenant columns so a reviewer can see the delta
   without cross-referencing git history.
2. **Drift test suite.** Added a new `describe(
   'publisherListDescriptors — tenant mvpFields drift' )` block in
   `publisherListDescriptors.test.ts` that:
   - For each of the eight descriptors, pins the
     tenant-aligned expected set (`EXPECTED_MVP_FIELDS`) and
     asserts the descriptor's `mvpFields` match exactly
     (order-independent).
   - Pins an `OBSOLETE_FIELDS` set of known pre-tenant names that
     must never reappear and asserts no descriptor `mvpFields`
     entry is in that set. The list intentionally includes fields
     removed in Prompts 03/04 (`ImageAssetUrl`, `JobTitle`,
     `PhotoUrl`, `IncludeInViewer`, `ResumeRichText`,
     `ResumeDocumentUrl`, bare `PersonPrincipal` — User fields are
     written as `PersonPrincipalId`) so regressions in those seams
     surface here as well.

## Tests added or updated
- `publisherListDescriptors.test.ts`:
  - **New**: "{list} descriptor mvpFields match the tenant-aligned
    expected set" (8 parametric cases).
  - **New**: "no descriptor mvpFields entry uses an obsolete
    pre-tenant name".

Baseline before this prompt: 19 failed, 148 passed (167 total).
After this prompt: 19 failed, 157 passed (176 total). Nine new
descriptor drift tests pass; no previously passing test is now
failing.

## Proof of behavioral closure
- `ARTICLES_MVP_FIELDS` contains exactly the tenant-editable
  columns the publisher reads or writes through
  `PublisherArticleRow` — no phantom columns, no missing columns.
- The drift test suite now fails fast if any descriptor silently
  regresses to a pre-tenant name. The negative list explicitly
  includes the fields that earlier Phase-03 prompts removed, so
  this prompt also acts as a regression guard for Prompts 03 / 04.
- Renaming `POSTS_MVP_FIELDS` → `ARTICLES_MVP_FIELDS` removes the
  last pre-rebrand "Posts" token from the descriptor module.

## Remaining follow-up risks
- Tenant columns that exist but the publisher does not currently
  consume (e.g. `AudienceTags`, `BusinessUnit`, `CampaignWindow*`,
  `FeaturedScope`, `HeroImageFocalPoint`, `LastReviewedDateUtc`,
  `MarketSector`, `Region`, `RequiresReapprovalOnEdit`,
  `RevisionNote`, `SecondaryImage*`, `ShowSecondaryImage`,
  `TeamViewerAllowExpand` / `GroupingMode` / `MaxInitialVisible` /
  `Mode` / `SortMode`, `ApprovalOwnerEmail`, `ReviewOwnerEmail`,
  `ChangeReason`, `BodyStyleVariant`) are intentionally omitted
  from the descriptor today. If a future prompt starts reading or
  writing any of them, the contract, mapper, writer, AND this
  descriptor must all be updated together — the drift test will
  flag the descriptor side of that change loudly.
- The `AudienceTags` / `FeaturedScope` choice tenant columns are
  declared with `Choices: TBD`. When the tenant finalizes those
  vocabularies, the publisher's enum types (not the descriptor)
  will need a matching update; the descriptor will carry the
  column name if/when the publisher consumes it.
