# Prompt-02 — Phase 2 Backend State Transition And Launch Contract Remediation

## Objective

Implement the canonical backend lifecycle and provisioning-launch contract for Project Setup so the backend no longer contains ambiguous or contradictory trigger behavior.

## Preconditions

- Prompt-01 is complete
- the Phase 2 audit report exists
- the current trigger contradiction and stale-doc posture have been documented

## Working Rules

- Treat the backend as the authoritative workflow engine.
- Do not broaden into frontend redesign.
- Do not re-read files already in active context unless needed to verify a contradiction or capture exact evidence.
- Preserve clear boundary ownership:
  - Accounting = controller gate
  - Admin = recovery / override
  - backend = lifecycle authority
- Use current repo truth as the starting point for remediation, not as one equal option among many.

## Required Decision

Start from the repo-truth default:

- controller approval advances the request to `ReadyToProvision`
- the backend auto-starts the saga from that transition
- the saga reconciles the request to `Provisioning`

You may either:

### Contract Path A — Reconcile Around Current Repo Truth

- keep `ReadyToProvision` as the trigger-adjacent approval/handoff state
- keep `Provisioning` as the durable system-owned active-run state
- reconcile code comments, labels, transition semantics, and docs around that model

### Contract Path B — Deliberate Lifecycle Reversal

- move launch authority to a later `Provisioning` transition
- treat this as an intentional architecture change
- document the exact compatibility consequences for Accounting, provisioning status, state-machine logic, and docs

Do not present these two paths as equally ungrounded defaults. Path B is a deliberate change from current repo truth and must be justified as such.

## Required Implementation Tasks

1. Update the backend transition/launch logic to match the chosen contract.
2. Remove or eliminate contradictory launch paths.
3. Ensure the transition graph, authorization logic, orchestration entry point, and comments all agree.
4. Ensure request status returned by the API reflects the real contract.
5. Compare against current provisioning references, not only PH6.8 / PH6.11.
6. Update the Phase 2 review report with:
   - chosen contract
   - rationale
   - exact code paths changed
   - compatibility consequences
   - any historical docs now classified as stale or limited-scope

## Primary Files Likely In Scope

```text
backend/functions/src/functions/projectRequests/index.ts
backend/functions/src/state-machine.ts
packages/provisioning/src/state-machine.ts
packages/provisioning/src/api-client.ts
docs/reference/provisioning/state-machine.md
docs/reference/provisioning/saga-steps.md
docs/reference/spfx-surfaces/controller-review-surface.md
docs/architecture/reviews/project-setup-accounting-phase-2-backend-lifecycle-hardening-report.md
```

Treat these as historical comparison sources, not default authority:

```text
docs/architecture/plans/PH6.8-RequestLifecycle-StateEngine.md
docs/architecture/plans/PH6.11-Accounting-App.md
docs/architecture/plans/MVP/project-setup/MVP-Project-Setup-T03-Controller-Gate-and-Request-Orchestration.md
```

## Required Non-Negotiables

- There must be exactly one unambiguous provisioning launch event.
- Server-side behavior must not rely on UI assumptions.
- The final state model must still support:
  - clarification loop
  - external setup hold state
  - failure reopen path
  - admin recovery separation

## Verification

Run targeted validation:

```bash
pnpm --filter @hbc/functions check-types
pnpm --filter @hbc/functions test || true
pnpm --filter @hbc/provisioning check-types
pnpm --filter @hbc/provisioning test || true
```

Add or update tests covering:

- launch transition behavior
- invalid transition blocking
- authorization of lifecycle actions

## Acceptance Criteria

- provisioning launch semantics are unambiguous in code
- state-machine and launch implementation agree
- current provisioning references are updated enough that Prompt-03 can proceed safely
- the report clearly states the frozen lifecycle contract
