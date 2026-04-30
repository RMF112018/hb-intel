# Phase 3 — Wave 3 Open Decisions

**Wave:** 3 (PCC Backend Read-Model Foundation)
**Established by:** Prompt 01 (paired with `Wave_3_Scope_Lock.md`)
**Date:** 2026-04-30

## Status Legend

| Status | Meaning |
| --- | --- |
| **Frozen for MVP** | Decision is locked for Wave 3 and downstream module waves; cannot be revisited without a separate human override or ADR. |
| **Runtime Configuration** | Behaviour is configurable at runtime (e.g. via a feature flag). The default and gating posture must be specified. |
| **Deferred** | Decision is intentionally not made in Wave 3; deferred to a later wave or to a Wave 3 closing prompt. |
| **Proof-Gated** | Decision is contingent on a piece of repo-truth proof (e.g. a chosen DTO shape, a specific route family scaffolded) that hasn't landed yet. Will be revisited when the proof exists. |
| **Human Decision Required** | Decision needs explicit human approval before Wave 3 can act on it. |

## Decision Register

| # | Decision | Status | Notes |
| --- | --- | --- | --- |
| W3-OD-001 | **Route namespace.** | **Frozen for MVP** | Locked to `/api/pcc/projects/{projectId}/...`. Alternative namespaces (flat `/api/pcc-read-model/...`, admin-style `/api/admin/pcc/...`) are rejected for Wave 3 absent a separate human override. |
| W3-OD-002 | **DTO / read-model placement.** | **Frozen for MVP** | Locked to `packages/models/src/pcc/`, exposed through the existing `@hbc/models/pcc` barrel. Alternatives `@hbc/models/pcc-backend` (sub-package or sub-path) and co-located `backend/functions/src/.../dtos/` are rejected for Wave 3 absent a separate human override. |
| W3-OD-003 | **Backend source placement.** Monolithic functions host (`backend/functions/src/index.ts`) **(A)** vs. new scoped domain host (`backend/functions/src/hosts/pcc-read-model/`) **(B)**. | **Human Decision Required** | Prompt 02 resolves. Recommendation: Candidate B (scoped host) on the strength of the existing roadmap's host-boundary direction, but the decision is not locked until Prompt 02 closes it. Either choice still respects W3-OD-001 (route namespace) and W3-OD-002 (DTO placement). |
| W3-OD-004 | **Read-only routes may be implemented in Wave 3.** | **Frozen for MVP** | Yes. Wave 3 scope is read-model only; read-only `GET` route scaffolds are the substantive deliverable from Prompt 05 onward. |
| W3-OD-005 | **Write routes may be implemented in Wave 3.** | **Frozen for MVP** | **No.** Zero `POST` / `PUT` / `PATCH` / `DELETE`. Write routes are deferred to a later wave alongside their per-module approval / authorization model. |
| W3-OD-006 | **Graph / PnP / SharePoint REST runtime may be called in Wave 3.** | **Frozen for MVP** | **No.** Wave 3 routes return fixture-shaped data from in-memory mocks. No tenant network call appears in any code path. |
| W3-OD-007 | **Procore runtime may be introduced in Wave 3** (SDK, secrets, sync, mirror, write-back, or live REST calls). | **Frozen for MVP** | **No.** Procore remains deferred to a later wave gated by Phase 2 / tenant-mutation review. |
| W3-OD-008 | **Document Crunch / Adobe Sign runtime may be introduced in Wave 3.** | **Frozen for MVP** | **No.** Both remain launch-link / visibility-only at the SPFx level (per Wave 2 / Prompt 06) and have no runtime in Wave 3 backend. |
| W3-OD-009 | **Site Health repair may execute in Wave 3** (scanner, repair runner, mutation). | **Frozen for MVP** | **No.** Site Health repair execution is deferred. Wave 3 may scaffold a read-only `/api/pcc/projects/{projectId}/site-health` route returning fixture-shaped summary, but it must not run any scan or repair. |
| W3-OD-010 | **Team & Access permission execution may occur in Wave 3** (request approval, audience changes, access-manager actions). | **Frozen for MVP** | **No.** Permission execution is deferred. Wave 3 may scaffold a read-only `/api/pcc/projects/{projectId}/team-access` route returning fixture-shaped data, but it must not mutate Microsoft 365 group membership or any permission state. |
| W3-OD-011 | **Approval execution may occur in Wave 3** (decisions written through). | **Frozen for MVP** | **No.** Approval execution is deferred. Wave 3 may scaffold a read-only `/api/pcc/projects/{projectId}/approvals` route returning fixture-shaped checkpoint state. |
| W3-OD-012 | **SPFx app defaults to backend data.** | **Runtime Configuration** | **Default: NO** — the Wave 2 SPFx app stays fixture-driven for the entirety of Wave 3. Per-region opt-in to backend reads is gated behind a runtime feature flag whose name and default value are decided in Prompt 06. The flag default must be `false` (fixtures). The Wave 2 no-runtime guard tests must continue to pass; opt-in regions read through a clearly named seam that is overridable to fixtures in tests. |
| W3-OD-013 | **Packaging or deployment may occur in Wave 3.** | **Frozen for MVP** | **No.** No `.sppkg` packaging, no app-catalog publication, no Azure Functions deployment, no CI/CD workflow change. Wave 3 is source + docs only inside the affected packages. Hosted parity / deployment posture remains operator-pending and is the domain of a Wave 3 closing prompt + a separate deployment authorization workflow. |
| W3-OD-014 | **`package.json` / `pnpm-lock.yaml` churn during Wave 3.** | **Proof-Gated** | Allowed only if the read-model foundation strictly requires it (e.g. an HTTP-helper or DTO-shape utility already used by adjacent backend hosts). Each instance is justified in the relevant per-prompt closeout with the specific dependency, the upstream package it follows, and the resolved-version delta. New dependencies cannot be added without explicit approval. |
| W3-OD-015 | **Per-prompt validation command set.** | **Frozen for MVP** | Each Wave 3 prompt that touches backend source runs `pnpm --filter @hbc/functions check-types | lint | test | build` (or the explicit subset relevant to the touched source). Each prompt that touches `@hbc/models` source runs `pnpm --filter @hbc/models check-types | test`. Prompt 06 (SPFx client-boundary) runs `pnpm --filter @hbc/spfx-project-control-center check-types | test | build | lint`. Documentation-only prompts (01, 02, 07) run `git status --short`. Pre/post `pnpm-lock.yaml` MD5 capture is mandatory whenever source is touched. |
| W3-OD-016 | **Lockfile churn tolerance.** | **Frozen for MVP** | If `pnpm-lock.yaml` changes during validation, the prompt stops and reports. Lockfile changes are accepted only when they are strictly new-importer metadata or a deliberately approved dependency addition (W3-OD-014). |
| W3-OD-017 | **Wave 3 SPFx source modification.** | **Proof-Gated** | Wave 3 modifies `apps/project-control-center/src/**` only in Prompt 06 (the client-boundary seam) and only behind the W3-OD-012 feature flag with default `false`. No other Wave 3 prompt touches SPFx source. The Wave 2 no-runtime guard tests must continue to pass after Prompt 06. |
| W3-OD-018 | **ADR for the chosen scoped-host pattern.** | **Deferred** | If Wave 3 introduces a new scoped host (W3-OD-003 Candidate B), an ADR is recommended at Wave 3 closing prompt — not at Prompt 02 — so the route family surface is documented before the architectural record lands. |

