# Phase 3 — Wave 3 Scope Lock

**Wave title:** PCC Backend Read-Model Foundation
**Wave kind:** Implementation foundation wave — read-model only
**Status:** Planning ready (not blocked). Wave 3 may begin with Prompt 02. **Prompt 02 is a decision / architecture-lock prompt only and does not implement route source unless a separate human approval explicitly reopens that scope.**
**Established by:** Prompt 01 (this scope-lock document is a Prompt 01 deliverable, paired with `Wave_3_Open_Decisions.md`)
**Date:** 2026-04-30

## 1. Wave Title

PCC Backend Read-Model Foundation.

## 2. Wave Objective

Establish the backend-normalized read-model foundation that the Wave 2
PCC SPFx shell will eventually consume. Wave 3 introduces the
`/api/pcc/projects/{projectId}/...` route family inside the existing
`backend/functions/` Azure Functions host, lands the read-model
DTO/contracts in `packages/models/src/pcc/` (exposed through
`@hbc/models/pcc`), provides a mock/local provider that returns
fixture-shaped data, scaffolds read-only `GET` route handlers, and
documents the SPFx client boundary — **without any default runtime
cutover**. The wave closes with a Wave 4 readiness recommendation.

Wave 3 is **read-model only**. There is no write route, no tenant
mutation, no live external integration, no deployment artefact, and no
default SPFx switch from fixtures to backend data.

## 3. Wave 2 Readiness Verification

Verified directly from on-disk repo truth at the time this document
was written (Wave 2 closeout commit `bd440c141`):

| Gate | Source | Result |
| --- | --- | --- |
| Wave 2 closeout exists | `docs/architecture/blueprint/sp-project-control-center/phase-3/wave-2/Wave_2_Closeout.md` | ✓ Present |
| `apps/project-control-center/README.md` states Wave 2 complete | Opening paragraph: "Wave 2 complete" | ✓ |
| Closeout confirms zero live runtime — no live backend / tenant / Graph / PnP / SharePoint REST / Procore / Document Crunch / Adobe Sign / auth / scanner / repair runner / approval execution / permission mutation / deployment artifact | Closeout "Forbidden Closeout Claims" + "Explicit No-Touch Confirmations" sections | ✓ |
| Wave 2 validation results documented | Closeout "Validation Command Results" — `@hbc/models` 220/220 across 30 files; `@hbc/spfx-project-control-center` 173/173 across 15 files; both green on check-types / build / lint | ✓ |
| Phase 3 roadmap still identifies Wave 3 as backend read-model foundation | `docs/architecture/blueprint/sp-project-control-center/phase-3/05_Phase_3_Development_Roadmap_Updated.md` Wave Plan row 3 + Milestone 1 listing | ✓ |

All five gates pass. **Wave 3 planning is ready, not blocked.**

## 4. Wave 3 Allowed Work

Across the seven Wave 3 prompts:

- Add new files under `backend/functions/src/...` for read-only `GET`
  route handlers (after Prompt 02 freezes backend source placement).
- Add new read-model DTO / contract types under `packages/models/src/pcc/`
  (additive only; exposed through the existing `@hbc/models/pcc`
  barrel).
- Add a mock / local read-model provider that returns fixture-shaped
  data with no tenant network call.
- Add **boundary tests** that assert no write verb, no Graph / PnP /
  SharePoint REST / Procore / Document Crunch / Adobe Sign import, and
  no mutation surface on the new route family.
- Update `backend/functions/README.md` and per-host `RELEASE-SCOPE.md`
  (only if a new scoped host is introduced — see §8 + W3-OD-003).
- Add Wave 3 plan-library prompts under `docs/architecture/plans/MASTER/spfx/pcc/phase-03/wave-03/`
  (the seven prompt specs already on disk).
- Add Wave 3 blueprint closeouts under
  `docs/architecture/blueprint/sp-project-control-center/phase-3/wave-3/`
  (one per prompt, plus this scope lock and the open-decision
  register).
- Run package-scoped validation commands for any package whose source
  is actually touched.

