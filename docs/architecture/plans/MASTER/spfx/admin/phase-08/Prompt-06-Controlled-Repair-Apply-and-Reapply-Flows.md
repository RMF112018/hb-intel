# Prompt-06 — Controlled Repair, Apply, and Reapply Flows

## Objective

Implement the backend execution flows that perform constrained SharePoint standards application, reapplication, and repair for in-scope HB Intel-managed assets.

## Important execution rules

- Stay strictly inside the first-wave managed-asset boundary.
- Preserve preview / dry-run compatibility.
- Keep execution auditable and risk-aware.
- Reuse existing orchestration / checkpoint / retry patterns where appropriate.
- Do not create a broad tenant-governance engine.

## Inputs

Use:
- the baseline
- the comparison model
- the drift workflow
- the preview / dry-run outputs
- existing backend execution patterns

## Scope of work

Implement the smallest correct backend flow(s) for:
- apply standards
- reapply standards
- repair targeted drift
- constrained retries / recovery behavior where appropriate

## Required behavior

Execution should capture:
- target asset
- operator identity
- standards snapshot reference
- preview reference where applicable
- exact actions taken
- exact failures / blocked actions
- post-run verification results if available
- evidence / audit payloads

## Required safeguards

Include safeguards such as:
- target boundary checks
- unsupported-action blocking
- explicit risk / destructive signaling where needed
- no execution against assets outside approved first-wave scope

## Documentation output

Create or update:
- `docs/architecture/plans/MASTER/spfx/admin/phase-8/admin-spfx-phase-8-repair-and-standards-application.md`

Include:
1. supported action types
2. execution boundaries
3. safeguard model
4. audit behavior
5. rollback / retry notes if applicable
6. open limitations

## Validation

Run the smallest targeted validation to prove:
- execution respects target scoping,
- audit / evidence capture works,
- and post-run output is consumable by the operator console.

## Completion condition

Stop after constrained repair / apply / reapply flows are complete and documented.
