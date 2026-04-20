# Claude Code Prompt Set — Estimating & Accounting SharePoint Provisioning Workflow Completion

## Recommended execution order

1. API contract and client normalization
2. Accounting approval project-number capture
3. Approval → provisioning saga handoff
4. Saga → request reconciliation
5. Step 6 SharePoint permissions implementation
6. Graph / tenant prerequisite validation
7. SharePoint artifact validation and hardening
8. Estimating surface stabilization
9. PWA surface stabilization
10. Accounting surface stabilization
11. Admin oversight backend parity
12. Live-state synchronization and integration tests
13. Documentation and readiness reconciliation

## Global rules

- Follow repo truth first:
  1. `docs/architecture/blueprint/current-state-map.md`
  2. target architecture / blueprint docs
  3. ADRs and locked doctrine
  4. phase plans / deliverable plans
  5. current implementation files
- Do not re-read files that are already in your active context or current memory unless needed to verify a contradiction or retrieve exact evidence.
- Do not invent endpoints, routes, state transitions, or payload shapes if the repo already defines them.
- Prefer surgical changes that preserve the current architecture instead of redesigning the system.
- After each prompt, provide:
  - files changed
  - what was implemented
  - what remains open
  - exact acceptance evidence
