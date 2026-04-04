# Phase 11 — Safety Baseline

## 1. Why Phase 11 exists

The Admin SPFx IT Control Center is designed as an **IT operator console** that gives a single authorized admin direct execution power over sensitive platform operations — provisioning, identity lifecycle, device deployment, SharePoint control, app binding, configuration governance, and more.

The end-state plan explicitly permits **single-authorized-admin execution** for even the highest-risk actions. This eliminates multi-party approval as a safety mechanism.

Without a systematic safety model, high-risk actions become casual button clicks. Phase 11 exists to ensure that every risky admin action is:

- **classifiable** — its risk tier and required controls are explicit,
- **previewable** — the operator sees what will happen before committing,
- **confirmable** — the operator deliberately acknowledges scope and risk,
- **auditable** — durable evidence records what was previewed, confirmed, and executed,
- **validatable** — post-run checks confirm the action produced the intended result,
- **recoverable** — the operator receives guidance on how to remediate if something goes wrong.

---

## 2. Frontend vs backend safety ownership

The safety model has a strict boundary between what the frontend owns and what the backend enforces.

### Frontend (SPFx operator console) owns

- **Risk presentation:** showing the operator the action's risk tier, impact summary, and warnings.
- **Preview display:** rendering backend-generated preview/dry-run results.
- **Confirmation UX:** collecting explicit operator acknowledgment with appropriate ceremony for the risk tier.
- **Recovery guidance display:** presenting backend-generated recovery steps after failures.
- **Coaching and education:** contextual guidance (callouts, banners, coaching tips) that help operators understand what they are about to do.

### Backend (privileged control plane) owns

- **Safety policy enforcement:** the backend determines which safety controls are required for an action and rejects requests that skip required gates.
- **Preview/dry-run execution:** the backend generates preview results by inspecting real system state, not the frontend.
- **Execution gating:** the backend verifies that required safety controls (preview, confirmation, evidence capture) were satisfied before executing.
- **Post-run validation:** the backend validates execution results against expected outcomes.
- **Recovery guidance generation:** the backend generates context-aware recovery steps based on failure state.
- **Durable evidence capture:** the backend writes audit records and evidence to Azure Table Storage.
- **Compensation and rollback:** the backend owns compensating transactions when actions must be reversed.

### Why backend enforcement is mandatory

Frontend-only safety controls can be bypassed by:
- direct API calls,
- modified client code,
- automation scripts,
- future UI changes that inadvertently skip a safety step.

Backend enforcement ensures that **no execution path can skip required safety controls**, regardless of how the request originates. The safety policy is enforced at the API layer, not the UI layer.

---

## 3. How safety controls fit together

The Phase 11 safety model defines a pipeline of controls that an action traverses. Not every action requires every control — the required controls are determined by the action's risk tier.

```text
┌─────────────┐    ┌─────────────┐    ┌──────────────┐    ┌───────────┐    ┌─────────────┐    ┌──────────────┐
│  Classify    │───>│  Preview /   │───>│  Confirm /    │───>│  Execute  │───>│  Validate   │───>│  Recovery    │
│  action      │    │  dry-run     │    │  acknowledge  │    │           │    │  post-run   │    │  guidance    │
└─────────────┘    └─────────────┘    └──────────────┘    └───────────┘    └─────────────┘    └──────────────┘
       │                  │                   │                  │                │                    │
       v                  v                   v                  v                v                    v
  Risk tier +        Preview result      Confirmation      Execution        Validation           Recovery
  required           + impact summary    token / audit     result +         result +             steps +
  controls                               record            evidence         findings             remediation
```

### Classification

Every admin action is mapped to a risk tier and execution mode. This mapping is code-defined and deterministic. The mapping determines which downstream controls are required.

### Preview / dry-run

For actions that require preview, the backend inspects real system state and returns a structured preview result describing what will change, what will not change, and any warnings. Dry-run goes further by simulating execution without committing changes. Preview and dry-run results are captured as evidence.

