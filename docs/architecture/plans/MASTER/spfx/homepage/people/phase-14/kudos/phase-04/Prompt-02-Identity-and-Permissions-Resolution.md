# Prompt 02 — Identity and Permissions Resolution

You are working in the local live repo with direct access to all relevant source files.

## Objective

Replace dev-mode role simulation with real production identity and permissions resolution for the `HB Kudos Approval Companion`.

## Production role model

The production environment is already established as:

- `HB Kudos Admins` — Entra security group with admin authority on `HBKudosAdminReview`
- `HB Kudos Reviewers` — Entra security group with reviewer/owner authority on `HBKudosAdminReview`

Your implementation must use the real environment above.

## Repo-truth questions to answer first

1. What does the current role resolution path actually do?
2. Where are `kudosAdminsGroup` and `kudosReviewersGroup` consumed today?
3. Can the current SPFx/browser/runtime path determine user membership in the required production authorities directly?
4. If not, what is the safest production-capable resolution path available in this repo/runtime?

## Required implementation target

Implement a production-safe role-resolution path that supports:

- `admin`
- `reviewer`
- `viewer` / no-governance-access

The final path must not depend on `simulatedRole`.

## Preferred implementation posture

Choose the strongest feasible production path based on repo truth and runtime feasibility.

Use this order of preference:

1. **Real same-site permission/group resolution** if the current runtime can reliably distinguish the production authorities from the site/group model already assigned on `HBKudosAdminReview`.
2. **Explicit group-name resolution** using `kudosAdminsGroup` / `kudosReviewersGroup` if that can be made reliable in the SPFx runtime.
3. **A production-safe fallback design** only if the stronger paths are not technically achievable without additional tenant/app permissions.

If you must use a fallback, document exactly why.

## Required behaviors

- unauthorized users must see the restricted state
- reviewer users must receive reviewer capabilities only
- admin users must receive admin capabilities
- the implementation must fail closed, not open
- detail-panel actions must follow the resolved capabilities
- bulk actions must follow the resolved capabilities
- no governance action may be dispatched unless the resolved capabilities allow it

## Property-pane / config rules

You must decide whether to:
- keep `kudosAdminsGroup` / `kudosReviewersGroup` as explicit configurable properties, or
- lock them to the known production values

Whichever you choose, production behavior must be deterministic and validated.

If configurable values remain:
- validate them
- do not allow blank production operation without an intentional fallback
- update manifest/property descriptions accordingly

## Non-negotiable constraints

- No production access path may rely on `simulatedRole`.
- No UI-only role label may be treated as proof of access.
- Do not leave the role model half-converted.
- Do not widen permissions beyond what production requires.

## Deliverables for this prompt

- implemented production role-resolution path
- updated companion access gating
- updated property/config behavior if needed
- concise note documenting the final role-resolution strategy
