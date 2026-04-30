# Safety App Routing — Codex

## Primary rule

Safety app work must distinguish SPFx frontend behavior from backend Functions behavior. Do not cross the frontend/backend boundary casually.

## Required starting sources

Use as applicable:

```text
apps/safety/package.json
apps/safety/README.md
packages/features-safety/package.json
packages/features-safety/README.md
backend/functions/package.json
scripts/package-functions-artifact.ts
docs/reference/developer/verification-commands.md
docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Governing-Standard.md
```

## Frontend boundary

- Use frontend command clients/hooks/adapters already defined for Safety behavior.
- Do not add live backend probes, Graph calls, SharePoint REST calls, or token handling directly into UI code unless active architecture explicitly authorizes it.
- Preserve delegated-token acquisition posture and fail-closed behavior when backend binding is involved.

## Backend boundary

Backend route, ingest, parser, Graph data-plane, health/readiness, and artifact work belongs under `backend/functions` rules. Use the backend Functions nested `AGENTS.md` when editing backend code.

## Sensitive boundary

Do not run live backend endpoint probes, Azure commands, Graph/PnP calls, tenant smoke tests, or auth-token proof commands without explicit user authorization and redaction discipline.

## Validation

Prefer local app/package validation first:

```bash
pnpm --filter @hbc/spfx-safety test
pnpm --filter @hbc/spfx-safety build
pnpm --filter @hbc/spfx-safety lint
pnpm --filter @hbc/features-safety test
```

Use release-proof or hosted-environment proof only when release wiring is explicitly in scope and authorized.
