# 01 — Research Source Summary

## Research Direction

The developer documentation package is informed by current external guidance for information management, provenance, Microsoft Graph integration, AI governance, LLM security, cybersecurity governance, and source-system integration discipline.

## Key Findings

### ISO 19650 lifecycle information management

ISO 19650 is the relevant information-management frame for project and built-asset lifecycle continuity. The PCC developer documentation must retain lifecycle continuity across delivery, operation, warranty, archive, and future-reference use. PCC should behave as a governed project operating layer over the common data environment / source systems, not as an uncontrolled file browser or separate departmental workspace.

### Microsoft Graph integration posture

Microsoft Graph integration must be least-privilege, backend-mediated, and explicit about delegated versus application permissions. Future live Graph reads should prefer change notifications and delta query patterns over frequent polling. Throttling behavior must honor `429` / `Retry-After` and use backoff.

Architecture impact:

- No direct SPFx-to-Graph mutation.
- No broad app-only Graph access without explicit gate.
- Any cached Graph-derived metadata needs source timestamp, delta token/change subscription posture, and stale-state rendering.

### W3C PROV provenance model

The W3C PROV model defines provenance around entities, activities, agents, derivations, bundles, and collections. PCC source-lineage and evidence-link records should preserve source system, source object, retrieval/capture activity, user/system agent, captured timestamp, derivation relationship, and confidence.

Architecture impact:

- Source lineage is not optional for derived facts, trace edges, or grounded HBI answers.
- Traceability edges should preserve relationship type, confidence, and supporting evidence.

### NIST AI RMF and LLM security

NIST AI RMF supports trustworthiness and risk-management practices across AI design, development, deployment, use, and evaluation. OWASP LLM risk categories include prompt injection, sensitive information disclosure, improper output handling, excessive agency, vector/embedding weaknesses, misinformation, and unbounded consumption.

Architecture impact:

- HBI needs a threat model and control map.
- Grounded answers must be citation-backed.
- Refusals must be explicit.
- Prompt injection from retrieved project documents must be treated as untrusted content.
- No live LLM/vector/search integration is allowed until future gates clear.

### NIST CSF 2.0

NIST CSF 2.0 organizes cybersecurity risk management around Govern, Identify, Protect, Detect, Respond, and Recover. PCC should treat permissions, redaction, audit events, logging, monitoring, and tenant readiness as governance controls, not optional UI features.

## Source URLs

See `reference/source_research_urls.json`.
