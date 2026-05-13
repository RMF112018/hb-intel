# 04 — B06 Implementation Gap Register

| ID | Gap | Why it matters | Remediation lane | Prompt |
|---|---|---|---|---|
| G-01 | B06 predecessor path references do not match active B05 artifact filename | Creates planning-chain drift | Docs alignment | Prompt 00 |
| G-02 | Dev-plan README authority table is stale through B03 | Later sessions can misread governing order | Docs alignment | Prompt 00 |
| G-03 | B06 runtime hardening depends on B05 provider/runtime seams | Prevents implementing hardening against non-existent architecture | Preflight gate | Prompt 01 |
| G-04 | Focused Adobe module needs deliberate manual refresh behavior only | Avoids stale UX and source-spam | Frontend UX | Prompt 02 |
| G-05 | Auto-polling / hidden refresh triggers must be prohibited | Prevents repeated Adobe demand and throttle amplification | Frontend regression | Prompt 02 / 06 |
| G-06 | Durable queue cache must be absent | Prevents stale queue replay and privacy retention risk | Persistence guardrail | Prompt 06 |
| G-07 | 429 rate-limit behavior requires classification and safe translation | Provider throttling cannot become raw failure or retry storm | Backend resilience | Prompt 03 |
| G-08 | `Retry-After` requires bounded server-respecting handling | Preserves source respect and avoids retry penalties | Backend resilience | Prompt 03 |
| G-09 | Refresh-token failure must map to `authorization-required` | Prevents misleading outage copy and reconnect dead ends | Auth/source-state mapping | Prompt 03 |
| G-10 | Generic telemetry wrapper can record thrown error messages | Provider strings must be sanitized before throw | Error boundary | Prompt 04 |
| G-11 | Queue-row metadata must not enter telemetry | Prevents privacy/commercial metadata leakage | Telemetry minimization | Prompt 04 |
| G-12 | Tokens, auth codes, and callback query data must not be logged | Credential-secrecy requirement | Telemetry/privacy | Prompt 04 |
| G-13 | My Dashboard curated evidence must not dump live queue content | Prevents evidence artifacts from becoming sensitive data stores | Evidence sanitation | Prompt 05 |
| G-14 | PCC sanitation baseline must be inherited deliberately | Avoids re-authoring weaker sanitation | Evidence sanitation | Prompt 05 |
| G-15 | Section 18 HTTP/source-state taxonomy must not regress | Preserves B04 contracts and UX states | Cross-layer validation | Prompt 06 |
| G-16 | Residual B06 risks need explicit closeout tracking | Prevents later confusion over accepted vs. deferred decisions | Closeout | Prompt 07 |
