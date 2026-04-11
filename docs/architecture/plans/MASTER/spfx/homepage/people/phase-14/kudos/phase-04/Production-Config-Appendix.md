# Production Configuration Appendix

## Locked site model

### Admin companion host
- URL: `https://hedrickbrotherscom.sharepoint.com/sites/HBKudosAdminReview`

### Public host
- URL: `https://hedrickbrotherscom.sharepoint.com/sites/HBCentral`

### Canonical list host
- URL: `https://hedrickbrotherscom.sharepoint.com/sites/HBCentral`

### Lists
- `People Culture Kudos`
  - `https://hedrickbrotherscom.sharepoint.com/sites/HBCentral/Lists/People%20Culture%20Kudos/Compact.aspx`
- `Kudos Audit Events`
  - `https://hedrickbrotherscom.sharepoint.com/sites/HBCentral/Lists/Kudos%20Audit%20Events/AllItems.aspx`

## Locked role model

The agent must treat these as the production role authorities supplied by the user:

- `HB Kudos Admins` — Entra security group already assigned as communication site Admin on `HBKudosAdminReview`
- `HB Kudos Reviewers` — Entra security group already assigned as communication site Owners on `HBKudosAdminReview`

## Expected production properties / config behavior

The agent must determine the best durable production model, but at minimum:

### Companion webpart
- `heading` may remain configurable
- `kudosAdminsGroup` must be meaningful in production if retained
- `kudosReviewersGroup` must be meaningful in production if retained
- `simulatedRole` must not remain the live production access path

### Public webpart
- `heading` may remain configurable
- `showArchive` may remain configurable if still product-valid
- no reviewer/admin simulation config should exist on the public webpart

## Required production configuration decisions

The agent must explicitly decide and implement:

1. whether `kudosAdminsGroup` / `kudosReviewersGroup` remain as explicit property-pane inputs or become locked defaults tied to the known production environment
2. how the companion resolves the current user against the admin-site group model
3. how the companion resolves the canonical list-host site URL
4. whether cross-site list access should be:
   - explicit in code via a canonical site URL constant / config
   - property-pane configurable with strict validation
   - environment-backed and locked for production
5. how dev-only simulation is removed or isolated from production behavior

## Closure expectation

The final implementation must leave behind a clear, documented production configuration model that another maintainer can understand without reverse-engineering prompt history.
