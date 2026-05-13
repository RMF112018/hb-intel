# My Projects — Projects Role-Array Backfill Workflow (Prompt 05)

**Prepared:** May 13, 2026  
**Repo:** `hb-intel`

## 1. Purpose

Define the operator-gated backfill workflow that migrates legacy Projects role fields into canonical My Projects role arrays with idempotent, write-minimal behavior.

This workflow does **not** remove legacy fields and does **not** execute autonomously.

## 2. Mapping Contract

Required mappings:

- `leadEstimatorUpn` -> `leadEstimatorUpns`
- `supportingEstimatorUpns` -> `estimatorUpns`
- `projectManagerUpn` -> `projectManagerUpns`
- `projectExecutiveUpn` -> `projectExecutiveUpns`

Behavior:

- parse values defensively;
- normalize UPNs with Prompt 03 helpers;
- merge into canonical arrays (no blind replacement);
- dedupe and sort deterministically;
- serialize canonical arrays as JSON `string[]`;
- write only when canonical serialized value changes.

Legacy invalid values (`Yes`, `No`, malformed non-UPN tokens) produce warnings and are not written.

## 3. Script Contract

Script path:

- `scripts/backfill-my-project-role-arrays.ts`

Flags:

- default: dry-run (no writes)
- `--apply`: enables writes
- `--limit <n>`: process a bounded row count
- `--json`: emit machine-readable summary JSON

Summary fields:

- `rowsScanned`
- `rowsWithMigratableLegacyValues`
- `rowsChanged`
- `rowsUnchanged`
- `rowsSkippedAlreadyMatched`
- `parseValidationWarnings`
- `warningSamples` (capped)

## 4. Operator Run Commands

Dry-run (recommended first):

```bash
pnpm exec tsx scripts/backfill-my-project-role-arrays.ts --json
```

Bounded dry-run:

```bash
pnpm exec tsx scripts/backfill-my-project-role-arrays.ts --limit 100 --json
```

Apply (operator-gated):

```bash
pnpm exec tsx scripts/backfill-my-project-role-arrays.ts --apply --json
```

## 5. Safety and Idempotency

- Re-running dry-run or apply is safe and idempotent.
- Rows with already-matched canonical arrays are skipped (no write).
- Only changed canonical target fields are patched.
- Legacy source fields are preserved.

## 6. Compatibility Transition Rule

Downstream reads should:

- prefer canonical arrays;
- fallback to corresponding legacy source fields only when the canonical array is empty.

## 7. Execution Statement

- No live tenant write command was executed as part of Prompt 05 implementation.
- The script is prepared for operator-run execution only.
