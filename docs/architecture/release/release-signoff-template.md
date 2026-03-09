# Phase [X] Release Sign-Off

**Phase:** [Phase Name]
**Date Created:** YYYY-MM-DD
**Governed by:** Release Readiness Taxonomy (`docs/reference/release-readiness-taxonomy.md`)

---

## Staged Sign-Off Model

Sign-off for each readiness level is recorded **when that level is achieved**, not all at once. A release doc may be open with Code-Ready captured while Environment-Ready is still pending. The Production-Ready field is filled only when all three levels have been captured. A final release decision (equivalent to the PH5 "APPROVED FOR PRODUCTION" statement) requires all three levels to be signed off and dated.

---

## Readiness Levels

| Level | Status | Date | Evidence / Notes |
|-------|--------|------|------------------|
| Code-Ready | ☐ Achieved / ☐ N/A / ☐ Deferred | YYYY-MM-DD | _Link to CI evidence_ |
| Environment-Ready | ☐ Achieved / ☐ N/A / ☐ Deferred | YYYY-MM-DD | _Link to infra checklist_ |
| Operations-Ready | ☐ Achieved / ☐ N/A / ☐ Deferred | YYYY-MM-DD | _Link to ops confirmation_ |
| **Production-Ready** | ☐ All three achieved | YYYY-MM-DD | _Filled only when all above are complete_ |

> For any N/A or Deferred entry, provide a one-line rationale:
> - _Example: Environment-Ready: Deferred — Azure provisioning scheduled for Phase 8._

---

## Named Sign-Offs

### Architecture Owner Sign-Off

- **Owner Name:** ___
- **Decision:** APPROVED / NOT APPROVED
- **Date:** YYYY-MM-DD
- **Scope:** Code-Ready ☐ | Environment-Ready ☐ | Operations-Ready ☐
- **Notes:** ___

### Product Owner Sign-Off

- **Owner Name:** ___
- **Decision:** APPROVED / NOT APPROVED
- **Date:** YYYY-MM-DD
- **Scope:** Code-Ready ☐ | Production-Ready ☐
- **Notes:** ___

### Operations/Support Owner Sign-Off

- **Owner Name:** ___
- **Decision:** APPROVED / NOT APPROVED
- **Date:** YYYY-MM-DD
- **Scope:** Operations-Ready ☐
- **Notes:** ___

---

## Sign-Off Role Responsibilities

| Role | Responsible For |
|------|----------------|
| **Architecture Owner** | All three gates (Code-Ready, Environment-Ready, Operations-Ready) |
| **Product Owner** | Code-Ready and Production-Ready |
| **Operations/Support Owner** | Operations-Ready only |

Environment-Ready is a factual infrastructure checklist — no named sign-off is required, but the date must be recorded.

---

## Final Release Decision

- **Release Decision:** APPROVED FOR PRODUCTION / BLOCKED
- **Decision Date:** YYYY-MM-DD
- **Decision Basis:** All readiness levels achieved and all required sign-offs are APPROVED.
