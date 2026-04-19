# Legacy Fallback Closure Report Template

Copy this template into the closure PR description or the operations ticket that claims the legacy fallback lane is closed for the captured run. Fill every field. Every proof class must name the artifact that backs it; "looked fine" is not an artifact. Pair this report with the JSON from `scripts/collect-legacy-fallback-closure-evidence.sh` when applicable.

## 1. Run identity

- Environment: `staging` | `prod`
- Function App: `<name>`
- Resource group: `<rg>`
- Run id: `<runId>`
- Invocation id (App Insights): `<invocationId>`
- Started (UTC): `<startedUtc>`
- Completed (UTC): `<completedUtc>`
- Trigger: `HTTP` | `timer`
- Dry run: `yes` | `no`

## 2. Proof classes (A–E)

Mirrors `run-legacy-fallback-discovery.md > Hosted validation sequence`. Each class records pass/fail plus the artifact that proves it. If any class is `fail` or `partial`, the lane is not closed.

### A. Deployment Proof — `pass` | `partial` | `fail`
- Artifact: `functions-artifact.zip` (inventory hash / build id)
- Deploy command: `azure/functions-action@v1` run URL, or pasted `az functionapp deploy` output
- Hosting confirmation: `az functionapp show` excerpt (`kind`, `sku.name`, `sku.tier`)

### B. Registration Proof — `pass` | `partial` | `fail`
- `az functionapp function list` output naming all eight lane functions
- `/admin/functions` output naming all eight lane functions
- Note: registration is presence only, not success

### C. Execution Proof — `pass` | `partial` | `fail`
- HTTP: response body fragment showing `runId` + terminal `status`
- Timer: log excerpt `legacy-fallback.timer.entry` … run summary
- Return code / status: `<code>`

### D. Persistence Proof — `pass` | `partial` | `fail`
- `Legacy Project Fallback Sync Runs` row (filtered by `RunId eq '<runId>'`): `Status`, `CompletedUtc`, all counters (`FoldersScanned`, `RecordsCreated`, `RecordsUpdated`, `RecordsMatched`, `RecordsReviewRequired`, `RecordsUnmatched`, `RecordsMarkedInactive`, `ErrorCount`), all operational fields (`DurationMs`, `SourceFailureCount`, `MatchAnomalyExceeded`, `FirstErrorMessage`)
- `Legacy Project Fallback Registry` sample (filtered by `DiscoveryRunId eq '<runId>'`): at least one tagged row (skip for dry-runs)

### E. Telemetry Proof — `pass` | `partial` | `fail`
- App Insights query(s) with the `invocationId` and `legacy-fallback.boundary.success` markers for `startSyncRun`, `graph.listRootFolders.first`, `registry.upsert.first-after-sync-run-start`
- If `MatchAnomalyExceeded = true`: matching `legacy-fallback.match-anomaly threshold exceeded` warn
- Any `legacy-fallback.boundary.failure` entries for this `runId`, surfaced here rather than swallowed

## 3. Residual risks and follow-ups

- `<risk 1>` — owner, mitigation or acceptance
- `<risk 2>` — owner, mitigation or acceptance

## 4. Scope statement

Explicit. For example: **staging hardened, production cutover not executed**, or **production cutover closed for <env>**.

## 5. Signatures

- Operator: `<name>` — date
- Reviewer: `<name>` — date
