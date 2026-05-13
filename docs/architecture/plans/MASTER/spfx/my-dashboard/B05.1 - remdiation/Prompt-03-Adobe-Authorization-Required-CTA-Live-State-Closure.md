# Prompt 03 — Adobe Authorization-Required CTA Live-State Closure

## Objective
Harden and prove the end-to-end state transition for an Adobe user who has not yet granted consent:
`authorization-required` envelope → non-ready focused Adobe surface → Connect Adobe Sign CTA → OAuth start POST.

## Why This Issue Exists Now
The backend and frontend OAuth implementation exists, but the hosted screenshot is on a ready fixture queue branch that omits the connection card. Operators need a deterministic, testable proof that the actual live no-grant condition reaches the CTA.

## Why It Matters
Without this branch being visibly reachable, users cannot connect Adobe Sign and operators may conclude the implementation is missing.

## Current Repo-Truth Condition
Inspect and verify:
- `backend/functions/src/hosts/my-work-read-model/read-models/adobe-sign/adobe-sign-principal-resolver.ts`
- `backend/functions/src/hosts/my-work-read-model/read-models/adobe-sign/adobe-sign-action-queue-adapter.ts`
- `apps/my-dashboard/src/modules/adobeSign/AdobeSignActionQueueModuleSurface.tsx`
- `apps/my-dashboard/src/modules/adobeSign/AdobeSignConnectionGuidanceCard.tsx`
- `apps/my-dashboard/src/state/myWorkCardViewModel.ts`
- `apps/my-dashboard/src/shell/MyWorkShell.tsx`
- `apps/my-dashboard/src/api/myWorkBackendReadModelClient.ts`

Known condition:
- no-grant live provider path emits `authorization-required`,
- CTA appears only for typed `authorization-required`,
- OAuth start client and shell callback exist.

## Required Future State
1. Add or strengthen integrated tests proving:
   - queue envelope `authorization-required` results in non-ready surface,
   - Connect Adobe Sign button is visible,
   - callback wiring is present,
   - click path invokes OAuth start client seam.
2. Ensure error states remain truthful:
   - `configuration-required` does not show user consent CTA,
   - `backend-unavailable` does not show consent CTA,
   - `available` does not show consent CTA.
3. If callback result banner or route status handling is incomplete or under-tested, close that gap only as necessary for the OAuth start/return path proof.

## Exact Files / Seams / Symbols to Inspect
- `adobe-sign-principal-resolver.ts`
- `adobe-sign-action-queue-adapter.ts`
- `AdobeSignActionQueueModuleSurface.tsx`
- `AdobeSignConnectionGuidanceCard.tsx`
- `myWorkCardViewModel.ts`
- `MyWorkShell.tsx`
- `myWorkBackendReadModelClient.ts`
- any callback banner tests.

## Required Implementation Scope
- Tests first where possible.
- Minimal code change unless a true state propagation defect is discovered.
- Add proof docs/evidence language for the authorization-required branch.

## Explicit Non-Scope
- Do not redesign OAuth flow.
- Do not change state-store or grant-store contracts.
- Do not reduce redirect/state/cipher security checks.

## Required Tests
- Focused module auth-required integration test.
- CTA click start-flow test.
- Negative CTA tests for other non-ready statuses.
- Optional callback result-banner coverage if currently weak.

## Validation Commands
Run the closest available equivalent commands in the repo. At minimum, execute the relevant package checks for changed areas, such as:

```bash
pnpm --filter @hbc/my-dashboard check-types
pnpm --filter @hbc/my-dashboard test
pnpm --filter @hbc/functions test
```

Also run any narrower Vitest files or package-specific test commands that directly cover the changed files. If the repo exposes an existing SPFx package verification command for My Dashboard, use it when the prompt changes packaging/runtime proof seams.

## Proof-of-Closure Artifacts
Provide:
- changed-file inventory,
- test command results,
- concise before/after behavior summary,
- any new fixtures/snapshots/evidence docs,
- any remaining operator-only proof items.

## Completion Standard
The prompt is complete only when:
- the required future state is implemented,
- tests are added/updated,
- validation commands are executed or clearly documented if unavailable,
- the closure evidence is produced,
- no out-of-scope surface was disturbed.

> **Do not re-read files that are already in your active context unless needed to confirm drift, dependencies, or uncertainty after changes.**
