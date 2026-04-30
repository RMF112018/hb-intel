# Phase 3 — Wave 3 Prompt 04 Closeout

**Prompt:** 04 — Backend Mock Read-Model Provider
**Date:** 2026-04-30
**Status:** Complete (package validation only; hosted/tenant proof OPERATOR-PENDING)

## Files Changed

- `backend/functions/src/hosts/pcc-read-model/read-models/pcc-read-model-provider.ts` (added)
- `backend/functions/src/hosts/pcc-read-model/read-models/pcc-mock-read-model-provider.ts` (added)
- `backend/functions/src/services/__tests__/pcc-mock-read-model-provider.test.ts` (added)
- `backend/functions/src/services/__tests__/pcc-read-model-no-runtime.test.ts` (added)
- `docs/architecture/blueprint/sp-project-control-center/phase-3/wave-3/Wave_3_Backend_Mock_Provider_Closeout.md` (this file)

No edits to `backend/functions/package.json`, `backend/functions/vitest.config.ts`, `backend/functions/host.json`, `backend/functions/tsconfig.json`, `pnpm-lock.yaml`, `pnpm-workspace.yaml`, any workflow file, any manifest, or any package version field. No edits under `packages/models/**` or `apps/project-control-center/**`.

## Provider Structure

`IPccReadModelProvider` (interface) defines exactly nine read-only methods, one per `PccReadModelResponseMap` key:

| Method | Returns |
| --- | --- |
| `getProjectProfile` | `PccReadModelEnvelope<PccProjectProfileReadModel>` |
| `getModuleRegistry` | `PccReadModelEnvelope<PccWorkCenterRegistryReadModel>` |
| `getProjectHome` | `PccReadModelEnvelope<PccProjectHomeReadModel>` |
| `getPriorityActions` | `PccReadModelEnvelope<PccPriorityActionsReadModel>` |
| `getDocumentControl` | `PccReadModelEnvelope<PccDocumentControlReadModel>` |
| `getExternalLinks` | `PccReadModelEnvelope<PccExternalLinksReadModel>` |
| `getSiteHealth` | `PccReadModelEnvelope<PccSiteHealthReadModel>` |
| `getTeamAccess` | `PccReadModelEnvelope<PccTeamAccessReadModel>` |
| `getSettings` | `PccReadModelEnvelope<PccSettingsReadModel>` |

`PccMockReadModelProvider` (concrete class) implements `IPccReadModelProvider`. Constructor accepts an optional `PccMockReadModelProviderOptions` with:

- `simulateBackendUnavailable?: boolean` — flips every surface to `sourceStatus: 'backend-unavailable'` with a matching warning.
- `now?: () => string` — deterministic timestamp injection for tests.

Source placement is `backend/functions/src/hosts/pcc-read-model/read-models/`, matching the Prompt 02 architecture lock (`Wave_3_Backend_Route_and_DTO_Placement.md` §6) which froze backend PCC placement at `backend/functions/src/hosts/pcc-read-model/`. The Prompt 04 brief's suggested `src/pcc/` path was overridden by the Prompt 02 lock as instructed.

## Data Source Posture (per surface)

All data comes from `@hbc/models/pcc` exports — no live runtime reads, no external systems.

| Surface | Source |
| --- | --- |
| profile | `SAMPLE_PROJECT_PROFILES` (keyed map of two fixture profiles) |
| modules | `PCC_MVP_SURFACES` registry (record of eight MVP surface entries) |
| home | `SAMPLE_PROJECT_PROFILES` + `SAMPLE_PRIORITY_ACTIONS` + `SAMPLE_EXTERNAL_SYSTEM_MISSING_CONFIGS` + `SAMPLE_SITE_HEALTH_SUMMARY` |
| priority-actions | `SAMPLE_PRIORITY_ACTIONS` |
| document-control | `DOCUMENT_CONTROL_SOURCES` iterated through canonical `DOCUMENT_CONTROL_SOURCE_IDS` ordering |
| external-links | `SAMPLE_EXTERNAL_SYSTEM_LINKS` + `SAMPLE_EXTERNAL_SYSTEM_MISSING_CONFIGS` |
| site-health | `SAMPLE_SITE_HEALTH_SUMMARY` |
| team-access | `SAMPLE_TEAM_ACCESS_PREVIEW_MODEL` |
| settings | empty array — see Settings Fixture Decision below |

Unknown project IDs return `sourceStatus: 'source-unavailable'` with a single matching warning. Collection-typed surfaces return empty arrays in that case; profile-shaped surfaces return a placeholder `IProjectProfile` carrying the requested `projectId` and `projectName: 'Unknown project'` so the envelope contract (`data: T` non-optional) holds without inventing business fields.

## Envelope Sufficiency Decision

`viewerPersona?: PccPersona` on `PccReadModelEnvelope<T>` is sufficient for role-aware shaping in Prompt 04. **No additive `capabilityHints` field was proposed or added.**

Rationale:
- `@hbc/models/pcc` already exports `PCC_PERSONA_CAPABILITIES` and `personaHasCapability(persona, capabilityId)`. Capability derivation is deterministic from `viewerPersona`.
- Adding `capabilityHints` to the envelope would create a redundant secondary source of truth that consumers could disagree with. Persona → capability mapping should remain centralized in `PccCapabilities.ts`.
- If a feature-flag-gated capability override emerges in Prompt 05/06, that is the right time to revisit the envelope shape — not silently in Prompt 04.

The mock provider stamps `viewerPersona` on every envelope when supplied, and omits the field when not. Capability derivation is left to consumers through the existing utility.

