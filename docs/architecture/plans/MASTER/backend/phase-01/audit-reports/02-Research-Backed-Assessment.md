# 02 — Research-Backed Assessment

## A. Azure Functions runtime and host composition

### Preserve
- The backend is already on the Azure Functions Node.js v4 programming model with `@azure/functions` 4.x, which is the current code-centric model and supports a flexible file structure.
- The scoped host composition pattern is valid and useful for bounded deployments.

### Insufficient
- Release integrity depends on understanding that the admin-control-plane host, not the monolithic entrypoint, is the active Safety registration boundary.
- There is not enough visible release evidence discipline proving which host composition was built and deployed for each release.

### Why it matters
The Functions Node.js guidance makes two relevant points:
- the v4 programming model is tied to the `@azure/functions` package version,
- and v3 and v4 programming models cannot be mixed in a single app; once a v4 function is registered, v3 `function.json` registrations are ignored.

That makes host-composition truth and build artifact truth operationally important, not optional.

### Direction
Preserve the host pattern, but add release-proof instrumentation and artifact validation that explicitly proves:
- which host composition root was built,
- which routes were registered from that host,
- and that the deployed artifact matches source intent.

## B. Managed identity and outbound access

### Preserve
- Using managed identity as the privileged outbound identity is the right long-term posture.
- The code already centralizes outbound token acquisition behind a service boundary.

### Insufficient
- The app still relies on multiple outbound API surfaces and auth behaviors.
- The data plane is not consistently on the same identity/integration model as the control plane.

### Why it matters
Microsoft’s managed identity guidance is explicit that managed identity is meant to let the app access Entra-protected resources without provisioning or rotating secrets. The repo still carries app-registration secrets in the uploaded artifact and still couples some behavior to distinct resource audiences and REST semantics. That is acceptable for staging history, but not as the desired end state.

### Direction
Keep managed identity as the privileged runtime identity. Reduce secrets and remove split resource-plane behavior by moving the SharePoint data plane to Graph where feasible.

## C. Graph feasibility for the Safety lane

### Preserve
- The existing descriptor topology and list/entity model are usable.
- The upload/library split between Safety site and HBCentral can remain.

### Insufficient
- The current repository is REST-only.
- There is no Graph-native repository abstraction for list items / fields / file upload.

### Why it matters
Microsoft Graph supports:
- SharePoint site addressing by path,
- list item listing, creation, and field updates,
- and file upload to drives for files up to 250 MB in a single call, with upload sessions for larger files.

That means the Safety lane is not blocked by Graph capability. It is blocked by implementation.

### Direction
Migrate the Safety repository to Graph-native operations:
- site resolution by path,
- list and list-item resolution by Graph IDs,
- `POST /sites/{{site-id}}/lists/{{list-id}}/items` for creates,
- `PATCH /sites/{{site-id}}/lists/{{list-id}}/items/{{item-id}}/fields` for updates,
- drive upload endpoints for workbook landing files.

## D. Permission posture

### Preserve
- The staging/test intent is reasonable: use the broad Graph permissions that already exist to unblock system stabilization.
- The uploaded app registration already shows broad Graph application permissions and SharePoint-related access in place.

### Insufficient
- The production target posture is not yet encoded in code/config guardrails.
- The repo does not yet distinguish clearly between “permissions that are convenient during cutover” and “permissions that are justified in steady state”.

### Why it matters
Microsoft Graph guidance is explicit about least-privilege selection, and the selected-permissions model now supports site, list, list-item, folder, and file granularity in delegated and application modes. That makes broad tenant-wide permissions hard to justify as a steady-state default when the Safety lane is scoped to known sites/lists.

### Direction
Use broad permissions only as a staging/test bridge. Pre-rollout, tighten toward:
- `Sites.Selected` plus assigned roles where site-level scope is enough, or
- selected list/list-item scopes where the final design truly benefits from narrower grants,
with explicit proof that the final workflow still works under the narrowed model.

## E. Throttling, retries, and idempotency

### Preserve
- The ingestion flow already has a run/audit concept and can therefore support idempotency and replay.
- The codebase already has patterns for structured failure classification in other lanes.

### Insufficient
- The Safety repository does not yet appear to implement Graph-aware backoff/retry behavior because it is not yet Graph-based.
- The current ingestion path does not present a first-class preview/validation-before-commit mode, which would reduce unnecessary writes and simplify retries.

### Why it matters
Microsoft Graph throttling guidance is explicit:
- honor `Retry-After`,
- reduce frequency of calls,
- and avoid immediate retries.

### Direction
When the Graph cutover is implemented, add:
- retry policy only for transient/429/5xx cases,
- `Retry-After` honoring,
- batch/minimized round-trips,
- and idempotency keys or checksum-based duplicate suppression around workbook commit.

## F. Observability

### Preserve
- The backend already emits structured logs and Application Insights-compatible custom events.
- Request correlation and route lifecycle telemetry are already present.

### Insufficient
- The Safety lane still lacks stronger operational span coverage around repository calls, commit stages, and parse-contract diagnostics.
- The app is not yet taking advantage of the newer OpenTelemetry path for Functions if that is desired for long-term observability standardization.

### Why it matters
Azure Functions still integrates with Application Insights by default, and Microsoft now documents an OpenTelemetry path for Functions (`telemetryMode: "OpenTelemetry"` in `host.json`) when a team wants broader distributed tracing and standards-aligned telemetry.

### Direction
Do not block Wave 1 on OpenTelemetry migration, but add:
- richer structured custom events around every parse/resolve/commit stage,
- event dimensions that isolate site/list/entity IDs without leaking workbook contents,
- and a later hardening item to evaluate OTel adoption for cross-service tracing.

## G. Workbook parser contract

### Preserve
- The current row/section scoring model and visible-sheet contract can remain as fallback.
- The existing parser pipeline structure is reusable.

### Insufficient
- The parser ignores the new authoritative seams the workbook now provides.
- Template validation is still anchored to visible labels instead of explicit workbook identity/version markers.

### Why it matters
The workbook now supplies a machine-oriented parsing layer (`ParserMeta`), semantic names, validation, and version markers. Ignoring those seams keeps the parser brittle even though the source artifact has already been improved.

### Direction
Promote parse-first authority to:
1. `ParserMeta` values when present and valid,
2. named ranges when present and valid,
3. visible-cell legacy fallback only for backward compatibility,
with explicit incompatible-template diagnostics when the expected contract markers are absent or invalid.
