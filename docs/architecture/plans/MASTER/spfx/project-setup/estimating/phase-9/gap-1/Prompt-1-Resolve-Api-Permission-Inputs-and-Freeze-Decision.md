# Prompt 1 — Resolve API Permission Inputs and Freeze Decision

## Objective

Determine the exact custom API permission request values required for the Project Setup Requests SPFx package and freeze that decision in a documented, evidence-backed form.

## Scope

This prompt is limited to determining:
- the exact API app `resource` value to use in `solution.webApiPermissionRequests`
- the exact delegated `scope` value to request
- whether current repo truth actually supports those values

Do not implement the package-solution change in this prompt.

## Working rules

- Treat live repo truth as authoritative.
- Do not re-read files that are already in your active context or memory unless needed to verify a contradiction or capture exact evidence.
- Do not guess the `resource` or `scope`.
- If multiple plausible values exist, compare them and identify which is best supported by repo truth.
- If the values cannot be determined truthfully, stop and document the blocker rather than inventing a manifest entry.

## Files to inspect first

1. `apps/estimating/src/mount.tsx`
2. `apps/estimating/src/config/runtimeConfig.ts`
3. `packages/auth/src/spfx/apiTokenProvider.ts`
4. `tools/spfx-shell/src/webparts/shell/ShellWebPart.ts`
5. `tools/build-spfx-package.ts`
6. Any repo docs describing:
   - Entra/API app registration
   - API audience
   - exposed scopes
   - SPFx API approval flow
7. `docs/architecture/reviews/project-setup-spfx-permission-declaration-gap-validation.md`

## Tasks

1. Identify the exact custom API app registration the Project Setup solution is intended to call.
2. Determine the exact `resource` string expected by `webApiPermissionRequests`.
3. Determine the exact delegated `scope` string that should be requested.
4. Verify whether repo truth supports those values directly or only indirectly.
5. Document any ambiguity or contradiction found in repo docs or config.
6. Freeze the recommended values in a short decision note.

## Required output

Create or update a decision note at:

`docs/architecture/reviews/project-setup-gap-1-permission-input-freeze.md`

The note must include:
- executive summary
- candidate `resource` values considered
- candidate `scope` values considered
- exact recommended `resource`
- exact recommended `scope`
- why those values are correct
- exact files/evidence used
- any blockers or unresolved questions

## Acceptance criteria

- The exact `resource` value is identified or a blocker is documented.
- The exact delegated `scope` value is identified or a blocker is documented.
- The decision note is specific enough that Prompt 2 can implement the manifest change without redoing discovery.
- No package config is edited yet.
