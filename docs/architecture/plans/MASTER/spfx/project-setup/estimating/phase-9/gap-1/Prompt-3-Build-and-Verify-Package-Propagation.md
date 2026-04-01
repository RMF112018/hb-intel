# Prompt 3 — Build and Verify Package Propagation

## Objective

Rebuild the Project Setup SPFx package and verify that the newly added `solution.webApiPermissionRequests` declaration survives the full packaging path into deployable artifact truth.

## Scope

This prompt is limited to build verification, artifact inspection, and recording the verification evidence.

Do not broaden into unrelated packaging cleanup unless a direct blocker is discovered.

## Working rules

- Treat the authoritative estimating config as the source of truth.
- Verify actual outputs; do not infer propagation.
- If the declaration is stripped, overwritten, or mutated, stop and document the exact source of the problem.
- Do not re-read files that are already in your active context or memory unless needed to verify a contradiction or capture exact evidence.

## Files and outputs to inspect

1. `apps/estimating/config/package-solution.json`
2. `tools/build-spfx-package.ts`
3. `tools/spfx-shell/config/package-solution.json`
4. Build output package path for the Project Setup `.sppkg`
5. Any extracted/inspected artifact files needed to confirm the declaration survives packaging

## Tasks

1. Run the Project Setup SPFx package build.
2. Confirm the shell-side copied/generated package config includes the same declaration.
3. Inspect the resulting `.sppkg` and confirm the declaration is present in the packaged flow as expected.
4. Confirm the build does not strip, rewrite, or invalidate the declaration.
5. Confirm no new runtime-config or packaging regression is introduced by the change.
6. Record the verification results in a review document.

## Required output

Update one of the following with build/package verification evidence:
- `docs/architecture/reviews/project-setup-spfx-permission-declaration-gap-validation.md`
- or `docs/architecture/reviews/project-setup-gap-1-implementation-closure.md`

The verification section must include:
- build command(s) run
- whether the build succeeded
- where the declaration was observed in generated/copied config
- where the declaration was observed in packaged artifact truth
- whether any stripping or mutation occurred
- whether any regressions were observed

## Acceptance criteria

- The package build succeeds, or the exact build blocker is documented.
- The declaration is proven to survive the packaging path.
- Verification evidence is written clearly enough that Prompt 4 can update docs without redoing artifact inspection.