## 5. Wave 3 Forbidden Work (Hard Exclusions Preserved)

Wave 3 must **not**:

- Implement any HTTP write verb (`POST` / `PUT` / `PATCH` / `DELETE`).
  **Read-model only (`GET`).**
- Implement any tenant mutation (SharePoint REST write, Graph write,
  PnP write).
- Implement any live Graph / PnP / SharePoint REST call (read or
  write). All Wave 3 routes return fixture-shaped data from in-memory
  mocks; no tenant network call appears in any code path.
- Implement any Procore runtime (no SDK, secrets, sync, mirror,
  write-back, or live REST call).
- Implement any Document Crunch or Adobe Sign runtime.
- Implement any Site Health scanner or repair runner.
- Implement any Team & Access permission execution.
- Implement any approval execution.
- Implement any provisioning executor work.
- Default the SPFx app from fixtures to backend data. The Wave 2 SPFx
  app stays fixture-driven by default for the entirety of Wave 3.
- Publish any `.sppkg` artefact, modify CI/CD workflows, or upload
  anything to an app catalog.
- Bump any package, solution, or manifest version.

## 6. Route Namespace (Locked — see W3-OD-001)

**Frozen for MVP:** `/api/pcc/projects/{projectId}/...`.

This namespace pattern is locked for the entire Wave 3 read-model
foundation. Concrete route paths under it (per
`docs/architecture/blueprint/sp-project-control-center/phase-3/03_PCC_Backend_Service_Contract_Design.md`)
include `/profile`, `/modules`, `/home`, `/priority-actions`,
`/document-control`, `/external-links`, `/site-health`,
`/team-access`, `/approvals`, `/readiness`, `/responsibilities`,
`/workflows`, `/workflow-items`, `/settings`. The exact subset
implemented in mock mode is decided in Prompt 02 and Prompt 05.

The decision to lock this namespace is recorded as
**W3-OD-001 — Frozen for MVP** in `Wave_3_Open_Decisions.md`.
Alternative namespaces (e.g. flat `/api/pcc-read-model/...`,
admin-style `/api/admin/pcc/...`) are explicitly **rejected** for
Wave 3 absent a separate human override.

## 7. DTO / Read-Model Placement (Locked — see W3-OD-002)

**Frozen for MVP:** `packages/models/src/pcc/`, exposed through the
existing `@hbc/models/pcc` barrel.

Wave 3 DTO/read-model contracts land additively in this canonical
package. The Wave 1 record contracts that the Wave 2 SPFx app already
consumes stay where they are; the new read-model envelope and DTOs
live alongside them so a single `@hbc/models/pcc` import surface
serves both SPFx (record contracts) and backend (read-model DTOs).

The decision to lock this placement is recorded as
**W3-OD-002 — Frozen for MVP** in `Wave_3_Open_Decisions.md`.
Alternative placements are explicitly **rejected / deferred** for
Wave 3 absent a separate human override:

- `@hbc/models/pcc-backend` (new sub-package or sub-path) — **rejected**: would split the SPFx-vs-backend import surface and force consumers to know which sub-path to import. Not pursued in Wave 3.
- Co-located `backend/functions/src/.../dtos/` — **rejected**: would put DTOs out of reach of any future SPFx consumer that opts in via the W3-OD-012 flag, and would break the "single canonical PCC vocabulary" posture.

## 8. Backend Source Placement (Open — Prompt 02 to Resolve — see W3-OD-003)

Two candidates remain, and **Prompt 02 must lock one** before any
backend source lands:

- **Candidate A — extend the monolithic functions host (`backend/functions/src/index.ts`)** with new `/api/pcc/projects/{projectId}/...` routes. Pros: simplest path; reuses the monolithic composition root. Cons: monolithic host is the legacy pattern; the recent backend roadmap has moved toward scoped domain hosts.
- **Candidate B — new scoped domain host (e.g. `backend/functions/src/hosts/pcc-read-model/`)** with its own composition root, scoped service factory, `host.json`, and `RELEASE-SCOPE.md`. Pros: matches the admin-control-plane pattern (per ADR-0124 referenced in `backend/functions/README.md`); preserves host-boundary discipline; gives PCC its own release scope. Cons: more files in the initial scaffold.

