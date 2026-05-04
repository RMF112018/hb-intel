# Research Pattern Reference

This package uses public-source patterns only as implementation guardrails and product-pattern context. Do not clone vendor tools.

## ISO 19650 / Lifecycle Information Management

- Source: https://www.iso19650.org/
- Pattern: information management should span the asset lifecycle; PCC unified lifecycle should therefore connect pursuit, delivery, closeout, warranty, archive, and future reference instead of treating them as disconnected workspaces.

## Microsoft Graph Permissions

- Source: https://learn.microsoft.com/en-gb/graph/permissions-overview
- Pattern: delegated permissions are bounded by the signed-in user's access; app-only access requires stricter admin consent and governance. PCC must not expose records through summaries that the user could not access in the source context.

## Microsoft Graph Throttling

- Source: https://learn.microsoft.com/en-us/graph/throttling
- Pattern: live integration must honor `429`, `Retry-After`, and exponential backoff; frequent polling/scanning should be avoided in favor of change tracking/notifications where available.

## NIST AI RMF

- Source: https://www.nist.gov/itl/ai-risk-management-framework
- Pattern: HBI should be governed as an AI system with risk controls, grounding, refusals, evaluation, and trustworthiness requirements.

## OWASP LLM Top 10

- Source: https://docs.aws.amazon.com/prescriptive-guidance/latest/agentic-ai-security/owasp-top-ten.html
- Pattern: HBI implementation must address prompt injection, sensitive information disclosure, excessive agency, vector/embedding weaknesses, system prompt leakage, and unbounded consumption.

## W3C PROV

- Source: https://www.w3.org/TR/prov-dm/
- Pattern: source lineage should represent entities, activities, agents, derivations, usage, generation, and responsibility in a way that supports trust and auditability.

## NIST CSF 2.0

- Source: https://www.nist.gov/cyberframework
- Pattern: production readiness should include governance, identify/protect/detect/respond/recover posture, especially around audit, redaction, source access, and HBI runtime controls.
