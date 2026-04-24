# 07 — Recommended Execution Waves

## Phase 8 / 10 — Recommended execution order

## Wave 01 — Truthful backend command cutover

### Objective

Make the Safety frontend truthfully call the current Azure Functions backend with delegated auth, typed contracts, request IDs, and fail-closed runtime config.

### Prompts

1. Reconcile repo truth and build state.
2. Implement runtime backend config and SPFx property injection.
3. Implement typed backend command client + delegated token propagation.
4. Add preview/ingest/replay hooks and contract tests.
5. Add release proof for backend route/auth/config.

### Exit criteria

- Clean local checkout and artifact source are proven.
- Safety webpart cannot initialize command mode without `functionAppUrl` and `apiAudience`.
- Valid SPFx hosted user can call preview with bearer token.
- Missing/invalid token returns truthful auth error.
- Preview route is called with `X-Request-Id`.
- Command failures preserve backend diagnostics.

## Wave 02 — Upload UX, workbook authority, and supportability

### Objective

Replace direct-submit upload with a production preview-before-commit intake runway that matches parser authority, project/reporting-period logic, duplicate/supersession handling, and accessible async UX.

### Prompts

1. Replace direct upload with preview → confirm → commit runway.
2. Add project picker and inspection metadata intake.
3. Surface parser-authority, template contract, period mismatch, project resolution, duplicate/supersession preview.
4. Implement truthful error/support panels.
5. Harden file input, accessibility, cancellation, and review/replay behavior.

### Exit criteria

- Commit is impossible without latest commit-ready preview.
- Preview changes invalidate commit.
- Full upload context is sent.
- Parser authority copy matches backend truth.
- Duplicate/supersession blocker has a deliberate review/replay path.
- Screen-reader users receive status/error updates without focus traps.
