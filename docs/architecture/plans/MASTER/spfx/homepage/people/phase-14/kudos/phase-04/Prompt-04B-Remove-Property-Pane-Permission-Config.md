# Prompt 04B — Remove Property-Pane Permission Config

You are working in the live local repo for `hb-intel`.

Prompts 01–04 from the prior package have already been executed. Prompt 04A has now updated the decision locks.

## Objective

Remove all permission-related editable property-pane fields from the HB Kudos production webparts so permissions are no longer configurable per webpart instance.

## Production rule

Permission authority must not depend on property-pane values such as:
- `simulatedRole`
- `kudosAdminsGroup`
- `kudosReviewersGroup`
- or any equivalent per-instance permission override field

## Required work

1. Inspect the current companion and related webpart manifests / property-pane definitions.
2. Remove any permission-related editable fields from the production property pane.
3. Remove any manifest defaults or descriptions that imply page authors configure admin/reviewer permissions.
4. Retain only non-permission-related properties that are still genuinely needed.
5. Update user-facing manifest descriptions so they no longer suggest property-based permission assignment.
6. Ensure there are no codepaths that expect these removed property values at runtime.

## Important

- This is not just a visual cleanup. Remove the actual production dependency on those fields.
- If a dev/test-only override mechanism still needs to exist for local-only engineering workflows, isolate it behind a clearly non-production path and ensure it is not part of the shipped production configuration surface.
- Default posture: remove, not hide.

## Deliverables

- updated manifests / property pane definitions
- updated runtime types/interfaces if needed
- updated comments describing the new non-configurable production model
- concise summary of what permission-related fields were removed

