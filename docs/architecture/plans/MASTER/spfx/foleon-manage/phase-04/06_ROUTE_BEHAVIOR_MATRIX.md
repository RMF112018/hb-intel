# 06 — Route Behavior Matrix

| Route | Config complete? | Real data present? | Fetch error? | Search/filter active? | Expected UI | Telemetry behavior | Diagnostics behavior |
|---|---|---:|---:|---:|---|---|---|
| Highlights | No | Any | No | N/A | Config `FoleonError`; no preview | No preview telemetry | `issueCodes` populated; diagnostics if query flag enabled |
| Highlights | Yes | Yes | No | N/A | Live feature + compact cards | Normal card impressions/clicks/external opens | `canInitialize: true`; `issueCodes: []` |
| Highlights | Yes | No | No | N/A | `FoleonPreviewFallback route="highlights"` | No production content telemetry | Runtime proof remains healthy; preview state not reflected as live content |
| Highlights | Yes | Unknown | Yes | N/A | `FoleonError` for load failure | No preview telemetry | Runtime proof remains healthy because config is healthy |
| Hub | No | Any | No | Any | Config/load error; no preview | No preview telemetry | Missing content registry blocks top-level initialization where applicable |
| Hub | Yes | Yes | No | No | Live archive grid | Search telemetry only for non-empty query; normal card telemetry | Healthy proof |
| Hub | Yes | Yes | No | Yes, matches | Filtered live archive grid | Search telemetry for non-empty query; normal card telemetry | Healthy proof |
| Hub | Yes | Yes | No | Yes, no match | Filter-specific `FoleonEmpty`; no full preview | Search telemetry only; no preview | Healthy proof |
| Hub | Yes | No | No | No | `FoleonPreviewFallback route="hub"` | No production content telemetry | Healthy proof |
| Hub | Yes | No | No | Yes | Prefer preview fallback plus note that live archive is empty; search has no live corpus | No production content telemetry | Healthy proof |
| Hub | Yes | Unknown | Yes | Any | `FoleonError` for archive load failure | No preview telemetry | Healthy proof if config complete |
| Reader | No | Any | No | N/A | Config/missing publication error | No reader telemetry unless current gate handling emits blocked event | Diagnostics remain authoritative |
| Reader | Yes | Matching record + gate passes | No | N/A | Live iframe reader | Reader open/close/embed telemetry | Healthy proof |
| Reader | Yes | Missing/gate blocked | No | N/A | Gate-specific blocked state | Existing blocked telemetry only | Healthy proof; do not show fake reader |
| Reader | Yes | Unknown | Yes | N/A | Reader load error | Existing error telemetry as applicable | Healthy proof if config complete |
| Manage | No/backend blocked | Any | Any | N/A | Existing blocked/error management UI | No preview content telemetry | Diagnostics/proof unchanged |
| Manage | Yes | Content exists | No | Query may apply | Existing management UI | Existing management telemetry/workflows only | Healthy proof |
| Manage | Yes | No content | No | Query may apply | Existing management UI + optional preview guidance panel | No production preview-card telemetry | Healthy proof |

## Specific route acceptance decisions

### Highlights configured + no records

Expected: preview fallback.

### Highlights configured + records

Expected: live cards. Preview must disappear.

### Highlights missing list GUID

Expected: config error. Preview must not render.

### Hub configured + no records

Expected: sample archive preview.

### Hub configured + records + no filter match

Expected: filter empty state, not full preview fallback.

### Hub configured + records

Expected: live archive.

### Reader missing docId

Expected: current missing-publication-ID error. Do not create an automatic fake reader.

### Manage route

Expected: management UI remains authoritative; optional preview guidance only.
