# Prompt 04 — PnP Ops Remote Runner Fallback Implementation

## Objective

Implement the **good fallback** execution path for PnP Ops: a remote self-hosted non-Azure runner that uses the same contract as the local runner and can be targeted from the SPFx webpart when local installation is not available.

---

## Critical instruction

**Do not re-read files that are already in your active context or memory.**

Build on the contract and local-runner work already established.

---

## Required outcome

Make the runner contract deployment-agnostic so it supports:

- local runner on the workstation, and
- remote self-hosted runner on an internal non-Azure host

without changing the frontend contract.

---

## Required implementation direction

### 1. Shared contract
Ensure the remote fallback uses the **same** API contract as the local runner.

If needed, extract shared types/contracts into a shared package or shared module, but do not over-engineer it.

### 2. Remote-runner deployment profile
Add a remote-runner mode/profile that assumes:

- HTTPS endpoint on an internal trusted host
- same action/preflight/run/evidence/artifact endpoints
- no Azure dependency
- same artifact semantics

### 3. Authentication / safety posture
For the first practical implementation, choose a grounded safety model for the remote runner. Acceptable examples:

- API key / shared secret for controlled internal usage
- mTLS if repo constraints and host model make that realistic
- narrowly scoped internal auth gate

Do not leave the remote runner unauthenticated unless you have an extremely strong, documented reason and compensating controls.

### 4. Remote-runner config in the SPFx path
Ensure the webpart can be configured to target:

- local runner
- remote runner
- mock

with clear mode-specific messages.

### 5. Deployment documentation
Add concise documentation for the remote fallback covering:

- host assumptions
- runtime prerequisites
- PnP.PowerShell prerequisites
- TLS/certificate expectations
- auth expectations
- how the SPFx webpart points at the remote runner

---

## Important scoping rule

Do not turn this into a full enterprise distributed platform. The goal is a **credible fallback** using the same runner contract, not a massive platform buildout.

---

## Deliverables

1. Remote-runner-compatible contract implementation.
2. Remote execution mode/profile in the frontend config path.
3. Basic auth/safety posture for the remote runner.
4. Remote runner deployment/setup docs.
5. Completion report with:
   - changed files,
   - local vs remote differences,
   - auth model chosen,
   - remaining limitations.

---

## Acceptance criteria

- Frontend can target a remote non-Azure runner without code changes to the contract.
- Remote-runner mode is clearly supported in config and UX.
- Safety posture is explicit.
- Documentation exists for standing up the fallback host.
