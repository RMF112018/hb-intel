# Phase 3 / Wave 4 — Project Home / Command Center Backend Integration and Read-Model Consumption Hardening

**Classification:** Canonical Normative Plan (active wave scope lock).
**Audited HEAD:** `876a08742`.
**Audited date:** 2026-04-30.
**Prompt package:** `docs/architecture/plans/MASTER/spfx/pcc/phase-03/wave-04/`.

This document freezes the Wave 4 scope. Source-implementation prompts (Prompts 02–07) execute against this lock. Changes to default posture or scope require explicit user authorization and an update to this file plus `Wave_4_Open_Decisions.md`.

---

## 1. Wave 3 carry-forward (factual baseline)

Wave 3 (Phase 3) landed a **dormant** PCC read-model foundation. Wave 4 builds on this baseline; Wave 4 must not regress or duplicate it.

- **Backend host present.** `backend/functions/src/hosts/pcc-read-model/` registers seven GET-only routes under the namespace `/api/pcc/projects/{projectId}/...`: `profile`, `modules`, `home`, `priority-actions`, `document-control`, `external-links`, `site-health`. All routes delegate to a mock provider; no Microsoft Graph, PnP, SharePoint REST, Procore, Document Crunch, or Adobe Sign runtime is invoked.
- **Shared DTOs in `@hbc/models/pcc`.** Nine read-model envelope contracts, fixtures, registry maps, and guards are exported from `packages/models/src/pcc/`. The envelope shape is `{ data: PccReadModelEnvelope<T> }` with `mode ∈ {fixture | mock | local}` and a seven-value `sourceStatus` (including `source-unavailable` and `backend-unavailable`).
- **SPFx client boundary present and dormant.** `apps/project-control-center/src/api/pccReadModelClient.ts` defines `IPccReadModelClient`; `pccFixtureReadModelClient.ts` provides a fixture-only factory. The boundary issues no HTTP, performs no auth, and is **not consumed** by any non-test source file. There are zero `fetch(` callsites anywhere in `apps/project-control-center/src`.
- **Dormancy guard.** `apps/project-control-center/src/tests/pcc-api-dormancy.test.ts` enforces that no app/non-test source file imports from `src/api/` or names the boundary identifiers. Wave 3 closeout proved all four no-mutation guards pass; the SPFx production bundle is byte-for-byte identical to Wave 2; the lockfile is unchanged.
- **Surface posture.** Five surfaces are wired and consume `@hbc/models/pcc` fixtures directly (project-home, team-and-access, documents, site-health, external-systems). Three are stubbed (project-readiness, approvals, control-center-settings).

Wave 3 made **no** runtime cutover, **no** tenant integration, **no** write routes, **no** packaging or deployment changes.

## 2. Wave 4 objective

Introduce backend read-model consumption into **Project Home / Command Center** as the first opt-in consumer of the Wave 3 backend host, **without** changing the default fixture-driven posture of the SPFx app. Backend reads must be explicit, opt-in, test-covered, and reversible to the fixture client at every step. No live external-system runtimes are confirmed in Wave 4.

## 3. Allowed scope (Prompts 02–07)

- **Prompt 02** — SPFx read-model mode contract and client factory scaffold (data-mode config, factory selection, fixture default).
- **Prompt 03** — Backend HTTP `IPccReadModelClient` implementation behind the existing seam, opt-in only.
- **Prompt 04** — Project Home read-model adapter and view-model state mapping (envelope → presentational state).
- **Prompt 05** — Project Home / Command Center opt-in wiring (single first consumer).
- **Prompt 06** — Guardrail and validation hardening; replace dormancy guard with a controlled-consumption guard scoped to Project Home only; fixture fallback hardening.
- **Prompt 07** — Closeout proof and Wave 5 readiness (Priority Actions Rail standalone module).

## 4. Forbidden scope (Wave 4)

The following are forbidden for the duration of Wave 4 unless an explicit, written user authorization re-opens scope:

