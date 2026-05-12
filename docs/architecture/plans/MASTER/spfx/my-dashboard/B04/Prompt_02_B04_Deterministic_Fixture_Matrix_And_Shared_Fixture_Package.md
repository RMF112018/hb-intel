# Prompt 02 — B04 Deterministic Fixture Matrix and Shared Fixture Package

## 1. Objective

Implement the deterministic My Work fixture matrix required by B04, covering home and Adobe queue scenarios with stable timestamps, warnings, counts, pagination, and source-open URL optionality.

## 2. Why this work exists

B04 intentionally makes fixtures first-class. The My Dashboard shell, frontend client, backend mock provider, and later UI implementation all need stable state scenarios before live Adobe provider work exists.

## 3. Current repo-truth problem or gap

No B04 My Work fixture folder exists. The repo has PCC fixture conventions, but no My Work available/empty/paged/partial/config/auth/principal/source/backend fallback scenario package exists yet.

## 4. Attached B04 authority / plan basis

Use the attached **B04 — My Work Read Models, Routes, Error Taxonomy, and Fixture Architecture Development** artifact as the authoritative batch plan. Preserve these closed decisions:

- Fixture default generated time: `2026-05-12T12:00:00.000Z`
- Scenario naming and state matrix from B04
- Available populated Adobe queue contains exactly six items, one per actionable Adobe status
- Exactly two populated fixture items should expire within seven calendar days of the default fixture timestamp
- Home projection includes queue summary plus at most five preview items
- Paged fixture uses an opaque `nextCursor`
- At least one populated fixture item omits `sourceOpenUrl` without forcing partial state.

## 5. Exact files, folders, docs, and symbols to inspect

Inspect:
- `packages/models/src/pcc/fixtures/*`
- `apps/project-control-center/src/api/pccFixtureReadModelClient.ts` for deterministic clock and degraded-shape conventions
- Prompt 01 outputs under `packages/models/src/myWork/`
- B04 support file `02_B04_Target_Contracts_And_Route_Map.md`

## 6. Required implementation outcome

Create:
```text
packages/models/src/myWork/fixtures/
├── index.ts
├── myWorkHomeReadModels.ts
└── adobeSignActionQueueReadModels.ts
```

Extend or create tests so fixture scenarios are type-valid, deterministic, and individually addressable.

## 7. Detailed change instructions

1. Define `MY_WORK_FIXTURE_GENERATED_AT_UTC` exactly as:
   ```ts
   '2026-05-12T12:00:00.000Z'
   ```

2. Create queue fixture item data with exactly six populated items, one for each B04 Adobe actionable status/action pair.

3. Use stable, deterministic IDs. Prefer a simple and inspectable `itemId` scheme such as:
   ```text
   adobe-sign:{agreementId}
   ```
   if aligned to B04 and the surrounding contract file.

4. Populate the queue summary for the six-row fixture with counts:
   - total 6
   - one per action bucket
   - expiring soon 2

5. Ensure at least:
   - one queue item has `sourceOpenUrl`,
   - one queue item omits `sourceOpenUrl`.

6. Implement queue fixtures:
   - `ADOBE_SIGN_QUEUE_AVAILABLE`
   - `ADOBE_SIGN_QUEUE_EMPTY`
   - `ADOBE_SIGN_QUEUE_AVAILABLE_PAGED`
   - `ADOBE_SIGN_QUEUE_PARTIAL`
   - `ADOBE_SIGN_QUEUE_CONFIGURATION_REQUIRED`
   - `ADOBE_SIGN_QUEUE_AUTHORIZATION_REQUIRED`
   - `ADOBE_SIGN_QUEUE_PRINCIPAL_UNRESOLVED`
   - `ADOBE_SIGN_QUEUE_SOURCE_UNAVAILABLE`
   - `ADOBE_SIGN_QUEUE_BACKEND_UNAVAILABLE`

7. Implement home fixtures:
   - `MY_WORK_HOME_AVAILABLE`
   - `MY_WORK_HOME_EMPTY`
   - `MY_WORK_HOME_PARTIAL`
   - `MY_WORK_HOME_CONFIGURATION_REQUIRED`
   - `MY_WORK_HOME_AUTHORIZATION_REQUIRED`
   - `MY_WORK_HOME_PRINCIPAL_UNRESOLVED`
   - `MY_WORK_HOME_SOURCE_UNAVAILABLE`
   - `MY_WORK_HOME_BACKEND_UNAVAILABLE`

8. Home available fixture must include:
   - actor summary,
   - healthy summary counts,
   - source readiness,
   - queue home projection with summary and first five preview items.

9. Degraded/non-ready fixtures must:
   - use valid envelope shapes,
   - zero/empty only the affected route data,
   - carry the required structured warning code.

10. Create `fixtures/index.ts` that exports all fixture constants and any safe helper builders required for reuse.

11. Add tests verifying:
   - scenario keys exist,
   - generated timestamp is deterministic,
   - preview item limit is five,
   - pagination fixture has `hasMore: true` and non-empty `nextCursor`,
   - partial fixture returns a safe subset, not malformed items,
   - warning codes align to source statuses,
   - URL optionality is preserved.

## 8. What done looks like

Done means:
- shared fixture files exist,
- every B04 scenario is present,
- populated queue fixture exercises the full six-status MVP contract,
- fixture tests prove deterministic and state-correct behavior,
- no fixture mutates another fixture at test/runtime.

## 9. Strict constraints / prohibitions

- Do not implement client or backend provider classes in fixture files.
- Do not call Adobe or any external service.
- Do not use random IDs or `Date.now()`.
- Do not overstate totals as provider-wide if the fixture count basis is `returned-items`.
- Do not change B04 status vocabulary.

## 10. Validation requirements

Run:
```text
pnpm --filter @hbc/models check-types
pnpm --filter @hbc/models test
```

## 11. Proof of closure

Provide:
- full fixture export list,
- counts/statuses present,
- deterministic timestamp confirmation,
- the populated six-item Adobe queue coverage,
- the exact test results.

## 12. Commit / closeout expectations

Do not commit unless asked. Return a concise implementation summary that makes it easy to confirm the fixture matrix is fully closed.

## 13. Do not re-read files already in active context unless needed to confirm drift

Do not re-read files that are still available in your active context or memory unless you need to confirm repo drift, resolve a conflict, or verify an implementation detail that cannot be trusted from the current context.
