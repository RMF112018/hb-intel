# Prompt 04C — Security-Group-Only Permission Resolution

You are working in the live local repo for `hb-intel`.

Prompts 01–04 and follow-on 04A / 04B have been executed.

## Objective

Ensure that all HB Kudos companion access and governance permissions are resolved **solely from real security group membership** in the canonical production groups:

- `HB Kudos Admins`
- `HB Kudos Reviewers`

## Required production behavior

1. The companion app must determine whether the current user is:
   - admin
   - reviewer
   - neither

2. That determination must come from real membership in the canonical security groups.

3. UI gating and action/mutation enforcement must both use the same resolved capability model.

4. No production codepath may rely on:
   - `simulatedRole`
   - property-pane group-name inputs
   - loose text matching from editable page configuration

## Implementation expectations

Audit current repo truth first, then implement the cleanest production-safe approach.

The resulting implementation should:
- centralize group-authority resolution
- centralize capability derivation
- keep consumer/webpart files thin
- avoid duplicated authorization logic between surfaces
- ensure action writers cannot be invoked by unauthorized users through stray UI/state paths

## Site / environment facts

Admin / reviewer host site:
- `https://hedrickbrotherscom.sharepoint.com/sites/HBKudosAdminReview`

Public host site:
- `https://hedrickbrotherscom.sharepoint.com/sites/HBCentral`

Canonical list host site:
- `https://hedrickbrotherscom.sharepoint.com/sites/HBCentral`

## Guidance

- Prefer a single authoritative permissions helper/service/module over scattered checks.
- Prefer stable production identifiers/mechanisms where repo truth supports them.
- Ensure the companion still works correctly in the split-site topology.
- Be explicit about any assumptions you had to make.

## Deliverables

- production-safe security-group-based permission resolver
- updated capability wiring used by both UI gating and governance actions
- removal/retirement of any production authority dependency on dev simulation
- concise summary of the final runtime authority model

