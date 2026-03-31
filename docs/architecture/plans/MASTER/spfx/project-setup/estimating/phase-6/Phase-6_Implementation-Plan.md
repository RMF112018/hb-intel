# Phase 6 Implementation Plan — Deferred Work Closure Order

## Objective

Close the deferred implementations identified in the updated Project Setup Phase 1–5 review report by executing the remaining work in the correct dependency order.

## Guiding principle

The correct order is not “phase order.” It is **dependency order**.

Several deferred items are cross-phase dependencies:
- persistence truth affects release truth
- auth/runtime environment proof affects release truth
- deployment-target proof affects infrastructure truth and release signoff
- observability operationalization affects Phase 5 decision credibility

Because of that, Phase 6 is sequenced around blockers first, then hardening, then release evidence, then documentation closure.

## Deferred-work groups

### Group A — Foundational blockers
These must be addressed first because they directly gate production-readiness:
1. production persistence contract closure
2. required-field enforcement
3. retained-surface frontend regression baseline
4. production auth/runtime/environment proof
5. deployment-scoped CORS / managed identity / downstream permission proof
6. smoke execution / live deployment evidence / real signoff proof

### Group B — Supporting hardening work
These reduce residual technical and operational ambiguity:
1. backward compatibility and legacy-row posture
2. test-suite truthfulness for real adapter coverage
3. deprecated token path removal
4. cross-surface auth / RBAC convergence
5. proxy implement-or-remove decision
6. observability operationalization
7. notification transport / email delivery hardening
8. dedicated-host cutover / monolithic retirement proof
9. complexity preferences backend contract closure

### Group C — Final reconciliation
1. release-gate and signoff realism
2. review report and phase-doc reconciliation
3. final deferred-inventory closure

## Ordered implementation sequence

### Step 1 — Prompt-01
Close the real persistence/validation contract first.
Why first:
- Until the production persistence path matches the live wizard shape, no release-hardening claim can be trusted.
- Required-field enforcement must align with the real persisted contract, not the old one.

### Step 2 — Prompt-02
Then close backward compatibility and test truthfulness.
Why second:
- Once the contract is defined, the code agent can safely decide migration posture, legacy-row handling, and what tests actually prove.
- This prevents false greens and avoids carrying misleading contract tests into later release evidence.

### Step 3 — Prompt-03
Then close auth convergence and backend preference/proxy debt.
Why third:
- Release readiness depends on a single canonical auth model.
- Deprecated token helpers, split RBAC posture, missing preferences contract, and proxy ambiguity weaken later release evidence.

### Step 4 — Prompt-04
Then prove deployment/runtime boundary truth.
Why fourth:
- After code-level auth and host posture are converged, the agent can truthfully wire or document the dedicated-host deployment target, runtime prerequisites, CORS, managed identity, and downstream grants.
- This closes the gap between repo architecture and actual deployment claims.

### Step 5 — Prompt-05
Then operationalize the remaining infrastructure hardening.
Why fifth:
- Observability and notification transport are important, but they should sit on top of a truthful host/runtime model.
- This step also closes the remaining “provisioning maturity” follow-on debt.

### Step 6 — Prompt-06
Then fix the retained-surface frontend regression baseline.
Why sixth:
- The frontend retained-surface tests should be repaired against the now-correct persistence/auth/runtime contract.
- Doing this earlier risks fixing tests against moving behavior.

### Step 7 — Prompt-07
Then execute smoke/release evidence and tighten signoff posture.
Why seventh:
- Only after the code, tests, and runtime posture are stable can smoke evidence, release gates, and signoff artifacts be made truthful.
- This step must separate repo proof from environment-gated execution and real operational approval.

### Step 8 — Prompt-08
Finish with full documentation reconciliation.
Why last:
- This is the closure prompt.
- It must reflect the repo truth after all implementation prompts have run.

## Mapping deferred items to prompts

### Prompt-01
- Phase 2 canonical persisted field coverage
- required-field enforcement
- clarificationItems storage decision
- persistence blocker closure

### Prompt-02
- Phase 2 backward compatibility / migration posture
- test-suite truthfulness for real adapter coverage
- mock-vs-real contract proof cleanup

### Prompt-03
- complexity preferences backend contract
- deprecated session-token helper removal
- cross-surface auth convergence
- RBAC convergence / narrowing
- proxy implement-or-remove decision

### Prompt-04
- dedicated host cutover / deployment-target proof
- production auth deployment prerequisites
- deployment-scoped CORS / managed identity / downstream-permission proof

### Prompt-05
- observability operationalization
- email delivery / notification transport
- residual provisioning-maturity follow-on work

### Prompt-06
- retained-surface frontend regression baseline
- truthful retained frontend proof set

### Prompt-07
- smoke/deployment evidence execution proof
- release-gate realism
- final signoff completion and decision proof

### Prompt-08
- final review-doc reconciliation
- phase-doc closure truth
- final deferred-inventory closure status

## Completion standard

A deferred item can be called closed only when:
- repo implementation supports the intended behavior
- tests prove the supported behavior where testable
- docs no longer overstate or understate the item
- environment-gated/manual items are explicitly categorized if they cannot be repo-proven

## Deliverables expected from the code agent

For each prompt:
- implementation summary
- exact files changed
- tests run
- unresolved caveats
- update to the main review doc with:
  - progress notes
  - closure status
  - evidence
  - remaining limitations, if any
