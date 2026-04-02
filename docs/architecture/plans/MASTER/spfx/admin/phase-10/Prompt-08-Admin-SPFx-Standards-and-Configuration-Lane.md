# Prompt-08 — Admin SPFx Standards and Configuration Lane

## Objective

Build the Admin SPFx operator-console lane for standards/configuration governance.

This should turn the Phase 10 backend into a usable admin workflow surface.

## Important execution rules

- The admin app remains the operator console, not the privileged executor.
- Reuse `@hbc/ui-kit` and existing admin shell patterns.
- Do not build a giant generic “settings” page with no domain structure.
- Keep protected/non-editable categories visibly separate from live-editable categories.

## Inputs

Use:
- existing admin app shell/routing/page patterns
- Prompt-02 baseline
- Prompt-03 taxonomy
- Prompt-07 admin APIs

## Required UI scope

Implement a dedicated standards/config lane with at least:

1. catalog / category navigation
2. current effective values view
3. source/provenance indicators
4. editable vs protected item distinction
5. history/version list
6. diff / preview surface
7. publish/revert actions where allowed
8. validation feedback for invalid changes
9. run/reference context where useful

## Routing / IA requirement

Update admin routing and navigation so Phase 10 adds a real standards/config lane rather than burying the feature inside the current access-control surface.

## Required UX behaviors

- protected values are clearly labeled and non-editable
- editable values show draft/current/published context if applicable
- provenance is understandable
- changes are not silent
- version history and diff are available without leaving the lane
- operator error states are explicit

## Suggested output areas

- `apps/admin/src/routes/**` or existing route locations
- `apps/admin/src/pages/**`
- `apps/admin/src/components/**`
- `packages/features/admin/**` only where reusable admin-intelligence components are appropriate
- `@hbc/ui-kit` only where a reusable cross-domain visual primitive clearly belongs there

## Documentation requirement

Update local admin docs or README material as needed to explain the new standards/config lane.

## Validation requirement

Run focused frontend tests or route/component validation consistent with repo patterns.

## Completion condition

Stop when the Admin app has a usable, routed standards/config lane aligned with backend functionality.
