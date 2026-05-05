# Wave 15 — Security, Secrets, Audit, and HBI Guardrails

## Purpose

Canonical Wave 15 security and HBI guardrail posture for External Systems Launch Pad documentation scope.

## Security and Secrets Boundary

- SPFx surfaces do not store secrets.
- SPFx surfaces do not call external systems directly for mutating operations.
- Tokens, credentials, and secret material are not stored in SharePoint list rows, URL payloads, fixtures, or documentation artifacts.
- URL launches are gated by canonical URL policy contract checks.
- Any future secret-backed operations remain backend-only and out of Prompt-06 runtime scope.

## URL Policy and Audit Linkage

- URL policy behavior references already-canonical `external_url_policy_contract.json` promoted in Prompt 02.
- Audit/event semantics reference already-canonical `external_system_audit_event_taxonomy.json` promoted in Prompt 04.
- Prompt 06 does not overwrite Prompt-02/04 provenance for those artifacts.

## HBI Allowed/Refused Posture

Canonical Prompt-06 machine-readable source:

- `docs/architecture/plans/MASTER/spfx/pcc/phase-03/wave-15/artifacts/hbi_allowed_refused_behavior.json`

Policy posture:

- Allowed: explain mapped systems, summarize status, identify stale/missing mappings, and provide source-lineage-aware context.
- Refused: approve links, perform external writes, make legal/accounting determinations, or bypass access constraints.

## Role/Action Visibility and Redaction Governance

Canonical Prompt-06 machine-readable source:

- `docs/architecture/plans/MASTER/spfx/pcc/phase-03/wave-15/artifacts/external_system_role_action_matrix.json`

Governance rules:

- Role and action visibility is a documentation contract for UX/read-model behavior boundaries.
- Prompt 06 does not authorize runtime endpoint implementation or writeback behavior.
- Redaction and role constraints are enforced as architecture and documentation posture in this prompt.

## Prompt-06 Boundary Statement

This document defines governance and policy posture only.

It does not authorize:

- runtime command endpoints,
- SharePoint writes,
- external-system writes,
- tenant mutations,
- live integration actions,
- package/lockfile/manifest changes.
