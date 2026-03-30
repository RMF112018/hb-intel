# Phase 1 — Scope Control Action Plan

## Objective

Bring the Estimating / Project Setup SPFx package to a **clean, isolated Project Setup scope** so the frontend deployment artifact, backend startup surface, and callable API contract all match the real deployment posture.

This phase is not intended to solve every production-readiness gap. It is intended to remove ambiguity, remove unsupported scope, and create a stable base for later phases.

## In scope

- Frontend route-tree isolation
- Shell pruning
- Removal of out-of-scope navigation and UI residue
- Removal or disablement of orphaned API calls
- Backend scope alignment for the isolated package
- Documentation and freezing of the allowed API/runtime contract
- Acceptance checks and regression protection for scope control

## Out of scope unless strictly required to enable Phase 1

- Full SharePoint list-field remapping
- Entra token-version redesign
- Full auth-model redesign
- Broader Azure infrastructure hardening
- Full provisioning maturity work
- Long-tail UX polish unrelated to scope isolation

## Known starting facts for Phase 1

- The current package is intended to support both `ui-review` and `production` modes, but the current deployable artifact still behaves as a `ui-review`-first build.
- The package should be a **strictly isolated Project Setup package**.
- The package still contains leftover expectations beyond Project Setup, including user/group/preferences and other shell residue.
- The active backend route surface does not support every frontend expectation currently present in the bundle.
- The active backend posture is broader than the intended Project Setup deployment scope.

## Phase 1 success criteria

Phase 1 is complete only when all of the following are true:

1. The frontend route tree and visible shell surface are limited to Project Setup.
2. The deployed package no longer carries unsupported navigation, calls, or feature seams for out-of-scope capabilities.
3. The backend callable surface required by the package is explicit and intentionally scoped.
4. Unsupported frontend expectations are either removed or deliberately supported.
5. Runtime config assumptions are documented and enforced.
6. A contract document exists for the allowed API surface.
7. Regression tests or acceptance guards exist for removed scope.

## Workstream A — Repo truth and scope inventory

### Tasks
- Inventory the currently reachable frontend routes.
- Inventory all network/API calls still present in the isolated bundle path.
- Inventory active backend handlers and route registrations.
- Map every frontend expectation to one of:
  - supported and in-scope
  - unsupported and removable
  - unsupported but required
  - unresolved

### Deliverables
- Scope matrix
- Route inventory
- API expectation inventory
- Backend surface inventory

### Acceptance criteria
- There is one authoritative matrix showing what stays, what goes, and what remains unresolved.
- No scope-cutting work starts before this matrix exists.

## Workstream B — Frontend isolation

### Tasks
- Remove all non-Project-Setup routes.
- Remove non-Project-Setup shell affordances, tool pickers, and navigation.
- Remove or disable UI components that require out-of-scope APIs.
- Ensure `ui-review` mode remains usable for review, but does not imply broader scope than Project Setup.

### Deliverables
- Updated route tree
- Updated shell composition
- Updated package-visible surface

### Acceptance criteria
- The package exposes only Project Setup user journeys.
- No visible UI path leads into out-of-scope features.
- The bundle no longer attempts unsupported background calls for removed features.

## Workstream C — Backend scope alignment

### Tasks
- Identify which registered backend handlers are required for isolated Project Setup.
- Disable, gate, or clearly separate unrelated startup requirements.
- Remove or neutralize orphaned API expectations from the frontend.
- Decide whether specific routes remain for this package:
  - project requests
  - provisioning status
  - provisioning retry/escalation
  - signalR negotiate
  - preferences
  - groups
  - notifications

### Deliverables
- Allowed backend surface list
- Startup-scope notes
- Removed/gated backend dependencies list

### Acceptance criteria
- The isolated package has a clear backend surface with no accidental dependencies.
- Unsupported frontend calls are gone.
- The backend does not present unrelated boot blockers for this deployment posture.

## Workstream D — Contract freeze

### Tasks
- Write a single contract doc for the allowed routes.
- Define request bodies, query params, responses, and errors.
- Define runtime config requirements for each mode.
- Define what `ui-review` is allowed to do and what it must never do.
- Define what production mode requires before activation.

### Deliverables
- Contract markdown
- Runtime mode contract
- Developer notes for future phases

### Acceptance criteria
- Engineers can answer “is this allowed in Project Setup scope?” from one document.
- The frontend and backend types and runtime assumptions are consistent with the contract.

## Workstream E — Acceptance guards

### Tasks
- Add tests or guardrails proving non-Project-Setup routes are absent.
- Add tests or static checks proving orphaned API calls are absent.
- Add tests proving backend scope assumptions match the isolated package.
- Add a release checklist for Phase 1 completion.

### Deliverables
- Regression tests / assertions
- Release checklist
- Final verification report

### Acceptance criteria
- A future merge cannot silently reintroduce removed scope without failing validation.

## Recommended execution sequence

1. Prompt 01 — Repo truth and scope inventory
2. Prompt 02 — Frontend isolation
3. Prompt 03 — Backend scope alignment and orphaned-call removal
4. Prompt 04 — Contract freeze
5. Prompt 05 — Acceptance guards and regression tests
6. Prompt 06 — Final verification and handoff

## Non-negotiable constraints

- Do not re-read files already in current context or memory unless needed to verify a contradiction or retrieve exact evidence.
- Do not expand scope during this phase.
- Do not preserve leftover shell or route behavior “for later” if it still ships in the package.
- Do not rely on undocumented runtime behavior.
- Do not leave unsupported API calls in the bundle simply because they fail softly.

## Phase 1 exit artifacts

At the end of Phase 1, the repo should contain:

- isolated Project Setup frontend surface
- scoped backend surface notes or implementation changes
- a frozen frontend ↔ backend contract document
- regression guards
- final verification notes
