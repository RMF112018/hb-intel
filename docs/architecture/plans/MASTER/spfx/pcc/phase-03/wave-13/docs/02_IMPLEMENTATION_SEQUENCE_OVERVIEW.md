# Implementation Sequence Overview

## Staged Plan

| Stage | Prompt | Purpose | Commit? |
| --- | --- | --- | --- |
| 1 | Prompt 01 | Read-only local readiness audit. | No |
| 2 | Prompt 02 | Shared models, fixtures, state machine, completion gates, source-model bridge. | Yes |
| 3 | Prompt 03 | Backend GET-only mock read model. | Yes |
| 4 | Prompt 04 | SPFx read-model client and fixture/backend parity. | Yes |
| 5 | Prompt 05 | SPFx Buyout Log surface shell. | Yes |
| 6 | Prompt 06 | Integration seams with readiness, priority actions, approvals references, document control, external launchers. | Yes |
| 7 | Prompt 07 | Tests, guardrails, implementation closeout. | Yes |
| 8 | Prompt 08 | Fresh-session implementation review. | No by default |

## Dependencies

- Prompt 02 depends on Prompt 01 answering the `buyout-log` placement/bridge issue.
- Prompt 03 depends on Prompt 02 exporting shared read-model types and fixtures.
- Prompt 04 depends on Prompt 03 route and envelope shape.
- Prompt 05 depends on Prompt 04 client/fixture stability.
- Prompt 06 depends on Prompt 05 surface shell and Prompt 02 priority action candidate model.
- Prompt 07 depends on all prior implementation prompts and must validate the entire Wave 13 change set.
- Prompt 08 depends on the final implementation commit sequence.

## Expected Deliverables by Prompt

### Prompt 01

- Read-only repo audit.
- Local HEAD/branch/status/lockfile evidence.
- Wave 13 artifact and JSON validation.
- Source-model placement recommendation.
- Confirmed scripts and paths.

### Prompt 02

- `BuyoutPackage` and child records.
- State and reconciliation vocabularies.
- Field mutability and waiver posture.
- Completion-gate utilities.
- Deterministic fixtures.
- Model exports and tests.
- Minimal source-model placement bridge/correction with tests if required.

### Prompt 03

- Provider interface method.
- Mock provider implementation.
- GET-only route.
- Known/unknown/degraded envelope behavior.
- Backend tests and guardrails.

### Prompt 04

- SPFx read-model route id/path.
- Client interface method.
- Fixture client implementation.
- Backend opt-in client implementation.
- Fixture/backend parity tests.

### Prompt 05

- Buyout Log surface shell.
- Command center, table, budget/commitment matrix, unbought queue, reconciliation, detail drawer, compliance, procurement, evidence, and audit sections.
- Safe states: loading, empty, degraded, access-display, read-only.

### Prompt 06

- Priority Action candidate references.
- Project Readiness placement/linking.
- References to Wave 9–14 modules.
- Document Control evidence-link references.
- External Systems launch-only posture.
- No external writes or approval execution.

### Prompt 07

- Full targeted validation.
- Guardrail tests/grep.
- Closeout doc.
- Final commit summary/body.

### Prompt 08

- Fresh-session reviewer prompt.

## Validation Expectations

- Validate only touched packages unless the prompt requires broader checks.
- Always inspect package scripts before running package validation.
- Always run `git diff --check`.
- Always run targeted Prettier checks for touched markdown/json.
- Always report lockfile status.
- Never run broad `pnpm format` or `prettier --write` across the repo.

## Rollback / Stop Conditions

Stop and report without committing if:

- `pnpm-lock.yaml` changes unexpectedly.
- Any package manifest, workflow, CI, deployment, tenant, or SPFx packaging file changes unexpectedly.
- Any file under `docs/architecture/plans/**` changes.
- Any implementation introduces external-system runtime calls or writeback.
- Any backend route permits non-GET methods.
- Any source-derived field lacks lineage.
- The local repo has unrelated user-owned changes that overlap with the prompt scope.
- Validation failures cannot be clearly attributed to pre-existing unrelated issues.
