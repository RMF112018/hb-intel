# Prompt 06 — Validation Evidence, Regression Tests, and Production Closeout

## Objective

Perform the final exhaustive validation and evidence-closeout pass for the My Dashboard readiness remediation sequence.

This prompt does not introduce new architecture. It proves that Prompts 00–05 collectively closed the defect:

> authenticated production users no longer remain trapped in a static non-ready/read-only scaffold solely because the frontend runtime is unwired or the package lacks required runtime config.

## Required verification lanes

### Lane 1 — Source truth
Confirm:
- branch/HEAD,
- clean or intentionally documented working tree,
- package/manifest versions,
- touched files map.

### Lane 2 — Frontend runtime
Prove:
- My Dashboard app constructs/uses the My Work read-model client path,
- `getApiToken` is no longer discarded,
- surface readiness is derived from envelope state,
- card values are data-driven,
- typed non-ready states still render truthfully.

### Lane 3 — Backend contract compatibility
Prove:
- protected route names remain unchanged,
- OAuth start/callback route contract remains unchanged unless explicitly documented,
- backend tests remain green.

### Lane 4 — Package truth
Build a fresh My Dashboard `.sppkg` using the approved production-intended non-secret runtime inputs.

Validate:
- package version truth,
- API permission request truth,
- backend runtime config markers truth,
- no accidental omission of `FUNCTION_APP_URL` / `API_AUDIENCE`,
- source bundle/package parity where the existing package-truth system supports it.

### Lane 5 — Regression tests
Run full applicable tests and document exact outputs.

## Required validation commands

At minimum:

```bash
git status --short
git rev-parse --abbrev-ref HEAD
git rev-parse HEAD

pnpm --filter @hbc/spfx-my-dashboard check-types
pnpm --filter @hbc/spfx-my-dashboard test
pnpm --filter @hbc/spfx-my-dashboard build

pnpm --filter @hbc/functions check-types
pnpm --filter @hbc/functions test

npx tsx tools/build-spfx-package.ts --domain my-dashboard
```

Use the operator-approved production runtime env lane when building the production-proof `.sppkg`.

## Required closeout artifact

Create a final markdown closeout in an appropriate repo docs/evidence location containing:

1. Final verdict:
   - `PASS`
   - or `FAIL / BLOCKED`
2. Branch / HEAD.
3. Prompt completion table for 00–05.
4. Exact validation commands and outcomes.
5. Package truth details:
   - version,
   - output artifact,
   - runtime marker verification,
   - permission request posture.
6. Remaining operator-owned deployment prerequisites, if any:
   - SharePoint Admin API approval,
   - tenant Function App env values,
   - Adobe OAuth app config,
   - package upload/redeploy action.
7. Explicit answer:
   > “Why did the app render non-ready before, and why is that now closed?”

## Required acceptance tests to explicitly confirm

The closeout must state whether each of these is proven:

- Backend runtime config is supplied for production package truth.
- Token-provider creation is possible when runtime `apiAudience` exists.
- App runtime uses the My Work client.
- Ready surface can render when envelope source status is available.
- Non-ready surface remains for authorization/configuration/backend unavailability.
- Cards render real data values in ready envelopes.
- No package/source parity ambiguity remains.
- Adobe OAuth initiation UX is reconciled with backend truth.

## Non-scope

- Do not expand feature scope.
- Do not add unrelated modules.
- Do not change product aesthetics beyond necessary data/readiness rendering.
- Do not leave validation evidence implied; write it down.

## Completion standard

Prompt 06 is complete only when the remediation package has a defendable, evidence-backed closeout and a fresh package artifact can be traced to source truth and required runtime config posture.

## Agent Efficiency Directive

**Do not re-read files that are already in your active context unless needed to confirm drift, dependencies, or uncertainty after changes.**
