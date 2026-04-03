# Prompt-13 — Upstream Architecture, Boundary, and Contract Updates

## Objective

Update the upstream doctrine and control-plane preparation surfaces so Phases **1–4** no longer assume an Entra-only identity model and instead correctly prepare for **Hybrid Identity Administration**.

## Important execution rules

- Do not re-read files already in active context unless needed.
- Use Prompt-12 output as the immediate truth base.
- Correct only the upstream areas directly affected by the Phase 9 redirect.
- Do not turn this into a full architecture rewrite.
- Preserve the existing SPFx/frontend vs backend/control-plane boundary.

## Inputs

Use:
- `docs/architecture/plans/MASTER/spfx/admin/phase-9/admin-spfx-phase-9-program-ripple-map.md`
- current Admin target architecture doc
- current Admin end-state plan
- current Phase 1 / Phase 2 architecture-baseline, boundary, taxonomy, and scope docs if present
- any current Phase 3 / Phase 4 docs or repo notes that materially define contracts, audit, or adapter expectations

## Create or update

Create or update the smallest clean set needed under:
- `docs/architecture/plans/MASTER/spfx/admin/`

At minimum create:
1. `docs/architecture/plans/MASTER/spfx/admin/phase-9/admin-spfx-phase-9-upstream-corrections.md`

Update upstream docs only where Prompt-12 proves they are contradicted.

## Required implementation outcomes

### A. Correct the identity doctrine
Make upstream doctrine explicit that:
- Phase 9 is **Hybrid Identity Administration**, not broad Entra-only administration.
- identity actions must be **source-of-authority-aware**,
- Graph / Entra is not automatically the authority for all lifecycle actions,
- and the backend may need a first-class on-prem identity execution boundary.

### B. Correct boundary expectations
Ensure upstream boundaries explicitly preserve:
- SPFx as operator console,
- backend/control plane as privileged executor,
- adapters as system-specific execution boundaries,
- and no secret custody in SPFx.

### C. Correct contract/model expectations
Where upstream contract/model docs exist, update them so they account for:
- source-of-authority classification,
- execution target,
- connection dependency / readiness,
- connector health / setup posture,
- audit capture of authority used,
- and no-code IT setup as a program-level gate where applicable.

### D. Correct audit/evidence expectations
Upstream audit/evidence doctrine must not assume a single Graph-backed action lane.
It must allow for:
- AD DS or on-prem execution,
- cloud-side verification,
- readiness/preflight failure,
- blocked action due to missing prerequisite,
- and source-of-authority traceability.

## Required document content

The upstream correction doc must include:
1. Purpose
2. Inputs actually used
3. Upstream assumptions being corrected
4. Corrected doctrine by phase
5. Corrected boundary/contract expectations
6. Corrected audit/evidence expectations
7. Any repo-aligned naming changes required
8. Explicit non-goals

## Validation

Before finishing:
- confirm all updates are directly justified by Prompt-12,
- confirm no future-state speculation is written as present implementation fact,
- confirm the upstream changes preserve the existing control-plane architecture.

## Completion condition

Stop when the upstream docs and related alignment notes are updated cleanly enough for downstream prompts to rely on them.
Do not update setup/preflight/provisioning or downstream governance in this prompt.
