# HB Verification Levels

## Level 1 — Narrow Verification

Use when:

- docs-only or small local changes;
- no public exports changed;
- no runtime behavior changed;
- no package boundary changed.

Examples:

- `git diff -- <changed files>`
- `git status --short`
- changed-file formatting check when available.

## Level 2 — Affected Package Verification

Use when:

- behavior changed in one package;
- tests exist for the affected package;
- type/lint risks are local.

Examples:

- `pnpm --filter <package> test`
- `pnpm --filter <package> check-types`
- `pnpm --filter <package> lint`

## Level 3 — Cross-Package Verification

Use when:

- public exports changed;
- shared models, UI, auth, shell, or data-access changed;
- one package affects consumers.

Examples:

- affected package tests;
- affected consumer tests;
- `pnpm check-types`;
- `pnpm lint`.

## Level 4 — Broader Workspace / E2E

Use when:

- runtime wiring changed;
- app shell behavior changed;
- routing changed;
- release-critical behavior changed;
- UI behavior must be proven in browser context.

Examples:

- `pnpm build`;
- `pnpm e2e`;
- `pnpm test:webparts:e2e` when authorized and SPFx behavior is in scope.

## Level 5 — Hosted / Tenant-Gated Verification

Use only with explicit authorization.

Examples:

- app catalog proof;
- Azure Function live parity;
- hosted endpoint smoke tests;
- Graph/PnP tenant checks;
- Procore live integration checks;
- SharePoint provisioning checks.
