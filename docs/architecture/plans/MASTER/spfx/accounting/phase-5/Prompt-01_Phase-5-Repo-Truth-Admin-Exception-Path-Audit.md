# Prompt-01 — Phase 5 Repo-Truth Admin Exception-Path Audit

## Objective

Audit the current Admin exception path and produce an evidence-based baseline report covering:

- handoff from Accounting to Admin
- adjacent Estimating exception-path touchpoints that materially affect Admin ownership
- available recovery actions
- authorization posture
- request/provisioning interaction during recovery
- contradictions between docs and repo truth

This is an audit prompt, not a broad implementation prompt.

## Working rules

- Treat the live repo as the authority.
- Do not re-read files that are still within your current context or memory unless needed to verify a contradiction, retrieve exact evidence, or inspect newly changed content.
- Prefer targeted, bounded changes over broad refactors unless broader restructuring is explicitly required.
- Preserve the app boundary between Accounting and Admin.
- Be explicit about repo fact vs inference vs unresolved issue.
- Do not silently flatten shared exception behavior into a simplistic Admin-only summary.

## Required focus

Audit the current implementation for all of the following:

- Accounting failure / exception routing into Admin
- Admin exception entry points and route parameters
- Estimating retry / escalation touchpoints that intersect Admin exception ownership
- Admin recovery action surface
- authorization gates for Admin-only actions
- backend routes whose posture is broader than Admin-only UI language suggests
- reopen / retry / escalation behavior as currently implemented
- request lifecycle and provisioning status interaction during recovery
- operator messaging and visibility in Accounting, Admin, and adjacent Estimating exception touchpoints
- docs versus implementation truth

## Required files and areas to inspect

```text
apps/accounting/src/*
apps/admin/src/*
apps/estimating/src/pages/RequestDetailPage.tsx
apps/estimating/src/components/project-setup/RetrySection.tsx
apps/estimating/src/utils/failureClassification.ts
backend/functions/src/functions/projectRequests/*
backend/functions/src/functions/provisioningSaga/*
backend/functions/src/middleware/*
backend/functions/src/services/*
backend/functions/src/state-machine.ts
packages/provisioning/src/*
docs/reference/spfx-surfaces/*
docs/reference/provisioning/*
docs/maintenance/*
docs/architecture/blueprint/current-state-map.md
```

## Questions you must answer

1. What exactly does Accounting pass when it routes a failed case to Admin?
2. What exactly does Admin use to resolve the inbound case?
3. Is the current route-in contract sufficient if multiple provisioning runs exist for the same project?
4. Which exception actions are truly Admin-exclusive in the live repo?
5. Which exception actions are shared with Estimating/requester flows?
6. Which backend routes are broader than the Admin UI language implies?
7. What request/provisioning drift risks already exist after recovery/status actions?
8. What current docs overstate the maturity or exclusivity of the Admin exception path?

## Deliverables

1. Create an audit report at:

`docs/architecture/reviews/phase-5-admin-exception-path-audit.md`

2. The report must include:
- executive summary
- confirmed repo facts
- confirmed repo-doc intent
- current cross-app routing model
- current Admin recovery action model
- shared exception-action model
- authorization model summary
- lifecycle/status interaction summary
- contradictions and unresolved issues
- recommended implementation targets for Prompt-02 through Prompt-05
- exact files inspected

## Constraints

- Do not make broad code changes in this prompt.
- If a tiny mechanical correction is unavoidable to complete the audit accurately, keep it minimal and document it.
