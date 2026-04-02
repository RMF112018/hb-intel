# Admin SPFx IT Control Center — Locked Decisions and Phase-Boundary Guards

## 1. Purpose

This document is the anti-drift control for the Admin SPFx IT Control Center program. It records decisions that are **locked** — not open for relitigating in later prompts or phases — and defines **boundary guards** that prevent later implementation work from violating Phase 1 doctrine.

If a locked decision needs to change, the change-control rule in Section 7 applies.

## 2. Locked decisions

| # | Decision | Status |
|---|----------|--------|
| LD-01 | Admin SPFx is the operator console, not the privileged executor. | Locked |
| LD-02 | Privileged and long-running admin work belongs in the backend/control plane. | Locked |
| LD-03 | `@hbc/features-admin` remains the admin intelligence layer, not the control plane. | Locked |
| LD-04 | Existing provisioning/control-plane foundations are to be generalized, not discarded. | Locked |
| LD-05 | Provisioning remains straight-through under normal conditions. | Locked |
| LD-06 | Other risky admin actions may require checkpointed automation. | Locked |
| LD-07 | Broad Entra administration is early-class scope. | Locked |
| LD-08 | Standards/configuration governance is a first-class capability with hybrid repo/live control where appropriate. | Locked |
| LD-09 | Early active SharePoint writes stay limited to HB Intel-managed assets. | Locked |
| LD-10 | Single-admin execution requires strong safety controls, previews, traceability, and evidence. | Locked |

## 3. Why each decision is locked

### LD-01 — Admin SPFx is the operator console

**Rationale**: Browser-side code cannot safely hold elevated credentials, survive session loss, or guarantee completion of long-running operations. The SPFx layer's job is to observe, initiate, and manage — not to execute privileged work.

**Verified by**: Architecture baseline Section 4.1, boundary matrix no-go statements.

### LD-02 — Privileged work belongs in the backend

**Rationale**: Privileged Graph writes, SharePoint admin operations, durable orchestration, retry/compensation, and audit persistence all require server-side execution with Managed Identity or elevated credentials. These cannot be moved to the browser without breaking security, durability, and auditability guarantees.

**Verified by**: Architecture baseline Section 4.2, boundary matrix capability rows for orchestration/retries/compensation.

### LD-03 — @hbc/features-admin stays intelligence, not control plane

**Rationale**: `@hbc/features-admin` is a reusable package consumed by the admin app. Mixing privileged execution into it would collapse the intelligence/execution boundary, create circular dependencies, and turn a reusable package into a monolithic control plane. The package already has a clean architecture (ports-and-adapters, ADR-0106) that should be preserved.

**Verified by**: Repo-truth verification Section 6 (explicit non-gap), boundary matrix package ownership notes.

### LD-04 — Generalize existing foundations, don't discard

**Rationale**: The saga orchestrator, service factory, Graph/SharePoint adapters, and Table Storage persistence are production-grade and proven. Discarding them to start over would waste significant investment and introduce risk. The correct approach is to generalize the provisioning-specific patterns into reusable admin control-plane patterns.

**Verified by**: Repo-truth verification Sections 3 and 6.

### LD-05 — Provisioning runs straight through

**Rationale**: The provisioning saga already executes seamlessly from start to finish under normal conditions, only pausing when failure conditions occur. This behavior is correct and must be preserved. Adding unnecessary checkpoints to provisioning would slow deployments and frustrate operators without adding safety value.

**Verified by**: Saga orchestrator implementation — 7-step execution with Step 5 deferral on timeout, no mid-flow approval gates.

### LD-06 — Risky actions use checkpointed automation

**Rationale**: Actions outside provisioning (Entra changes, SharePoint repairs, config reapplication) may carry higher risk or irreversibility. These should pause at meaningful checkpoints for operator review. The checkpoint model is distinct from provisioning's straight-through model.

**Verified by**: End-state plan Section 5, locked decision #5.

### LD-07 — Broad Entra administration is early scope

**Rationale**: Entra user/group management is a foundational control-center capability, not a nice-to-have for later. The Graph adapter already supports group lifecycle operations. Building Entra administration early ensures the control center delivers real value beyond provisioning oversight from the start.

**Verified by**: End-state plan locked decision #3, domain taxonomy (Entra Control domain).

### LD-08 — Standards/config governance is first-class

**Rationale**: Without governed standards, drift detection has no baseline, repair has no target, and audit trails have no reference point. The hybrid model (code defaults + live admin-maintained overrides) is required because some standards must be adjustable in the live environment without a code deployment.

**Verified by**: End-state plan locked decision #7, domain taxonomy (Standards/Config Governance domain).

### LD-09 — First-wave SharePoint writes limited to HB Intel-managed assets

**Rationale**: Active writes against arbitrary tenant SharePoint assets require broader approval, a mature governance model, and safety controls that are not in first-wave scope. Limiting active writes to HB Intel-managed assets reduces risk while still delivering meaningful SharePoint control.

**Verified by**: Release-scope map — advisory/visibility tier for broader tenant SharePoint.

