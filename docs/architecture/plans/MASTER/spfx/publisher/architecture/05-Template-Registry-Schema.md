# 05 — Template Registry Schema

## Purpose

The template registry is the authoritative system for deciding:

- which template applies
- which render blocks are shown
- which field groups are required
- which webpart profiles are used
- which page shell recipe is generated

This logic must not be scattered across UI code or publishing actions.

## Schema shape

## Core identity
- `TemplateKey`
- `TemplateName`
- `VersionLabel`
- `IsActive`
- `TemplatePriority`

## Applicability rules
- `Destination`
- `ContentTypes`
- `ArticleSubjects`
- `ProjectStages`
- `SpotlightTypes`

## Render profiles
- `HeroProfileKey`
- `TeamViewerProfileKey`
- `BodyProfileKey`
- `GalleryProfileKey`
- `PageShellTemplateKey`

## Block visibility rules
- `ShowHero`
- `ShowTeamViewer`
- `ShowSecondaryImage`
- `ShowGallery`
- `ShowBody`

## Validation profile
- `RequiredFieldSetKey`

## Resolution model

The template engine should resolve the active template using:

1. destination
2. content type
3. subject
4. project stage
5. spotlight type
6. active flag
7. highest priority among matching templates

### Example resolution order
- exact destination + content type + spotlight type + stage
- destination + content type + spotlight type
- destination + content type
- destination default template

## Example template keys

### CompanyPulse
- `cp-general-news-v1`
- `cp-announcement-v1`
- `cp-feature-story-v1`

### ProjectSpotlight
- `ps-monthly-spotlight-v1`
- `ps-milestone-spotlight-v1`
- `ps-project-update-v1`

## Example registry rows

### `cp-general-news-v1`
- destination: `companyPulse`
- contentTypes: `generalNews`, `update`
- show hero: yes
- show teamViewer: no
- show secondary image: optional
- show gallery: optional
- show body: yes
- hero profile: `hero-companypulse-standard-v1`
- body profile: `body-standard-v1`
- gallery profile: `gallery-standard-v1`
- page shell: `page-companypulse-standard-v1`
- required field set: `req-cp-general-news-v1`

### `ps-monthly-spotlight-v1`
- destination: `projectSpotlight`
- contentTypes: `monthlySpotlight`
- spotlightTypes: `monthly`
- show hero: yes
- show teamViewer: yes
- show secondary image: optional
- show gallery: yes
- show body: yes
- hero profile: `hero-projectspotlight-standard-v1`
- teamViewer profile: `teamviewer-project-standard-v1`
- body profile: `body-standard-v1`
- gallery profile: `gallery-standard-v1`
- page shell: `page-projectspotlight-standard-v1`
- required field set: `req-ps-monthly-spotlight-v1`

### `ps-milestone-spotlight-v1`
- destination: `projectSpotlight`
- contentTypes: `milestoneSpotlight`
- spotlightTypes: `milestone`
- show hero: yes
- show teamViewer: yes
- show secondary image: optional
- show gallery: yes
- show body: yes
- hero profile: `hero-projectspotlight-milestone-v1`
- teamViewer profile: `teamviewer-project-standard-v1`
- page shell: `page-projectspotlight-milestone-v1`
- required field set: `req-ps-milestone-spotlight-v1`

## Template registry operating rules

1. Template rows must be versioned, not silently overwritten
2. Template priority determines tie-breaking
3. Only one active template should resolve per article in ordinary operation
4. Manual override should be controlled and admin-only
5. Component profile keys should be independent from template keys to allow reuse

## Evolution notes

Template-specific required fields may need revision when:
- `hbSignatureHero` gains new rendering options
- `teamViewer` adds grouping or org-chart modes
- page shell composition expands
- additional HB article components are introduced
