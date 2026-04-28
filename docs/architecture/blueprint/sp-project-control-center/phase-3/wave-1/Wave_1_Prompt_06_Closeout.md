# Phase 3 Wave 1 — Prompt 06 Closeout

Generated: 2026-04-28
Prompt: `docs/architecture/plans/MASTER/spfx/pcc/phase-03/wave-01/Prompt_06_Wave_1_Fixtures_Feature_Flags_and_NoMutation_Guards.md`
Companions: `Wave_1_Scope_Lock.md`, `Wave_1_Repo_Truth_Audit.md`, `Wave_1_Prompt_02_Closeout.md`, `Wave_1_Prompt_03_Closeout.md`, `Wave_1_Prompt_04_Closeout.md`, `Wave_1_Prompt_05_Closeout.md`

## Roadmap Naming Discipline

This is **Phase 3 / Wave 1 / Prompt 06**. Not "Wave 6" or "Phase 3 Wave 6."

## Authorization

W1-ODR-009 (code authorization for Wave 1 Prompts 02–07) granted by the user for **Prompt 06 only**. Prompt 07 still requires explicit authorization.

## Naming Deviation

Prompt 06's "Files Allowed" list uses kebab-case. Per the established Wave 1 better-path convention, this commit uses repo-standard PascalCase for top-level modules and camelCase filenames inside `fixtures/` for fixture data files (which export constants, not interfaces).

| Prompt name | Repo file/symbol |
|---|---|
| `feature-flags.ts` | `PccFeatureFlags.ts` |
| `module-flags.ts` | `PccModuleFlags.ts` |
| `no-mutation-guards.ts` | `PccFixtureGuards.ts` |
| `fixtures/**` | `fixtures/**` (camelCase fixture filenames) |

## Forbidden-Key Discipline

The fixture-guard utility uses **exact-name credential and execution/mutation tokens** — not blanket `sync`/`mirror` substring matching:

- Secret/credential keys: `clientSecret`, `apiKey`, `accessToken`, `refreshToken`, `bearerToken`, `procoreSecret`.
- Mutation-intent keys: `execute`, `apply`, `provision`, `mutate`, `createSite`, `createList`, `createLibrary`, `createGroup`, `assignPermission`.
- Mirror/write-back/sync-execution keys (narrowed): `mirrorRecords`, `writeBack`, `writeback`, `syncToken`, `syncClient`, `syncExecutor`, `syncCredential`.

Read-model health vocabulary like `syncHealth`, `lastSyncStatus`, `lastSyncedAtUtc`, `procoreSyncEnabled`, `syncProfile` is explicitly **not flagged** — these are legitimate Procore-sync-health visibility fields the Standard Project Site Template Contract defines. `PccFixtureGuards.test.ts` includes a positive test asserting these read-model fields produce no violations.

`PCC_FORBIDDEN_FIXTURE_VALUE_PATTERNS` targets credential-shaped strings only (Bearer tokens, JWT shape, Slack-style tokens, AWS access key id shape).

## Non-Runtime Posture for Flags

Both `PccFeatureFlags.ts` and `PccModuleFlags.ts` carry a top-of-file comment listing what they do NOT do (no env-var / `localStorage` / `sessionStorage` / cookie / tenant-config reads, no runtime enablement logic, no permissions/auth enforcement). Their tests source-scan (after stripping comments and string literals) and assert no `process.env`, `localStorage`, `sessionStorage`, `document.cookie`, `fetch(`, `XMLHttpRequest`, `requireAdmin`, `withAuth`, or `getConfig` tokens leak into the source.

## Fixture Conventions

- Deterministic literal ids (no `Math.random`/`Date.now`/`crypto.randomUUID`/`performance.now` — asserted via source scan)
- URLs only `https://example.invalid/...` (RFC 2606 reserved; asserted via source scan)
- UPNs only `*@example.com` (RFC 2606 reserved; asserted via source scan)
- Coverage explicitly verified for: both `ILaunchLink` branches (configured + missing); both `BusinessAuditSourceContext` branches (workflow-module + mvp-surface); all six `RepairRequestState` values; all four `SiteHealthCheckState` values

## Files Added

Fixtures (`packages/models/src/pcc/fixtures/`):

