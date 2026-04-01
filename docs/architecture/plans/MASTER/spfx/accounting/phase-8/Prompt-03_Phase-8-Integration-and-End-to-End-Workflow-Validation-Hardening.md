# Prompt-03 — Phase 8: Integration and End-to-End Workflow Validation Hardening

## Objective

Harden the integration and end-to-end validation story for the Project Setup workflow so the repo demonstrates realistic path coverage from requester submission through controller actions, provisioning runtime behavior, failure routing, and Admin exception handling.

## Required working approach

1. Audit and expand integration / E2E coverage for:
   - requester submission → controller queue appearance
   - controller clarification / hold / approve / launch behavior
   - provisioning status visibility after launch
   - failure routing into Admin oversight
   - reopen / retry / terminal-state expectations where applicable

2. Validate cross-surface and cross-app behavior where meaningful:
   - Accounting ↔ Admin navigation and context handoff
   - PWA / Estimating parity assumptions where they affect shared lifecycle behavior

3. Prefer evidence-backed E2E or integration flows over doc-only statements.

4. Update progress and evidence in:
   - `docs/architecture/reviews/project-setup-phase-8-reliability-testing-and-operational-readiness-audit.md`

## Required outputs

- expanded integration / E2E coverage
- documented command results and evidence
- explicit identification of any remaining environment-gated validation gaps

## Rules

- Keep scope on production-relevant flows, not cosmetic UI-only checks.
- Use the hardened backend contract and current routing model as the source of truth.
