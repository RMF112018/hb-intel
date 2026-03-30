# Phase 3 — Auth Action Plan

## Objective

Bring the Estimating / Project Setup package onto a **production-safe auth model** by making production mode real, establishing a deliberate SPFx-to-API token acquisition path, aligning backend token validation to the chosen Entra token contract, and separating delegated-user behavior from app-only / managed-identity behavior.

This phase is not intended to solve every remaining production-readiness gap. It is intended to make the auth and identity model trustworthy, explicit, and stable so later phases can build on a correct security foundation.

## In scope

- `ui-review` vs `production` mode auth/runtime contract
- SPFx production-mode token acquisition design and implementation
- API app / audience / token-version contract definition
- Backend token validation redesign
- Route-level auth enforcement review for Project Setup backend handlers
- Delegated-user vs app-only / managed-identity boundary cleanup
- Auth-related CORS and permission requirements
- Contract / regression / release-readiness tests for auth
- Documentation of the Phase 3 auth contract

## Out of scope unless strictly required to enable Phase 3

- Broad SharePoint list-schema redesign beyond what Phase 2 already established
- General infrastructure cost/performance tuning
- Broad provisioning workflow redesign beyond auth boundaries
- Non-auth UX polish unrelated to mode gating or auth diagnostics
- Unrelated module/platform auth redesign outside Project Setup deployment scope

## Known starting facts for Phase 3

- The package is intended to support both `ui-review` and `production` modes, but the current deployable artifact still behaves as a `ui-review`-first build.
- The latent production path currently relies on an opaque token expectation rather than a clearly documented SPFx-to-API auth contract.
- The backend token validator currently assumes a narrow issuer/audience pattern that is not a safe long-term production posture.
- The current repo contains managed-identity behavior presented through an OBO seam that must be clarified or corrected.
- Phase 1 scope control and Phase 2 data contract work should reduce noise around this auth effort.

## Phase 3 success criteria

Phase 3 is complete only when all of the following are true:

1. The package has an intentional, documented, and testable `production` mode.
2. The Project Setup frontend acquires API access in a deliberate supported way rather than relying on opaque shell token injection.
3. The backend explicitly validates tokens against the chosen API contract and token-version posture.
4. Delegated-user flows and app-only / managed-identity flows are clearly separated, named, and enforced.
5. Every retained Project Setup backend route has an explicit auth posture and test coverage.
6. CORS and permission requirements are documented and aligned to the Project Setup deployment.
7. Release-readiness checks exist for auth success paths and auth failure paths.

## Workstream A — Repo truth and auth baseline

### Tasks
- Inventory every frontend auth/runtime assumption in the isolated Project Setup package.
- Inventory every backend route auth expectation in the active Project Setup surface.
- Inventory current mode gating behavior for `ui-review` and `production`.
- Inventory current token sources, route-level protection, validator behavior, and service initialization assumptions.
- Produce a baseline auth matrix covering:
  - route
  - caller
  - mode
  - token source
  - delegated vs app-only
  - validator path
  - unresolved issues

### Deliverables
- Auth baseline matrix
- Current-mode behavior summary
- Route protection inventory

### Acceptance criteria
- There is one authoritative baseline before redesign work begins.
- Every retained Project Setup route and auth touchpoint is accounted for.

## Workstream B — Production-mode activation and SPFx token acquisition

### Tasks
- Define the exact activation contract for `production` mode.
- Remove any dependence on implicit or opaque token injection as the primary production pattern.
- Implement the chosen SPFx API auth path for the Project Setup API.
- Define and validate required runtime config for each mode.
- Ensure `ui-review` remains usable without implying live auth capability.

### Deliverables
- Production-mode runtime contract
- Frontend auth/bootstrap implementation changes
- Mode gating notes and diagnostics

### Acceptance criteria
- Production mode can be intentionally activated only when required auth/runtime prerequisites are present.
- Frontend auth behavior is explicit and documented.

## Workstream C — API token contract and validator redesign

### Tasks
- Determine the Project Setup API token-version contract.
- Define required claims, issuer/audience expectations, tenant rules, and metadata source.
- Redesign token validation to support the chosen contract safely.
- Remove unsafe narrow issuer/audience assumptions.
- Add tests for valid token, invalid token, wrong audience, wrong tenant, expired token, and missing-claim cases.

### Deliverables
- API token contract markdown
- Updated validator implementation
- Auth failure-path tests

### Acceptance criteria
- The validator behavior matches the documented API contract.
- Token validation failures are explicit, safe, and diagnosable.

## Workstream D — Delegated vs app-only boundaries and managed identity cleanup

### Tasks
- Classify every retained backend capability as delegated-user or app-only.
- Correct or rename any misleading OBO abstractions.
- Ensure managed identity is used only where app-only behavior is intentionally required.
- Document permission boundaries for SharePoint / Graph / backend operations.
- Remove or block any silent crossing between user-delegated and app-only semantics.

### Deliverables
- Capability-boundary matrix
- Updated service abstractions / naming
- Permission-boundary documentation

### Acceptance criteria
- Engineers can tell exactly which operations run as the user and which run as the app.
- The code no longer implies delegated behavior where only app-only behavior exists.

## Workstream E — Backend auth hardening, CORS, permissions, and tests

### Tasks
- Review each retained Project Setup backend route for correct auth enforcement.
- Lock down CORS posture for the real browser origins required by this deployment.
- Document the required API app registration / permission approval / service-identity prerequisites.
- Add regression tests and release checks for:
  - production mode activation
  - route auth success/failure
  - validator failure paths
  - CORS misconfiguration detection where testable
  - missing runtime config
- Add operational diagnostics for auth-related failures.

### Deliverables
- Route auth matrix
- CORS / permission notes
- Regression tests
- Release-readiness checklist additions

### Acceptance criteria
- Auth is enforced consistently across the retained backend surface.
- Required auth prerequisites are obvious and testable.

## Recommended execution sequence

1. Prompt 01 — Repo truth and auth surface baseline
2. Prompt 02 — Production mode and SPFx token acquisition
3. Prompt 03 — API token version and validator redesign
4. Prompt 04 — Delegated vs app-only boundaries and managed identity cleanup
5. Prompt 05 — Backend auth hardening, CORS, permissions, and tests
6. Prompt 06 — Final verification and handoff

## Non-negotiable constraints

- Do not re-read files already in current context or memory unless needed to verify a contradiction or retrieve exact evidence.
- Do not let this phase drift into unrelated provisioning or non-auth UX work.
- Do not preserve opaque token injection as the primary production auth contract.
- Do not leave validator behavior narrower than the documented API token contract.
- Do not blur delegated-user semantics and app-only semantics in code or docs.
- Do not ship silent or ambiguous auth fallback behavior in production mode.

## Phase 3 exit artifacts

At the end of Phase 3, the repo should contain:

- authoritative Project Setup auth contract documentation
- explicit `ui-review` and `production` mode contract notes
- corrected SPFx auth/bootstrap behavior for production mode
- updated token validator and auth enforcement tests
- delegated vs app-only capability documentation and cleaned abstractions
- auth-related CORS / permission / release-readiness notes
- final verification notes and known follow-on items for later phases