### Confirmation / acknowledgment

For actions that require confirmation, the operator must explicitly acknowledge the action's scope and risk. The confirmation ceremony scales with risk tier:
- **Routine:** no explicit confirmation beyond the action trigger.
- **Elevated:** standard confirmation dialog with scope summary.
- **Destructive:** enhanced confirmation with explicit risk warning and typed acknowledgment.
- **Tenant-sensitive:** enhanced confirmation with scope warning, impact summary, and typed acknowledgment.

### Execution

The backend executes the action only after all required upstream controls are satisfied. Execution produces durable evidence regardless of outcome.

### Post-run validation

For actions that require post-run validation, the backend checks whether the execution produced the intended result. Validation findings are captured as evidence.

### Recovery guidance

For actions that require recovery guidance, the backend generates context-aware remediation steps if execution fails or produces unexpected results. Recovery guidance is displayed to the operator and captured as evidence.

---

## 4. What "safe enough for single-admin execution" means

An action is safe enough for single-admin execution when all of the following are true:

1. **The action's risk tier is explicit.** The operator and the system both know the risk classification before execution begins.

2. **Required safety controls are enforced by the backend.** The backend rejects execution requests that skip required controls for the action's risk tier.

3. **The operator has seen the impact.** For elevated, destructive, and tenant-sensitive actions, the operator has reviewed a backend-generated preview or impact summary before confirming.

4. **The confirmation ceremony matches the risk.** Routine actions proceed without ceremony. Destructive and tenant-sensitive actions require explicit acknowledgment.

5. **Execution produces durable evidence.** Every executed action writes an audit record. Higher-risk actions capture additional evidence (input snapshot, preview result, confirmation record, execution result, validation summary).

6. **Post-run state is validated.** For actions that modify system state, post-run validation confirms the intended outcome. Discrepancies are surfaced to the operator.

7. **Recovery guidance is available.** If the action fails or produces unexpected results, the operator receives actionable recovery steps — not just an error message.

8. **The evidence trail is reviewable.** A future reviewer can reconstruct what was previewed, what was confirmed, what was executed, and what was validated — from durable evidence alone.

---

## 5. Scope of the safety baseline

### Applies to

All admin actions across all current and future admin domains:
- Provisioning rollout
- Hybrid identity administration
- White-glove device deployment
- SharePoint control
- App binding management
- Standards and configuration governance
- Health and observability actions
- Setup and install actions

### Does not apply to

- Read-only queries (list, get, search) that do not modify system state.
- Frontend-only UI interactions (navigation, filtering, sorting, expanding details).
- Background polling or monitoring (alert checks, probe scheduling).

### Does not replace

- Authentication and authorization middleware — Phase 11 safety controls compose with existing `withAuth()`, `requireAdmin()`, and `requireDelegatedScope()` rather than replacing them.
- The provisioning saga's internal retry/compensation mechanics — Phase 11 wraps the saga entry point with safety controls but does not change the saga's internal execution model.
- Phase 12 admin-intelligence completion — Phase 11 does not backfill in-memory alert/probe stores or complete the error log surface.

---

## 6. Governing cross-references

| Document | Role |
|----------|------|
| [Phase 11 repo-truth and dependency audit](./phase-11-repo-truth-and-dependency-audit.md) | Confirmed repo state and dependency gaps |
| [Phase 11 risk-tier and action classification](./phase-11-risk-tier-and-action-classification.md) | Risk tier definitions and per-tier safety requirements |
| [Phase 11 summary plan](./Admin-SPFx-IT-Control-Center-Phase-11-Summary-Plan.md) | Phase scope, objectives, and acceptance criteria |
| [End-state plan](../admin-spfx-it-control-center-end-state-plan.md) | Phase 11 definition and exit criteria |
| [Target architecture](../admin-spfx-target-architecture.md) | Layer boundaries and execution model |
