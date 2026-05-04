# Agent Execution Guardrails

## Non-Negotiable

- Do not add `@procore/js-sdk` or any Procore SDK dependency.
- Do not mutate `package.json` or `pnpm-lock.yaml`.
- Do not add live Procore network calls.
- Do not add direct SPFx-to-Procore behavior.
- Do not add write-back behavior.
- Do not add binary/file replication.
- Do not store secrets or secret-like placeholders.
- Do not convert Procore operational financials into Sage/accounting truth.

## Repo Handling

- Do not re-read files that are still in current context or memory unless the repo changed.
- Begin with `git status --short`, branch, HEAD, and lockfile MD5.
- Respect existing local changes and do not overwrite unrelated work.
- Record every intentional no-op.

## Documentation Style

- Use repo-truth language.
- Use resolved decisions; do not leave implementation-critical decisions open.
- Cross-link machine-readable artifacts.
- Capture exact validation commands and results.
