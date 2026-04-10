# Test Data Management

Phase-14 testing package · Prompt-05 deliverable.

## Test prefixes and markers

Every synthetic row created by the harness uses a deterministic tagging convention:

| Field | Pattern | Example |
|---|---|---|
| `KudosId` (kudos list) | `TEST-HBI-{runId}-{seq}` | `TEST-HBI-hbi-20260410-abc123-001` |
| `AnnouncementId` (announcements + celebrations) | `TEST-HBI-{runId}-{seq}` | `TEST-HBI-hbi-20260410-abc123-010` |
| `Headline` / `Title` | `[TEST][HBI] {runId} {seq} {label}` | `[TEST][HBI] hbi-20260410-abc123 001 lifecycle-happy-path` |
| `InternalNote` (audit events) | `runId={runId} synthetic audit event ({eventType})` | `runId=hbi-20260410-abc123 synthetic audit event (approve)` |

The `testPrefix` config value (`TEST-HBI`) is the stable cleanup anchor. It never changes between runs.

## Correlation IDs

Each test run generates a unique `runId` with the format:

```
hbi-{YYYYMMDDHHmmss}-{3-char-hex}
```

Example: `hbi-20260410123456-a1b2c3`

The `runId` is embedded in every synthetic `KudosId` and `Headline`, making it easy to:
- Identify all items from a specific run
- Distinguish items from concurrent runs
- Clean up a specific run without affecting others

## Cleanup strategy

### Automatic cleanup (default)
When `cleanup: true` in the config (the default), the suite runs a cleanup pass after all domain suites complete. Cleanup deletes items across 4 lists:

| List | Filter | Method |
|---|---|---|
| People Culture Kudos | `startswith(KudosId, 'TEST-HBI-{runId}-')` | Query + delete each match |
| Kudos Audit Events | Iterate sequences 1–32, filter `KudosId eq 'TEST-HBI-{runId}-{seq}'` | Query + delete each match |
| People Culture Announcements | `startswith(AnnouncementId, 'TEST-HBI-{runId}-')` | Query + delete each match |
| People Culture Celebrations | `startswith(AnnouncementId, 'TEST-HBI-{runId}-')` | Query + delete each match |

### Retention mode (debugging)
Pass `--no-cleanup` to preserve all synthetic items after the run completes. This is useful for:
- Inspecting created items in the SharePoint web UI
- Debugging failed assertions against real data
- Verifying field values manually

To clean up manually after a retained run, re-run with cleanup enabled:
```bash
npx tsx scripts/testing/people-kudos/runAll.ts --live --only-cleanup
```
(Or delete items via the SharePoint list UI by filtering on `[TEST][HBI]` in the Title/Headline column.)

## Failure-safe behavior

### Cleanup errors are non-fatal
If a cleanup query or delete fails, the step records a `warn` status and continues. The remaining cleanup steps are not aborted.

### Dry-run is the default
All commands default to `--dry-run` mode. In dry-run:
- No SharePoint REST calls are made
- No token is fetched
- No items are created or deleted
- All steps log as `dry` status with the intended action
- The harness exits cleanly with code 0

### Token is lazy-evaluated
The bearer token is only fetched when a live SharePoint call is about to happen. This means:
- `--dry-run` never triggers token resolution
- Token failures in `--live` mode are reported as the first failed step, not as a startup crash

## How to avoid touching non-test records

1. **Prefix isolation**: Every synthetic field value starts with `TEST-HBI-`. No production data should ever use this prefix.
2. **Filter-scoped cleanup**: Cleanup queries use `startswith(KudosId, 'TEST-HBI-{runId}-')` — this matches only items created by the harness with the exact runId.
3. **No wildcard deletes**: Cleanup iterates query results and deletes by specific item ID. It never issues a bulk delete.
4. **Sequence bounds**: Audit cleanup iterates sequences 1–32 only, which matches the maximum synthetic items any single run creates.
5. **Read-only smoke**: The smoke suite reads local files only — it never touches any SharePoint list.

## Config reference

```json
{
  "siteUrl": "https://hedrickbrotherscom.sharepoint.com/sites/HBCentral",
  "lists": {
    "peopleCultureKudos": "People Culture Kudos",
    "kudosAuditEvents": "Kudos Audit Events",
    "peopleCultureAnnouncements": "People Culture Announcements",
    "peopleCultureCelebrations": "People Culture Celebrations"
  },
  "testPrefix": "TEST-HBI",
  "cleanup": true,
  "auditParity": true,
  "docsDir": "docs/architecture/plans/MASTER/spfx/homepage/people/phase-14"
}
```

Override by passing `--config <path>` to any runner.
