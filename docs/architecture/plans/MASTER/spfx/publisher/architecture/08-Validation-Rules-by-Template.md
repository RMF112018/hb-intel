# 08 — Validation Rules by Template

## Purpose

Validation should happen before publish and before preview finalization where possible.

The validation engine should be template-aware and driven from the registry.

## Global validation rules

Apply to all templates unless explicitly relaxed:

1. `ArticleId` must exist
2. `Destination` must be set
3. `ContentType` must be set
4. `TemplateKey` must resolve to an active template
5. `Title` must be present
6. `Subhead` must be present
7. `SummaryExcerpt` must be present
8. `Slug` must be present and unique within destination
9. `BodyRichText` must be present when the template requires body
10. `HeroPrimaryImage` must be present when the template requires hero
11. `HeroPrimaryImageAltText` must be present when hero image exists
12. Secondary image alt text must be present if secondary image is supplied
13. Every gallery image must have alt text
14. Publish cannot proceed if page sync status is unresolved error from the current run

## Recommended length guidance

Not hard blockers unless configured as such:

- title: keep within editorial max
- subhead: keep within hero-friendly max
- summary excerpt: keep within rollup-friendly max

---

## Required field sets

The registry should map each template to a required field set key.

### Example
- `req-cp-general-news-v1`
- `req-cp-feature-story-v1`
- `req-ps-monthly-spotlight-v1`
- `req-ps-milestone-spotlight-v1`

---

## Template-specific validation

## A. `cp-general-news-v1`

### Required
- `Destination = companyPulse`
- `ContentType in {generalNews, update}`
- `Title`
- `Subhead`
- `SummaryExcerpt`
- `Slug`
- `HeroPrimaryImage`
- `HeroPrimaryImageAltText`
- `BodyRichText`

### Conditional
- If `ShowSecondaryImage = true`, then `SecondaryImage` and alt text required
- If gallery rows exist, each must have alt text
- Team rows allowed but not required; template may ignore them

---

## B. `cp-announcement-v1`

### Required
- `Destination = companyPulse`
- `ContentType = announcement`
- `Title`
- `Subhead`
- `SummaryExcerpt`
- `Slug`
- `BodyRichText`

### Conditional
- Hero may be optional if the template profile allows hero suppression
- If hero image supplied, alt text required
- Team rows generally not required

---

## C. `cp-feature-story-v1`

### Required
- `Destination = companyPulse`
- `ContentType = featureStory`
- `Title`
- `Subhead`
- `SummaryExcerpt`
- `Slug`
- `HeroPrimaryImage`
- `HeroPrimaryImageAltText`
- `BodyRichText`

### Recommended
- At least one gallery image or secondary image for richer story mode

---

## D. `ps-monthly-spotlight-v1`

### Required
- `Destination = projectSpotlight`
- `ContentType = monthlySpotlight`
- `SpotlightType = monthly`
- `ProjectId`
- `ProjectName`
- `ProjectStage`
- `Title`
- `Subhead`
- `SummaryExcerpt`
- `Slug`
- `HeroPrimaryImage`
- `HeroPrimaryImageAltText`
- `BodyRichText`

### Conditional
- If template says `ShowTeamViewer = true`, then team rows may be:
  - required, or
  - optional with graceful hide, depending on final business rule

### Recommended
- At least one team member for canonical monthly spotlight pattern
- Gallery strongly recommended

---

## E. `ps-milestone-spotlight-v1`

### Required
- `Destination = projectSpotlight`
- `ContentType = milestoneSpotlight`
- `SpotlightType = milestone`
- `ProjectId`
- `ProjectName`
- `Title`
- `Subhead`
- `SummaryExcerpt`
- `Slug`
- `HeroPrimaryImage`
- `HeroPrimaryImageAltText`
- `BodyRichText`

### Recommended / conditional
- `MilestoneLabel`
- `MilestoneDateUtc`
- team rows optional or required depending on final template behavior
- gallery recommended

---

## F. `ps-project-update-v1`

### Required
- `Destination = projectSpotlight`
- `ContentType = projectUpdate`
- `ProjectId`
- `ProjectName`
- `Title`
- `Subhead`
- `SummaryExcerpt`
- `Slug`
- `BodyRichText`

### Conditional
- Hero required if the selected profile shows hero
- Team required only if the selected profile shows teamViewer

---

## Validation error categories

Use explicit categories:
- missing-required-field
- invalid-template-match
- invalid-slug
- invalid-image-accessibility
- invalid-team-configuration
- invalid-gallery-configuration
- invalid-destination-binding
- page-sync-blocker

## Evolution notes

Validation requirements may need updates when:
- `hbSignatureHero` changes its required props
- `teamViewer` adds new modes or mandatory structure
- template families change their visible blocks
- body rendering becomes more structured