## Settings Fixture Decision

`@hbc/models/pcc` exposes `IPccSettingsRef` types and `PCC_SETTINGS_SCOPES` constants but does NOT export a settings sample fixture (no `SAMPLE_PCC_SETTINGS_REFS` or equivalent under `packages/models/src/pcc/fixtures/`). The mock provider therefore returns `settings: []` for the `getSettings` surface even on known fixture project IDs.

This is honest fixture absence, not missing implementation. A future prompt can add a settings fixture in `@hbc/models/pcc` and the provider can pick it up without contract change.

## No-Route Confirmation

- No `app.http(...)` registration in any added file.
- No `@azure/functions` imports.
- No `host.json` added under `backend/functions/src/hosts/pcc-read-model/`.
- No host composition root `index.ts`, no scoped service factory, no `RELEASE-SCOPE.md` manifest.
- No HTTP route handlers, controllers, or middleware.

The provider is service-level only and is intended for wiring by future Prompt 05 routes.

## No-Runtime / No-Mutation Confirmation

- Provider source files import only from `@hbc/models/pcc` and from the sibling interface module. No `@pnp/*`, `@microsoft/microsoft-graph-client`, `@azure/*`, `procore-sdk`, `axios`, `node-fetch`, or backend services.
- Class shape exposes only the nine read-only `get*` methods plus the constructor. No mutation verbs are present in any public method name.
- The static guard test (`pcc-read-model-no-runtime.test.ts`) asserts both:
  1. **Import-specifier scan** — no forbidden package imports across `backend/functions/src/hosts/pcc-read-model/**/*.ts` (excluding test files).
  2. **Executable-token scan** (after stripping block comments, line comments, and string-literal contents from each source file) — no occurrence of `MSGraphClient`, `GraphServiceClient`, `sp.web`, `_api/web`, `ProcoreClient`, `DocumentCrunchClient`, `AdobeSignClient`, `provision`, `executeRepair`, `permissionMutate`, `writeBack`, or `mirror` in executable code.

The strip-comments + strip-strings pass keeps the scan honest by ignoring guardrail vocabulary that legitimately appears in JSDoc and warning messages.

## Test Glob Constraint Note

`backend/functions/vitest.config.ts` curates the unit-project includes file-by-file and does not currently match host-scoped test paths. Modifying `vitest.config.ts` is outside the Prompt 04 allow-list. Both new test files therefore live under `backend/functions/src/services/__tests__/` (already globbed) with header comments explaining that they exercise the host-scoped PCC provider.

**Recommendation for Prompt 05:** when route source lands under `backend/functions/src/hosts/pcc-read-model/`, add a host-scoped glob entry (for example `src/hosts/pcc-read-model/**/*.test.ts`) to the unit-project includes in the same prompt that introduces the route tests. That keeps test placement co-located with route implementation going forward.

## Validation Results

```
git status --short
```

Pre-edit and post-validation, the only changes are the five files listed under "Files Changed". Two unrelated local modifications under `.claude/hooks/plan-library-guard.sh` and `.claude/rules/07-plan-review-and-execution-gates.md` predate this prompt and are not part of the Prompt 04 commit.

```
pnpm --filter @hbc/models check-types
```

Passed. (`tsc --noEmit`.)

```
pnpm --filter @hbc/models test
```

Passed. **31 test files, 224 tests.**

```
pnpm --filter @hbc/models build
```

Run as a one-time prerequisite to refresh `packages/models/dist/` so that `@hbc/functions` could resolve the new `@hbc/models/pcc` exports. The dist directory is gitignored (`packages/*/dist/` in `.gitignore`); no committed state changed. Passed.

```
pnpm --filter @hbc/functions check-types
```

Passed.

```
pnpm --filter @hbc/functions test
```

Passed. **136 test files, 2273 tests, 3 skipped, 0 failed.** Includes the two new Prompt 04 test files.

```
pnpm --filter @hbc/functions build
```

Passed (`tsc --project tsconfig.json`).

## Lockfile Checksum

```
md5 pnpm-lock.yaml   (pre-edit and post-validation)
MD5 (pnpm-lock.yaml) = c56df7b79986896624536aab74d609f4
```

**Unchanged.** No `pnpm install` or `pnpm add` was run.

## Hosted / Tenant Proof

OPERATOR-PENDING. Prompt 04 introduces no live calls, no app catalog work, no tenant mutation, no `.sppkg` generation, no Graph/PnP/SharePoint REST/Procore/Document Crunch/Adobe Sign runtime, no provisioning executor invocation, no permission mutation, and no deployment workflow change. Hosted runtime evidence is not applicable to this scaffold prompt. The Wave 3 hosted-evidence boundary remains gated for later prompts that introduce route registration or runtime cutover.

## Recommended Next Prompt

**Prompt 05 — Read-Only Backend Routes in Mock Mode.**

Prompt 05 should:

- register read-only `/api/pcc/projects/{projectId}/...` routes under `backend/functions/src/hosts/pcc-read-model/` per the Prompt 02 lock;
- wire the `PccMockReadModelProvider` from this prompt as the default provider;
- add a host-scoped glob entry to `backend/functions/vitest.config.ts` (`src/hosts/pcc-read-model/**/*.test.ts`) so future host tests are discovered without the workaround used here;
- preserve no-runtime / no-mutation posture; no Graph/PnP/Procore/Document Crunch/Adobe Sign behavior, no write verbs, no provisioning execution, no app catalog deployment, no tenant mutation.
