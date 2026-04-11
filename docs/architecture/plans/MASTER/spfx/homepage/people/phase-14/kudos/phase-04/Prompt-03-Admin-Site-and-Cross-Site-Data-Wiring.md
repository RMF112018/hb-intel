# Prompt 03 — Admin-Site Hosting and Cross-Site Data Wiring

You are working in the local live repo.

## Objective

Make the `HB Kudos Approval Companion` operate correctly from the admin communications site while reading and writing the canonical HB Kudos lists hosted on `HBCentral`.

## Locked site model

- Companion host site: `https://hedrickbrotherscom.sharepoint.com/sites/HBKudosAdminReview`
- Canonical list host site: `https://hedrickbrotherscom.sharepoint.com/sites/HBCentral`

This split is real and must be reflected explicitly in code.

## Repo-truth questions to answer first

1. Does the current reader path use current-site context for Kudos data?
2. Does the current writer path use current-site context for governance actions?
3. Does the current timeline path use current-site context?
4. Which helpers currently derive site URL and from where?
5. What breaks when the companion runs on `HBKudosAdminReview` but the lists live on `HBCentral`?

## Required implementation target

Refactor the companion-side read/write/timeline path so production behavior explicitly targets the canonical list host.

At minimum:
- list reads for companion operations must target `HBCentral`
- governance writes must target `HBCentral`
- audit timeline reads must target `HBCentral`
- current-site context may still be used where appropriate for the admin site itself, but not for the canonical list host assumption

## Implementation requirements

You must choose and implement the best-fit production model for canonical list-host resolution.

Possible acceptable patterns:
- a locked canonical site URL constant / config used by the Kudos data layer
- a strictly validated webpart property for canonical list-host site URL
- an environment-backed production config path already supported by repo truth

Whichever path you choose:
- it must be explicit
- it must be validated
- it must not silently fall back to the current site in production

## Validate the full path

Confirm and harden:
- public Kudos read path
- companion queue read path
- governance action write path
- audit timeline read path
- detail-panel behavior under the split-site model
- error handling when cross-site access is unavailable

## UI and shared-surface discipline

Do not use this prompt as an excuse to invent one-off UI.
Keep the UI changes narrow unless a production-safe UX improvement is directly required.

If repeated admin/workspace UI patterns are touched, prefer disciplined shared homepage-safe primitives where justified.

## Deliverables for this prompt

- explicit canonical list-host resolution in code
- companion read/write/timeline path updated for split-site production
- updated error handling for site-access failures
- concise note documenting the final site-resolution model
