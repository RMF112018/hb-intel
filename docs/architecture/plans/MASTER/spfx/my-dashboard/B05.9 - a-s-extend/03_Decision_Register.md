# Decision Register — Adobe Sign Actionability

| Decision | Locked choice | Rationale |
|---|---|---|
| Primary row action model | Hybrid resolver architecture | Best fit for direct action, security, and current read-model-first app design |
| Queue row CTA | `Act now` | Clearer than `Open`; aligned to required-action semantics |
| Completed row CTA | `View` | Completed rows are historical/view-oriented, not action-oriented |
| Direct action URL storage | Never persist in read models or fixtures | Sensitive, stale, and unnecessary |
| Resolver timing | Click-time only | Avoid N+1 API fanout, stale links, and unnecessary provider traffic |
| Search URL extraction | Keep only as view-link/fallback behavior | Useful but not adequate as primary action handoff |
| Signing-endpoint prohibition | Replace with separate transient resolver policy | Existing durable policy remains valid; action resolver needs distinct handling |
| Transient action URL output | Prefer backend redirect or one-time handoff response | Minimizes frontend exposure of sensitive URLs |
| Action-type posture | Implement resolver generically for all six HB action classes; normalize no-URL outcomes | Product needs broad coverage; provider limitations must degrade safely |
| Scope posture | Verify deployed governed scopes; add reconnect behavior for insufficient grant | Signing URL route may require scope beyond current stored grants |
| Telemetry posture | Structured outcome-only telemetry | Operators need visibility without secret leakage |
| Embedded Adobe UI | Not in this phase | Overbuilt for dashboard quick-action use case |
