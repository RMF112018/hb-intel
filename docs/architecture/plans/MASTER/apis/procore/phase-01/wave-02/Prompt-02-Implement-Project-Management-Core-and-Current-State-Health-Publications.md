# Prompt-02 — Implement Project-Management Core and Current-State Health Publications

## Objective
Implement the first project-management and open-item subject areas needed for project health.

## Governing authorities
- Procore package files:
  - `06-Project-Level-Model.md`
  - `07-Transactional-and-Event-Level-Model.md`
  - `11-Analytics-Use-Cases-and-Questions.md`
  - `12-Core-vs-Extended-Scope-Recommendation.md`
- Repo authorities:
  - `docs/architecture/plans/MASTER/pwa/phase-1-deliverables/P1-F5-T07-Published-Read-Models-and-Downstream-Consumer-Surfaces.md`

## Repo seams to inspect
- Procore connector services
- canonical and publication tables
- data-access/query-hooks additions
- project-hub / reports-facing consumers

## Current gap to close
HB Intel still lacks real RFI/submittal/observation/punch/incident-backed health views.

## Required implementation outcome
1. Ingest and map first-wave project-management core:
   - RFIs
   - submittals
   - observations
   - punch items
   - incidents
2. Create current-state health publications:
   - open-item counts
   - overdue indicators
   - aging summaries
   - responsible-party / vendor / trade rollups where justified
3. Add project-health summary APIs and repository/query-hook consumers.

## Proof of closure
Return:
- exact entities implemented
- publication models exposed
- health metrics produced
- consumer seams updated
- any deferred entities explicitly called out

## Guardrails
- Do not jump to full workflow, drawings, daily-log detail, or telematics here.
- Do not re-read files already in your active context unless needed to confirm drift, dependencies, or uncertainty after changes.
