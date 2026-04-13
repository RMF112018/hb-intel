# 01 — Full-Detail Product and Content Model

## 1. Product vision

The **HB Article Publisher** is a centralized editorial product that gives the marketing team a controlled, high-quality publishing experience while distributing finished branded articles to multiple destination sites.

The product must support:

- centralized authoring
- structured editorial inputs
- destination-specific rendering
- featured article controls
- controlled lifecycle states
- durable page URLs
- extensibility for new destination article types and rendering modules

## 2. Destination products

### CompanyPulse
Purpose:
- general company news
- updates
- announcements
- feature stories

Likely traits:
- strong hero presence
- body-forward storytelling
- team block usually optional
- gallery optional
- more editorial/newsroom tone

### ProjectSpotlight
Purpose:
- recurring project spotlights
- milestone spotlights
- project updates
- project storytelling

Likely traits:
- strong hero presence
- project metadata relevance
- `teamViewer` often important
- gallery more common
- more structured project narrative

## 3. Author experience

The author should:

1. enter article content
2. identify destination and content type
3. supply images and optional team members
4. preview the resolved template
5. save draft, submit for review, schedule, or publish
6. never need to manually compose the destination page canvas

## 4. Content model layers

### Layer A — Article master record
One authoritative record per article.

Contains:
- article identity
- destination
- content type
- core text content
- hero-driving fields
- promotion/workflow state
- page binding fields
- rendering inputs and flags

### Layer B — Child relationship records
Support related content families:

- team members
- media
- future related links / milestones / callouts if needed

### Layer C — Template registry
Defines:
- which template applies
- required and optional fields
- which blocks are shown
- which webpart profiles are used
- template-specific validation

### Layer D — Destination page shell
A page on the destination site bound to the article and configured to render the correct composition.

## 5. Template-driven rendering model

Template selection should be rule-driven using:

- destination
- content type
- article subject
- project stage
- spotlight type
- optional manual override

The author should not choose render composition manually in ordinary workflows.

## 6. Core content blocks

### Required conceptual blocks
- signature hero
- article body
- secondary image
- image gallery
- optional team viewer
- optional destination-specific supporting modules

### Current implementation target
- `hbSignatureHero`
- `teamViewer`
- OOB text
- OOB image
- OOB image gallery

## 7. Editorial states

The system should support at least:

- draft
- in review
- approved
- scheduled
- published
- archived
- withdrawn

## 8. Promotion model

Articles may independently control:

- featured behavior
- feed inclusion
- landing-page inclusion
- pinned behavior
- manual sort order
- archive visibility
- campaign windowing

## 9. Evolution rule

Fields tied to `hbSignatureHero`, `teamViewer`, or any future branded rendering component must be treated as **contract-driven but revisable**.

This package intentionally includes notes that:
- hero-related fields may need to change after `hbSignatureHero` is updated for multi-application use
- team-related fields may need to change after `teamViewer` is created and validated
- template-specific required fields may also change when shared component capabilities expand
