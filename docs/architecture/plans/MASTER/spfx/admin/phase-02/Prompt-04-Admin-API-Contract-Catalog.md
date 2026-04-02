# Prompt 04 — Admin API Contract Catalog

## Objective

Define the stable request/response contract catalog that the operator console and privileged backend will later implement.

This prompt defines the API vocabulary without building the actual endpoints.

## Context efficiency rule

Do **not** re-read files already in active context unless you need a direct compatibility check.

## Required repo-truth context

Use:
- the action catalog
- the generalized run model
- the target-architecture doc
- the project-setup host release-scope manifest
- existing provisioning/client request patterns only as needed for naming and DTO alignment

## Scope of work

Define the canonical contract catalog for the future admin API surface, including at minimum:
- launch / start run
- get run status
- get run history
- get run detail
- cancel run
- retry run
- resume checkpoint
- record approval / checkpoint decision
- run repair
- run validation / preflight
- get config
- preview config impact / dry-run
- list action metadata / capability metadata

For each contract, define:
- intent,
- required input,
- response envelope,
- error shape,
- idempotency / repeat-call expectations,
- auth / operator-context expectations,
- and whether it is synchronous, async-run-launch, or checkpoint/event oriented.

## Required outputs

Create:

- `docs/architecture/plans/MASTER/spfx/admin/phase-2/admin-control-plane-api-contract-catalog.md`

Create or update shared DTO types in:

- `packages/models/src/admin-control-plane/`

At minimum define:
- command request envelope
- command response envelope
- run launch response
- status/detail/history response DTOs
- preview/dry-run response DTOs
- structured admin error DTOs

Export them through `@hbc/models`.

## Implementation requirements

- The API catalog must be shaped for future backend implementation but remain runtime-agnostic.
- Use consistent envelope patterns.
- Make checkpoint-related calls explicit rather than treating them as generic “update” requests.
- Make dry-run / preview responses first-class where risk or standards comparison matters.
- Keep auth semantics high-level and contract-oriented, not implementation-specific.

## Documentation requirements

The API catalog must include:
- endpoint-intent table,
- DTO cross-reference,
- async vs sync behavior notes,
- idempotency notes,
- and Phase 3 implementation handoff notes.

## Validation requirements

- Confirm DTO names and fields align with the run/action contracts already established.
- Run targeted type checks.
- Ensure no transport-specific assumptions leak into unrelated layers.

## Acceptance / completion conditions

This prompt is complete when:
- the repo has one coherent API contract catalog,
- request/response DTOs are exported cleanly from `@hbc/models`,
- and later backend implementation can proceed from this contract set.

## No-go boundaries

- Do not add actual Azure Function routes.
- Do not add concrete network clients in apps/admin.
