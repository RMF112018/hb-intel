# MVP-Project-Setup-T01 — Scaffold and Documentation Alignment

**Phase Reference:** MVP Project Setup Master Plan  
**Spec Source:** `MVP-Project-Setup.md` + MVP Blueprint + MVP Roadmap  
**Decisions Applied:** D-01, D-02, D-10, D-12, D-15 + R-01 through R-08  
**Estimated Effort:** 0.5 sprint-weeks  
**Depends On:** master plan only  
> **Doc Classification:** Canonical Normative Plan — scaffold/documentation task; sub-plan of `MVP-Project-Setup-Plan.md`.

---

## Objective

Create the implementation scaffolding, documentation updates, and explicit ownership boundaries required to execute the MVP without architectural drift.

---

## Required File / Path Scope

```text
packages/models/src/provisioning/*
packages/provisioning/src/*
apps/estimating/src/pages/*
apps/accounting/src/pages/*
apps/admin/src/pages/*
backend/functions/src/functions/projectRequests/*
backend/functions/src/functions/provisioningSaga/*
packages/ui-kit/*
packages/bic-next-move/*
packages/field-annotations/*
packages/notification-intelligence/*
packages/step-wizard/*
docs/architecture/plans/*
docs/architecture/adr/*
```

---

## Scaffold and Documentation Requirements

1. **Create / update one README or implementation note per touched runtime owner**
   - `packages/provisioning/README.md`
   - `apps/estimating/README.md` or feature note
   - `apps/accounting/README.md` or feature note
   - `apps/admin/README.md` or feature note
   - `backend/functions/README.md` or provisioning runbook note

2. **Document research-informed non-negotiables**
   - idempotent provisioning steps
   - SignalR + status-resource dual path
   - throttling / backoff handling
   - Graph-first preference where feasible
   - one-template strategy
   - least-privilege post-create site access strategy

3. **State ownership explicitly**
   - `@hbc/provisioning` = headless logic only
   - `@hbc/ui-kit` = reusable visuals only
   - app workspaces = role-specific composition shells
   - backend/functions = orchestration + persistence + integration side effects

4. **Correct package dependency drift**
   - verify whether Admin’s import of `@hbc/provisioning` should be formalized in `apps/admin/package.json`
   - add `@hbc/provisioning` to `apps/accounting/package.json` once the Controller surface is introduced
   - keep any new reusable visuals in `@hbc/ui-kit`, not in app-local folders

---

## README Minimum Content

Each touched owner must document:

1. purpose within the MVP workflow  
2. role ownership and next-move semantics  
3. upstream/downstream dependencies  
4. status and recovery semantics where relevant  
5. verification commands  
6. known MVP exclusions

---

## Research Alignment Rules to Capture in Docs

- Site-template/site-script actions are the baseline for repeatable site-scoped configuration.
- Custom provisioning steps exist only where native site-template actions are insufficient or where the repo’s bifurcated engine already provides a stronger fit.
- SignalR tokens are ephemeral; client reconnect and renegotiation behavior must be documented.
- Pollable status is required even when SignalR is enabled.
- Least-privilege automation posture must be documented separately from SharePoint end-user permissions.

---

## Verification Commands

```bash
test -f packages/provisioning/README.md
test -f apps/estimating/package.json
test -f apps/accounting/package.json
test -f apps/admin/package.json
rg -n "@hbc/provisioning" apps/admin apps/accounting apps/estimating
rg -n "idempotent|Retry-After|SignalR|status endpoint|Sites.Selected|site template" packages backend apps docs
```