**Status:** **Human Decision Required** (W3-OD-003). The recommendation
in this scope lock is Candidate B (scoped host) on the strength of the
existing roadmap's host-boundary direction, but the decision is not
locked until Prompt 02 closes it. Source-placement choice does **not**
affect §6 (route namespace) or §7 (DTO placement) — both remain locked
regardless.

## 9. Mock / Local Provider Posture

Wave 3 read routes return **fixture-shaped** data sourced from
in-memory mocks. No network I/O, no Azure Tables read, no Graph call,
no SharePoint REST call, no Procore call. The mock response shapes
must match the SPFx shell's existing record-contract expectations
derived from Wave 1 `@hbc/models/pcc` types and the Wave 3 read-model
DTOs landed under §7.

A **proof-gated** decision (W3-OD-014, with related W3-OD-016 lockfile
posture) governs whether durable persistence (e.g. Azure Tables) may
be introduced in a later wave — **not Wave 3**. The existing
admin-control-plane Azure Tables stay out of Wave 3 scope.

## 10. SPFx Client Boundary Posture (No Default Runtime Cutover)

The Wave 2 SPFx app (`apps/project-control-center/`) is **fixture-driven
by default for the entirety of Wave 3**. It does not import any
backend client by default. **Wave 3 does not switch the SPFx default
data mode to backend.**

Prompt 06 introduces a **runtime-configurable** opt-in mechanism (a
flag whose name and default value are decided in Prompt 06). The
mandatory default value is `false` (fixtures). Per-region opt-in to
backend reads is the only mechanism by which SPFx may consume a
read-only route, and the seam must remain overridable to fixtures in
tests. The Wave 2 no-runtime guard tests must continue to pass
throughout Wave 3.

This posture is recorded as **W3-OD-012 — Runtime Configuration** in
`Wave_3_Open_Decisions.md`.

## 11. Deferred Work

Explicitly deferred to Wave 4 or later:

- Per-module SPFx wiring to backend reads beyond the single
  client-boundary seam introduced in Prompt 06.
- Any HTTP write verb on any route family.
- Live Microsoft Graph–backed Document Control file operations.
- Live Site Health scanner + repair runner.
- Live external-system launch links + missing-config remediation
  flows.
- Live approval execution + workflow transitions.
- Live Team & Access permission requests + access-manager actions.
- Tenant-side configuration / consent / app catalog publication.
- Hosted SPFx parity proof.
- Any backend-driven fixture promotion or migration tooling.
- Any deployment workflow change.
- An ADR for the chosen scoped-host pattern (W3-OD-018) — recommended
  at Wave 3 closeout, not at Prompt 02.

## 12. Human Decisions

The decisions enumerated in §6 (route namespace) and §7 (DTO
placement) are **locked** by this scope lock as W3-OD-001 and
W3-OD-002 respectively. Prompt 02 may not reopen them without a
separate human override.

Prompt 02's substantive open decision is §8 (backend source placement,
W3-OD-003). Prompt 06's substantive open decision is §10 (SPFx
feature-flag name + default, W3-OD-012, with default `false`).

## 13. Validation Expectations

- Each Wave 3 prompt that touches source runs the package-scoped
  command set for the package(s) it touches:
  - `pnpm --filter @hbc/functions check-types | test | build | lint`
  - `pnpm --filter @hbc/models check-types | test`
  - `pnpm --filter @hbc/spfx-project-control-center check-types | test | build | lint` (Prompt 06 only — for the client-boundary seam)
- Each Wave 3 prompt captures pre/post `pnpm-lock.yaml` MD5 and stops
  if it churns. Lockfile changes are accepted only when they are
  strictly new-importer metadata or a deliberately approved dependency
  addition (W3-OD-014).
