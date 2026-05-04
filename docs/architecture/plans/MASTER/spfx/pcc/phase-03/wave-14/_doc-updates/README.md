# PCC Phase 14 — Approvals / Checkpoints Comprehensive Documentation Update Package

Generated: 2026-05-04

## Purpose

This package instructs a local code agent to update PCC documentation for **Phase 14 / Wave 14 — Approvals / Checkpoints**. It uses the attached Procore data-layer roadmap package as the structural template while expanding the content for a full PCC-native approval/checkpoint control layer.

The package is documentation-only. It does not authorize runtime code, approval execution, package installation, tenant mutation, external-system writeback, or production rollout.

## Core Position

- `Approvals / Checkpoints` is the PCC-native control layer for review, decision, acknowledgement, waiver/override by reason, escalation, admin verification, and readiness/handoff gates.
- It is not a disconnected approval app, departmental workflow portal, Power Automate runtime, or generic task list.
- PCC owns approval/checkpoint control records and read models.
- Source modules retain ownership of underlying workflow records.
- HBI may summarize and cite evidence but has no approval, waiver, override, pricing, award, or execution authority.
- Wave 13G remains the feature authority for Estimating Workbench; Phase 14 governs the checkpoint queue semantics for estimating freeze, handoff, mapping exception, validation override, and downstream approval prompts.

## Package Contents

- `docs/` — target architecture, domain contracts, UX contract, security/audit posture, and documentation update instructions.
- `docs/wireframes/` — major wireframes and interaction specifications for each screen group.
- `artifacts/` — machine-readable state machines, routing modes, validation rules, source integration matrix, read/command contracts, SharePoint index strategy, and validation gates.
- `prompts/` — executable local-code-agent prompts.
- `reference/` — repo-truth findings to verify, research basis, and architecture delta summary.

## Strict Scope

Allowed work is documentation, markdown contracts, JSON artifacts, cross-reference updates, and closeout evidence only.

Blocked work includes runtime implementation, package/lockfile mutation, SDK adoption, Power Automate runtime dependency, SharePoint tenant/list/group/security mutation, Procore/Sage writeback, approval execution, deployment, and production rollout.

## Expected Use

1. Unzip this package.
2. Give the package to a local code agent operating in `/Users/bobbyfetting/hb-intel`.
3. Start with `prompts/Prompt_01_Repo_Truth_And_Scope_Lock.md`.
4. Require local repo-truth evidence before any documentation edit.
5. Execute prompts in order unless the local repo audit shows a hard stop.