- `projectProfile.ts` — `SAMPLE_PROJECT_PROFILE`, `SAMPLE_PROJECT_PROFILE_PRECONSTRUCTION`, `SAMPLE_PROJECT_PROFILES`
- `priorityActions.ts` — `SAMPLE_PRIORITY_ACTIONS` (10 records, one per category)
- `workflow.ts` — `SAMPLE_WORKFLOW_ITEMS`, `SAMPLE_WORKFLOW_ITEM_ASSIGNMENTS`, `SAMPLE_WORKFLOW_ITEM_ASSIGNMENT_HISTORY`, `SAMPLE_WORKFLOW_ITEM_TRANSITIONS`
- `approvals.ts` — `SAMPLE_APPROVAL_CHECKPOINTS` (covers pending/approved/rejected/waived; mixed `checkpointType`s), `SAMPLE_REVIEWER_ACTIONS`
- `audit.ts` — `SAMPLE_BUSINESS_AUDIT_EVENTS` (covers both source-context branches)
- `comments.ts` — `SAMPLE_COMMENTS` (with threaded reply), `SAMPLE_COMMENT_HISTORY`
- `integrations.ts` — `SAMPLE_EXTERNAL_SYSTEM_LINKS`, `SAMPLE_EXTERNAL_SYSTEM_MISSING_CONFIGS`, `SAMPLE_LAUNCH_LINKS` (configured + missing), `SAMPLE_DOCUMENT_CONTROL_SOURCE_IDS`
- `siteHealth.ts` — `SAMPLE_SITE_HEALTH_CHECKS` (all four states + tier coverage), `SAMPLE_DRIFT_INDICATORS`, `SAMPLE_SITE_HEALTH_SUMMARY`, `SAMPLE_REPAIR_REQUESTS` (all six states)
- `index.ts` — barrel + aggregate `PCC_FIXTURES`
- `Fixtures.test.ts`

Top-level modules (`packages/models/src/pcc/`):

- `PccFeatureFlags.ts`
- `PccModuleFlags.ts`
- `PccFixtureGuards.ts`
- `PccFeatureFlags.test.ts`
- `PccModuleFlags.test.ts`
- `PccFixtureGuards.test.ts`

## Files Modified

- `packages/models/src/pcc/index.ts` — exports for the three new modules and the fixtures barrel
- `packages/models/src/pcc/constants.ts` — appends new constant re-exports
- `packages/models/src/pcc/NoMutationGuard.test.ts` — adds `findForbiddenFixtureKeys` to allowlist

## Files Untouched

- `packages/models/src/project/ProjectEnums.ts` — legacy `ProjectStatus` unchanged (W1-ODR-011)
- `packages/models/src/auth/ProjectRoles.ts` — legacy `ProjectRole` unchanged (W1-ODR-012)
- `packages/models/src/audit/IAuditRecord.ts` — generic write-op audit unchanged
- `packages/models/package.json` — no version bump, no new dependency
- `@hbc/project-site-provisioning` not imported (W1-ODR-007)
- Anything outside `@hbc/models`

## Verification

| Command | Result |
|---|---|
| `pnpm --filter @hbc/models check-types` | Pass (0 errors) |
| `pnpm --filter @hbc/models test` | 205 passed, 29 files (28 new tests since Prompt 05) |
| `pnpm --filter @hbc/models build` | Pass |
| `pnpm --filter @hbc/models lint` | 0 errors; 35 pre-existing warnings, none in `src/pcc/**` |

## Guardrail Confirmation

- No PCC shell UI implemented: **Confirmed**
- No backend route/API implemented: **Confirmed**
- No provisioning executor or tenant mutation: **Confirmed**
- No Graph/PnP live calls: **Confirmed**
- No Procore runtime, secrets, mirror, or write-back: **Confirmed**
- No package/SPFx manifest version bump: **Confirmed**
- No CI/CD deployment change: **Confirmed**

## Open Decisions / Follow-ups

- **W1-ODR-009 (code authorization)** — Prompt 07 still requires explicit authorization
- **Forbidden-key list extensibility** — consumers can compose their own predicates around `findForbiddenFixtureKeys`; future additions to the canonical list go through the same review path
- **Fixture extensibility** — additional `SAMPLE_*` constants can be added per existing pattern; the closeout's coverage assertions ensure fixture-shape regressions surface in CI

## Cross-References

- `Wave_1_Scope_Lock.md`
- `Wave_1_Repo_Truth_Audit.md`
- `Wave_1_Prompt_02_Closeout.md`
- `Wave_1_Prompt_03_Closeout.md`
- `Wave_1_Prompt_04_Closeout.md`
- `Wave_1_Prompt_05_Closeout.md`
- `docs/architecture/plans/MASTER/spfx/pcc/phase-03/wave-01/Wave_1_Open_Decision_Register.md`
- `docs/architecture/plans/MASTER/spfx/pcc/phase-03/wave-01/Wave_1_Validation_Matrix.md`
