# Wave 8 — Implementation Authorization

Generated: 2026-05-01
Classification: Canonical Current-State (PCC Phase 3 / Wave 8)
Status: Active
Companion: `Wave_8_Project_Readiness_Module_Framework_Scope_Lock.md`

## Purpose

This document authorizes a bounded implementation posture for **Phase 3 Wave 8 — Project Readiness Module Framework / Project Readiness Center**. It exists to bridge the gap between the Wave 8 Scope Lock (which governs framework definitions and forbids runtime work) and the implementation prompts that follow (Prompt 02 onward).

The Scope Lock itself does not authorize implementation. This Authorization document governs what bounded Wave 8 implementation work is permitted, while the Scope Lock continues to govern framework definitions, domains, lifecycle gates, the readiness item model, role/action authority, and guardrails.

## Research-Informed Foundations

The framework reflects established readiness, closeout, workflow, and governance principles. Each principle below shapes one or more authorized scope items in this document.

- **OSHA safety readiness.** Management responsibility, worker participation, hazard identification, hazard prevention/control, training, and multi-employer coordination. Shapes safety-readiness domain posture, role/action authority for safety evidence, and the rule that Wave 8 surfaces posture without owning live OSHA-engine behavior.
- **CII / PDRI readiness (project definition rating).** Domain/gate readiness, project-definition completeness, risk-factor identification, mitigation visibility, and repeated readiness checks across the project lifecycle. Shapes the lifecycle-gate model, blocker-first posture, and confidence-vs-completion separation.
- **CMAA / AIA closeout readiness.** Closeout responsibility clarity, interdependent procedures, substantial-completion responsibilities, outstanding-work timelines, and evidence/document readiness. Shapes the closeout-readiness lifecycle gate, evidence-requirement model, and source-of-record posture (evidence remains in HB Document Control Center, not in Wave 8).
- **Procore / Autodesk workflow patterns.** Template vs project instance, customizable sections/items, comments/evidence/status, closeout package visibility, and project-level customization without master-template corruption. Shapes the framework-vs-instance separation that allows Waves 9–14 modules to plug into the Wave 8 framework without altering it.
- **Microsoft governance.** Metadata, lifecycle, records, permissions, and source-of-record boundaries. Shapes the rule that Wave 8 normalizes signals from upstream modules and never mutates SharePoint, Graph, or external systems.

These principles inform the framework only. They do not authorize runtime adoption of any specific external standard, product, or system.

## Authorized Implementation Scope

Wave 8 implementation prompts (starting at Prompt 02) are authorized for the following work, and only the following work:

- **Shared model and read-model framework contracts** in `@hbc/models` (Project Readiness item shape, posture/confidence enums, lifecycle-gate enum, domain enum). Contract evolution must be additive; new fields require an object-literal-consumer grep before being marked required.
- **Deterministic framework fixtures** in shared/SPFx/backend layers, using fixture-safe constants. Parity fixtures must mirror the producing layer's literal values rather than auto-sourcing from registry constants.
- **Optional backend mock-provider GET-only read-model route extension**, mirroring the existing approved GET-only PCC read-model route posture. Any future Project Readiness route addition must update the read-model response map, the provider interface and mock implementation, the route registration, the route tests, the SPFx client seam, and the no-write/no-mutation guardrails — these seams are co-required, not independent.
- **SPFx fixture/client parity** for Project Readiness, including envelope-shape parity (`mode`, `sourceStatus`, `warnings`, `data`) with the established read-model envelope pattern.
- **Project Readiness Center shell and cards**, evolving the current preview-only surface toward envelope-driven rendering. Shell additions must preserve degraded-state safe-empty posture for non-`available` `sourceStatus` values (`backend-unavailable`, `source-unavailable`, `missing-config`, `stale`, `unauthorized`, `forbidden`).
- **Inert and disabled action affordances** on the surface. Imperative actions return structured `{ opened: false, reason }` results — never silent no-ops — and the disabled path is unit-tested with the expected reason enum.
- **Source / degraded-state rendering** driven by envelope `sourceStatus`, including operator-pending posture for any concern that cannot be proven outside a hosted/tenant environment.
- **Ownership / evidence / risk / blocker summary display** sourced from the framework item model only. Missing fields render as "Not listed" or are omitted; no invented record fields. Conditional fact chips render per their own source field and are never gated on another chip's data.
- **Closeout documentation** under `docs/architecture/blueprint/sp-project-control-center/phase-3/wave-8/`, including post-execution proof of changed files, validation results, lockfile MD5 before/after, residual risk, and explicit operator-pending posture for hosted/tenant concerns.

## Forbidden in Wave 8

Wave 8 implementation prompts are forbidden from introducing any of the following. These remain governed by the Scope Lock and reinforced here:

