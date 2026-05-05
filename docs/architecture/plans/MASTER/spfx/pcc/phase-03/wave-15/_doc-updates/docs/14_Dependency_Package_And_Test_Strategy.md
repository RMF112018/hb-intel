# 14 — Dependency Package and Test Strategy

Authorized now: `@hbc/models`, `@hbc/ui-kit`, existing PCC read-model envelope pattern, existing SPFx package structure, Vitest/type-check/Prettier gates.

Future-gated only: Microsoft Graph SDK, Azure Identity, Azure Key Vault, Procore SDK/API client, Sage Web Services client, Power Automate/Workato.

Required tests: schema JSON validity, field dictionary exhaustiveness, role-action matrix coverage, URL policy validation, state-machine transition validation, degraded-state rendering, no forbidden imports, no direct SPFx external fetch, no writeback verbs, no package/lockfile mutation.
