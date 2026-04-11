# Plan Summary — HB Kudos Dev-to-Production Move

## Objective

Move the current HB Kudos surfaces from development / simulation mode into a production-safe SharePoint deployment model using the locked environment:

- admin companion hosted on `HBKudosAdminReview`
- public-facing Kudos hosted on `HBCentral`
- both Kudos lists hosted on `HBCentral`
- reviewer/admin access grounded in the existing `HB Kudos Admins` and `HB Kudos Reviewers` Entra security groups already assigned on the admin communication site

## Core repo-truth production questions

The agent must answer these before making final changes:

1. Where is `simulatedRole` still active in code, manifests, property pane logic, tests, or comments?
2. What is the current real behavior of `kudosAdminsGroup` / `kudosReviewersGroup`?
3. Does current site resolution assume the companion is hosted on the same site as the lists?
4. Can the current list reader/writer/timeline path operate against `HBCentral` when the companion runs on `HBKudosAdminReview`?
5. What exact runtime path determines:
   - read access
   - governance action writes
   - audit timeline reads
   - detail-panel role safety
   - public visibility
6. What properties are currently safe for production and what properties are still dev-only?
7. What packaging/build/version signals must be updated before release?

## Intended production architecture

### Public site (`HBCentral`)
- host the public-facing `HB Kudos` webpart
- read from `People Culture Kudos`
- read from `Kudos Audit Events` only where timeline/detail logic requires it
- never expose reviewer/admin-only governance controls to ordinary viewers

### Admin site (`HBKudosAdminReview`)
- host the `HB Kudos Approval Companion`
- derive runtime role from the real site/group identity model
- perform governance actions against the canonical HB Kudos lists hosted on `HBCentral`
- render admin/reviewer-specific detail and action surfaces only when role resolution proves they are allowed

### Canonical list host
- `https://hedrickbrotherscom.sharepoint.com/sites/HBCentral`

This must become an explicit production concept in the code. The implementation may not continue to rely on ambiguous “current site” assumptions for list reads/writes from the companion.

## Production mode workstreams

### Workstream A — authority and dev-mode shutdown
- remove production reliance on `simulatedRole`
- preserve any dev/test simulation only behind an explicit, non-production-safe path if absolutely necessary
- ensure manifests/property-pane defaults no longer imply dev-only behavior in production

### Workstream B — identity and permissions
- implement real reviewer/admin resolution
- wire role resolution to the actual admin-site environment and configured group names
- ensure the companion denies access safely when the current user is not authorized

### Workstream C — admin-site hosting and cross-site data access
- make the companion operate from `HBKudosAdminReview`
- make the reader/writer/timeline path explicitly target `HBCentral`
- validate all list calls under production site boundaries

### Workstream D — public webpart production hardening
- keep the public-facing Kudos surface on `HBCentral`
- validate submit/detail/archive/celebrate behavior
- tighten production-safe UX, error handling, and shared-surface discipline

### Workstream E — packaging and release closure
- validate manifests, mounting, build output, package freshness, and runtime configuration
- produce final closure evidence

## Non-negotiable production rules

- No production behavior may depend on `simulatedRole`.
- No governance writes may target the wrong site.
- No companion read/write path may assume the list host equals the current page site.
- No admin/reviewer access may be inferred loosely from UI state alone.
- No “complete” claim is valid without build/package proof.
- No stale comments or manifest descriptions may be left behind if they contradict final behavior.
