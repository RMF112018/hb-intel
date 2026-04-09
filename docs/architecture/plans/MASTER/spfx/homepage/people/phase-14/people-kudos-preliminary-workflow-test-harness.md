# Phase-14 — Preliminary People & Culture + HB Kudos workflow test harness

**Location**: `scripts/testing/people-kudos-workflow/`
**Matrix**: `people-kudos-preliminary-workflow-test-matrix.md` (same directory as this file)
**Run ID format**: `hbi-{yyyymmddhhmmss}-{hex6}`

---

## 1. What is being tested

This is a disciplined, first-pass executable harness that exercises the
People & Culture / HB Kudos operational flow against the live SharePoint
schema extracted in the Phase-14 schema work. It is intentionally a
single-file runner + one helpers module + one example config — not a QA
automation platform.

**Currently covered end-to-end (FULL in the matrix):**

- HB Kudos lifecycle on the `People Culture Kudos` list:
  `submit → revisionRequested → resubmit → approve → schedule →
  unschedule → pin → feature → publishWindow → celebrateCountIncrement →
  visibility{public,associatedOnly,internalOnly} → remove → restore`
  plus separate `reject` and `withdraw` branches on their own synthetic
  items.
- Audit journal parity on the `Kudos Audit Events` list: a matching audit
  row is POSTed for each proven lifecycle transition, then queried back
  by `KudosId`.
- Schema discovery for the two unproven sibling lists
  (`People Culture Announcements`, `People Culture Celebrations`) via a
  `--discover` subcommand that writes raw `.json` snapshots to the
  phase-14 docs directory.
- Safety + cleanup: deterministic `TEST-HBI-{runId}-{seq}` prefixing,
  `[TEST][HBI]` headline marker, prefix-scoped cleanup that cannot touch
  non-synthetic rows.

---

## 2. What is **not yet** testable

- **People Culture Announcements** and **People Culture Celebrations** —
  schema not extracted. All lifecycle rows are marked BLOCKED in the
  matrix. The only thing the harness will do for these lists in a live
  run is run `discoverListSchema()` and write raw field/view/content-type
  snapshots to this same phase-14 directory so a follow-up pass can
  extend the harness.
- **Taxonomy-backed recipient fields** on HB Kudos (`TeamRecipients`,
  `DepartmentRecipients`, `ProjectGroupRecipients`). Writing TaxonomyField
  values requires term-store resolution (SspId + TermSetId + TermId
  lookups) that is intentionally out of scope for the preliminary harness.
  The schema is proven; the helpers just log a WARN row and move on.
- **Downstream homepage rendering / audience scoping / moderation UI
  behavior**. The harness asserts SharePoint-layer persistence only. Any
  claim in the form "the homepage will display this item" is a **PARTIAL**
  assertion at this stage — it proves the persistence inputs the renderer
  reads, not the renderer itself.
- **`CelebrateCount` ETag race safety**. Read-modify-write on
  `CelebrateCount` is deliberately naive for a single-runner preliminary
  harness. A WARN is recorded; concurrent runs must not target the same
  `KudosId` without ETag handling.
- **`flagAdminReview` / `clearAdminReview` / `claim` / `reassign` /
  `unpin` / `unfeature`** audit events. The `EventType` choice for each
  is proven in the audit-list schema, and the helpers accept all 18
  `KudosEventType` literals, but the preliminary runner focuses on the
  primary lifecycle path and skips these to keep the happy-path readable.
  Extending the runner is a pure addition.

---

## 3. Schema dependencies

The harness and matrix are grounded in these ground-truth artifacts
(extracted 2026-04-09, same phase-14 directory):

- `people-culture-kudos-list-schema.normalized.json` — 150 fields, 62
  custom, full `WorkflowStatus` enum, prominence columns, scheduling
  columns, taxonomy recipients, visibility mode.
- `people-culture-kudos-list-schema.raw.json` — verbatim PnP/CSOM
  response for the same list, used when the normalized view drops detail
  (e.g. taxonomy `SspId` / `TermSetId`).
- `kudos-audit-events-list-schema.normalized.json` — 93 fields, 9
  custom, 18-value `EventType` enum.
- `kudos-audit-events-list-schema.raw.json` — verbatim.
- `people-culture-kudos-sharepoint-schema-report.md` — narrative
  explanation of each field's integration role.

When any of those files change, re-read §A of the matrix before editing
the helpers — the InternalName strings in `peopleKudosWorkflowHelpers.ts`
are the single translation point between schema truth and runner code.

