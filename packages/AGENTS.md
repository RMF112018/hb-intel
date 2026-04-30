# HB Intel Packages Routing — Codex

## Primary rule

Respect package ownership, public exports, and dependency direction. Do not deep-import private source paths unless the package explicitly supports that import path.

## Required starting sources

For any package change:

1. Read nearest `package.json`.
2. Inspect `exports`, `main`, `types`, scripts, dependencies, and peer dependencies.
3. Read nearest README when present.
4. Identify affected consumers.
5. Validate package-local first.

## Package-boundary rules

- Shared packages define reusable contracts. Preserve public exports unless a breaking change is explicitly authorized.
- Feature packages under `packages/features/*` are domain-specific and must not become shared dependency targets for other feature packages.
- Cross-feature dependencies are prohibited. If behavior is needed across features, move it to a platform primitive or `@hbc/ui-kit` as appropriate.
- `@hbc/models` is a high-impact contract source. Changes usually require affected consumer validation.
- Backend packages must not depend on React, `@hbc/ui-kit`, shell packages, or frontend-only hooks.

## Platform primitive adoption

Before implementing feature/domain behavior, check whether a Tier-1 primitive applies:

| Concern | Required primitive |
| --- | --- |
| SharePoint document lifecycle, upload, listing, migration, offline queue | `@hbc/sharepoint-docs` |
| Ownership, ball-in-court, next move, urgency tier, handoff | `@hbc/bic-next-move` |
| UI density, expertise tier, coaching gates, complexity tier | `@hbc/complexity` |

If a primitive applies but cannot be used, require an ADR exception before local implementation.

## UI package boundary

Do not create reusable visual primitives outside `packages/ui-kit`. Feature packages may compose ui-kit components and own domain-specific flows, but not introduce a parallel design system.

## Validation

Prefer package-local commands from the nearest `package.json`:

```bash
pnpm --filter <package-name> check-types
pnpm --filter <package-name> test
pnpm --filter <package-name> lint
pnpm --filter <package-name> build
```

Escalate to workspace validation only when exports, dependency direction, shared contracts, or multiple consumers are affected.
