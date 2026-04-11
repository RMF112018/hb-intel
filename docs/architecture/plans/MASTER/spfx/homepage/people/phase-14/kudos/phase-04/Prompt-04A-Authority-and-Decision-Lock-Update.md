# Prompt 04A — Authority and Decision-Lock Update

You are working in the live local repo for `hb-intel`.

Prompts 01–04 from the prior HB Kudos production-mode package have already been executed.

Your job now is to implement a **production permission authority correction** before final validation/packaging.

## Objective

Update the HB Kudos implementation and governing repo documentation so that production permissions for the companion app are controlled by **one canonical source of truth only**:

- Entra ID security group membership in:
  - `HB Kudos Admins`
  - `HB Kudos Reviewers`

There must be no permission ambiguity and no second source of truth.

## Locked production facts

Admin / reviewer communications site:
- `https://hedrickbrotherscom.sharepoint.com/sites/HBKudosAdminReview`

Public-facing host site:
- `https://hedrickbrotherscom.sharepoint.com/sites/HBCentral`

Canonical list host site:
- `https://hedrickbrotherscom.sharepoint.com/sites/HBCentral`

Lists:
- `People Culture Kudos`
- `Kudos Audit Events`

## Required changes

1. Update the governing documentation / decision locks to reflect that:
   - canonical production permission source = Entra ID security group membership only
   - `HB Kudos Admins` and `HB Kudos Reviewers` are the production authority groups
   - permission-related property-pane inputs are not valid production controls
   - `simulatedRole` is dev-only and retired from production authority resolution

2. Update any prompt-package or repo docs that still imply page-author-configured permission fields are an acceptable production model.

3. Add or update a concise repo note that explicitly states:
   - production permission authority is centralized
   - page/webpart configuration must not alter governance access

## Deliverables

- updated decision-lock / authority docs in the repo
- a brief implementation note documenting the new production authority model
- a concise summary of exactly what changed and which files were updated

## Constraints

- Do not perform unrelated refactors.
- Do not leave “temporary” language in the final production locks.
- Be explicit and final in the wording.

