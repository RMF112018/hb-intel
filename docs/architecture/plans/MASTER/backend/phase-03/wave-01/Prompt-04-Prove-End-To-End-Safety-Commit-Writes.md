# Prompt-04-Prove-End-To-End-Safety-Commit-Writes

## Objective

After the blocker is fixed, prove authoritative committed writes into the Safety lists end-to-end.

This wave is not complete until proof exists.

## Governing authorities

- current Safety ingest route / application service / graph repository
- target Safety list schemas and provisioning targets
- current telemetry and health/readiness surfaces

## Required work

1. Execute a valid preview.
2. Execute a valid commit.
3. Capture before/after evidence for:
   - `Safety Ingestion Runs`
   - `Safety Project Week Records`
   - `Safety Inspection Events`
   - `Safety Findings`
4. If replay and duplicate/supersession flows are available, execute at least one proof for each.
5. Produce a concise closure report with:
   - request IDs
   - artifact version / SHA
   - exact list deltas
   - exact run/result status
   - any residual gaps

## Required implementation outcome

- the Safety lane can be defended as operationally working in staging/test under Graph-only application-facing behavior

## Prohibitions

- no vague “appears fixed” language
- no closure without before/after evidence
- do not re-read files already in active context unless needed to confirm drift, dependencies, or uncertainty after changes
