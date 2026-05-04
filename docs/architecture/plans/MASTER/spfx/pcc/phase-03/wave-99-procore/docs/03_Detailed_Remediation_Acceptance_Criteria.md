# Detailed Remediation Acceptance Criteria

## Shared Models

- Add canonical Procore data-layer types.
- All fixtures deterministic and sanitized.
- No real UPNs, tokens, live URLs, or tenant-sensitive IDs.
- Tests assert no runtime imports or mutation helpers.

## Backend

- Mock-only provider interfaces.
- GET-only read-model route seams if route additions are required.
- No timers/queues/live fetch/axios/sdk.
- Route guardrails extended.

## SPFx

- Fixture/read-model display only.
- No new global fetch callsites beyond existing backend client pattern.
- No external anchors to live Procore unless represented as inert/example object-link display.
- Existing bento/direct-child invariants preserved.

## Modules

- Project Home shows Procore mapping/sync/signal posture.
- Priority Actions supports Procore-derived candidates.
- Team & Access supports directory comparison posture.
- Document Control supports Procore evidence-link posture.
- Project Readiness supports Procore readiness impacts.
- Constraints Log and Buyout Log consume common object-link/source-lineage semantics.
