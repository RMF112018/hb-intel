# MVP-Project-Setup-T09 — Testing, Operations, and Pilot Release

**Phase Reference:** MVP Project Setup Master Plan  
**Spec Source:** `MVP-Project-Setup.md` + MVP Blueprint + MVP Roadmap  
**Decisions Applied:** All D-01 through D-15 + all R-01 through R-08  
**Estimated Effort:** 1.0 sprint-weeks  
**Depends On:** T01-T08  
> **Doc Classification:** Canonical Normative Plan — testing/operations/release task; sub-plan of `MVP-Project-Setup-Plan.md`.

---

## Objective

Close the MVP with a quality matrix, operational readiness criteria, and pilot release gates that prove the workflow is trustworthy for the first 4–10 real project setups.

---

## Test Matrix

### Unit / contract tests

- request state transitions
- current-owner derivation
- project-number validation rules
- retry and escalation semantics
- event-record append behavior
- idempotent step behavior
- permission bootstrap dedupe logic
- completion metadata generation

### Hook / integration tests

- Estimating submission and detail state projection
- Accounting review and `Finish Setup` orchestration
- SignalR + polling fallback
- admin retry / takeover behavior
- notification routing
- event timeline projections

### End-to-end workflow scenarios

1. happy path from request submission to site launch
2. clarification send-back and resubmit
3. cancel before provisioning
4. reopen canceled request and continue
5. first provisioning failure with one requester retry
6. second failure escalates to Admin takeover
7. completion with usable base site while deferred work finishes later
8. polling fallback when SignalR is unavailable
9. throttling simulation with backoff honoring `Retry-After`

---

## Operational Readiness Requirements

### Metrics to capture

- total requests submitted
- success rate
- average time from submit to provisioning start
- average time from provisioning start to usable site
- average time to full-spec completion
- first-failure rate
- retry success rate
- admin takeover rate
- permission-bootstrap defect rate
- time-to-resolution for escalated runs

### Runbooks required

- first-line support triage
- retry vs escalate decision tree
- admin takeover steps
- throttling incident handling
- rollback / partial-cleanup procedure
- service principal / selected-scope access review checklist

### Pilot gate

Pilot can begin only when:

- all tests pass
- affected workspaces build and typecheck cleanly
- at least one dry-run or mock environment end-to-end workflow passes
- support owners understand the runbooks
- business stakeholders sign off on the narrow MVP scope

---

## Final Verification Commands

```bash
pnpm turbo run lint --filter @hbc/spfx-estimating... --filter @hbc/spfx-accounting... --filter @hbc/spfx-admin... --filter @hbc/provisioning... --filter @hbc/models... --filter @hbc/functions...
pnpm turbo run build --filter @hbc/spfx-estimating... --filter @hbc/spfx-accounting... --filter @hbc/spfx-admin... --filter @hbc/provisioning... --filter @hbc/models... --filter @hbc/functions...
pnpm --filter @hbc/provisioning test --coverage
pnpm --filter @hbc/functions test --coverage
pnpm --filter @hbc/spfx-estimating test --coverage
pnpm --filter @hbc/spfx-accounting test --coverage
pnpm --filter @hbc/spfx-admin test --coverage
```