### LD-10 — Single-admin execution with strong safety controls

**Rationale**: The system allows one authorized admin to approve and execute even high-risk actions. This makes safety controls (previews, dry runs, impact summaries, destructive-action warnings, post-run validation, evidence recording) **more important, not less**. Without multi-party approval, the safety net must be built into the system itself.

**Verified by**: End-state plan locked decision #8, boundary matrix (high-risk action initiation row).

## 4. Implementation consequences

Each locked decision creates concrete implementation constraints:

| Decision | Consequence |
|----------|-------------|
| LD-01 | All privileged operations must flow through backend APIs. SPFx calls trigger endpoints, never executes directly. |
| LD-02 | New admin capabilities requiring elevated credentials must be implemented as backend services, not browser-side logic. |
| LD-03 | `@hbc/features-admin` may grow monitors, probes, hooks, and dashboard components. It must not grow orchestrators, adapters, or persistence writers. |
| LD-04 | New admin domains (Entra control, SharePoint control, install) must follow the saga/adapter/factory pattern established by provisioning. |
| LD-05 | No phase may add approval gates or checkpoints to the provisioning saga unless a specific failure mode demands it. |
| LD-06 | Non-provisioning admin workflows must define their checkpoint model during design. Default to checkpointed for high-risk actions. |
| LD-07 | Entra administration must be designed and scheduled as a real Phase 9 workstream, not deferred indefinitely. |
| LD-08 | The config governance engine must support both code defaults and live overrides with versioning. Neither mode alone is sufficient. |
| LD-09 | SharePoint write adapters must enforce scope checks. First-wave code paths must not accept arbitrary site URLs without validation. |
| LD-10 | Every admin action that modifies tenant state must produce an audit record, and high-risk actions must offer preview/dry-run before execution. |

## 5. Phase-boundary guards

These guards prevent scope drift during implementation:

| Guard | Rule |
|-------|------|
| PBG-01 | Phase 1 must not implement Phase 2 contract schema work (run types, action contracts, audit schemas). |
| PBG-02 | Phase 1 must not implement generalized admin API endpoints. |
| PBG-03 | Phase 1 must not build broad new UI flows beyond what is required for architecture and documentation alignment. |
| PBG-04 | No target-state claim may be written into `current-state-map.md` as if already implemented. |
| PBG-05 | No prompt or later document may treat `@hbc/features-admin` as the control plane. |
| PBG-06 | No phase may silently move privileged logic into SPFx without an ADR justifying the boundary change. |
| PBG-07 | No phase may introduce a new persistence store without checking alignment with the Phase 4 generalization plan. |
| PBG-08 | No phase may add external dependencies without checking `package-relationship-map.md`. |
| PBG-09 | No phase may create reusable visual components outside `@hbc/ui-kit`. |
| PBG-10 | No phase may implement later-expansion scope items (release-scope map tier 3) without explicit authorization. |

## 6. Explicit future-phase questions that remain open

These questions are **genuinely open** and should be resolved in the designated phase, not in Phase 1:

| Question | Designated phase | Why it remains open |
|----------|-----------------|---------------------|
| What is the generalized run schema for non-provisioning admin actions? | Phase 2 | Requires domain analysis across Entra, SharePoint control, install, and repair use cases. |
| What checkpoint model applies to Entra user/group changes? | Phase 9 | Risk tiers for identity operations need domain-specific analysis. |
| Should the config governance store use Azure Tables, SharePoint lists, or another backend? | Phase 10 | Storage choice depends on versioning, query, and audit requirements not yet fully specified. |
| How should repair workflows handle partial success? | Phase 7–8 | Repair semantics depend on the specific domain (site repair vs permission repair vs config reapplication). |
| What is the retention model for audit records? | Phase 4 | Retention boundaries depend on compliance requirements and storage cost modeling. |
| Should the admin app support multi-tenant or delegated administration? | Post-Phase 13 | Later expansion scope. Not in first-wave design. |
| How should the setup wizard handle environments where backend deployment requires external approvals? | Phase 6 | Install/bootstrap flow design is Phase 6 work. |

## 7. Change-control rule for revisiting a locked decision

A locked decision may only be revisited when:

1. **New repo truth contradicts the decision** — verified live code or configuration makes the locked decision factually wrong.
2. **A material implementation blocker is discovered** — a later phase cannot proceed without changing the boundary, and no reasonable workaround exists.
3. **The user explicitly authorizes revisiting** — the human operator asks to reconsider a specific locked decision.

When revisiting:
- Document the reason in an ADR under `docs/architecture/decisions/`.
- Update this document to reflect the new decision.
- Update the architecture baseline, boundary matrix, and any other affected Phase 1 artifacts.
- Do not silently override — make the change visible and traceable.

Locked decisions are not changed by:
- Convenience ("it would be easier to put this in SPFx").
- Implication ("the prompt didn't explicitly say not to").
- Precedent from other projects ("other SPFx apps do it this way").
- Scope pressure ("we need this feature sooner").
