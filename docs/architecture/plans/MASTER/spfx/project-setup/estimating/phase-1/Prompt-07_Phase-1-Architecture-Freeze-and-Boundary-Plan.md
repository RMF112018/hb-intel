# Prompt-07-01 — Phase 1 Architecture Freeze and Boundary Plan

## Context
You are working inside the live `hb-intel` monorepo.

The current repo truth and audit report show that Phase 1 is only partially complete because the Project Setup / Estimating requester surface is narrowed, but the backend host still registers many unrelated domains. The target architecture for this work is **shared backend services with unique Azure Function Apps per domain boundary**, not one giant permanent shared Function App and not duplicated backend codebases. The current broad host should be treated as **transitional**.

Relevant review file to keep current as you work:
- `docs/architecture/reviews/project-setup-phase-1-through-5-implementation-and-gap-report.md`

Critical standing instruction:
- **Do not re-read files that are already in your active context or memory unless needed to verify a contradiction, inspect a dependency you have not yet loaded, or retrieve exact evidence for docs/tests.**

## Objective
Freeze the intended backend boundary for Project Setup / Estimating in repo truth and convert the current vague/shared-host posture into an explicit implementation plan that supports a **dedicated Project Setup Function App host** backed by **shared monorepo backend libraries**.

This prompt is not the full extraction itself. This prompt should:
1. confirm the boundary model in repo truth,
2. define the thin-host composition-root target,
3. identify exactly what code remains shared vs host-specific,
4. produce the implementation plan and acceptance criteria that the later prompts will execute.

## Non-Negotiable Architecture Direction
Treat the following as the intended architecture unless repo truth reveals a compelling technical blocker:

### Shared across domains
- contracts and models
- shared middleware
- shared auth helpers
- shared config validation patterns
- shared telemetry / observability helpers
- shared SharePoint / Graph / managed identity adapters where appropriate
- shared provisioning / lifecycle primitives where appropriate
- shared repo patterns, tests, and deployment conventions

### Separated by domain host
- Azure Function App host per domain
- route registration per domain
- domain-specific app settings
- domain-specific managed identity / downstream permissions
- domain-specific CORS posture
- domain-specific release gates and smoke tests
- domain-specific deployment runbooks and rollback posture

### Immediate implication
Project Setup / Estimating must become its **own backend host / Function App composition root**. The current broad multi-domain host posture is transitional only.

## Scope
Focus only on the Phase 1 audit findings tied to backend scope and truthful architecture documentation. Do **not** expand into unrelated Phase 2–5 remediation except where needed to define the Project Setup host boundary and its acceptance criteria.

## Required Repo-Truth Inputs
Use repo truth from the current implementation, including at minimum:
- current backend entry/composition root(s)
- route registration files
- service factory / dependency container patterns
- any existing multi-host or per-domain deployment conventions
- current docs under `docs/architecture/blueprint/` and relevant project-setup phase docs

## Work Required

### 1) Confirm the boundary model in repo truth
- Inspect the current backend composition pattern.
- Determine whether there is already a per-domain host convention, partial host split, or reusable composition-root pattern that Project Setup should adopt.
- Identify the exact place where the current broad host violates the intended Project Setup boundary.

### 2) Define the Project Setup host target
Produce a concrete implementation design for a **thin Project Setup host** that:
- registers only the Project Setup / provisioning routes genuinely needed for the Project Setup release scope,
- imports only the shared services and domain handlers actually needed,
- keeps shared logic centralized,
- does not duplicate shared adapters, models, or middleware,
- allows domain-specific auth, config, CORS, downstream grants, observability, and smoke validation.

### 3) Produce the extraction / freeze plan
Create or update repo docs so repo truth explicitly states:
- current state,
- target state,
- what remains shared,
- what must move to the Project Setup host,
- what should remain outside Project Setup scope,
- what transitional compatibility is temporarily allowed,
- what must be proven before Phase 1 can honestly be marked closed.

### 4) Define acceptance criteria
Acceptance criteria must be explicit and testable. At minimum include:
- Project Setup host registers only in-scope routes.
- Unrelated domains are not carried by the Project Setup host.
- Shared services remain centralized and are consumed through imports/adapters rather than duplicated.
- Domain-specific config validation is scoped only to Project Setup requirements.
- Domain-specific auth/CORS/MI assumptions are documented.
- Phase 1 docs no longer overstate completion.

## Required Documentation Updates
Update the following as part of this prompt:

### A) `docs/architecture/reviews/project-setup-phase-1-through-5-implementation-and-gap-report.md`
Update the report with a **Phase 1 remediation progress note** that includes:
- what repo-truth review was performed,
- what boundary decision was made,
- what implementation path was selected,
- what still remains open,
- a short closure target statement for Phase 1.

Also update the following sections where appropriate:
- `Phase 1`
- `Cross-Phase Findings`
- `Gap Analysis`
- `Prioritized Remediation List`
- `Final Status Assessment`
- `Evidence Appendix`

The report update must include:
- **Progress Notes**
- **Closure Criteria**
- **Evidence** (specific file paths)

### B) Add or update architecture docs
Create or update the most appropriate architecture/design doc(s) to capture:
- Project Setup host boundary
- shared-service vs host-specific split
- transitional migration posture from broad host to dedicated host
- acceptance criteria for the Phase 1 backend scope freeze

Do not create throwaway docs. Add durable repo-truth docs.

## Constraints
- Do not duplicate backend code into a new standalone codebase.
- Do not leave the architecture ambiguous.
- Do not mark Phase 1 closed in this prompt unless the repo changes already fully satisfy the closure criteria.
- Preserve current requester routes and current `ui-review` behavior.
- Prefer thin composition roots and reusable shared packages.

## Deliverables
1. Architecture/boundary plan committed in repo truth.
2. Updated review report with progress notes, closure criteria, and evidence.
3. Clear implementation checklist for the next prompt.

## Validation
At the end of the work, provide a concise implementation summary in your final response and list:
- files changed,
- boundary decisions made,
- remaining blockers,
- exact next step for Prompt-07-02.
