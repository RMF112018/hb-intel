# README — Admin SPFx IT Control Center Phase 6 Prompt Package

## What this package is

This package is a **local-code-agent implementation package** for:

**Phase 6 — In-app backend install and bootstrap**

It follows the same packaging pattern you used for the Phase 1 package, but the content is re-targeted to the specific install/bootstrap responsibilities defined in the end-state plan.

## What is included

1. `Admin-SPFx-IT-Control-Center-Phase-6-Summary-Plan.md`
2. `README.md`
3. `Prompt-01-Phase-6-Prerequisite-Audit-and-Compatibility-Plan.md`
4. `Prompt-02-Phase-6-Install-Bootstrap-Architecture-and-Step-Model.md`
5. `Prompt-03-Shared-Contracts-and-Persistence-Slice.md`
6. `Prompt-04-Backend-Preflight-Validation-Engine.md`
7. `Prompt-05-Backend-Install-Bootstrap-Orchestration.md`
8. `Prompt-06-Checkpoint-Resume-and-Manual-Action-Flow.md`
9. `Prompt-07-Post-Install-Verification-and-Health-Checks.md`
10. `Prompt-08-SPFx-Setup-Wizard-and-Preflight-UX.md`
11. `Prompt-09-SPFx-Run-Tracking-Checkpoint-and-Verification-UX.md`
12. `Prompt-10-Docs-Runbooks-Validation-and-Final-Reconciliation.md`

## Intended execution order

Run the prompt files in numeric order.

Do not skip ahead unless a prompt explicitly tells the agent to stop and record a blocker.

## How the code agent should use these prompts

- Treat live repo truth as authoritative.
- Use the end-state plan as the governing destination.
- Distinguish clearly between:
  - confirmed repo fact
  - confirmed end-state-plan fact
  - Microsoft-documented best practice
  - inferred implementation recommendation
  - unresolved decision or blocker
- Read only the smallest authoritative file set needed for each prompt.
- Do **not** re-read files that are still within active context or memory unless:
  - the file changed,
  - the prompt explicitly requires a fresh check,
  - the context became stale,
  - or the scope widened.

## Critical assumptions

This package assumes:
- Phase 6 is being implemented against the **current live repo**, not an idealized fully complete Phase 1–5 substrate.
- The code agent must therefore verify whether prerequisite phase artifacts exist and, if they do not, introduce only the **minimum compatibility scaffolding** required to make Phase 6 implementable without accidentally redoing all earlier phases.
- Existing provisioning/backend patterns are meant to be generalized and reused, not replaced.
- SPFx remains the operator console, not the privileged executor.

## Execution cautions

- Do not push privileged Graph or SharePoint execution into browser code.
- Do not treat UI pages as equivalent to durable run support.
- Do not convert `@hbc/features-admin` into the privileged control plane.
- Do not over-generalize this phase into a full platform rewrite.
- Do not silently automate approvals that are not safely automatable.
- Do not leave manual steps implicit — they must surface as modeled checkpoints with instructions and traceability.

## Expected repo outputs

The agent should expect to create or update:

### Documentation
- `docs/architecture/plans/MASTER/spfx/admin/phase-6/**`
- related README / runbook docs in `apps/admin` and `backend/functions` as needed

### Frontend
- Admin routes, pages, workflow components, and API client integration in `apps/admin/**`

### Backend
- Install/preflight/verification run support in `backend/functions/**`

### Shared contracts
- The smallest correct shared contract surface needed for install/preflight/verification runs

## Validation posture

Use the smallest meaningful repo-truth validation set.

Default expectation:
- inspect the touched package/app manifests and available scripts,
- run targeted validation for only the touched surfaces,
- prefer package-scoped build/typecheck/test over broad workspace commands unless the change forces broader validation.

## Completion standard

The package is complete when:
- the install/bootstrap lane works through the control plane,
- the Admin app can launch and monitor install runs,
- unavoidable manual approvals are explicit checkpoint states,
- post-install verification exists,
- docs and runbooks explain the operator workflow,
- and the implementation remains architecture-safe.

## Canonical Phase 6 artifacts

### Baseline docs

| Document | Prompt | Purpose |
|----------|--------|---------|
| [Prerequisite Audit](admin-spfx-phase-6-prerequisite-audit.md) | P6-01 | Repo-truth audit, existing substrate inventory, blockers, compatibility strategy, execution sequence |
| [Install/Bootstrap Architecture](admin-spfx-install-bootstrap-architecture.md) | P6-02 | Layer responsibilities, adapter roles, preflight/install/verification separation, boundary rules |
| [Install/Bootstrap Step Model](admin-spfx-install-bootstrap-step-model.md) | P6-02 | 6 step families, concrete steps, inputs/outputs, blocking behavior, automation classification |
| [Manual Checkpoint Policy](admin-spfx-install-manual-checkpoint-policy.md) | P6-02 | Checkpoint qualification, run-state representation, resume/reject/cancel, evidence/audit, anti-patterns |

### Implementation notes (created by later prompts)

_To be populated by Prompts 03–09._

### Exit reconciliation (created by P6-10)

_To be populated by Prompt 10._
