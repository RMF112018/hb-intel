# Prompt 04 — Extend Runtime Telemetry and Correct KQL Docs

## 1. Objective

Make the registry optimization path observable and correct the stale Application Insights query examples so future operators query the actual telemetry table.

Current issues:
- the package needs live proof of filter/cache effectiveness,
- earlier closeout examples targeted `customEvents`,
- live Azure Logs proved telemetry is emitted through `traces` JSON payloads.

## 2. Repo-truth context

Inspect:

- `backend/functions/src/hosts/my-work-read-model/read-models/project-links/my-project-links-runtime-diagnostics.ts`
- `backend/functions/src/hosts/my-work-read-model/read-models/project-links/my-project-links-read-model-provider.ts`
- relevant diagnostics/provider tests
- B05.8 closeout and supporting KQL docs under the My Dashboard plan path, but only the exact files that still contain stale `customEvents` query blocks

Context-efficiency rule:
Do not re-read files that are already in your active context unless needed to confirm drift, dependencies, or uncertainty after changes.
If a file has already been loaded and remains reliable in context, use that context instead of reopening it.
Only re-read a file if it may have changed, an exact interface or line-level detail is required, or validation/evidence requires a fresh read.

## 3. Architectural guardrails

- Telemetry fields must remain privacy-safe primitives / closed enums.
- Do not emit:
  - URLs,
  - UPNs,
  - OIDs,
  - project names,
  - role arrays,
  - raw Graph filter strings,
  - raw error bodies.
- Do not alter the business read-model DTO solely for telemetry.
- Do not modify Adobe runtime code.
- Do not modify frontend runtime code.
- Do not modify package, lockfile, manifest, workflow, CI, or deployment files.

Mandatory preflight:
1. Run and record:
   - `git status --short`
   - `git branch --show-current`
   - `git log --oneline -20`
   - `md5 pnpm-lock.yaml`
2. Identify unrelated pre-existing changes. Do not edit, stage, or absorb them.
3. Never use broad `git add .`. Stage exact intended paths only.
4. Before commit, run:
   - `git diff --check`
   - `git diff --cached --name-only`
5. After validation, run `md5 pnpm-lock.yaml` again and report before/after values.

## 4. Implementation instructions

### A. Extend Project Links source timing telemetry

Add safe fields sufficient to prove the optimization path:

- `registryCacheState`
  - `hit`
  - `miss`
  - `coalesced`
- `registryCacheAgeMs`
- `registryServerFilterApplied`
- `registryFilterMode`
  - use a stable closed string such as `active-launch-eligible`

Only include values that are truthfully available. Do not invent placeholders.

### B. Correct KQL documentation

Patch stale KQL examples from:

```kusto
customEvents
```

to the actual repository posture:

```kusto
traces
| extend payload = parse_json(message)
| where tostring(payload._telemetryType) == "customEvent"
```

At minimum, fix the high-leverage closeout queries for:
- handler durations,
- Adobe stage pivot,
- Project Links source timings,
- Project Links source + reconcile join.

### C. Preserve source timings
Existing duration/row-count telemetry must remain intact.

## 5. Verification

Run:

```bash
git diff --check
pnpm --filter @hbc/functions test
pnpm --filter @hbc/functions check-types
```

Add tests proving:
- diagnostic property shapes remain safe,
- new cache/filter telemetry fields are emitted as expected,
- docs no longer present the stale `customEvents` query posture for the patched query set.

## 6. Documentation updates

Required in this prompt:
- patch the KQL docs,
- patch any B05.8 evidence/closeout note that still instructs operators to use `customEvents`,
- add one concise note explaining that the telemetry records are JSON envelopes inside `traces.message`.

## 7. Deliverables / exit criteria

Return:
- files changed,
- exact telemetry fields added,
- exact docs patched,
- test/typecheck outputs,
- lockfile MD5 before/after,
- staged-file proof,
- attestation that telemetry remains privacy-safe.

### Expected commit language

```text
Commit summary
obs(my-projects): expose registry filter/cache timing posture and correct KQL traces

Commit description
Extend Project Links runtime diagnostics so live evidence can distinguish registry cache state and server-filter application, while preserving existing duration and row-count telemetry.

Correct My Dashboard Application Insights query guidance to use trace-backed JSON telemetry envelopes rather than stale customEvents table queries. No Adobe, frontend runtime, tenant, package, lockfile, manifest, workflow, or deployment changes.
```
