# 01 — Research Source Summary

## Purpose

This file summarizes research inputs that should guide the adapted Preconstruction Continuity documentation. These sources are pattern references only; they do not override repo truth or HB-specific PCC doctrine.

## Lifecycle Information Management / CDE

- ISO 19650 positions information management across the lifecycle of a built asset and is commonly framed around structured, shared, governed project information. Public overview: `https://www.iso19650.org/`
- PCC implication: Preconstruction Continuity must carry pursuit and estimating information forward through the same governed lifecycle spine, not as separate department files or disconnected workspaces.

## Lean Design / Preconstruction Handoff and Commitment Planning

- Lean Construction Institute describes Last Planner as a commitment-based planning system that helps teams identify and remove hurdles before they interrupt workflow, and its design-phase materials emphasize decisions, handoffs, information flow, and commitments in preconstruction/design settings:
  - `https://leanconstruction.org/lean-topics/last-planner-system/`
  - `https://leanconstruction.org/lean-topics/last-planner-system-for-design/`
- PCC implication: Estimating Kickoff should represent deliverables, commitments, constraints, owners, evidence, and handoff-readiness signals rather than a spreadsheet clone.

## Preconstruction Platform Patterns

- Procore's preconstruction materials emphasize connected estimating, bidding, planning, handoff, and downstream learning across project execution and closeout: `https://www.procore.com/preconstruction`
- BuildingConnected bid leveling documentation defines bid leveling as organizing, comparing, and analyzing bids to help select subcontractors and identify discrepancies: `https://support.buildingconnected.com/hc/en-us/articles/47949854611219-Bid-Leveling-Overview`
- PCC implication: Preconstruction Continuity should preserve decision rationale, bid/estimate assumptions, inclusions/exclusions, and handoff context for downstream operations and future estimating, without becoming a Procore/Autodesk/BuildingConnected clone.

## Permission and Source-System Boundaries

- Microsoft Graph permissions documentation distinguishes delegated access from app-only access; delegated access cannot exceed what the signed-in user can already access: `https://learn.microsoft.com/graph/permissions-overview`
- Microsoft Graph guidance also emphasizes throttling, `Retry-After`, backoff behavior, and using change tracking/change notifications where appropriate instead of inefficient polling:
  - `https://learn.microsoft.com/graph/throttling`
  - `https://learn.microsoft.com/graph/change-notifications-overview`
- PCC implication: this documentation package must remain non-runtime and future-gated; any later live integration must be backend-mediated, least-privilege, cached/throttled, and permission-filtered.

## HBI / AI Governance and Security

- NIST AI RMF is intended to help organizations manage AI risks and incorporate trustworthiness considerations into AI design, development, use, and evaluation: `https://www.nist.gov/itl/ai-risk-management-framework`
- OWASP LLM Top 10 includes risks such as prompt injection, sensitive information disclosure, excessive agency, vector/embedding weaknesses, and unbounded consumption: `https://owasp.org/www-project-top-10-for-large-language-model-applications/`
- PCC implication: HBI may use preconstruction continuity records only through citation-grounded, permission-filtered, refusal-capable contracts. It must not expose restricted pursuit/committee/executive context.

## Provenance and Source Lineage

- W3C PROV provides a provenance model around entities, activities, and agents: `https://www.w3.org/TR/prov-overview/`
- PCC implication: preconstruction carry-forward records must preserve source system, source record, captured-at time, evidence link, source version, source owner, and classification.

## Research-Informed Product Principles

1. Preconstruction data must follow the project forward; it should not disappear after GO or award.
2. Handoff is a lifecycle control, not a static document upload.
3. Assignments are workflow commitments, not HR staffing commitments.
4. Decision rationale and assumptions must be source-lineage-backed and permission-filtered.
5. Future HBI summaries must cite, qualify, or refuse.
6. External systems remain source systems; PCC is the lifecycle operating layer and source-lineage projection layer.
