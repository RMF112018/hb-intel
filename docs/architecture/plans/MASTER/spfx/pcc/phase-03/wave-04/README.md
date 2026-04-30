# Phase 3 / Wave 4 — Project Home / Command Center Backend Integration and Read-Model Consumption Hardening

**Status:** Planning package for sequential local-agent execution. Do not implement code merely by reading this package.

## Objective

Wave 4 safely introduces backend read-model consumption into the Project Home / Command Center experience without changing the default PCC runtime posture. The app must remain fixture-driven by default, and backend reads must be explicit, opt-in, test-covered, and reversible to the fixture client.

Wave 4 builds from completed Wave 3, which established the PCC backend read-model foundation, shared read-model contracts, mock provider, seven read-only backend routes, and a dormant SPFx client boundary.

## Governing Repo-Truth Inputs

Before executing any Wave 4 prompt, inspect the current live repo on `main` and treat the repo as authoritative. Minimum governing inputs:

- `docs/architecture/blueprint/sp-project-control-center/phase-3/wave-3/Wave_3_Closeout.md`
- `docs/architecture/blueprint/sp-project-control-center/phase-3/wave-3/Wave_3_Open_Decisions.md`
- `docs/architecture/plans/MASTER/spfx/pcc/phase-03/wave-03/README.md`
- `docs/architecture/blueprint/sp-project-control-center/phase-3/05_Phase_3_Development_Roadmap_Updated.md`
- `docs/architecture/blueprint/sp-project-control-center/phase-3/07_Phase_3_Module_Implementation_Plan.md`
- `apps/project-control-center/README.md`
- `packages/models/src/pcc/**`
- `backend/functions/src/hosts/pcc-read-model/**`
- `backend/functions/src/index.ts`
- `apps/project-control-center/src/api/**`
- `apps/project-control-center/src/tests/**`
- `apps/project-control-center/src/PccApp.tsx`
- `apps/project-control-center/src/mount.tsx`
- `apps/project-control-center/src/shell/**`
- `apps/project-control-center/src/surfaces/projectHome/**`

Also inspect any UI doctrine, SPFx benchmark, or PCC architecture references cited by those files. Do not assume paths; verify from repo truth.

## Carry-Forward Wave 3 Facts

As of the repo-truth audit used to generate this package:

- Wave 3 is complete as a read-model foundation only; no live operations were introduced.
- Wave 3 closeout records HEAD short `a72e8ab43` and the Wave 3 implementation chain through Prompt 06.
- Route namespace is `/api/pcc/projects/{projectId}/...`.
- Implemented backend `GET` routes are: profile, modules, home, priority-actions, document-control, external-links, and site-health.
- Backend host placement is `backend/functions/src/hosts/pcc-read-model/`.
- Shared read-model DTO placement is `packages/models/src/pcc/`, exposed through `@hbc/models/pcc`.
- Backend HTTP response body convention is `{ data: PccReadModelEnvelope<T> }`.
- The SPFx client boundary exists under `apps/project-control-center/src/api/**` but is dormant by Wave 3 design.
- `PccProjectHome` currently renders ten fixture-driven cards directly from `@hbc/models/pcc` fixtures.
- `PccApp` currently renders placeholder project metadata and does not receive a read-model client or runtime data mode.
- `mount()` currently accepts only `previewLabel` in `IPccMountConfig` and renders `PccApp` without config propagation.
- `tests/pcc-api-dormancy.test.ts` currently blocks any non-api source file from importing or referencing the `src/api` boundary. Wave 4 must replace this dormancy guard with a narrower controlled-consumption guard rather than deleting guard coverage outright.

If repo truth has changed, the executing agent must update the Wave 4 scope lock in Prompt 01 before source work proceeds.

## Wave 4 Scope

Wave 4 may implement:

- explicit SPFx read-model data-mode configuration with fixture default;
- a backend HTTP client behind the existing `IPccReadModelClient` seam;
- strict response parsing for the Wave 3 `{ data: envelope }` backend body;
- narrow `fetch(` allowance only in the approved backend HTTP client file;
- fixture fallback and backend-unavailable envelope handling;
- Project Home adapter/hook/view-model layer that consumes envelopes without forcing backend mode;
- Project Home / Command Center wiring behind an explicit opt-in backend mode only;
- guard tests that prove the default remains fixture mode and unsafe runtimes remain absent;
- closeout documentation and Wave 5 readiness.

## Wave 4 Forbidden Work

Wave 4 must not introduce:

- default backend cutover;
- tenant mutation;
- write routes (`POST`, `PUT`, `PATCH`, `DELETE`);
- Graph/PnP/SharePoint REST live operations;
- Procore runtime, SDK, secrets, sync, mirror, or write-back;
- Document Crunch runtime;
- Adobe Sign runtime;
- provisioning execution;
- Site Health scanner or repair execution;
- Team & Access permission execution;
- approval execution;
- package/version/manifest/deployment/app-catalog work unless this prompt explicitly authorizes it.

## Human / Open Decisions to Resolve in Prompt 01

