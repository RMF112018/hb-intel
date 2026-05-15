# Supporting 01 — Audit-to-Implementation Delta Register

| Delta | Current state | Required future state |
|---|---|---|
| Card title | Static `Action Queue` title | Header title replaced by `Action Queue` / `Completed` toggle |
| Completed data source | None | New lazy route and read-model lane |
| Shared contracts | Pending DTO only | Sibling recent-completions DTO family |
| Route registry | No completed route | `adobe-sign-recent-completions` route key/path |
| Backend adapter | Pending adapter only | New recent-completions adapter |
| Search seam | Pending-oriented request flow | Bounded query-intent split |
| Telemetry | Pending result + generic search | Add query intent + recent-completions result |
| Frontend client | No completed client method | Add `getAdobeSignRecentCompletions` |
| Frontend state | Pending only | Lazy completed request state and cache |
| UI body | Pending only | Conditional completed panel |
| Docs | Action Queue-only language | Header toggle + completed lane documented |
| Tests | Pending coverage | Completed route/model/view/UI/regression coverage |
