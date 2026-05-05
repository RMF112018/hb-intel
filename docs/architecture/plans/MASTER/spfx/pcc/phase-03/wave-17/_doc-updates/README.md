# PCC Phase 3 Wave 17 — Site Health Comprehensive Documentation Update Package

## Package Purpose

This package gives a local code agent a complete, implementation-ready documentation update plan for PCC Phase 3 Wave 17 `Site Health`.

It resolves the crucial and beneficial architecture gaps identified after the repo-truth audit by supplying explicit decisions for MVP scope, role-based visibility, redaction, read-model routes, data contracts, SharePoint storage, health lifecycle, drift classification, repair-readiness, source-module integration, SPFx UX, accessibility, tests, and Codex execution discipline.

## Controlling Objective

Create the canonical Wave 17 documentation authority for Site Health without implementing runtime code.

Site Health is the PCC-native diagnostic and governance surface for project-site readiness, provisioning health, configuration drift, access posture, integration-source health, evidence traceability, admin verification, and repair-readiness visibility. It surfaces evidence and routes issues to governed review or repair workflows without becoming a tenant administration console, direct SharePoint mutation tool, background repair bot, security-permission mutation surface, or production provisioning engine.

## Environment Note

- Intended local repo path: `/Users/bobbyfetting/hb-intel`
- Remote repo audited: `RMF112018/hb-intel`
- Remote `main` during audit: `a444cebf999b92437ad1db6d630ca027409fd11c`
- Local branch, HEAD, worktree, and lockfile hash must be reverified before edits.

## Strict Documentation-Only Scope

This package authorizes documentation, JSON planning artifacts, and local validation only. It does not authorize runtime implementation, package mutation, manifest changes, tenant calls, Graph write calls, SharePoint REST/PnP mutation, permission mutation, schema mutation, automatic repair, production rollout, or external-system writeback.

## Module Identity

- Wave: Phase 3 / Wave 17
- Module: Site Health
- Surface ID: `site-health`
- TypeScript naming root: `SiteHealth`
- Primary route family: `/api/pcc/projects/{projectId}/site-health...`
- Primary architecture path: `docs/architecture/blueprint/sp-project-control-center/phase-3/wave-17/`

## Execution Rule

Every prompt in this package includes this instruction:

> Do not re-read files that are still within your current context or memory unless you need to verify stale, missing, or contradictory repo truth.

Agents must use current context before rereading files, but must reverify stale, missing, or contradictory repo truth.

## Prompt Sequence

1. Prompt 01 — Repo Truth and Scope Lock
2. Prompt 02 — Governing Docs and Authority Updates
3. Prompt 03 — Target Architecture, Domain, Health, Drift, and Repair
4. Prompt 04 — Source Module Integration and System-of-Record Alignment
5. Prompt 05 — Read Model, SharePoint Storage, SPFx UX, and Wireframes
6. Prompt 06 — Security, HBI, Dependencies, and Test Gates
7. Prompt 07 — Closeout and Fresh-Session Auditor Prompt

## Guardrail Summary

- GET/read-model-first posture only.
- Future command model is documented but not authorized for execution.
- Repair requests are workflow records, not automated repairs.
- HBI explains and cites observed evidence; it does not mutate settings, permissions, schemas, external systems, or legal/accounting/claim determinations.
- Sensitive security and group/user details are redacted by persona.
- Microsoft Purview audit remains the Microsoft 365 audit authority; PCC Site Health stores business diagnostic audit events only.

## Post-Execution Review Instruction

After local execution, review the final diff for:
- canonical Wave 17 docs created under blueprint path;
- no orphaned planning artifacts;
- no runtime source changes unless a later implementation prompt explicitly authorizes them;
- no package or lockfile changes;
- no broad formatting;
- validation evidence captured in closeout.
