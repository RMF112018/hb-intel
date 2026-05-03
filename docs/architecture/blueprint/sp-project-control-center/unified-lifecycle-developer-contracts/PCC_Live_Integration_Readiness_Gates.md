# 06 — Live Integration and Security Gates

## Current Posture

The target developer documentation keeps PCC in fixture-backed, read-only, preview-safe posture unless a later implementation wave explicitly authorizes live integration.

## Gates Required Before Live Microsoft Graph / SharePoint Integration

- Tenant permission validation.
- Delegated vs application permission decision.
- Least-privilege scope list.
- Consent evidence.
- Source-system access test.
- Delta query and/or change notification design.
- Throttling/retry/backoff design.
- Cache TTL and stale-state policy.
- Audit-event policy.
- Redaction and source-url hiding tests.

## Gates Required Before Live Procore / Sage / Autodesk / Other Integration

- API authentication design.
- Source object allowlist.
- Read/write prohibition confirmation.
- Rate limit and retry policy.
- Source-lineage schema mapping.
- Error/degraded state behavior.
- Contract tests using mocked responses.
- Security review.
- Tenant/non-production validation.

## Gates Required Before Live HBI / Search / Vector Integration

- HBI threat model.
- Prompt injection controls.
- Retrieval-source allowlist.
- Citation validation.
- Permission-filtered retrieval proof.
- Refusal policy tests.
- Sensitive-information leak tests.
- Query and answer audit logging.
- Unbounded consumption controls.
- Human review/acceptance gates for warranty responsibility and high-impact conclusions.

## Gates Required Before Legal / Compliance Retention Implementation

- Legal/compliance retention schedule.
- Litigation hold procedure.
- Disposition procedure.
- Records export / eDiscovery posture.
- Audit-log retention period.
- Privacy review for owner/resident/personnel data.
- Classification downgrade/declassification approval process.