## Decisions That Prompt 02 Must Resolve

At minimum, Prompt 02 must move the following from **Human Decision
Required** to **Frozen for MVP**:

- **W3-OD-003 (backend source placement)** — monolithic functions host vs. new scoped PCC read-model host.

Prompt 02 is otherwise a documentation / architecture-lock prompt; it
does not implement route source unless a separate human override
explicitly reopens that scope.

## Decisions Already Locked Coming Out of Prompt 01

- **W3-OD-001 (route namespace)** — `/api/pcc/projects/{projectId}/...`
- **W3-OD-002 (DTO / read-model placement)** — `packages/models/src/pcc/` exposed through `@hbc/models/pcc`
- **W3-OD-004 (read-only routes allowed)** — yes
- **W3-OD-005 (write routes)** — no
- **W3-OD-006 (Graph / PnP / SharePoint REST runtime)** — no
- **W3-OD-007 (Procore runtime)** — no
- **W3-OD-008 (Document Crunch / Adobe Sign runtime)** — no
- **W3-OD-009 (Site Health repair execution)** — no
- **W3-OD-010 (Team & Access permission execution)** — no
- **W3-OD-011 (approval execution)** — no
- **W3-OD-013 (packaging / deployment)** — no
- **W3-OD-015 (per-prompt validation set)** — fixed
- **W3-OD-016 (lockfile churn tolerance)** — strict

These are **Frozen for MVP**. They cannot be revisited inside Wave 3
without a separate human override or an ADR.

## Runtime-Configurable Decision

- **W3-OD-012 (SPFx defaults to backend data)** — default `false`. Per-region opt-in only, behind a flag named in Prompt 06.

## Proof-Gated Decisions

- **W3-OD-014 (`package.json` / `pnpm-lock.yaml` churn)** — each instance justified per-prompt.
- **W3-OD-017 (SPFx source modification)** — Prompt 06 only, behind the W3-OD-012 flag.

## Deferred Decisions

- **W3-OD-018 (ADR for scoped-host pattern)** — Wave 3 closing prompt, not Prompt 02.

## Closeout Note

This decision register is paired with `Wave_3_Scope_Lock.md` and
together they are the substantive deliverables of Wave 3 / Prompt 01.
The next step is **Prompt 02** — a decision / architecture-lock prompt
that resolves W3-OD-003 (backend source placement). Prompt 02 does not
implement route source unless a separate human override explicitly
reopens that scope.
