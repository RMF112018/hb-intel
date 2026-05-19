# Prompt 10 Closeout Evidence — Validation, Parity, Hosted Proof, and Rollback

Date: 2026-05-19  
Branch: `main`  
HEAD: `c043a2ad14a3347fad1590811daac6494e1ff71c`

## Scope

This closeout records Prompt 10 execution results for the B05.16 proof gate.

## Commands Executed

```bash
git branch --show-current
git rev-parse HEAD
git status --short
pnpm --filter @hbc/functions test -- my-projects-projection
pnpm --filter @hbc/functions test -- my-work-read-model
pnpm --filter @hbc/functions check-types
pnpm tsx scripts/verify-my-projects-projection-storage.ts --json
pnpm tsx scripts/provision-my-projects-projection-storage.ts --site-url https://hedrickbrotherscom.sharepoint.com/sites/MyDashboard --json
pnpm tsx scripts/provision-my-projects-projection-storage.ts --apply --site-url https://hedrickbrotherscom.sharepoint.com/sites/MyDashboard --json
pnpm tsx scripts/verify-my-projects-projection-storage.ts --site-url https://hedrickbrotherscom.sharepoint.com/sites/MyDashboard --json
```

## Results Summary

1. Local test lanes:
- `pnpm --filter @hbc/functions test -- my-projects-projection` passed (`243` files, `3741` tests passed, `3` skipped).
- `pnpm --filter @hbc/functions test -- my-work-read-model` passed (`243` files, `3741` tests passed, `3` skipped).

2. Typecheck lane:
- `pnpm --filter @hbc/functions check-types` failed on existing unrelated repo drift:
  - `src/hosts/my-work-read-model/adobe-sign-webhook-receiver-routes.ts(501,3)`
  - `src/hosts/my-work-read-model/adobe-sign-webhook-receiver-routes.ts(511,3)`
  - error: handler signature not assignable to `HttpHandler`.

3. Provisioning dry-run/apply/verify lane:
- Blocked by operator identity/permission in current execution lane.
- Verifier returned `401` querying fields for `My Projects Registry`:
  - `verify-my-projects-projection-storage: fields query failed for 'My Projects Registry' with status 401`
- No authenticated hosted operator proof could be captured from this environment.

4. Hosted live proof lane (Runbook 04):
- Not executed due missing/unauthorized operator lane for live SharePoint/Graph proof.
- Required live checkpoints remain unproven in this run:
  - subscription create/renew,
  - webhook validation token response,
  - pending-work row creation from live notification,
  - timer processing confirmation,
  - source sync advancement,
  - registry update,
  - runs/failures live state confirmation.

5. Parity lane:
- Automated parity/unit coverage is green in local test suite.
- Hosted parity acceptance against controlled operator scenarios is still pending.

6. Rollback proof status:
- Rollback command remains documented and executable in runbook:
  - `HBC_MY_PROJECTS_PROJECT_LINKS_READ_MODE=legacy`
- Runtime execution of rollback command was not performed in this local non-hosted lane.

## Cutover Readiness Decision

Decision: **Not Ready**.

Blocking reasons:
1. `check-types` is red on current HEAD due unrelated active drift.
2. Runbook 02 provisioning/verification cannot be completed in this lane (`401`).
3. Runbook 04 hosted live proof evidence is not captured.
4. Runbook 05 cutover preconditions cannot be fully attested without hosted proof.

## Required Follow-up To Reach Ready

1. Resolve current TypeScript failures in `adobe-sign-webhook-receiver-routes.ts`.
2. Re-run provisioning verify/dry-run/apply/post-verify in authorized MyDashboard operator lane.
3. Capture Runbook 04 live evidence end-to-end.
4. Re-run Prompt 10 gate and update this document with hosted proof artifacts.
