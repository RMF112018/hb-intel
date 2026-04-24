# 02 — Research-Backed Assessment

## 1. Azure Functions runtime posture

### What is strong

- The codebase is using the Azure Functions Node v4 programming model shape:
  - code-centric registration
  - `app.http(...)` / `app.timer(...)`
  - root `main` entrypoint
- `@azure/functions` is a runtime dependency and not merely a type dependency.
- The package targets a compiled `dist` output.

### What is insufficient

- The runtime/package posture is only as trustworthy as the deployment artifact.
- The deployment workflow does not yet prove that the Flex Consumption app is running the intended backend package rather than a broad repo-root package.

### Why it matters

Flex Consumption expects a ready-to-run package or an explicitly remote-built project package. Production readiness depends on packaging only what the app actually needs and being able to prove what was deployed.

### Correction direction

- move to a backend-package-scoped build artifact
- publish only the function app package
- capture artifact manifest / checksum / deployment evidence
- explicitly verify route registration from the artifact that was deployed

### Preserve vs redesign

- preserve the Node v4 coding model
- redesign the release packaging and deployment proof

## 2. Identity and token posture

### What is strong

- inbound JWT validation is well-structured
- token validation is lazy-loaded to avoid import-time process death
- role/scope separation is explicit
- app-only outbound Graph access uses managed-identity style credential flow

### What is insufficient

- production success still depends on environment, app registration, site grants, and deployment identity alignment
- the codebase still carries both Graph app-only and SharePoint token acquisition paths

### Why it matters

A backend can appear structurally correct while still failing in production because the identity used at runtime is not the one the code assumes, or because the app-only permission posture is incomplete for the targeted sites/lists.

### Correction direction

- make the runtime identity explicit and provable
- verify user-assigned MI selection in production
- reduce dual-surface auth assumptions
- make permission and grant diagnostics more specific than a generic 401

### Preserve vs redesign

- preserve managed identity direction
- refine diagnostics and tighten identity proof
- continue retiring mixed outbound auth surfaces

## 3. Graph data-plane posture

### What is strong

The current Safety Graph data plane already contains multiple production-grade patterns:

- typed retry on 429 / 5xx
- respect for bounded-query invariants
- Graph-only list item create/read/update flows
- Graph upload/download for workbook files
- optimistic concurrency through ETag + `If-Match`
- explicit telemetry on conflicts and retries

### What is insufficient

- Graph-only cutover is still lane-specific, not whole-service authoritative
- some remaining service seams still pull PnP/SharePoint into the same authority boundary
- the live blocker shows the operational cutover is not yet proven

### Why it matters

The backend cannot be declared production ready until the working data-plane model and the deployed runtime behavior are the same thing.

### Correction direction

- keep Graph as the target data plane
- remove remaining Safety data-plane dependence on PnP/SharePoint seams
- prove site/list binding and permissions at runtime
- fail with distinct diagnostics for:
  - permission denied
  - site not granted
  - list not found
  - wrong list id
  - wrong site id
  - artifact drift

### Preserve vs redesign

- preserve the Graph repository and data plane
- refine runtime proof and service isolation

## 4. Observability posture

### What is strong

- request IDs exist
- auth telemetry exists
- ingestion telemetry exists
- health/readiness body is structured
- retry and concurrency telemetry exists

### What is insufficient

- the public health route exposes too much operational detail
- deployment truth is not strongly evidenced
- logs/telemetry still need a cleaner production troubleshooting story for the cutover edge cases

### Why it matters

Production support depends on being able to answer:
- which identity ran the request
- which site/list IDs were used
- whether the route came from the expected artifact
- whether the failure was auth, permission, binding, data, or parser related

### Correction direction

- reduce public health disclosure
- add deployment/build/version evidence markers
- make list/site binding and permission failures explicit
- retain correlation IDs through preview/commit/replay

### Preserve vs redesign

- preserve existing telemetry structure
- refine health exposure and deployment observability

## 5. Deployment and release integrity

### What is strong

- there is an existing CI/CD workflow to publish the function app
- the app is already deployed to Flex Consumption

### What is insufficient

- root-scoped install/build/package flow is too loose for a monorepo backend
- artifact contents are broader than they should be
- the release path does not strongly prove that `backend/functions` was the package actually deployed

### Why it matters

This is the most plausible explanation for the mismatch between:
- repo truth saying the ingest path is Graph-first
- live evidence still behaving like an older or differently wired path

### Correction direction

- scope build to backend/functions
- package only runtime-required content
- verify artifact shape before deploy
- record artifact checksum and deployed checksum
- confirm post-deploy route registration and version marker

### Preserve vs redesign

- redesign deployment packaging and proof
- preserve the target Azure hosting model

## 6. Security posture

### What is strong

- JWT validation is not optional
- role and scope checks exist
- production config is fail-closed in major auth areas
- app-only and delegated distinctions are understood in code

### What is insufficient

- anonymous trigger level plus in-process auth means all protection depends on code path
- public health route leaks readiness and permission posture
- CORS posture should be tightened to exact production origins and owned at the correct layer
- broad staging permissions remain acceptable for stabilization but not for rollout

### Why it matters

Production-ready security is more than “requests are rejected.” It also requires:
- minimized public disclosure
- least privilege
- clear separation between staging convenience and rollout posture

### Correction direction

- keep staging broad Graph permissions only long enough to stabilize
- document exact production-required permissions
- remove unnecessary broad scopes before rollout
- tighten health disclosure and CORS

### Preserve vs redesign

- preserve current auth model concepts
- refine surface hardening and rollout posture