- Each Wave 3 prompt asserts no new forbidden import surface. The
  Wave 2 two-pass scanner posture extends to backend source where
  applicable.
- Documentation-only prompts (Prompt 01 here, Prompt 02, Prompt 07)
  run only `git status --short`.

## 14. Wave 3 Prompt Sequence

The seven Wave 3 prompts (matching the canonical sequence in
`docs/architecture/plans/MASTER/spfx/pcc/phase-03/wave-03/README.md`):

| Prompt | Title | Kind | Substantive output |
| --- | --- | --- | --- |
| 01 | Repo-truth gate and scope lock | Documentation only | This `Wave_3_Scope_Lock.md` + `Wave_3_Open_Decisions.md` |
| 02 | Backend route namespace and DTO placement decision | Decision / architecture-lock only — **does not implement route source** unless a separate human approval explicitly reopens that scope | `Wave_3_Backend_Route_and_DTO_Placement.md`; resolves W3-OD-003 (backend source placement); confirms W3-OD-001 + W3-OD-002 locks |
| 03 | PCC read-model contracts | Source — `packages/models/src/pcc/` only | New read-model DTOs / envelope types added additively to `@hbc/models/pcc`; model-level tests |
| 04 | Backend mock / local read-model provider | Source — `backend/functions/src/...` only | Mock provider returning fixture-shaped data; provider tests |
| 05 | Read-only backend routes in mock mode | Source — `backend/functions/src/...` only | `GET` route handlers wired to the mock provider; route boundary tests |
| 06 | SPFx client boundary with no default runtime cutover | Source — `apps/project-control-center/src/...` only | Client-boundary seam + W3-OD-012 flag (default `false`); guard tests; SPFx default remains fixtures |
| 07 | Wave 3 closeout, proof, and Wave 4 readiness | Documentation only | `Wave_3_Closeout.md` aggregating implemented files, validation results, deferred work, no-runtime guard re-assertion, and Wave 4 readiness recommendation |

No prompt combines decision work with first-time route implementation
unless a separate human override explicitly reopens that scope.

## 15. Exit Criteria for Wave 3

Wave 3 closes when **all** of the following hold:

1. The `/api/pcc/projects/{projectId}/...` route namespace is
   documented and live (read-only) inside `backend/functions/`.
2. Read-model DTOs live in `packages/models/src/pcc/` and are exported
   through `@hbc/models/pcc`. They are imported by the route handlers.
   The Wave 2 SPFx app does not import them by default.
3. The mock / local provider returns fixture-shaped data; no tenant
   network call is in any code path.
4. Boundary tests assert no write verb, no Graph / PnP / SharePoint
   REST / Procore / Document Crunch / Adobe Sign import, and no
   mutation surface.
5. The SPFx client boundary (Prompt 06) defaults to `false` (fixtures).
   The Wave 2 no-runtime guard tests remain green.
6. `Wave_3_Closeout.md` documents implemented files, package version
   posture, validation results, lockfile status, deferred Wave 4+
   items, and the explicit Wave 3 non-claims (no live tenant calls, no
   deployment, no app catalog, no write routes, no default SPFx
   cutover).
7. No `package.json` / `pnpm-lock.yaml` churn beyond what the
   read-model foundation strictly required, and that churn is
   explicitly justified per W3-OD-014.

## Closeout Confirmations (Prompt 01)

- **Wave 3 planning is ready** (not blocked). All five Wave 2 readiness gates pass.
- Wave 2 Prompt 9 closeout (`Wave_2_Closeout.md`, commit `bd440c141`) was verified.
- Wave 3 may begin with **Prompt 02**. **Prompt 02 is a decision / architecture-lock prompt only and does not implement route source unless a separate human approval explicitly reopens that scope.**
- Wave 3 remains **read-model-only** and **no-mutation**.
- Route namespace and DTO placement are **locked** by this scope lock; Prompt 02's substantive open decision is backend source placement (W3-OD-003).
- Prompt 06 introduces the SPFx client-boundary opt-in seam; the SPFx default data mode remains **fixtures** for the entirety of Wave 3.