---

## 4. Assumed field mappings (the single source of truth in code)

All runner-level field mappings live in
`scripts/testing/people-kudos-workflow/peopleKudosWorkflowHelpers.ts` in
the `buildKudos*Patch()` and `buildKudosDraftFields()` functions. That is
the only place the harness should encode SharePoint field InternalName
strings. Everything else (runner, matrix doc, design doc) references
those helpers.

The field mapping uses these conventions:

- **Person** fields are written as `{InternalName}Id = <userId>`. Example:
  `SubmittedById`, `ApprovedById`, `RevisionRequestedById`. This is the
  SharePoint REST convention for single User fields.
- **UserMulti** fields are written as `{InternalName}Id = { results: [<userId>, …] }`.
  Example: `IndividualRecipientsId = { results: [42] }`. The preliminary
  harness leaves the UserMulti round-trip wired via the helper but does
  not exercise it on every run — see §2.
- **Choice** fields are written as raw string values from the matching
  `WorkflowStatus`, `ProminenceIntent`, `VisibilityMode`, or
  `KudosEventType` TypeScript literal type. The literal types are kept
  in sync with the `choices[]` arrays in the normalized schema file.
- **DateTime** fields are ISO-8601 strings (`new Date().toISOString()`),
  which SharePoint accepts directly.
- **Boolean** fields are JS booleans.
- **Note** fields (`RejectionReason`, `RemovedReason`, `RevisionGuidance`,
  `OldValue`, `NewValue`, `PublicNote`, `InternalNote`) are plain strings;
  for audit `OldValue` / `NewValue` the harness writes
  `JSON.stringify(stateObject)` so the journal is reconstructable.
- **Taxonomy** fields (`TeamRecipients`, `DepartmentRecipients`,
  `ProjectGroupRecipients`) are **not written** by this harness. See §2.

If a SharePoint PATCH ever rejects a value because of a field-name
convention mismatch (e.g. `SubmittedBy` vs `SubmittedById`), the fix is
always in the helper file — never in the runner and never in the docs.

---

## 5. Auth / runtime prerequisites

The harness is runnable in three modes, each with different auth needs.

### 5.1 Dry-run mode (no auth required)

```bash
pnpm tsx scripts/testing/people-kudos-workflow/runPeopleKudosWorkflowTest.ts --dry-run --verbose
```

No token is resolved. No SharePoint call is made. The runner resolves
the full flow graph, builds the exact payloads it would POST/PATCH, and
logs every intended action to stdout. Useful for:

- reviewing which fields are touched in each transition before a live
  run,
- typecheck verification in CI without SharePoint access,
- diffing two harness versions against each other by capturing the log
  and comparing.

### 5.2 Live mode with an explicit bearer token

```bash
SHAREPOINT_BEARER_TOKEN='<preauthorized-sp-token>' \
  pnpm tsx scripts/testing/people-kudos-workflow/runPeopleKudosWorkflowTest.ts --live --verbose
```

…or:

```bash
pnpm tsx scripts/testing/people-kudos-workflow/runPeopleKudosWorkflowTest.ts \
  --live --token '<preauthorized-sp-token>'
```

The token must be scoped to the SharePoint resource for this tenant
(`aud = 00000003-0000-0ff1-ce00-000000000000`) and the caller must have
at least contribute permission on both the `People Culture Kudos` and
`Kudos Audit Events` lists.

**How to obtain a token interactively in this tenant**: the Phase-14
schema extraction work (see `people-culture-kudos-sharepoint-schema-report.md`
§2) proved that local Azure CLI cannot mint a SharePoint-scoped token for
a preauthorized tenant app in this environment (`AADSTS65002`). The
working local path is:

```powershell
# In pwsh:
Connect-PnPOnline `
  -Url 'https://hedrickbrotherscom.sharepoint.com/sites/HBCentral' `
  -ClientId '9bc3ab49-b65d-410a-85ad-de819febfddc' `
  -Tenant '0e834bd7-628b-42c8-b9ec-ecebc9719be4' `
  -Interactive
Get-PnPAccessToken
```

Paste the resulting string into `SHAREPOINT_BEARER_TOKEN` and run the
harness in `--live` mode. Tokens expire — refresh when you see a
`401 Unauthorized` from the first call.

### 5.3 Live mode with Azure CLI fallback

