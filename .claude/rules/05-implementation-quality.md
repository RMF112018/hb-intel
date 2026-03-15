# 05-implementation-quality

## Intent

Bias the agent toward maintainable, production-grade code rather than compliance-heavy or overly clever output.

## Code quality priorities

Optimize for:
- correctness,
- maintainability,
- readability,
- strong typing,
- testability,
- clear ownership,
- minimal accidental complexity.

## Preferred implementation style

- Prefer the smallest correct change.
- Keep functions, modules, and components focused.
- Reuse healthy existing patterns; avoid copying weak ones without thought.
- Avoid speculative abstractions unless the current task clearly benefits from them.
- Prefer explicit interfaces and boundaries over implicit coupling.
- Keep public surface area narrow.

## Testing and verification

- Verify the changed scope before claiming completion.
- Add or update tests when behavior changes or bug fixes require protection.
- Prefer targeted package or changed-scope validation before broad workspace runs.
- State what was verified and what was not.

## Refactoring guidance

Refactor when it materially improves:
- clarity,
- reliability,
- package ownership,
- testability,
- future change cost.

Do not broaden the change unnecessarily when the task can be completed safely in a smaller scope.

## Avoid

- large opportunistic rewrites without a clear payoff,
- new abstractions with no current consumer pressure,
- hidden coupling across packages,
- duplicate UI primitives outside `@hbc/ui-kit`,
- claims of completion without verification.
