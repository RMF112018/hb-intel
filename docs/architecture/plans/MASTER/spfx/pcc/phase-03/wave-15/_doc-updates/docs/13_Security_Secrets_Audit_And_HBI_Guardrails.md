# 13 — Security, Secrets, Audit, and HBI Guardrails

SPFx must not store secrets, call external APIs directly, or execute Procore/Sage/Graph/ACC/camera-service mutations. URL launch is allowed only after URL policy validation. Custom links require PM/PX approval. Future live-read integrations must be backend-mediated.

No tokens in SharePoint, URLs, fixtures, docs, or logs. Future secrets must be backend-only and use approved secret reference posture.

HBI may summarize mapped systems, explain stale/missing mappings with citations, and list source-health warnings. HBI must refuse to approve links, change external systems, post to Sage, make legal/accounting/claim determinations, or bypass user access.
