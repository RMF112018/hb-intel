# MVP-Project-Setup-T09 — Testing, Operations, and Pilot Release

**Phase Reference:** MVP Project Setup Master Plan
**Spec Source:** `MVP-Project-Setup.md` + MVP Blueprint + MVP Roadmap
**Decisions Applied:** All D-01 through D-15 + all R-01 through R-08
**Estimated Effort:** 1.0 sprint-weeks
**Depends On:** T01-T08
> **Doc Classification:** Canonical Normative Plan — testing/operations/release task; sub-plan of `MVP-Project-Setup-Plan.md`.

---

## Objective

Close the MVP with a quality matrix, operational readiness criteria, P1 gate re-verification, and pilot release gates that prove the workflow is trustworthy for the first 4–10 real project setups.

---

## Test Matrix

### Unit / contract tests

- request state transitions (both state machine files)
- `deriveCurrentOwner()` for all state/policy/takeover combinations
- project-number format validation rules
- project-number uniqueness rejection
- retry and escalation semantics (max-1-requester-retry enforcement)
- `IProvisioningEventRecord` append behavior
- idempotent step behavior (skip when artifact exists)
- permission bootstrap deduplicated access-set logic
- completion metadata generation (`siteLaunch` population)
- `Canceled` state terminal behavior and reopen path

### Hook / integration tests

- Estimating submission and detail state projection
- Accounting Controller review and `Finish Setup` orchestration
- SignalR + polling fallback (fallback must serve correct status when SignalR is unavailable)
- admin retry / takeover behavior (second-failure escalation path)
- notification routing through existing backend pipeline
- event timeline projections per role (Estimating / Accounting / Admin views)

### End-to-end workflow scenarios

1. happy path from request submission to site launch
2. clarification send-back and resubmit
3. cancel before provisioning
4. reopen canceled request and continue
5. first provisioning failure with one requester retry
6. second failure escalates to Admin takeover with business-readable summary
7. completion with usable base site while deferred step 5 work finishes overnight
8. polling fallback when SignalR is unavailable
9. throttling simulation with backoff honoring `Retry-After`

---

## Minimum Coverage Thresholds for MVP Packages

New packages and apps created or substantially modified in this MVP plan set must meet minimum coverage thresholds enforced via vitest configuration:

| Package | Minimum Coverage |
|---------|-----------------|
| `@hbc/spfx-estimating` | branches: 80 |
| `@hbc/spfx-accounting` | branches: 80 |
| `@hbc/spfx-admin` | branches: 80 |
| `@hbc/functions` (provisioning-related functions) | branches: 85 |
| `@hbc/models` (provisioning domain) | branches: 90 |
| `@hbc/provisioning` | branches: 85 |

---

## P1 Gate Re-Verification (Required)

Before pilot approval, re-run the P1 package test suite to confirm that MVP changes have not degraded coverage in any of the five P1 packages (ADR-0085):

```bash
pnpm turbo run test \
  --filter=@hbc/auth \
  --filter=@hbc/shell \
  --filter=@hbc/sharepoint-docs \
  --filter=@hbc/bic-next-move \
  --filter=@hbc/complexity
```

All five must maintain `branches: 95`. If any P1 package coverage drops below threshold, T09 is not complete.

---

## Operational Readiness Requirements

### Metrics to capture

- total requests submitted
- success rate (completed vs failed)
- average time from submit to provisioning start
- average time from provisioning start to usable site (`WebPartsPending` or `Completed`)
- average time to full-spec completion
- first-failure rate
- retry success rate
- admin takeover rate
- permission-bootstrap defect rate
- time-to-resolution for escalated runs

### Runbooks required

Each runbook must contain the following minimum sections:

1. **Trigger condition** — what symptom or alert prompts use of this runbook
2. **Audience** — who executes (first-line support / admin / engineering)
3. **Decision tree or step-by-step procedure**
4. **Escalation path** — who to contact if procedure does not resolve the issue
5. **Verification** — how to confirm the issue is resolved
6. **Known failure modes** — documented pitfalls specific to this runbook

Required runbooks:

- first-line support triage
- retry vs escalate decision tree
- admin takeover steps
- throttling incident handling
- rollback / partial-cleanup procedure
- service principal / selected-scope access review checklist

### Pilot gate

Pilot can begin only when:

- [ ] all tests pass and coverage thresholds are met
- [ ] affected workspaces build and typecheck cleanly
- [ ] P1 package tests still pass at `branches: 95`
- [ ] at least one dry-run or mock-environment end-to-end workflow passes all 9 scenarios
- [ ] support owners understand the runbooks
- [ ] business stakeholders sign off on the narrow MVP scope

---

## Final Verification Commands

```bash
# Full build and lint for all MVP packages
pnpm turbo run lint \
  --filter @hbc/spfx-estimating... \
  --filter @hbc/spfx-accounting... \
  --filter @hbc/spfx-admin... \
  --filter @hbc/provisioning... \
  --filter @hbc/models... \
  --filter @hbc/functions...

pnpm turbo run build \
  --filter @hbc/spfx-estimating... \
  --filter @hbc/spfx-accounting... \
  --filter @hbc/spfx-admin... \
  --filter @hbc/provisioning... \
  --filter @hbc/models... \
  --filter @hbc/functions...

# Coverage runs with thresholds
pnpm --filter @hbc/provisioning test --coverage
pnpm --filter @hbc/functions test --coverage
pnpm --filter @hbc/spfx-estimating test --coverage
pnpm --filter @hbc/spfx-accounting test --coverage
pnpm --filter @hbc/spfx-admin test --coverage

# P1 gate — must remain at branches: 95
pnpm turbo run test \
  --filter=@hbc/auth \
  --filter=@hbc/shell \
  --filter=@hbc/sharepoint-docs \
  --filter=@hbc/bic-next-move \
  --filter=@hbc/complexity
