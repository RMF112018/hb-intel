# My Projects — Legacy Registry Mirror / Preservation Backfill Workflow (Prompt 06)

**Prepared:** May 13, 2026  
**Repo:** `hb-intel`

## 1. Authority Contract

- **Matched Registry rows:** mirror Projects-authoritative canonical role arrays and `procoreProject`.
- **Legacy-only Registry rows:** preserve operator-maintained canonical role arrays and `procoreProject`.

This distinction is mandatory and prevents blank-overwrites when Projects authority is absent.

## 2. Linkage Resolution

Resolution order:

1. Strong linkage: `MatchedProjectListItemId` -> `Projects.Id`.
2. Deterministic fallback: `ProjectNumber + LegacyYear`.

Safety behavior:

- ambiguous fallback candidates -> warning + skip (no destructive write);
- unresolved linkage -> warning + skip;
- matched row with missing Projects authority row -> warning + skip.

## 3. Script Contract

Script path:

- `scripts/backfill-my-project-legacy-registry-fields.ts`

Flags:

- default: dry-run (no writes)
- `--apply`: enables writes
- `--limit <n>`: bounded run
- `--json`: machine-readable summary

Summary fields:

- `rowsScanned`
- `matchedRowsMirrored`
- `legacyOnlyRowsPreserved`
- `rowsUnchanged`
- `rowsSkippedInsufficientLinkage`
- `warnings`
- `warningSamples` (capped)

## 4. Operator Run Commands

Dry-run (recommended first):

```bash
pnpm exec tsx scripts/backfill-my-project-legacy-registry-fields.ts --json
```

Bounded dry-run:

```bash
pnpm exec tsx scripts/backfill-my-project-legacy-registry-fields.ts --limit 100 --json
```

Apply (operator-gated):

```bash
pnpm exec tsx scripts/backfill-my-project-legacy-registry-fields.ts --apply --json
```

## 5. Idempotency and Safety

- Backfill writes only changed fields.
- Re-runs are idempotent.
- Legacy-only rows are never blanked due to missing Projects authority.
- Prompt 07 remains responsible for discovery-writer match-state override remediation.

## 6. Execution Statement

- No live tenant `--apply` command was executed in Prompt 06 implementation.
- Workflow is prepared for operator-run execution only.
