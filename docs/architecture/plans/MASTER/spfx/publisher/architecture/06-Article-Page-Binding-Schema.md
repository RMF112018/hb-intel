# 06 — Article / Page Binding Schema

## Purpose

This schema defines how a structured Project Spotlight post becomes a generated page on:

- `https://hedrickbrotherscom.sharepoint.com/sites/ProjectSpotlight`

## Binding concept

A binding is the durable link between:

- the authoritative post record
- the resolved template profile
- the resolved page shell
- the generated Project Spotlight page

## Binding lifecycle

### 1. Draft / pre-publish
- the post exists in the control plane
- no published destination page is required yet
- preview may be generated in-app or via non-published preview mechanics
- no permanent binding row is required until publish unless the implementation wants preview bindings

### 2. First publish
- resolve `TemplateKey`
- resolve `PageShellKey`
- confirm shell source path
- clone or generate from the canonical XML shell
- create a **new page on the Project Spotlight site**
- inject structured post content into the shell’s mapped controls
- write the page identity and version information into the binding record

### 3. Republish / update
- same `PostId`
- same bound page by default
- update mapped controls in place unless regeneration is required
- increment template/shell/render version references as needed
- update sync timestamps and status

### 4. Regeneration
Used when:
- shell version changed materially
- template registry requires regeneration on shell drift
- bound page is missing required controls
- implementation policy chooses clean regeneration instead of patching

Regeneration behavior:
- create or rebuild the page from the current shell source
- preserve the same `PostId`
- preserve the intended public URL/slug where feasible
- write a new binding operation record
- update version lineage

### 5. Archive / withdraw
- the post remains authoritative
- page behavior is rule-based:
  - remain published but suppressed from rollups, or
  - be archived/withdrawn from the site if governance requires it

## Required binding rules

1. `PostId` is the primary cross-system key
2. `TargetSiteUrl` must always be Project Spotlight
3. `TargetSiteKey` must always be `projectSpotlight`
4. `PageUrl`, `PageName`, and `PageId` must be stored explicitly after publish
5. `TemplateKey`, `TemplateVersion`, `PageShellKey`, and `PageShellVersion` must be traceable
6. Recovery from failed sync must be possible without re-authoring the post
7. Regeneration must never silently break the durable post-to-page relationship

## Recommended page-path rule

The shell source lives at:

- `SitePages/Templates/Project-Spotlight---In-Progress.aspx`

Generated destination pages should be created at the Project Spotlight site using a durable page name such as:

- `SitePages/{Slug}.aspx`

If implementation later adopts a foldered page convention, that should be a deliberate rule and not an accidental side effect of the shell source location.

## Shell-resolution model

The page shell is chosen from:

- `PageShellKey`
- `SourceTemplatePath`
- `AppliedShellVersion`

The final business/content profile is chosen from:

- `TemplateKey`
- `AppliedTemplateVersion`

The shell decides **where the blocks go**.
The template decides **which rules apply to that post family**.

## Current shell content-injection map

### Banner
Inject into the OOB Page Title / banner block:
- title
- banner image
- banner alt text
- publish-date visibility flag
- gradient / layout-related settings when template allows

### Subhead text block
Inject:
- `Subhead`

### Body text block
Inject:
- `BodyRichText`

### Team Viewer block
Inject:
- `PostId`
- fixed destination key
- optional list-host override
- layout / density / feature flags
- display heading

### Gallery block
Inject:
- ordered gallery images derived from media child rows

## Binding-status model

Recommended statuses:
- `previewOnly`
- `published`
- `archived`
- `withdrawn`
- `error`

Recommended sync statuses on the post row:
- `pending`
- `inSync`
- `error`
- `staleShell`
- `staleTemplate`

## Failure-recovery posture

If publish fails after the page is partially created:

- keep the binding/error record
- preserve the partially known page id/url if one exists
- allow safe retry
- do not force authors to recreate the post

## Future-proofing notes

The binding schema may need extension when:

- multiple active page shells exist
- a future shell replaces the OOB banner with `hbSignatureHero`
- preview becomes page-backed
- replacement-page rollovers are supported for major shell changes
