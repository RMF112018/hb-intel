# 08 — Recommended Execution Waves

## Wave 1 — Restore authoritative Safety ingestion on the correct seam
### Objective
Get the Safety lane to successful end-to-end write proof without carrying the failing REST repository seam forward.

### Scope
1. Create a Graph-native Safety repository.
2. Move reporting-period read/write first.
3. Move project-week, inspection-event, finding, and ingestion-run mutations.
4. Move upload-library landing to Graph file APIs.
5. Upgrade workbook abstraction to support:
   - hidden parser-support sheet,
   - named ranges,
   - template identity,
   - parser contract version.
6. Upgrade parser precedence:
   - `ParserMeta`
   - named ranges
   - visible fallback
7. Return preview/validation diagnostics or at minimum a richer commit-readiness result.
8. Prove `delta > 0` on all authoritative Safety write targets.

### Done looks like
- `POST /api/admin/safety-records/ingest` succeeds end-to-end.
- No Safety-ingestion REST list-item calls remain.
- Workbook metadata comes from parser-support seams when available.
- Invalid workbook/version cases fail cleanly with targeted diagnostics.

## Wave 2 — Convert the stabilized lane into a rollout-ready lane
### Objective
Turn the now-working backend into a governable, supportable, least-privileged production backend.

### Scope
1. Add explicit Safety writer authorization policy.
2. Tighten Graph permissions from broad staging/test posture to rollout posture.
3. Add cutover acceptance checks and release gates.
4. Add stronger commit-stage telemetry and retry/throttling behavior.
5. Add host/artifact proof for deployments.
6. Clean out dead REST/data-plane seams from the backend.
7. Finalize replay/idempotency and operator support runbooks for the Safety lane.

### Done looks like
- The workflow works under the intended final permission posture.
- Operators can diagnose failures from telemetry without repo spelunking.
- Release proof shows the correct host composition and route registration.
- The backend no longer depends on split outbound permission models for the Safety lane.
