# Comprehensive Test Suite — Architecture

Phase-14 testing package · Prompt-01 deliverable.

## Suite structure

```
scripts/testing/people-kudos/
├── shared/            Shared test foundation (config, auth, SP client, assertions, logging, cleanup, fixtures)
│   ├── types.ts       Shared types: RunContext, StepResult, SuiteModule, WorkflowStatus, etc.
│   ├── config.ts      loadConfig(), validateConfig(), HarnessConfig defaults
│   ├── auth.ts        createTokenSource() — env var → CLI arg → az cli fallback; lazy, dry-run safe
│   ├── context.ts     createRunContext(), generateRunId(), synthetic ID builders
│   ├── spClient.ts    spFetch(), spCreateItem(), spPatchItem(), spGetItem(), spQueryItems(), spDeleteItem()
│   ├── assertions.ts  assertFieldEquals(), assertTruthy(), assertDefined(), recordResult()
│   ├── logging.ts     logResult(), logDry(), printSummary(), summarizeResults()
│   ├── cleanup.ts     cleanupTestItems() — scoped by TEST-HBI-{runId}- prefix
│   └── fixtures.ts    buildKudosDraftFields(), all patch builders, buildAnnouncementFields(), buildCelebrationFields()
├── kudos/             HB Kudos comprehensive workflow suite (Prompt-02)
├── people-culture/    People & Culture comprehensive workflow suite (Prompt-03)
├── companions/        Companion / role-aware workflow suite (Prompt-04)
├── smoke/             Packaging + deployment smoke suite (Prompt-05)
├── runAll.ts          Full-suite runner (all 4 domains + cleanup)
├── runSuite.ts        Filtered runner (--suite <name>)
└── config.example.json
```

## Shared helper responsibilities

| Module | Responsibility |
|---|---|
| `types.ts` | All shared interfaces. `SuiteModule` is the extension point for domain suites. |
| `config.ts` | Loads JSON config, merges with defaults, validates required fields. |
| `auth.ts` | Produces a lazy bearer-token accessor. Never called in dry-run mode. |
| `context.ts` | Creates a `RunContext` with unique runId, token source, empty result accumulators. |
| `spClient.ts` | Generic SharePoint REST helpers. Every operation checks `ctx.dryRun` and logs intent instead of calling fetch. Binds by list title via `getbytitle()`. |
| `assertions.ts` | Records structured `StepResult` entries. Dry-run returns `status: 'dry'`. |
| `logging.ts` | Console output with status icons (✓ ✗ ! - ·). Summary tally at end. |
| `cleanup.ts` | Queries kudos rows by `startswith(KudosId, 'TEST-HBI-{runId}-')` and deletes. Iterates audit rows by exact KudosId match. |
| `fixtures.ts` | Deterministic synthetic data generators for all list item types. |

## Config / runtime prerequisites

- **Node 20+** with native `fetch`.
- **`tsx`** for TypeScript execution (installed at repo root as a dev dependency).
- **SharePoint bearer token** — obtained via one of:
  1. `SHAREPOINT_BEARER_TOKEN` environment variable
  2. `--token <bearer>` CLI argument
  3. `az account get-access-token --resource <site-origin>` (requires preauthorized Azure CLI client)
- Token is **not required** for `--dry-run` mode (the default).

## Synthetic data rules

- Every synthetic row uses `KudosId = TEST-HBI-{runId}-{seq}` where `runId` is a unique ISO+hex stamp.
- Every synthetic row uses `Headline = [TEST][HBI] {runId} {seq} {label}`.
- The `testPrefix` config value (`TEST-HBI`) is the stable cleanup anchor — it never changes between runs.
- Cleanup queries by `startswith(KudosId, prefix)` so it can never accidentally touch non-test rows.

## Cleanup policy

- By default, `cleanup: true` in the config triggers a post-suite cleanup pass.
- Cleanup deletes ALL kudos rows matching the run's synthetic prefix, then iterates sequences 1–32 to delete matching audit rows.
- Pass `--no-cleanup` to preserve synthetic data for manual inspection.
- Cleanup is dry-run safe — in dry-run mode it logs intents without deleting.

## Extension model

To add a new suite:
1. Create a new directory under `scripts/testing/people-kudos/` (e.g. `new-domain/`).
2. Export a `SuiteModule` from `index.ts` with a `name` and an `async run(ctx)` method.
3. Import and register it in `runAll.ts` and `runSuite.ts`.
4. The `run` method receives a `RunContext` with config, token, runId, and result accumulators.
5. Use `spCreateItem()`, `spPatchItem()`, `spGetItem()`, `spQueryItems()`, `spDeleteItem()` for SharePoint operations.
6. Use `assertFieldEquals()`, `assertTruthy()`, `assertDefined()`, `recordResult()` for assertions.
7. Use fixtures from `shared/fixtures.ts` for synthetic data generation.