- Live runtime integrations: Microsoft Graph, PnP, SharePoint REST, Procore, Document Crunch, Adobe Sign, Sage.
- Tenant operations, app catalog operations, `.sppkg` generation/upload, hosted/tenant probes.
- Mutations of any kind: Graph file operations, SharePoint list mutations, permission mutations, secrets, app settings, external-system writeback.
- Workflow execution, scoring engine, approval execution.
- Wave 9 lifecycle-readiness checklist library implementation.
- Wave 10 Permit Log, Wave 11 Responsibility Matrix / RACI, Wave 12 Constraints Log, Wave 13 Buyout Log, Wave 14 Approvals/Checkpoints runtime.
- Package version, manifest version, SPFx package, or dependency changes. No `pnpm install`, `pnpm add`, or `pnpm update`.
- CI/CD workflow edits, production rollout.
- Edits under `docs/architecture/plans/**`.

## Source-of-Record Boundaries

Wave 8 normalizes readiness signals from upstream modules and does not own operational detail.

- Wave 6 (Team & Access) owns access posture and persona assignment.
- Wave 7 (HB Document Control Center) owns Document Control hard-no rules, lane vocabulary, source registry, and document evidence storage. Wave 7 hard-no rules HN-01..HN-03 are the authoritative subset for Wave 7-driven readiness signals; Wave 8 must never re-derive these from a superset.
- Waves 9–14 own their respective domain runtimes (lifecycle readiness, permits, RACI, constraints, buyout, approvals).
- Wave 15 (External Systems) and Wave 17 (Site Health) own integration and health detail.

Wave 8 surfaces posture, blockers, and evidence references aggregated from these upstream layers. It does not mutate, replicate, or override their record ownership.

## Wave Relationship

| Concern            | Wave 8 (Framework)                                                            | Waves 9–14 (Modules)                                   |
| ------------------ | ----------------------------------------------------------------------------- | ------------------------------------------------------ |
| Item model shape   | Defines item-level fields and audit pattern                                   | Use the shape; add domain-specific fields where needed |
| Status enum        | Defines standard statuses + posture vocabulary                                | Each module may use a subset                           |
| Scoring posture    | Blocker-first; prevents blended completion from masking blockers              | Surface blockers per domain into Priority Actions      |
| Backend routes     | None owned in Wave 8 (optional mock GET extension only, governed by this doc) | Module-specific GET routes per their wave              |
| Approval execution | None                                                                          | Wave 14 owns approval authority logic                  |
| External mutations | None                                                                          | Out of scope for MVP across all listed waves           |
| Permission model   | Defines role-gating pattern and authority matrix                              | Apply per-module permission matrix                     |

## Acceptance Criteria for This Authorization

This Authorization document is acceptable when:

- It is internally consistent with `Wave_8_Project_Readiness_Module_Framework_Scope_Lock.md`.
- It does not contradict the surrounding Phase 3 roadmap, target architecture, site template contract, or Wave 9 architecture documents.
- It references only files that exist or are explicitly named for creation by an authorized prompt.
- It does not authorize edits under `docs/architecture/plans/**`.
- It does not authorize source modifications in this prompt (Prompt 01 is documentation-only).

## Closeout Requirements for Prompt 02 (Forward-Looking)

When Prompt 02 executes the first authorized implementation slice, its closeout must include:

- All files inspected and changed (with paths).
- New `@hbc/models` exports (added/changed).
- Fixture parity assertions (SPFx ↔ backend mock parity, with literal-value mirroring).
- Validation commands run at package scope and their results.
- Validation not run, with reason.
- `pnpm-lock.yaml` MD5 before/after (must match — no install authorized).
- Operator-pending posture explicitly stated for any hosted/tenant/browser concern that cannot be proven in this prompt.
- Residual risk and explicit confirmation that no runtime, mutation, route writeback, manifest change, or `.sppkg` operation occurred.

## Research Source Notes

The principles above draw on the following public/official sources. References are summary-level; no excerpts are copied here.

- OSHA — Recommended Practices for Safety and Health Programs; Multi-Employer Citation Policy. Public source: `osha.gov`.
- Construction Industry Institute (CII) — Project Definition Rating Index (PDRI) tools for industrial, building, infrastructure, and small projects. Public source: Construction Industry Institute publications.
- Construction Management Association of America (CMAA) — Construction Management Standards of Practice. Public source: `cmaanet.org`.
- AIA — Substantial Completion and closeout-related contract documents (e.g., G704). Public source: American Institute of Architects.
- Procore — public product documentation for project workflows, templates, items, comments, and evidence. Public source: `procore.com`.
- Autodesk Construction Cloud — public product documentation for project setup, templates, and closeout patterns. Public source: `autodesk.com`.
- Microsoft Learn — SharePoint information architecture, permissions, retention/records management, and lifecycle guidance. Public source: `learn.microsoft.com`.

Wave 8 borrows principles only. No external standard, product, or system is adopted at runtime by this authorization.

## Cross-Links

- `Wave_8_Project_Readiness_Module_Framework_Scope_Lock.md`
- `docs/architecture/blueprint/sp-project-control-center/phase-3/05_Phase_3_Development_Roadmap_Updated.md`
- `docs/architecture/blueprint/sp-project-control-center/phase-3/07_Phase_3_Module_Implementation_Plan.md`
- `docs/architecture/blueprint/sp-project-control-center/phase-3/wave-9/` (Project Lifecycle Readiness Center)
- `docs/architecture/blueprint/sp-project-control-center/README.md`
