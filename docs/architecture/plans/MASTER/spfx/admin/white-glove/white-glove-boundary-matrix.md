# White-Glove Device Deployment — Boundary Matrix

## Purpose

Map each white-glove operational concern to its owning layer. This matrix is the authoritative reference for where responsibility lives during implementation.

Follows the pattern established in the [Phase 1 boundary matrix](../phase-01/admin-spfx-boundary-matrix.md). For the full architectural baseline, see [white-glove-architecture-baseline.md](white-glove-architecture-baseline.md).

---

## Ownership matrix

| Operational concern | SPFx operator console | Backend control plane | Adapter layer | Platform-native system | NinjaOne |
|---|---|---|---|---|---|
| **Connector setup** | Configuration UX, test initiation | Credential storage, secret resolution, connection persistence | Connection validation per platform | Auth endpoint, token exchange | OAuth grant, API key validation |
| **Readiness validation** | Readiness display, preflight UX | Readiness orchestration, threshold evaluation | Platform-specific readiness checks | Enrollment readiness state, profile availability | Agent presence, policy readiness |
| **Package launch** | Employee lookup, package selection, device details capture, launch confirmation | Package run creation, child run creation, readiness snapshot capture | — | — | — |
| **Run orchestration** | Status polling, progress display (via SignalR or poll) | Parent/child run state machine, step sequencing, adapter invocation | Step execution per platform, result normalization | Enrollment execution, profile assignment | Software deployment, script execution |
| **Checkpoints** | Checkpoint display, acknowledgment UX | Checkpoint creation, timeout, escalation, lifecycle management | Checkpoint triggers from adapter results | — | — |
| **Retries / compensation / repair** | Retry initiation UX, repair guidance display | Retry rule evaluation, compensation execution, repair orchestration, state rollback | Platform-specific retry and rollback operations | Rollback where supported (unenroll, unassign) | Re-run scripts, re-apply policies |
| **Evidence** | Evidence browsing, download initiation | Evidence capture, persistence, retention policy enforcement, manifest generation | Evidence collection from platform responses | Enrollment receipts, compliance state, assignment confirmations | Validation results, deployment receipts |
| **Run history and audit** | History browsing, filtering, detail view, export | Durable run persistence, audit event persistence, operator action attribution | Adapter result records (fed into audit) | — | — |

---

## Connector ownership by platform

| Connector | Setup UX (SPFx) | Credential storage (Backend) | Validation (Adapter) | External authority |
|---|---|---|---|---|
| Microsoft Entra ID / Graph | Admin configures app registration details | Backend stores and resolves credentials | Microsoft adapter tests Graph connectivity | Microsoft Entra ID |
| Microsoft Intune | Admin configures Intune connection | Backend stores and resolves credentials | Microsoft adapter tests Intune API | Microsoft Intune |
| Windows Autopilot | Admin configures Autopilot settings | Backend stores and resolves credentials | Microsoft adapter tests Autopilot access | Windows Autopilot service |
| Apple Business Manager | Admin configures ABM token | Backend stores and resolves credentials | Apple adapter tests ABM connectivity | Apple Business Manager |
| Apple ADE | Admin configures ADE server token | Backend stores and resolves credentials | Apple adapter tests ADE token validity | Apple ADE |
| NinjaOne | Admin configures OAuth / API credentials | Backend stores and resolves credentials | NinjaOne adapter tests API connectivity | NinjaOne API |

---

## Decision authority by device platform

| Decision | Windows (HP/Dell/Alienware) | macOS (MacBook Pro) | iPhone | iPad |
|---|---|---|---|---|
| Enrollment authority | Microsoft Autopilot + Intune | Apple ADE + Intune MDM | Apple ADE + Intune MDM | Apple ADE + Intune MDM |
| Identity authority | Microsoft Entra ID | Microsoft Entra ID | Microsoft Entra ID | Microsoft Entra ID |
| Post-enrollment standardization | NinjaOne | NinjaOne | NinjaOne (where applicable) | NinjaOne (where applicable) |
| Compliance authority | Microsoft Intune | Microsoft Intune | Microsoft Intune | Microsoft Intune |

---

## Cross-references

- [Architecture baseline](white-glove-architecture-baseline.md) — full layer ownership definitions
- [Repo-truth reuse map](white-glove-repo-truth-reuse-map.md) — what exists, what to extend, what to build
- [No-go list](white-glove-no-go-list.md) — implementation constraints
