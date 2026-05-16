# Implementation Roadmap — Prompt-by-Prompt Delivery

## Phase 0 — Revalidate

### Prompt 01
- Re-run local repo baseline commands.
- Confirm inspected paths still match current repo truth.
- Record unrelated drift.
- Freeze exact owning files before editing.

## Phase 1 — Backend contracts and route skeleton

### Prompt 02
- Add resolver DTOs / internal contracts.
- Add route constant and protected handler skeleton.
- Add closed resolver response / redirect outcome vocabulary.
- Add targeted tests for route shape and rejected invalid input.

## Phase 2 — Adobe live provider resolution

### Prompt 03
- Implement signing URL client seam.
- Normalize Adobe response.
- Match actor to recipient URL.
- Handle 401/403/404/429/5xx/malformed safely.
- Add tests for all normalized outcomes.

## Phase 3 — Security policy and telemetry

### Prompt 04
- Add transient-action URL policy.
- Keep durable link policy untouched.
- Add safe redirect / result decision logic.
- Add telemetry events with URL redaction guarantees.
- Add policy and telemetry tests.

## Phase 4 — Read-model capability metadata

### Prompt 05
- Extend Action Queue contracts with non-sensitive resolver capability metadata.
- Update adapters and fixtures.
- Preserve completed-row view URL path.
- Add contract tests and fixtures.

## Phase 5 — Frontend row behavior

### Prompt 06
- Add `Act now` CTA for eligible action queue rows.
- Add resolving state and failure state.
- Keep completed rows on `View`.
- Add API client route method if the design uses JSON result rather than browser navigation.
- Add React/Vitest coverage.

## Phase 6 — OAuth scope, reconsent, action-type hardening

### Prompt 07
- Verify source scope posture.
- Add insufficiency classification and reconnect UX contract.
- Ensure all six HB action types are routed through consistent resolver capability handling.
- Add tests for scope mismatch / stale grants / unavailable action outputs.

## Phase 7 — Final proof

### Prompt 08
- Run targeted validation sets.
- Run broader package validation as explicitly named in the prompt.
- Capture lockfile md5 before/after.
- Produce final closeout report in agent output.
- Commit exact staged files only.

## Package-wide completion gate

Do not call the implementation complete until:

- all eight prompts are executed or intentionally superseded by verified repo truth;
- no direct signing URL is persisted;
- resolver CTA works locally by contract and in hosted manual proof;
- tests pass;
- telemetry is safe and meaningful;
- OAuth scope/reconsent behavior is explicit.
