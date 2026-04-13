# 01 — Full-Detail Product and Content Model

## 1. Product vision

The product is no longer a generalized multi-destination article publisher.

It is now a **Project Spotlight post publishing product** that gives authors a controlled publishing experience while generating a branded Project Spotlight page from a canonical XML page shell.

The product must support:

- centralized structured authoring
- Project Spotlight-only publishing
- XML-template-driven page generation
- project- and spotlight-aware template resolution
- durable page URLs
- explicit post-to-page bindings
- controlled lifecycle states
- extensibility for future shell and renderer evolution

## 2. Destination product

### Project Spotlight
Purpose:
- recurring project spotlights
- milestone spotlights
- progress updates
- project storytelling
- project-team and gallery-rich posts

Key traits in the current shell:
- strong banner presence
- structured project context
- a native place for `teamViewer`
- a native place for an image gallery
- body-forward narrative using OOB text blocks
- durable page identity on the Project Spotlight site

## 3. Author experience

The author should:

1. enter structured Project Spotlight post content
2. classify the post by post family, project stage, spotlight type, and article subject
3. add team members and gallery assets where applicable
4. preview the resolved shell and renderer profile
5. save draft, submit for review, schedule, publish, republish, or archive
6. never need to manually build the destination page canvas

## 4. Content model layers

### Layer A — Post master record
One authoritative record per Project Spotlight post.

Contains:
- post identity
- project context
- post family / spotlight classification
- core text content
- banner-driving values
- workflow and publish state
- page-binding values
- rendering and validation inputs

### Layer B — Child relationship records
Support variable-cardinality content:

- team members
- gallery/media items
- future structured sections only if later shell variants require them

### Layer C — Template registry
Defines:
- which Project Spotlight template applies
- which page shell applies
- block visibility
- renderer profile bindings
- validation profile bindings
- shell and template versioning

### Layer D — Canonical page shell
A Project Spotlight XML artifact that defines the base page structure for generated posts.

### Layer E — Bound destination page
A generated page on `ProjectSpotlight` that is created from the canonical shell and populated with the structured post record plus child rows.

## 5. Shell-driven rendering model

Template selection should be rule-driven using:

- `PostFamily`
- `SpotlightType`
- `ProjectStage`
- `ArticleSubject`
- optional admin override
- compatibility with the canonical Project Spotlight XML shell

The author should not manually choose page blocks in ordinary workflows.

## 6. Current shell block model

### Shell-owned blocks from the XML artifact
- banner / title region
- subheading text region
- body text region
- team viewer region
- image gallery region

### What the shell controls
- section order
- which content zones exist
- whether a zone is OOB or custom
- initial control properties
- baseline presentation rules

### What remains list-driven
- all editorial content
- post classifications
- team rows
- gallery rows
- workflow state
- page binding
- template/profile resolution

### What remains renderer-driven
- `teamViewer` display behavior
- any future `hbSignatureHero` behavior
- how structured post fields are transformed into individual page-control payloads

## 7. Editorial states

The system should support at least:

- draft
- in review
- approved
- scheduled
- published
- archived
- withdrawn

## 8. Promotion / rollup model

Because the system now targets Project Spotlight only, promotion logic should be scoped to Project Spotlight surfaces only.

Posts may independently control:

- featured behavior within Project Spotlight
- rollup inclusion
- pinned behavior
- manual sort order
- archive visibility
- optional campaign-window logic

This architecture intentionally removes destination-branching promotion logic.

## 9. Evolution rule

Fields tied to the banner/hero region, `teamViewer`, OOB gallery behavior, or future shell variants must be treated as **contract-driven but revisable**.

This package intentionally preserves explicit evolution notes because:

- the current canonical shell uses the OOB Page Title / banner control
- a later shell may replace that with `hbSignatureHero`
- `teamViewer` will likely mature after production validation
- Project Spotlight shell families may expand beyond the current **In Progress** shell
