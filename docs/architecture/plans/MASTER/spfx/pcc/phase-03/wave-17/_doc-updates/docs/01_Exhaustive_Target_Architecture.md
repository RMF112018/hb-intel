# 01 — Exhaustive Target Architecture

## Site Health Definition

Site Health is the PCC diagnostic, evidence, and repair-readiness layer for SharePoint project sites and connected PCC modules.

It answers:

- Is the project site provisioned?
- Does it match the Standard Project Site Template Contract?
- Are required lists, libraries, fields, views, and indexes present?
- Are project metadata and module dependencies complete?
- Are permissions and team assignments aligned?
- Are settings, external systems, and document-control dependencies healthy?
- Are findings explainable, auditable, and routed to the right governed workflow?

## Architecture Boundary

Site Health is not:

- a SharePoint Admin Center;
- a Microsoft 365 tenant administration console;
- an Entra ID or security group mutation tool;
- a SharePoint list/library schema mutation tool;
- an automatic repair bot;
- a background provisioning engine;
- a deployment console;
- a Key Vault or secret editor;
- an external-system administration surface;
- a legal, accounting, claim, entitlement, delay-damages, or forensic-analysis authority.

## Read-Model-First Principle

Wave 17 is read-model-first.

- All MVP routes are GET routes.
- All MVP data is read-only, derived, fixture-backed, or sourced from existing authoritative records.
- Future command records can be documented but not executed.
- Repair requests are workflow records, not automated repairs.
- Admin verification establishes evidence sufficiency; it does not mutate tenant configuration.

## System-of-Record Boundary

| Data | Authority |
|---|---|
| Project identity and high-level project records | HB Central project records |
| Desired SharePoint project-site template | Standard Project Site Template Contract and project-site-template package |
| Settings definitions and values | Wave 16 Control Center Settings |
| Settings health snapshots | Wave 16 settings-health records |
| External system registry and mappings | Wave 15 External Systems |
| External source health | Wave 15 External Systems health snapshots |
| Team and role assignments | Team & Access authority |
| Library/document posture | Document Control and SharePoint observed state |
| Diagnostic health findings | Site Health derived or persisted records |
| Repair approval/checkpoint workflow | Wave 14 Approvals / Checkpoints |
| Microsoft 365 compliance audit | Microsoft Purview / Microsoft 365 audit tooling |
| PCC business health audit events | Site Health audit event records |

## Core Architecture Themes

1. Health check registry.
2. Desired-state versus observed-state comparison.
3. Drift classification.
4. Severity and status taxonomy.
5. Evidence references and traceability.
6. Persona-aware redaction.
7. Stale-source and unavailable-source treatment.
8. Admin verification.
9. Repair-readiness without automatic repair.
10. Priority Action candidate generation.
11. HBI explanation with citation/no-authority posture.
12. Read-model-first routes and future command gates.

## MVP Cut Line

Wave 17 documentation must define the following as MVP-ready contracts:

- Site Health target architecture.
- Data records and DTOs.
- Route IDs and paths.
- SharePoint storage posture.
- Role/action/redaction matrix.
- Wireframes and component contracts.
- Validation/test strategy.
- No-mutation guardrails.

Wave 17 documentation must not authorize runtime implementation by itself.

## Future Command Gate

Future command behavior may include request-review, request-repair, suppress-finding, resolve-finding, and admin-verify. Each must remain behind explicit future implementation prompts, route authorization, tests, and approval ownership. No command may directly mutate tenant permissions, list schemas, libraries, or external systems from Wave 17.
