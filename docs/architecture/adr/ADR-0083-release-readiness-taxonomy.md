# ADR-0083: Release-Readiness Taxonomy

**Status:** Accepted
**Date:** 2026-03-09
**Phase:** PH7.9 / PH7.11

## Context

Phase 7 stabilization revealed inconsistent use of "production-ready" across plan documents, commit messages, and release artifacts. Some documents used the term to describe code-only completion, while others implied full operational readiness. This ambiguity created risk of premature release decisions and unclear accountability.

PH7.9 established a formal taxonomy to eliminate this ambiguity. PH7.11 locks the decision into a permanent ADR.

## Decision

Adopt a three-level readiness taxonomy with a composite fourth state:

1. **Code-Ready** — Source code, tests, and documentation complete; CI passes on `main`.
2. **Environment-Ready** — Target infrastructure (Azure, SharePoint, CI/CD) provisioned and configured.
3. **Operations-Ready** — Monitoring, alerting, runbooks, and support handoff complete.
4. **Production-Ready (Composite)** — All three levels satisfied; required before final release decision.

Additional rules:

- **N/A / Deferred** states are permitted with mandatory one-line rationale.
- **Grandfather clause**: existing "Production-Ready Code:" section headings in Phase 4C/5C plan files are formatting artifacts exempt from retroactive enforcement. Existing ADR Context sections using "production-ready" remain append-only and unmodified.
- **Staged sign-off model**: each readiness level is signed off when achieved, not all at once. Three named roles (Architecture Owner, Product Owner, Operations/Support Owner) have defined gate responsibilities.

## Consequences

- All new plan documents, commit summaries, and release artifacts must use the three-level vocabulary.
- "Production-ready" must not describe code-only completion in any new document.
- Release sign-off artifacts must use the template at `docs/architecture/release/release-signoff-template.md`.
- The full taxonomy reference lives at `docs/reference/release-readiness-taxonomy.md`.

## References

- PH7.9 plan: `docs/architecture/plans/ph7-remediation/PH7.9-Release-Semantics-and-Readiness-Taxonomy.md`
- Reference doc: `docs/reference/release-readiness-taxonomy.md`
- Sign-off template: `docs/architecture/release/release-signoff-template.md`
