# Fresh Code-Agent Prompt — HB Intel Foleon Manager

You are working in the live `hb-intel` repository. Use `main` as repo truth unless the user provides another branch.

Do not re-read files that are still within your current context or memory unless needed to verify current repo truth or resolve a contradiction.

Preserve security and runtime boundaries:
- Do not weaken `withAuth`.
- Do not weaken route authorization.
- Do not weaken token validation.
- Do not weaken safe-config gates.
- Do not leak secrets or raw diagnostics into the browser.
- Preserve registry-first runtime configuration.
- Preserve redacted diagnostics.
- Preserve package/runtime proof.

Required validation commands for final proof:

```bash
git status --short
pnpm --filter @hbc/spfx-hb-intel-foleon lint
pnpm --filter @hbc/spfx-hb-intel-foleon check-types
pnpm --filter @hbc/spfx-hb-intel-foleon test
pnpm --filter @hbc/spfx-hb-intel-foleon schema:validate
pnpm --filter @hbc/spfx-hb-intel-foleon build
npx tsx tools/build-spfx-package.ts --domain hb-intel-foleon
pnpm --filter @hbc/spfx-hb-intel-foleon package:proof
```

## Objective

Rebuild the Admin / Config tab so technical readiness is clean, useful, and subordinate to the content operations workflow.

## Files to Inspect

- `FoleonConfigTab.tsx`
- `ManageSyncPanel.tsx`
- `manageConfigViewModel.ts`
- `manageDegradedCopy.ts`
- `foleonRuntimeContract.ts`
- `FoleonManagementApi.ts`
- backend Foleon routes and authorization files

## Files Likely to Change

- `FoleonConfigTab.tsx`
- `ManageSyncPanel.tsx`
- `manageConfigViewModel.ts`
- `manageDegradedCopy.ts`
- `manageShell.module.css`
- tests under `apps/hb-intel-foleon/src/pages/__tests__/`

## New Files to Consider

- `AdminConfigWorkspace.tsx`
- `AdminReadinessMatrix.tsx`
- `RequiredAdminActions.tsx`
- `RedactedDiagnosticsPanel.tsx`

## Guardrails

- Do not expose secrets.
- Do not remove redacted proof export.
- Do not weaken API permission, auth, or route constraints.
- Keep technical fields out of the content manager primary workflow.

## Steps

1. Split admin content into:
   - Readiness overview
   - Required admin actions
   - Sync history
   - Redacted diagnostics
   - Package/runtime proof
2. Add owner and next action for each admin blocker.
3. Keep config source table inside a disclosure.
4. Add copy redacted proof behavior with visible status.
5. Rework OAuth-missing state to be useful and non-punitive.
6. Add tests for consent-required, Graph missing, registry duplicate, package mismatch, and copied proof states.

## Acceptance Criteria

- Admin tab is useful for troubleshooting but not the first impression.
- Content managers can understand what is blocked without reading raw diagnostics.
- Redacted diagnostics remain available.
- No secrets or raw token details are exposed.

## Commit Message

`SPFx Foleon Manager: rebuild admin config and diagnostics workspace`
