# 08 — Validation Rules by Template

## Purpose

Validation should happen before preview finalization and before publish. The validation engine must be template-aware and aligned with the canonical Project Spotlight shell.

## Global validation rules

Apply to all Project Spotlight templates unless explicitly relaxed:

1. `PostId` must exist
2. `TargetSiteKey` must equal `projectSpotlight`
3. `TargetSiteUrl` must point to the Project Spotlight site
4. `PostFamily` must be set
5. `TemplateKey` must resolve to an active template
6. `PageShellKey` must resolve to an active shell profile
7. `SourceTemplatePath` must be present
8. `Title` must be present
9. `Subhead` must be present when the selected template requires the subhead slot
10. `BodyRichText` must be present when the selected template requires the body slot
11. `Slug` must be present and unique within Project Spotlight
12. `BannerImageUrl` must be present when the selected template uses the current banner shell
13. `BannerImageAltText` must be present whenever a banner image exists
14. Every gallery image must have alt text
15. Publish cannot proceed if the current run has an unresolved page-sync/generation error
16. A template cannot require a dedicated secondary-image slot unless its `PageShellKey` points to a shell that actually contains one

## Recommended length guidance

Not hard blockers unless configured as such:

- title: keep within editorial max
- subhead: keep within banner-friendly max
- summary excerpt: keep within rollup-friendly max

## Required field-set keys

Examples:
- `req-ps-inprogress-monthly-v1`
- `req-ps-inprogress-milestone-v1`
- `req-ps-inprogress-project-update-v1`

## Template-specific validation

### A. `ps-inprogress-monthly-v1`

#### Required
- `PostFamily = monthlySpotlight`
- `SpotlightType = inProgress`
- `ProjectId`
- `ProjectName`
- `ProjectStage`
- `Title`
- `Subhead`
- `SummaryExcerpt`
- `Slug`
- `BannerImageUrl`
- `BannerImageAltText`
- `BodyRichText`

#### Conditional
- if `ShowTeamViewer = true`, require at least one included team-member row
- if `ShowGallery = true`, require at least one gallery image row
- if `TeamViewerEnableProfileDrawer = true`, team rows using the drawer should provide minimally valid drawer content

#### Recommended
- at least one team member for the canonical monthly spotlight pattern
- gallery content is strongly recommended even when not strictly required

---

### B. `ps-inprogress-milestone-v1`

#### Required
- `PostFamily = milestoneSpotlight`
- `SpotlightType = milestone`
- `ProjectId`
- `ProjectName`
- `Title`
- `Subhead`
- `SummaryExcerpt`
- `Slug`
- `BannerImageUrl`
- `BannerImageAltText`
- `BodyRichText`
- `MilestoneLabel`
- `MilestoneDateUtc`

#### Conditional
- team rows optional unless template profile marks team as required
- gallery rows optional unless template profile marks gallery as required

#### Recommended
- project-stage classification
- at least one gallery image for milestone storytelling

---

### C. `ps-inprogress-project-update-v1`

#### Required
- `PostFamily = projectUpdate`
- `ProjectId`
- `ProjectName`
- `Title`
- `Subhead`
- `SummaryExcerpt`
- `Slug`
- `BannerImageUrl`
- `BannerImageAltText`
- `BodyRichText`

#### Conditional
- team required only if the template profile exposes the team block and the business rule marks it required
- gallery required only if the template profile exposes the gallery block and the business rule marks it required

## Shell-compatibility validation

Before publish, validate that the resolved shell actually supports the requested block profile.

### Examples
- if a template says `ShowGalleryBlock = true`, the shell must contain a gallery control
- if a template says `ShowTeamBlock = true`, the shell must contain a Team Viewer control
- if a template says `BannerRendererKind = hbSignatureHero`, the shell must actually contain that renderer slot
- if a template requires a secondary-image slot, the current canonical shell is not compatible

## Page-generation validation

Before publish or regenerate:

1. the source template path must resolve
2. the control map for the shell must resolve
3. all required controls expected by the shell must exist
4. the target page name must be valid
5. the binding record must be writable

## Validation error categories

Use explicit categories:

- `missing-required-field`
- `invalid-template-match`
- `invalid-shell-compatibility`
- `invalid-slug`
- `invalid-image-accessibility`
- `invalid-team-configuration`
- `invalid-gallery-configuration`
- `invalid-page-binding`
- `page-generation-blocker`

## Evolution notes

Validation requirements may need updates when:

- the Project Spotlight shell family expands
- the banner region moves from OOB Page Title to `hbSignatureHero`
- `teamViewer` adds new mandatory structure
- body rendering becomes more structured
