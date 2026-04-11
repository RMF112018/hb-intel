# Plan Summary — HB Kudos Dev-to-Production Move

## Objective

Move the current HB Kudos surfaces from development / simulation mode into a production-safe SharePoint deployment model using the locked environment:

- admin companion hosted on `HBKudosAdminReview`
- public-facing Kudos hosted on `HBCentral`
- both Kudos lists hosted on `HBCentral`
- reviewer/admin access grounded solely in the existing `HB Kudos Admins` and `HB Kudos Reviewers` Entra security groups already assigned on the admin communication site
- no production permission authority remaining in editable property-pane access fields

## Core repo-truth production questions

The agent must answer these before making final changes:

1. Where is `simulatedRole` still active in code, manifests, property pane logic, tests, or comments?
2. Where do editable permission-related property-pane fields still exist, and what currently consumes them?
3. Does current permission resolution already use real security-group membership anywhere, or is authority still split across simulation/config?
4. Does current site resolution assume the companion is hosted on the same site as the lists?
5. Can the current list reader/writer/timeline path operate against `HBCentral` when the companion runs on `HBKudosAdminReview`?
6. What exact runtime path determines:
   - read access
   - governance action writes
   - audit timeline reads
   - detail-panel role safety
   - public visibility
   - reviewer/admin capability derivation
7. What properties are currently safe for production and what properties must be removed from the property pane?
8. What documentation must be added so users understand that permissions come from Entra security-group membership, not webpart settings?
9. What packaging/build/version signals must be updated before release?

## Intended production architecture

### Public site (`HBCentral`)
- host the public-facing `HB Kudos` webpart
- read from `People Culture Kudos`
- read from `Kudos Audit Events` only where timeline/detail logic requires it
- never expose reviewer/admin-only governance controls to ordinary viewers

### Admin site (`HBKudosAdminReview`)
- host the `HB Kudos Approval Companion`
- derive runtime role from real security-group membership
- perform governance actions against the canonical HB Kudos lists hosted on `HBCentral`
- render admin/reviewer-specific detail and action surfaces only when role resolution proves they are allowed

### Canonical list host
- `https://hedrickbrotherscom.sharepoint.com/sites/HBCentral`

This must become an explicit production concept in the code. The implementation may not continue to rely on ambiguous “current site” assumptions for list reads/writes from the companion.

### Canonical permissions source of truth

This is a final production decision, not a pending recommendation.

- `HB Kudos Admins`
- `HB Kudos Reviewers`

These Entra security groups are the sole production authority for companion access and governance permissions. This is locked and decided.

The implementation does not rely on editable per-instance permission fields in the webpart property pane. `simulatedRole`, `kudosAdminsGroup`, and `kudosReviewersGroup` are retired from production authority. Page/webpart configuration does not alter governance access.

## Production mode workstreams

### Workstream A — authority and dev-mode shutdown
- remove production reliance on `simulatedRole`
- preserve any dev/test simulation only behind an explicit, non-production-safe path if absolutely necessary
- ensure manifests/property-pane defaults no longer imply dev-only behavior in production

### Workstream B — identity and permissions
- implement real reviewer/admin resolution from the canonical Entra security groups
- remove permission authority from editable property-pane fields
- ensure the companion denies access safely when the current user is not authorized
- ensure UI gating and mutation enforcement use the same role result

### Workstream C — admin-site hosting and cross-site data access
- make the companion operate from `HBKudosAdminReview`
- make the reader/writer/timeline path explicitly target `HBCentral`
- validate all list calls under production site boundaries

### Workstream D — public webpart production hardening
- keep the public-facing Kudos surface on `HBCentral`
- validate submit/detail/archive/celebrate behavior
- tighten production-safe UX, error handling, and shared-surface discipline

### Workstream E — permissions documentation and operator clarity
- document in plain language that webpart permissions come from Entra security-group membership
- briefly explain the difference between `HB Kudos Admins` and `HB Kudos Reviewers`
- document, in layman's terms, how an authorized tenant/site admin updates group membership through Entra when personnel changes are needed
- ensure no remaining product copy suggests users can manage permissions through the webpart settings panel

### Workstream F — packaging and release closure
- validate manifests, mounting, build output, package freshness, and runtime configuration
- produce final closure evidence

## Non-negotiable production rules

- No production behavior may depend on `simulatedRole`.
- No governance writes may target the wrong site.
- No companion read/write path may assume the list host equals the current page site.
- No admin/reviewer access may be inferred loosely from UI state alone.
- No editable property-pane fields may remain as permission authority in production.
- No user/operator should need to open the property pane to understand or change access.
- No “complete” claim is valid without build/package proof.
- No stale comments or manifest descriptions may be left behind if they contradict final behavior.
