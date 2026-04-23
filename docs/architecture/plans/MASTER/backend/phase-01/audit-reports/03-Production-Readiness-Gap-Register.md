# 03 — Production-Readiness Gap Register

## Runtime / registration
1. **Scoped-host release ambiguity**
   - Safety routes depend on the admin-control-plane host, not the monolith.
   - Risk: artifact/deployment drift can silently unregister working routes.
   - Class: production-readiness blocker.

2. **Insufficient host-specific release proof**
   - Current release evidence is good at route presence, but not yet good enough at proving host-composition artifact truth.
   - Class: high.

## Identity / auth / permissions
3. **Split outbound identity model**
   - Control-plane and data-plane paths do not converge on one operational model.
   - Class: structural blocker.

4. **Safety ingestion authorization under-modeled**
   - Ingest requires delegated scope but not an explicit Safety writer/admin role boundary.
   - Class: security gap.

5. **Pre-rollout least-privilege not encoded**
   - Broad permissions are acceptable for stabilization, but there is no hard pre-rollout tightening gate.
   - Class: rollout blocker.

## Repository / data plane
6. **REST-only Safety repository**
   - The Safety repository still uses SharePoint REST for critical reads/writes.
   - Class: primary blocker.

7. **Failing first read on reporting period**
   - Live error shows the first repository read already fails with 401.
   - Class: primary blocker.

8. **Control-plane success hides data-plane failure**
   - Provisioning dry-run success can mislead operators into overestimating backend readiness.
   - Class: architecture clarity gap.

## Graph-only cutover
9. **No Graph-native repository implementation**
   - The target direction exists conceptually but not operationally.
   - Class: structural blocker.

10. **No explicit staged cutover acceptance criteria**
    - The codebase lacks a defined success proof for staging/test broad-Graph stabilization versus pre-rollout tightened posture.
    - Class: governance gap.

## Parser / workbook contract
11. **Parser ignores `ParserMeta`**
    - Current parser reads only visible cells.
    - Class: correctness gap.

12. **Parser ignores named ranges**
    - Current workbook abstraction does not consume workbook names.
    - Class: maintainability gap.

13. **No template identity / parser contract version enforcement**
    - Validation still depends on anchor text and visible layout.
    - Class: compatibility gap.

14. **Key findings extraction is stale**
    - The parser still treats key findings as one visible free-text cell instead of the newer multi-line normalized seam.
    - Class: correctness gap.

15. **No first-class preview/validation response**
    - The backend goes from upload to commit attempt without a dedicated pre-commit parse/validation contract.
    - Class: operational safety gap.

## Observability / resilience
16. **No end-to-end data-plane telemetry model for Safety commit phases**
    - Current logs are helpful but not complete enough for high-confidence production incident handling.
    - Class: medium/high.

17. **No Graph throttling/backoff discipline in the eventual target lane**
    - Not surprising yet, but must be added during cutover.
    - Class: medium.

18. **Idempotency/duplicate suppression not yet explicit enough at API contract level**
    - The ingestion model uses runs and checksums, but the route contract does not yet expose a stronger operator-safe idempotent model.
    - Class: medium.

## Deployment / release
19. **Artifact-proof discipline still too thin for rollout**
    - Working deploys and route registration are not enough by themselves.
    - Class: high.

20. **Environment/config tightening is not encoded as rollout gates**
    - Core config validation exists, but the cutover-specific permission/config posture is not yet enforced.
    - Class: high.
