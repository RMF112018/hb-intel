# Plan Summary — My Dashboard Live Auth, Personalization, and Adobe OAuth Remediation

## Objective
Remediate the code, runtime proof surfaces, and test/evidence gaps that allow My Dashboard to appear preview/mock/read-only in the hosted tenant page despite the existence of live backend and OAuth implementation seams.

## Remediation Strategy
### Phase 1 — Make the UI truthful
- Replace preview hero binding with envelope-derived state.
- Prevent hosted production acceptance from treating fixture-identical queue rows as valid live proof.

### Phase 2 — Make Adobe authorization reachable
- Prove the live no-grant state becomes `authorization-required`.
- Prove Connect Adobe Sign renders and starts the backend OAuth flow.

### Phase 3 — Make My Projects diagnosable and tenant-verifiable
- Expose non-sensitive actor/match diagnostics.
- Add schema readiness/evidence checks for canonical role fields.
- Distinguish zero-assignment from actor/source/runtime failure.

### Phase 4 — Make deployment truth auditable
- Lock package/runtime proof.
- Validate hosted network calls and Function App mode.
- Add closeout evidence requirements.

## Decision Constraints
- `readOnly: true` remains a contract marker; it is not an auth defect.
- OAuth backend design remains delegated-user and state-validated.
- My Projects may continue UPN-based assignment matching because the list contract is UPN-based, but the system must verify and explain that dependency.
- No broad redesign of unrelated My Dashboard/PCC architecture is in scope.

## Completion Definition
The work is complete only when:
- hosted hero state is envelope-derived,
- fixture queue content cannot masquerade as production live proof,
- no-grant Adobe state renders Connect Adobe Sign and successfully starts OAuth,
- My Projects actor/list alignment can be proven or explicitly diagnosed,
- package/runtime/network evidence differentiates live backend, backend-unavailable, and UI-review fixture modes,
- tests cover the cross-seam regressions that caused the current issue.