If a future tenant change preauthorizes the Azure CLI public client
(`04b07795-8ddb-461a-bbee-02f9e1bf7b46`) on SharePoint, the harness's
third-priority token source runs:

```bash
az account get-access-token --resource https://hedrickbrotherscom.sharepoint.com --query accessToken -o tsv
```

No env var required; no `--token` flag required. This path is currently
not viable in this tenant; keep the explicit-token path for now.

---

## 6. How to run

```bash
# dry-run everything (default)
pnpm tsx scripts/testing/people-kudos-workflow/runPeopleKudosWorkflowTest.ts --dry-run --verbose

# dry-run just the Kudos lifecycle
pnpm tsx scripts/testing/people-kudos-workflow/runPeopleKudosWorkflowTest.ts --dry-run --only-kudos

# dry-run just the schema discovery
pnpm tsx scripts/testing/people-kudos-workflow/runPeopleKudosWorkflowTest.ts --dry-run --only-discover

# live: full lifecycle + audit parity + discover, cleanup on
SHAREPOINT_BEARER_TOKEN='…' \
  pnpm tsx scripts/testing/people-kudos-workflow/runPeopleKudosWorkflowTest.ts --live

# live: Kudos lifecycle only, leave rows in place for inspection
SHAREPOINT_BEARER_TOKEN='…' \
  pnpm tsx scripts/testing/people-kudos-workflow/runPeopleKudosWorkflowTest.ts --live --only-kudos --no-cleanup

# live: schema capture only, writes raw JSON files to phase-14/
SHAREPOINT_BEARER_TOKEN='…' \
  pnpm tsx scripts/testing/people-kudos-workflow/runPeopleKudosWorkflowTest.ts --live --only-discover

# override config
pnpm tsx scripts/testing/people-kudos-workflow/runPeopleKudosWorkflowTest.ts \
  --dry-run --config scripts/testing/people-kudos-workflow/peopleKudosWorkflow.config.example.json
```

### 6.1 Exit codes

- `0` — no `fail` rows in the result table.
- `1` — at least one `fail` row, OR a fatal top-level error
  (uncaught exception, missing token in live mode, etc.).
- `2` — unknown CLI flag.

---

## 7. Dry-run vs live behavior

| Behavior | Dry-run | Live |
| -------- | ------- | ---- |
| Token resolved | no | yes (lazy, only on first SP call) |
| HTTP writes to SharePoint | no | yes |
| HTTP reads from SharePoint | no | yes |
| Synthetic IDs in `RunContext.created*` | no (helpers return fake IDs so downstream steps keep resolving) | yes (populated with real item IDs for cleanup) |
| Field-level assertions | logged as `dry` status | evaluated against real values (`pass` / `fail`) |
| `--verbose` behavior | logs every intended HTTP call + body preview | logs every step result |
| Exit code | `0` unless runner raises | `0` unless any step `fail`s |

Dry-run is the default mode. You must opt in to writes with `--live`.

---

## 8. Cleanup behavior

