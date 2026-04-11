# Prompt 01 — Authority and Production-Mode Lock

You are working in the local live repo with direct file-system access.

## Objective

Identify and eliminate every dev-mode behavior that prevents the HB Kudos implementation from being considered production-safe in the locked environment.

## Primary authority

Treat repo truth as authoritative.
Do not trust comments or manifests by themselves.

Use all of the following as governing sources:

- the live repo
- this prompt package
- the current Kudos implementation files
- the current `@hbc/ui-kit`
- the current doctrine under `docs/reference/ui-kit/`

## Locked environment facts

- Admin companion host: `https://hedrickbrotherscom.sharepoint.com/sites/HBKudosAdminReview`
- Public host: `https://hedrickbrotherscom.sharepoint.com/sites/HBCentral`
- Canonical list host: `https://hedrickbrotherscom.sharepoint.com/sites/HBCentral`
- Admin role source: `HB Kudos Admins`
- Reviewer role source: `HB Kudos Reviewers`

## Immediate tasks

1. Audit the current Kudos files and identify every dev-only or simulation-only production blocker.
2. Produce a short repo-truth note before edits that identifies:
   - where `simulatedRole` is used
   - where current-site assumptions exist
   - where canonical list-host assumptions are missing
   - where property-pane defaults are unsafe for production
   - where comments/descriptions overstate completion
3. Replace prompt-era / dev-era production blockers with a real production architecture.

## Required outcomes

You must leave the repo in a state where:

- the companion no longer depends on `simulatedRole` for real access
- production code has a real identity model
- production code has an explicit site model
- production behavior is understandable from code without prompt archaeology

## Non-negotiable constraints

- Do not preserve `simulatedRole` as the live production path.
- Do not leave the list host ambiguous.
- Do not leave the admin/public site split implicit.
- Do not introduce weak ad hoc local UI when shared homepage-safe primitives are the right fit.
- Do not broaden scope beyond production hardening unless the fix is directly required.

## Deliverables for this prompt

- repo-truth findings note
- implementation changes that remove the dev-mode production blockers
- concise summary of what changed and why
