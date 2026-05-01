# 03A — Prompt: SPFx Document Control Read-Model Parity

## Role

You are a local code agent working in the live repository:

```text
/Users/bobbyfetting/hb-intel
```

You are implementing **Project Control Center Phase 3 / Wave 7 — HB Document Control Center**.

## Objective

Align the SPFx fixture/read-model client with the backend mock provider for the Wave 7 `document-control` read-model shape.

This prompt must be completed before any three-lane UI rendering prompt.

## Critical Context

Current repo truth indicates:

- Backend mock provider `getDocumentControl()` already returns additive Wave 7 fields.
- SPFx fixture client `getDocumentControl()` still returns only legacy `sources`.
- The Documents surface still renders legacy two-lane preview UI.
- The next implementation step is to close the SPFx fixture/read-model parity gap.

## Mandatory Preflight

Run:

```bash
cd /Users/bobbyfetting/hb-intel
git status --short
git branch --show-current
git log --oneline -10
md5 pnpm-lock.yaml
```

Rules:

- If unrelated changes exist, do not overwrite them.
- Do not stage unrelated changes.
- Record pre-existing unrelated changes in closeout.
- Do not re-read files that are still within your current context or memory.

## Files to Inspect

Inspect current implementations:

```text
backend/functions/src/hosts/pcc-read-model/read-models/pcc-mock-read-model-provider.ts
backend/functions/src/services/__tests__/pcc-mock-read-model-provider.test.ts
apps/project-control-center/src/api/pccFixtureReadModelClient.ts
apps/project-control-center/src/api/pccFixtureReadModelClient.test.ts
packages/models/src/pcc/DocumentControl.ts
packages/models/src/pcc/PccReadModels.ts
packages/models/src/pcc/index.ts
```

## Files You May Modify

Primary allowed files:

```text
apps/project-control-center/src/api/pccFixtureReadModelClient.ts
apps/project-control-center/src/api/pccFixtureReadModelClient.test.ts
```

Supporting files only if required by TypeScript/tests:

```text
packages/models/src/pcc/DocumentControl.ts
packages/models/src/pcc/PccReadModels.ts
packages/models/src/pcc/index.ts
```

Do not modify source files outside this scope unless absolutely required and documented.

## Required Implementation

Update `apps/project-control-center/src/api/pccFixtureReadModelClient.ts` so `getDocumentControl()` returns the same additive Wave 7 fields as the backend mock provider.

Required fields:

```ts
sources
wave7LaneVocabulary
sourceRegistry
sourceHealth
sourceHealthStates
reviewStates
reviewTypes
hardNoRules
roleActionAvailability
actionCatalog
reviewQueueSample
```

Required behavior:

- Preserve legacy `sources` compatibility.
- Preserve fixture-only behavior.
- Preserve `mode: 'fixture'`.
- Preserve backend-unavailable and unknown-project envelope handling.
- Keep read-only posture.
- No HTTP execution.
- No auth behavior.
- No live Microsoft Graph, PnP, SharePoint REST, Procore, Adobe Sign, or Document Crunch runtime.
- No source discovery from SPFx.
- No external URLs used as executable links.
- No package/dependency changes.

## Required Wave 7 Fixture Characteristics

The SPFx fixture should include, at minimum:

### Lanes

```text
project-record
my-project-files
external-systems
```

### Source Registry

At minimum:

- Project Record / SharePoint library binding.
- My Project Files current-user binding.
- Procore external source binding.
- Document Crunch external source binding.
- Adobe Sign disabled or missing-config external source binding.

### My Project Files Guardrails

The fixture must not expose:

- full `My Project Files` root browsing;
- folders for other projects;
- any generic OneDrive root folder list.

It may include only the current project folder path, for example:

```text
/My Project Files/26-000-00-Stadium Enclave
```

### External Systems

External systems are status/launch metadata only.

Required posture:

- no writeback;
- no sync;
- no mirror;
- no runtime API call;
- `EX04` not available.

### Roles

Confirm Project Coordinator is present in the fixture/model vocabulary.

Confirm Project Engineer is absent from the Wave 7 document-control role vocabulary and fixture expectations.

### Action Availability

At minimum, include representative availability rows for:

- Project Record browsing;
- current-user My Project Files folder access;
- source binding status;
- external launch;
- workflow/review visibility;
- `EX04` unavailable/forbidden.

Do not imply runtime authorization enforcement. This is read-model fixture data only.

### Reviews

Include a deterministic review queue sample with:

- file name;
- review type;
- review state;
- assigned role code.

No approval execution.

## Required Tests

Update/add tests in:

```text
apps/project-control-center/src/api/pccFixtureReadModelClient.test.ts
```

Tests must prove:

1. `getDocumentControl()` returns legacy `sources`.
2. `getDocumentControl()` returns three Wave 7 lanes.
3. `sourceRegistry` includes Project Record, My Project Files, and External Systems entries.
4. My Project Files binding exposes only the current project folder.
5. My Project Files binding does not expose root browsing.
6. My Project Files binding does not expose other-project folders.
7. External systems are launch/status only.
8. `EX04` is not available.
9. Project Coordinator is represented.
10. Project Engineer is not represented.
11. Backend-unavailable envelope remains safe and read-only.
12. Unknown project envelope remains safe and read-only.
13. No fixture test requires live network/API behavior.

## Forbidden Changes

Do not:

- introduce package dependencies;
- run `pnpm install`, `pnpm add`, or equivalent;
- change `pnpm-lock.yaml`;
- modify SPFx manifests;
- package or deploy SPFx;
- call Microsoft Graph;
- call SharePoint REST or PnP;
- call Procore;
- call Adobe Sign;
- call Document Crunch;
- create runtime upload/download/copy-link handlers;
- mutate tenant/external systems;
- edit `docs/architecture/plans/**`.

## Validation Commands

Run targeted validation:

```bash
pnpm --filter @hbc/spfx-project-control-center test -- pccFixtureReadModelClient
pnpm --filter @hbc/spfx-project-control-center check-types
pnpm --filter @hbc/models check-types
git diff --check
md5 pnpm-lock.yaml
```

If the exact Vitest file filter syntax differs in repo truth, use the nearest targeted equivalent and document the command used.

## Closeout Requirements

In your response, include:

- files changed;
- tests run and results;
- lockfile checksum before/after;
- confirmation no package/dependency changes;
- confirmation no live Graph/PnP/SharePoint REST/Procore/Adobe/Document Crunch runtime;
- confirmation no root My Project Files exposure;
- confirmation no other-project folder exposure;
- confirmation `EX04` unavailable;
- recommended next prompt: `03B_Prompt_SPFX_Three_Lane_UI.md`.

## Suggested Commit Summary

```text
feat(pcc): align document-control fixture read model with wave 7
```

## Suggested Commit Description

```text
Updates the SPFx fixture read-model client so document-control returns the additive Wave 7 HB Document Control Center shape already represented by the backend mock provider, including three-lane vocabulary, source registry, source health, role/action availability, hard-no rules, and review queue sample.

Preserves legacy sources compatibility and fixture-only/read-only behavior. No live Graph, PnP, SharePoint REST, Procore, Adobe Sign, Document Crunch, tenant mutation, package changes, lockfile changes, SPFx packaging, or deployment behavior is introduced.
```