Cleanup runs at the end of every invocation (including on partial
failures, because it's wrapped in its own try/catch). It does two
deletions scoped strictly to the current run:

1. `People Culture Kudos` — `GET /items?$filter=startswith(KudosId,'TEST-HBI-{runId}-')`
   then DELETE each returned row.
2. `Kudos Audit Events` — for `seq` in `1..32`, construct
   `TEST-HBI-{runId}-{seq}`, query the audit list with
   `$filter=KudosId eq '…'`, DELETE each returned row.

**Why the `TEST-HBI-` prefix is load-bearing**: cleanup **cannot** delete
a row it did not create, because the prefix includes the per-invocation
`runId` (a fresh `hbi-{timestamp}-{hex}` string). A cleanup pass will
never touch rows from a prior run, a human, or a production ingestion
pipeline — the filter literally cannot match them.

`--no-cleanup` skips the cleanup pass entirely. Use it when you want to
inspect synthetic rows in the SharePoint UI after a run, then clean them
up manually or via a re-run that targets the same `runId` (the runner
intentionally does **not** support that — a fresh `runId` is generated
every invocation).

---

## 9. Known limitations

1. **Schema unknowns for Announcements + Celebrations** — see §2. The
   `--discover` subcommand mitigates this.
2. **Taxonomy recipient writes** — not supported; term-store helpers are
   out of scope.
3. **`KudosId` index missing** on `Kudos Audit Events`. SPO allows
   unindexed `$filter` at low volume; the harness logs a WARN.
4. **`CelebrateCount` race** — no ETag. Single-runner only.
5. **Visibility-mode semantics** — persistence only; downstream
   audience scoping is not exercised.
6. **Homepage rendering** — persistence only; the renderer is not under
   test here.
7. **Single-site hard-coded default** — `siteUrl` defaults to
   `https://hedrickbrotherscom.sharepoint.com/sites/HBCentral`. Override
   via `--config`.
8. **No dependency on `@pnp/sp`** — the helpers use plain `fetch`. This
   is a deliberate departure from `scripts/create-*-list.ts` and is
   justified in the helpers header comment: `@pnp/sp` /
   `@azure/identity` are installed under `backend/functions/` and do
   not resolve from the repo root, which is where `tsx` runs the harness
   from. Keeping the harness dependency-free sidesteps a workspace-package
   maneuver and keeps the file count minimal.
9. **No CI wiring yet** — this harness runs manually. See §10.

---

## 10. Recommended next steps

Before the harness can become a fuller, regression-grade automated
harness, the following gaps need to close:

1. **Tenant preauthorization** for either the Azure CLI public client,
   the SharePoint Online Management Shell client, or a dedicated
   `hb-intel-automation` app registration. Decide which of those is the
   long-term token source and update the harness auth chain accordingly.
2. **Schema extraction for Announcements + Celebrations**. Run the
   harness in `--only-discover --live` mode, commit the raw JSON files
   under phase-14, and add corresponding field mapping + lifecycle rows
   to the helpers and matrix.
3. **`KudosId` index on `Kudos Audit Events`**. Adds ~5 minutes of
   latency tolerance back to the audit-parity flows.
4. **Term-store helpers** for taxonomy recipient writes. This probably
   belongs in its own small helper module (`taxonomyHelpers.ts`), not in
   `peopleKudosWorkflowHelpers.ts`, to keep the preliminary harness
   simple.
5. **ETag round-trip for `CelebrateCount`**. Add a `getKudosItemWithEtag`
   and `patchKudosItemWithEtag` helper pair; update the celebrate step
   to use them.
6. **CI smoke** — wire the dry-run into `.github/workflows/*` as a
   non-auth smoke test that runs on every phase-14 PR. Live runs should
   remain gated on a tenant-authorized secret.
7. **Extend the runner** to exercise the audit `EventType` choices the
   preliminary harness currently skips (`flagAdminReview`,
   `clearAdminReview`, `claim`, `reassign`, `unpin`, `unfeature`). The
   helper-level type union already admits them; this is a pure runner
   addition.
8. **Promote from `scripts/testing/` to a dedicated workspace package**
   if the harness grows beyond three files. Before that point, its
   current location is correct — `scripts/` is the established home for
   repo-wide tooling that doesn't belong to a single app.

---

## 11. File inventory

| File | Role |
| ---- | ---- |
| `scripts/testing/people-kudos-workflow/runPeopleKudosWorkflowTest.ts` | CLI entry point + orchestration |
| `scripts/testing/people-kudos-workflow/peopleKudosWorkflowHelpers.ts` | Auth, fetch, field builders, assertions, cleanup, discover |
| `scripts/testing/people-kudos-workflow/peopleKudosWorkflow.config.example.json` | Config template (copy to `peopleKudosWorkflow.config.json` and pass with `--config`) |
| `docs/architecture/plans/MASTER/spfx/homepage/people/phase-14/people-kudos-preliminary-workflow-test-matrix.md` | Proven vs blocked matrix (the authoritative scope contract) |
| `docs/architecture/plans/MASTER/spfx/homepage/people/phase-14/people-kudos-preliminary-workflow-test-harness.md` | This document |

---

## 12. Do not run against production data without caution

This harness writes synthetic rows and deletes them. The prefix invariant
(`TEST-HBI-{runId}-`) makes that safe **in principle** — cleanup cannot
touch non-synthetic rows. But before any live run against a production
SharePoint tenant:

1. Confirm the `runId` printed at startup matches what you expect.
2. Review a recent `--dry-run --verbose` output for the same flags to
   see exactly which fields the runner will write.
3. Review the results table at the end of the run and confirm cleanup
   ran (`cleanup.kudos` + `cleanup.audit` rows both `pass`).
4. If any cleanup row is `warn` or `fail`, manually inspect the live
   list for synthetic rows matching `startswith(KudosId,'TEST-HBI-{runId}-')`
   and delete them before moving on.
