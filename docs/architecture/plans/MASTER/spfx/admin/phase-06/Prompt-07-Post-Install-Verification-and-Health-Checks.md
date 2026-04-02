# Prompt-07 — Post-Install Verification and Health Checks

## Objective

Implement the Phase 6 post-install verification flow so the operator can confirm that the environment is actually usable after bootstrap, not merely that the install run stopped.

## Important execution rules

- Keep verification execution in the backend.
- Reuse existing probes or health logic where appropriate, but do not turn `@hbc/features-admin` into the privileged control plane.
- Verification results must be structured and reviewable.

## Inputs

Use:
- shared contracts
- install/bootstrap orchestration
- existing admin-intelligence probes only where reuse is clearly appropriate
- existing backend services and validation logic

## Required work

### A. Implement verification run support
Support:
- launching post-install verification
- collecting verification findings
- durable result capture
- final pass/warn/fail conclusion

### B. Verification categories
Cover at least:
- backend reachability / expected endpoints
- persistence readiness
- SharePoint posture needed for HB Intel control-center operation
- rollout-critical Graph/permission posture needed after install
- any config/version/readiness assumptions needed for normal operator use

### C. Clarify relationship to preflight
Preflight answers “can we start?”
Verification answers “did the environment become operational?”

Keep those concepts separate in both code and docs.

### D. Documentation output
Create:
- `docs/architecture/plans/MASTER/spfx/admin/phase-6/admin-spfx-post-install-verification.md`

Explain:
- verification purpose
- result categories
- pass/warn/fail semantics
- relationship to preflight and install execution
- what findings should trigger retry, repair, or escalation later

## Required boundaries

- Do not hide verification under generic health dashboards.
- Do not couple verification to transient browser state.
- Do not mark install as complete simply because a run reached its last automated step if verification still fails.

## Validation

Add focused tests for verification logic and any backend API support.
Run the smallest targeted validation set and record it in the docs or final reconciliation prompt.

## Completion condition

Stop after post-install verification support exists, is documented, and is validated.
Do not build SPFx pages in this prompt.