- default backend cutover (fixture remains default);
- tenant mutation;
- write routes (`POST`, `PUT`, `PATCH`, `DELETE`);
- live Microsoft Graph, PnP, or SharePoint REST operations;
- Procore runtime, SDK, secrets, sync, mirror, or write-back behavior;
- Document Crunch runtime;
- Adobe Sign runtime;
- provisioning execution;
- Site Health scanner or repair execution;
- Team & Access permission execution;
- approval execution;
- package, version, manifest, deployment, app-catalog, or `.sppkg` work;
- dependency install/update commands;
- CI/CD workflow changes.

## 5. Default postures locked

| Posture | Default | Authority |
| --- | --- | --- |
| Default data mode | `fixture` | W4-OD-001 |
| Backend mode | explicit opt-in only | W4-OD-001 |
| Backend base URL | injected via SPFx `mount`/config; no tenant auto-discovery in Wave 4 | W4-OD-002 |
| Backend HTTP client placement | `apps/project-control-center/src/api/` | W4-OD-003 |
| `fetch(` source-scan exception | only the backend HTTP client implementation file and its tests/mocks | W4-OD-004 |
| First wired consumer | Project Home / Command Center only | W4-OD-005 |
| Dormancy guard disposition | replaced with a controlled-consumption guard scoped to Project Home | W4-OD-006 |
| Missing-config / backend-unavailable behavior | surface fixture envelopes with `sourceStatus: 'backend-unavailable'`; never silent failure | W4-OD-007 |
| Package / lockfile / version posture | no new deps, no version bumps, no manifest changes; lockfile checksum unchanged | W4-OD-008 |
| Priority Actions Rail | remains a Wave 5 standalone module; Wave 4 may surface priority actions only via Project Home read model | W4-OD-010 |

Tenant mutation, write routes, and live external-system runtime confirmation are **prohibited** in Wave 4.

## 6. Implementation sequence

1. **Prompt 02** — author the SPFx read-model mode contract (e.g. `readModelMode: 'fixture' | 'backend'`) with `fixture` default and the client factory selection seam.
2. **Prompt 03** — implement the backend HTTP `IPccReadModelClient` behind the existing seam, opt-in only; allow `fetch(` only here and in colocated tests/mocks.
3. **Prompt 04** — author the Project Home read-model adapter; map envelopes to presentational view-model state including `backend-unavailable` fallback.
4. **Prompt 05** — wire Project Home / Command Center to the seam; respect mode default; confirm reversibility to the fixture client.
5. **Prompt 06** — replace the dormancy guard with a controlled-consumption guard scoped to Project Home; harden the fixture-fallback path; preserve no-runtime guards everywhere else.
6. **Prompt 07** — closeout proof and Wave 5 readiness (Priority Actions Rail standalone module disposition; ADR/architecture-record decision per W4-OD-009).

## 7. Validation pattern

- Use the smallest meaningful validation set per the relevant prompt.
- Package-local typecheck/lint/tests for `@hbc/spfx-project-control-center` and `@hbc/functions` (note: backend Functions package id is `@hbc/functions`, not `@hbc/functions-pcc`) as touched.
- Preserve the dormancy / no-runtime / source-scan guard suite; replace or upgrade individual guards only as authorized by the owning prompt (e.g. W4-OD-006 in Prompt 06).
- Lockfile checksum unchanged unless explicitly authorized.
- Use `docs/reference/developer/verification-commands.md` before inventing validation commands.

## 8. Architectural completeness

Validation must assess **both execution completion and architectural completeness** for every Wave 4 prompt. The closing report on each prompt must affirm that:

- no orphan code was introduced (no produced view-models, adapters, or factories without a consumer);
- no quiet posture drift occurred (fixture default preserved unless the prompt explicitly relaxes it; opt-in surface remains Project Home only);
- no silent runtime cutover occurred (no `fetch(`, no live external runtime, no auth seam exercise outside opt-in mode);
- guardrail tests still cover the unwired surfaces.

Failure to assess architectural completeness is treated as failed validation regardless of whether package commands exit zero.
