# PH6.15 Cleanup — Resolution of Pre-Existing Test/Build Failures

**Version:** 1.0  
**Date:** 2026-03-07  
**Traceability Tag:** D-PH6-16  
**Reference:** `docs/architecture/plans/PH6-Provisioning-Plan.md` (final cleanup section)

## Objective

Resolve pre-existing TypeScript and pipeline failures (including TS6059 and TS6307) with minimal, targeted corrections that preserve monorepo architecture, package boundaries, backward compatibility, and existing TypeScript intent.

## Non-Negotiable Constraints

- No monorepo restructuring.
- No new dependencies unless explicitly approved.
- Preserve package public API contracts.
- Preserve existing TypeScript compiler intent (`strict`, emit settings, module targets).
- Apply the minimum change set required to eliminate root-cause failures.

## Allowed Files for This Cleanup

- `docs/architecture/plans/PH6.15.Cleanup.md`
- `packages/auth/tsconfig.json`
- `packages/data-access/tsconfig.json`
- `packages/provisioning/tsconfig.json`
- `packages/query-hooks/tsconfig.json`
- `packages/shell/tsconfig.json`
- `packages/ui-kit/tsconfig.json`
- `packages/app-shell/tsconfig.json`
- `docs/architecture/plans/PH6-Provisioning-Plan.md`

If diagnostics prove additional files are required, they must be added to this section before modification.

## Diagnostic Workflow (D-PH6-16)

1. Run targeted diagnostics for scoped packages:
   - `@hbc/functions`
   - `@hbc/models`
   - `@hbc/auth`
   - `@hbc/data-access`
   - `@hbc/provisioning`
2. Capture concrete failure signatures (error codes, package, command).
3. Inspect shared and package-local TypeScript config inheritance.
4. Confirm whether failures are caused by inherited workspace path aliasing into sibling `src` trees.
5. Verify minimal resolution strategy before editing.

## Root-Cause Analysis Template

- **Failure ID:** cleanup-2026-03-07-ts-paths
- **Symptoms:** TS6059 / TS6307 in package-local builds and type-checks.
- **Impacted Packages:** `@hbc/auth`, `@hbc/data-access`, `@hbc/provisioning`.
- **Primary Cause:** Inherited root-level `compilerOptions.paths` resolves `@hbc/*` imports to sibling package `src` files, conflicting with package-local `rootDir: "./src"` and `include: ["src"]`.
- **Why Existing Design Broke:** Local package compilation assumes dependency boundaries, while source-level aliasing pulls foreign source files into each project.
- **Minimal Fix Strategy:** Override inherited path alias resolution in impacted package `tsconfig.json` files using local `baseUrl` + empty `paths` map.
- **Safety Check:** Keep all other compiler options and package exports unchanged.

## Resolution Workflow (D-PH6-16)

1. Create this cleanup plan file and lock file-edit scope.
2. Apply minimal `tsconfig` overrides only to impacted packages.
3. Re-run targeted diagnostics exactly.
4. Run full monorepo verification:
   - `pnpm turbo run build`
   - `pnpm turbo run lint`
   - `pnpm turbo run check-types`
   - `pnpm turbo run test`
5. Update Phase 6 master success checklist.
6. Append dated progress notes for each major step.

## 6.15 Cleanup Checklist

- [x] 6.15.C1 Cleanup plan created with diagnostic and RCA workflow.
- [x] 6.15.C2 Root cause isolated with evidence for TS6059/TS6307.
- [x] 6.15.C3 Minimal `tsconfig` fixes applied to impacted packages only.
- [x] 6.15.C4 Targeted diagnostics pass for scoped packages.
- [x] 6.15.C5 Full monorepo build/lint/type-check/test pass with zero errors.
- [x] 6.15.C6 Phase 6 master success checklist updated.
- [x] 6.15.C7 Dated progress notes appended for each major step.

## Progress Notes

<!-- PROGRESS: 2026-03-07 D-PH6-16 major step 1 complete. Created PH6.15 cleanup plan with constraints, allowed-file guardrails, diagnostic workflow, root-cause template, and resolution checklist before applying any code/config changes. -->
<!-- PROGRESS: 2026-03-07 D-PH6-16 major step 2 complete. Isolated root cause to inherited workspace `paths` aliasing sibling `src` files into package-local TypeScript projects, producing TS6059/TS6307 under package `rootDir/include` boundaries. -->
<!-- PROGRESS: 2026-03-07 D-PH6-16 major step 3 in progress. Applied scoped tsconfig overrides for `@hbc/auth`, `@hbc/data-access`, and `@hbc/provisioning`; full-monorepo verification identified the same TS6059 signature in `@hbc/query-hooks`, so this package was added to the allowed-file list for the same minimal fix pattern. -->
<!-- PROGRESS: 2026-03-07 D-PH6-16 major step 4 in progress. Full-monorepo verification then surfaced a pre-existing `@hbc/shell` TS5055 declaration overwrite failure; extended allowed-file scope to include `packages/shell/tsconfig.json` for minimal path-resolution correction without architecture changes. -->
<!-- PROGRESS: 2026-03-07 D-PH6-16 major step 5 in progress. Full-monorepo verification surfaced `@hbc/ui-kit` TS6059/TS5055 failures caused by inherited workspace aliasing and declaration collisions; added `packages/ui-kit/tsconfig.json` to allowed scope for the same minimal package-isolation correction pattern. -->
<!-- PROGRESS: 2026-03-07 D-PH6-16 major step 6 in progress. Cleaned generated build artifacts accidentally emitted into source trees and extended allowed scope to include `packages/app-shell/tsconfig.json` after full verification surfaced identical TS6059 source-inclusion failures in `@hbc/app-shell`. -->
<!-- PROGRESS: 2026-03-07 D-PH6-16 major step 7 complete. Final verification passed with zero command errors for `pnpm turbo run build`, `pnpm turbo run lint`, `pnpm turbo run check-types`, and `pnpm turbo run test`; updated Phase 6 success checklist item 6.0.24 to complete based on full-monorepo build pass evidence. -->
