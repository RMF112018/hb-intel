# Prompt 06 — Validate No Durable Cache, No Metadata Leakage, and Section 18 Taxonomy

## Role

Act as an implementation auditor. This prompt does not add broad new features; it proves B06 hard gates after prior prompts.

## Objective

Run a focused cross-layer validation audit for:

- no auto-polling,
- no durable queue cache,
- no browser queue persistence,
- no sensitive telemetry/evidence leakage,
- correct Section 18 route/source-state taxonomy,
- correct refresh-token and throttling behavior.

## Required validation categories

### A. Refresh behavior
Prove:
- focused module has manual refresh,
- no `setInterval` / timer polling,
- no visibility/focus refresh trigger,
- no duplicate in-flight request behavior.

### B. Cache absence
Search for and inspect any hits around:
- localStorage/sessionStorage queue persistence,
- queue snapshot storage,
- “last known queue” replay,
- durable server-side queue cache,
- stale replay.

If any such path exists, treat it as a B06 failure unless it is clearly fixture/test-only and harmless.

### C. Telemetry/privacy
Prove runtime logging/telemetry does not include:
- tokens,
- codes,
- callback query data,
- agreement title,
- sender name/email,
- source URL,
- raw provider body.

### D. Route taxonomy
Confirm B04/B06 mapping:
- source/business states return HTTP 200 + envelope,
- malformed query remains 400,
- missing/invalid bearer token remains 401,
- true backend exceptions remain backend errors,
- throttling and refresh-token failure map to their intended source statuses.

### E. Evidence hygiene
Confirm:
- curated evidence sanitization exists or is deliberately prepared,
- unsafe artifact paths are blocked,
- no sensitive queue content is committed as evidence.

## Required commands

Run repo-appropriate equivalents of:

```bash
pnpm --filter @hbc/spfx-my-dashboard check-types
pnpm --filter @hbc/spfx-my-dashboard test
pnpm --filter @hbc/functions check-types
pnpm --filter @hbc/functions test
```

Run additional targeted tests or grep/search commands that materially prove the B06 hard gates.

## Output format

Return:

1. PASS / FAIL
2. Validation commands and results
3. Hard-gate matrix:
   - auto-polling absent
   - durable cache absent
   - queue metadata absent from telemetry/evidence
   - Retry-After handling present where applicable
   - refresh-token failure → authorization-required
   - Section 18 taxonomy preserved
4. Any defects found
5. Required follow-up before final closeout, if any
