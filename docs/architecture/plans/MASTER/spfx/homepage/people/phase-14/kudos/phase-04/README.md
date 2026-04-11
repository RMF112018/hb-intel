# HB Kudos — Dev-to-Production Prompt Package

## Objective

Move the current HB Kudos implementation from a prompt-era / dev-mode state into a production-safe SharePoint/SPFx implementation.

This package is written for a local code agent with direct access to the live local repo and full ability to inspect, edit, build, lint, test, and package the solution.

The package assumes all changes have already been pushed to the live repo `main` branch and that the local agent has direct repo access. The agent must treat live repo truth as authoritative and may not rely on stale prompt comments or manifest descriptions as proof.

## Production environment lock

The following environment details are locked and must be treated as factual inputs, not suggestions.

### Admin / governance site
- Site URL: `https://hedrickbrotherscom.sharepoint.com/sites/HBKudosAdminReview`
- Site type: communication site
- `HB Kudos Admins` is an Entra security group already assigned as the communication site Admin
- `HB Kudos Reviewers` is an Entra security group already assigned as the communication site Owners

### Public-facing site
- Site URL: `https://hedrickbrotherscom.sharepoint.com/sites/HBCentral`
- The public-facing HB Kudos webpart is hosted on this site

### HB Kudos SharePoint lists
- `Kudos Audit Events`
  - Canonical address: `https://hedrickbrotherscom.sharepoint.com/sites/HBCentral/Lists/Kudos%20Audit%20Events/AllItems.aspx`
  - Shared link: `https://hedrickbrotherscom.sharepoint.com/:l:/s/HBCentral/JACPwDHArCV8QKoVZQt5Hv6wAUm7NQ60C6MQz4NXBe5KGpE?e=SxsfkU`
- `People Culture Kudos`
  - Canonical address: `https://hedrickbrotherscom.sharepoint.com/sites/HBCentral/Lists/People%20Culture%20Kudos/Compact.aspx`
  - Shared link: `https://hedrickbrotherscom.sharepoint.com/:l:/s/HBCentral/JADSpB-wsSkRTrWBTLPQlRp5AcRG8tm2jCXMi1sPAHuQHb0?e=KGbmW8`

## Permissions source-of-truth lock

This is a final production decision, not a pending recommendation.

The production permissions model is locked to a single source of truth:

- `HB Kudos Admins`
- `HB Kudos Reviewers`

These are canonical Entra security groups. Companion access and governance permissions resolve solely from actual membership in these groups. Page/webpart configuration does not alter governance access.

This package does not support a production model where permission authority is configured per webpart instance through property-pane access fields.

### What this means
- Production access does not depend on `simulatedRole` — it is retired from production and dev-only.
- Production access does not depend on editable `kudosAdminsGroup` or `kudosReviewersGroup` fields — they are removed from the production property pane.
- The property pane retains only ordinary product settings (such as heading or archive behavior) and is not a permissions-authority surface.
- The implementation includes simple user/admin documentation that explains, in layman's terms:
  - which groups control access
  - what each group does
  - that permissions are changed by editing Entra group membership, not by editing webpart settings

## Current production blockers already visible from repo truth / uploaded artifacts

The agent must assume the following are likely real until disproven by repo truth:

1. The companion still uses a dev-mode `simulatedRole` path instead of real production role resolution.
2. The companion manifest exposes `kudosAdminsGroup` and `kudosReviewersGroup`, but the production decision is now to retire permission authority from the property pane.
3. The companion appears to read and write using the current site context helper pattern, but the production list host is `HBCentral`, not the admin site. Cross-site list access must therefore be made explicit and production-safe.
4. The public-facing webpart, companion webpart, archive experience, detail panel, timeline, and governance actions may still contain prompt-era local inline composition that needs to be tightened before production.
5. Packaging freshness and `.sppkg` alignment must be proven, not assumed.
6. The package docs themselves must be updated so they no longer imply configurable per-instance permission fields are part of the production model.

## What “production mode” means for this package

For this implementation, production mode means all of the following are true:

- no production access depends on `simulatedRole`
- real reviewer/admin access is derived from actual membership in `HB Kudos Admins` and `HB Kudos Reviewers`
- the companion is hard-bound to the admin communications site and no longer assumes the current site contains the HB Kudos lists
- list reads/writes/audit events point to the actual canonical list host site
- public-facing surfaces stay on `HBCentral`
- role gating, visibility, scheduling, prominence, actions, and detail rendering are enforced through real runtime conditions
- permission authority is not editable through property-pane group fields
- plain-language permissions documentation exists for site owners/admins
- production-safe empty/loading/error states exist
- no dev-only switches remain exposed as active production behavior
- build, lint, tests, package generation, manifest wiring, and runtime mounting all pass and are proven fresh
- the implementation remains compliant with `@hbc/ui-kit` and `docs/reference/ui-kit/`

## Required working method

The agent must:
- inspect current repo truth before changing anything
- identify every dev-only path that blocks production mode
- produce the narrowest durable architecture that matches the locked environment above
- prefer disciplined reuse of existing shared homepage-safe primitives where correct
- move repeated or durable UI patterns into shared layers when justified
- keep ordinary business logic, site resolution, permissions resolution, mutation calls, runtime wiring, and user/admin documentation local where appropriate
- validate every production assumption
- never leave “TODO production” behavior in place

## Package contents

- `Plan-Summary.md`
- `Production-Config-Appendix.md`
- `Prompt-01-Authority-and-Production-Mode-Lock.md`
- `Prompt-02-Identity-and-Permissions-Resolution.md`
- `Prompt-03-Admin-Site-and-Cross-Site-Data-Wiring.md`
- `Prompt-04-Public-Webpart-and-UX-Production-Hardening.md`
- `Prompt-05-Validation-Packaging-and-Release-Closure.md`

## Final required deliverables from the agent

At the end of this package, the agent must leave behind:

1. production-ready code
2. updated manifests and property-pane behavior where required
3. validated access model for admin vs reviewer vs ordinary viewer, grounded solely in security-group membership
4. validated cross-site list access model
5. validated public-site behavior
6. plain-language permissions documentation identifying the canonical source of truth and how to manage group membership in Entra
7. proof of build / lint / test / package freshness
8. a concise production-closure report
