# 06 — Ask-HBI, Unified Search, Knowledge Reuse, and Warranty Guards

## Objective

Implement or verify Ask-HBI / unified-search / cross-project knowledge / warranty trace guardrails so HBI remains project-scoped, citation-backed, permission-filtered, refusal-capable, no-blame for warranty, and preview-safe.

## Required Instruction

```text
Do not re-read files that are still within your current context or memory unless you need to verify stale, missing, or contradictory repo truth.
```

## Working Directory

```text
/Users/bobbyfetting/hb-intel
```

## Likely Files To Inspect/Edit

```text
apps/project-control-center/src/surfaces/unifiedLifecycle/
apps/project-control-center/src/surfaces/projectHome/
apps/project-control-center/src/components/
apps/project-control-center/src/tests/
packages/models/src/pcc/UnifiedLifecycle.ts
packages/models/src/pcc/fixtures/
```

## Required Behavior

Verify or implement:

- Ask-HBI card/panel is embedded inside approved surface(s), not routed.
- Initial state does not auto-query unless existing tests intentionally allow it.
- Sample-query or explicit action triggers fixture/backend read-model query.
- Grounded answers must have citations.
- Refusals render refusal reason and zero citations.
- Empty citation grounded answers are dropped or refused.
- Permission-restricted/degraded envelopes do not render answer rows.
- Restricted/privileged/withheld synthetic secrets do not appear in DOM.
- HBI disclaimer states HBI is not source of truth.
- No live LLM/vector/search/Graph/Procore/Sage/CRM/Adobe/auth runtime calls.
- Warranty responsibility recommendations never render when evidence threshold is insufficient.
- Cross-project references render only summary-safe/authorized records.

## Required Tests

- Grounded answer citation chips.
- Refusal taxonomy for all canonical reasons.
- No answer rows in unavailable/degraded/permission-restricted states.
- No source-of-truth claim language except negated disclaimer.
- No live URLs.
- No forbidden imports/tokens/source scans.
- Prompt-injection / sensitive string fixture guard where repo conventions support it.

## Prohibited Scope

- No free-form production LLM chat.
- No vector index.
- No live search provider.
- No external APIs.
- No tenant mutation.
- No source-system mutation.
- No responsibility/liability/claim/accounting conclusions.

## Validation

Likely:

```bash
pnpm --filter @hbc/models check-types
pnpm --filter @hbc/models test
pnpm --filter @hbc/spfx-project-control-center check-types
pnpm --filter @hbc/spfx-project-control-center test
```

Run only repo-supported commands after script inspection.

## Commit Summary

If committing:

```text
test(spfx-pcc): harden unified lifecycle hbi and security guards
```

## Final Output Requirements

Report HBI/security/warranty/cross-project behavior, tests, forbidden-import proof, files changed, and lockfile MD5.
