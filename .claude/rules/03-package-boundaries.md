# 03-package-boundaries

## Intent

Maintain a healthy monorepo dependency graph and keep ownership clear.

## Before changing package relationships

Read:
- `docs/architecture/blueprint/package-relationship-map.md`
- the touched package `README.md`
- the touched package `package.json`

## Rules

- Do not add a dependency without confirming the package relationship is architecturally correct.
- Do not move code across package boundaries without checking who should own the concern.
- Do not let feature packages become dependency hubs for other feature packages.
- Put shared logic in shared or platform packages when the concern truly spans features.
- Keep package public exports intentional and minimal.
- Prefer adapters and boundary-safe primitives over leaking feature internals across packages.

## UI ownership

- Reusable visual UI belongs in `@hbc/ui-kit`.
- Feature packages may compose `@hbc/ui-kit` components and may contain thin feature-local composition shells.
- Feature packages should not create duplicate reusable visual primitives.

## Dependency hygiene

- Prefer existing workspace packages before adding new external dependencies.
- Avoid introducing a new package when an existing package already owns the concern.
- Be cautious with scaffold or partially mature packages; verify readiness before building production-critical behavior on top of them.

## When to document

Update documentation when package ownership, public exports, dependency direction, or package responsibility changes.
