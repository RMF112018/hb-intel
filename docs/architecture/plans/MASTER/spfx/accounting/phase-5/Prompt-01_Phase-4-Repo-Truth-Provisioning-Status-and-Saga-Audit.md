# Prompt-01 — Phase 4 Repo-Truth Provisioning Status and Saga Audit

## Objective

Audit the repo truth for the provisioning status model and saga interaction boundary, then write an evidence-based audit report that establishes the current implementation baseline for Phase 4.

## Working rules

- Treat the live repo as the authority.
- Do not re-read files that are still within your current context or memory unless needed to verify a contradiction, retrieve exact evidence, or inspect newly changed content.
- Prefer targeted, minimal edits unless broader restructuring is required by the prompt.
- Preserve package and app boundaries unless the prompt explicitly directs otherwise.
- Be explicit about repo fact vs inference vs unresolved issue.
- Do not silently change business semantics established in earlier phases. If you detect a contradiction, document it and resolve it deliberately.


## Required focus

Audit the current implementation for all of the following:

- provisioning launch path
- request -> provisioning run -> status resource correlation
- provisioning status data model and storage shape
- status creation timing
- status update timing
- currentStep / overallStatus / runState semantics
- SignalR negotiation and event publication flow
- polling / status endpoint flow
- timer follow-on interaction with status
- retry / escalation / failure / completed interaction with status
- Accounting app status consumption
- Admin app status consumption
- any divergence between repo docs and implementation truth

## Required files and areas to inspect

```text
backend/functions/src/functions/provisioningSaga/*
backend/functions/src/functions/projectRequests/*
backend/functions/src/functions/signalr/*
backend/functions/src/functions/timerFullSpec/*
backend/functions/src/services/*
packages/provisioning/src/*
apps/accounting/src/*
apps/admin/src/*
docs/reference/provisioning/*
docs/maintenance/*
docs/architecture/blueprint/current-state-map.md
```

## Deliverables

1. Create an audit report at:

`docs/architecture/reviews/phase-4-provisioning-status-and-saga-audit.md`

2. The report must include:
- executive summary
- confirmed repo facts
- confirmed repo-doc intent
- identified contradictions
- request / run / status correlation map
- SignalR / polling interaction map
- Accounting / Admin consumption map
- unresolved issues
- recommended implementation targets for Prompt-02 through Prompt-05

## Constraints

- Do not change code in this prompt unless a tiny mechanical correction is required to complete the audit report accurately.
- If you do make any code or doc change, keep it minimal and explain why it was unavoidable.
