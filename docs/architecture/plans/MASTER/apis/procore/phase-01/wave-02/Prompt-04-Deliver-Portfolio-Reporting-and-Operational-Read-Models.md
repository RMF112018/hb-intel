# Prompt-04 — Deliver Portfolio Reporting and Operational Read Models

## Objective
Complete the first portfolio/project operational read models for reports and executive views.

## Governing authorities
- Procore package files:
  - `05-Portfolio-Level-Model.md`
  - `11-Analytics-Use-Cases-and-Questions.md`
  - `star_schema_recommendation.md`
- repo authorities:
  - reports/project-hub planning and consumer boundaries already present in the repo

## Repo seams to inspect
- publication services
- report/read-model consumers
- project-hub / portfolio surfaces
- query-hook and repository seams

## Current gap to close
The repo still needs portfolio-ready summary models for executive and PX consumption.

## Required implementation outcome
1. Deliver portfolio-friendly summaries derived from first-wave publications.
2. Add project-health, cost/change, and operational burden read models fit for reporting surfaces.
3. Keep report consumers on publication contracts, not connector internals.

## Proof of closure
Return:
- portfolio/project read models added
- report or dashboard consumers updated
- proof that models are fed from publication layers only
- remaining deferred reporting scope

## Guardrails
- Do not build new direct connector clients in reporting/feature packages.
- Do not re-read files already in your active context unless needed to confirm drift, dependencies, or uncertainty after changes.
