# 05 — Prompt: Build Hero Banner Admin App

Implement the Hero Banner Admin app as a separate closure unit.

## Mandatory operating instruction

**Do not re-read files that are already in your active context unless needed to confirm drift, dependencies, or uncertainty after changes.**

## Strict governing authority

Maintain strict compliance with:

1. `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Governing-Standard.md`
2. `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Homepage-Overlay.md`

Strict compliance must be visible in:
- page-canvas ownership
- host-aware layout
- import discipline
- accessibility
- authoring safety
- non-generic premium SPFx quality
- validation and closure rigor

## Objective

Create a **site-admin-managed Hero Banner Admin app** hosted at:

`https://hedrickbrotherscom.sharepoint.com/sites/HBCentral/SitePages/Homepage-Admin.aspx`

This admin app must allow controlled editing of the canonical Hero Banner configuration for the public HBCentral homepage at:

`https://hedrickbrotherscom.sharepoint.com/sites/HBCentral`

## Governing posture

This admin app must be benchmark-grade in seriousness and closure discipline, but it must **not** become visually interchangeable with HB Kudos.

Persona target:
- operational
- admin-safe
- efficient
- clear
- confidence-building

## Required capabilities

At minimum support:

- loading current live Hero Banner config
- editing headline / banner title
- editing message
- editing eyebrow
- editing metadata
- editing background image URL
- editing primary CTA
- editing secondary CTA
- previewing the configured result
- saving the canonical config
- success state
- error state
- dirty-state awareness
- cancel/discard guard if unsaved edits exist

## Recommended architecture

Unless repo truth forces otherwise:

- implement as a dedicated admin/companion-style SPFx surface
- write to the same canonical config source used by the public Hero Banner
- use explicit typed draft/view-model mapping
- isolate read/write helpers from the UI composition
- refresh or invalidate cached public config after write where required

## Required scope

Inspect and update as needed:

- the new admin app/webpart folder
- adjacent manifest
- shell mount wiring
- any config list read/write helpers
- any shared local admin-form helpers if warranted
- package/build inclusion seams

## UX requirements

The admin app must provide:

- deliberate field grouping
- clear labels and descriptions
- credible loading/empty/error states
- no browser-native `prompt/confirm` shortcuts
- visible save/cancel semantics
- preview that is useful without being overbuilt
- keyboard/focus-visible credibility

## Hard rules

- Do not clone the Kudos composer layout or emotional tone.
- Do not create a fake shell inside SharePoint page content.
- Do not let writes target ambiguous or non-canonical locations.
- Do not leave save behavior without read-after-write proof.
- Do not broaden the admin app into a generic CMS beyond what the Hero Banner needs.
- Do not treat doctrine as optional.

## Validation requirements

Prove:
- the admin app can load the canonical config
- edits persist correctly
- the preview reflects edited values
- after save, the public Hero Banner on `https://hedrickbrotherscom.sharepoint.com/sites/HBCentral` resolves the updated values
- dirty-state and error-state behavior are credible
- the admin app is suitable for its actual host page at `.../SitePages/Homepage-Admin.aspx`

## Required deliverable format

Return a concise closure report with:

1. Objective
2. Doctrine-Compliance Check
3. Admin-App Architecture
4. Files Added or Changed
5. Write-Seam Summary
6. UX States Implemented
7. Validation Performed
8. Residual Risks