Prompt 01 must either freeze or explicitly defer these decisions before source implementation:

| Decision | Required Position Unless Repo Truth Contradicts It |
|---|---|
| Feature flag / config name | Use an explicit SPFx config property such as `readModelMode: 'fixture' | 'backend'`; default `fixture`. |
| Backend base URL source | Prefer injected mount/config value; do not auto-discover tenant endpoints. |
| Initial wired surface | Project Home / Command Center only, with Priority Actions included only as part of Project Home view-model consumption. |
| Default runtime behavior | Fixture-driven. Backend mode is opt-in only. |
| API dormancy guard replacement | Replace with controlled-consumption guard that allows approved imports but fails broad or silent usage. |
| Scoped-host ADR | Either create a Wave 4 ADR/decision note for the Wave 3 scoped host pattern or explicitly defer it with rationale. |
| Package/lockfile posture | No dependency additions by default. If source work touches package manifests or lockfile unexpectedly, stop. |

## Adopted Default Positions

If Prompt 01 finds no contradiction, execute Wave 4 with these defaults:

- `fixture` remains the default app data mode.
- `backend` mode is opt-in and requires an explicit base URL/config path.
- Missing backend config falls back to fixture or `backend-unavailable` envelopes; it must not throw the app into an unhandled state.
- Only one backend HTTP client file may contain `fetch(`.
- The backend HTTP client must not import Graph, PnP, SharePoint REST clients, Procore, Document Crunch, Adobe Sign, provisioning utilities, repair utilities, permission managers, or approval executors.
- Project Home must remain visually equivalent under fixture mode.
- Passing tests is required but not sufficient; validation must also prove architectural completeness against the target posture.

## Prompt Sequence

| Prompt | Title | Primary Intent |
|---:|---|---|
| 01 | Repo Truth Gate and Project Home Scope Lock | Documentation-only gate; confirm Wave 3 baseline, lock Wave 4 decisions, create Wave 4 scope/open-decision record. |
| 02 | SPFx Read-Model Mode Contract and Client Factory Scaffold | Add explicit fixture-default mode/config factory seam and replace dormancy guard with controlled-consumption guard. |
| 03 | Backend HTTP Read-Model Client Opt-In Implementation | Add the opt-in backend HTTP client behind `IPccReadModelClient`; `fetch(` only in this file. |
| 04 | Project Home Read-Model Adapter and State Mapping | Add adapter/view-model layer that maps envelopes to Project Home props and preview states without UI cutover. |
| 05 | Project Home / Command Center Opt-In Wiring | Wire Project Home through the read-model seam behind explicit opt-in mode; fixture default remains unchanged. |
| 06 | Guardrails, Validation, and Fixture Fallback Hardening | Strengthen tests and source-scan guards for default fixture behavior, fallback states, and forbidden runtimes. |
| 07 | Closeout Proof and Wave 5 Readiness | Documentation-only closeout with validation proof and Wave 5 readiness recommendation. |

Each prompt must be executed in order. Do not proceed to the next prompt until the prior prompt is committed, reviewed, and accepted.

## Required Validation Pattern

Source-touching Wave 4 prompts should generally run:

```bash
git status --short
md5 pnpm-lock.yaml
pnpm --filter @hbc/models check-types
pnpm --filter @hbc/models test
pnpm --filter @hbc/functions check-types
pnpm --filter @hbc/functions test
pnpm --filter @hbc/functions build
pnpm --filter @hbc/spfx-project-control-center check-types
pnpm --filter @hbc/spfx-project-control-center test
pnpm --filter @hbc/spfx-project-control-center build
md5 pnpm-lock.yaml
```

Use narrower validation only when the touched package set is truly narrower and explain why. If `pnpm-lock.yaml` changes unexpectedly, stop and report; do not normalize or commit the lockfile drift without explicit human approval.

Do not include deployment, `.sppkg`, app catalog upload, Graph/PnP tenant operations, Procore API calls, provisioning executor, repair runner, or tenant mutation in Wave 4 validation.

## Package / Lockfile / Version Posture

- No package version bump.
- No SPFx manifest edit.
- No `.sppkg` output.
- No app catalog upload.
- No CI/CD workflow edit.
- No dependency addition by default.
- Capture `md5 pnpm-lock.yaml` before and after every source-touching prompt.

## Closeout Expectations

Every prompt closeout must document:

- files changed;
- implementation completed;
- intentionally excluded work;
- validation commands and results;
- pre/post lockfile checksum;
- default fixture posture confirmation;
- backend opt-in posture confirmation where applicable;
- no tenant mutation confirmation;
- no unsafe runtime confirmation;
- remaining blockers or open decisions;
- next prompt readiness.

Final Wave 4 closeout must evaluate both:

1. whether the execution completed; and
2. whether the executed work is architecturally complete against the target Wave 4 architecture and current repo truth.

Do not treat passing tests alone as sufficient if the implementation misses the target architecture, weakens guardrails, silently changes default runtime behavior, or creates unreviewed scope drift.
