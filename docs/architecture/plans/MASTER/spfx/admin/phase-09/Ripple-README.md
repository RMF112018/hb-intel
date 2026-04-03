# README — Admin SPFx IT Control Center Phase 9 Ripple Update Prompt Package

## What this package contains

This package is a **local-code-agent follow-on prompt set** for the **Phase 9 hybrid identity redirect**.

Its purpose is to update the **upstream and downstream development program** so the surrounding phases, architecture docs, and repo-aligned guidance remain consistent with:

- **Phase 9 — Hybrid Identity Administration foundation**
- **source-of-authority-aware identity execution**
- **hard no-code IT handoff/setup**
- and the existing **SPFx operator console / privileged backend** architecture boundary

Included files:

1. `Admin-SPFx-IT-Control-Center-Phase-9-Ripple-Update-Summary-Plan.md`
2. `README.md`
3. `Prompt-12-Program-Ripple-Map-and-Phase-Dependency-Reconciliation.md`
4. `Prompt-13-Upstream-Architecture-Boundary-and-Contract-Updates.md`
5. `Prompt-14-Upstream-Operator-Setup-Connection-Preflight-and-Provisioning-Dependency-Updates.md`
6. `Prompt-15-Downstream-Standards-Config-Safety-and-Observability-Alignment.md`
7. `Prompt-16-End-State-Plan-Target-Architecture-and-Admin-Docs-Reconciliation.md`
8. `Prompt-17-Validation-Reconciliation-and-Program-Ripple-Exit.md`

## Intended execution order

Run the prompts in numeric order after the main Phase 9 redirect package.

Do not skip ahead unless a prompt explicitly says to stop because repo truth has materially changed and later prompts would become unsafe.

## What this package assumes is already true

- The main Phase 9 package has already redirected the identity lane from Entra-only administration to hybrid identity administration.
- The local code agent has access to the current live repo.
- The updated Phase 9 architecture / end-state direction is the intended target.
- The project still preserves:
  - SPFx as operator console,
  - privileged backend/control plane,
  - adapter-based execution,
  - durable audit/evidence expectations,
  - and no-code IT setup as a hard requirement.

## How the local code agent should use these prompts

- Treat current live repo code and `docs/architecture/blueprint/current-state-map.md` as present-truth authority.
- Use the smallest authoritative file set necessary for each prompt.
- Do **not** re-read files that are still within active context or memory unless:
  - they changed,
  - the prompt explicitly requires a fresh check,
  - the context has gone stale,
  - or the task widened materially.
- Keep the ripple package focused on the direct consequences of the Phase 9 redirect.
- Prefer targeted corrections over broad rewrite.
- Update documentation, boundaries, contracts, and reserved extension points before inventing speculative implementation work.

## What changed from the main Phase 9 package

The main Phase 9 package focuses on building the **Hybrid Identity** lane itself.

This ripple package focuses on making sure the rest of the program no longer contradicts that lane.

In practical terms, it addresses:

- upstream doctrine and contract expectations,
- setup / connection / preflight / provisioning readiness assumptions,
- downstream config-governance and safety posture,
- downstream observability and runbooks,
- and the canonical planning docs.

## Execution cautions

- Do not revert the Phase 9 redirect back to broad Entra-only administration.
- Do not treat AD DS and Entra as interchangeable authorities.
- Do not let no-code IT setup remain only a phase-local README statement; propagate it where the program requires it.
- Do not push privileged or secret-handling logic into SPFx.
- Do not create contradictions between the end-state plan, target architecture, phase docs, and local READMEs.
- Do not silently widen scope beyond the real ripple of the Phase 9 redirect.

## Expected repository outputs

### Documentation
Primarily under:
- `docs/architecture/plans/MASTER/spfx/admin/**`

### Frontend and backend alignment where necessary
Primarily under:
- `apps/admin/**`
- `backend/functions/**`
- `packages/features/admin/**` only where truly appropriate

## Validation posture

Use the smallest meaningful validation set for each prompt.

Because this is a ripple / reconciliation package, validation is expected to focus on:

- targeted document consistency,
- route / naming / contract alignment,
- TypeScript/build checks only where touched code changes are required,
- and final reconciliation.

## Completion standard

The package is complete when the surrounding development program and canonical docs no longer materially contradict the updated Phase 9 hybrid identity target.
