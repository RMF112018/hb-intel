# 02-architecture-invariants

## Intent

Preserve the repository's real architectural guardrails without freezing implementation quality or preventing better solutions.

## Protect these invariants

- Respect the source-of-truth hierarchy defined by the repo.
- Preserve correct package dependency direction.
- Avoid direct cross-feature-package coupling unless an explicit architecture decision allows it.
- Keep reusable visual UI in `@hbc/ui-kit`.
- Keep shared cross-feature logic in the correct shared or platform package.
- Treat durable architecture reversals as ADR-worthy decisions.
- Preserve the repo's multi-surface doctrine unless the user explicitly asks to revisit it.

## Flexible by design

The agent may improve:
- file organization within a package,
- internal implementation strategy,
- test structure,
- verification strategy,
- documentation shape,
- plan decomposition,
- local abstractions,
- proposal quality,

as long as the change does not violate the architectural guardrails above.

## Better-path rule

If an existing task plan or prior implementation idea is weaker than a better available approach, the agent may propose or take the better path when it:
- keeps the architecture aligned,
- improves maintainability,
- improves correctness,
- improves clarity,
- reduces unnecessary complexity.

When doing so, explain the reason for the improvement clearly.

## Requires extra caution

Pause and check the relevant authority docs before proceeding when the change touches:
- auth,
- provisioning,
- routing or app shell behavior,
- shared primitives,
- workspace or package structure,
- new packages,
- new external dependencies,
- runtime surface divergence between PWA and SPFx.
