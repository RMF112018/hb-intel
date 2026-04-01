# Prompt 2 — Implement SPFx Permission Declaration

## Objective

Implement the missing `solution.webApiPermissionRequests` declaration in the authoritative estimating package config using the exact `resource` and `scope` values frozen in Prompt 1.

## Scope

This prompt is limited to the authoritative config change and any tiny directly-related supporting edit required to preserve single-source-of-truth behavior.

Do not perform full package verification or broad documentation reconciliation in this prompt.

## Working rules

- Treat the Prompt 1 decision note as the required source for `resource` and `scope`.
- Do not guess or substitute values.
- Do not duplicate the change in downstream generated files if those files are overwritten by the build.
- Keep the implementation minimal and auditable.
- Do not broaden into auth refactoring or unrelated packaging cleanup.
- Do not re-read files that are already in your active context or memory unless needed to verify a contradiction or capture exact edit context.

## Files to inspect first

1. `docs/architecture/reviews/project-setup-gap-1-permission-input-freeze.md`
2. `apps/estimating/config/package-solution.json`
3. `tools/build-spfx-package.ts`
4. `tools/spfx-shell/config/package-solution.json`

## Tasks

1. Confirm which `package-solution.json` is authoritative for the Project Setup package build.
2. Add the required `solution.webApiPermissionRequests` entry to the authoritative estimating config.
3. Verify that no secondary direct edit is needed in a generated/copied shell config.
4. Keep the JSON formatting and file conventions consistent with the repo.
5. Add a brief implementation note to the Prompt 1 decision file or a directly related review file if needed.

## Required files to change

Required target:
- `apps/estimating/config/package-solution.json`

Only edit additional files if needed to preserve truthful documentation of the implementation.

## Required output

Provide a concise summary stating:
- exact file changed
- exact `resource` value implemented
- exact `scope` value implemented
- why this is the authoritative source file

## Acceptance criteria

- `solution.webApiPermissionRequests` exists in the authoritative estimating config.
- The entry uses the exact `resource` and `scope` from Prompt 1.
- No duplicated edit is made in a file that the build overwrites.
- The implementation is ready for package verification in Prompt 3.
